import { importedActivityRows } from './agenda-imported';

export type ActivityCategory = string;
export type FilterGroup = 'type' | 'category' | 'locality' | 'date';

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
  source?: string;
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

const asset = (name: string) => import.meta.env.BASE_URL + 'assets/agenda/' + name + '.jpg';

/** Recursos ilustrativos existentes, no fotografías específicas de las actividades. */
const imageForActivity = (type: string, category: string): string => {
  if (category === 'Deportiva y recreativa' ||
      ['Aeróbica','Cuerpo-mente','Entrenamiento','Postural','Pileta','Torneo'].includes(type)) {
    return asset('deportes');
  }
  if (type === 'Humor' || type === 'Circo' || type === 'Varieté' || type === 'Magia') {
    return asset('humor');
  }
  return asset('cine');
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
 * Microcopy de Agenda siguiendo el patrón de las tarjetas de Figma.
 * Las fechas únicas no se convierten en eventos recurrentes.
 */
function displayDate(isoDate: string): string {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(isoDate)) return 'Fecha a confirmar';
  const date = new Date(isoDate + 'T12:00:00Z');
  if (Number.isNaN(date.getTime())) return 'Fecha a confirmar';
  const formatted = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(date).replace(',', '');
  return formatted.charAt(0).toLocaleUpperCase('es-AR') + formatted.slice(1);
}

/** Horarios compactos y consistentes: 16:00 h / 15:00 a 16:30 h. */
function parseHour(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/\\s*(?:hs|h)\\.?$/, '').trim();
  const match = /^(\\d{1,2})(?:[:.](\\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
}

function displayTime(raw: string): string {
  const value = raw.trim();
  if (!value) return 'Horario a confirmar';
  const range = /^(.+?)\\s+(?:a|hasta)\\s+(.+)$/i.exec(value);
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
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string): boolean {
  const range = /^(.+?)\\s+(?:a|hasta)\\s+(.+)$/i.exec(value.trim());
  return range
    ? parseHour(range[1]!) !== null && parseHour(range[2]!) !== null
    : parseHour(value) !== null;
}

function isPublishableRow(line: string): boolean {
  const fields = line.split('|').map(value => value.trim());
  if (fields.length !== 9) return false;
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
  const [dateISO='',type='',category='',locality='',title='',time='',venue='',registration='',rain=''] = line.split('|');
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
    image: imageForActivity(type, category),
    venue: venue || undefined,
    address: addressByVenue[`${venue}|${locality}`],
    badges,
    source: 'Planilla de actividades 2026',
  };
});

/* Catálogo de tipos proporcionado por diseño + valores documentados del Excel.
 * Mostrar el catálogo completo permite revisar todos los estados de filtros. */
export const filterOptions: Record<FilterGroup, readonly string[]> = {
  type: [
    'Teatro', 'Infantil', 'Música', 'Danza', 'Humor', 'Magia', 'Circo', 'Títeres',
    'Cine', 'Varieté', 'Taller', 'Taller artístico', 'Taller de danza',
    'Artes del movimiento', 'Taller musical', 'Taller ambiental', 'Visita guiada',
    'Jornada', 'Muestra', 'Charla', 'Aeróbica', 'Cuerpo–mente', 'Entrenamiento',
    'Postural', 'Pileta', 'Torneo', 'Encuentro literario', 'Conversatorio',
    'Presentación', 'Cuerpo-mente', 'Danza/baile', 'Literatura', 'Evento',
    'Exposición', 'Función',
  ],
  category: ['Cultural', 'Deportiva y recreativa', 'Ambiental'],
  locality: [
    'Albertina', 'Banfield', 'Budge', 'Centenario', 'Fiorito', 'Lamadrid',
    'Llavallol', 'Lomas de Zamora', 'Parque Barón', 'San José',
    'Santa Catalina', 'Temperley', 'Turdera',
  ],
  date: ['Hoy', 'Esta semana', 'Este fin de semana'],
};

export const filterTitles: Record<FilterGroup, string> = {
  type: 'Tipo de actividad',
  category: 'Categoría',
  locality: 'Localidad',
  date: 'Fecha',
};
