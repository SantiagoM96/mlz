(() => {
  'use strict';
  const images = new WeakMap();
  const imageIds = new WeakMap();
  let nextImageId = 0;
  const profilesKey = 'editorial-local-profiles-v1';
  const sessionKey = ['browser-session', 1];
  const defaultName = 'Sesión';

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mlz-editorial-drafts', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('El almacenamiento está ocupado.'));
    });
  }

  function transact(db, mode, action) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', mode);
      const request = action(transaction.objectStore('drafts'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function encode(value) {
    if (value instanceof HTMLImageElement) {
      const blob = images.get(value);
      if (!blob) throw new Error('La fotografía todavía no está disponible para guardar.');
      return { draftImage: blob };
    }
    if (Array.isArray(value)) return value.map(encode);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, encode(field)]));
    }
    return value;
  }

  async function decode(value) {
    if (value?.draftImage instanceof Blob) {
      const image = new Image();
      const url = URL.createObjectURL(value.draftImage);
      try {
        image.src = url;
        await image.decode();
        images.set(image, value.draftImage);
        return image;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (Array.isArray(value)) return Promise.all(value.map(decode));
    if (value && typeof value === 'object') {
      return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, field]) => [key, await decode(field)])));
    }
    return value;
  }

  function fingerprint(state) {
    return JSON.stringify(state, (_, value) => {
      if (!(value instanceof HTMLImageElement)) return value;
      if (!imageIds.has(value)) imageIds.set(value, ++nextImageId);
      return imageIds.get(value);
    });
  }

  function browserLabel() {
    const agent = navigator.userAgent;
    const platform = navigator.userAgentData?.platform ?? agent;
    const browser = /Edg(?:e|A|iOS)?\//.test(agent) ? 'Edge'
      : /OPR\//.test(agent) ? 'Opera'
      : /Firefox\/|FxiOS\//.test(agent) ? 'Firefox'
      : /SamsungBrowser\//.test(agent) ? 'Samsung Internet'
      : /Chrome\/|CriOS\//.test(agent) ? 'Chrome'
      : /Safari\//.test(agent) ? 'Safari' : 'Navegador';
    const system = /Windows/i.test(platform) ? 'Windows'
      : /Android/i.test(platform) ? 'Android'
      : /iPhone|iPad|iPod|iOS/i.test(platform) ||
        (/Mac/i.test(platform) && navigator.maxTouchPoints > 1) ? 'iOS'
      : /CrOS|Chrome OS/i.test(platform) ? 'ChromeOS'
      : /Mac/i.test(platform) ? 'macOS'
      : /Linux/i.test(platform) ? 'Linux' : '';
    return system ? browser + ' en ' + system : browser;
  }

  function legacyProfile(tool) {
    try {
      const names = JSON.parse(localStorage.getItem(profilesKey) ?? '[]');
      const preferred = localStorage.getItem(`editorial-local-profile:${tool}`);
      return Array.isArray(names) && names.includes(preferred) && typeof preferred === 'string' ? preferred : '';
    } catch {
      return '';
    }
  }

  async function initializeSession(db) {
    let session;
    await transact(db, 'readwrite', store => {
      const request = store.get(sessionKey);
      request.onsuccess = () => {
        session = request.result;
        if (session) return;
        const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
          byte.toString(16).padStart(2, '0')).join('');
        session = { id, name: defaultName };
        store.add(session, sessionKey);
      };
      return request;
    });
    return session;
  }

  async function migrateDraft(db, key, legacyKey) {
    let draft;
    await transact(db, 'readwrite', store => {
      const current = store.get(key);
      current.onsuccess = () => {
        draft = current.result;
        if (draft !== undefined) return;
        const legacy = store.get(legacyKey);
        legacy.onsuccess = () => {
          draft = legacy.result ?? { version: 1, state: null };
          store.add(draft, key);
        };
      };
      return current;
    });
    return draft;
  }

  async function connect(tool, editor) {
    const main = document.querySelector('main');
    const initial = editor.read();
    const header = document.querySelector('header .header-inner');
    const logo = header?.querySelector('.editorial-header-home');
    if (!main || !initial || !header || !logo) return;
    const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
    const brand = document.createElement('div');
    brand.className = 'editorial-draft-brand';
    const status = document.createElement('span');
    status.className = 'editorial-draft-status';
    status.setAttribute('role', 'status');
    status.innerHTML = `${icon('schedule')}<span></span>`;
    logo.before(brand);
    brand.append(logo, status);
    header.classList.add('editorial-draft-header');

    const controls = document.createElement('div');
    controls.className = 'editorial-draft-controls';
    controls.innerHTML = `
      <button type="button" class="editorial-profile-trigger" aria-expanded="false" aria-controls="editorial-profile-options">
        ${icon('devices')}<span class="editorial-session-label"><span data-session-name></span><span data-session-device></span></span>${icon('expand_more')}
      </button>
      <div id="editorial-profile-options" class="editorial-profile-options" aria-label="Opciones de sesión" hidden>
        <div class="editorial-profile-actions">
          <button type="button" data-rename>${icon('edit')} Editar nombre de esta sesión</button>
          <button type="button" data-reset>${icon('restart_alt')} Empezar de cero</button>
        </div>
      </div>`;
    const tools = document.createElement('div');
    tools.className = 'editorial-draft-tools';
    const badge = header.querySelector('.editorial-build-badge');
    if (badge) tools.append(badge);
    tools.append(controls);
    header.append(tools);
    const trigger = controls.querySelector('.editorial-profile-trigger');
    const options = controls.querySelector('.editorial-profile-options');
    const rename = options.querySelector('[data-rename]');
    const sessionName = trigger.querySelector('[data-session-name]');
    sessionName.textContent = defaultName;
    trigger.querySelector('[data-session-device]').textContent = browserLabel();
    const reset = options.querySelector('[data-reset]');

    const dialogs = document.createElement('div');
    dialogs.className = 'editorial-draft-dialogs';
    dialogs.innerHTML = `
      <dialog aria-labelledby="editorial-session-title" data-rename-dialog>
        <form>
          <h2 id="editorial-session-title">Editar nombre de la sesión</h2>
          <p>Este nombre se muestra en las tres herramientas de este navegador.</p>
          <label>Nombre <input required maxlength="40" autocomplete="off" autofocus></label>
          <span role="alert" data-name-error></span>
          <div class="editorial-dialog-actions">
            <button type="button" data-close>Cancelar</button>
            <button class="editorial-profile-primary" type="submit">Guardar nombre</button>
          </div>
        </form>
      </dialog>
      <dialog aria-labelledby="editorial-reset-title" data-reset-dialog>
        <form method="dialog">
          <h2 id="editorial-reset-title">¿Empezar de cero?</h2>
          <p>Se borrarán las placas y fotos del borrador de esta sesión en esta herramienta.</p>
          <div class="editorial-dialog-actions">
            <button value="cancel" autofocus>Cancelar</button>
            <button class="editorial-profile-danger" value="reset">Borrar borrador</button>
          </div>
        </form>
      </dialog>`;
    document.body.append(dialogs);
    const renameDialog = dialogs.querySelector('[data-rename-dialog]');
    const resetDialog = dialogs.querySelector('[data-reset-dialog]');
    const form = renameDialog.querySelector('form');
    const nameField = form.querySelector('input');
    const nameError = form.querySelector('[data-name-error]');
    const nameSubmit = form.querySelector('[type=submit]');

    function report(message) {
      const saving = message === 'Guardando…';
      const ready = ['Borrador guardado', 'Borrador recuperado'].includes(message);
      const error = message.startsWith('No se pudo');
      status.title = message;
      status.classList.toggle('is-saving', saving);
      status.classList.toggle('has-error', error);
      status.firstElementChild.textContent = error ? 'error' : saving ? 'sync' : ready ? 'check_circle' : 'schedule';
      status.lastElementChild.textContent = ready ? 'Guardado' : error ? 'Error de guardado' : message;
    }
    report('Buscando borrador…');
    let session;
    let draftKey;
    let db;
    let busy = true;
    let writable = false;
    let saved = fingerprint(initial);
    let pending;
    let queued = false;
    let nextFeedbackAt = 0;
    let feedbackStartedAt;
    let animationTimer;

    function cancelFeedback() {
      clearTimeout(animationTimer);
      feedbackStartedAt = undefined;
      nextFeedbackAt = 0;
    }

    function startFeedback() {
      const now = performance.now();
      if (now >= nextFeedbackAt) {
        nextFeedbackAt = now + 3000;
        feedbackStartedAt = now;
        report('Guardando…');
      }
      clearTimeout(animationTimer);
    }

    function finishFeedback() {
      if (feedbackStartedAt === undefined) return;
      const remaining = Math.max(0, 450 - (performance.now() - feedbackStartedAt));
      animationTimer = setTimeout(() => {
        feedbackStartedAt = undefined;
        report('Borrador guardado');
      }, remaining);
    }

    function setBusy(value) {
      busy = value;
      if (value) cancelFeedback();
      main.inert = value;
      trigger.disabled = value || !session;
    }

    function closeOptions(restoreFocus = false) {
      options.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    }

    function save() {
      if (!writable) return pending;
      const state = editor.read();
      if (!state) return pending;
      const signature = fingerprint(state);
      if (signature === saved) return pending;
      try {
        const draft = { version: 1, state: encode(state) };
        saved = signature;
        const write = transact(db, 'readwrite', store => store.put(draft, draftKey));
        pending = write;
        startFeedback();
        write.then(() => {
          if (pending === write) finishFeedback();
        }, () => {
          if (pending !== write) return;
          saved = null;
          cancelFeedback();
          report('No se pudo guardar el borrador en este navegador.');
        });
        return write;
      } catch {
        cancelFeedback();
        report('No se pudo guardar el borrador en este navegador.');
        return pending;
      }
    }

    function scheduleSave() {
      if (busy || queued || !writable) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (!busy) save();
      });
    }

    function showRename() {
      closeOptions();
      nameField.value = session.name;
      nameError.textContent = '';
      renameDialog.showModal();
      nameField.select();
    }

    function showReset() {
      if (busy || !editor.read()) return;
      closeOptions();
      resetDialog.returnValue = '';
      resetDialog.showModal();
    }

    function openOptions() {
      options.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => {
      if (!options.hidden) closeOptions();
      else openOptions();
    });
    document.addEventListener('pointerdown', event => {
      if (!controls.contains(event.target)) closeOptions();
    });
    controls.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !options.hidden) {
        event.preventDefault();
        closeOptions(true);
      }
    });
    rename.addEventListener('click', showRename);
    reset.addEventListener('click', showReset);
    renameDialog.querySelector('[data-close]').addEventListener('click', () => renameDialog.close());
    renameDialog.addEventListener('close', () => {
      form.reset();
      if (!resetDialog.open) trigger.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const name = nameField.value.trim();
      if (!name || busy || nameSubmit.disabled) return;
      nameSubmit.disabled = true;
      nameError.textContent = '';
      try {
        const updated = { ...session, name };
        await transact(db, 'readwrite', store => store.put(updated, sessionKey));
        session = updated;
        sessionName.textContent = name;
        renameDialog.close();
      } catch {
        nameError.textContent = 'No se pudo guardar el nombre de la sesión.';
      } finally {
        nameSubmit.disabled = false;
      }
    });

    resetDialog.addEventListener('close', async () => {
      if (resetDialog.returnValue !== 'reset' || busy) {
        trigger.focus();
        return;
      }
      setBusy(true);
      try {
        await pending?.catch(() => {});
        cancelFeedback();
        await transact(db, 'readwrite', store => store.put({ version: 1, state: null }, draftKey));
        editor.restore(initial);
        saved = fingerprint(editor.read());
        pending = undefined;
        writable = true;
        report('Borrador eliminado');
      } catch {
        report('No se pudo eliminar el borrador.');
      } finally {
        setBusy(false);
        trigger.focus();
      }
    });

    setBusy(true);
    try {
      db = await openDatabase();
      session = await initializeSession(db);
      sessionName.textContent = session.name;
      draftKey = [tool, 'browser-session', session.id];
      const draft = await migrateDraft(db, draftKey, [tool, legacyProfile(tool)]);
      if (draft.version !== 1 || (draft.state !== null && (!Array.isArray(draft.state?.pages) || !draft.state.pages.length))) {
        throw new Error('El borrador tiene un formato incompatible.');
      }
      if (draft.state) editor.restore(await decode(draft.state));
      saved = fingerprint(editor.read());
      writable = true;
      report(draft.state ? 'Borrador recuperado' : 'Activo');
    } catch {
      report('No se pudo abrir el borrador. El guardado automático está pausado.');
    } finally {
      setBusy(false);
    }

    window.addEventListener('modern:render', scheduleSave);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !busy) save();
    });
  }

  window.EditorialDrafts = { connect, remember(image, blob) { images.set(image, blob); } };
})();
