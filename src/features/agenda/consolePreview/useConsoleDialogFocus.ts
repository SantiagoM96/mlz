import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';

interface ConsoleDialogFocusOptions {
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

const tabbableSelector =
  'button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';

/**
 * Mantiene el teclado dentro del diálogo y restaura el foco al control que lo abrió.
 * Un cambio de referencia de onClose no reinicia el foco ni el bloqueo del scroll.
 */
export function useConsoleDialogFocus({
  panelRef, initialFocusRef, onClose,
}: ConsoleDialogFocusOptions) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    initialFocusRef.current?.focus();

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [initialFocusRef]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(tabbableSelector) ?? [],
    ).filter(control => control.tabIndex >= 0 && control.getClientRects().length > 0);
    if (controls.length === 0) {
      event.preventDefault();
      return;
    }
    const first = controls[0]!;
    const last = controls[controls.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { onKeyDown };
}
