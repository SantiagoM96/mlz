import { argentinaTodayISO, type AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ActivityBadges } from './ActivityBadges';
import { Link } from 'react-router-dom';

export function ActivityCard({ activity }: { activity: AgendaActivity }) {
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
          <p className="text-[16px] font-medium uppercase leading-[26px] text-[#888888]">{activity.category}</p>
          <h2 className="text-[22px] font-bold leading-[28px] text-primary-600">{activity.title}</h2>
          {activity.dateISO && activity.dateISO < argentinaTodayISO() && (
            <span className="self-start rounded bg-[#f2f4f6] px-2 py-1 text-[12px] font-medium text-[#626d75]">
              Actividad pasada
            </span>
          )}
          <ActivityBadges badges={activity.badges} />
          <div className="mt-1 flex flex-col gap-3 text-[18px] font-bold leading-6 text-grey-900">
            <p className="flex items-center gap-2"><MaterialIcon name="calendar_month" />{activity.dayLabel}</p>
            <p className="flex items-center gap-2"><MaterialIcon name="schedule" />{activity.timeLabel}</p>
          </div>
          <span className="mt-auto inline-flex min-h-7 items-center self-start pt-1 text-[16px]
            font-medium text-primary-600 no-underline group-hover:no-underline">
            Ver más
            <MaterialIcon name="chevron_right" size={20}
              className="ml-2 transition-transform duration-150 motion-safe:group-hover:translate-x-[3px]" />
          </span>
        </div>
      </Link>
    </article>
  );
}
