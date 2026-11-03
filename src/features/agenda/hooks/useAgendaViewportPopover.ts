import { useLayoutEffect, type RefObject } from 'react';

const MOBILE_BREAKPOINT = 680;
const VIEWPORT_BOTTOM_GAP = 50;
const POPOVER_OFFSET = 8;

/** Dropdowns de Deportes: alto disponible bajo el disparador y margen inferior de 50px. */
export function useAgendaViewportPopover(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const popover = popoverRef.current;
      if (!popover) return;
      // Los bottom sheets móviles tienen alto y anclaje propios.
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        popover.style.removeProperty('max-height');
        return;
      }
      const trigger = triggerRef.current;
      if (!trigger) return;
      const top = trigger.getBoundingClientRect().bottom + POPOVER_OFFSET;
      const available = Math.max(0, Math.floor(window.innerHeight - top - VIEWPORT_BOTTOM_GAP));
      popover.style.maxHeight = `${available}px`;
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, triggerRef, popoverRef]);
}
