import type { ConsoleSchedule, ConsoleVenue } from './model';
import { DEMO_VENUES } from './demoData';

export function createDemoSchedule(id: number): ConsoleSchedule {
  return {
    id,
    scheduleType: 'exact',
    startDate: '',
    endDate: '',
    weekdays: [],
    startTime: '',
    endTime: '',
    venueId: 'plaza-grigera',
    suspendedByRain: false,
    detail: '',
    participants: '',
    participantsType: 'participants',
  };
}

export function venueById(id: string, venues: readonly ConsoleVenue[] = DEMO_VENUES): ConsoleVenue {
  return venues.find(venue => venue.id === id) ?? venues[0] ?? DEMO_VENUES[0];
}

/** Evita publicar dos programaciones idénticas aunque sus IDs sean distintos. */
export function sameScheduleContent(a: ConsoleSchedule, b: ConsoleSchedule): boolean {
  return a.scheduleType === b.scheduleType
    && a.startDate === b.startDate
    && (a.scheduleType === 'exact' || a.endDate === b.endDate)
    && (a.scheduleType !== 'recurring' ||
      [...new Set(a.weekdays)].sort().join(',') === [...new Set(b.weekdays)].sort().join(','))
    && a.startTime === b.startTime
    && a.endTime === b.endTime
    && a.venueId === b.venueId
    && a.suspendedByRain === b.suspendedByRain
    && a.participantsType === b.participantsType
    && a.participants.trim() === b.participants.trim()
    && a.detail.trim() === b.detail.trim();
}
