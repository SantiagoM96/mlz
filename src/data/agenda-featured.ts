import type { AgendaActivity } from './agenda';

export const featuredActivity: AgendaActivity = {
  id: 'tita-y-rhodesia',
  title: 'Tita & Rhodesia',
  category: 'Teatro',
  type: 'Función',
  locality: 'Lomas de Zamora',
  dayLabel: 'Sábado 12 de mayo',
  timeLabel: '18:00 h',
  image: import.meta.env.BASE_URL + 'assets/agenda/home-featured.jpg',
  badges: [{ kind: 'registration', label: 'Requiere entrada' }, { kind: 'featured', label: 'Destacado' }],
  venue: 'Teatro Municipal',
  address: 'Manuel Castro 262 - Lomas de Zamora',
  description: 'Actividad teatral presentada en el diseño de referencia de la Agenda de la Comunidad.',
};
