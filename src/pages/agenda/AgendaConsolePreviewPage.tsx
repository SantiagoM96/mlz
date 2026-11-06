import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { AgendaActivity } from '../../data/agenda';
import { agendaV2ExampleCases, agendaV2PreviewActivities } from '../../data/agenda-v2-previews';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ConsoleScheduleEditorDialog } from '../../features/agenda/consolePreview/ConsoleScheduleEditorDialog';
import { ConsoleTypeEditorDialog } from '../../features/agenda/consolePreview/ConsoleTypeEditorDialog';
import { ConsoleImageUpload } from '../../features/agenda/consolePreview/ConsoleImageUpload';
import { getPublicActivityViews } from '../../features/agenda/utils/publicActivityViews';
import { ScheduleTable } from '../../features/agenda/consolePreview/ScheduleTable';
import { ConsoleDetailDialog } from '../../features/agenda/consolePreview/ConsoleDetailDialog';
import type { ConsoleDraft, ConsoleSchedule, ConsoleVenue } from '../../features/agenda/consolePreview/model';
import { CATEGORY_TYPES, DEMO_VENUES, INITIAL_DRAFT, INITIAL_SCHEDULES } from '../../features/agenda/consolePreview/demoData';
import { createDemoSchedule, venueById } from '../../features/agenda/consolePreview/scheduleRules';

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

function makePreviewActivity(draft: ConsoleDraft, schedules: readonly ConsoleSchedule[], venues: readonly ConsoleVenue[]): AgendaActivity {
  const first = schedules[0];
  const venue = venueById(first?.venueId ?? '', venues);
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
      const selectedVenue = venueById(schedule.venueId, venues);
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
        detailType: schedule.detailType,
        participants: schedule.participants,
        participantsType: schedule.participantsType,
        suspendedByRain: schedule.suspendedByRain,
      };
    }),
  };
}

function CardPreview({ draft, schedules, venues, onViewDetail }: {
  draft: ConsoleDraft;
  schedules: ConsoleSchedule[];
  venues: readonly ConsoleVenue[];
  onViewDetail: (activity: AgendaActivity) => void;
}) {
  const editorialActivity = makePreviewActivity(draft, schedules, venues);
  const publicViews = getPublicActivityViews(editorialActivity);

  return (
    <div>
      <h2 className="mb-2 text-[24px] font-bold leading-[30px] text-primary-600">Vista previa</h2>
      <p className="mb-5 text-[14px] leading-5 text-[#687f91]">
        {publicViews.length === 1
          ? 'Una ficha pública para esta actividad'
          : publicViews.length + ' fichas públicas, separadas por sede o encuentro'}
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
      suspendedByRain: schedule.suspendedByRain === true,
      detail: schedule.detailType === 'artists' ? '' : (schedule.detail ?? ''),
      detailType: schedule.detailType,
      participants: schedule.detailType === 'artists' ? (schedule.detail ?? '') : '',
      participantsType: schedule.detailType === 'artists' ? 'artists' : 'participants',
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
  const [scheduleEditor, setScheduleEditor] = useState<{
    mode: 'create' | 'edit' | 'duplicate'; schedule: ConsoleSchedule;
  } | null>(null);
  const [venues, setVenues] = useState<ConsoleVenue[]>(() => DEMO_VENUES.map(item => ({ ...item })));
  const [typesByCategory, setTypesByCategory] = useState<Record<string, string[]>>(
    () => Object.fromEntries(Object.entries(CATEGORY_TYPES).map(([key, values]) => [key, [...values]])),
  );
  const [addingType, setAddingType] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [detailPreview, setDetailPreview] = useState<AgendaActivity | null>(null);

  useEffect(() => {
    document.title = 'Consola · Vista previa | Agenda de la Comunidad';
  }, []);

  const updateDraft = (changes: Partial<ConsoleDraft>) => {
    setDraft(current => ({ ...current, ...changes }));
  };
  const openNewSchedule = () => {
    const nextId = Math.max(0, ...schedules.map(schedule => schedule.id)) + 1;
    setScheduleEditor({ mode: 'create', schedule: createDemoSchedule(nextId) });
    setMobileView('form');
  };
  const editSchedule = (schedule: ConsoleSchedule) => {
    setScheduleEditor({ mode: 'edit', schedule: { ...schedule, weekdays: [...schedule.weekdays] } });
  };
  const saveSchedule = (schedule: ConsoleSchedule) => {
    setSchedules(current => scheduleEditor?.mode === 'edit'
      ? current.map(item => item.id === schedule.id ? schedule : item)
      : [...current, schedule]);
    setScheduleEditor(null);
  };
  const duplicateSchedule = (schedule: ConsoleSchedule) => {
    const nextId = Math.max(0, ...schedules.map(item => item.id)) + 1;
    setScheduleEditor({
      mode: 'duplicate',
      schedule: { ...schedule, id: nextId, weekdays: [...schedule.weekdays] },
    });
  };
  const createVenue = (venue: Omit<ConsoleVenue, 'id'>): string => {
    const nextId = 'nueva-sede-' + (Math.max(0, ...venues
      .map(item => Number(item.id.replace('nueva-sede-', '')))
      .filter(Number.isFinite)) + 1);
    setVenues(current => [...current, { id: nextId, ...venue }]);
    return nextId;
  };
  const createType = (name: string) => {
    setTypesByCategory(current => ({
      ...current,
      [draft.category]: [...(current[draft.category] ?? []), name],
    }));
    updateDraft({ type: name });
    setAddingType(false);
  };
  const removeSchedule = (id: number) => {
    setSchedules(current => current.filter(schedule => schedule.id !== id));
  };
  const changeCategory = (category: string) => {
    updateDraft({ category, type: typesByCategory[category]?.[0] ?? 'Taller' });
  };
  const loadFigmaCase = (id: string) => {
    const preset = getFigmaExamplePreset(id);
    setSearchParams(id ? { caso: id } : {});
    setDraft(preset?.draft ?? { ...INITIAL_DRAFT });
    setSchedules(preset?.schedules
      ?? INITIAL_SCHEDULES.map(s => ({ ...s, weekdays: [...s.weekdays] })));
    setScheduleEditor(null);
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
            <label htmlFor="figma-preset" className={labelClass}>Casos de demostración</label>
            <p className="mb-2 text-[14px] leading-5 text-[#61788b]">
              Elegí un ejemplo para probar la consola. No se guardan ni publican actividades.
            </p>
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

        <div className="grid items-start gap-6 lg:items-stretch lg:grid-cols-[minmax(0,860px)_minmax(0,316px)]">
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
                      {[...new Set([...(typesByCategory[draft.category] ?? []), draft.type])].map(type =>
                        <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button type="button" onClick={() => setAddingType(true)}
                      className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-[6px] text-[15px] font-bold text-primary-600 hover:underline">
                      <MaterialIcon name="add" size={19}/> Agregar tipo de actividad
                    </button>
                  </FormField>
                </div>
                <p className="text-[14px] leading-5 text-[#61788b]">
                  Las categorías son fijas; los tipos se pueden agregar desde la consola.
                </p>
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
              <div id="console-schedules" className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[24px] font-bold leading-[30px] text-primary-600">2. Programaciones</h2>
                  <p className="mt-1 text-[16px] leading-6">Cada programación puede tener fecha, horario y lugar diferentes.</p>
                </div>
                <button type="button" onClick={openNewSchedule}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[6px] bg-primary-600 px-4 text-[16px] font-bold text-white hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                  <MaterialIcon name="add" size={20} /> Agregar
                </button>
              </div>
              <ScheduleTable
                schedules={schedules}
                venues={venues}
                onEdit={editSchedule}
                onDuplicate={duplicateSchedule}
                onRemove={removeSchedule}
              />
              <p className={noteClass}>Podés editar, duplicar o eliminar programaciones sin repetir los datos de la actividad.</p>
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <ConsoleImageUpload id="cover-image" label="Portada" source={draft.coverDataUrl}
                  onFile={file => readLocalImage(file, url => updateDraft({ coverDataUrl: url }))}
                  onRemove={() => updateDraft({ coverDataUrl: '' })}/>
                {[0, 1].map(index => (
                  <ConsoleImageUpload key={index} id={'gallery-' + index}
                    label={'Foto adicional ' + (index + 1)} source={draft.galleryDataUrls[index] ?? ''}
                    onFile={file => readLocalImage(file, url => {
                      setDraft(current => {
                        const next = [...current.galleryDataUrls];
                        next[index] = url;
                        return { ...current, galleryDataUrls: next };
                      });
                    })}
                    onRemove={() => setDraft(current => ({
                      ...current,
                      galleryDataUrls: current.galleryDataUrls.map((url, i) => i === index ? '' : url),
                    }))}/>
                ))}
              </div>
              <label className="mt-4 flex min-h-7 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
                <input type="checkbox" className="h-5 w-5 accent-[#236999]" checked={draft.featured}
                  onChange={event => updateDraft({ featured: event.target.checked })} />
                Destacar actividad
              </label>
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

          <aside aria-label="Vista previa de la tarjeta" className={'min-w-0 lg:h-full lg:min-h-0 ' + (mobileView === 'form' ? 'hidden lg:block' : '')}>
            <div data-testid="console-preview-sticky"
              className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-48px)] lg:overflow-y-auto lg:overscroll-contain">
              <CardPreview draft={draft} schedules={schedules} venues={venues} onViewDetail={setDetailPreview} />
              <button type="button" onClick={() => setMobileView('form')}
                className="mt-6 min-h-12 w-full rounded-[4px] border border-[#236999] px-5 text-[16px] font-bold text-primary-600 lg:hidden">
                Volver al formulario
              </button>
            </div>
          </aside>
        </div>
      </main>
      {addingType && (
        <ConsoleTypeEditorDialog
          category={draft.category}
          existingTypes={typesByCategory[draft.category] ?? []}
          onAdd={createType}
          onClose={() => setAddingType(false)}
        />
      )}
      {scheduleEditor && (
        <ConsoleScheduleEditorDialog
          key={scheduleEditor.mode + '-' + scheduleEditor.schedule.id}
          schedule={scheduleEditor.schedule}
          mode={scheduleEditor.mode}
          schedules={schedules}
          venues={venues}
          onCreateVenue={createVenue}
          onSave={saveSchedule}
          onClose={() => setScheduleEditor(null)}
        />
      )}
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
