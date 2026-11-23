import { mobileQuery } from './mobile/legacyEditor';

const reorderThreshold = 0.3;

export function connectModuleOrder() {
  const editorPanel = document.querySelector<HTMLElement>('.editor-panel');
  if (!editorPanel) return;
  const panel = editorPanel;

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

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<HTMLElement, Animation>();
  let drag: {
    card: HTMLElement;
    pointerId: number;
    grabOffset: number;
    y: number;
    translation: number;
    direction: number;
  } | undefined;
  let scrollFrame = 0;

  function saveOrder(card: HTMLElement) {
    desktopOrder = orderedCards();
    try {
      localStorage.setItem(storageKey, JSON.stringify(desktopOrder.map(item => titles.get(item))));
    } catch { /* El orden se conserva durante la sesión. */ }
    const visible = visibleCards();
    status.textContent = `${titles.get(card)}, posición ${visible.indexOf(card) + 1} de ${visible.length}.`;
  }

  function updateDrag() {
    if (!drag) return;
    if (!drag.direction) return;
    const { card, y, direction, translation } = drag;
    const cards = visibleCards();
    const peers = cards.filter(item => item !== card);
    const naturalTop = () => card.getBoundingClientRect().top - translation;
    const panelOrigin = naturalTop() - card.offsetTop;
    const index = cards.indexOf(card);
    const draggedTop = y - drag.grabOffset;
    const leadingEdge = direction > 0 ? draggedTop + card.offsetHeight : draggedTop;
    const crossed = (item: HTMLElement) => {
      const entry = direction > 0 ? 0 : item.offsetHeight;
      const threshold = panelOrigin + item.offsetTop + entry + direction * item.offsetHeight * reorderThreshold;
      return direction > 0 ? leadingEdge >= threshold : leadingEdge <= threshold;
    };
    const candidates = direction > 0 ? cards.slice(index + 1) : cards.slice(0, index).reverse();
    let destination: HTMLElement | undefined;
    for (const candidate of candidates) {
      if (!crossed(candidate)) break;
      destination = candidate;
    }
    if (destination) {
      const previous = peers.map(item => item.getBoundingClientRect().top);
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
      if (direction > 0) destination.after(card);
      else destination.before(card);

      if (!reducedMotion.matches) {
        peers.forEach((item, i) => {
          const offset = previous[i]! - item.getBoundingClientRect().top;
          if (offset === 0) return;
          const animation = item.animate(
            [{ translate: `0 ${offset}px` }, { translate: '0 0' }],
            { duration: 160, easing: 'ease-out' },
          );
          animations.set(item, animation);
          animation.onfinish = () => animations.delete(item);
        });
      }
    }
    drag.translation = y - drag.grabOffset - naturalTop();
    card.style.setProperty('--editorial-drag-y', `${drag.translation}px`);
  }

  function scrollWhileDragging() {
    if (!drag) return;
    const edge = 56;
    const delta = drag.y < edge ? drag.y - edge : Math.max(0, drag.y - innerHeight + edge);
    if (delta) {
      const previous = window.scrollY;
      window.scrollBy({ top: Math.max(-18, Math.min(18, delta / 4)), behavior: 'instant' });
      if (window.scrollY !== previous) {
        drag.direction = Math.sign(delta);
        updateDrag();
      }
    }
    scrollFrame = requestAnimationFrame(scrollWhileDragging);
  }

  function finishDrag(commit: boolean) {
    if (!drag) return;
    const { card, pointerId } = drag;
    drag = undefined;
    cancelAnimationFrame(scrollFrame);
    if (panel.hasPointerCapture(pointerId)) panel.releasePointerCapture(pointerId);
    panel.classList.remove('editorial-module-sorting');
    card.classList.remove('editorial-module-dragging');
    card.style.removeProperty('--editorial-drag-y');
    if (commit) saveOrder(card);
    else {
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
      applyOrder(desktopOrder);
    }
    if (!mobile.matches) card.querySelector<HTMLElement>('.editorial-module-handle')?.focus({ preventScroll: true });
  }

  for (const [card, title] of titles) {
    card.classList.add('editorial-reorderable-module');
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'editorial-module-handle';
    handle.title = 'Arrastrá para mover o usá las flechas ↑ y ↓';
    handle.setAttribute('aria-label', `Mover ${title}`);
    handle.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
    card.prepend(handle);

    handle.addEventListener('pointerdown', event => {
      if (mobile.matches || drag || event.button !== 0) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      panel.setPointerCapture(event.pointerId);
      drag = {
        card,
        pointerId: event.pointerId,
        grabOffset: event.clientY - card.getBoundingClientRect().top,
        y: event.clientY,
        translation: 0,
        direction: 0,
      };
      card.classList.add('editorial-module-dragging');
      panel.classList.add('editorial-module-sorting');
      scrollFrame = requestAnimationFrame(scrollWhileDragging);
    });
    handle.addEventListener('keydown', event => {
      if (drag || mobile.matches || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
      event.preventDefault();
      const down = event.key === 'ArrowDown';
      const visible = visibleCards();
      const neighbor = visible[visible.indexOf(card) + (down ? 1 : -1)];
      if (neighbor) {
        if (down) neighbor.after(card);
        else neighbor.before(card);
        saveOrder(card);
        handle.focus();
      }
    });
  }

  panel.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId || drag.y === event.clientY) return;
    drag.direction = Math.sign(event.clientY - drag.y);
    drag.y = event.clientY;
    updateDrag();
  });
  panel.addEventListener('pointerup', event => {
    if (drag?.pointerId === event.pointerId) finishDrag(true);
  });
  panel.addEventListener('lostpointercapture', event => {
    if (drag?.pointerId === event.pointerId) finishDrag(false);
  });
  window.addEventListener('keydown', event => {
    if (drag && event.key === 'Escape') {
      event.preventDefault();
      finishDrag(false);
    }
  });

  const syncViewport = () => {
    finishDrag(false);
    applyOrder(mobile.matches ? original : desktopOrder);
  };
  mobile.addEventListener('change', syncViewport);
  syncViewport();
}
