import { useEffect, useId, useRef, useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { toggleSelectedValue } from '../../features/agenda/model/filterState';
import { normalizeAgendaText } from '../../features/agenda/utils/normalizeAgendaText';
import { AgendaSheetBackdrop, AgendaSheetHeader } from './AgendaMobileSheet';
import { useAgendaMobileScrollLock } from './useAgendaMobileScrollLock';
import { useAgendaSheetDismiss } from './useAgendaSheetDismiss';
import { useAgendaOutsideDismiss } from '../../features/agenda/hooks/useAgendaOutsideDismiss';
import { useAgendaViewportPopover } from '../../features/agenda/hooks/useAgendaViewportPopover';
import { AgendaFilterCounter } from './AgendaFilterCounter';

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  resultCount: number;
  onChange: (values: string[]) => void;
  multiple?: boolean;
  align?: 'start' | 'end' | 'end-responsive';
};

/**
 * Selectores de Agenda: misma jerarquía visual que el componente Opciones
 * de MLZ UI KIT, con buscador y acciones explícitas.
 */
export function AgendaDropdown({
  label, options, selected, resultCount, onChange, multiple = false, align = 'start',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  useAgendaMobileScrollLock(isOpen);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLElement>(isOpen, () => setIsOpen(false));
  const [search, setSearch] = useState('');
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const showOptionSearch = label !== 'Fecha';

  useAgendaOutsideDismiss(isOpen, rootRef, buttonRef, dismiss);
  useAgendaViewportPopover(isOpen, buttonRef, sheetRef);

  useEffect(() => {
    if (isOpen && showOptionSearch && !window.matchMedia('(max-width: 680px)').matches) searchRef.current?.focus();
  }, [isOpen, showOptionSearch]);

  const visibleOptions = options.filter(option =>
    normalizeAgendaText(option).includes(normalizeAgendaText(search)),
  );
  const toggle = (option: string) => {
    if (multiple) {
      onChange(toggleSelectedValue(selected, option));
    } else {
      onChange(selected.includes(option) ? [] : [option]);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={buttonRef}
        type="button"
        data-testid={`agenda-dropdown-${label.toLowerCase()}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-description={selected.length
          ? `${selected.length} ${selected.length === 1 ? 'filtro seleccionado' : 'filtros seleccionados'}`
          : undefined}
        onClick={() => { if (isOpen) dismiss(); else { setSearch(''); setIsOpen(true); } }}
        className={`agenda-filter-trigger agenda-motion-control flex h-12 w-full min-w-0 items-center gap-2 rounded border border-[#5ba8d5] bg-white
          py-2 px-4 text-left text-[16px] text-primary-600 outline-offset-2
          transition-colors duration-150 hover:border-primary-600 hover:bg-[#f4f9fd]
          focus-visible:outline-2 focus-visible:outline-[#006eff]
          ${isOpen || selected.length ? 'agenda-filter-trigger-active' : ''}`}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <AgendaFilterCounter count={selected.length} />
        <MaterialIcon name="expand_more" size={20}
          className={`agenda-motion-chevron ml-auto shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <AgendaSheetBackdrop onClose={dismiss} />
        <section
          ref={sheetRef}
          id={menuId}
          data-agenda-sheet="filter"
          data-agenda-filter={label}
          role="dialog"
          aria-label={`Opciones de ${label}`}
          className={`agenda-dropdown-enter agenda-mobile-sheet agenda-filter-popover absolute top-[calc(100%+8px)] z-40 flex
            w-[min(416px,calc(100vw-32px))] flex-col
            overflow-hidden rounded-md border border-[#dfebf3] bg-white p-2
            shadow-[0_8px_24px_rgba(21,57,76,0.17)]
            ${align === 'end' ? 'right-0' : align === 'end-responsive' ? 'left-0 md:left-auto md:right-0' : 'left-0'}`}
        >
          <AgendaSheetHeader title={label} onClose={dismiss} showCloseButton={false} />
          {showOptionSearch && <label className="relative mb-2 block shrink-0">
            <span className="sr-only">{`Buscar ${label.toLowerCase()}`}</span>
            <input
              ref={searchRef}
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar"
              className="h-12 w-full rounded border border-[#80baff] bg-white
                py-2 pl-4 pr-11 text-[16px] text-primary-600
                placeholder:text-[#5ba8d5] focus:outline-2 focus:outline-[#006eff]"
            />
            <MaterialIcon name="search" size={22}
              className="pointer-events-none absolute right-3 top-3 text-primary-600" />
          </label>}

          <div role="group" aria-label={`Seleccionar ${label.toLowerCase()}`}
            className="agenda-filter-options min-h-0 flex-1 space-y-[2px] overflow-y-auto overscroll-contain">
            {visibleOptions.length ? visibleOptions.map(option => {
              const checked = selected.includes(option);
              return (
                <label key={option}
                  className={`agenda-motion-option relative flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded
                    px-4 py-2 text-[16px] leading-6 transition-colors duration-150
                    has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2
                    has-[:focus-visible]:outline-primary-600
                    ${checked ? 'bg-info-500 text-white hover:bg-[#005bd1]'
                      : 'bg-white text-primary-600 hover:bg-[#f2f7fc]'}`}
                >
                  <span className="min-w-0 flex-1">{option}</span>
                  <input type="checkbox" checked={checked} onChange={() => toggle(option)}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={option} />
                  <span aria-hidden="true"
                    className={`agenda-motion-check relative z-10 grid size-5 shrink-0 place-items-center rounded-[2px] border-2
                      ${checked ? 'border-white bg-transparent text-white' : 'border-primary-600 bg-white text-primary-600'}`}>
                    {checked && <MaterialIcon name="check" size={16} className="text-white" />}
                  </span>
                </label>
              );
            }) : (
              <p className="px-4 py-4 text-sm text-grey-900">No encontramos opciones</p>
            )}
          </div>

          <div className="mt-2 flex shrink-0 items-center gap-2 border-t border-[#e1e7eb] pt-2">
            <button type="button" onClick={dismiss}
              className="min-h-12 flex-1 rounded bg-primary-600 px-3 text-[16px] font-bold
                text-white transition-colors hover:bg-primary-700">
              Ver resultados ({resultCount})
            </button>
            <button type="button" onClick={() => { onChange([]); setSearch(''); }}
              className="min-h-12 shrink-0 rounded px-4 text-[16px] font-bold
                text-primary-600 transition-colors hover:bg-[#f2f7fc]">
              Limpiar
            </button>
          </div>
        </section>
        </>
      )}
    </div>
  );
}

/** Compatibilidad con consumidores previos mientras migran sus imports. */
export type { AgendaSortValue } from '../../features/agenda/model/sort';
export { AgendaSortDropdown } from '../../features/agenda/components/filters/AgendaSortDropdown';
