import type { RefObject } from 'react';
import { agendaFilterGroups, toggleFilterValue, type SelectedFilters } from '../../features/agenda/model/filterState';
import { filterOptions, filterTitles, type FilterGroup } from '../../data/agenda';
import { AgendaFilterGroupPanel } from './AgendaFilterGroupPanel';

export { emptyFilters } from '../../features/agenda/model/filterState';
export type { SelectedFilters } from '../../features/agenda/model/filterState';

type Props = {
  value: SelectedFilters;
  onChange: (filters: SelectedFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  resultCount: number;
  anchorRef: RefObject<HTMLButtonElement | null>;
};

/** Conserva la API de Agenda y comparte su presentación con Trámites. */
export function AgendaFilterPanel({ value, onChange, onApply, onReset, onClose, resultCount, anchorRef }: Props) {
  return <AgendaFilterGroupPanel
    groups={agendaFilterGroups.map(group => ({
      key: group,
      title: filterTitles[group],
      options: filterOptions[group],
      selected: value[group],
    }))}
    dialogId="agenda-more-filters"
    ariaLabel="Filtros de la agenda"
    title="Filtrar actividades"
    onToggle={(group, option) => onChange(toggleFilterValue(value, group as FilterGroup, option))}
    onApply={onApply}
    onReset={onReset}
    onClose={onClose}
    resultCount={resultCount}
    anchorRef={anchorRef}
  />;
}
