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
  value, onChange,
}: { value: AgendaSortValue; onChange: (sort: AgendaSortValue) => void }) {
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
