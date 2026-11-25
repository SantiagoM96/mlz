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
    const status = header?.querySelector('.editorial-draft-status');
    if (!layout || !panel || !preview || !stage || !pages || !header || !logo || !('showPopover' in HTMLElement.prototype)) return;

    const desktop = matchMedia('(min-width: 701px)');
    const top = document.createElement('div');
    const rail = document.createElement('nav');
    const footer = document.createElement('div');
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

    const collapse = iconButton('left_panel_close', 'Contraer barra lateral');
    top.append(collapse);
    layout.prepend(top, rail, footer);

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

    function openModule(module, toggle = false) {
      if (!module || module.card.hidden || !desktop.matches) return;
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
    }

    function syncModules() {
      for (const module of definitions) {
        module.navButton.hidden = module.card.hidden || getComputedStyle(module.card).display === 'none';
        module.navButton.style.order = [...panel.children].indexOf(module.card);
      }
      if (active?.navButton.hidden) closePopup();
    }

    const visibility = new MutationObserver(() => { if (desktop.matches) syncModules(); });
    visibility.observe(panel, { childList: true });
    visibility.observe(document.documentElement, { attributes: true, attributeFilter: ['data-editor-plate-variant'] });
    for (const { card } of definitions) {
      visibility.observe(card, { attributes: true, attributeFilter: ['hidden', 'style'] });
    }

    collapse.addEventListener('click', () => {
      closePopup();
      collapsed = !collapsed;
      layout.classList.toggle('editorial-sidebar-collapsed', collapsed);
      const label = collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral';
      collapse.title = label;
      collapse.setAttribute('aria-label', label);
      collapse.firstElementChild.textContent = collapsed ? 'left_panel_open' : 'left_panel_close';
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
      });
    }

    const sizes = new ResizeObserver(scheduleFit);
    sizes.observe(preview);
    for (const child of preview.children) {
      if (child !== stage) sizes.observe(child);
    }

    function syncViewport() {
      closePopup();
      if (desktop.matches) {
        if (moves.length) return;
        panel.prepend(pagesCard);
        move(pages, pagesCard);
        move(logo, top, true);
        move(status, footer);
        move(controls, footer);
        document.body.classList.add('editorial-desktop-workspace');
        layout.classList.add('editorial-desktop-layout');
        syncModules();
        scheduleFit();
      } else {
        for (const [node, marker] of moves.splice(0)) marker.replaceWith(node);
        pagesCard.remove();
        document.body.classList.remove('editorial-desktop-workspace');
        layout.classList.remove('editorial-desktop-layout');
        preview.style.removeProperty('--editorial-fitted-width');
      }
    }

    desktop.addEventListener('change', syncViewport);
    window.addEventListener('resize', scheduleFit);
    syncViewport();
  }

  if (document.readyState === 'complete') connect();
  else window.addEventListener('load', connect, { once: true });
})();
