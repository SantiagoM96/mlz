import { expect, test } from '@playwright/test';
import { DEMO_VENUES } from '../../src/features/agenda/consolePreview/demoData';
import { createDemoSchedule, sameScheduleContent, venueById } from '../../src/features/agenda/consolePreview/scheduleRules';

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
