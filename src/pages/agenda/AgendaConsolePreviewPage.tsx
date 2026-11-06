import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { AgendaActivity } from '../../data/agenda';
import { agendaV2ExampleCases, agendaV2PreviewActivities } from '../../data/agenda-v2-previews';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { getPublicActivityViews } from '../../features/agenda/utils/publicActivityViews';
import { ConsoleDetailDialog } from '../../features/agenda/consolePreview/ConsoleDetailDialog';
import {
  CATEGORY_TYPES, DEMO_VENUES, INITIAL_DRAFT, INITIAL_SCHEDULES, WEEKDAYS,
  createDemoSchedule, venueById, type ConsoleDraft, type ConsoleSchedule,
} from '../../features/agenda/consolePreview/model';

const inputClass = 'min-h-12 w-full min-w-0 rounded-[4px] border border-[#93bfe0] bg-white px-4 py-2.5 text-[16px] leading-6 text-[#236999] outline-none transition-colors placeholder:text-[#8baac3] focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-[#236999]/20';
const labelClass = 'mb-1.5 block text-[16px] font-bold leading-6 text-primary-600';
const noteClass = 'mt-2 text-[14px] leading-[21px] text-[#718092]';

function FormField({ label, htmlFor, children, hint }: {
  label: string; htmlFor: string; children: ReactNode; hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className={noteClass}>{hint}</p>}
    </div>
  );
}

function SectionTitle({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[24px] font-bold leading-[30px] text-primary-600">
        {number}. {title}
      </h2>
      {subtitle && <p className="mt-1 text-[16px] leading-6 text-grey-900">{subtitle}</p>}
    </div>
  );
}

function scheduleKindLabel(kind: ConsoleSchedule['scheduleType']) {
  return kind === 'exact' ? 'Fecha puntual' : kind === 'range' ? 'Período' : 'Recurrente';
}

function dateForDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'Fecha a confirmar';
  const [year, month, day] = iso.split('-');
  return day + '/' + month + '/' + year;
}

function scheduleSummary(schedule: ConsoleSchedule): string {
  const days: Record<number, string> = {
    1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves',
    5: 'viernes', 6: 'sábados', 7: 'domingos',
  };
  const selected = [...schedule.weekdays].sort((a, b) => a - b).map(day => days[day]).filter(Boolean);
  const recurrence = selected.length === 1
    ? 'Todos los ' + selected[0]
    : selected.length > 1
      ? 'Todos los ' + selected.slice(0, -1).join(', ') + ' y ' + selected[selected.length - 1]
      : 'Días a confirmar';
  const dates = schedule.scheduleType === 'exact'
    ? dateForDisplay(schedule.startDate)
    : schedule.scheduleType === 'recurring'
      ? recurrence + ' · Del ' + dateForDisplay(schedule.startDate) + ' al ' + dateForDisplay(schedule.endDate)
      : 'Del ' + dateForDisplay(schedule.startDate) + ' al ' + dateForDisplay(schedule.endDate);
  const time = schedule.startTime
    ? schedule.startTime + (schedule.endTime ? ' a ' + schedule.endTime : '') + ' h'
    : 'Horario a confirmar';
  return dates + ' · ' + time + ' · ' + venueById(schedule.venueId).name;
}

function imageForDraft(draft: ConsoleDraft): string {
  if (draft.coverDataUrl) return draft.coverDataUrl;
  const byType: Record<string, string> = {
    Taller: draft.category === 'Ambiental' ? 'taller-ambiental' : 'taller',
    Música: 'musica', Teatro: 'teatro', Danza: 'danza', Cine: 'cine',
    Muestra: 'muestra', Entrenamiento: 'entrenamiento', Torneo: 'torneo',
    'Visita guiada': 'visita-guiada', Jornada: 'jornada', Charla: 'charla',
    Presentación: 'presentacion', Literatura: 'encuentro-literario',
    Aeróbica: 'aerobica', 'Cuerpo–mente': 'cuerpo-mente',
  };
  return import.meta.env.BASE_URL + 'assets/agenda/types/' +
    (byType[draft.type] ?? 'jornada') + '.png';
}

function makePreviewActivity(draft: ConsoleDraft, schedules: readonly ConsoleSchedule[]): AgendaActivity {
  const first = schedules[0];
  const venue = venueById(first?.venueId ?? '');
  const badges: AgendaActivity['badges'] = [];
  if (draft.inclusive) badges.push({ kind: 'accessible', label: 'Disciplina inclusiva' });
  if (draft.registrationMode !== 'none') badges.push({ kind: 'registration', label: 'Requiere inscripción' });
  if (draft.featured) badges.push({ kind: 'featured', label: 'Destacado' });
  return {
    id: 'demo-consola',
    title: draft.title.trim() || 'Título de la actividad',
    category: draft.category,
    type: draft.type,
    locality: venue.locality,
    dayLabel: 'Fecha a confirmar',
    timeLabel: 'Horario a confirmar',
    image: imageForDraft(draft),
    badges,
    description: draft.description,
    registrationMode: draft.registrationMode,
    registrationInformation: draft.registrationMode === 'none' ? undefined : draft.registrationInformation,
    // Los enlaces ingresados nunca se activan desde la vista previa.
    registrationUrl: undefined,
    schedules: schedules.map(schedule => {
      const selectedVenue = venueById(schedule.venueId);
      return {
        id: String(schedule.id),
        scheduleType: schedule.scheduleType,
        startDate: schedule.startDate,
        endDate: schedule.scheduleType !== 'exact' ? schedule.endDate : null,
        weekdays: schedule.scheduleType === 'recurring' ? schedule.weekdays : [],
        startTime: schedule.startTime,
        endTime: schedule.endTime || null,
        locality: selectedVenue.locality,
        venue: selectedVenue.name,
        address: selectedVenue.address + ' - ' + selectedVenue.locality,
        detail: schedule.detail,
        suspendedByRain: schedule.suspendedByRain,
      };
    }),
  };
}

function CardPreview({ draft, schedules, onViewDetail }: {
  draft: ConsoleDraft;
  schedules: ConsoleSchedule[];
  onViewDetail: (activity: AgendaActivity) => void;
}) {
  const editorialActivity = makePreviewActivity(draft, schedules);
  const publicViews = getPublicActivityViews(editorialActivity);

  return (
    <div>
      <h2 className="mb-2 text-[24px] font-bold leading-[30px] text-primary-600">Vista previa</h2>
      <p className="mb-5 text-[14px] leading-5 text-[#687f91]">
        {publicViews.length === 1
          ? 'Una ficha pública para esta actividad'
          : publicViews.length + ' fichas públicas, una por sede'}
      </p>
      <div className="flex min-w-0 flex-col gap-4">
        {publicViews.map(activity => (
          <div key={activity.id} data-testid="console-preview-card" className="min-w-0">
            <ActivityCard
              activity={activity}
              previewDateISO="1900-01-01"
              onViewDetail={() => onViewDetail(activity)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function getFigmaExamplePreset(id: string | null): {
  draft: ConsoleDraft; schedules: ConsoleSchedule[];
} | null {
  const activity = agendaV2PreviewActivities.find(value => value.id === id);
  if (!activity) return null;
  const badges = activity.badges;
  return {
    draft: {
      ...INITIAL_DRAFT,
      title: activity.title,
      category: activity.category,
      type: activity.type,
      description: activity.description ?? '',
      inclusive: badges.some(item => item.kind === 'accessible'),
      registrationMode: activity.registrationMode ?? 'none',
      registrationInformation: activity.registrationInformation ?? '',
      registrationUrl: activity.registrationMode === 'online'
        ? 'https://example.org/inscripcion-de-prueba' : '',
      featured: badges.some(item => item.kind === 'featured'),
      coverDataUrl: activity.image,
      galleryDataUrls: [],
    },
    schedules: (activity.schedules ?? []).map((schedule, index) => ({
      ...createDemoSchedule(index + 1),
      id: index + 1,
      scheduleType: schedule.scheduleType,
      startDate: schedule.startDate,
      endDate: schedule.endDate ?? '',
      weekdays: [...(schedule.weekdays ?? [])],
      startTime: schedule.startTime,
      endTime: schedule.endTime ?? '',
      venueId: DEMO_VENUES.find(venue => venue.name === schedule.venue)?.id ?? DEMO_VENUES[0].id,
      suspendedByRain: schedule.suspendedByRain ?? badges.some(item => item.kind === 'rain'),
      detail: schedule.detail ?? '',
    })),
  };
}

function readLocalImage(file: File | undefined, onReady: (dataUrl: string) => void) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') onReady(reader.result);
  };
  reader.readAsDataURL(file);
}

export function AgendaConsolePreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<ConsoleDraft>(
    () => getFigmaExamplePreset(searchParams.get('caso'))?.draft ?? { ...INITIAL_DRAFT },
  );
  const [schedules, setSchedules] = useState<ConsoleSchedule[]>(
    () => getFigmaExamplePreset(searchParams.get('caso'))?.schedules
      ?? INITIAL_SCHEDULES.map(s => ({ ...s, weekdays: [...s.weekdays] })),
  );
  const [expanded, setExpanded] = useState<number[]>([1]);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [detailPreview, setDetailPreview] = useState<AgendaActivity | null>(null);

  useEffect(() => {
    document.title = 'Consola · Vista previa | Agenda de la Comunidad';
  }, []);

  const updateDraft = (changes: Partial<ConsoleDraft>) => {
    setDraft(current => ({ ...current, ...changes }));
  };
  const updateSchedule = (id: number, changes: Partial<ConsoleSchedule>) => {
    setSchedules(current => current.map(s => s.id === id ? { ...s, ...changes } : s));
  };
  const addSchedule = () => {
    const nextId = Math.max(0, ...schedules.map(s => s.id)) + 1;
    setSchedules(current => [...current, createDemoSchedule(nextId)]);
    setExpanded(current => [...current, nextId]);
    setMobileView('form');
  };
  const removeSchedule = (id: number) => {
    setSchedules(current => current.filter(s => s.id !== id));
    setExpanded(current => current.filter(value => value !== id));
  };
  const changeCategory = (category: string) => {
    updateDraft({ category, type: CATEGORY_TYPES[category]?.[0] ?? 'Taller' });
  };
  const loadFigmaCase = (id: string) => {
    const preset = getFigmaExamplePreset(id);
    setSearchParams(id ? { caso: id } : {});
    setDraft(preset?.draft ?? { ...INITIAL_DRAFT });
    setSchedules(preset?.schedules
      ?? INITIAL_SCHEDULES.map(s => ({ ...s, weekdays: [...s.weekdays] })));
    setExpanded([1]);
    setMobileView('form');
    setDetailPreview(null);
  };

  return (
    <div className="min-h-screen bg-white text-grey-900">
      <a href="#contenido-principal" className="skip-link">Saltar al contenido</a>
      <main id="contenido-principal" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 min-[1232px]:px-0">
        <nav className="flex flex-wrap items-center gap-2 text-[15px] leading-6 text-grey-900" aria-label="Ruta de navegación">
          <Link className="rounded-sm text-primary-600 hover:underline focus-visible:outline-2" to="/agenda-de-la-comunidad/actividades">
            Agenda de la Comunidad
          </Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Nueva actividad</span>
        </nav>

        <div className="mb-6 mt-6">
          <h1 className="text-[28px] font-bold leading-9 text-primary-600">Nueva actividad</h1>
          <p className="mt-1 text-[16px] leading-6">Completá la información general y agregá todas las programaciones necesarias.</p>
        </div>

        <section aria-label="Actividades para cargar" className="mb-7 flex flex-col gap-3 rounded-[8px] border border-[#d4e1ea] bg-[#f5f9fc] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <label htmlFor="figma-preset" className={labelClass}>Cargar actividad</label>
            <select id="figma-preset" className={inputClass} value={searchParams.get('caso') ?? ''}
              onChange={event => loadFigmaCase(event.target.value)}>
              <option value="">Taller de compostaje · Inicial</option>
              {agendaV2ExampleCases.map(example => {
                const activity = agendaV2PreviewActivities.find(item => item.id === example.id);
                return <option key={example.id} value={example.id}>
                  {example.label} · {activity?.title ?? ''}
                </option>;
              })}
            </select>
                      </div>
          <Link to="/agenda-de-la-comunidad/actividades"
            className="inline-flex min-h-11 shrink-0 items-center rounded-[4px] px-2 text-[15px] font-bold text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
            Ver en la Agenda
          </Link>
        </section>

        <div className="mb-6 flex gap-2 rounded-[8px] border border-[#dce7ee] bg-[#f6f9fb] p-1.5 lg:hidden" aria-label="Cambiar vista">
          <button type="button" onClick={() => setMobileView('form')}
            aria-pressed={mobileView === 'form'}
            className={'min-h-11 flex-1 rounded-[6px] px-3 text-[16px] font-bold focus-visible:outline-2 focus-visible:outline-primary-600 ' +
              (mobileView === 'form' ? 'bg-primary-600 text-white' : 'text-primary-600')}>
            Formulario
          </button>
          <button type="button" onClick={() => setMobileView('preview')}
            aria-pressed={mobileView === 'preview'}
            className={'min-h-11 flex-1 rounded-[6px] px-3 text-[16px] font-bold focus-visible:outline-2 focus-visible:outline-primary-600 ' +
              (mobileView === 'preview' ? 'bg-primary-600 text-white' : 'text-primary-600')}>
            Vista previa
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,860px)_minmax(0,316px)]">
          <form onSubmit={event => event.preventDefault()}
            className={'min-w-0 space-y-8 ' + (mobileView === 'preview' ? 'hidden lg:block' : '')}
            aria-label="Formulario de nueva actividad">
            <section aria-labelledby="console-information">
              <div id="console-information"><SectionTitle number={1} title="Información general" /></div>
              <div className="space-y-4">
                <FormField label="Título" htmlFor="console-title">
                  <input id="console-title" className={inputClass} value={draft.title}
                    onChange={event => updateDraft({ title: event.target.value })} placeholder="Nombre de la actividad" />
                </FormField>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <FormField label="Categoría" htmlFor="console-category">
                    <select id="console-category" className={inputClass} value={draft.category}
                      onChange={event => changeCategory(event.target.value)}>
                      {Object.keys(CATEGORY_TYPES).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Tipo de actividad" htmlFor="console-type">
                    <select id="console-type" className={inputClass} value={draft.type}
                      onChange={event => updateDraft({ type: event.target.value })}>
                      {(CATEGORY_TYPES[draft.category] ?? []).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </FormField>
                </div>
                <FormField label="Descripción general" htmlFor="console-description">
                  <textarea id="console-description" rows={4} className={inputClass + ' min-h-[120px] resize-y'}
                    value={draft.description} onChange={event => updateDraft({ description: event.target.value })}
                    placeholder="Contá de qué se trata la actividad" />
                </FormField>
                <div className="space-y-3 pt-1">
                  <label className="flex min-h-7 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
                    <input type="checkbox" checked={draft.inclusive}
                      onChange={event => updateDraft({ inclusive: event.target.checked })}
                      className="h-5 w-5 accent-[#236999]" />
                    Disciplina inclusiva
                  </label>
                </div>
              </div>
            </section>

            <section aria-labelledby="console-schedules">
              <div id="console-schedules">
                <SectionTitle number={2} title="Programaciones"
                  subtitle="Cada programación puede tener fecha, horario y lugar diferentes." />
              </div>
              <div className="space-y-4">
                {schedules.map((schedule, index) => {
                  const isExpanded = expanded.includes(schedule.id);
                  const venue = venueById(schedule.venueId);
                  return (
                    <div key={schedule.id} className="min-w-0 rounded-[8px] border border-[#d9e5ed] bg-[#f6f9fc] p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-[18px] font-bold leading-6 text-grey-900">Programación {index + 1}</h3>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-[#e9f2f9] px-2 py-1 text-[13px] text-[#678299]">
                            {scheduleKindLabel(schedule.scheduleType)}
                          </span>
                          {!isExpanded && (
                            <button type="button" onClick={() => setExpanded(current => [...current, schedule.id])}
                              className="text-[15px] font-bold text-primary-600 hover:underline">Editar</button>
                          )}
                        </div>
                      </div>
                      {!isExpanded ? (
                        <p className="mt-3 text-[15px] leading-6 text-[#5e6f7b]">
                          {scheduleSummary(schedule)}
                        </p>
                      ) : (
                        <div className="mt-5 space-y-4">
                          <FormField label="Tipo de fecha" htmlFor={'date-type-' + schedule.id}>
                            <select id={'date-type-' + schedule.id} value={schedule.scheduleType}
                              className={inputClass}
                              onChange={event => {
                                const kind = event.target.value as ConsoleSchedule['scheduleType'];
                                updateSchedule(schedule.id, {
                                  scheduleType: kind,
                                  endDate: kind === 'exact' ? '' : schedule.endDate,
                                  weekdays: kind === 'recurring' ? (schedule.weekdays.length ? schedule.weekdays : [6]) : [],
                                });
                              }}>
                              <option value="exact">Fecha puntual</option>
                              <option value="range">Período</option>
                              <option value="recurring">Recurrente</option>
                            </select>
                          </FormField>
                          <div className={'grid min-w-0 gap-4 ' + (schedule.scheduleType !== 'exact' ? 'sm:grid-cols-2' : '')}>
                            <FormField label={schedule.scheduleType === 'exact' ? 'Fecha' : 'Desde'} htmlFor={'start-date-' + schedule.id}
                              hint={'Formato dd/mm/aaaa · ' + dateForDisplay(schedule.startDate)}>
                              <input type="date" lang="es-AR" id={'start-date-' + schedule.id} className={inputClass}
                                value={schedule.startDate}
                                onChange={event => updateSchedule(schedule.id, { startDate: event.target.value })} />
                            </FormField>
                            {schedule.scheduleType !== 'exact' && (
                              <FormField label="Hasta" htmlFor={'end-date-' + schedule.id}
                                hint={'Formato dd/mm/aaaa · ' + dateForDisplay(schedule.endDate)}>
                                <input type="date" lang="es-AR" id={'end-date-' + schedule.id} className={inputClass}
                                  value={schedule.endDate}
                                  onChange={event => updateSchedule(schedule.id, { endDate: event.target.value })} />
                              </FormField>
                            )}
                          </div>
                          {schedule.scheduleType === 'recurring' && (
                            <fieldset>
                              <legend className={labelClass}>Se repite los días</legend>
                              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {WEEKDAYS.map(day => {
                                  const selected = schedule.weekdays.includes(day.number);
                                  return (
                                    <button key={day.number} type="button" aria-pressed={selected}
                                      aria-label={'Todos los ' + day.short}
                                      onClick={() => updateSchedule(schedule.id, {
                                        weekdays: selected
                                          ? schedule.weekdays.filter(value => value !== day.number)
                                          : [...schedule.weekdays, day.number].sort((a, b) => a - b),
                                      })}
                                      className={'min-h-11 rounded-[4px] border px-1 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary-600 ' +
                                        (selected ? 'border-[#80b4db] bg-[#dceefa] text-primary-600' :
                                          'border-[#d6e2eb] bg-white text-[#8294a4] hover:border-[#93bfe0]')}>
                                      {day.short}
                                    </button>
                                  );
                                })}
                              </div>
                            </fieldset>
                          )}
                          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                            <FormField label="Horario de inicio" htmlFor={'start-time-' + schedule.id}>
                              <input type="time" lang="es-AR" id={'start-time-' + schedule.id} className={inputClass}
                                value={schedule.startTime}
                                onChange={event => updateSchedule(schedule.id, { startTime: event.target.value })} />
                            </FormField>
                            <FormField label="Horario de fin (opcional)" htmlFor={'end-time-' + schedule.id}>
                              <input type="time" lang="es-AR" id={'end-time-' + schedule.id} className={inputClass}
                                value={schedule.endTime}
                                onChange={event => updateSchedule(schedule.id, { endTime: event.target.value })} />
                            </FormField>
                          </div>
                          <FormField label="Lugar" htmlFor={'venue-' + schedule.id}>
                            <select id={'venue-' + schedule.id} className={inputClass} value={schedule.venueId}
                              onChange={event => updateSchedule(schedule.id, { venueId: event.target.value })}>
                              {DEMO_VENUES.map(place => (
                                <option key={place.id} value={place.id}>{place.name}</option>
                              ))}
                            </select>
                          </FormField>
                          <div className="space-y-1 text-[14px] leading-5 text-[#5d7182]">
                            <p className="font-medium">Información de la sede seleccionada</p>
                            <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-1">
                              <dt className="text-[#92a0ac]">Localidad</dt><dd>{venue.locality}</dd>
                              <dt className="text-[#92a0ac]">Dirección</dt><dd>{venue.address}</dd>
                              <dt className="text-[#92a0ac]">Google Maps</dt>
                              <dd><a href={'https://www.google.com/maps/search/?api=1&query=' +
                                encodeURIComponent(venue.address + ', ' + venue.locality + ', Buenos Aires, Argentina')}
                                target="_blank" rel="noopener noreferrer"
                                className="font-medium text-primary-600 underline underline-offset-2">
                                Ver ubicación ↗
                              </a></dd>
                            </dl>
                          </div>
                          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[4px] text-[16px] font-bold text-primary-600">
                            <input type="checkbox" checked={schedule.suspendedByRain}
                              onChange={event => updateSchedule(schedule.id, { suspendedByRain: event.target.checked })}
                              className="h-5 w-5 accent-[#236999]" />
                            Se suspende por lluvia
                          </label>
                          <FormField label="Detalle de esta programación (opcional)" htmlFor={'schedule-detail-' + schedule.id}>
                            <textarea id={'schedule-detail-' + schedule.id} rows={3}
                              className={inputClass + ' min-h-[108px] resize-y'}
                              value={schedule.detail}
                              onChange={event => updateSchedule(schedule.id, { detail: event.target.value })} />
                          </FormField>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onClick={() => removeSchedule(schedule.id)}
                          className="text-[14px] font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
                          Eliminar programación
                        </button>
                        {isExpanded && schedules.length > 1 && (
                          <button type="button" onClick={() => setExpanded(current => current.filter(id => id !== schedule.id))}
                            className="text-[14px] font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
                            Contraer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addSchedule}
                  className="flex min-h-12 w-full items-center rounded-[4px] border border-[#d6e2eb] bg-white px-4 text-left text-[16px] font-bold text-primary-600 transition-colors hover:bg-[#f4f9fc] focus-visible:outline-2 focus-visible:outline-primary-600">
                  + &nbsp;Agregar otra programación
                </button>
                <p className={noteClass}>Podés combinar varias fechas, sedes y horarios en una sola actividad.</p>
              </div>
            </section>

            <section aria-labelledby="console-registration">
              <div id="console-registration">
                <SectionTitle number={3} title="Inscripción"
                  subtitle="Una misma modalidad de inscripción para todas las fechas de la actividad." />
              </div>
              <div className="space-y-4">
                <FormField label="Modalidad" htmlFor="registration-mode">
                  <select id="registration-mode" className={inputClass} value={draft.registrationMode}
                    onChange={event => {
                      const registrationMode = event.target.value as ConsoleDraft['registrationMode'];
                      updateDraft({
                        registrationMode,
                        registrationInformation: registrationMode === 'in-person'
                          && draft.registrationInformation === INITIAL_DRAFT.registrationInformation
                          ? '' : draft.registrationInformation,
                      });
                    }}>
                    <option value="none">Sin inscripción</option>
                    <option value="online">Inscripción online</option>
                    <option value="in-person">Inscripción presencial</option>
                  </select>
                </FormField>
                {draft.registrationMode === 'online' && (
                  <FormField label="Enlace de inscripción" htmlFor="registration-url">
                    <input id="registration-url" type="url" className={inputClass}
                      placeholder="https://ejemplo.gob.ar/inscripcion"
                      value={draft.registrationUrl}
                      onChange={event => updateDraft({ registrationUrl: event.target.value })} />
                  </FormField>
                )}
                {draft.registrationMode !== 'none' && (
                  <FormField label={'Información de inscripción ' +
                    (draft.registrationMode === 'online' ? '(opcional)' : '')}
                    htmlFor="registration-info">
                    <textarea id="registration-info" className={inputClass + ' min-h-[100px] resize-y'} rows={3}
                      value={draft.registrationInformation}
                      placeholder={draft.registrationMode === 'in-person'
                        ? 'Indicá dónde y cómo inscribirse presencialmente' : 'Aclaraciones para inscribirse'}
                      onChange={event => updateDraft({ registrationInformation: event.target.value })} />
                  </FormField>
                )}
                <p className={noteClass}>
                  La información de inscripción se mostrará en la ficha pública, debajo de «Cuándo y dónde».
                </p>
              </div>
            </section>

            <section aria-labelledby="console-images">
              <div id="console-images">
                <SectionTitle number={4} title="Imágenes y portada"
                  subtitle="Agregá una portada opcional y fotos adicionales para la galería." />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label htmlFor="cover-image" className="flex min-h-[122px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[6px] bg-[#f0f0f0] text-center text-[15px] font-medium text-primary-600 hover:bg-[#e8eef2]">
                  {draft.coverDataUrl ? <img className="h-[122px] w-full object-cover" src={draft.coverDataUrl} alt="Portada seleccionada" /> : (
                    <><span className="text-[24px] leading-none">⊕</span>Agregar portada</>
                  )}
                  <input id="cover-image" type="file" accept="image/*" className="sr-only"
                    onChange={event => readLocalImage(event.target.files?.[0],
                      dataUrl => updateDraft({ coverDataUrl: dataUrl }))} />
                </label>
                {[0, 1].map(index => (
                  <label key={index} htmlFor={'gallery-' + index}
                    className="flex min-h-[122px] cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border border-[#d6e2eb] bg-[#f6f9fc] text-center text-[15px] text-[#748395] hover:border-[#93bfe0]">
                    {draft.galleryDataUrls[index]
                      ? <img className="h-[122px] w-full object-cover" src={draft.galleryDataUrls[index]} alt={'Foto adicional ' + (index + 1)} />
                      : 'Foto adicional'}
                    <input id={'gallery-' + index} type="file" accept="image/*" className="sr-only"
                      onChange={event => readLocalImage(event.target.files?.[0], dataUrl => {
                        setDraft(current => {
                          const next = [...current.galleryDataUrls];
                          next[index] = dataUrl;
                          return { ...current, galleryDataUrls: next };
                        });
                      })} />
                  </label>
                ))}
              </div>
              {draft.coverDataUrl && (
                <button type="button" onClick={() => updateDraft({ coverDataUrl: '' })}
                  className="mt-2 text-[14px] font-medium text-primary-600 hover:underline">
                  Quitar portada
                </button>
              )}
              <label className="mt-4 flex min-h-7 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
                <input type="checkbox" className="h-5 w-5 accent-[#236999]" checked={draft.featured}
                  onChange={event => updateDraft({ featured: event.target.checked })} />
                Destacar actividad
              </label>
            </section>

            <section aria-labelledby="console-publishing">
              <div id="console-publishing">
                <SectionTitle number={5} title="Publicación"
                  subtitle="Opcional: si completás una fecha futura, la actividad se publicará automáticamente ese día." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Fecha de publicación (opcional)" htmlFor="publish-date"
                  hint={'Formato dd/mm/aaaa · ' + dateForDisplay(draft.publishDate)}>
                  <input id="publish-date" type="date" lang="es-AR" className={inputClass}
                    value={draft.publishDate}
                    onChange={event => updateDraft({ publishDate: event.target.value })} />
                </FormField>
                <FormField label="Hora de publicación" htmlFor="publish-time">
                  <input id="publish-time" type="time" lang="es-AR" className={inputClass}
                    value={draft.publishTime}
                    onChange={event => updateDraft({ publishTime: event.target.value })} />
                </FormField>
              </div>
              <p className={noteClass}>
                Sin fecha de publicación, se publica al guardar. Se oculta a las 00:00 del día siguiente a la última fecha de actividad.
              </p>
            </section>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#edf0f3] pt-6">
              <button type="button" onClick={() => setMobileView('preview')}
                className="min-h-12 rounded-[4px] border border-[#236999] px-5 text-[16px] font-bold text-primary-600 hover:bg-[#edf6fc] lg:hidden">
                Ver vista previa
              </button>
              <button type="button" disabled
                className="min-h-12 rounded-[4px] bg-primary-600 px-6 text-[16px] font-bold text-white opacity-60">
                Guardar actividad
              </button>
            </div>
          </form>

          <aside aria-label="Vista previa de la tarjeta" className={'min-w-0 ' + (mobileView === 'form' ? 'hidden lg:block' : '')}>
            <div className="lg:sticky lg:top-6">
              <CardPreview draft={draft} schedules={schedules} onViewDetail={setDetailPreview} />
              <button type="button" onClick={() => setMobileView('form')}
                className="mt-6 min-h-12 w-full rounded-[4px] border border-[#236999] px-5 text-[16px] font-bold text-primary-600 lg:hidden">
                Volver al formulario
              </button>
            </div>
          </aside>
        </div>
      </main>
      {detailPreview && (
        <ConsoleDetailDialog
          activity={detailPreview}
          galleryImages={draft.galleryDataUrls.filter(Boolean)}
          onClose={() => setDetailPreview(null)}
        />
      )}
    </div>
  );
}
