import type { AgendaScheduleType, AgendaRegistrationMode } from '../../../data/agenda';

export interface ConsoleSchedule {
  id: number;
  scheduleType: AgendaScheduleType;
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  venueId: string;
  suspendedByRain: boolean;
  detail: string;
  detailType?: 'artists';
  participants: string;
  participantsType: 'artists' | 'speakers' | 'participants';
}

export interface ConsoleDraft {
  title: string;
  category: string;
  type: string;
  description: string;
  inclusive: boolean;
  registrationMode: AgendaRegistrationMode;
  registrationUrl: string;
  registrationInformation: string;
  featured: boolean;
  coverDataUrl: string;
  galleryDataUrls: string[];
}

export interface ConsoleVenue {
  id: string;
  name: string;
  locality: string;
  address: string;
}
