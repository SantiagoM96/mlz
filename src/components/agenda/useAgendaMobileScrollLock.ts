import { useEffect } from 'react';

/** Evita que se desplace la página por detrás de los bottom sheets. */
export function useAgendaMobileScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    const media = window.matchMedia('(max-width: 680px)');
    let previous = '';
    let locked = false;
    const sync = () => {
      if (media.matches && !locked) {
        previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        locked = true;
      } else if (!media.matches && locked) {
        document.body.style.overflow = previous;
        locked = false;
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
      if (locked) document.body.style.overflow = previous;
    };
  }, [isOpen]);
}
