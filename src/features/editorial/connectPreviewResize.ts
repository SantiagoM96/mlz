export function connectPreviewResize() {
  const main = document.querySelector<HTMLElement>('main');
  const preview = main?.querySelector<HTMLElement>('.preview');
  const stage = preview?.querySelector<HTMLElement>('.canvas-stage');
  const canvas = stage?.querySelector('canvas');
  const actions = preview?.querySelector(':scope > .preview-actions');
  if (!main || !preview || !stage || !canvas || !actions) return;

  const handle = document.createElement('div');
  handle.className = 'editorial-preview-resize';
  handle.tabIndex = 0;
  handle.setAttribute('role', 'slider');
  handle.setAttribute('aria-label', 'Tamaño de la vista previa');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-controls', stage.id);
  handle.title = 'Arrastrá hacia arriba para agrandar o hacia abajo para achicar';
  actions.before(handle);

  const maximum = () => {
    const viewport = document.documentElement.clientWidth;
    const extra = viewport >= 1240 ? Math.max(0, viewport - 40 - main.clientWidth) : 0;
    return Math.min(canvas.width, preview.clientWidth + extra);
  };

  const minimum = () => Math.min(220, maximum());
  const current = () => stage.getBoundingClientRect().width;

  const updateAccessibility = () => {
    const percent = (width: number) => String(Math.round(width / canvas.width * 100));
    handle.setAttribute('aria-valuemin', percent(minimum()));
    handle.setAttribute('aria-valuemax', percent(maximum()));
    handle.setAttribute('aria-valuenow', percent(current()));
    handle.setAttribute('aria-valuetext', percent(current()) + ' %');
  };

  const resize = (width: number) => {
    const next = Math.max(minimum(), Math.min(maximum(), width));
    main.style.setProperty('--editorial-preview-width', `${Math.round(next)}px`);
    updateAccessibility();
  };

  const observer = new ResizeObserver(updateAccessibility);
  observer.observe(stage);
  observer.observe(preview);

  let drag: { pointerId: number; y: number; width: number } | undefined;
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, y: event.clientY, width: current() };
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    resize(drag.width + (drag.y - event.clientY) * canvas.width / canvas.height);
  });
  handle.addEventListener('lostpointercapture', () => { drag = undefined; });
  handle.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowUp': resize(current() + 24); break;
      case 'ArrowDown': resize(current() - 24); break;
      case 'Home': resize(minimum()); break;
      case 'End': resize(maximum()); break;
      default: return;
    }
    event.preventDefault();
  });
  handle.addEventListener('dblclick', () => {
    main.style.removeProperty('--editorial-preview-width');
    updateAccessibility();
  });
}
