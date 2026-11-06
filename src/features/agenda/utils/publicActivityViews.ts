import type { AgendaActivity, AgendaSchedule } from '../../../data/agenda';

/**
 * La consola conserva una única actividad con N programaciones.
 * La web pública representa una ficha por sede, excepto encuentros puntuales
 * con detalle propio, que tienen una ficha individual por programación.
 * El resultado es derivado: nunca se modifican los registros originales.
 */
const venueKey = (schedule: AgendaSchedule): string =>
  [schedule.venue, schedule.locality, schedule.address ?? '']
    .map(value => value.trim().toLocaleLowerCase('es-AR')).join('|');

const venueSlug = (name: string): string =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sede';

function badgesForVenue(
  activity: AgendaActivity,
  schedules: readonly AgendaSchedule[],
): AgendaActivity['badges'] {
  const other = activity.badges.filter(badge => badge.kind !== 'rain');
  // La lluvia no se hereda desde la actividad: la define cada programación.
  // Cuando todas las programaciones de una tarjeta coinciden, mostrar una chip arriba.
  const allSuspend = schedules.length > 0 && schedules.every(schedule => schedule.suspendedByRain === true);
  return allSuspend
    ? [...other, { kind: 'rain', label: 'Se suspende por lluvia' }]
    : other;
}

/**
 * Misma sede + distintas fechas/horarios => una ficha.
 * Excepción: encuentros puntuales con detalle editorial propio => una ficha
 * por encuentro, aunque compartan sede, con detalle y mapa independientes.
 * Las programaciones recurrentes siguen agrupadas.
 */
export function getPublicActivityViews(activity: AgendaActivity): AgendaActivity[] {
  if (!activity.schedules?.length) return [activity];

  const groups = new Map<string, AgendaSchedule[]>();
  for (const schedule of activity.schedules) {
    // Un encuentro con artistas/contenido propio no comparte detalle con otra fecha.
    const uniqueEncounter = schedule.scheduleType === 'exact' && Boolean(schedule.detail?.trim() || schedule.participants?.trim());
    const key = venueKey(schedule) + (uniqueEncounter ? '|encuentro:' + schedule.id : '');
    const existing = groups.get(key);
    if (existing) existing.push(schedule);
    else groups.set(key, [schedule]);
  }

  const usedSlugs = new Map<string, number>();
  return [...groups.values()].map(schedules => {
    const first = schedules[0];
    if (!first) return activity;
    const venue = venueSlug(first.venue || first.locality);
    // Las URLs por fecha distinguen dos encuentros realizados en una misma sede.
    const encounter = schedules.length === 1 && first.scheduleType === 'exact' && Boolean(first.detail?.trim() || first.participants?.trim());
    const slug = encounter ? venue + '--fecha-' + first.startDate : venue;
    const occurrence = (usedSlugs.get(slug) ?? 0) + 1;
    usedSlugs.set(slug, occurrence);
    const suffix = occurrence === 1 ? slug : slug + '-' + occurrence;

    return {
      ...activity,
      id: groups.size > 1 ? activity.id + '--sede-' + suffix : activity.id,
      locality: first.locality,
      venue: first.venue,
      address: first.address,
      schedules: [...schedules],
      badges: badgesForVenue(activity, schedules),
    };
  });
}

export function getPublicActivityList(activities: readonly AgendaActivity[]): AgendaActivity[] {
  return activities.flatMap(getPublicActivityViews);
}
