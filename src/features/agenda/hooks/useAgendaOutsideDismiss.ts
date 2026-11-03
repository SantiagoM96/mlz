import { useEffect, type RefObject } from 'react';

/** Cierra un popover al interactuar fuera o presionar Escape, devolviendo el foco al activador. */
export function useAgendaOutsideDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
  dismiss: () => void,
): void {
  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      dismiss();
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, rootRef, triggerRef, dismiss]);
}
