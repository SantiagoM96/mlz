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
  isDateApproximate?: boolean;
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

function displayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00Z');
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

function displayTime(value: string): string {
  const trimmed = value.trim();
  const simple = /^(\d{1,2})(?::(\d{1,2}))?\s*(?:h|hs|HS|H)\.?$/i.exec(trimmed);
  if (simple) return `${simple[1]!.padStart(2,'0')}:${(simple[2] ?? '00').padStart(2,'0')} hs`;
  return trimmed;
}

/**
 * Los registros provienen del Excel compartido por el equipo. Algunas actividades ya
 * ocurrieron; se conservan para explorar el buscador, pero se señalan como históricas.
 * No se inventan inscripciones, direcciones ni eventos fuera de la planilla.
 */
export const agendaActivities: AgendaActivity[] = importedActivityRows.map((line, index) => {
  const [dateISO='',type='',category='',locality='',title='',time='',venue='',registration='',rain=''] = line.split('|');
  const isDateApproximate = dateISO === '2026-11-30' && title.includes('Palabras desde el barrio');
  const badges: AgendaActivity['badges'] = [];
  if (registration === 'Sí') badges.push({ kind:'registration', label:'Requiere inscripción' });
  if (rain === 'Sí') badges.push({ kind:'rain', label:'Se suspende por lluvia' });
  return {
    id: 'actividad-' + (index + 1),
    dateISO,
    isDateApproximate,
    title,
    category,
    type,
    locality,
    dayLabel: isDateApproximate ? 'Noviembre 2026 · días según taller' : displayDate(dateISO),
    timeLabel: displayTime(time) || 'Horario a confirmar',
    image: imageForActivity(type, category),
    venue: venue || undefined,
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
    'Exposición', 'Función', 'Sin especificar',
  ],
  category: ['Cultural', 'Deportiva y recreativa', 'Ambiental', 'Sin categoría'],
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
