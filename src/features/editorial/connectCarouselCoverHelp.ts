const coverHelp = 'Activado: la firma va a la izquierda y aparece una flecha a la derecha. Desactivado: la firma queda centrada.';

export function connectCarouselCoverHelp() {
  document.querySelectorAll<HTMLInputElement>('[data-carousel-cover-switch]').forEach((input, index) => {
    const label = input.closest('label');
    if (!label) return;

    const row = document.createElement('div');
    row.className = 'editorial-cover-help-row';
    label.before(row);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'editorial-cover-help-button help-button';
    button.setAttribute('aria-label', 'Ayuda sobre Portada carrusel');
    button.setAttribute('aria-expanded', 'false');
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'help_outline';
    button.append(icon);

    const tip = document.createElement('span');
    tip.id = `editorial-cover-help-${index}`;
    tip.className = 'editorial-cover-help-tip help-tooltip';
    tip.setAttribute('popover', 'auto');
    tip.setAttribute('role', 'tooltip');
    tip.textContent = coverHelp;
    button.setAttribute('aria-controls', tip.id);
    input.setAttribute('aria-describedby', tip.id);
    button.setAttribute('aria-describedby', tip.id);
    row.append(label, button, tip);

    let pinned = false;
    const show = () => {
      if (tip.matches(':popover-open')) return;
      const anchor = button.getBoundingClientRect();
      const panel = row.closest('.editor-panel')?.getBoundingClientRect();
      const margin = 16;
      const gap = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const leftEdge = Math.max(margin, (panel?.left ?? 0) + margin);
      const rightEdge = Math.min(viewportWidth - margin, (panel?.right ?? viewportWidth) - margin);
      const rightSpace = rightEdge - anchor.right - gap;
      const leftSpace = anchor.left - leftEdge - gap;
      const side = rightSpace >= 160 ? 'right' : leftSpace >= 160 ? 'left' : undefined;
      const width = Math.min(240, side === 'right' ? rightSpace : side === 'left' ? leftSpace : rightEdge - leftEdge);
      const centerX = (anchor.left + anchor.right) / 2;
      const centerY = (anchor.top + anchor.bottom) / 2;
      const left = side === 'right' ? anchor.right + gap : side === 'left' ? anchor.left - gap - width
        : Math.max(leftEdge, Math.min(rightEdge - width, centerX - width / 2));
      tip.style.width = `${width}px`;
      tip.showPopover();
      const height = tip.getBoundingClientRect().height;
      const bottomEdge = window.innerHeight - margin;
      const direction = side ?? (anchor.bottom + gap + height <= bottomEdge ? 'bottom' : 'top');
      const top = direction === 'bottom' ? anchor.bottom + gap : direction === 'top'
        ? Math.max(margin, anchor.top - gap - height)
        : Math.max(margin, Math.min(bottomEdge - height, centerY - height / 2));
      tip.dataset.direction = direction;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.style.setProperty('--cover-arrow-x', `${Math.max(12, Math.min(width - 12, centerX - left))}px`);
      tip.style.setProperty('--cover-arrow-y', `${Math.max(12, Math.min(height - 12, centerY - top))}px`);
      button.setAttribute('aria-expanded', 'true');
    };
    const hide = () => {
      tip.hidePopover();
      pinned = false;
      button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') show();
    });
    button.addEventListener('pointerleave', () => { if (!pinned && !button.matches(':focus-visible')) hide(); });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) show(); });
    button.addEventListener('blur', () => { if (!pinned) hide(); });
    button.addEventListener('click', event => {
      event.stopPropagation();
      if (pinned && tip.matches(':popover-open')) hide();
      else {
        pinned = true;
        show();
      }
    });
    tip.addEventListener('toggle', () => {
      if (!tip.matches(':popover-open')) {
        pinned = false;
        button.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('scroll', () => {
      if (tip.matches(':popover-open')) hide();
    }, { capture: true, passive: true });
    window.addEventListener('resize', hide);
  });
}
