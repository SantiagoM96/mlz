import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ActivityBadges } from './ActivityBadges';
import { Link } from 'react-router-dom';
import { getActivitySchedulePresentations } from '../../features/agenda/utils/activitySchedules';

export function ActivityCard({ activity, previewDateISO }: { activity: AgendaActivity; previewDateISO?: string }) {
  const schedule = getActivitySchedulePresentations(activity, previewDateISO)[0];
  return (
    <article
      data-testid="agenda-card"
      className="group min-w-0 overflow-hidden rounded-lg border border-[#e7e7e7] bg-white
        transition-[border-color,box-shadow,transform] duration-200 ease-out
        motion-safe:hover:-translate-y-0.5 hover:border-[#bed8ed]
        hover:shadow-[0_8px_23px_#174d7017]"
    >
      <Link
        to={`/agenda-de-la-comunidad/actividades/${activity.id}`}
        aria-label={`Ver más sobre ${activity.title}`}
        className="flex h-full min-w-0 cursor-pointer flex-col text-inherit no-underline
          hover:no-underline focus-visible:outline-2 focus-visible:-outline-offset-2
          focus-visible:outline-primary-600"
      >
        <img src={activity.image} alt="" className="h-[154px] w-full object-cover" loading="lazy" />
        <div className="flex flex-1 flex-col gap-3 px-6 pt-3 pb-[18px]">
          <p className="text-[16px] font-medium uppercase leading-[26px] text-[#888888]">{activity.type}</p>
          <h2 className="text-[22px] font-bold leading-[28px] text-primary-600">{activity.title}</h2>
          <ActivityBadges badges={activity.badges} />
          <div className="mt-1 flex flex-col gap-4 text-[18px] font-bold leading-6 text-grey-900">
            <p className="flex items-center gap-2"><MaterialIcon name="calendar_month" size={20} />{schedule?.dateLabel ?? activity.dayLabel}</p>
            {schedule?.periodLabel && <p className="pl-7 text-[16px] font-normal leading-5">{schedule.periodLabel}</p>}
            <p className="flex items-center gap-2"><MaterialIcon name="schedule" size={20} />{schedule?.timeLabel ?? activity.timeLabel}</p>
          </div>
          <span className="mt-auto inline-flex min-h-7 items-center self-start pt-1 text-[16px]
            font-medium text-primary-600 no-underline group-hover:no-underline">
            Ver más
            <MaterialIcon name="chevron_right" size={18}
              className="ml-2" />
          </span>
        </div>
      </Link>
    </article>
  );
}
