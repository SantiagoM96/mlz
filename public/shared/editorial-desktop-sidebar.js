(() => {
  'use strict';

  function connect() {
    const layout = document.querySelector('main');
    const panel = layout?.querySelector('aside.editor-panel');
    const preview = layout?.querySelector('.preview');
    const stage = preview?.querySelector('#photoStage');
    const pages = preview?.querySelector('.cronica-preview-pages, .editor-slide-nav');
    const header = document.querySelector('body > header');
    const logo = header?.querySelector('.editorial-header-home');
    const controls = header?.querySelector('.editorial-draft-tools');
    const badge = header?.querySelector('.editorial-build-badge');
    const status = header?.querySelector('.editorial-draft-status');
    if (!layout || !panel || !preview || !stage || !pages || !header || !logo || !('showPopover' in HTMLElement.prototype)) return;

    const desktop = matchMedia('(min-width: 701px)');
    const top = document.createElement('div');
    const rail = document.createElement('nav');
    const footer = document.createElement('div');
    const release = document.createElement('div');
    release.className = 'editorial-workspace-version';
    top.className = 'editorial-sidebar-top';
    rail.className = 'editorial-sidebar-rail';
    rail.setAttribute('aria-label', 'Módulos del editor');
    footer.className = 'editorial-sidebar-footer';

    function iconButton(icon, label) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'editorial-sidebar-button';
      button.title = label;
      button.setAttribute('aria-label', label);
      const glyph = document.createElement('span');
      glyph.className = 'material-symbols-outlined';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = icon;
      button.append(glyph);
      return button;
    }

    const collapse = iconButton('', 'Contraer barra lateral');
    collapse.classList.add('editorial-sidebar-collapse');
    collapse.firstElementChild.remove();
    collapse.setAttribute('aria-expanded', 'true');
    const brand = ['cronica', 'diarioshow', 'bae'].find(name =>
      logo.classList.contains('editorial-header-home--' + name));
    if (brand) {
      const compact = document.createElement('img');
      compact.className = 'editorial-compact-logo';
      compact.alt = '';
      compact.src = new URL('../shared/editorial-compact-' + brand + '.svg', document.baseURI);
      logo.append(compact);
    }

    const resize = document.createElement('div');
    resize.className = 'editorial-sidebar-resize';
    resize.tabIndex = 0;
    resize.setAttribute('role', 'separator');
    resize.setAttribute('aria-orientation', 'vertical');
    resize.setAttribute('aria-label', 'Ancho de la barra lateral');
    layout.prepend(top, rail, footer, release, resize, collapse);

    const minimumWidth = 380;
    const maximumWidth = () => Math.min(550, layout.clientWidth - 320);
    let preferredWidth;
    let drag;

    function fitSidebar() {
      if (!desktop.matches) return;
      const max = Math.max(minimumWidth, maximumWidth());
      const width = Math.round(Math.min(max, Math.max(minimumWidth, preferredWidth ?? layout.clientWidth * 0.29)));
      layout.style.setProperty('--editorial-sidebar-expanded-width', width + 'px');
      resize.setAttribute('aria-valuemin', String(minimumWidth));
      resize.setAttribute('aria-valuemax', String(max));
      resize.setAttribute('aria-valuenow', String(width));
      scheduleFit();
    }

    resize.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag) return;
      event.preventDefault();
      resize.focus({ preventScroll: true });
      resize.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, x: event.clientX, width: top.offsetWidth };
      layout.classList.add('editorial-sidebar-resizing');
    });
    resize.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      preferredWidth = Math.min(maximumWidth(), Math.max(minimumWidth, drag.width + event.clientX - drag.x));
      fitSidebar();
    });
    resize.addEventListener('lostpointercapture', () => {
      drag = undefined;
      layout.classList.remove('editorial-sidebar-resizing');
    });
    resize.addEventListener('keydown', event => {
      const step = event.shiftKey ? 32 : 8;
      const width = top.offsetWidth;
      const widths = { ArrowLeft: width - step, ArrowRight: width + step, Home: minimumWidth, End: maximumWidth() };
      if (!Object.hasOwn(widths, event.key)) return;
      event.preventDefault();
      preferredWidth = Math.min(maximumWidth(), Math.max(minimumWidth, widths[event.key]));
      fitSidebar();
    });

    function syncShadows() {
      const scroller = collapsed ? rail : panel;
      layout.classList.toggle('editorial-sidebar-shadow-top', scroller.scrollTop > 1);
      layout.classList.toggle('editorial-sidebar-shadow-bottom',
        scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1);
    }

    panel.addEventListener('scroll', syncShadows, { passive: true });
    rail.addEventListener('scroll', syncShadows, { passive: true });

    const pagesCard = document.createElement('div');
    pagesCard.className = 'editorial-sidebar-pages';

    const moves = [];
    function move(node, destination, prepend = false) {
      if (!node) return;
      const marker = document.createComment('editorial-desktop-home');
      node.before(marker);
      moves.push([node, marker]);
      if (prepend) destination.prepend(node);
      else destination.append(node);
    }

    const definitions = [
      { card: pagesCard, icon: 'view_carousel', title: 'Diapositivas' },
      ...[...panel.querySelectorAll(':scope > .modern-card, :scope > .ds-control-card')].map(card => {
        const button = card.querySelector(':scope > .modern-toggle, :scope > .ds-control-card-toggle');
        const label = [...(button?.querySelectorAll('span:not([aria-hidden])') ?? [])]
          .map(span => span.textContent.trim()).find(Boolean);
        const title = label || button?.textContent.trim() || card.getAttribute('aria-label') || 'Opciones';
        const existingIcon = button?.querySelector('.material-symbols-outlined, .material-icons')?.textContent.trim();
        const icon = existingIcon || (/texto/i.test(title) ? 'title' : /foto/i.test(title) ? 'image' :
          /import/i.test(title) ? 'link' : /placa/i.test(title) ? 'dashboard' : 'tune');
        return { card, button, title, icon };
      }),
    ];

    let active;
    let collapsed = false;
    let frame = 0;
    let windowDrag;

    function closePopup(restoreFocus = false) {
      if (!active) return;
      const { card, navButton } = active;
      card.hidePopover();
      card.removeAttribute('popover');
      card.classList.remove('editorial-sidebar-popup');
      card.style.removeProperty('--editorial-popup-top');
      navButton.setAttribute('aria-expanded', 'false');
      active = undefined;
      if (restoreFocus) navButton.focus();
    }

    function positionWindow(module, x, y, width, resizing = false) {
      const edge = top.getBoundingClientRect().right + 12;
      const minimum = module.card.matches('.modern-design-group, .ds-plate-design-group') ? 380 : 300;
      const available = innerWidth - (resizing ? x : edge) - 12;
      const nextWidth = Math.min(620, available, Math.max(minimum, width));
      const left = Math.max(edge, Math.min(x, innerWidth - nextWidth - 12));
      const nextTop = Math.max(12, Math.min(y, innerHeight - Math.min(module.card.offsetHeight, innerHeight - 24) - 12));
      module.card.style.setProperty('--editorial-window-x', left + 'px');
      module.card.style.setProperty('--editorial-window-y', nextTop + 'px');
      module.card.style.setProperty('--editorial-window-width', nextWidth + 'px');
      module.widthHandle.setAttribute('aria-valuenow', String(Math.round(nextWidth)));
    }

    function closeWindow(module, focus = false) {
      if (!module.card.matches('.editorial-floating-module')) return;
      const { card, navButton, button } = module;
      card.hidePopover();
      card.removeAttribute('popover');
      card.classList.remove('editorial-floating-module', 'editorial-sidebar-popup');
      for (const property of ['x', 'y', 'width']) card.style.removeProperty('--editorial-window-' + property);
      if (button) {
        if (module.buttonLabel === null) button.removeAttribute('aria-label');
        else button.setAttribute('aria-label', module.buttonLabel);
      }
      navButton.setAttribute('aria-expanded', 'false');
      if (focus) {
        if (collapsed) navButton.focus();
        else card.querySelector('.editorial-module-handle')?.focus();
      }
      scheduleFit();
    }

    function floatModule(module, drag) {
      const { card, button, navButton } = module;
      if (active === module) active = undefined;
      if (button?.getAttribute('aria-expanded') === 'false') button.click();
      card.classList.add('editorial-sidebar-popup', 'editorial-floating-module');
      card.setAttribute('popover', 'manual');
      if (!card.matches(':popover-open')) card.showPopover();
      navButton.setAttribute('aria-expanded', 'true');
      if (button) {
        module.buttonLabel = button.getAttribute('aria-label');
        button.setAttribute('aria-label', 'Devolver ' + module.title + ' a la barra');
      }
      positionWindow(module, drag.x - 24, drag.y - drag.grabOffset, drag.width);
      scheduleFit();
    }

    function captureWindowDrag(module, event, mode) {
      if (windowDrag || !desktop.matches || event.button !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const rect = module.card.getBoundingClientRect();
      windowDrag = { module, mode, id: event.pointerId, x: event.clientX, y: event.clientY,
        left: rect.left, top: rect.top, width: rect.width, grabOffset: event.clientY - rect.top };
      layout.setPointerCapture(event.pointerId);
    }

    layout.addEventListener('pointermove', event => {
      if (windowDrag?.id !== event.pointerId) return;
      const { module, mode, x, y, left, top: fromTop, width, grabOffset } = windowDrag;
      if (mode === 'undock') {
        if (event.clientX < top.getBoundingClientRect().right + 12 || event.clientX - x < 12) return;
        floatModule(module, { x: event.clientX, y: event.clientY, width, grabOffset });
        const rect = module.card.getBoundingClientRect();
        Object.assign(windowDrag, { mode: 'move', x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width });
      } else {
        const dx = event.clientX - x;
        if (mode === 'resize') positionWindow(module, left, fromTop, width + dx, true);
        else positionWindow(module, left + dx, fromTop + event.clientY - y, width);
      }
    });

    layout.addEventListener('lostpointercapture', event => {
      if (windowDrag?.id === event.pointerId) windowDrag = undefined;
    });

    const pagesHeading = pages.querySelector('.carousel-heading, .editor-slide-heading');
    if (pagesHeading) {
      const pagesIcon = document.createElement('span');
      pagesIcon.className = 'editorial-pages-icon material-symbols-outlined';
      pagesIcon.setAttribute('aria-hidden', 'true');
      pagesIcon.textContent = 'view_carousel';
      pagesHeading.prepend(pagesIcon);
    }

    function openModule(module, toggle = false) {
      if (!module || module.card.hidden || !desktop.matches || module.card.matches('.editorial-floating-module')) return;
      if (active === module && toggle) {
        closePopup();
        return;
      }
      if (module.button?.getAttribute('aria-expanded') === 'false') module.button.click();
      if (!collapsed) {
        module.card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        return;
      }
      if (active === module) return;
      closePopup();
      const { card, navButton } = module;
      card.classList.add('editorial-sidebar-popup');
      card.setAttribute('popover', 'manual');
      active = module;
      card.showPopover();
      const anchor = navButton.getBoundingClientRect();
      const bounds = layout.getBoundingClientRect();
      card.style.setProperty('--editorial-popup-top', Math.max(12,
        Math.min(anchor.top, bounds.bottom - card.offsetHeight - 12)) + 'px');
      navButton.setAttribute('aria-expanded', 'true');
      (module.button || card.querySelector('button:not([disabled])'))?.focus({ preventScroll: true });
    }

    for (const module of definitions) {
      const button = iconButton(module.icon, module.title);
      button.setAttribute('aria-expanded', 'false');
      module.navButton = button;
      button.addEventListener('click', () => openModule(module, true));
      rail.append(button);

      const { card } = module;
      if (!module.button) {
        const close = iconButton('', 'Devolver ' + module.title + ' a la barra');
        close.className = 'editorial-floating-close';
        close.firstElementChild.remove();
        close.addEventListener('click', () => closeWindow(module, true));
        card.append(close);
      }

      const widthHandle = document.createElement('div');
      widthHandle.className = 'editorial-floating-resize';
      widthHandle.tabIndex = 0;
      widthHandle.setAttribute('role', 'separator');
      widthHandle.setAttribute('aria-orientation', 'vertical');
      widthHandle.setAttribute('aria-label', 'Ancho de ' + module.title);
      widthHandle.addEventListener('pointerdown', event => captureWindowDrag(module, event, 'resize'));
      widthHandle.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const rect = card.getBoundingClientRect();
        positionWindow(module, rect.left, rect.top, rect.width + (event.key === 'ArrowLeft' ? -16 : 16), true);
      });
      module.widthHandle = widthHandle;
      card.append(widthHandle);

      card.addEventListener('pointerdown', event => {
        if (!event.target.closest?.('.editorial-module-handle') || !card.matches(':popover-open')) return;
        captureWindowDrag(module, event, card.matches('.editorial-floating-module') ? 'move' : 'undock');
      }, true);

      card.addEventListener('editorial:float-module', event => {
        const { pointerId, x, y, grabOffset } = event.detail;
        const width = card.getBoundingClientRect().width;
        floatModule(module, { x, y, width, grabOffset });
        const rect = card.getBoundingClientRect();
        windowDrag = { module, mode: 'move', id: pointerId, x, y, left: rect.left, top: rect.top, width: rect.width };
        layout.setPointerCapture(pointerId);
      });
      module.button?.addEventListener('click', event => {
        if (!card.matches('.editorial-floating-module')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        closeWindow(module, true);
      }, true);
    }

    function syncModules() {
      for (const module of definitions) {
        module.navButton.hidden = module.card.hidden || (module.card !== pagesCard && getComputedStyle(module.card).display === 'none');
        module.navButton.style.order = [...panel.children].indexOf(module.card);
      }
      if (active?.navButton.hidden) closePopup();
      for (const module of definitions) if (module.navButton.hidden) closeWindow(module);
    }

    const visibility = new MutationObserver(() => {
      if (!desktop.matches) return;
      for (const module of definitions) {
        if (module.card.matches('.editorial-floating-module') && module.button?.getAttribute('aria-expanded') === 'false') {
          module.button.setAttribute('aria-expanded', 'true');
          module.card.querySelector(':scope > .modern-body, :scope > .ds-control-card-body').hidden = false;
        }
      }
      syncModules();
    });
    visibility.observe(panel, { childList: true });
    visibility.observe(document.documentElement, { attributes: true, attributeFilter: ['data-editor-plate-variant'] });
    for (const { card, button } of definitions) {
      visibility.observe(card, { attributes: true, attributeFilter: ['hidden'] });
      if (button) visibility.observe(button, { attributes: true, attributeFilter: ['aria-expanded'] });
    }

    collapse.addEventListener('click', () => {
      closePopup();
      collapsed = !collapsed;
      layout.classList.toggle('editorial-sidebar-collapsed', collapsed);
      const label = collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral';
      collapse.title = label;
      collapse.setAttribute('aria-label', label);
      collapse.setAttribute('aria-expanded', String(!collapsed));
      scheduleFit();
    });

    const hotspots = '.modern-logo-hit, .modern-text-hit, #dsLogoHitButton, #dsHeadlineHitButton';
    stage.addEventListener('click', event => {
      if (!desktop.matches || !(event.target instanceof Element)) return;
      const hit = event.target.closest(hotspots);
      if (!hit) return;
      const selector = hit.matches('.modern-logo-hit, #dsLogoHitButton')
        ? '.modern-design-group, .ds-plate-design-group'
        : '.modern-text-card, .ds-texts-group';
      queueMicrotask(() => openModule(definitions.find(module => module.card.matches(selector))));
    }, true);

    document.addEventListener('pointerdown', event => {
      if (active && !active.card.contains(event.target) && !rail.contains(event.target) &&
          !event.target.closest?.(hotspots)) closePopup();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && active) {
        event.preventDefault();
        closePopup(true);
      }
    });

    function scheduleFit() {
      if (!desktop.matches || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!desktop.matches) return;
        syncShadows();
        const visible = [...preview.children].filter(node => getComputedStyle(node).display !== 'none' &&
          getComputedStyle(node).position !== 'fixed' && getComputedStyle(node).position !== 'absolute');
        const styles = getComputedStyle(preview);
        const vertical = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const gap = (parseFloat(styles.rowGap) || 0) * Math.max(visible.length - 1, 0);
        const occupied = visible.reduce((sum, node) => {
          if (node === stage) return sum;
          const childStyles = getComputedStyle(node);
          return sum + node.getBoundingClientRect().height + (parseFloat(childStyles.marginTop) || 0) + (parseFloat(childStyles.marginBottom) || 0);
        }, 0);
        const width = Math.max(0, (preview.clientHeight - vertical - gap - occupied - 2) * 0.75);
        preview.style.setProperty('--editorial-fitted-width', width + 'px');
        release.style.setProperty('--editorial-version-top', Math.max(16, stage.getBoundingClientRect().top) + 'px');
      });
    }

    const sizes = new ResizeObserver(scheduleFit);
    sizes.observe(preview);
    sizes.observe(panel);
    sizes.observe(rail);
    for (const { card } of definitions) sizes.observe(card);
    for (const child of preview.children) {
      if (child !== stage) sizes.observe(child);
    }

    function syncViewport() {
      closePopup();
      if (desktop.matches) {
        if (moves.length) return;
        panel.prepend(pagesCard);
        move(pages, pagesCard);
        for (const module of definitions) {
          if (module.card !== pagesCard && !module.card.matches('.modern-design-group, .ds-plate-design-group')) continue;
          panel.dispatchEvent(new CustomEvent('editorial:register-sidebar-module', { detail: module }));
        }
        move(logo, top, true);
        move(status, top);
        move(controls, footer);
        const reset = controls?.querySelector('[data-reset]');
        const sessionSummary = controls?.querySelector('.editorial-session-summary');
        if (reset && sessionSummary) {
          reset.title = reset.textContent.replace('restart_alt', '').trim();
          move(reset, sessionSummary);
        }
        move(badge, release);
        document.body.classList.add('editorial-desktop-workspace');
        layout.classList.add('editorial-desktop-layout');
        syncModules();
        fitSidebar();
      } else {
        for (const module of definitions) closeWindow(module);
        for (const [node, marker] of moves.splice(0)) marker.replaceWith(node);
        pagesCard.remove();
        document.body.classList.remove('editorial-desktop-workspace');
        layout.classList.remove('editorial-desktop-layout');
        preview.style.removeProperty('--editorial-fitted-width');
      }
    }

    desktop.addEventListener('change', syncViewport);
    function fitWindows() {
      for (const module of definitions) {
        if (!module.card.matches('.editorial-floating-module')) continue;
        const rect = module.card.getBoundingClientRect();
        positionWindow(module, rect.left, rect.top, rect.width);
      }
    }
    window.addEventListener('resize', () => { fitSidebar(); fitWindows(); });
    new ResizeObserver(fitWindows).observe(top);
    syncViewport();
  }

  if (document.readyState === 'complete') connect();
  else window.addEventListener('load', connect, { once: true });
})();
