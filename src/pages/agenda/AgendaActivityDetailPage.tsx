import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ActivityShare } from '../../components/agenda/ActivityShare';
import { ActivityDescription } from '../../components/agenda/ActivityDescription';
import { ActivitySummary } from '../../features/agenda/components/detail/ActivitySummary';
import { ActivityRegistrationLink } from '../../features/agenda/components/detail/ActivityRegistrationLink';
import { ActivityLocationMap } from '../../features/agenda/components/detail/ActivityLocationMap';
import {
  getActivitySchedulePresentations, getUniqueActivityLocations, isAgendaActivityVisible,
} from '../../features/agenda/utils/activitySchedules';
import { agendaActivities } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';
import { agendaV2PreviewActivities } from '../../data/agenda-v2-previews';
import { getPublicActivityList, getPublicActivityViews } from '../../features/agenda/utils/publicActivityViews';
import { NotFoundPage } from '../not-found/NotFoundPage';

const editorialActivities = [featuredActivity, ...agendaActivities, ...agendaV2PreviewActivities];
const publicActivities = getPublicActivityList(editorialActivities);

export function AgendaActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const directActivity = publicActivities.find(activity => activity.id === id);
  // Los enlaces previos con el ID editorial siguen funcionando:
  // al separar sedes redirigen a la primera ficha pública.
  const original = directActivity ? undefined : editorialActivities.find(activity => activity.id === id);
  const firstVenue = original ? getPublicActivityViews(original)[0] : undefined;
  const redirectTo = !directActivity && original && getPublicActivityViews(original).length > 1
    ? firstVenue : undefined;
  const activity = directActivity ?? redirectTo;
  const isPreview = Boolean(activity?.id.startsWith('preview-v2-'));
  const previewDateISO = isPreview ? '2026-11-05' : undefined;
  const isVisible = activity ? isAgendaActivityVisible(activity, previewDateISO) : false;

  useEffect(() => {
    document.title = activity && isVisible
      ? activity.title + (activity.id.includes('--sede-') ? ' · ' + activity.venue : '') + ' | Agenda de la Comunidad'
      : 'Actividad no encontrada | Agenda de la Comunidad';
  }, [activity, isVisible]);

  if (redirectTo) {
    return <Navigate to={'/agenda-de-la-comunidad/actividades/' + redirectTo.id} replace />;
  }
  if (!activity || !isVisible) return <NotFoundPage />;

  const schedules = getActivitySchedulePresentations(activity, previewDateISO);
  const locations = getUniqueActivityLocations(schedules);
  const onlySchedule = locations.length === 1 ? locations[0] : null;
  const locationActivity = onlySchedule ? {
    ...activity,
    locality: onlySchedule.locality,
    venue: onlySchedule.venue,
    address: onlySchedule.address,
  } : activity;
  const isTypeIllustration = activity.image.includes('/types/');

  return (
    <PageContainer className="pb-10 pt-6">
      <Breadcrumbs mobileParentOnly items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: 'Actividades', to: '/agenda-de-la-comunidad/actividades' },
        { label: activity.title },
      ]} />

      <div className="agenda-motion-detail mt-6 grid min-w-0 items-start gap-4 lg:items-stretch lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="space-y-4">
            <p className="text-[16px] font-medium uppercase text-[#787878]">{activity.type}</p>
            <h1 className="break-words text-[32px] font-bold leading-10 text-primary-600">{activity.title}</h1>
          </div>
          <div id="agenda-public-panel-information" data-testid="agenda-detail-information"
            className="mt-4 min-w-0 space-y-4 lg:space-y-6">
            <ActivityDescription key={activity.id} activity={activity} />
            <img
              data-testid="agenda-detail-image"
              src={activity.image}
              alt={isTypeIllustration ? 'Ilustración correspondiente a ' + activity.type : 'Imagen de ' + activity.title}
              className={isTypeIllustration
                ? 'aspect-[400/224] w-full rounded-lg object-cover lg:aspect-[5/2] lg:rounded-xl'
                : 'aspect-[400/224] w-full rounded-lg object-cover lg:aspect-[2/1] lg:rounded-xl'}
              width={isTypeIllustration ? 1000 : 924}
              height={isTypeIllustration ? 400 : 462}
              fetchPriority="high"
            />
          </div>
        </div>
        {/* La pista alta sirve únicamente como límite para sticky.
            El tabpanel no debe heredar su altura ni generar un espacio fantasma. */}
        <div data-testid="agenda-detail-sidebar"
          className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-4">
          <div id="agenda-public-panel-when-where"
            className="flow-root min-w-0 space-y-4 lg:contents lg:space-y-0">
          <ActivityShare key={activity.id} title={activity.title} />
          <div data-testid="agenda-detail-sticky"
            className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-48px)] lg:overflow-y-auto lg:overscroll-contain">
            <ActivitySummary activity={activity} previewDateISO={previewDateISO} />
            <ActivityRegistrationLink activity={activity} preview={isPreview} />
          </div>
          </div>
        </div>
        {onlySchedule && (
          <div data-testid="agenda-detail-map-panel"
            className="min-w-0 lg:col-start-1 lg:row-start-2">
            <ActivityLocationMap activity={locationActivity} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
