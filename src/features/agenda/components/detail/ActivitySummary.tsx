import type { AgendaActivity } from '../../../../data/agenda';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';
import { ActivityBadges } from '../../../../components/agenda/ActivityBadges';
import { formatActivityAddress } from '../../utils/formatActivityAddress';

export function ActivitySummary({ activity }: { activity: AgendaActivity }) {
  const venue = activity.venue || activity.locality;
  const address = activity.address;

  return (
    <aside aria-label="Resumen de actividad"
      className="min-w-0 rounded-lg border border-[#d1d1d1] bg-white p-6">
      <h2 className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">Resumen</h2>
      {activity.badges.length > 0 && (
        <div className="mb-4">
          <ActivityBadges badges={activity.badges} variant="summary" />
        </div>
      )}
      <dl className="space-y-4 text-[16px] leading-5 text-grey-900">
        <div className="flex min-w-0 items-start gap-2">
          <MaterialIcon name="calendar_month" size={24} className="shrink-0 text-black" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-5">Fecha</dt>
            <dd className="mt-2">{activity.dayLabel}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <MaterialIcon name="schedule" size={24} className="shrink-0 text-black" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-5">Horario</dt>
            <dd className="mt-2">{activity.timeLabel}</dd>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <MaterialIcon name="location_on" size={24} className="shrink-0 text-black" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-5">{venue}</dt>
            <dd className="mt-1 break-words">{formatActivityAddress(address, activity.locality)}</dd>
          </div>
        </div>
      </dl>
    </aside>
  );
}
