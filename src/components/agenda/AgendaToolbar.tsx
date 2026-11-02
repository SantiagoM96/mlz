import { useState } from 'react';
import type { SelectedFilters } from './AgendaFilterPanel';
import { AgendaFilterPanel } from './AgendaFilterPanel';
import { MaterialIcon } from '../ui/MaterialIcon';

type Props = {
  search: string;
  onSearch: (value: string) => void;
  filters: SelectedFilters;
  onFilters: (filters: SelectedFilters) => void;
  onReset: () => void;
};

export function AgendaToolbar({ search, onSearch, filters, onFilters, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const selectedCount = Object.values(filters).reduce((sum, items) => sum + items.length, 0);
  const locality = filters.locality[0] ?? '';
  const date = filters.date[0] ?? '';

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

      <label className="relative hidden md:block">
        <span className="sr-only">Localidad</span>
        <select value={locality} onChange={e => onFilters({ ...filters, locality: e.target.value ? [e.target.value] : [] })}
          className="h-12 w-full appearance-none rounded border border-[#80baff] bg-white px-4 pr-9 text-[16px] text-primary-600 focus:outline-2 focus:outline-[#006eff]">
          <option value="">Localidad</option><option value="Lomas de Zamora">Lomas de Zamora</option><option value="Banfield">Banfield</option>
        </select>
        <MaterialIcon name="expand_more" size={20} className="pointer-events-none absolute right-3 top-3.5 text-primary-600" />
      </label>

      <label className="relative">
        <span className="sr-only">Fecha</span>
        <select value={date} onChange={e => onFilters({ ...filters, date: e.target.value ? [e.target.value] : [] })}
          className="h-12 w-full appearance-none rounded border border-[#80baff] bg-white px-4 pr-9 text-[16px] text-primary-600 focus:outline-2 focus:outline-[#006eff]">
          <option value="">Fecha</option><option value="Hoy">Hoy</option><option value="Esta semana">Esta semana</option><option value="Este fin de semana">Este fin de semana</option>
        </select>
        <MaterialIcon name="expand_more" size={20} className="pointer-events-none absolute right-3 top-3.5 text-primary-600" />
      </label>

      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(v => !v)}
        className="flex h-12 min-w-0 items-center justify-center gap-2 rounded border border-[#006eff] bg-white px-3 text-[16px] text-primary-600 hover:bg-[#f2f7fc] focus-visible:outline-2">
        <span className="min-w-0 truncate">Más Filtros</span>
        {selectedCount > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#006eff] text-xs font-bold text-white">{selectedCount}</span>}
        <MaterialIcon name="tune" size={24}/>
      </button>
    </div>

    {selectedCount > 0 && <div aria-label="Filtros seleccionados" className="mt-4 flex flex-wrap items-center gap-2">
      {(['type','category','locality','date'] as const).flatMap(group => filters[group].map(value => (
        <button type="button" key={group+value} onClick={() => onFilters({ ...filters, [group]: filters[group].filter(x => x !== value) })}
          data-agenda-chip="selected" className="inline-flex min-h-[30px] items-center gap-2 rounded-[6px] bg-info-500 px-2.5 text-[14px] font-medium text-white hover:bg-[#005bd1]">
          {value}<MaterialIcon name="close" size={15}/>
        </button>
      )))}
      <button type="button" onClick={onReset} className="min-h-[30px] px-2 font-bold text-primary-600 underline-offset-2 hover:underline">Limpiar</button>
    </div>}

    {open && <AgendaFilterPanel value={filters} onChange={onFilters} onApply={() => setOpen(false)}
      onReset={onReset} onClose={() => setOpen(false)} />}
  </div>;
}
