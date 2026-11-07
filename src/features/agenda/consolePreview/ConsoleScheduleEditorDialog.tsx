import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { ConsoleVenueSelector } from './ConsoleVenueSelector';
import { ConsoleScheduleDateFields } from './ConsoleScheduleDateFields';
import { ConsoleScheduleAdditionalFields } from './ConsoleScheduleAdditionalFields';
import { useConsoleDialogFocus } from './useConsoleDialogFocus';
import type { ConsoleSchedule, ConsoleVenue } from './model';

import { normalizeConsoleSchedule, getConsoleScheduleValidationIssue, type ConsoleScheduleValidationIssue } from './scheduleEditorRules';

interface Props {
  schedule: ConsoleSchedule;
  mode: 'create' | 'edit' | 'duplicate';
  schedules: readonly ConsoleSchedule[];
  venues: readonly ConsoleVenue[];
  onCreateVenue: (venue: Omit<ConsoleVenue, 'id'>) => string;
  onSave: (value: ConsoleSchedule) => void;
  onClose: () => void;
}

/** Editor con scroll interior y acciones siempre visibles (desktop y mobile). */
export function ConsoleScheduleEditorDialog({
  schedule, mode, schedules, venues, onCreateVenue, onSave, onClose,
}: Props) {
  const [value, setValue] = useState<ConsoleSchedule>(() => ({ ...schedule, weekdays: [...schedule.weekdays] }));
  const [validationIssue, setValidationIssue] = useState<ConsoleScheduleValidationIssue | null>(null);
  const firstRef = useRef<HTMLSelectElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const update = (changes: Partial<ConsoleSchedule>) => {
    setValue(current => ({ ...current, ...changes }));
    setValidationIssue(null);
  };

  const { onKeyDown } = useConsoleDialogFocus({
    panelRef, initialFocusRef: firstRef, onClose,
  });

  useEffect(() => {
    if (!validationIssue) return;
    const selectors: Record<ConsoleScheduleValidationIssue['field'], string> = {
      startDate: '#console-schedule-start',
      startTime: '#console-schedule-start-time',
      endDate: '#console-schedule-end',
      weekdays: '#console-schedule-weekdays',
      endTime: '#console-schedule-end-time',
      schedule: '#console-schedule-error',
    };
    const target = validationIssue.field === 'schedule'
      ? errorRef.current
      : panelRef.current?.querySelector<HTMLElement>(selectors[validationIssue.field]);
    target?.focus();
  }, [validationIssue]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeConsoleSchedule(value);
    const issue = getConsoleScheduleValidationIssue(normalized, schedules);
    if (issue) {
      setValidationIssue(issue);
      return;
    }
    onSave(normalized);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-hidden bg-[#102c40]/65 p-0 sm:p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="schedule-editor-heading"
        onKeyDown={onKeyDown} data-testid="console-schedule-editor"
        className="flex h-full max-h-[100dvh] w-full max-w-[850px] min-h-0 flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[calc(100dvh-32px)] sm:rounded-[12px]">
        <header className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-[#d4e2eb] bg-white px-4 py-4 sm:px-6">
          <div>
            <h2 id="schedule-editor-heading" className="text-[24px] font-bold leading-8 text-primary-600">
              {mode === 'edit' ? 'Editar programación' : mode === 'duplicate' ? 'Duplicar programación' : 'Agregar programación'}
            </h2>
            <p className="mt-1 text-[15px] leading-6 text-[#647789]">
              {mode === 'duplicate'
                ? 'Revisá los datos de la copia y guardala cuando tenga la programación correcta.'
                : 'Definí la fecha, los horarios, la sede y los participantes de este encuentro.'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar edición de programación"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-primary-600 hover:bg-[#edf5fa] focus-visible:outline-2 focus-visible:outline-primary-600">
            <MaterialIcon name="close" size={24}/>
          </button>
        </header>

        <form id="console-schedule-form" onSubmit={handleSave} noValidate aria-label="Formulario de programación"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <ConsoleScheduleDateFields
            value={value}
            onScheduleChange={update}
            selectRef={firstRef}
            invalidField={validationIssue?.field}
          />
          <ConsoleVenueSelector
            venueId={value.venueId}
            venues={venues}
            onVenueChange={venueId => update({ venueId })}
            onCreateVenue={onCreateVenue}
          />
          <ConsoleScheduleAdditionalFields
            value={value}
            onScheduleChange={update}
          />
          {validationIssue && <p ref={errorRef} id="console-schedule-error" tabIndex={-1} role="alert" data-testid="console-schedule-error" className="rounded-[6px] bg-[#fff1f2] p-3 text-[14px] font-medium text-[#9d2936]">{validationIssue.message}</p>}
        </form>
        <footer className="z-10 flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#d4e2eb] bg-white px-4 py-4 sm:px-6">
          <button type="button" onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center rounded-[6px] border border-primary-600 px-5 text-[16px] font-bold text-primary-600 hover:bg-[#edf5fa]">
            Cancelar
          </button>
          <button form="console-schedule-form" type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] bg-primary-600 px-5 text-[16px] font-bold text-white hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600">
            <MaterialIcon name="check" size={20}/>
            {mode === 'duplicate' ? 'Crear copia' : 'Guardar programación'}
          </button>
        </footer>
      </section>
    </div>
  );
}
