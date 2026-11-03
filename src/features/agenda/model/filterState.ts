import type { FilterGroup } from '../../../data/agenda';

/** Estado y operaciones de selección de la Agenda, independientes de la presentación. */
export type SelectedFilters = Record<FilterGroup, string[]>;

export const agendaFilterGroups: readonly FilterGroup[] = ['type', 'category', 'locality', 'date'];

/** Los accesos directos mantienen sus propios contadores aunque la selección se
 * haga desde Más Filtros. El contador avanzado excluye Localidad y Fecha. */
export function countAdvancedFilters(filters: SelectedFilters): number {
  return agendaFilterGroups.reduce((total, group) =>
    total + (group === 'locality' || group === 'date' ? 0 : filters[group].length), 0);
}

export function emptyFilters(): SelectedFilters {
  return { type: [], category: [], locality: [], date: [] };
}

export function toggleSelectedValue(selected: readonly string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter(item => item !== value)
    : [...selected, value];
}

export function toggleFilterValue(filters: SelectedFilters, group: FilterGroup, value: string): SelectedFilters {
  return { ...filters, [group]: toggleSelectedValue(filters[group], value) };
}
