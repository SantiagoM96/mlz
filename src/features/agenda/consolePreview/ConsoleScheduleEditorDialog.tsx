import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import type { ConsoleSchedule, ConsoleVenue } from './model';
import { WEEKDAYS } from './demoData';
import { sameScheduleContent, venueById } from './scheduleRules';

const inputClass = 'min-h-12 w-full min-w-0 rounded-[6px] border border-[#93bfe0] bg-white px-4 py-2.5 text-[16px] leading-6 text-[#236999] outline-none placeholder:text-[#8baac3] focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-[#236999]/20';

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-1.5 block text-[16px] font-bold leading-6 text-primary-600">{label}</label>
    {children}
  </div>;
}

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
  const [addingVenue, setAddingVenue] = useState(false);
  const [venueFields, setVenueFields] = useState({ name: '', locality: '', address: '' });
  const [venueError, setVenueError] = useState('');
  const firstRef = useRef<HTMLSelectElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const update = (changes: Partial<ConsoleSchedule>) => {
    setValue(current => ({ ...current, ...changes }));
    setError('');
  };
  const venue = venueById(value.venueId, venues);

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

  const addVenue = () => {
    const next = {
      name: venueFields.name.trim().replace(/\s+/g, ' '),
      locality: venueFields.locality.trim().replace(/\s+/g, ' '),
      address: venueFields.address.trim().replace(/\s+/g, ' '),
    };
    if (!next.name || !next.locality || !next.address) {
      setVenueError('Completá nombre, localidad y dirección para guardar la sede.');
      return;
    }
    if (venues.some(item => item.name.toLocaleLowerCase('es-AR') === next.name.toLocaleLowerCase('es-AR')
      && item.locality.toLocaleLowerCase('es-AR') === next.locality.toLocaleLowerCase('es-AR'))) {
      setVenueError('Esta sede ya está registrada. Seleccionala en la lista.');
      return;
    }
    const id = onCreateVenue(next);
    update({ venueId: id });
    setVenueError('');
    setAddingVenue(false);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized: ConsoleSchedule = {
      ...value,
      startDate: value.startDate.trim(),
      endDate: value.scheduleType === 'exact' ? '' : value.endDate.trim(),
      weekdays: value.scheduleType === 'recurring' ? [...new Set(value.weekdays)].sort((a,b) => a-b) : [],
      participants: value.participants.trim(),
      detail: value.detail.trim(),
    };
    if (!normalized.startDate || !normalized.startTime) {
      setError('Completá la fecha y el horario de inicio.'); return;
    }
    if (normalized.scheduleType !== 'exact' &&
        (!normalized.endDate || normalized.endDate < normalized.startDate)) {
      setError('La fecha de fin debe ser igual o posterior a la fecha de inicio.'); return;
    }
    if (normalized.scheduleType === 'recurring' && normalized.weekdays.length === 0) {
      setError('Seleccioná al menos un día para la recurrencia.'); return;
    }
    if (normalized.endTime && normalized.endTime <= normalized.startTime) {
      setError('El horario de fin debe ser posterior al horario de inicio.'); return;
    }
    if (schedules.some(item => item.id !== normalized.id && sameScheduleContent(item, normalized))) {
      setError('Ya existe una programación idéntica. Modificá la fecha, el horario, la sede o sus datos particulares.');
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
          <Field id="console-schedule-kind" label="Tipo de fecha">
            <select ref={firstRef} id="console-schedule-kind" className={inputClass}
              value={value.scheduleType}
              onChange={event => {
                const scheduleType = event.target.value as ConsoleSchedule['scheduleType'];
                update({ scheduleType,
                  weekdays: scheduleType === 'recurring' ? (value.weekdays.length ? value.weekdays : [6]) : [] });
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
          <div className="space-y-2">
            <Field id="console-schedule-venue" label="Lugar">
              <select id="console-schedule-venue" value={value.venueId} className={inputClass}
                onChange={event => update({ venueId: event.target.value })}>
                {venues.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
              </select>
            </Field>
            <button type="button" onClick={() => { setAddingVenue(current => !current); setVenueError(''); }}
              className="inline-flex min-h-10 items-center gap-2 rounded-[6px] text-[15px] font-bold text-primary-600 hover:underline"
              aria-expanded={addingVenue}>
              <MaterialIcon name="add" size={20}/> Agregar nuevo lugar
            </button>
          </div>
          {addingVenue && (
            <section aria-label="Nuevo lugar" data-testid="console-new-venue"
              className="space-y-3 rounded-[8px] border border-[#c5dce9] bg-[#f5f9fc] p-4">
              <h3 className="font-bold text-primary-600">Nuevo lugar</h3>
              <Field id="console-venue-name" label="Nombre del lugar">
                <input id="console-venue-name" className={inputClass} value={venueFields.name}
                  onChange={event => { setVenueFields(v => ({ ...v, name: event.target.value })); setVenueError(''); }}
                  placeholder="Ej.: Centro Cultural del Barrio"/>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="console-venue-locality" label="Localidad">
                  <input id="console-venue-locality" className={inputClass} value={venueFields.locality}
                    onChange={event => { setVenueFields(v => ({ ...v, locality: event.target.value })); setVenueError(''); }}
                    placeholder="Ej.: Banfield"/>
                </Field>
                <Field id="console-venue-address" label="Dirección">
                  <input id="console-venue-address" className={inputClass} value={venueFields.address}
                    onChange={event => { setVenueFields(v => ({ ...v, address: event.target.value })); setVenueError(''); }}
                    placeholder="Calle y altura"/>
                </Field>
              </div>
              {venueError && <p role="alert" className="text-[14px] font-medium text-[#ac343e]">{venueError}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setAddingVenue(false)}
                  className="min-h-11 rounded-[6px] border border-primary-600 px-4 font-bold text-primary-600">Cancelar lugar</button>
                <button type="button" onClick={addVenue}
                  className="min-h-11 rounded-[6px] bg-primary-600 px-4 font-bold text-white">Guardar lugar</button>
              </div>
            </section>
          )}
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
