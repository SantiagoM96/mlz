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
    if (!main || !initial) return;
    const bar = document.createElement('section');
    bar.className = 'editorial-drafts';
    bar.setAttribute('aria-label', 'Borrador local');
    bar.innerHTML = `
      <label>Perfil <select aria-label="Perfil de borradores"></select></label>
      <button type="button" data-new>Nuevo perfil</button>
      <button type="button" data-reset>Empezar de cero</button>
      <span role="status">Buscando borrador…</span>
      <form hidden>
        <label>Nombre <input required maxlength="40" autocomplete="off"></label>
        <button type="submit">Crear perfil</button>
        <button type="button" data-cancel>Cancelar</button>
      </form>`;
    main.before(bar);
    const select = bar.querySelector('select');
    const create = bar.querySelector('[data-new]');
    const reset = bar.querySelector('[data-reset]');
    const status = bar.querySelector('[role="status"]');
    const form = bar.querySelector('form');
    const nameField = form.querySelector('input');
    const preference = `editorial-local-profile:${tool}`;
    const keyFor = name => [tool, name];
    const report = message => { status.textContent = message; };
    let names = [];
    let profile = guest;
    let db;
    let busy = true;
    let writable = false;
    let saved = fingerprint(initial);
    let pending;
    let queued = false;

    function setBusy(value) {
      busy = value;
      main.inert = value;
      select.disabled = create.disabled = reset.disabled = value || !db;
    }

    function showProfiles() {
      select.replaceChildren(new Option('Sin perfil', guest), ...names.map(name => new Option(name, name)));
      select.value = profile;
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
        report('Guardando…');
        const write = transact(db, 'readwrite', store => store.put(draft, target));
        pending = write;
        write.then(() => {
          if (pending === write) report('Borrador guardado');
        }, () => {
          if (pending !== write) return;
          saved = null;
          report('No se pudo guardar el borrador en este navegador.');
        });
        return write;
      } catch {
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
        select.value = profile;
        return;
      }
      const copy = copyGuest && profile === guest ? editor.read() : null;
      setBusy(true);
      try {
        await save();
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

    select.addEventListener('change', () => switchProfile(select.value));
    create.addEventListener('click', () => { form.hidden = false; nameField.focus(); });
    bar.querySelector('[data-cancel]').addEventListener('click', () => { form.hidden = true; create.focus(); });
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
        form.reset();
        form.hidden = true;
        await switchProfile(existing ?? name, !existing);
      } catch {
        report('No se pudo crear el perfil en este navegador.');
      }
    });

    reset.addEventListener('click', async () => {
      if (busy || !editor.read() || !confirm('¿Borrar todo el borrador de este perfil en este editor?')) return;
      setBusy(true);
      try {
        await pending?.catch(() => {});
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
