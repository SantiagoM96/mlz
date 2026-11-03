/** Contador compartido por los accesos directos y Más Filtros.
 * El botón padre conserva su nombre accesible; aria-description describe el total. */
export function AgendaFilterCounter({ count }: { count: number }) {
  if (count === 0) return null;
  return <span aria-hidden="true" data-agenda-filter-count className="agenda-filter-counter">{count}</span>;
}
