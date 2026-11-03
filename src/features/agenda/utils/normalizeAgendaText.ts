/** Normalización consistente de búsqueda y comparación para Agenda. */
export function normalizeAgendaText(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace('–', '-');
}
