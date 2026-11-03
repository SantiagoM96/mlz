import type { AgendaActivity } from '../../../data/agenda';

/** Mantiene una única forma de construir la consulta de ubicación de la ficha. */
export function getActivityMapQuery(activity: AgendaActivity): string {
  const venue = activity.venue || activity.locality;
  const location = activity.address || venue;
  return encodeURIComponent([location, activity.locality, 'Buenos Aires', 'Argentina'].filter(Boolean).join(', '));
}

export function getActivityMapUrl(activity: AgendaActivity): string {
  return 'https://www.google.com/maps/search/?api=1&query=' + getActivityMapQuery(activity);
}
