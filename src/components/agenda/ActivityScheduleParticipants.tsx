import type { AgendaSchedulePresentation } from '../../features/agenda/utils/activitySchedules';
import { ActivityCharacteristic } from './ActivityCharacteristic';

/** Artistas, oradores u otros participantes se definen por programación. */
export function ActivityScheduleParticipants({
  schedule,
}: {
  schedule: Pick<AgendaSchedulePresentation,
    'participants' | 'participantsType' | 'detail' | 'detailType'>;
}) {
  const people = schedule.participants?.trim();
  const legacy = schedule.detailType === 'artists' ? schedule.detail?.trim() : '';
  const names = people || legacy;
  if (!names) return null;

  const type = people ? (schedule.participantsType ?? 'participants') : 'artists';
  const icon = type === 'artists' ? 'comedy_mask'
    : type === 'speakers' ? 'record_voice_over' : 'groups';

  return (
    <ActivityCharacteristic
      variant="sin-label"
      icon={icon}
      field="artists"
      value={names}
    />
  );
}
