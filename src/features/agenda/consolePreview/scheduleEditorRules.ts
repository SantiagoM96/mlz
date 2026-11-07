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

export type ConsoleScheduleInvalidField = 'startDate' | 'startTime' | 'endDate' | 'weekdays' | 'endTime' | 'schedule';

export interface ConsoleScheduleValidationIssue {
  message: string;
  field: ConsoleScheduleInvalidField;
}

/** Mantiene orden y mensajes originales, indicando también dónde corregir el error. */
export function getConsoleScheduleValidationIssue(
  normalized: ConsoleSchedule,
  schedules: readonly ConsoleSchedule[],
): ConsoleScheduleValidationIssue | null {
  if (!normalized.startDate || !normalized.startTime) {
    return {
      message: 'Completá la fecha y el horario de inicio.',
      field: !normalized.startDate ? 'startDate' : 'startTime',
    };
  }
  if (normalized.scheduleType !== 'exact'
    && (!normalized.endDate || normalized.endDate < normalized.startDate)) {
    return {
      message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
      field: 'endDate',
    };
  }
  if (normalized.scheduleType === 'recurring' && normalized.weekdays.length === 0) {
    return { message: 'Seleccioná al menos un día para la recurrencia.', field: 'weekdays' };
  }
  if (normalized.endTime && normalized.endTime <= normalized.startTime) {
    return { message: 'El horario de fin debe ser posterior al horario de inicio.', field: 'endTime' };
  }
  if (schedules.some(item => item.id !== normalized.id && sameScheduleContent(item, normalized))) {
    return {
      message: 'Ya existe una programación idéntica. Modificá la fecha, el horario, la sede o sus datos particulares.',
      field: 'schedule',
    };
  }
  return null;
}

/** Contrato previo: mensajes y primer error sin modificación para los consumidores existentes. */
export function validateConsoleSchedule(
  normalized: ConsoleSchedule,
  schedules: readonly ConsoleSchedule[],
): string | null {
  return getConsoleScheduleValidationIssue(normalized, schedules)?.message ?? null;
}
