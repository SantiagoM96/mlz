import type { AgendaActivity } from './agenda';

/**
 * Siete casos ficticios correspondientes a los detalles finales de Figma Agenda V2.
 * Sirven exclusivamente para validación visual, no son eventos anunciados.
 */
const asset = (name: string) =>
  import.meta.env.BASE_URL + 'assets/agenda/types/' + name + '.png';

const parque = {
  locality: 'Lomas de Zamora',
  venue: 'Parque de Lomas',
  address: 'Frías y Portela - Lomas de Zamora',
};
const grigera = {
  locality: 'Lomas de Zamora',
  venue: 'Plaza Grigera',
  address: 'Av. Hipólito Yrigoyen N° 8700 - Lomas de Zamora',
};

export const agendaV2PreviewActivities: readonly AgendaActivity[] = [
  {
    id: 'preview-v2-yoga-dos-sedes',
    title: 'Yoga en Comunidad',
    category: 'Deportiva y recreativa',
    type: 'Cuerpo–mente',
    locality: 'Lomas de Zamora',
    dayLabel: 'Todos los martes y jueves',
    timeLabel: 'Martes 09:00 h · Jueves 18:00 h',
    image: asset('cuerpo-mente'),
    badges: [],
    description: 'Clases de yoga abiertas a la comunidad para trabajar la movilidad, la respiración y la relajación. La propuesta es la misma en ambas sedes y está pensada para personas con distintos niveles de experiencia.\nElegí el día y lugar que te resulte más cómodo.',
    descriptionIsIllustrative: true,
    schedules: [
      {
        id: 'yoga-plaza-grigera',
        scheduleType: 'recurring',
        startDate: '2026-11-10',
        endDate: '2026-12-15',
        weekdays: [2],
        startTime: '09:00',
        endTime: '10:00',
        locality: 'Lomas de Zamora',
        venue: 'Plaza Grigera',
        address: 'Av. Hipólito Yrigoyen 8700 - Lomas de Zamora',
        suspendedByRain: true,
      },
      {
        id: 'yoga-polideportivo-evita',
        scheduleType: 'recurring',
        startDate: '2026-11-12',
        endDate: '2026-12-17',
        weekdays: [4],
        startTime: '18:00',
        endTime: '19:00',
        locality: 'Albertina',
        venue: 'Polideportivo Evita',
        address: 'Atenas 2002 - Albertina',
        suspendedByRain: false,
      },
    ],
  },
  {
    id: 'preview-v2-reciclaje',
    title: 'Jornada de reciclaje',
    category: 'Ambiental',
    type: 'Jornada',
    locality: 'Lomas de Zamora',
    dayLabel: 'Sábado 14 de noviembre',
    timeLabel: '10:00 a 14:00 h',
    image: asset('jornada'),
    badges: [],
    description: 'Encuentro abierto para promover la separación de residuos y recibir materiales reciclables. Una propuesta gratuita para compartir buenas prácticas ambientales en comunidad.\nTraé tus materiales reciclables limpios y secos. Durante la jornada se compartirá información sobre separación y reutilización de residuos.',
    descriptionIsIllustrative: true,
    schedules: [{
      id: 'reciclaje-unico', scheduleType: 'exact',
      startDate: '2026-11-14', startTime: '10:00', endTime: '14:00',
      ...parque,
    }],
  },
  {
    id: 'preview-v2-muestra',
    title: 'Muestra fotográfica barrial',
    category: 'Cultural',
    type: 'Muestra',
    locality: 'Lomas de Zamora',
    dayLabel: 'Del 10 al 17 de noviembre',
    timeLabel: '11:00 a 19:00 h',
    image: asset('muestra'),
    badges: [],
    description: 'Exposición abierta con producciones fotográficas de vecinos y vecinas de distintos barrios de Lomas de Zamora. La muestra puede recorrerse durante varios días.\nLa propuesta invita a conocer miradas de nuestra comunidad a través de fotografías y relatos visuales.',
    descriptionIsIllustrative: true,
    schedules: [{
      id: 'muestra-periodo', scheduleType: 'range',
      startDate: '2026-11-10', endDate: '2026-11-17',
      startTime: '11:00', endTime: '19:00', ...parque,
    }],
  },
  {
    id: 'preview-v2-compostaje',
    title: 'Taller de compostaje',
    category: 'Ambiental',
    type: 'Taller',
    locality: 'Lomas de Zamora',
    dayLabel: 'Todos los sábados',
    timeLabel: '10:00 a 12:00 h',
    image: asset('taller-ambiental'),
    badges: [
      { kind: 'accessible', label: 'Disciplina inclusiva' },
      { kind: 'registration', label: 'Requiere inscripción' },
    ],
    description: 'Taller gratuito para aprender prácticas de compostaje domiciliario y separación de residuos orgánicos mediante encuentros semanales.\nCada encuentro combina una explicación sencilla y una actividad práctica. No se requieren conocimientos previos.',
    descriptionIsIllustrative: true,
    registrationMode: 'online',
    schedules: [{
      id: 'compostaje-sabados', scheduleType: 'recurring',
      startDate: '2026-11-07', endDate: '2026-11-28', weekdays: [6],
      startTime: '10:00', endTime: '12:00', ...parque,
    }],
  },
  {
    id: 'preview-v2-futbol',
    title: 'Fútbol en Comunidad',
    category: 'Deportiva y recreativa',
    type: 'Entrenamiento',
    locality: 'Lomas de Zamora',
    dayLabel: 'Todos los martes y jueves',
    timeLabel: '16:00 a 18:00 h',
    image: asset('entrenamiento'),
    badges: [],
    description: 'Entrenamientos gratuitos de fútbol abiertos a la comunidad en distintos espacios de Lomas de Zamora. Cada día se desarrolla en una sede diferente.\nLas actividades comparten una misma propuesta y se organizan en distintas programaciones para facilitar la asistencia en cada barrio.',
    descriptionIsIllustrative: true,
    schedules: [
      {
        id: 'futbol-martes', scheduleType: 'recurring',
        startDate: '2026-11-10', endDate: '2026-11-30', weekdays: [2],
        startTime: '16:00', endTime: '18:00', suspendedByRain: true, ...grigera,
      },
      {
        id: 'futbol-jueves', scheduleType: 'recurring',
        startDate: '2026-11-12', endDate: '2026-11-30', weekdays: [4],
        startTime: '16:00', endTime: '18:00', suspendedByRain: true, ...parque,
      },
    ],
  },
  {
    id: 'preview-v2-folklore',
    title: 'Folklore en Comunidad',
    category: 'Cultural',
    type: 'Música',
    locality: 'Lomas de Zamora',
    dayLabel: 'Sábado 14 de noviembre',
    timeLabel: '17:00 h',
    image: asset('musica'),
    badges: [],
    description: 'Encuentros abiertos de música y danza folklórica en Plaza Grigera, con la participación de diferentes artistas de nuestra comunidad.\nUna propuesta gratuita para disfrutar la música en vivo. La programación artística puede variar en cada encuentro.',
    descriptionIsIllustrative: true,
    schedules: [
      {
        id: 'folklore-14', scheduleType: 'exact',
        startDate: '2026-11-14', startTime: '17:00',
        detail: 'Andrea Gauna y Lautaro Rotela', detailType: 'artists', suspendedByRain: true, ...grigera,
      },
      {
        id: 'folklore-21', scheduleType: 'exact',
        startDate: '2026-11-21', startTime: '17:00',
        detail: 'Brian Albornoz y Luz Pedrosa', detailType: 'artists', suspendedByRain: true, ...grigera,
      },
    ],
  },
  {
    id: 'preview-v2-huerta',
    title: 'Taller de huerta comunitaria',
    category: 'Ambiental',
    type: 'Taller',
    locality: 'Lomas de Zamora',
    dayLabel: 'Todos los miércoles',
    timeLabel: '15:00 a 17:00 h',
    image: asset('taller-ambiental'),
    badges: [
      { kind: 'accessible', label: 'Disciplina inclusiva' },
      { kind: 'registration', label: 'Requiere inscripción' },
    ],
    description: 'Encuentros gratuitos para aprender técnicas básicas de cultivo y cuidado de huertas comunitarias.\nNo hace falta tener experiencia previa. Se comparten herramientas y prácticas sencillas para comenzar a cultivar.',
    descriptionIsIllustrative: true,
    registrationMode: 'in-person',
    registrationInformation: 'La inscripción se realiza de manera presencial en la sede de la actividad. Consultá allí los días y horarios disponibles.',
    schedules: [{
      id: 'huerta-miercoles', scheduleType: 'recurring',
      startDate: '2026-11-11', endDate: '2026-11-25', weekdays: [3],
      startTime: '15:00', endTime: '17:00', ...parque,
    }],
  },
  {
    id: 'preview-v2-itinerante',
    title: 'Jornada ambiental itinerante',
    category: 'Ambiental',
    type: 'Jornada',
    locality: 'Lomas de Zamora',
    dayLabel: 'Sábado 14 de noviembre',
    timeLabel: '10:00 a 14:00 h',
    image: asset('disciplina-inclusiva'),
    badges: [],
    description: 'Encuentros gratuitos de concientización y reciclaje que se realizan en diferentes plazas del municipio.\nPodés acercarte a la sede correspondiente en cada fecha. Las jornadas comparten una misma propuesta ambiental.',
    descriptionIsIllustrative: true,
    schedules: [
      {
        id: 'itinerante-14', scheduleType: 'exact',
        startDate: '2026-11-14', startTime: '10:00', endTime: '14:00',
        suspendedByRain: true, ...grigera,
      },
      {
        id: 'itinerante-21', scheduleType: 'exact',
        startDate: '2026-11-21', startTime: '10:00', endTime: '14:00',
        suspendedByRain: true, ...parque,
      },
    ],
  },
];

export const agendaV2ExampleCases: readonly {
  id: string;
  label: string;
  description: string;
  figmaNode: string;
}[] = [
  {
    id: 'preview-v2-reciclaje',
    label: '01 · Fecha puntual',
    description: 'Una actividad, una fecha y una sede.',
    figmaNode: '7454-14560',
  },
  {
    id: 'preview-v2-muestra',
    label: '02 · Período',
    description: 'Todos los días entre dos fechas.',
    figmaNode: '7454-14798',
  },
  {
    id: 'preview-v2-compostaje',
    label: '03 · Recurrente',
    description: 'Todos los sábados, con inicio y fin.',
    figmaNode: '7454-15036',
  },
  {
    id: 'preview-v2-futbol',
    label: '04 · Dos sedes',
    description: 'Recurrencia con distintos días y sedes.',
    figmaNode: '7454-15274',
  },
  {
    id: 'preview-v2-folklore',
    label: '05 · Varias fechas',
    description: 'Dos encuentros con detalles diferentes.',
    figmaNode: '7454-15512',
  },
  {
    id: 'preview-v2-huerta',
    label: '06 · Inscripción presencial',
    description: 'Instrucciones presenciales, sin enlace externo.',
    figmaNode: '7463-15233',
  },
  {
    id: 'preview-v2-itinerante',
    label: '07 · Fechas y sedes',
    description: 'Dos fechas puntuales en lugares distintos.',
    figmaNode: '7463-15435',
  },
];
