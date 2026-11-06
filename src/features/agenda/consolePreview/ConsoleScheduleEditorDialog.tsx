import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { Field, inputClass } from './ConsoleScheduleFormPrimitives';
import { ConsoleVenueSelector } from './ConsoleVenueSelector';
import { ConsoleScheduleDateFields } from './ConsoleScheduleDateFields';
import type { ConsoleSchedule, ConsoleVenue } from './model';

import { normalizeConsoleSchedule, validateConsoleSchedule } from './scheduleEditorRules';

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
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLSelectElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const update = (changes: Partial<ConsoleSchedule>) => {
    setValue(current => ({ ...current, ...changes }));
    setError('');
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  // El foco no puede escapar del modal durante la edición.
  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const buttons = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]',
    ) ?? []).filter(el => el.getClientRects().length > 0);
    if (buttons.length === 0) return;
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeConsoleSchedule(value);
    const validationError = validateConsoleSchedule(normalized, schedules);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(normalized);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-hidden bg-[#102c40]/65 p-0 sm:p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="schedule-editor-heading"
        onKeyDown={trapFocus} data-testid="console-schedule-editor"
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
          />
          <ConsoleVenueSelector
            venueId={value.venueId}
            venues={venues}
            onVenueChange={venueId => update({ venueId })}
            onCreateVenue={onCreateVenue}
          />
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
            <input type="checkbox" checked={value.suspendedByRain}
              onChange={event => update({ suspendedByRain: event.target.checked })}
              className="h-5 w-5 accent-[#236999]"/> Se suspende por lluvia
          </label>
          <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <Field id="console-schedule-participants-type" label="Participantes (tipo)">
              <select id="console-schedule-participants-type" className={inputClass}
                value={value.participantsType} onChange={event =>
                  update({ participantsType: event.target.value as ConsoleSchedule['participantsType'] })}>
                <option value="artists">Artistas</option>
                <option value="speakers">Oradores</option>
                <option value="participants">Otros participantes</option>
              </select>
            </Field>
            <Field id="console-schedule-participants" label="Artistas, oradores o participantes (opcional)">
              <textarea id="console-schedule-participants" rows={2} className={inputClass + ' resize-y'}
                placeholder="Ej.: Andrea Gauna, Lautaro Rotela"
                value={value.participants} onChange={event => update({ participants: event.target.value })}/>
            </Field>
          </div>
          <Field id="console-schedule-detail" label="Detalle de esta programación (opcional)">
            <textarea id="console-schedule-detail" rows={3} className={inputClass + ' resize-y'}
              placeholder="Información específica de esta fecha, si corresponde"
              value={value.detail} onChange={event => update({ detail: event.target.value })}/>
          </Field>
          {error && <p role="alert" data-testid="console-schedule-error" className="rounded-[6px] bg-[#fff1f2] p-3 text-[14px] font-medium text-[#9d2936]">{error}</p>}
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
