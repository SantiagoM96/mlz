import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ActivityShare } from '../../components/agenda/ActivityShare';
import { ActivityDescription } from '../../components/agenda/ActivityDescription';
import { ActivitySummary } from '../../features/agenda/components/detail/ActivitySummary';
import { ActivityLocationMap } from '../../features/agenda/components/detail/ActivityLocationMap';
import { ActivityInformation } from '../../features/agenda/components/detail/ActivityInformation';
import { agendaActivities } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';
import { NotFoundPage } from '../not-found/NotFoundPage';

export function AgendaActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const activity = [featuredActivity, ...agendaActivities].find(a => a.id === id);

  useEffect(() => {
    document.title = activity
      ? activity.title + ' | Agenda de la Comunidad'
      : 'Actividad no encontrada | Agenda de la Comunidad';
  }, [activity]);

  if (!activity) return <NotFoundPage />;

  const isTypeIllustration = activity.image.includes('/types/');

  return (
    <PageContainer className="pb-10 pt-1 md:pt-0">
      <Breadcrumbs items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: 'Actividades', to: '/agenda-de-la-comunidad/actividades' },
        { label: activity.title },
      ]} />
      <div className="mb-6 min-w-0">
        <p className="mb-2 text-[16px] font-medium uppercase text-[#888]">{activity.type}</p>
        <h1 className="text-[32px] font-bold leading-10 text-primary-600">{activity.title}</h1>
      </div>
      <div className="agenda-motion-detail grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <ActivityDescription key={activity.id} activity={activity} />
          <img
            data-testid="agenda-detail-image"
            src={activity.image}
            alt={isTypeIllustration ? 'Ilustración correspondiente a ' + activity.type : 'Imagen de ' + activity.title}
            className={isTypeIllustration
              ? 'aspect-[5/2] w-full rounded-lg object-cover'
              : 'aspect-[2/1] w-full rounded-lg object-cover'}
            width={isTypeIllustration ? 1000 : 924}
            height={isTypeIllustration ? 400 : 462}
            fetchPriority="high"
          />
        </div>
        <div className="min-w-0 space-y-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-stretch">
          <ActivityShare key={activity.id} title={activity.title} />
          <div className="lg:sticky lg:top-6">
            <ActivitySummary activity={activity} />
          </div>
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <ActivityLocationMap activity={activity} />
          <div className="mt-8">
            <ActivityInformation activity={activity} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
