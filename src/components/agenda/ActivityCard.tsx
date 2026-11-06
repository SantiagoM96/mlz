import { Fragment, type ReactNode } from 'react';
import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ActivityBadges } from './ActivityBadges';
import { ActivityCharacteristic } from './ActivityCharacteristic';
import { ActivityScheduleDateTime } from './ActivityScheduleDateTime';
import { ActivityScheduleParticipants } from './ActivityScheduleParticipants';
import { formatActivityCardAddress } from '../../features/agenda/utils/formatActivityAddress';
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
  const firstSchedule = schedules[0];
  const rainAlreadyInHeader = activity.badges.some(badge => badge.kind === 'rain');
  const venue = firstSchedule?.venue?.trim() || activity.venue?.trim() || 'Lugar a confirmar';
  const address = firstSchedule?.address || activity.address;
  const locality = firstSchedule?.locality || activity.locality;

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
        {showCharacteristics && (
          <div data-testid="agenda-card-schedules" className="flex min-w-0 flex-col gap-4">
            {schedules.map((schedule, index) => (
              <Fragment key={schedule.id}>
                {index > 0 && (
                  <div aria-hidden="true" data-agenda-programming-divider
                    className="h-px w-full bg-[#e7e7e7]" />
                )}
                {schedule.suspendedByRain === true && !rainAlreadyInHeader && (
                  <ActivityBadges badges={[{ kind: 'rain', label: 'Se suspende por lluvia' }]} />
                )}
                <ActivityScheduleDateTime schedule={schedule} />
              </Fragment>
            ))}
            {schedules.length === 0 && (
              <ActivityScheduleDateTime schedule={{ dateLabel: activity.dayLabel, timeLabel: activity.timeLabel }} />
            )}
            <ActivityCharacteristic
              variant="con-label"
              icon="location_on"
              field="place"
              label={venue}
              value={formatActivityCardAddress(address, locality)}
            />
            {schedules.map(schedule => (
              <ActivityScheduleParticipants key={schedule.id} schedule={schedule} />
            ))}
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
                <span>Ver más</span> <MaterialIcon name="chevron_right" size={24} />
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
                <span>Ver más</span> <MaterialIcon name="chevron_right" size={24} />
              </span>
            )}
          />
        </Link>
      )}
    </article>
  );
}
