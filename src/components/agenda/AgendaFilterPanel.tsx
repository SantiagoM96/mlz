import { useState, type RefObject } from 'react';
import { useAgendaViewportPopover } from '../../features/agenda/hooks/useAgendaViewportPopover';
import { agendaFilterGroups, toggleFilterValue, type SelectedFilters } from '../../features/agenda/model/filterState';
import { filterOptions, filterTitles, type FilterGroup } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { AgendaSheetBackdrop, AgendaSheetHeader } from './AgendaMobileSheet';
import { useAgendaMobileScrollLock } from './useAgendaMobileScrollLock';
import { useAgendaSheetDismiss } from './useAgendaSheetDismiss';

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

export function AgendaFilterPanel({ value, onChange, onApply, onReset, onClose, resultCount, anchorRef }: Props) {
  const [expanded, setExpanded] = useState<FilterGroup[]>(['type']);
  useAgendaMobileScrollLock(true);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLElement>(true, onClose);
  useAgendaViewportPopover(true, anchorRef, sheetRef);
  const toggleItem = (group: FilterGroup, item: string) => {
    onChange(toggleFilterValue(value, group, item));
  };

  return (
    <>
      <AgendaSheetBackdrop onClose={dismiss} />
    <section ref={sheetRef} id="agenda-more-filters" data-agenda-sheet="more" role="dialog" aria-modal="false" aria-label="Filtros de la agenda"
      className="agenda-dropdown-enter agenda-mobile-sheet agenda-filter-popover agenda-more-panel fixed inset-x-4 top-20 bottom-4 z-50 flex w-auto flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white shadow-xl">
      <AgendaSheetHeader title="Filtrar actividades" onClose={dismiss} showCloseButton={false} />
      <div className="agenda-filter-options min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {agendaFilterGroups.map(group => (
          <section key={group} className="agenda-filter-section border-b border-[#e7edf2] py-3 first:pt-4 last:border-0">
            <button type="button" className="agenda-motion-control flex min-h-11 w-full items-center justify-between rounded px-2 text-left text-[19px] font-bold text-primary-600 hover:bg-[#eff7fd]"
              aria-expanded={expanded.includes(group)}
              onClick={() => setExpanded(prev => prev.includes(group) ? prev.filter(x => x !== group) : [...prev, group])}>
              {filterTitles[group]} <MaterialIcon name="expand_more" size={24} className={`agenda-motion-chevron ${expanded.includes(group) ? 'rotate-180' : ''}`} />
            </button>
            {expanded.includes(group) &&
              <div className="agenda-motion-accordion mt-2 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                {filterOptions[group].map(option => (
                  <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2 text-[16px] leading-6 text-grey-900 transition-colors hover:bg-[#eff7fd] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-600">
                    <input type="checkbox" className="size-5 shrink-0 accent-[#006eff]" checked={value[group].includes(option)} onChange={() => toggleItem(group, option)} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            }
          </section>
        ))}
      </div>
      <div className="flex flex-none gap-2 border-t border-[#e7e7e7] bg-white p-4">
        <button type="button" onClick={() => { if (window.matchMedia("(max-width: 680px)").matches) dismiss(); else onApply(); }} className="min-h-12 min-w-0 flex-1 rounded bg-primary-600 px-4 font-bold text-white hover:bg-primary-700">Ver resultados ({resultCount})</button>
        <button type="button" onClick={onReset} className="min-h-12 shrink-0 rounded border border-primary-600 bg-white px-4 font-bold text-primary-600 hover:bg-[#f3f7fc]">Limpiar</button>
      </div>
    </section>
    </>
  );
}
