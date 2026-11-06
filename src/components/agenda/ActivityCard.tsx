import type { ReactNode } from 'react';
import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ActivityBadges } from './ActivityBadges';
import { ActivityCharacteristic } from './ActivityCharacteristic';
import { Link } from 'react-router-dom';
import { getActivitySchedulePresentations } from '../../features/agenda/utils/activitySchedules';

type Props = {
  activity: AgendaActivity;
  previewDateISO?: string;
  /** Permite reutilizar la tarjeta de Agenda en la consola sin navegar. */
  onViewDetail?: () => void;
  /** Equivalentes a las propiedades Show ... del componente Cards_buscadores de Figma. */
  showCategory?: boolean;
  showBadges?: boolean;
  showCharacteristics?: boolean;
};

function CardContents({
  activity,
  previewDateISO,
  action,
  showCategory,
  showBadges,
  showCharacteristics,
}: Omit<Props, 'onViewDetail'> & { action: ReactNode }) {
  const schedules = getActivitySchedulePresentations(activity, previewDateISO);

  return (
    <>
      <img src={activity.image} alt="" className="h-[154px] w-full object-cover" loading="lazy" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-col gap-2">
          {showCategory && (
            <p className="text-[16px] font-medium uppercase leading-[26px] text-[#888888]">
              {activity.type}
            </p>
          )}
          <h2 className="break-words text-[22px] font-bold leading-[28px] text-primary-600">
            {activity.title}
          </h2>
          {showBadges && activity.badges.length > 0 && <ActivityBadges badges={activity.badges} />}
        </div>
        {activity.id.includes('--sede-') && activity.venue && (
          <p className="flex min-w-0 items-start gap-2 text-[16px] font-bold leading-6 text-grey-900">
            <MaterialIcon name="location_on" size={20} className="mt-0.5" />
            <span className="min-w-0 break-words">{activity.venue}</span>
          </p>
        )}
        {showCharacteristics && (
          <div data-testid="agenda-card-schedules" className="flex min-w-0 flex-col gap-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="flex min-w-0 flex-col gap-2">
                {schedule.periodLabel ? (
                  <ActivityCharacteristic
                    variant="con-label"
                    icon="calendar_month"
                    label={schedule.dateLabel}
                    value={schedule.periodLabel}
                  />
                ) : (
                  <ActivityCharacteristic
                    variant="sin-label"
                    icon="calendar_month"
                    value={schedule.dateLabel}
                  />
                )}
                <ActivityCharacteristic
                  variant="sin-label"
                  icon="schedule"
                  value={schedule.timeLabel}
                />
              </div>
            ))}
            {schedules.length === 0 && (
              <div className="flex flex-col gap-2">
                <ActivityCharacteristic variant="sin-label" icon="calendar_month" value={activity.dayLabel} />
                <ActivityCharacteristic variant="sin-label" icon="schedule" value={activity.timeLabel} />
              </div>
            )}
          </div>
        )}
        <div className="mt-auto">{action}</div>
      </div>
    </>
  );
}

export function ActivityCard({
  activity,
  previewDateISO,
  onViewDetail,
  showCategory = true,
  showBadges = true,
  showCharacteristics = true,
}: Props) {
  const props = { activity, previewDateISO, showCategory, showBadges, showCharacteristics };

  return (
    <article
      data-testid="agenda-card"
      className="group min-w-0 overflow-hidden rounded-lg border border-[#e7e7e7] bg-white
        transition-[border-color,box-shadow,transform] duration-200 ease-out
        motion-safe:hover:-translate-y-0.5 hover:border-[#bed8ed]
        hover:shadow-[0_8px_23px_#174d7017]"
    >
      {onViewDetail ? (
        <div className="flex h-full min-w-0 flex-col">
          <CardContents
            {...props}
            action={(
              <button type="button" onClick={onViewDetail}
                className="inline-flex min-h-9 items-center gap-2 text-[16px] font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
                Ver más <MaterialIcon name="chevron_right" size={18} />
              </button>
            )}
          />
        </div>
      ) : (
        <Link
          to={`/agenda-de-la-comunidad/actividades/${activity.id}`}
          aria-label={`Ver más sobre ${activity.title}`}
          className="flex h-full min-w-0 cursor-pointer flex-col text-inherit no-underline
            hover:no-underline focus-visible:outline-2 focus-visible:-outline-offset-2
            focus-visible:outline-primary-600"
        >
          <CardContents
            {...props}
            action={(
              <span className="inline-flex min-h-7 items-center gap-2 text-[16px]
                font-medium text-primary-600 no-underline group-hover:no-underline">
                Ver más <MaterialIcon name="chevron_right" size={18} />
              </span>
            )}
          />
        </Link>
      )}
    </article>
  );
}
