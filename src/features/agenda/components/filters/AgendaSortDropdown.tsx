import { useId, useRef, useState } from 'react';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';
import { AgendaSheetBackdrop, AgendaSheetHeader } from '../../../../components/agenda/AgendaMobileSheet';
import { useAgendaMobileScrollLock } from '../../../../components/agenda/useAgendaMobileScrollLock';
import { useAgendaSheetDismiss } from '../../../../components/agenda/useAgendaSheetDismiss';
import { useAgendaOutsideDismiss } from '../../hooks/useAgendaOutsideDismiss';
import type { AgendaSortValue } from '../../model/sort';

const sortOptions: { value: AgendaSortValue; text: string }[] = [
  { value: 'default', text: 'Orden predeterminado' },
  { value: 'az', text: 'Alfabético A-Z' },
  { value: 'za', text: 'Alfabético Z-A' },
];

export function AgendaSortDropdown({
  value, onChange, options = sortOptions, title = 'Ordenar actividades', ghost = false,
}: { value: AgendaSortValue; onChange: (sort: AgendaSortValue) => void;
  options?: { value: AgendaSortValue; text: string }[]; title?: string; ghost?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  useAgendaMobileScrollLock(isOpen);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLDivElement>(isOpen, () => setIsOpen(false));
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useAgendaOutsideDismiss(isOpen, rootRef, buttonRef, dismiss);

  return (
    <div ref={rootRef} className="relative">
      <button type="button" ref={buttonRef} aria-expanded={isOpen}
        aria-haspopup="true" aria-controls={menuId} aria-label="Ordenar"
        onClick={() => { if (isOpen) dismiss(); else setIsOpen(true); }}
        className={`agenda-motion-control inline-flex h-12 items-center justify-center gap-2 px-4 text-[18px]
          transition-colors hover:bg-[#f2f7fc] focus-visible:outline-2 focus-visible:outline-primary-600
          ${ghost ? 'rounded border border-transparent bg-transparent text-primary-600' : 'rounded-full border border-[#d9d9d9] bg-white px-5 text-grey-900'}`}>
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
          <AgendaSheetHeader title={title} onClose={dismiss} />
          {options.map(option => (
            <button type="button" key={option.value}
              aria-pressed={value === option.value}
              onClick={() => { onChange(option.value); dismiss(); buttonRef.current?.focus(); }}
              className={`agenda-motion-option flex min-h-12 w-full items-center justify-between gap-4 rounded px-4 py-2
                text-left text-[16px] leading-6 transition-colors duration-150
                focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600
                ${value === option.value ? 'bg-info-500 font-bold text-white hover:bg-[#005bd1]' : 'bg-white text-primary-600 hover:bg-[#f2f7fc]'}`}>
              <span className="whitespace-nowrap">{option.text}</span>
              <span aria-hidden="true" className={`agenda-motion-check grid size-5 shrink-0 place-items-center rounded-[2px] border-2 ${value === option.value ? 'border-white text-white' : 'border-primary-600 bg-white text-primary-600'}`}>
                {value === option.value && <MaterialIcon name="check" size={16} className="text-white"/>}
              </span>
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
