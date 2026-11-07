import { MaterialIcon, type MaterialIconName } from '../../../components/ui/MaterialIcon';
import { formatAgendaScheduleDate } from '../utils/activitySchedules';
import { venueById } from './scheduleRules';
import type { ConsoleSchedule, ConsoleVenue } from './model';

interface Props {
  schedules: readonly ConsoleSchedule[];
  venues: readonly ConsoleVenue[];
  onEdit: (schedule: ConsoleSchedule) => void;
  onDuplicate: (schedule: ConsoleSchedule) => void;
  onRemove: (id: number) => void;
}

type ActionTone = 'primary' | 'danger';

const actionClassNames: Record<ActionTone, string> = {
  primary: 'inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-primary-600 hover:bg-[#eaf3f9] focus-visible:outline-2 focus-visible:outline-primary-600',
  danger: 'inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-[#b5444b] hover:bg-[#ffedef] focus-visible:outline-2 focus-visible:outline-[#b5444b]',
};

function ScheduleActionButton({
  label, title, icon, onClick, tone = 'primary',
}: {
  label: string;
  title: string;
  icon: MaterialIconName;
  onClick: () => void;
  tone?: ActionTone;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={title} className={actionClassNames[tone]}>
      <MaterialIcon name={icon} size={22} />
    </button>
  );
}

/** Tabla de programaciones: render puro; el estado y los handlers pertenecen a la página. */
export function ScheduleTable({ schedules, venues, onEdit, onDuplicate, onRemove }: Props) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#d4e2eb]" data-testid="console-schedules-table">
      <table className="w-full min-w-[680px] border-collapse text-left text-[15px]">
        <thead className="bg-[#eaf3f9] text-primary-600">
          <tr>
            <th scope="col" className="px-3 py-3 font-bold">Fecha / frecuencia</th>
            <th scope="col" className="px-3 py-3 font-bold">Horario</th>
            <th scope="col" className="px-3 py-3 font-bold">Lugar</th>
            <th scope="col" className="px-3 py-3 font-bold">Lluvia</th>
            <th scope="col" className="px-3 py-3 text-right font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d4e2eb]">
          {schedules.map((schedule, index) => {
            const { dateLabel, periodLabel } = formatAgendaScheduleDate(schedule);
            const venue = venueById(schedule.venueId, venues);
            return (
              <tr key={schedule.id} data-testid="console-schedule-row" className="align-middle">
                <td className="px-3 py-3">
                  <span className="font-bold text-grey-900">{dateLabel}</span>
                  {periodLabel && <span className="mt-1 block text-[13px] leading-5 text-[#657b8d]">{periodLabel}</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {schedule.startTime || 'A confirmar'}
                  {schedule.endTime ? ' a ' + schedule.endTime : ''}{schedule.startTime ? ' h' : ''}
                </td>
                <td className="max-w-[220px] px-3 py-3">
                  <span className="font-medium">{venue.name}</span>
                  {schedule.participants.trim() && (
                    <span className="mt-1 flex items-start gap-1.5 text-[13px] leading-5 text-[#61788b]">
                      <MaterialIcon name={schedule.participantsType === 'artists' ? 'comedy_mask'
                        : schedule.participantsType === 'speakers' ? 'record_voice_over' : 'groups'} size={16}/>
                      <span className="min-w-0 break-words">{schedule.participants}</span>
                    </span>
                  )}
                  {schedule.detail.trim() && (
                    <span className="mt-1 block max-w-[210px] truncate text-[13px] leading-5 text-[#61788b]"
                      title={schedule.detail}>{schedule.detail}</span>
                  )}
                </td>
                <td className="px-3 py-3">{schedule.suspendedByRain ? 'Sí' : 'No'}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <ScheduleActionButton
                      icon="edit" title="Editar" label={'Editar programación ' + (index + 1)}
                      onClick={() => onEdit(schedule)}
                    />
                    <ScheduleActionButton
                      icon="content_copy" title="Duplicar" label={'Duplicar programación ' + (index + 1)}
                      onClick={() => onDuplicate(schedule)}
                    />
                    <ScheduleActionButton
                      icon="delete" tone="danger" title="Eliminar" label={'Eliminar programación ' + (index + 1)}
                      onClick={() => onRemove(schedule.id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
          {schedules.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-[#607487]">
              Todavía no hay programaciones. Agregá una para comenzar.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
