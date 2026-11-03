import { useEffect, useRef, useState } from 'react';
import { agendaFilterGroups, countAdvancedFilters, type SelectedFilters } from '../../features/agenda/model/filterState';
import { filterOptions } from '../../data/agenda';
import { AgendaFilterPanel } from './AgendaFilterPanel';
import { MaterialIcon } from '../ui/MaterialIcon';
import { AgendaDropdown } from './AgendaDropdown';
import { AgendaFilterCounter } from './AgendaFilterCounter';

type Props = {
  search: string;
  onSearch: (value: string) => void;
  filters: SelectedFilters;
  resultCount: number;
  onFilters: (filters: SelectedFilters) => void;
  onReset: () => void;
};

export function AgendaToolbar({ search, onSearch, filters, resultCount, onFilters, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const moreFiltersButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest('[aria-label="Filtros de la agenda"]') &&
          !target.closest('.agenda-mobile-backdrop') &&
          !moreFiltersButtonRef.current?.contains(target)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        moreFiltersButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);
  const selectedCount = Object.values(filters).reduce((sum, items) => sum + items.length, 0);
  const advancedCount = countAdvancedFilters(filters);

  return <div className="relative" data-testid="agenda-toolbar">
    <div className="agenda-search-filterbar grid grid-cols-[minmax(0,1fr)_max-content] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,207px)_minmax(150px,207px)_max-content] xl:grid-cols-[minmax(0,1fr)_207px_207px_max-content]">
      <label className="relative col-span-2 block md:col-span-1">
        <span className="sr-only">Buscar actividades</span>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="¿Qué estás buscando?"
          className="agenda-search-input h-12 w-full rounded border border-[#5ba8d5] bg-white py-2 pr-11 pl-4 text-[16px] text-grey-900 outline-none placeholder:text-[#5ba8d5]" />
        {search ?
          <button type="button" aria-label="Borrar búsqueda" onClick={() => onSearch('')} className="absolute right-3 top-3 text-primary-600"><MaterialIcon name="close" size={24}/></button> :
          <MaterialIcon name="search" size={24} className="pointer-events-none absolute right-3 top-3 text-primary-600" />
        }
      </label>

      <div className="hidden min-w-0 md:block">
        <AgendaDropdown label="Localidad" align="end"
          options={filterOptions.locality}
          selected={filters.locality}
          resultCount={resultCount}
          multiple
          onChange={locality => onFilters({ ...filters, locality })} />
      </div>

      <AgendaDropdown label="Fecha"
        options={filterOptions.date}
        selected={filters.date}
        resultCount={resultCount}
        align="end-responsive"
        onChange={date => onFilters({ ...filters, date })} />

      <div className="relative min-w-0">
      <button ref={moreFiltersButtonRef} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="agenda-more-filters"
        aria-description={advancedCount ? `${advancedCount} ${advancedCount === 1 ? 'filtro avanzado seleccionado' : 'filtros avanzados seleccionados'}` : undefined}
        onClick={() => setOpen(v => !v)}
        className={`agenda-filter-trigger agenda-motion-control flex h-12 w-full min-w-0 items-center justify-center rounded border border-[#5ba8d5] bg-white px-4 text-[16px] text-primary-600 transition-colors duration-150 hover:bg-[#f4f9fd] hover:border-primary-600 focus-visible:outline-2 ${open || advancedCount ? 'agenda-filter-trigger-active' : ''}`}>
        <span data-agenda-more-content className="inline-flex shrink-0 items-center gap-2">
          <span data-agenda-more-label className="whitespace-nowrap">Más Filtros</span>
          <AgendaFilterCounter count={advancedCount} />
          <MaterialIcon name="tune" size={24} />
        </span>
      </button>
        {open && <AgendaFilterPanel value={filters} onChange={onFilters} onApply={() => setOpen(false)}
          onReset={onReset} onClose={() => setOpen(false)} resultCount={resultCount} anchorRef={moreFiltersButtonRef} />}
      </div>
    </div>

    {selectedCount > 0 && <div aria-label="Filtros seleccionados" className="agenda-filter-chips mt-4 flex flex-wrap items-center gap-2">
      <div className="agenda-filter-chips-scroll">
      {agendaFilterGroups.flatMap(group => filters[group].map(value => (
        <button type="button" key={group+value} onClick={() => onFilters({ ...filters, [group]: filters[group].filter(x => x !== value) })}
          data-agenda-chip="selected" className="agenda-filter-chip inline-flex min-h-[30px] items-center gap-2 rounded-[6px] bg-info-500 px-2.5 text-[14px] font-medium text-white hover:bg-[#005bd1]">
          {value}<MaterialIcon name="close" size={15}/>
        </button>
      )))}
      </div>
      <button type="button" onClick={onReset} className="agenda-filter-clear min-h-[30px] px-2 font-bold text-primary-600 underline-offset-2 hover:underline">Limpiar</button>
    </div>}

  </div>;
}
