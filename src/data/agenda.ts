export type ActivityCategory = 'Entrenamiento' | 'Deportes' | 'Humor' | 'Teatro';
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
  venue?: string;
  address?: string;
  description?: string;
}

const asset = (name: string) => import.meta.env.BASE_URL + 'assets/agenda/' + name + '.jpg';

// Contenido de demostración basado en las tarjetas repetidas del frame Figma.
// No representa fechas confirmadas de la agenda municipal real.
const samples: Omit<AgendaActivity, 'id'>[] = [
  { title: 'Futbol', category: 'Entrenamiento', type: 'Cine', locality: 'Banfield', dayLabel: 'Todos los jueves', timeLabel: '16:00 hs', image: asset('cine'), badges: [{ kind: 'rain', label: 'Se suspende por lluvia' }, { kind: 'accessible', label: 'Disciplinas inclusivas' }] },
  { title: 'Patin', category: 'Deportes', type: 'Deportes', locality: 'Lomas de Zamora', dayLabel: 'Todos los jueves', timeLabel: '16:00 hs', image: asset('deportes'), badges: [{ kind: 'registration', label: 'Requiere inscripción' }] },
  { title: 'Excursiones forestales', category: 'Humor', type: 'Humor', locality: 'Banfield', dayLabel: 'Todos los jueves', timeLabel: '16:00 hs', image: asset('humor'), badges: [{ kind: 'registration', label: 'Requiere inscripción' }] },
];

// La pantalla de Figma utiliza cards de ejemplo y repite sus variantes.
export const agendaActivities: AgendaActivity[] = Array.from({ length: 18 }, (_, i) => ({
  ...samples[i % samples.length]!,
  id: 'actividad-' + (i + 1),
}));

export const filterOptions: Record<FilterGroup, readonly string[]> = {
  type: ['Charla', 'Cine', 'Cuerpo-mente', 'Danza', 'Danza/baile', 'Entrenamiento', 'Exposición', 'Exposición/muestra', 'Función', 'Jornada', 'Taller musical', 'Visita guiada', 'Deportes', 'Humor'],
  category: ['Ambiental', 'Deportiva y recreativa', 'Cultural', 'Entrenamiento', 'Deportes', 'Humor'],
  locality: ['Albertina', 'Banfield', 'Budge', 'Centenario', 'Fiorito', 'Lamadrid', 'Llavallol', 'Lomas de Zamora', 'Parque Barón', 'San José', 'Santa Catalina', 'Santa Marta'],
  date: ['Hoy', 'Esta semana', 'Este fin de semana'],
};

export const filterTitles: Record<FilterGroup, string> = {
  type: 'Tipo de actividad',
  category: 'Categoría',
  locality: 'Localidad',
  date: 'Fecha',
};
