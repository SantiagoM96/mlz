import type { AgendaActivity, AgendaSchedule } from '../../../data/agenda';

/**
 * La consola conserva una única actividad con N programaciones.
 * La web pública representa una tarjeta/detalle por sede (no por día u horario).
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
  const explicitRain = schedules.some(schedule => schedule.suspendedByRain !== undefined);
  const allSuspend = schedules.length > 0 && schedules.every(schedule => schedule.suspendedByRain === true);
  const generalRain = activity.badges.find(badge => badge.kind === 'rain');
  const showRain = explicitRain ? allSuspend : Boolean(generalRain);
  return showRain
    ? [...other, generalRain ?? { kind: 'rain', label: 'Se suspende por lluvia' }]
    : other;
}

/**
 * Misma sede + distintas fechas/horarios => una ficha.
 * Sede diferente => ficha pública y mapa independientes.
 */
export function getPublicActivityViews(activity: AgendaActivity): AgendaActivity[] {
  if (!activity.schedules?.length) return [activity];

  const groups = new Map<string, AgendaSchedule[]>();
  for (const schedule of activity.schedules) {
    const key = venueKey(schedule);
    const existing = groups.get(key);
    if (existing) existing.push(schedule);
    else groups.set(key, [schedule]);
  }

  const usedSlugs = new Map<string, number>();
  return [...groups.values()].map(schedules => {
    const first = schedules[0];
    const slug = venueSlug(first.venue || first.locality);
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
