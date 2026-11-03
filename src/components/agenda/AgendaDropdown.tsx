import { useEffect, useId, useRef, useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { AgendaSheetBackdrop, AgendaSheetHeader } from './AgendaMobileSheet';
import { useAgendaMobileScrollLock } from './useAgendaMobileScrollLock';
import { useAgendaSheetDismiss } from './useAgendaSheetDismiss';

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  align?: 'start' | 'end' | 'end-responsive';
};

/**
 * Selectores de Agenda: misma jerarquía visual que el componente Opciones
 * de MLZ UI KIT, con buscador y acciones explícitas.
 */
export function AgendaDropdown({
  label, options, selected, onChange, multiple = false, align = 'start',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  useAgendaMobileScrollLock(isOpen);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLElement>(isOpen, () => setIsOpen(false));
  const [search, setSearch] = useState('');
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, dismiss]);

  useEffect(() => {
    if (isOpen && !window.matchMedia('(max-width: 680px)').matches) searchRef.current?.focus();
  }, [isOpen, dismiss]);

  const visibleOptions = options.filter(option =>
    option.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().includes(search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()),
  );
  const shownLabel = selected.length === 0 ? label
    : selected.length === 1 ? selected[0]!
      : `${label} (${selected.length})`;

  const toggle = (option: string) => {
    if (multiple) {
      onChange(selected.includes(option)
        ? selected.filter(item => item !== option) : [...selected, option]);
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
        onClick={() => { if (isOpen) dismiss(); else { setSearch(''); setIsOpen(true); } }}
        className={`agenda-motion-control flex h-12 w-full min-w-0 items-center gap-3 rounded border border-[#80baff] bg-white
          py-2 pl-4 pr-4 text-left text-[16px] text-primary-600 outline-offset-2
          transition-colors duration-150 hover:border-[#006eff]
          focus-visible:outline-2 focus-visible:outline-[#006eff]
          ${isOpen ? 'border-[#006eff]' : ''}`}
      >
        <span className="min-w-0 flex-1 truncate">{shownLabel}</span>
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
          className={`agenda-dropdown-enter agenda-mobile-sheet absolute top-[calc(100%+8px)] z-40 flex
            max-h-[min(72vh,430px)] w-[min(416px,calc(100vw-32px))] flex-col
            overflow-hidden rounded-md border border-[#e1e7eb] bg-white p-2
            shadow-[0_4px_14px_rgba(0,0,0,0.16)]
            ${align === 'end' ? 'right-0' : align === 'end-responsive' ? 'left-0 md:left-auto md:right-0' : 'left-0'}`}
        >
          <AgendaSheetHeader title={label} onClose={dismiss} />
          <label className="relative mb-2 block shrink-0">
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
          </label>

          <div role="group" aria-label={`Seleccionar ${label.toLowerCase()}`}
            className="min-h-0 flex-1 space-y-[2px] overflow-y-auto">
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
              Ver resultados
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

export type AgendaSortValue = 'default' | 'az' | 'za';

const sortOptions: { value: AgendaSortValue; text: string }[] = [
  { value: 'default', text: 'Orden predeterminado' },
  { value: 'az', text: 'Alfabético A-Z' },
  { value: 'za', text: 'Alfabético Z-A' },
];

export function AgendaSortDropdown({
  value, onChange,
}: { value: AgendaSortValue; onChange: (sort: AgendaSortValue) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  useAgendaMobileScrollLock(isOpen);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLDivElement>(isOpen, () => setIsOpen(false));
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, dismiss]);

  return (
    <div ref={rootRef} className="relative">
      <button type="button" ref={buttonRef} aria-expanded={isOpen}
        aria-haspopup="true" aria-controls={menuId} aria-label="Ordenar"
        onClick={() => { if (isOpen) dismiss(); else setIsOpen(true); }}
        className="agenda-motion-control inline-flex h-12 items-center justify-center gap-2 rounded-full
          border border-[#d9d9d9] bg-white px-5 text-[18px] text-grey-900
          transition-colors hover:bg-[#f2f7fc]
          focus-visible:outline-2 focus-visible:outline-primary-600">
        <MaterialIcon name="swap_vert" size={24}/>
        <span>Ordenar</span>
      </button>
      {isOpen && (
        <>
          <AgendaSheetBackdrop onClose={dismiss} />
        <div ref={sheetRef} id={menuId} data-agenda-sheet="sort" role="group" aria-label="Opciones para ordenar"
          className="agenda-dropdown-enter agenda-mobile-sheet absolute right-0 top-[calc(100%+8px)] z-40
            w-max min-w-[210px] max-w-[calc(100vw-32px)] overflow-hidden rounded-md
            border border-[#e1e7eb] bg-white py-2 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <AgendaSheetHeader title="Ordenar actividades" onClose={dismiss} />
          {sortOptions.map(option => (
            <button type="button" key={option.value}
              aria-pressed={value === option.value}
              onClick={() => { onChange(option.value); dismiss(); buttonRef.current?.focus(); }}
              className={`flex min-h-11 w-full items-center justify-between gap-4 px-4
                text-left text-[16px] text-primary-600 transition-colors hover:bg-[#f2f7fc]
                ${value === option.value ? 'bg-[#e5f0ff] font-bold' : ''}`}>
              <span className="whitespace-nowrap">{option.text}</span>
              {value === option.value && <MaterialIcon name="check" size={18}/>}
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
