/* Shared mobile layout for the three editorial DEV editors. */
(() => {
  'use strict';

  const mobile = matchMedia('(max-width: 700px)');
  const main = document.querySelector('main');
  const panel = main?.querySelector('.modern-track > .editor-panel, #dsMobileControlsPanel');
  const actions = main?.querySelector('.preview-actions');
  const slides = main?.querySelector('.cronica-preview-pages, .editor-slide-nav');
  if (!panel || !actions || !slides) return;

  const panelHome = document.createComment('format panel');
  const actionsHome = document.createComment('preview actions');
  panel.before(panelHome);
  actions.before(actionsHome);

  const drawer = document.createElement('section');
  drawer.className = 'editorial-mobile-drawer';
  drawer.setAttribute('aria-label', 'Formato y acciones de la placa');
  drawer.hidden = true;
  drawer.innerHTML = `
    <button type="button" class="editorial-drawer-handle" aria-expanded="false"
      aria-controls="editorialDrawerContent" aria-label="Abrir formato"></button>
    <div class="editorial-drawer-content" id="editorialDrawerContent" hidden></div>
    <div class="editorial-drawer-actions"></div>
  `;
  main.append(drawer);
  const handle = drawer.querySelector('button');
  const content = drawer.querySelector('.editorial-drawer-content');
  const actionBar = drawer.querySelector('.editorial-drawer-actions');
  const design = panel.querySelector('.modern-design-group, .ds-plate-design-group');
  const texts = panel.querySelector('.modern-text-card, .ds-texts-group');
  const cards = [...panel.querySelectorAll(':scope > .modern-card, :scope > .ds-control-card')];
  const slideRoom = document.createElement('div');
  slideRoom.setAttribute('aria-hidden', 'true');
  slides.before(slideRoom);

  let pointerStart = null;
  let dragged = false;
  let centerFrame = 0;
  let desktopCards = [];
  let panelLabel = null;

  function cardControls(card) {
    return {
      toggle: card.querySelector(':scope > .modern-toggle, :scope > .ds-control-card-toggle'),
      body: card.querySelector(':scope > .modern-body, :scope > .ds-control-card-body'),
    };
  }

  function expandCard(card, expanded) {
    const { toggle, body } = cardControls(card);
    if (!toggle || !body) return;
    toggle.setAttribute('aria-expanded', String(expanded));
    body.hidden = !expanded;
  }

  function setOpen(open) {
    if (!open && content.contains(document.activeElement)) handle.focus({ preventScroll: true });
    content.hidden = !open;
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Cerrar formato' : 'Abrir formato');
    if (!open) {
      content.scrollTop = 0;
      cancelAnimationFrame(centerFrame);
      slideRoom.style.height = '';
    }
  }

  function centerBackground(target) {
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const headerBottom = document.querySelector('body > header')?.getBoundingClientRect().bottom ?? 0;
    const visibleTop = Math.max(viewportTop, headerBottom);
    const center = (visibleTop + drawer.getBoundingClientRect().top) / 2;
    const rect = target.getBoundingClientRect();
    const scrollTop = window.scrollY + (rect.top + rect.bottom) / 2 - center;
    if (target === slides && scrollTop < 0) {
      slideRoom.style.height = Math.ceil(-scrollTop) + 'px';
    }
    window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'instant' });
  }

  function openCard(card, background) {
    if (!card || card.hidden) return;
    slideRoom.style.height = '';
    cards.forEach(item => expandCard(item, item === card));
    setOpen(true);
    cancelAnimationFrame(centerFrame);
    centerFrame = requestAnimationFrame(() => {
      if (content.hidden) return;
      const rect = card.getBoundingClientRect();
      const viewport = content.getBoundingClientRect();
      const offset = rect.height > viewport.height ? 0 : (viewport.height - rect.height) / 2;
      content.scrollTop += rect.top - viewport.top - offset;
      if (background) centerBackground(background);
    });
  }

  function syncLayout() {
    if (mobile.matches) {
      if (!drawer.hidden) return;
      desktopCards = cards.map(card => cardControls(card).toggle?.getAttribute('aria-expanded') === 'true');
      panelLabel = panel.getAttribute('aria-labelledby');
      drawer.hidden = false;
      content.append(panel);
      actionBar.append(actions);
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.inert = false;
      cards.forEach(card => expandCard(card, false));
      main.classList.add('has-editorial-mobile-drawer');
      return;
    }
    if (drawer.hidden) return;
    setOpen(false);
    panelHome.after(panel);
    actionsHome.after(actions);
    if (panelLabel) panel.setAttribute('aria-labelledby', panelLabel);
    cards.forEach((card, index) => expandCard(card, desktopCards[index]));
    drawer.hidden = true;
    main.classList.remove('has-editorial-mobile-drawer');
  }

  handle.addEventListener('pointerdown', event => {
    dragged = false;
    pointerStart = event.clientY;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointerup', event => {
    if (pointerStart === null) return;
    const delta = event.clientY - pointerStart;
    pointerStart = null;
    dragged = Math.abs(delta) >= 24;
    if (dragged) setOpen(delta < 0);
  });
  handle.addEventListener('pointercancel', () => { pointerStart = null; });
  handle.addEventListener('click', event => {
    if (!dragged || event.detail === 0) setOpen(content.hidden);
    dragged = false;
  });
  drawer.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !content.hidden) setOpen(false);
  });

  document.addEventListener('click', event => {
    if (drawer.hidden) return;
    const hit = event.target.closest('.modern-text-hit, #dsHeadlineHitButton, .modern-logo-hit, #dsLogoHitButton');
    if (!hit || hit.hidden || hit.disabled) return;
    const isText = hit.matches('.modern-text-hit, #dsHeadlineHitButton');
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(isText ? texts : design, hit);
  }, true);

  document.addEventListener('click', event => {
    if (drawer.hidden || !event.target.closest('#addPage, .editor-slide-add-fixed, .editor-slide-add-tile')) return;
    openCard(design, slides);
  });

  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
