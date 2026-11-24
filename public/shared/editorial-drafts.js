(() => {
  'use strict';
  const images = new WeakMap();
  const imageIds = new WeakMap();
  let nextImageId = 0;
  const profilesKey = 'editorial-local-profiles-v1';
  const guest = '';

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

  function readProfiles() {
    const names = JSON.parse(localStorage.getItem(profilesKey) ?? '[]');
    return Array.isArray(names) ? names.filter(name => typeof name === 'string' && name.trim()) : [];
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
        ${icon('person')}<span data-profile-name></span>${icon('expand_more')}
      </button>
      <div id="editorial-profile-options" class="editorial-profile-options" aria-label="Opciones de perfil" hidden>
        <div data-profiles></div>
        <div class="editorial-profile-actions">
          <button type="button" data-new>${icon('person_add')} Nuevo perfil</button>
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
    const profileList = options.querySelector('[data-profiles]');
    const create = options.querySelector('[data-new]');
    const reset = options.querySelector('[data-reset]');

    const dialogs = document.createElement('div');
    dialogs.className = 'editorial-draft-dialogs';
    dialogs.innerHTML = `
      <dialog aria-labelledby="editorial-profile-title" data-create-dialog>
        <form>
          <h2 id="editorial-profile-title">Crear perfil</h2>
          <p>Tus placas y fotos se guardan automáticamente en este navegador. Elegí tu perfil para retomar tu borrador.</p>
          <label>Nombre <input required maxlength="40" autocomplete="off" autofocus></label>
          <div class="editorial-dialog-actions">
            <button type="button" data-close>Cancelar</button>
            <button class="editorial-profile-primary" type="submit">Crear perfil</button>
          </div>
        </form>
      </dialog>
      <dialog aria-labelledby="editorial-reset-title" data-reset-dialog>
        <form method="dialog">
          <h2 id="editorial-reset-title">¿Empezar de cero?</h2>
          <p>Se borrarán las placas y fotos del borrador de este perfil en esta herramienta.</p>
          <div class="editorial-dialog-actions">
            <button value="cancel" autofocus>Cancelar</button>
            <button class="editorial-profile-danger" value="reset">Borrar borrador</button>
          </div>
        </form>
      </dialog>`;
    document.body.append(dialogs);
    const createDialog = dialogs.querySelector('[data-create-dialog]');
    const resetDialog = dialogs.querySelector('[data-reset-dialog]');
    const form = createDialog.querySelector('form');
    const nameField = form.querySelector('input');
    const preference = `editorial-local-profile:${tool}`;
    const keyFor = name => [tool, name];

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
    let names = [];
    let profile = guest;
    let db;
    let busy = true;
    let writable = false;
    let saved = fingerprint(initial);
    let pending;
    let queued = false;
    let feedbackTimer;
    let animationTimer;

    function cancelFeedback() {
      clearTimeout(feedbackTimer);
      clearTimeout(animationTimer);
      feedbackTimer = animationTimer = undefined;
    }

    function scheduleFeedback() {
      if (feedbackTimer !== undefined) return;
      feedbackTimer = setTimeout(() => {
        feedbackTimer = undefined;
        report('Guardando…');
        animationTimer = setTimeout(() => {
          animationTimer = undefined;
          report('Borrador guardado');
        }, 450);
      }, 5000);
    }

    function setBusy(value) {
      busy = value;
      if (value) cancelFeedback();
      main.inert = value;
      trigger.disabled = value || !db;
    }

    function closeOptions(restoreFocus = false) {
      options.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    }

    function showProfiles() {
      trigger.querySelector('[data-profile-name]').textContent = profile || (names.length ? 'Elegir perfil' : 'Crear perfil');
      profileList.replaceChildren();
      for (const name of [...names, ...(names.length ? [guest] : [])]) {
        const item = document.createElement('button');
        item.type = 'button';
        item.innerHTML = `${icon(name === profile ? 'check' : 'person')}<span></span>`;
        item.lastElementChild.textContent = name || 'Sin perfil';
        if (name === profile) item.setAttribute('aria-current', 'true');
        item.addEventListener('click', async () => {
          closeOptions();
          await switchProfile(name);
          trigger.focus();
        });
        profileList.append(item);
      }
    }

    function save() {
      if (!writable) return pending;
      const state = editor.read();
      if (!state) return pending;
      const signature = fingerprint(state);
      if (signature === saved) return pending;
      try {
        const draft = { version: 1, state: encode(state) };
        const target = keyFor(profile);
        saved = signature;
        const write = transact(db, 'readwrite', store => store.put(draft, target));
        pending = write;
        write.then(() => {
          if (pending === write) scheduleFeedback();
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

    async function readDraft(name) {
      const draft = await transact(db, 'readonly', store => store.get(keyFor(name)));
      if (!draft) return null;
      if (draft.version !== 1 || !Array.isArray(draft.state?.pages) || !draft.state.pages.length) {
        throw new Error('El borrador tiene un formato incompatible.');
      }
      return decode(draft.state);
    }

    async function switchProfile(name, copyGuest = false) {
      if (busy || profile === name || !editor.read()) {
        return;
      }
      const copy = copyGuest && profile === guest ? editor.read() : null;
      setBusy(true);
      try {
        await save();
        cancelFeedback();
        const draft = await readDraft(name);
        localStorage.setItem(preference, name);
        editor.restore(draft ?? copy ?? initial);
        profile = name;
        writable = true;
        saved = copy && !draft ? null : fingerprint(editor.read());
        report(draft ? 'Borrador recuperado' : 'Guardado automático activo');
        if (copy && !draft) await save();
      } catch {
        report('No se pudo cambiar de perfil. Se conservó el borrador guardado.');
      } finally {
        showProfiles();
        setBusy(false);
      }
    }

    function showCreate() {
      closeOptions();
      createDialog.showModal();
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
    create.addEventListener('click', showCreate);
    reset.addEventListener('click', showReset);
    createDialog.querySelector('[data-close]').addEventListener('click', () => createDialog.close());
    createDialog.addEventListener('close', () => {
      form.reset();
      if (!resetDialog.open) trigger.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const name = nameField.value.trim();
      if (!name || busy) return;
      const existing = names.find(item => item.localeCompare(name, 'es', { sensitivity: 'base' }) === 0);
      try {
        if (!existing) {
          const updated = [...names, name];
          localStorage.setItem(profilesKey, JSON.stringify(updated));
          names = updated;
        }
        createDialog.close();
        await switchProfile(existing ?? name, !existing);
        trigger.focus();
      } catch {
        report('No se pudo crear el perfil en este navegador.');
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
        await transact(db, 'readwrite', store => store.delete(keyFor(profile)));
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
      names = readProfiles();
      const preferred = localStorage.getItem(preference);
      profile = names.includes(preferred) ? preferred : guest;
      db = await openDatabase();
      const draft = await readDraft(profile);
      if (draft) editor.restore(draft);
      saved = fingerprint(editor.read());
      writable = true;
      report(draft ? 'Borrador recuperado' : 'Guardado automático activo');
    } catch {
      report('No se pudo abrir el borrador. El guardado automático está pausado.');
    } finally {
      showProfiles();
      setBusy(false);
    }

    window.addEventListener('modern:render', scheduleSave);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !busy) save();
    });
  }

  window.EditorialDrafts = { connect, remember(image, blob) { images.set(image, blob); } };
})();
