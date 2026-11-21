import { useState, type RefObject } from 'react';
import { useAgendaViewportPopover } from '../../features/agenda/hooks/useAgendaViewportPopover';
import { MaterialIcon } from '../ui/MaterialIcon';
import { AgendaSheetBackdrop, AgendaSheetHeader } from './AgendaMobileSheet';
import { useAgendaMobileScrollLock } from './useAgendaMobileScrollLock';
import { useAgendaSheetDismiss } from './useAgendaSheetDismiss';

/** Panel visual compartido: Agenda y Trámites mantienen sus propios modelos de filtro. */
export type AgendaFilterGroupOption = {
  key: string;
  title: string;
  options: readonly string[];
  selected: readonly string[];
  optionCounts?: Readonly<Record<string, number>>;
  /** Por defecto Agenda mantiene su selección múltiple actual. */
  selectionControl?: 'checkbox' | 'radio';
};

type Props = {
  groups: readonly AgendaFilterGroupOption[];
  dialogId: string;
  ariaLabel: string;
  title: string;
  resultCount: number;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onToggle: (group: string, option: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

export function AgendaFilterGroupPanel({
  groups, dialogId, ariaLabel, title, resultCount, anchorRef,
  onToggle, onApply, onReset, onClose,
}: Props) {
  const [expanded, setExpanded] = useState<string[]>(groups[0] ? [groups[0].key] : []);
  useAgendaMobileScrollLock(true);
  const { sheetRef, dismiss } = useAgendaSheetDismiss<HTMLElement>(true, onClose);
  useAgendaViewportPopover(true, anchorRef, sheetRef);

  return <>
    <AgendaSheetBackdrop onClose={dismiss} />
    <section ref={sheetRef} id={dialogId} data-agenda-sheet="more"
      role="dialog" aria-modal="false" aria-label={ariaLabel}
      className="agenda-dropdown-enter agenda-mobile-sheet agenda-filter-popover agenda-more-panel fixed inset-x-4 top-20 bottom-4 z-50 flex w-auto flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white shadow-xl">
      <AgendaSheetHeader title={title} onClose={dismiss} showCloseButton={false} />
      <div className="agenda-filter-options min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {groups.map(group => <section key={group.key}
          className="agenda-filter-section border-b border-[#e7edf2] py-3 first:pt-4 last:border-0">
          <button type="button"
            className="agenda-motion-control flex min-h-11 w-full items-center justify-between rounded px-2 text-left text-[19px] font-bold text-primary-600 hover:bg-[#eff7fd]"
            aria-expanded={expanded.includes(group.key)}
            onClick={() => setExpanded(prev => prev.includes(group.key)
              ? prev.filter(key => key !== group.key) : [...prev, group.key])}>
            {group.title}
            <MaterialIcon name="expand_more" size={24}
              className={'agenda-motion-chevron ' + (expanded.includes(group.key) ? 'rotate-180' : '')} />
          </button>
          {expanded.includes(group.key) && <div
            className="agenda-motion-accordion mt-2 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
            {group.options.map(option => {
              const checked = group.selected.includes(option);
              const disabled = group.optionCounts !== undefined && (group.optionCounts[option] ?? 0) === 0 && !checked;
              const isRadio = group.selectionControl === 'radio';
              return <label key={option}
                className={`agenda-motion-option relative flex min-h-12 cursor-pointer items-center gap-3 rounded
                  px-2 py-2 text-[16px] leading-6 text-grey-900 transition-colors duration-150
                  ${disabled ? 'cursor-not-allowed text-grey-400' : 'hover:bg-[#eff7fd]'} has-[:focus-visible]:outline-2
                  has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-primary-600`}>
                <input type={isRadio ? 'radio' : 'checkbox'}
                  name={isRadio ? dialogId + '-' + group.key : undefined}
                  className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  checked={checked} disabled={disabled} onClick={(event) => { if (isRadio && checked) { event.preventDefault(); onToggle(group.key, option); } }} onChange={() => { if (!checked || !(isRadio)) onToggle(group.key, option); }}
                  aria-label={option} />
                <MaterialIcon
                  name={isRadio ? (checked ? 'radio_button_checked' : 'radio_button_unchecked') : (checked ? 'check_box' : 'check_box_outline_blank')}
                  size={24} weight={400}
                  className={`agenda-motion-check pointer-events-none relative z-10 ${disabled ? "text-grey-400" : "text-primary-600"}`}
                />
                <span className={`min-w-0 flex-1 ${checked ? 'font-bold' : 'font-normal'}`}>{option}</span>
                {group.optionCounts && <span aria-hidden="true" className={`shrink-0 text-[14px] tabular-nums ${disabled ? "text-grey-400" : "text-grey-900"}`}>{group.optionCounts[option] ?? 0}</span>}
              </label>;
            })}
          </div>}
        </section>)}
      </div>
      <div className="flex flex-none gap-2 border-t border-[#e7e7e7] bg-white p-4">
        <button type="button"
          onClick={() => { if (window.matchMedia('(max-width: 680px)').matches) dismiss(); else onApply(); }}
          className="min-h-12 min-w-0 flex-1 rounded bg-primary-600 px-4 font-bold text-white hover:bg-primary-700">
          Ver resultados ({resultCount})
        </button>
        <button type="button" onClick={onReset}
          className="min-h-12 shrink-0 rounded border border-primary-600 bg-white px-4 font-bold text-primary-600 hover:bg-[#f3f7fc]">
          Limpiar
        </button>
      </div>
    </section>
  </>;
}
