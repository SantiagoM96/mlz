import { agendaV2PreviewActivities } from '../../../data/agenda-v2-previews';
import type { ConsoleDraft, ConsoleSchedule } from './model';
import { DEMO_VENUES, INITIAL_DRAFT } from './demoData';
import { createDemoSchedule } from './scheduleRules';

export function getDemoCasePreset(id: string | null): {
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
