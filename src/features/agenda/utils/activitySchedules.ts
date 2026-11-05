import type { AgendaActivity, AgendaSchedule } from '../../../data/agenda';
import { argentinaTodayISO } from '../../../data/agenda';

export interface AgendaSchedulePresentation {
  id: string;
  dateLabel: string;
  periodLabel?: string;
  timeLabel: string;
  locality: string;
  venue?: string;
  address?: string;
  detail?: string;
  suspendedByRain?: boolean;
}

const weekdays: Record<number, string> = {
  1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves',
  5: 'viernes', 6: 'sábados', 7: 'domingos',
};

/** No parsear fechas de calendario con el huso horario local del visitante. */
function parseDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(iso + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso
    ? date : null;
}

function dayInWords(iso: string): string {
  const date = parseDate(iso);
  if (!date) return 'Fecha a confirmar';
  const label = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(date).replace(',', '');
  return label.charAt(0).toLocaleUpperCase('es-AR') + label.slice(1);
}

function shortDate(iso: string): string {
  if (!parseDate(iso)) return 'Fecha a confirmar';
  const [year, month, day] = iso.split('-');
  return day + '/' + month + '/' + year;
}

function periodInWords(startISO: string, endISO: string): string {
  const start = parseDate(startISO);
  const end = parseDate(endISO);
  if (!start || !end) return 'Fechas a confirmar';
  const day = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', day: 'numeric' });
  const month = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', month: 'long' });
  if (start.getUTCFullYear() === end.getUTCFullYear() &&
      start.getUTCMonth() === end.getUTCMonth()) {
    return 'Del ' + day.format(start) + ' al ' + day.format(end) + ' de ' + month.format(end);
  }
  return 'Del ' + shortDate(startISO) + ' al ' + shortDate(endISO);
}

function recurringLabel(days: readonly number[] | null | undefined): string {
  const sorted = [...new Set(days ?? [])].filter(day => day >= 1 && day <= 7)
    .sort((a, b) => a - b);
  const labels = sorted.map(day => weekdays[day]);
  if (labels.length === 0) return 'Días a confirmar';
  if (labels.length === 1) return 'Todos los ' + labels[0];
  return 'Todos los ' + labels.slice(0, -1).join(', ') + ' y ' + labels[labels.length - 1];
}

function normalizeTime(raw: string): string {
  return raw.trim().slice(0, 5);
}

function scheduleTime(schedule: AgendaSchedule): string {
  const start = normalizeTime(schedule.startTime);
  if (!start) return 'Horario a confirmar';
  const end = schedule.endTime ? normalizeTime(schedule.endTime) : null;
  return end ? start + ' a ' + end + ' h' : start + ' h';
}

function toPresentation(schedule: AgendaSchedule): AgendaSchedulePresentation {
  const { scheduleType, startDate, endDate } = schedule;
  return {
    id: schedule.id,
    dateLabel: scheduleType === 'recurring'
      ? recurringLabel(schedule.weekdays)
      : scheduleType === 'range' && endDate
        ? periodInWords(startDate, endDate)
        : dayInWords(startDate),
    periodLabel: scheduleType === 'recurring' && endDate
      ? 'Del ' + shortDate(startDate) + ' al ' + shortDate(endDate)
      : scheduleType === 'range' ? 'Todos los días' : undefined,
    timeLabel: scheduleTime(schedule),
    locality: schedule.locality,
    venue: schedule.venue,
    address: schedule.address,
    detail: schedule.detail,
    suspendedByRain: schedule.suspendedByRain,
  };
}

/** El archivo importado sigue intacto. Los nuevos registros V2 pueden traer N programaciones. */
export function getActivitySchedulePresentations(
  activity: AgendaActivity, todayISO = argentinaTodayISO(),
): AgendaSchedulePresentation[] {
  if (activity.schedules === undefined) {
    return [{
      id: 'legacy-' + activity.id,
      dateLabel: activity.dayLabel,
      timeLabel: activity.timeLabel,
      locality: activity.locality,
      venue: activity.venue,
      address: activity.address,
    }];
  }
  return [...activity.schedules]
    .filter(schedule => (schedule.endDate ?? schedule.startDate) >= todayISO)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.startTime.localeCompare(b.startTime))
    .map(toPresentation);
}

export function isAgendaActivityVisible(
  activity: AgendaActivity, todayISO = argentinaTodayISO(),
): boolean {
  return activity.schedules === undefined ||
    getActivitySchedulePresentations(activity, todayISO).length > 0;
}

/** Detecta si la actividad utiliza una sola sede física, aunque tenga varios horarios. */
export function getUniqueActivityLocations(
  schedules: readonly AgendaSchedulePresentation[],
): AgendaSchedulePresentation[] {
  const found = new Set<string>();
  return schedules.filter(schedule => {
    const key = [schedule.locality, schedule.venue, schedule.address]
      .map(value => value?.trim().toLocaleLowerCase('es-AR') ?? '').join('|');
    if (found.has(key)) return false;
    found.add(key);
    return true;
  });
}
