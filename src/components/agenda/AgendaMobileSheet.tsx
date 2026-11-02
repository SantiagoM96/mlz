import { useRef, type PointerEvent } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

/** Backdrop separado del contenido para poder animar el cierre. */
export function AgendaSheetBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="agenda-mobile-backdrop"
      aria-label="Cerrar panel de opciones" onClick={onClose} />
  );
}

/**
 * El tirador acompaña el dedo. Un swipe corto rebota con easing suave;
 * un swipe largo o suficientemente veloz cierra el bottom sheet.
 */
export function AgendaSheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const originY = useRef<number | null>(null);
  const originTime = useRef(0);
  const moved = useRef(false);
  const resetTimer = useRef<number | null>(null);

  const clearRebound = () => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  };

  const sheetOf = (element: HTMLElement) =>
    element.closest<HTMLElement>('[data-agenda-sheet]');

  const backdropOf = (sheet: HTMLElement) =>
    sheet.parentElement?.querySelector<HTMLElement>('.agenda-mobile-backdrop');

  const handleDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    clearRebound();
    originY.current = event.clientY;
    originTime.current = event.timeStamp;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (originY.current === null) return;
    const distance = Math.max(0, event.clientY - originY.current);
    if (distance > 8) moved.current = true;
    const sheet = sheetOf(event.currentTarget);
    if (!sheet) return;
    sheet.classList.add('agenda-sheet-dragging');
    sheet.style.setProperty('--agenda-sheet-drag-y', `${distance}px`);
    const backdrop = backdropOf(sheet);
    if (backdrop) backdrop.style.opacity = String(
      Math.max(0.12, 1 - distance / Math.max(1, sheet.clientHeight)),
    );
  };

  const handleEnd = (event: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    if (originY.current === null) return;
    const distance = Math.max(0, event.clientY - originY.current);
    const elapsed = Math.max(1, event.timeStamp - originTime.current);
    const velocity = distance / elapsed;
    originY.current = null;

    const sheet = sheetOf(event.currentTarget);
    if (!sheet) return;
    const backdrop = backdropOf(sheet);
    const shouldClose = !cancelled && (distance >= 105 || (distance >= 48 && velocity >= 0.68));

    if (shouldClose) {
      onClose();
      sheet.classList.remove('agenda-sheet-dragging');
      sheet.style.removeProperty('--agenda-sheet-drag-y');
      if (backdrop) backdrop.style.removeProperty('opacity');
      return;
    }

    // Partimos de la última posición del dedo, evitando un salto al rebotar.
    sheet.style.transition = 'none';
    sheet.style.transform = `translate3d(0,${distance}px,0)`;
    sheet.classList.remove('agenda-sheet-dragging');
    sheet.style.removeProperty('--agenda-sheet-drag-y');
    if (backdrop) {
      backdrop.style.transition = 'opacity 260ms ease-out';
      backdrop.style.opacity = '1';
    }

    requestAnimationFrame(() => {
      if (!sheet.isConnected) return;
      sheet.style.transition = 'transform 320ms cubic-bezier(.18,1.15,.36,1)';
      sheet.style.transform = 'translate3d(0,0,0)';
    });

    resetTimer.current = window.setTimeout(() => {
      if (sheet.isConnected) {
        sheet.style.removeProperty('transition');
        sheet.style.removeProperty('transform');
      }
      if (backdrop?.isConnected) {
        backdrop.style.removeProperty('transition');
        backdrop.style.removeProperty('opacity');
      }
    }, 370);
  };

  return (
    <div className="agenda-sheet-header">
      <button type="button" className="agenda-sheet-grabber"
        aria-label="Deslizar o tocar para cerrar panel"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={event => handleEnd(event, false)}
        onPointerCancel={event => handleEnd(event, true)}
        onClick={() => { if (!moved.current) onClose(); }}>
        <span aria-hidden="true" />
      </button>
      <div className="agenda-sheet-heading">
        <strong className="text-[18px] leading-6 text-primary-600">{title}</strong>
        <button type="button" aria-label="Cerrar opciones" onClick={onClose}
          className="grid size-10 place-items-center rounded-full bg-[#f1f6fa] text-primary-600
            focus-visible:outline-2 focus-visible:outline-info-500">
          <MaterialIcon name="close" size={24} />
        </button>
      </div>
    </div>
  );
}
