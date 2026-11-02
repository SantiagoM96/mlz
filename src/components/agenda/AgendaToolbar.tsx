import { useEffect, useRef, useState } from 'react';
import type { SelectedFilters } from './AgendaFilterPanel';
import { filterOptions } from '../../data/agenda';
import { AgendaFilterPanel } from './AgendaFilterPanel';
import { MaterialIcon } from '../ui/MaterialIcon';
import { AgendaDropdown } from './AgendaDropdown';

type Props = {
  search: string;
  onSearch: (value: string) => void;
  filters: SelectedFilters;
  onFilters: (filters: SelectedFilters) => void;
  onReset: () => void;
};

export function AgendaToolbar({ search, onSearch, filters, onFilters, onReset }: Props) {
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

  return <div className="relative" data-testid="agenda-toolbar">
    <div className="grid grid-cols-[minmax(0,1fr)_150px] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,207px)_minmax(150px,207px)_minmax(135px,162px)]">
      <label className="relative col-span-2 block md:col-span-1">
        <span className="sr-only">Buscar actividades</span>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="¿Qué estás buscando?"
          className="h-12 w-full rounded border border-[#80baff] bg-white py-2 pr-11 pl-4 text-[16px] text-primary-600 outline-offset-2 placeholder:text-[#68ace1] focus:border-[#006eff]" />
        {search ?
          <button type="button" aria-label="Borrar búsqueda" onClick={() => onSearch('')} className="absolute right-3 top-3 text-primary-600"><MaterialIcon name="close" size={24}/></button> :
          <MaterialIcon name="search" size={24} className="pointer-events-none absolute right-3 top-3 text-primary-600" />
        }
      </label>

      <div className="hidden min-w-0 md:block">
        <AgendaDropdown label="Localidad" align="end"
          options={filterOptions.locality}
          selected={filters.locality}
          multiple
          onChange={locality => onFilters({ ...filters, locality })} />
      </div>

      <AgendaDropdown label="Fecha"
        options={filterOptions.date}
        selected={filters.date}
        align="end-responsive"
        onChange={date => onFilters({ ...filters, date })} />

      <button ref={moreFiltersButtonRef} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="agenda-more-filters" onClick={() => setOpen(v => !v)}
        className="agenda-motion-control flex h-12 min-w-0 items-center justify-between gap-2 rounded border border-[#006eff] bg-white px-3 text-[16px] text-primary-600 transition-colors duration-150 hover:bg-[#f2f7fc] focus-visible:outline-2">
        <span className="whitespace-nowrap">Más Filtros</span>
        <MaterialIcon name="tune" size={24} className="shrink-0"/>
      </button>
    </div>

    {selectedCount > 0 && <div aria-label="Filtros seleccionados" className="agenda-filter-chips mt-4 flex flex-wrap items-center gap-2">
      <div className="agenda-filter-chips-scroll">
      {(['type','category','locality','date'] as const).flatMap(group => filters[group].map(value => (
        <button type="button" key={group+value} onClick={() => onFilters({ ...filters, [group]: filters[group].filter(x => x !== value) })}
          data-agenda-chip="selected" className="agenda-filter-chip inline-flex min-h-[30px] items-center gap-2 rounded-[6px] bg-info-500 px-2.5 text-[14px] font-medium text-white hover:bg-[#005bd1]">
          {value}<MaterialIcon name="close" size={15}/>
        </button>
      )))}
      </div>
      <button type="button" onClick={onReset} className="agenda-filter-clear min-h-[30px] px-2 font-bold text-primary-600 underline-offset-2 hover:underline">Limpiar</button>
    </div>}

    {open && <AgendaFilterPanel value={filters} onChange={onFilters} onApply={() => setOpen(false)}
      onReset={onReset} onClose={() => setOpen(false)} />}
  </div>;
}
