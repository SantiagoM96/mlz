import { useEffect, useRef, type PointerEvent } from 'react';
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
export function AgendaSheetHeader({ title, onClose, showCloseButton = true }: { title: string; onClose: () => void; showCloseButton?: boolean }) {
  const startY = useRef<number | null>(null);
  const startTime = useRef(0);
  const baseHeight = useRef(0);
  const moved = useRef(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  const sheetOf = (element: HTMLElement) =>
    element.closest<HTMLElement>('[data-agenda-sheet]');

  const backdropOf = (sheet: HTMLElement) =>
    sheet.parentElement?.querySelector<HTMLElement>('.agenda-mobile-backdrop');

  const clearReset = () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = null;
  };

  const clearGestureStyles = (sheet: HTMLElement) => {
    sheet.classList.remove('agenda-sheet-dragging', 'agenda-sheet-stretching',
      'agenda-sheet-stretch-rebounding', 'agenda-sheet-rebounding');
    sheet.style.removeProperty('--agenda-sheet-drag-y');
    sheet.style.removeProperty('--agenda-sheet-stretch-y');
    sheet.style.removeProperty('--agenda-sheet-base-height');
    const backdrop = backdropOf(sheet);
    if (backdrop) {
      backdrop.style.removeProperty('opacity');
      backdrop.style.removeProperty('transition');
    }
  };

  // Deportes: resistencia progresiva al tirar hacia ARRIBA, tope 34 px.
  const elasticUp = (distance: number) => 34 * (1 - Math.exp(Math.abs(distance) / -76));

  const handleDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const sheet = sheetOf(event.currentTarget);
    if (!sheet) return;
    clearReset();
    clearGestureStyles(sheet);
    baseHeight.current = sheet.getBoundingClientRect().height;
    sheet.style.setProperty('--agenda-sheet-base-height', baseHeight.current.toFixed(2) + 'px');
    // Evita reiniciar la animación de entrada al terminar un gesto.
    sheet.classList.add('agenda-sheet-settled');
    startY.current = event.clientY;
    startTime.current = event.timeStamp;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (startY.current === null) return;
    const delta = event.clientY - startY.current;
    if (Math.abs(delta) > 8) moved.current = true;
    const sheet = sheetOf(event.currentTarget);
    if (!sheet) return;
    const backdrop = backdropOf(sheet);
    if (delta < 0) {
      // El borde SUPERIOR sube; la hoja no se traslada entera y el contenido acompaña.
      sheet.classList.remove('agenda-sheet-dragging');
      sheet.style.setProperty('--agenda-sheet-drag-y', '0px');
      sheet.style.setProperty('--agenda-sheet-stretch-y', elasticUp(delta).toFixed(2) + 'px');
      sheet.classList.add('agenda-sheet-stretching');
      if (backdrop) backdrop.style.opacity = '1';
    } else {
      sheet.classList.remove('agenda-sheet-stretching');
      sheet.style.setProperty('--agenda-sheet-stretch-y', '0px');
      sheet.style.setProperty('--agenda-sheet-drag-y', Math.max(0, delta).toFixed(2) + 'px');
      sheet.classList.add('agenda-sheet-dragging');
      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = String(Math.max(0.12, 1 - delta / Math.max(1, baseHeight.current)));
      }
    }
  };

  const handleEnd = (event: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    if (startY.current === null) return;
    const delta = event.clientY - startY.current;
    const elapsed = Math.max(1, event.timeStamp - startTime.current);
    const velocity = delta / elapsed;
    startY.current = null;
    const sheet = sheetOf(event.currentTarget);
    if (!sheet) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dismiss = !cancelled && delta > 0 &&
      (delta >= Math.min(168, Math.max(120, baseHeight.current * .24))
        || (delta >= 55 && velocity >= .8));

    if (dismiss) {
      // Mantener la última posición hasta que el hook de cierre anime la salida:
      // no saltar a Y=0 antes de deslizarse fuera de pantalla.
      onClose();
      return;
    }

    const stretched = sheet.classList.contains('agenda-sheet-stretching');
    const backdrop = backdropOf(sheet);
    if (reduced || Math.abs(delta) < 2) {
      clearGestureStyles(sheet);
      return;
    }

    if (stretched) {
      // Rebote hacia arriba: height vuelve a su base sin mover el pie fijo.
      sheet.classList.remove('agenda-sheet-stretching');
      sheet.classList.add('agenda-sheet-stretch-rebounding');
    } else {
      sheet.classList.remove('agenda-sheet-dragging');
      sheet.classList.add('agenda-sheet-rebounding');
    }
    if (backdrop) {
      backdrop.style.transition = 'opacity 380ms ease-out';
      backdrop.style.opacity = '1';
    }
    clearReset();
    resetTimer.current = window.setTimeout(() => {
      if (sheet.isConnected) clearGestureStyles(sheet);
      resetTimer.current = null;
    }, 430);
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
        {showCloseButton && <button type="button" aria-label="Cerrar opciones" onClick={onClose}
          className="grid size-10 place-items-center rounded-full bg-[#f1f6fa] text-primary-600
            focus-visible:outline-2 focus-visible:outline-info-500">
          <MaterialIcon name="close" size={24} />
        </button>}
      </div>
    </div>
  );
}
