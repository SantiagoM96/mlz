import { Link } from 'react-router-dom';
import type { AgendaActivity } from '../../data/agenda';
import { ActivityBadges } from './ActivityBadges';
import { ActivityScheduleDateTime } from './ActivityScheduleDateTime';
import { ActivityCharacteristic } from './ActivityCharacteristic';
import { formatActivityCardAddress } from '../../features/agenda/utils/formatActivityAddress';
import { getActivitySchedulePresentations } from '../../features/agenda/utils/activitySchedules';
import { MaterialIcon } from '../ui/MaterialIcon';

export function FeaturedActivityCard({ activity }: { activity: AgendaActivity }) {
  const firstSchedule = getActivitySchedulePresentations(activity)[0];
  const venue = firstSchedule?.venue?.trim() || activity.venue?.trim() || 'Lugar a confirmar';
  const address = firstSchedule?.address || activity.address;
  const locality = firstSchedule?.locality || activity.locality;

  return (
    <article data-testid="agenda-featured" className="grid overflow-hidden rounded-lg border border-[#e7e7e7] bg-white md:grid-cols-2">
      <img src={activity.image} alt="Representación teatral en el escenario" width="924" height="543"
        className="h-[249px] w-full object-cover md:h-[362px]" fetchPriority="high" />
      <div className="flex min-h-[327px] flex-col gap-3 p-6 md:min-h-[362px] md:px-8 md:py-4">
        <p className="text-[16px] font-medium uppercase leading-6 text-[#888]">{activity.type}</p>
        <h2 className="text-[30px] leading-9 font-bold text-primary-600">{activity.title}</h2>
        <ActivityBadges badges={activity.badges} />
        <div className="flex min-w-0 flex-col gap-4">
          <ActivityScheduleDateTime schedule={{
            dateLabel: firstSchedule?.dateLabel ?? activity.dayLabel,
            periodLabel: firstSchedule?.periodLabel,
            timeLabel: firstSchedule?.timeLabel ?? activity.timeLabel,
          }} />
          <ActivityCharacteristic
            variant="con-label"
            icon="location_on"
            field="place"
            label={venue}
            value={formatActivityCardAddress(address, locality)}
          />
        </div>
        <Link
          className="mt-auto inline-flex min-h-9 items-center gap-2 self-start rounded-sm pt-2 text-[18px] font-medium text-primary-600 no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-primary-600"
          to={`/agenda-de-la-comunidad/actividades/${activity.id}`}
        >
          Ver más <MaterialIcon name="chevron_right" size={24} />
        </Link>
      </div>
    </article>
  );
}
