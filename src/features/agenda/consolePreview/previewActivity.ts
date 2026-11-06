import type { AgendaActivity } from '../../../data/agenda';
import type { ConsoleDraft, ConsoleSchedule, ConsoleVenue } from './model';
import { venueById } from './scheduleRules';

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

export function makePreviewActivity(draft: ConsoleDraft, schedules: readonly ConsoleSchedule[], venues: readonly ConsoleVenue[]): AgendaActivity {
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
