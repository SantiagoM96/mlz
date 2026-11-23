import { mobileQuery } from './mobile/legacyEditor';

export function connectModuleOrder() {
  const panel = document.querySelector<HTMLElement>('.editor-panel');
  if (!panel) return;

  const selector = ':scope > .modern-card, :scope > .ds-control-card';
  const titles = new Map<HTMLElement, string>();
  for (const card of panel.querySelectorAll<HTMLElement>(selector)) {
    const label = card.querySelector(
      ':scope > .modern-toggle > span:not([aria-hidden]), :scope > .ds-control-card-toggle .ds-control-card-title',
    )?.textContent?.trim();
    if (label && label !== 'Diseño de placas' && !card.classList.contains('carousel-panel')) {
      titles.set(card, label);
    }
  }
  const original = [...titles.keys()];
  if (original.length < 2) return;

  const mobile = matchMedia(mobileQuery);
  const storageKey = 'editorial-module-order:' + location.pathname.replace(/index\.html$/, '');
  const orderedCards = () => [...panel.querySelectorAll<HTMLElement>(selector)].filter(card => titles.has(card));
  const visibleCards = () => orderedCards().filter(card => card.getClientRects().length > 0);

  function applyOrder(order: HTMLElement[]) {
    const current = orderedCards();
    order.forEach((card, index) => {
      if (card === current[index]) return;
      current[index]?.before(card);
      current.splice(current.indexOf(card), 1);
      current.splice(index, 0, card);
    });
  }

  let desktopOrder = original;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (Array.isArray(saved)) {
      const byTitle = new Map(original.map(card => [titles.get(card), card]));
      const restored = saved.map(title => byTitle.get(title)).filter(card => card !== undefined);
      desktopOrder = [...new Set([...restored, ...original])];
    }
  } catch { /* El orden sigue disponible durante la sesión. */ }

  const status = document.createElement('span');
  status.className = 'editorial-order-status';
  status.setAttribute('role', 'status');
  panel.append(status);

  let dragged: HTMLElement | undefined;
  let target: HTMLElement | undefined;
  let after = false;

  function clearTarget() {
    target?.removeAttribute('data-editorial-drop');
    target = undefined;
  }

  function resetDrag() {
    clearTarget();
    dragged?.classList.remove('editorial-module-dragging');
    dragged = undefined;
  }

  function move(card: HTMLElement, destination: HTMLElement, insertAfter: boolean) {
    if (insertAfter) destination.after(card);
    else destination.before(card);
    desktopOrder = orderedCards();
    try {
      localStorage.setItem(storageKey, JSON.stringify(desktopOrder.map(item => titles.get(item))));
    } catch { /* El orden se conserva durante la sesión. */ }
    const visible = visibleCards();
    status.textContent = `${titles.get(card)}, posición ${visible.indexOf(card) + 1} de ${visible.length}.`;
  }

  for (const [card, title] of titles) {
    card.classList.add('editorial-reorderable-module');
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'editorial-module-handle';
    handle.draggable = true;
    handle.title = 'Arrastrá para mover o usá las flechas ↑ y ↓';
    handle.setAttribute('aria-label', `Mover ${title}`);
    handle.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
    card.prepend(handle);

    handle.addEventListener('dragstart', event => {
      if (mobile.matches || !event.dataTransfer) {
        event.preventDefault();
        return;
      }
      dragged = card;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', title);
      event.dataTransfer.setDragImage(card, 18, 22);
      card.classList.add('editorial-module-dragging');
    });
    handle.addEventListener('dragend', resetDrag);
    handle.addEventListener('keydown', event => {
      if (mobile.matches || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
      event.preventDefault();
      const down = event.key === 'ArrowDown';
      const visible = visibleCards();
      const neighbor = visible[visible.indexOf(card) + (down ? 1 : -1)];
      if (neighbor) {
        move(card, neighbor, down);
        handle.focus();
      }
    });
    card.addEventListener('dragover', event => {
      if (!dragged || dragged === card) {
        if (dragged) clearTarget();
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      if (target !== card) clearTarget();
      target = card;
      const bounds = card.getBoundingClientRect();
      after = event.clientY >= bounds.top + bounds.height / 2;
      card.dataset.editorialDrop = after ? 'after' : 'before';
    });
    card.addEventListener('drop', event => {
      if (!dragged || target !== card) return;
      event.preventDefault();
      const source = dragged;
      resetDrag();
      move(source, card, after);
    });
  }

  document.addEventListener('dragover', event => {
    if (!dragged || !target) return;
    if (!(event.target instanceof Node) || !target.contains(event.target)) clearTarget();
  });

  const syncViewport = () => {
    resetDrag();
    applyOrder(mobile.matches ? original : desktopOrder);
  };
  mobile.addEventListener('change', syncViewport);
  syncViewport();
}
