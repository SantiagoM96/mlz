import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ActivityShare } from '../../components/agenda/ActivityShare';
import { ActivityDescription } from '../../components/agenda/ActivityDescription';
import { ActivitySummary } from '../../features/agenda/components/detail/ActivitySummary';
import { ActivityRegistrationLink } from '../../features/agenda/components/detail/ActivityRegistrationLink';
import { ActivityLocationMap } from '../../features/agenda/components/detail/ActivityLocationMap';
import {
  getActivitySchedulePresentations, isAgendaActivityVisible,
} from '../../features/agenda/utils/activitySchedules';
import { agendaActivities } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';
import { NotFoundPage } from '../not-found/NotFoundPage';

export function AgendaActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const activity = [featuredActivity, ...agendaActivities].find(a => a.id === id);
  const isVisible = activity ? isAgendaActivityVisible(activity) : false;

  useEffect(() => {
    document.title = activity && isVisible
      ? activity.title + ' | Agenda de la Comunidad'
      : 'Actividad no encontrada | Agenda de la Comunidad';
  }, [activity, isVisible]);

  if (!activity || !isVisible) return <NotFoundPage />;

  const schedules = getActivitySchedulePresentations(activity);
  const onlySchedule = schedules.length === 1 ? schedules[0] : null;
  const locationActivity = onlySchedule ? {
    ...activity,
    locality: onlySchedule.locality,
    venue: onlySchedule.venue,
    address: onlySchedule.address,
  } : activity;
  const isTypeIllustration = activity.image.includes('/types/');

  return (
    <PageContainer className="pb-10 pt-6">
      <Breadcrumbs items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: activity.title },
      ]} />
      <div className="agenda-motion-detail mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
        <div className="min-w-0 space-y-6">
          <div className="space-y-4">
            <p className="text-[16px] font-medium uppercase text-[#787878]">{activity.type}</p>
            <h1 className="text-[32px] font-bold leading-10 text-primary-600">{activity.title}</h1>
            <ActivityDescription key={activity.id} activity={activity} />
          </div>
          <img
            data-testid="agenda-detail-image"
            src={activity.image}
            alt={isTypeIllustration ? 'Ilustración correspondiente a ' + activity.type : 'Imagen de ' + activity.title}
            className={isTypeIllustration
              ? 'aspect-[5/2] w-full rounded-xl object-cover'
              : 'aspect-[2/1] w-full rounded-xl object-cover'}
            width={isTypeIllustration ? 1000 : 924}
            height={isTypeIllustration ? 400 : 462}
            fetchPriority="high"
          />
          {onlySchedule && <ActivityLocationMap activity={locationActivity} />}
        </div>
        <div className="min-w-0 space-y-4">
          <ActivityShare key={activity.id} title={activity.title} />
          <div className="lg:sticky lg:top-6">
            <ActivitySummary activity={activity} />
            <ActivityRegistrationLink activity={activity} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
