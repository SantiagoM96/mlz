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
  const cards = [...panel.querySelectorAll(':scope > .modern-card, :scope > .ds-control-card')];
  const slideRoom = document.createElement('div');
  slideRoom.setAttribute('aria-hidden', 'true');
  slides.before(slideRoom);

  let gesture = null;
  let dragged = false;
  let centerFrame = 0;
  let desktopCards = [];
  let panelLabel = null;
  let backgroundTarget = null;

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
    drawer.classList.toggle('is-open', open);
    content.hidden = !open;
    content.inert = !open;
    if (open) fitOpenHeight();
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Cerrar formato' : 'Abrir formato');
    if (!open) {
      content.scrollTop = 0;
      backgroundTarget = null;
      drawer.classList.remove('is-logo-only');
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
    if (scrollTop < 0) {
      slideRoom.style.height = Math.ceil(slideRoom.offsetHeight-scrollTop) + 'px';
    }
    window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'instant' });
  }

  function openDesign(background, logoOnly = false) {
    if (!design || design.hidden) return;
    backgroundTarget = background;
    drawer.classList.toggle('is-logo-only', logoOnly);
    slideRoom.style.height = '';
    cards.forEach(item => expandCard(item, item === design));
    drawer.classList.remove('is-settling');
    setOpen(true);
    cancelAnimationFrame(centerFrame);
    centerFrame = requestAnimationFrame(() => {
      if (content.hidden) return;
      const rect = design.getBoundingClientRect();
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
      measureClosedHeight();
      main.classList.add('has-editorial-mobile-drawer');
      return;
    }
    if (drawer.hidden) return;
    if (gesture) finishDrag(false);
    drawer.classList.remove('is-settling');
    setOpen(false);
    panelHome.after(panel);
    actionsHome.after(actions);
    if (panelLabel) panel.setAttribute('aria-labelledby', panelLabel);
    cards.forEach((card, index) => expandCard(card, desktopCards[index]));
    drawer.hidden = true;
    main.classList.remove('has-editorial-mobile-drawer');
  }

  function measureClosedHeight() {
    const style = getComputedStyle(drawer);
    const height = handle.offsetHeight + actionBar.offsetHeight
      + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth);
    drawer.style.setProperty('--drawer-closed-height', height + 'px');
    return height;
  }

  function fitOpenHeight() {
    if (content.hidden) return;
    const style = getComputedStyle(content);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const min = measureClosedHeight();
    const max = (window.visualViewport?.height ?? innerHeight) * 0.62;
    const height = Math.max(min, Math.min(max, min + panel.offsetHeight + padding));
    const value = height + 'px';
    if (drawer.style.getPropertyValue('--drawer-open-height') === value) return;
    drawer.style.setProperty('--drawer-open-height', value);
    if (backgroundTarget?.isConnected && !drawer.classList.contains('is-dragging')) {
      centerBackground(backgroundTarget);
    }
  }

  function revealAll() {
    backgroundTarget = null;
    drawer.classList.remove('is-logo-only');

    cards.forEach(card => expandCard(card, true));
  }

  function toggleFromHandle() {
    drawer.classList.remove('is-settling');
    if (content.hidden) revealAll();
    setOpen(content.hidden);
  }

  function moveDrawer(event) {
    if (event.pointerId !== gesture?.id) return;
    const delta = gesture.y - event.clientY;
    if (!dragged && Math.abs(delta) < 4) return;
    dragged = true;
    if (!drawer.classList.contains('is-dragging') && (gesture.open ? delta >= 0 : delta <= 0)) return;
    if (content.hidden) {
      revealAll();
      content.hidden = false;
      content.inert = true;
    }
    const height = Math.max(gesture.min, Math.min(gesture.max, gesture.height + delta));
    drawer.style.setProperty('--drawer-drag-height', height + 'px');
    drawer.classList.add('is-dragging');
  }

  function finishDrag(accept) {
    if (!gesture) return;
    const { open, height, min, max } = gesture;
    gesture = null;
    if (!dragged) return;
    const current = drawer.getBoundingClientRect().height;
    const snapDistance = Math.min(48, (max - min) / 2);
    const changed = current !== height && Math.abs(current - height) >= snapDistance;
    const next = accept && changed ? current > height : open;
    drawer.classList.replace('is-dragging', 'is-settling');
    drawer.style.removeProperty('--drawer-drag-height');
    setOpen(next);
  }

  const actionResize = new ResizeObserver(() => {
    if (!drawer.hidden) {
      measureClosedHeight();
      fitOpenHeight();
    }
  });
  actionResize.observe(actionBar);
  actionResize.observe(panel);
  window.addEventListener('resize', fitOpenHeight);
  handle.addEventListener('pointerdown', event => {
    if (gesture || !event.isPrimary || event.button !== 0) return;
    dragged = false;
    drawer.classList.remove('is-settling');
    const min = measureClosedHeight();
    const viewport = window.visualViewport?.height ?? innerHeight;
    gesture = {
      id: event.pointerId, y: event.clientY, open: !content.hidden,
      height: drawer.getBoundingClientRect().height, min, max: Math.max(min, viewport * 0.62),
    };
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', moveDrawer);
  handle.addEventListener('pointerup', event => {
    if (event.pointerId === gesture?.id) finishDrag(true);
  });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    handle.addEventListener(type, event => {
      if (event.pointerId === gesture?.id) finishDrag(false);
    });
  }
  handle.addEventListener('click', event => {
    if (!dragged || event.detail === 0) toggleFromHandle();
    dragged = false;
  });
  drawer.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !content.hidden) setOpen(false);
  });

  document.addEventListener('click', event => {
    if (drawer.hidden) return;
    const hit = event.target.closest('.modern-logo-hit, #dsLogoHitButton');
    if (!hit || hit.hidden || hit.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDesign(hit, true);
  }, true);

  document.addEventListener('click', event => {
    if (drawer.hidden) return;
    if (event.target.closest('#addPage, .editor-slide-add-fixed, .editor-slide-add-tile, .carousel-page-thumb, .editor-slide-thumb')) {
      openDesign(slides);
    }
  });

  window.addEventListener('editorial:text-editing', () => {
    drawer.classList.remove('is-settling');
    if (!drawer.hidden) setOpen(false);
  });
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
