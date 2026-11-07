import { useState } from 'react';
import type { ConsoleSchedule, ConsoleVenue } from './model';
import { DEMO_VENUES, INITIAL_SCHEDULES } from './demoData';
import { createDemoSchedule } from './scheduleRules';

/** Gestiona programaciones y sedes de la demostración; no persiste datos. */
export function useConsoleSchedules(initialSchedules: () => ConsoleSchedule[] = () => [...INITIAL_SCHEDULES]) {
  const [schedules, setSchedules] = useState<ConsoleSchedule[]>(() =>
    initialSchedules().map(schedule => ({ ...schedule, weekdays: [...schedule.weekdays] })),
  );
  const [scheduleEditor, setScheduleEditor] = useState<{
    mode: 'create' | 'edit' | 'duplicate'; schedule: ConsoleSchedule;
  } | null>(null);
  const [venues, setVenues] = useState<ConsoleVenue[]>(() => DEMO_VENUES.map(item => ({ ...item })));

  const beginNewSchedule = () => {
    const nextId = Math.max(0, ...schedules.map(schedule => schedule.id)) + 1;
    setScheduleEditor({ mode: 'create', schedule: createDemoSchedule(nextId) });
  };
  const editSchedule = (schedule: ConsoleSchedule) => {
    setScheduleEditor({ mode: 'edit', schedule: { ...schedule, weekdays: [...schedule.weekdays] } });
  };
  const saveSchedule = (schedule: ConsoleSchedule) => {
    setSchedules(current => scheduleEditor?.mode === 'edit'
      ? current.map(item => item.id === schedule.id ? schedule : item)
      : [...current, schedule]);
    setScheduleEditor(null);
  };
  const duplicateSchedule = (schedule: ConsoleSchedule) => {
    const nextId = Math.max(0, ...schedules.map(item => item.id)) + 1;
    setScheduleEditor({
      mode: 'duplicate',
      schedule: { ...schedule, id: nextId, weekdays: [...schedule.weekdays] },
    });
  };
  const createVenue = (venue: Omit<ConsoleVenue, 'id'>): string => {
    const nextId = 'nueva-sede-' + (Math.max(0, ...venues
      .map(item => Number(item.id.replace('nueva-sede-', '')))
      .filter(Number.isFinite)) + 1);
    setVenues(current => [...current, { id: nextId, ...venue }]);
    return nextId;
  };
  const removeSchedule = (id: number) => {
    setSchedules(current => current.filter(schedule => schedule.id !== id));
  };

  const resetSchedules = (next: readonly ConsoleSchedule[]) => {
    setSchedules(next.map(schedule => ({ ...schedule, weekdays: [...schedule.weekdays] })));
    setScheduleEditor(null);
  };
  const closeScheduleEditor = () => setScheduleEditor(null);

  return {
    schedules, scheduleEditor, venues,
    beginNewSchedule, editSchedule, saveSchedule, duplicateSchedule,
    createVenue, removeSchedule, resetSchedules, closeScheduleEditor,
  };
}
