import { useRef, type PointerEvent } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

/** Fondo modal visible únicamente en pantallas chicas. */
export function AgendaSheetBackdrop({ onClose }: { onClose: () => void }) {
  return <button type="button" className="agenda-mobile-backdrop" aria-label="Cerrar panel de opciones" onClick={onClose} />;
}

/** Tirador táctil: se puede tocar o deslizar hacia abajo para cerrar. */
export function AgendaSheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const startingY = useRef<number | null>(null);
  const moved = useRef(false);

  const resetPosition = (target: HTMLButtonElement) => {
    const sheet = target.closest<HTMLElement>('[data-agenda-sheet]');
    if (sheet) {
      sheet.style.transition = 'transform 220ms cubic-bezier(.2,.8,.25,1)';
      sheet.style.transform = '';
    }
  };
  const handleDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startingY.current = event.clientY;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (startingY.current === null) return;
    const delta = Math.max(0, event.clientY - startingY.current);
    if (delta > 12) moved.current = true;
    const sheet = event.currentTarget.closest<HTMLElement>('[data-agenda-sheet]');
    if (sheet) {
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${delta}px)`;
    }
  };
  const handleUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (startingY.current === null) return;
    const delta = Math.max(0, event.clientY - startingY.current);
    startingY.current = null;
    if (delta > 105) onClose();
    else resetPosition(event.currentTarget);
  };
  const handleCancel = (event: PointerEvent<HTMLButtonElement>) => {
    startingY.current = null;
    resetPosition(event.currentTarget);
  };

  return (
    <div className="agenda-sheet-header">
      <button type="button" className="agenda-sheet-grabber" aria-label="Deslizar o tocar para cerrar panel"
        onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}
        onPointerCancel={handleCancel}
        onClick={() => { if (!moved.current) onClose(); }}>
        <span aria-hidden="true" />
      </button>
      <div className="agenda-sheet-heading">
        <strong className="text-[18px] leading-6 text-primary-600">{title}</strong>
        <button type="button" aria-label="Cerrar opciones" onClick={onClose}
          className="grid size-10 place-items-center rounded-full bg-[#f1f6fa] text-primary-600
            focus-visible:outline-2 focus-visible:outline-info-500">
          <MaterialIcon name="close" size={24}/>
        </button>
      </div>
    </div>
  );
}
