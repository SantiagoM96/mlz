import { useState } from 'react';
import { filterOptions, filterTitles, type FilterGroup } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';

export type SelectedFilters = Record<FilterGroup, string[]>;
export const emptyFilters = (): SelectedFilters => ({ type: [], category: [], locality: [], date: [] });

const groups: FilterGroup[] = ['type', 'category', 'locality', 'date'];

type Props = {
  value: SelectedFilters;
  onChange: (filters: SelectedFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

export function AgendaFilterPanel({ value, onChange, onApply, onReset, onClose }: Props) {
  const [expanded, setExpanded] = useState<FilterGroup[]>(['type']);
  const toggleItem = (group: FilterGroup, item: string) => {
    const previous = value[group];
    onChange({ ...value, [group]: previous.includes(item) ? previous.filter(x => x !== item) : [...previous, item] });
  };

  return (
    <section id="agenda-more-filters" role="dialog" aria-modal="false" aria-label="Filtros de la agenda"
      className="agenda-dropdown-enter fixed inset-x-4 top-20 bottom-4 z-50 flex w-auto flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white shadow-xl md:absolute md:inset-auto md:right-0 md:top-[calc(100%+8px)] md:max-h-[min(65vh,540px)] md:w-[min(560px,calc(100vw-32px))]">
      <div className="flex items-center justify-between border-b border-[#e7e7e7] px-4 py-3 md:hidden">
        <h2 className="font-bold text-primary-600">Filtrar actividades</h2>
        <button type="button" aria-label="Cerrar filtros" onClick={onClose}><MaterialIcon name="close" size={24}/></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {groups.map(group => (
          <section key={group} className="mb-4 last:mb-0">
            <button type="button" className="flex w-full items-center justify-between text-left text-[18px] font-bold text-primary-600"
              aria-expanded={expanded.includes(group)}
              onClick={() => setExpanded(prev => prev.includes(group) ? prev.filter(x => x !== group) : [...prev, group])}>
              {filterTitles[group]} <MaterialIcon name="expand_more" size={24} className={`transition-transform duration-150 ${expanded.includes(group) ? '': '-rotate-90'}`} />
            </button>
            {expanded.includes(group) &&
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {filterOptions[group].map(option => (
                  <label key={option} className="flex min-h-7 cursor-pointer items-center gap-2 text-[16px] leading-6 text-grey-900">
                    <input type="checkbox" className="size-4 accent-[#006eff]" checked={value[group].includes(option)} onChange={() => toggleItem(group, option)} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            }
          </section>
        ))}
      </div>
      <div className="flex flex-none gap-2 border-t border-[#e7e7e7] bg-white p-4">
        <button type="button" onClick={onApply} className="min-h-12 min-w-0 flex-1 rounded bg-primary-600 px-4 font-bold text-white hover:bg-primary-700">Ver resultados</button>
        <button type="button" onClick={onReset} className="min-h-12 flex-1 rounded border border-primary-600 bg-white px-4 font-bold text-primary-600 hover:bg-[#f3f7fc]">Limpiar</button>
      </div>
    </section>
  );
}
