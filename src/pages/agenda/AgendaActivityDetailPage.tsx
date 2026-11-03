import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ActivityBadges } from '../../components/agenda/ActivityBadges';
import { ActivityShare } from '../../components/agenda/ActivityShare';
import { ActivityDescription } from '../../components/agenda/ActivityDescription';
import { agendaActivities, type AgendaActivity } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';
import { NotFoundPage } from '../not-found/NotFoundPage';

function ActivitySummary({ activity }: { activity: AgendaActivity }) {
  const venue = activity.venue || activity.locality;
  const address = activity.address;
  const mapQuery = encodeURIComponent(
    [address || venue, activity.locality, 'Buenos Aires', 'Argentina'].filter(Boolean).join(', ')
  );
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + mapQuery;

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
            <dd className="mt-1 break-words">{address || 'Dirección a confirmar'}</dd>
            {address && (
              <dd className="mt-1">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-[16px] font-bold text-primary-600
                    underline-offset-2 hover:underline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                  Ver en Google Maps
                  <MaterialIcon name="chevron_right" size={24} />
                </a>
              </dd>
            )}
          </div>
        </div>
      </dl>
    </aside>
  );
}

/** Tarjeta compacta de ubicación, siguiendo la referencia de Deportes. */
function ActivityMap({ activity }: { activity: AgendaActivity }) {
  if (!activity.address) return null;

  const venue = activity.venue || activity.locality;
  const mapQuery = encodeURIComponent(
    [activity.address, activity.locality, 'Buenos Aires', 'Argentina'].filter(Boolean).join(', ')
  );
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + mapQuery;

  return (
    <section aria-label="Mapa de ubicación">
      <h2 className="sr-only">Ubicación en el mapa</h2>
      <div className="grid grid-cols-[minmax(0,1fr)_42%] overflow-hidden rounded-lg border border-[#dedede] bg-white">
        <div className="min-w-0 self-center px-4 py-3">
          <p className="text-[16px] font-bold leading-6 text-grey-900">{venue}</p>
          <p className="mt-1 break-words text-[16px] leading-6 text-grey-900">{activity.address}</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block rounded-sm text-[16px] font-bold leading-6 text-primary-600
              underline-offset-2 hover:underline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Ver en Google Maps
          </a>
        </div>
        <iframe
          title={'Mapa de ' + venue}
          src={'https://www.google.com/maps?q=' + mapQuery + '&output=embed'}
          className="h-full min-h-[116px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function ActivityInformation({ activity }: { activity: AgendaActivity }) {
  const fields = [
    { label: 'Tipo de actividad', value: activity.type },
    { label: 'Categoría', value: activity.category },
    { label: 'Localidad', value: activity.locality },
  ];

  return (
    <section aria-labelledby="agenda-general-information" className="pt-0">
      <h2 id="agenda-general-information" className="mb-5 text-[24px] font-bold text-primary-600">
        Información general
      </h2>
      <dl className="grid max-w-[900px] gap-x-10 gap-y-5 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.label} className="min-w-0 text-[18px] leading-[26px] text-grey-900">
            <dt className="text-[18px] font-bold leading-6">{field.label}</dt>
            <dd className="mt-1">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

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
        <div className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          <ActivityShare key={activity.id} title={activity.title} />
          <ActivitySummary activity={activity} />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <ActivityMap activity={activity} />
          <div className="mt-8">
            <ActivityInformation activity={activity} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
