import { argentinaTodayISO, type AgendaActivity, type AgendaSchedule } from '../../../data/agenda';

/** Una actividad por categoría principal, ordenada según su próxima ocurrencia real. */
const homeCategories = ['Deportiva y recreativa', 'Cultural', 'Ambiental'] as const;

type Occurrence = { dateISO: string; startTime: string; schedule?: AgendaSchedule };

function argentinaCurrentTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
}

/** Fechas ISO tratadas como días de calendario, sin convertirlas al huso del visitante. */
function addDays(iso: string, days: number): string {
  const date = new Date(iso + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isStillAvailable(schedule: AgendaSchedule, dateISO: string, todayISO: string, nowTime: string): boolean {
  if (dateISO !== todayISO) return true;
  return (schedule.endTime?.slice(0, 5) ?? schedule.startTime.slice(0, 5)) > nowTime;
}

function nextScheduleOccurrence(
  schedule: AgendaSchedule,
  todayISO: string,
  nowTime: string,
): Occurrence | null {
  const endDate = schedule.endDate ?? schedule.startDate;
  const firstDate = schedule.startDate > todayISO ? schedule.startDate : todayISO;
  if (endDate < firstDate) return null;

  if (schedule.scheduleType === 'exact') {
    return isStillAvailable(schedule, firstDate, todayISO, nowTime)
      ? { dateISO: firstDate, startTime: schedule.startTime, schedule }
      : null;
  }

  // Un período admite fechas consecutivas; una recurrencia respeta los días programados.
  // Ocho días bastan para encontrar la próxima ocurrencia de cualquier día de la semana.
  const maxDays = schedule.scheduleType === 'recurring' ? 8 : 2;
  for (let offset = 0; offset < maxDays; offset++) {
    const dateISO = addDays(firstDate, offset);
    if (dateISO > endDate) break;
    if (schedule.scheduleType === 'recurring') {
      const weekday = new Date(dateISO + 'T12:00:00Z').getUTCDay() || 7;
      if (!schedule.weekdays?.includes(weekday)) continue;
    }
    if (!isStillAvailable(schedule, dateISO, todayISO, nowTime)) continue;
    return { dateISO, startTime: schedule.startTime, schedule };
  }
  return null;
}

function nextOccurrence(activity: AgendaActivity, todayISO: string, nowTime: string): Occurrence | null {
  if (activity.schedules !== undefined) {
    const occurrences = activity.schedules
      .map(schedule => nextScheduleOccurrence(schedule, todayISO, nowTime))
      .filter((item): item is Occurrence => item !== null);
    occurrences.sort(compareOccurrence);
    return occurrences[0] ?? null;
  }

  const dateISO = activity.dateISO;
  if (!dateISO || dateISO < todayISO) return null;
  const time = /^\d{1,2}:\d{2}/.exec(activity.timeLabel)?.[0]?.padStart(5, '0') ?? '00:00';
  if (dateISO === todayISO && time < nowTime) return null;
  return { dateISO, startTime: time };
}

function compareOccurrence(a: Occurrence, b: Occurrence): number {
  return a.dateISO.localeCompare(b.dateISO) || a.startTime.localeCompare(b.startTime);
}

/** Selección derivada: conserva los IDs/links públicos y nunca modifica el catálogo. */
export function getUpcomingHomeActivities(
  activities: readonly AgendaActivity[],
  todayISO = argentinaTodayISO(),
  nowTime = argentinaCurrentTime(),
): AgendaActivity[] {
  return homeCategories.flatMap(category => {
    const candidates = activities
      .filter(activity => activity.category === category)
      .map(activity => ({ activity, occurrence: nextOccurrence(activity, todayISO, nowTime) }))
      .filter((candidate): candidate is { activity: AgendaActivity; occurrence: Occurrence } =>
        candidate.occurrence !== null);
    candidates.sort((a, b) => compareOccurrence(a.occurrence, b.occurrence));
    const first = candidates[0];
    if (!first) return [];

    // La Home presenta solo la próxima programación de cada tarjeta;
    // el detalle sigue mostrando todas las fechas de la actividad original.
    const schedule = first.occurrence.schedule;
    return [schedule ? { ...first.activity, schedules: [schedule] } : first.activity];
  });
}
