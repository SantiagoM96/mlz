import { useCallback, useEffect, useRef } from 'react';

/** Unifica el cierre animado de las hojas móviles sin retrasar los popovers de escritorio. */
export function useAgendaSheetDismiss<T extends HTMLElement>(
  open: boolean, onDismiss: () => void,
) {
  const sheetRef = useRef<T | null>(null);
  const closeTimer = useRef<number | null>(null);
  const isClosing = useRef(false);

  useEffect(() => {
    if (open) isClosing.current = false;
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, [open]);

  const dismiss = useCallback(() => {
    if (isClosing.current) return;
    const mobile = window.matchMedia('(max-width: 680px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sheet = sheetRef.current;
    if (!mobile || reduced || !sheet) {
      onDismiss();
      return;
    }

    isClosing.current = true;
    sheet.classList.add('agenda-sheet-exit');
    const backdrop = sheet.parentElement?.querySelector<HTMLElement>('.agenda-mobile-backdrop');
    backdrop?.classList.add('agenda-backdrop-exit');
    closeTimer.current = window.setTimeout(onDismiss, 200);
  }, [onDismiss]);

  return { sheetRef, dismiss };
}
