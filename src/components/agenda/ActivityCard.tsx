import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ActivityBadges } from './ActivityBadges';
import { Link } from 'react-router-dom';

export function ActivityCard({ activity }: { activity: AgendaActivity }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white transition-[border-color,box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-0.5 hover:border-[#bed8ed] hover:shadow-[0_8px_23px_#174d7017]" data-testid="agenda-card">
      <img src={activity.image} alt="" className="h-[154px] w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col gap-3 px-6 pt-3 pb-[18px]">
        <p className="text-[16px] font-medium uppercase leading-[26px] text-[#888888]">{activity.category}</p>
        <h2 className="text-[22px] font-bold leading-[28px] text-primary-600">{activity.title}</h2>
        <ActivityBadges badges={activity.badges} />
        <div className="mt-1 flex flex-col gap-3 text-[18px] font-bold leading-6 text-grey-900">
          <p className="flex items-center gap-2"><MaterialIcon name="calendar_month" />{activity.dayLabel}</p>
          <p className="flex items-center gap-2"><MaterialIcon name="schedule" />{activity.timeLabel}</p>
        </div>
        <Link to={`/agenda-de-la-comunidad/actividades/${activity.id}`} className="mt-auto inline-flex min-h-7 items-center self-start pt-1 text-[16px] font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
          Ver más <MaterialIcon name="chevron_right" size={20} className="ml-2 transition-transform duration-150 motion-safe:group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </article>
  );
}
