import { useEffect, useState } from 'react';

/** Paginación responsive: 6 elementos en mobile y 9 en tablet/desktop. */
export function useAgendaPageSize(): number {
  const [size, setSize] = useState(9);

  useEffect(() => {
    const update = () => setSize(window.matchMedia('(max-width: 767px)').matches ? 6 : 9);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
