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
    button.className = 'editorial-cover-help-button';
    button.setAttribute('aria-label', 'Ayuda sobre Portada carrusel');
    button.setAttribute('aria-expanded', 'false');
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'help_outline';
    button.append(icon);

    const tip = document.createElement('span');
    tip.id = `editorial-cover-help-${index}`;
    tip.className = 'editorial-cover-help-tip';
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
      const left = Math.max(12, Math.min(anchor.left, document.documentElement.clientWidth - 252));
      tip.style.left = `${left}px`;
      tip.showPopover();
      const height = tip.offsetHeight;
      const above = anchor.bottom + height + 8 > window.innerHeight - 12;
      tip.style.top = `${Math.max(12, above ? anchor.top - height - 8 : anchor.bottom + 8)}px`;
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
    button.addEventListener('pointerleave', () => { if (!pinned) hide(); });
    button.addEventListener('click', () => {
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
