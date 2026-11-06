import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import {
  DEMO_VENUES, WEEKDAYS, venueById, type ConsoleSchedule,
} from './model';

const inputClass = 'min-h-12 w-full min-w-0 rounded-[4px] border border-[#93bfe0] bg-white px-4 py-2.5 text-[16px] leading-6 text-[#236999] outline-none placeholder:text-[#8baac3] focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-[#236999]/20';

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-1.5 block text-[16px] font-bold leading-6 text-primary-600">{label}</label>
    {children}
  </div>;
}

export function ConsoleScheduleEditorDialog({
  schedule, mode, onSave, onClose,
}: {
  schedule: ConsoleSchedule;
  mode: 'create' | 'edit';
  onSave: (value: ConsoleSchedule) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState<ConsoleSchedule>(() => ({ ...schedule, weekdays: [...schedule.weekdays] }));
  const firstRef = useRef<HTMLSelectElement>(null);
  const update = (changes: Partial<ConsoleSchedule>) =>
    setValue(current => ({ ...current, ...changes }));
  const venue = venueById(value.venueId);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const handleSave = (event: import('react').FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      ...value,
      weekdays: value.scheduleType === 'recurring' ? value.weekdays : [],
      endDate: value.scheduleType === 'exact' ? '' : value.endDate,
      participants: value.participants.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-[#102c40]/65 p-0 sm:p-5"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="schedule-editor-heading"
        data-testid="console-schedule-editor"
        className="w-full max-w-[926px] bg-white shadow-xl sm:my-auto sm:rounded-[12px]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d4e2eb] bg-white px-4 py-4 sm:rounded-t-[12px] sm:px-6">
          <div>
            <h2 id="schedule-editor-heading" className="text-[24px] font-bold leading-8 text-primary-600">
              {mode === 'create' ? 'Agregar programación' : 'Editar programación'}
            </h2>
            <p className="mt-1 text-[15px] leading-6 text-[#647789]">
              Definí la fecha, los horarios, la sede y los participantes de este encuentro.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar edición de programación"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-primary-600 hover:bg-[#edf5fa] focus-visible:outline-2 focus-visible:outline-primary-600">
            <MaterialIcon name="close" size={24}/>
          </button>
        </div>
        <form onSubmit={handleSave} aria-label="Formulario de programación"
          className="space-y-4 px-4 py-6 sm:px-6">
          <Field id="console-schedule-kind" label="Tipo de fecha">
            <select ref={firstRef} id="console-schedule-kind" className={inputClass}
              value={value.scheduleType}
              onChange={event => {
                const scheduleType = event.target.value as ConsoleSchedule['scheduleType'];
                update({
                  scheduleType,
                  weekdays: scheduleType === 'recurring' ? (value.weekdays.length ? value.weekdays : [6]) : [],
                });
              }}>
              <option value="exact">Fecha puntual</option>
              <option value="range">Período</option>
              <option value="recurring">Recurrente</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="console-schedule-start" label={value.scheduleType === 'exact' ? 'Fecha' : 'Desde'}>
              <input id="console-schedule-start" type="date" lang="es-AR" className={inputClass}
                value={value.startDate} onChange={event => update({ startDate: event.target.value })}/>
            </Field>
            {value.scheduleType !== 'exact' && (
              <Field id="console-schedule-end" label="Hasta">
                <input id="console-schedule-end" type="date" lang="es-AR" className={inputClass}
                  value={value.endDate} onChange={event => update({ endDate: event.target.value })}/>
              </Field>
            )}
          </div>
          {value.scheduleType === 'recurring' && (
            <fieldset>
              <legend className="mb-2 text-[16px] font-bold text-primary-600">Se repite los días</legend>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {WEEKDAYS.map(day => {
                  const selected = value.weekdays.includes(day.number);
                  return <button key={day.number} type="button" aria-pressed={selected}
                    aria-label={'Todos los ' + day.short}
                    onClick={() => update({ weekdays: selected
                      ? value.weekdays.filter(item => item !== day.number)
                      : [...value.weekdays, day.number].sort((a, b) => a - b) })}
                    className={'min-h-11 rounded-[6px] border px-1 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-primary-600 ' +
                      (selected ? 'border-[#80b4db] bg-[#dceefa] text-primary-600' :
                        'border-[#d6e2eb] bg-white text-[#8294a4] hover:border-[#93bfe0]')}>
                    {day.short}
                  </button>;
                })}
              </div>
            </fieldset>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="console-schedule-start-time" label="Horario de inicio">
              <input id="console-schedule-start-time" type="time" lang="es-AR" className={inputClass}
                value={value.startTime} onChange={event => update({ startTime: event.target.value })}/>
            </Field>
            <Field id="console-schedule-end-time" label="Horario de fin (opcional)">
              <input id="console-schedule-end-time" type="time" lang="es-AR" className={inputClass}
                value={value.endTime} onChange={event => update({ endTime: event.target.value })}/>
            </Field>
          </div>
          <Field id="console-schedule-venue" label="Lugar">
            <select id="console-schedule-venue" value={value.venueId} className={inputClass}
              onChange={event => update({ venueId: event.target.value })}>
              {DEMO_VENUES.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
            </select>
          </Field>
          <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[14px] leading-6 text-[#5d7182]">
            <dt>Localidad</dt><dd>{venue.locality}</dd>
            <dt>Dirección</dt><dd>{venue.address}</dd>
            <dt>Google Maps</dt><dd>
              <a href={'https://www.google.com/maps/search/?api=1&query=' +
                encodeURIComponent(venue.address + ', ' + venue.locality + ', Buenos Aires, Argentina')}
                target="_blank" rel="noopener noreferrer"
                className="font-medium text-primary-600 underline underline-offset-2">
                Ver ubicación <MaterialIcon name="arrow_forward" size={16} className="inline"/>
              </a>
            </dd>
          </dl>
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
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf0f3] pt-5">
            <button type="button" onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-primary-600 px-5 text-[16px] font-bold text-primary-600 hover:bg-[#edf5fa]">
              Cancelar
            </button>
            <button type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] bg-primary-600 px-5 text-[16px] font-bold text-white hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600">
              <MaterialIcon name="check" size={20}/> Guardar programación
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
