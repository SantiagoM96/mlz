import type { AgendaActivity } from '../../../data/agenda';
import { ActivityBadges } from '../../../components/agenda/ActivityBadges';
import { ActivityScheduleParticipants } from '../../../components/agenda/ActivityScheduleParticipants';
import { ActivityScheduleDateTime } from '../../../components/agenda/ActivityScheduleDateTime';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import type { AgendaSchedulePresentation } from '../utils/activitySchedules';
import { formatActivityAddress } from '../utils/formatActivityAddress';
import { getActivityMapUrl } from '../utils/activityMap';

interface Props {
  activity: AgendaActivity;
  presentations: readonly AgendaSchedulePresentation[];
  missing: NonNullable<AgendaActivity['schedules']>;
  badges: AgendaActivity['badges'];
  multipleLocations: boolean;
}

/** Resumen de programación de la vista de consola: conserva casos aún sin fecha. */
export function ConsoleDetailScheduleSummary({
  activity, presentations, missing, badges, multipleLocations,
}: Props) {
  const rainBadge = { kind: 'rain' as const, label: 'Se suspende por lluvia' };

  return (
              <aside aria-label="Cuándo y dónde" className="min-w-0">
                <h3 className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">Cuándo y dónde</h3>
                {badges.length > 0 && <div className="mb-4"><ActivityBadges badges={badges} /></div>}
                {presentations.length === 0 && missing.length === 0 && (
                  <p className="rounded-lg border border-[#d1d1d1] p-4 text-[16px] text-grey-900">
                    Agregá una programación para ver las fechas.
                  </p>
                )}
                <div className="space-y-4">
                  {presentations.map(schedule => (
                    <div key={schedule.id} data-testid="agenda-detail-programming" className="space-y-4">
                      {schedule.suspendedByRain === true && (
                        <div data-testid="agenda-schedule-rain" className="w-fit max-w-full">
                          <ActivityBadges badges={[rainBadge]} />
                        </div>
                      )}
                    <section className="min-w-0 rounded-lg border border-[#d1d1d1] bg-white p-4">
                      <div className="space-y-4 text-[18px] leading-[26px] text-grey-900">
                        <ActivityScheduleDateTime schedule={schedule} />
                        {multipleLocations && (
                          <div className="space-y-1 pt-2">
                            <p className="font-bold">{schedule.venue}</p>
                            {schedule.address && (
                              <>
                                <p className="break-words">{formatActivityAddress(schedule.address, schedule.locality)}</p>
                                <a
                                  href={getActivityMapUrl({
                                    ...activity, locality: schedule.locality,
                                    venue: schedule.venue, address: schedule.address,
                                  })}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
                                >
                                  Ver en Google Maps <MaterialIcon name="chevron_right" size={20} />
                                </a>
                              </>
                            )}
                          </div>
                        )}
                        <ActivityScheduleParticipants schedule={schedule} />
                        {schedule.detailType !== 'artists' && schedule.detail?.trim() && (
                          <p className="pt-1 whitespace-pre-line italic text-[#888]">{schedule.detail}</p>
                        )}
                      </div>
                    </section>
                    </div>
                  ))}
                  {missing.map(schedule => (
                    <section key={schedule.id} className="rounded-lg border border-[#d1d1d1] bg-white p-4 text-[18px] leading-[26px]">
                      <div className="space-y-4">
                        <ActivityScheduleDateTime
                          schedule={{
                            dateLabel: 'Fecha a confirmar',
                            timeLabel: schedule.startTime
                              ? schedule.startTime + (schedule.endTime ? ' a ' + schedule.endTime : '') + ' h'
                              : 'Horario a confirmar',
                          }}
                        />
                        <p>{schedule.venue}</p>
                      </div>
                    </section>
                  ))}
                </div>
              </aside>
  );
}
