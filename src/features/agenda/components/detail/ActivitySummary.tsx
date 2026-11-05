import type { AgendaActivity } from '../../../../data/agenda';
import { ActivityBadges } from '../../../../components/agenda/ActivityBadges';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';
import { getActivityMapUrl } from '../../utils/activityMap';
import { formatActivityAddress } from '../../utils/formatActivityAddress';
import {
  getActivitySchedulePresentations, getUniqueActivityLocations,
} from '../../utils/activitySchedules';

/** Presenta una tarjeta por programación; no genera una tarjeta por cada sábado. */
export function ActivitySummary({
  activity, previewDateISO,
}: { activity: AgendaActivity; previewDateISO?: string }) {
  const schedules = getActivitySchedulePresentations(activity, previewDateISO);
  const multiple = getUniqueActivityLocations(schedules).length > 1;

  return (
    <aside aria-label="Cuándo y dónde" className="min-w-0">
      <h2 className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">
        Cuándo y dónde
      </h2>
      {activity.badges.length > 0 && (
        <div className="mb-4">
          <ActivityBadges badges={activity.badges} />
        </div>
      )}
      <div className="space-y-4">
        {schedules.map(schedule => (
          <section key={schedule.id} className="min-w-0 rounded-[4px] border border-[#d1d1d1] bg-white p-4">
            <div className="space-y-2 text-[18px] leading-[26px] text-grey-900">
              <p className="font-bold">{schedule.dateLabel}</p>
              {schedule.periodLabel && <p>{schedule.periodLabel}</p>}
              <p>{schedule.timeLabel}</p>
              {multiple && (
                <div className="space-y-2 pt-2">
                  <p className="font-bold">{schedule.venue || schedule.locality}</p>
                  <p className="break-words">{formatActivityAddress(schedule.address, schedule.locality)}</p>
                  {schedule.address && (
                    <a
                      href={getActivityMapUrl({
                        ...activity,
                        venue: schedule.venue,
                        locality: schedule.locality,
                        address: schedule.address,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Ver en Google Maps
                      <MaterialIcon name="chevron_right" size={20} />
                    </a>
                  )}
                </div>
              )}
              {schedule.detail && (
                <p className="pt-1 whitespace-pre-line italic text-[#888]">{schedule.detail}</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
