import { useState } from 'react';
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
};

export function AgendaFilterPanel({ value, onChange, onApply, onReset, onClose }: Props) {
  const [expanded, setExpanded] = useState<FilterGroup[]>(['type']);
  useAgendaMobileScrollLock(true);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLElement>(true, onClose);
  const toggleItem = (group: FilterGroup, item: string) => {
    onChange(toggleFilterValue(value, group, item));
  };

  return (
    <>
      <AgendaSheetBackdrop onClose={dismiss} />
    <section ref={sheetRef} id="agenda-more-filters" data-agenda-sheet="more" role="dialog" aria-modal="false" aria-label="Filtros de la agenda"
      className="agenda-dropdown-enter agenda-mobile-sheet fixed inset-x-4 top-20 bottom-4 z-50 flex w-auto flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white shadow-xl md:absolute md:inset-auto md:right-0 md:top-[calc(100%+8px)] md:max-h-[min(65vh,540px)] md:w-[min(560px,calc(100vw-32px))]">
      <AgendaSheetHeader title="Filtrar actividades" onClose={dismiss} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {agendaFilterGroups.map(group => (
          <section key={group} className="mb-4 last:mb-0">
            <button type="button" className="agenda-motion-control flex min-h-10 w-full items-center justify-between text-left text-[18px] font-bold text-primary-600"
              aria-expanded={expanded.includes(group)}
              onClick={() => setExpanded(prev => prev.includes(group) ? prev.filter(x => x !== group) : [...prev, group])}>
              {filterTitles[group]} <MaterialIcon name="expand_more" size={24} className={`agenda-motion-chevron ${expanded.includes(group) ? '': '-rotate-90'}`} />
            </button>
            {expanded.includes(group) &&
              <div className="agenda-motion-accordion mt-2 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                {filterOptions[group].map(option => (
                  <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2 text-[16px] leading-6 text-grey-900 transition-colors hover:bg-[#f3f7fc] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-600">
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
        <button type="button" onClick={() => { if (window.matchMedia("(max-width: 680px)").matches) dismiss(); else onApply(); }} className="min-h-12 min-w-0 flex-1 rounded bg-primary-600 px-4 font-bold text-white hover:bg-primary-700">Ver resultados</button>
        <button type="button" onClick={onReset} className="min-h-12 flex-1 rounded border border-primary-600 bg-white px-4 font-bold text-primary-600 hover:bg-[#f3f7fc]">Limpiar</button>
      </div>
    </section>
    </>
  );
}
