import { importedActivityRows } from './agenda-imported';
import { originalActivityDescriptions } from './agenda-descriptions';

export type ActivityCategory = string;
export type FilterGroup = 'type' | 'category' | 'locality' | 'date';

export type AgendaScheduleType = 'exact' | 'range' | 'recurring';

/** Una programación corresponde a un horario y sede, no a cada ocurrencia semanal. */
export interface AgendaSchedule {
  id: string;
  scheduleType: AgendaScheduleType;
  startDate: string; // ISO YYYY-MM-DD
  endDate?: string | null;
  /** ISO weekday: lunes=1 ... domingo=7. */
  weekdays?: readonly number[] | null;
  startTime: string; // HH:mm
  endTime?: string | null;
  locality: string;
  venue: string;
  address?: string;
  detail?: string;
  /** El detalle contiene nombres de artistas, no una nota genérica. */
  detailType?: 'artists';
  /** Participantes identificados para esta fecha; independientes del detalle editorial. */
  participants?: string;
  participantsType?: 'artists' | 'speakers' | 'participants';
  /** Condición de lluvia de esta programación; puede diferir entre sedes. */
  suspendedByRain?: boolean;
}

export type AgendaRegistrationMode = 'none' | 'online' | 'in-person';

export interface AgendaActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  type: string;
  locality: string;
  dayLabel: string;
  timeLabel: string;
  image: string;
  badges: { kind: 'rain' | 'accessible' | 'registration' | 'featured'; label: string }[];
  dateISO?: string;
  venue?: string;
  address?: string;
  description?: string;
  /** Marca el copy editorial creado para la maqueta, no validado por el equipo. */
  descriptionIsIllustrative?: boolean;
  source?: string;
  /** URL externa de inscripción asignada de forma explícita a esta actividad. */
  registrationUrl?: string;
  /** Datos de Agenda V2; la ausencia conserva la representación de registros importados. */
  schedules?: readonly AgendaSchedule[];
  registrationMode?: AgendaRegistrationMode;
  registrationInformation?: string;
}

/** Fecha municipal, independiente de la zona horaria del dispositivo visitante. */
export function argentinaTodayISO(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (name: string) => parts.find(part => part.type === name)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

/**
 * Pictogramas originales del frame ANDY / BUSCADOR en Figma.
 * Cada tipo tiene una imagen dedicada; exportada a 3x sin reproducir el
 * raster genérico que se usaba para las categorías amplias.
 */
const imageByType: Readonly<Record<string, string>> = {
  'Visita guiada': 'visita-guiada',
  Charla: 'charla',
  Música: 'musica',
  Teatro: 'teatro',
  Magia: 'magia',
  Muestra: 'muestra',
  Presentación: 'presentacion',
  Cine: 'cine',
  Danza: 'danza',
  Jornada: 'jornada',
  'Taller de danza': 'taller-de-danza',
  'Taller artístico': 'taller-artistico',
  Entrenamiento: 'entrenamiento',
  Humor: 'humor',
  Varieté: 'variete',
  'Cuerpo-mente': 'cuerpo-mente',
  'Cuerpo–mente': 'cuerpo-mente',
  Aeróbica: 'aerobica',
  Infantil: 'infantil',
  Circo: 'circo',
  Títeres: 'titeres',
  Taller: 'taller',
  'Artes del movimiento': 'artes-del-movimiento',
  'Taller musical': 'taller-musical',
  'Taller ambiental': 'taller-ambiental',
  Postural: 'postural',
  Pileta: 'pileta',
  'Encuentro literario': 'encuentro-literario',
  Conversatorio: 'conversatorio',
  'Disciplina inclusiva': 'disciplina-inclusiva',
  Torneo: 'torneo',

  // Denominaciones del Excel que se corresponden con tipos ilustrados.
  'Danza/baile': 'danza',
  Exposición: 'muestra',
  Función: 'teatro',
  Literatura: 'encuentro-literario',
  Evento: 'jornada',
};

const imageForActivity = (type: string, category: string, title: string): string => {
  const isInclusive = /disciplinas? inclusivas?/i.test(title);
  const filename = isInclusive ? 'disciplina-inclusiva' : imageByType[type] ??
    (category === 'Deportiva y recreativa' ? 'entrenamiento' : 'jornada');
  return import.meta.env.BASE_URL + `assets/agenda/types/${filename}.png`;
};

/** Direcciones que figuran en la misma planilla, normalizadas por sede y localidad. */
const addressByVenue: Record<string, string> = {
  'Teatro del Municipio|Lomas de Zamora': 'Manuel Castro 262, Lomas de Zamora',
  'Plaza Grigera|Lomas de Zamora': 'Av. Hipólito Yrigoyen 8700, Lomas de Zamora',
  'Museo Americanista|Lomas de Zamora': 'Manuel Castro 254, Lomas de Zamora',
  'Casa Fuentealba|Llavallol': 'Antártida Argentina 1755, Llavallol',
  'Centro Cultural Roberto Arlt|Temperley': 'Av. Eva Perón 675, Temperley',
  'Killhawe|Temperley': 'Cnel. Suárez 326, Temperley',
  'Parque Llavallol|Llavallol': 'Boulevard Santa Catalina 300, Llavallol',
  'Polideportivo Evita|Albertina': 'Atenas 2002, Albertina',
  'Biblioteca Popular Escritores Argentinos|Llavallol': 'Pasaje Adrogué 186, Llavallol',
  'Club Cultural|Lomas de Zamora': 'Monseñor Piaggio 653, Lomas de Zamora',
  'Cámara de Comercio Industrial Profesionales y Propietarios|Temperley': '25 de Mayo 102, Temperley',
  'Centro de Jubilados «Jubilza»|Parque Barón': 'Arana Goiri 879, Parque Barón',
  'Centro de Jubilados «Los Abuelos de Julio»|Santa Catalina': 'Milán 262, Santa Catalina',
  'Centro de Jubilados «Nuevo Amanecer»|Centenario': 'Celina Minetto 1181, Centenario',
  'Centro de Jubilados «Sol de Turdera»|Turdera': 'Patricios 352, Turdera',
  'Biblioteca Popular José Martí|Turdera': 'San Mateo 1014, Turdera',
  'Centro Cultural «La Madriguera»|Temperley': 'Sta. María de Oro 8, Temperley',
  'Asociación No seas Pavote|Llavallol': 'Boulevard Polonia 33, Llavallol',
  'Centro Cultural El Ceibo|Banfield': 'Rincón 565, Banfield',
  'Centro Integrador Comunitario|Budge': 'Claudio de Alas 1200, Budge',
  'CGM Centenario|Centenario': 'Av. Gral. Martín Rodríguez 430, Centenario',
  'Parque Diego Armando Maradona|Fiorito': 'Recondo 1200, Fiorito',
  'Playón «El Puente»|Fiorito': 'Bustos 4657, Fiorito',
  'Playón «El Puente»|Lamadrid': 'Bustos 4657, Lamadrid',
  'Plaza San Francisco de Asís|Llavallol': 'Dr. Jorge Melber 1802, Llavallol',
  'Parque Caaguazú|San José': 'Caaguazú 500, San José',
  'Plaza San Martín|Turdera': 'Suipacha 101, Turdera',
  'Teatro Escuela Horizonte|Lomas de Zamora': 'Av. Hipólito Yrigoyen 9437, Lomas de Zamora',
  'Teatro Urbano|Parque Barón': 'Gral. Frías 1074, Parque Barón',
  'ED Espacio de arte|Lomas de Zamora': 'Viamonte 312, Lomas de Zamora',
  'Mandorla Teatro|Temperley': 'Triunvirato 255, Temperley',
  'RS Studio|Temperley': 'Dorrego 351, Temperley',
  'Casa Cultural El Convento|Banfield': 'Av. Hipólito Yrigoyen 7030, Banfield',
  'Sulfata|San José': 'Caaguazú 275, San José',
  'Museo Pio Collivadino|Banfield': 'Medrano 165, Banfield',
  'Reserva Natural Municipal Santa Catalina|Llavallol': 'Garibaldi 2348, Llavallol',
  'Sudaka|Lomas de Zamora': 'Francisco Portela 82, Lomas de Zamora',
  'Centro Paraguayo|Budge': 'Campoamor 1962, Budge',
};

/**
 * Copy orientativo solo cuando el Excel no incluye una descripción aprovechable.
 * Se marca en la UI como ilustrativo y nunca se presenta como texto oficial.
 */
function illustrativeDescription(title: string, type: string, locality: string, venue: string): string {
  const place = venue ? `en ${venue}, ${locality}` : `en ${locality}`;
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLocaleLowerCase('es-AR');
  if (/tributo a charly/i.test(title)) return `Un encuentro musical dedicado a Charly García ${place}. Una propuesta para disfrutar y compartir canciones que forman parte de nuestra cultura.`;
  if (/ensamble percusi[oó]n/i.test(title)) return `Una propuesta para acercarse a la música y los ritmos de percusión ${place}.`;
  if (/exploradoras de la galaxia/i.test(title)) return `Una propuesta cultural para compartir con las infancias ${place}. Una invitación a dejar volar la imaginación.`;
  if (/filosofía nuestra/i.test(title)) return `Un encuentro alrededor del libro «Filosofía nuestra» ${place}, para acercarse a la lectura y el intercambio de ideas.`;
  if (/truco en comunidad/i.test(title)) return `Un encuentro recreativo pensado para compartir partidas de truco y disfrutar de un momento de juego ${place}.`;
  if (/observación de hongos/i.test(title)) return `Una salida para acercarse a la naturaleza y observar el mundo de los hongos ${place}.`;
  if (/muestra anual de estudiantes/i.test(title)) return `Una oportunidad para conocer trabajos y producciones de estudiantes ${place}.`;
  if (/presentaci[oó]n sade/i.test(title)) return `Una propuesta vinculada a la literatura y la escritura ${place}, abierta a quienes disfrutan de los encuentros culturales.`;
  if (/yoga|tai chi/i.test(title)) return `Una actividad de movimiento y bienestar para conectar con el cuerpo y compartir un momento de práctica ${place}.`;
  if (/zumba|lomas camina|funcional|kick boxing|actividad f[ií]sica guiada/i.test(title)) return `Una propuesta de actividad física y movimiento ${place}, pensada para sumar ejercicio a la rutina en comunidad.`;
  if (type === 'Música') return `Una propuesta musical para disfrutar de ${cleanTitle} ${place}. Un espacio para encontrarse alrededor de la música.`;
  if (type === 'Danza' || type === 'Danza/baile') return `Una invitación a compartir la danza y descubrir la propuesta de ${cleanTitle} ${place}.`;
  if (type === 'Infantil') return `Una actividad cultural para compartir con las infancias ${place}.`;
  if (type === 'Teatro' || type === 'Función') return `Una propuesta escénica para acercarse a ${cleanTitle} ${place}.`;
  if (type === 'Literatura' || type === 'Presentación') return `Un encuentro para acercarse a ${cleanTitle} y compartir lecturas e ideas ${place}.`;
  if (type === 'Taller' || type.startsWith('Taller')) return `Un espacio de participación y aprendizaje alrededor de ${lower} ${place}.`;
  if (type === 'Torneo') return `Una propuesta recreativa para encontrarse y compartir actividades en comunidad ${place}.`;
  return `Una propuesta de la Agenda de la Comunidad para conocer ${cleanTitle} ${place}.`;
}

/**
 * Microcopy de Agenda siguiendo el patrón de las tarjetas de Figma.
 * Las fechas únicas no se convierten en eventos recurrentes.
 */
function displayDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return 'Fecha a confirmar';
  const date = new Date(isoDate + 'T12:00:00Z');
  if (Number.isNaN(date.getTime())) return 'Fecha a confirmar';
  const formatted = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(date).replace(',', '');
  return formatted.charAt(0).toLocaleUpperCase('es-AR') + formatted.slice(1);
}

/** Horarios compactos y consistentes: 16:00 h / 15:00 a 16:30 h. */
function parseHour(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/\s*(?:hs|h)\.?$/, '').trim();
  const match = /^(\d{1,2})(?:[:.](\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
}

function displayTime(raw: string): string {
  const value = raw.trim();
  if (!value) return 'Horario a confirmar';
  const range = /^(.+?)\s+(?:a|hasta)\s+(.+)$/i.exec(value);
  if (range) {
    const start = parseHour(range[1]!);
    const end = parseHour(range[2]!);
    if (start && end) return `${start} a ${end} h`;
  }
  const single = parseHour(value);
  return single ? `${single} h` : value;
}

/**
 * La planilla se preserva íntegra. Solo se publican filas con datos confirmables:
 * fecha exacta, título, tipo, categoría, localidad, sede y horario definidos,
 * además de flags explícitos para inscripción y suspensión.
 * La fecha 30/11 de «Palabras desde el barrio» se usó para agrupar talleres
 * sin día informado: no debe mostrarse como fecha cierta.
 * Los índices originales se conservan para no cambiar los ID y enlaces existentes.
 */
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string): boolean {
  const range = /^(.+?)\s+(?:a|hasta)\s+(.+)$/i.exec(value.trim());
  return range
    ? parseHour(range[1]!) !== null && parseHour(range[2]!) !== null
    : parseHour(value) !== null;
}

function isPublishableRow(line: string): boolean {
  const fields = line.split('|').map(value => value.trim());
  if (fields.length !== 9 && fields.length !== 10) return false;
  const [dateISO = '', type = '', category = '', locality = '', title = '', time = '', venue = '', registration = '', rain = ''] = fields;
  if (![type, category, locality, title, venue].every(Boolean)) return false;
  if (type === 'Sin especificar' || category === 'Sin categoría') return false;
  if (title.includes('Palabras desde el barrio') && dateISO === '2026-11-30') return false;
  if (!isValidDate(dateISO) || !isValidTime(time)) return false;
  return ['Sí', 'No'].includes(registration) && ['Sí', 'No'].includes(rain);
}

export const agendaActivities: AgendaActivity[] = importedActivityRows
  .map((line, index) => ({ line, index }))
  .filter(({ line }) => isPublishableRow(line))
  .map(({ line, index }) => {
  const [dateISO='',type='',category='',locality='',title='',time='',venue='',registration='',rain='',registrationUrl=''] = line.split('|');
  const badges: AgendaActivity['badges'] = [];
  if (registration === 'Sí') badges.push({ kind:'registration', label:'Requiere inscripción' });
  if (rain === 'Sí') badges.push({ kind:'rain', label:'Se suspende por lluvia' });
  return {
    id: 'actividad-' + (index + 1),
    dateISO,
    title,
    category,
    type,
    locality,
    dayLabel: displayDate(dateISO),
    timeLabel: displayTime(time),
    image: imageForActivity(type, category, title),
    venue: venue || undefined,
    address: addressByVenue[`${venue}|${locality}`],
    badges,
    description: originalActivityDescriptions['actividad-' + (index + 1)] ||
      illustrativeDescription(title, type, locality, venue),
    descriptionIsIllustrative: !originalActivityDescriptions['actividad-' + (index + 1)],
    source: 'Planilla de actividades 2026',
    // El indicador de inscripción no implica que haya una URL disponible.
    registrationUrl: registrationUrl.trim() || undefined,
  };
});

/* Catálogo de tipos proporcionado por diseño + valores documentados del Excel.
 * Mostrar el catálogo completo permite revisar todos los estados de filtros. */
// Orden consistente en todos los menús y paneles, respetando tildes y la Ñ.
const sortFilterOptions = (options: readonly string[]): string[] =>
  [...options].sort((a, b) => a.localeCompare(b, 'es-AR', { sensitivity: 'base', numeric: true }));

export const filterOptions: Record<FilterGroup, readonly string[]> = {
  type: sortFilterOptions([
    'Teatro', 'Infantil', 'Música', 'Danza', 'Humor', 'Magia', 'Circo', 'Títeres',
    'Cine', 'Varieté', 'Taller', 'Taller artístico', 'Taller de danza',
    'Artes del movimiento', 'Taller musical', 'Taller ambiental', 'Visita guiada',
    'Jornada', 'Muestra', 'Charla', 'Aeróbica', 'Cuerpo–mente', 'Entrenamiento',
    'Postural', 'Pileta', 'Torneo', 'Encuentro literario', 'Conversatorio',
    'Presentación', 'Cuerpo-mente', 'Danza/baile', 'Literatura', 'Evento',
    'Exposición', 'Función',
  ]),
  category: sortFilterOptions(['Cultural', 'Deportiva y recreativa', 'Ambiental']),
  locality: sortFilterOptions([
    'Albertina', 'Banfield', 'Budge', 'Centenario', 'Fiorito', 'Lamadrid',
    'Llavallol', 'Lomas de Zamora', 'Parque Barón', 'San José',
    'Santa Catalina', 'Temperley', 'Turdera',
  ]),
  date: sortFilterOptions(['Hoy', 'Esta semana', 'Este fin de semana']),
};

export const filterTitles: Record<FilterGroup, string> = {
  type: 'Tipo de actividad',
  category: 'Categoría',
  locality: 'Localidad',
  date: 'Fecha',
};
