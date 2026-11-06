import type { ConsoleSchedule } from './model';
import { sameScheduleContent } from './scheduleRules';

/** Conserva exactamente las normalizaciones del editor, sin mutar el formulario original. */
export function normalizeConsoleSchedule(value: ConsoleSchedule): ConsoleSchedule {
  return {
    ...value,
    startDate: value.startDate.trim(),
    endDate: value.scheduleType === 'exact' ? '' : value.endDate.trim(),
    weekdays: value.scheduleType === 'recurring' ? [...new Set(value.weekdays)].sort((a, b) => a - b) : [],
    participants: value.participants.trim(),
    detail: value.detail.trim(),
  };
}

/** Valida en el mismo orden que el editor anterior; devuelve el primer mensaje o null. */
export function validateConsoleSchedule(
  normalized: ConsoleSchedule,
  schedules: readonly ConsoleSchedule[],
): string | null {
  if (!normalized.startDate || !normalized.startTime) {
    return 'Completá la fecha y el horario de inicio.';
  }
  if (normalized.scheduleType !== 'exact'
    && (!normalized.endDate || normalized.endDate < normalized.startDate)) {
    return 'La fecha de fin debe ser igual o posterior a la fecha de inicio.';
  }
  if (normalized.scheduleType === 'recurring' && normalized.weekdays.length === 0) {
    return 'Seleccioná al menos un día para la recurrencia.';
  }
  if (normalized.endTime && normalized.endTime <= normalized.startTime) {
    return 'El horario de fin debe ser posterior al horario de inicio.';
  }
  if (schedules.some(item => item.id !== normalized.id && sameScheduleContent(item, normalized))) {
    return 'Ya existe una programación idéntica. Modificá la fecha, el horario, la sede o sus datos particulares.';
  }
  return null;
}
