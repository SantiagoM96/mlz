import type { ConsoleDraft, ConsoleSchedule, ConsoleVenue } from './model';

/** Las sedes guardadas pueden ampliarse dentro de la sesión de la consola. */
export const DEMO_VENUES = [
  { id: 'plaza-grigera', name: 'Plaza Grigera', locality: 'Lomas de Zamora', address: 'Av. Hipólito Yrigoyen 8700' },
  { id: 'parque-lomas', name: 'Parque de Lomas', locality: 'Lomas de Zamora', address: 'Frías y Portela' },
  { id: 'museo-americanista', name: 'Museo Americanista', locality: 'Lomas de Zamora', address: 'Manuel Castro 254' },
  { id: 'teatro-municipio', name: 'Teatro del Municipio', locality: 'Lomas de Zamora', address: 'Manuel Castro 262' },
  { id: 'polideportivo-evita', name: 'Polideportivo Evita', locality: 'Albertina', address: 'Atenas 2002' },
] as const satisfies readonly ConsoleVenue[];

export const CATEGORY_TYPES: Record<string, string[]> = {
  Ambiental: ['Taller', 'Jornada', 'Visita guiada', 'Charla'],
  Cultural: ['Teatro', 'Música', 'Danza', 'Cine', 'Muestra', 'Taller', 'Presentación', 'Literatura'],
  'Deportiva y recreativa': ['Entrenamiento', 'Torneo', 'Aeróbica', 'Cuerpo–mente', 'Taller'],
};

export const WEEKDAYS = [
  { number: 1, short: 'Lun' },
  { number: 2, short: 'Mar' },
  { number: 3, short: 'Mié' },
  { number: 4, short: 'Jue' },
  { number: 5, short: 'Vie' },
  { number: 6, short: 'Sáb' },
  { number: 7, short: 'Dom' },
] as const;

export const INITIAL_DRAFT: ConsoleDraft = {
  title: 'Taller de compostaje',
  category: 'Ambiental',
  type: 'Taller',
  description: 'Taller abierto para aprender prácticas de compostaje y separación de residuos orgánicos.',
  inclusive: true,
  registrationMode: 'online',
  registrationUrl: 'https://example.org/inscripcion-taller',
  registrationInformation: 'Para participar, completá el formulario desde el botón de inscripción.',
  featured: false,
  coverDataUrl: '',
  galleryDataUrls: [],
};

export const INITIAL_SCHEDULES: ConsoleSchedule[] = [{
  id: 1,
  scheduleType: 'recurring',
  startDate: '2026-11-07',
  endDate: '2026-11-28',
  weekdays: [6],
  startTime: '10:00',
  endTime: '12:00',
  venueId: 'plaza-grigera',
  suspendedByRain: false,
  detail: 'Cada encuentro incluye una parte teórica y una práctica de armado de compostera.',
  participants: '',
  participantsType: 'participants',
}];
