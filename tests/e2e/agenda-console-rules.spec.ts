import { expect, test } from '@playwright/test';
import { DEMO_VENUES } from '../../src/features/agenda/consolePreview/demoData';
import { createDemoSchedule, sameScheduleContent, venueById } from '../../src/features/agenda/consolePreview/scheduleRules';
import { normalizeConsoleSchedule, validateConsoleSchedule, getConsoleScheduleValidationIssue } from '../../src/features/agenda/consolePreview/scheduleEditorRules';
import { normalizeVenueInput, validateVenueInput } from '../../src/features/agenda/consolePreview/venueRules';

test.describe('Agenda V2 — contratos puros de programaciones', () => {
  test('una programación nueva conserva valores iniciales de demostración', () => {
    expect(createDemoSchedule(17)).toEqual({
      id: 17,
      scheduleType: 'exact',
      startDate: '',
      endDate: '',
      weekdays: [],
      startTime: '',
      endTime: '',
      venueId: 'plaza-grigera',
      suspendedByRain: false,
      detail: '',
      participants: '',
      participantsType: 'participants',
    });
  });

  test('duplicados: ignora ID, orden de días repetidos y espacios editoriales', () => {
    const first = {
      ...createDemoSchedule(1),
      scheduleType: 'recurring' as const,
      startDate: '2026-11-07',
      endDate: '2026-11-28',
      weekdays: [6, 2, 6],
      startTime: '10:00',
      endTime: '12:00',
      detail: '  Charla y práctica  ',
      participants: 'Ana y Juan',
    };
    const second = {
      ...first,
      id: 2,
      weekdays: [2, 6],
      detail: 'Charla y práctica',
      participants: ' Ana y Juan ',
    };
    expect(sameScheduleContent(first, second)).toBe(true);
  });

  test('un cambio de fecha, sede, horario o lluvia diferencia programaciones', () => {
    const base = {
      ...createDemoSchedule(1),
      scheduleType: 'range' as const,
      startDate: '2026-11-11',
      endDate: '2026-11-20',
      startTime: '10:00',
      venueId: 'plaza-grigera',
    };
    expect(sameScheduleContent(base, { ...base, id: 2, startDate: '2026-11-12' })).toBe(false);
    expect(sameScheduleContent(base, { ...base, id: 2, endDate: '2026-11-21' })).toBe(false);
    expect(sameScheduleContent(base, { ...base, id: 2, startTime: '11:00' })).toBe(false);
    expect(sameScheduleContent(base, { ...base, id: 2, venueId: 'parque-lomas' })).toBe(false);
    expect(sameScheduleContent(base, { ...base, id: 2, suspendedByRain: true })).toBe(false);
  });

  test('para una fecha puntual se ignoran campos de período y recurrencia inactivos', () => {
    const base = {
      ...createDemoSchedule(1),
      startDate: '2026-11-11',
      startTime: '10:00',
    };
    expect(sameScheduleContent(
      { ...base, endDate: '2026-11-15', weekdays: [6] },
      { ...base, id: 2, endDate: '', weekdays: [] },
    )).toBe(true);
  });

  test('búsqueda de sedes: reutiliza una existente y conserva fallback actual', () => {
    expect(venueById('parque-lomas', DEMO_VENUES).name).toBe('Parque de Lomas');
    expect(venueById('sede-inexistente', DEMO_VENUES).id).toBe('plaza-grigera');
  });
});

test.describe('Agenda V2 — reglas de guardado del editor', () => {
  test('normalización conserva datos y no muta días ni el borrador original', () => {
    const draft = {
      ...createDemoSchedule(7),
      scheduleType: 'recurring' as const,
      startDate: ' 2026-11-07 ',
      endDate: ' 2026-11-28 ',
      weekdays: [6, 2, 6],
      startTime: '10:00',
      participants: ' Ana y Juan ',
      detail: '  Encuentro  ',
    };
    const result = normalizeConsoleSchedule(draft);
    expect(result).toMatchObject({
      id: 7,
      startDate: '2026-11-07',
      endDate: '2026-11-28',
      weekdays: [2, 6],
      participants: 'Ana y Juan',
      detail: 'Encuentro',
    });
    expect(draft.weekdays).toEqual([6, 2, 6]);
    expect(draft.startDate).toBe(' 2026-11-07 ');
  });

  test('fecha puntual descarta fin de período y días no activos', () => {
    const draft = { ...createDemoSchedule(7), startDate: '2026-11-12', startTime: '10:00', endDate: '2026-11-30', weekdays: [6] };
    expect(normalizeConsoleSchedule(draft)).toMatchObject({ endDate: '', weekdays: [] });
  });

  test('errores se mantienen en orden: requeridos, fechas, recurrencia y horario', () => {
    const empty = createDemoSchedule(7);
    expect(validateConsoleSchedule(empty, [])).toBe('Completá la fecha y el horario de inicio.');
    const range = { ...empty, scheduleType: 'range' as const, startDate: '2026-11-20', endDate: '2026-11-18', startTime: '11:00' };
    expect(validateConsoleSchedule(range, [])).toBe('La fecha de fin debe ser igual o posterior a la fecha de inicio.');
    const recurring = { ...range, scheduleType: 'recurring' as const, endDate: '2026-11-21', weekdays: [] };
    expect(validateConsoleSchedule(recurring, [])).toBe('Seleccioná al menos un día para la recurrencia.');
    expect(validateConsoleSchedule({ ...recurring, weekdays: [6], endTime: '10:00' }, [])).toBe('El horario de fin debe ser posterior al horario de inicio.');
  });

  test('identifica duplicados por contenido excluyendo la misma ID, sin falsos positivos', () => {
    const value = { ...createDemoSchedule(1), startDate: '2026-11-20', startTime: '11:00' };
    expect(validateConsoleSchedule(value, [value])).toBeNull();
    expect(validateConsoleSchedule({ ...value, id: 2 }, [value])).toContain('Ya existe una programación idéntica.');
    expect(validateConsoleSchedule({ ...value, id: 2, startTime: '12:00' }, [value])).toBeNull();
  });
});

test.describe('Agenda V2 — reglas puras de sedes', () => {
  test('normaliza espacios sin alterar la sede ingresada', () => {
    const input = { name: ' Centro   Cultural ', locality: '  Banfield ', address: 'Maipú   123 ' };
    expect(normalizeVenueInput(input)).toEqual({ name: 'Centro Cultural', locality: 'Banfield', address: 'Maipú 123' });
    expect(input.name).toBe(' Centro   Cultural ');
  });

  test('primero valida campos y luego duplicados por nombre y localidad', () => {
    expect(validateVenueInput({ name: '', locality: '', address: '' }, DEMO_VENUES))
      .toBe('Completá nombre, localidad y dirección para guardar la sede.');
    expect(validateVenueInput({
      name: 'PLAZA GRIGERA', locality: 'lomas de zamora', address: 'Una dirección nueva',
    }, DEMO_VENUES)).toBe('Esta sede ya está registrada. Seleccionala en la lista.');
    expect(validateVenueInput({
      name: 'Plaza Grigera', locality: 'Banfield', address: 'Maipú 123',
    }, DEMO_VENUES)).toBeNull();
  });
});

test('Agenda V2 — accesibilidad: identifica campo incorrecto conservando mensajes', () => {
  const empty = createDemoSchedule(8);
  expect(getConsoleScheduleValidationIssue(empty, []))
    .toEqual({ field: 'startDate', message: 'Completá la fecha y el horario de inicio.' });
  const withDate = { ...empty, startDate: '2026-11-20' };
  expect(getConsoleScheduleValidationIssue(withDate, [])?.field).toBe('startTime');
  const withTime = { ...withDate, startTime: '11:00' };
  expect(getConsoleScheduleValidationIssue(withTime, [])).toBeNull();
  const range = { ...withTime, scheduleType: 'range' as const, endDate: '2026-11-18' };
  expect(getConsoleScheduleValidationIssue(range, [])?.field).toBe('endDate');
  const recurring = { ...range, endDate: '2026-11-21', scheduleType: 'recurring' as const };
  expect(getConsoleScheduleValidationIssue(recurring, [])?.field).toBe('weekdays');
  expect(getConsoleScheduleValidationIssue({ ...recurring, weekdays: [6], endTime: '10:00' }, [])?.field)
    .toBe('endTime');
  expect(getConsoleScheduleValidationIssue({ ...withTime, id: 9 }, [withTime])?.field).toBe('schedule');
});
