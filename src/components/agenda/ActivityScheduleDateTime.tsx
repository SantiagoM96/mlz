import type { AgendaSchedulePresentation } from '../../features/agenda/utils/activitySchedules';
import { ActivityCharacteristic } from './ActivityCharacteristic';

/**
 * Un único bloque de fecha y horario para tarjetas, detalle y consola.
 * Calendario: frecuencia/fecha en negrita, período en regular.
 * Reloj: componente hermano e independiente; en detalle conserva el peso regular.
 */
export function ActivityScheduleDateTime({
  schedule, timeWeight = 'bold',
}: {
  schedule: Pick<AgendaSchedulePresentation, 'dateLabel' | 'periodLabel' | 'timeLabel'>;
  timeWeight?: 'bold' | 'normal';
}) {
  return (
    <>
      {schedule.periodLabel ? (
        <ActivityCharacteristic
          variant="con-label"
          icon="event_available"
          field="date"
          label={schedule.dateLabel}
          value={schedule.periodLabel}
        />
      ) : (
        <ActivityCharacteristic
          variant="sin-label"
          icon="event_available"
          field="date"
          value={schedule.dateLabel}
        />
      )}
      <ActivityCharacteristic
        variant="sin-label"
        icon="schedule"
        field="time"
        value={schedule.timeLabel}
        textWeight={timeWeight}
      />
    </>
  );
}
