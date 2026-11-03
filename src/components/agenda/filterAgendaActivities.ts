import { agendaActivities, argentinaTodayISO } from '../../data/agenda';
import type { SelectedFilters } from '../../features/agenda/model/filterState';
import type { AgendaSortValue } from '../../features/agenda/model/sort';
import { normalizeAgendaText } from './normalizeAgendaText';

/** Filtrado y ordenamiento puros; nunca modifica el dataset original. */
export function filterAgendaActivities(search: string, filters: SelectedFilters, sort: AgendaSortValue) {
    const normalize = normalizeAgendaText;
    const term = normalize(search.trim());
    const today = argentinaTodayISO();
    const todayDate = new Date(today + 'T12:00:00Z');
    const monday = new Date(todayDate);
    monday.setUTCDate(todayDate.getUTCDate() - (todayDate.getUTCDay() + 6) % 7);
    const weekStart = monday.toISOString().slice(0, 10);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const weekEnd = sunday.toISOString().slice(0, 10);

    const results = agendaActivities.filter(activity => {
      if (term && !normalize([
        activity.title, activity.category, activity.type, activity.locality,
        activity.venue ?? '',
      ].join(' ')).includes(term)) return false;
      if (filters.type.length && !filters.type.some(type => normalize(type) === normalize(activity.type))) return false;
      if (filters.category.length && !filters.category.includes(activity.category)) return false;
      if (filters.locality.length && !filters.locality.includes(activity.locality)) return false;
      if (filters.date.length) {
        const date = activity.dateISO ?? '';
        const isWeek = date >= weekStart && date <= weekEnd;
        const weekDay = date ? new Date(date + 'T12:00:00Z').getUTCDay() : -1;
        const matchesDate = filters.date.some(option =>
          (option === 'Hoy' && date === today) ||
          (option === 'Esta semana' && isWeek) ||
          (option === 'Este fin de semana' && isWeek && (weekDay === 0 || weekDay === 6)));
        if (!matchesDate) return false;
      }
      return true;
    });

    if (sort === 'az') results.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    if (sort === 'za') results.sort((a, b) => b.title.localeCompare(a.title, 'es'));
    if (sort === 'default') {
      // Primero las fechas actuales/futuras, después el archivo (más reciente primero).
      results.sort((a, b) => {
        const aFuture = (a.dateISO ?? '') >= today;
        const bFuture = (b.dateISO ?? '') >= today;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        const order = (a.dateISO ?? '').localeCompare(b.dateISO ?? '');
        return aFuture ? order : -order;
      });
    }
    return results;
}
