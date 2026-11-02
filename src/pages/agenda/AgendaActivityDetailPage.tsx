import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ActivityBadges } from '../../components/agenda/ActivityBadges';
import { ActivityShare } from '../../components/agenda/ActivityShare';
import { ActivityDescription } from '../../components/agenda/ActivityDescription';
import { agendaActivities, argentinaTodayISO, type AgendaActivity } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';
import { NotFoundPage } from '../not-found/NotFoundPage';

function ActivityLocation({ activity }: { activity: AgendaActivity }) {
  const venue = activity.venue || activity.locality;
  const address = activity.address;
  const mapQuery = address ? encodeURIComponent(address + ', Buenos Aires, Argentina') : null;
  const mapsUrl = mapQuery ? 'https://www.google.com/maps/search/?api=1&query=' + mapQuery : null;

  return (
    <section aria-label="Ubicación de la actividad"
      className="overflow-hidden rounded-lg border border-[#dedede] bg-white">
      <div className="p-5 sm:p-6">
        <h2 className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">Ubicación</h2>
        <div className="flex items-start gap-2.5">
          <MaterialIcon name="location_on" size={24} className="mt-0.5 text-primary-600" />
          <div className="min-w-0 text-[17px] leading-[25px] text-grey-900">
            <p className="font-bold">{venue}</p>
            {address ? <p>{address}</p> : <p>Dirección no disponible</p>}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-sm font-bold text-primary-600
                  no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-primary-600">
                Ver en Google Maps <MaterialIcon name="chevron_right" size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
      {mapQuery && (
        <iframe
          title={'Mapa de ' + venue}
          src={'https://www.google.com/maps?q=' + mapQuery + '&output=embed'}
          className="h-[195px] w-full border-0 bg-[#e7eef3] sm:h-[215px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </section>
  );
}

function ActivityInformation({ activity }: { activity: AgendaActivity }) {
  const fields = [
    { label: 'Fecha', value: activity.dayLabel },
    { label: 'Horario', value: activity.timeLabel },
    { label: 'Tipo de actividad', value: activity.type },
    { label: 'Categoría', value: activity.category },
    { label: 'Localidad', value: activity.locality },
  ];

  return (
    <section aria-labelledby="agenda-general-information" className="border-t border-[#e1e7eb] pt-7">
      <h2 id="agenda-general-information" className="mb-5 text-[24px] font-bold text-primary-600">
        Información general
      </h2>
      <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(field => (
          <div key={field.label} className="min-w-0 text-[18px] leading-[26px] text-grey-900">
            <dt className="font-bold">{field.label}</dt>
            <dd className="mt-1">{field.value}</dd>
          </div>
        ))}
      </dl>
      {activity.badges.length > 0 && (
        <div className="mt-6">
          <ActivityBadges badges={activity.badges} />
          {activity.badges.some(badge => badge.kind === 'registration') && (
            <p className="mt-2 text-[14px] leading-5 text-[#69737b]">
              La Agenda es informativa: no gestiona inscripciones ni reservas.
            </p>
          )}
        </div>
      )}
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
      <Breadcrumbs tone="neutral" items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: 'Actividades', to: '/agenda-de-la-comunidad/actividades' },
        { label: activity.title },
      ]} />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0">
          <p className="mb-2 text-[16px] font-medium uppercase text-[#888]">{activity.type}</p>
          <h1 className="text-[32px] font-bold leading-10 text-primary-600">{activity.title}</h1>
          {activity.dateISO && activity.dateISO < argentinaTodayISO() && (
            <p className="mt-3 text-[14px] text-[#69737b]">Actividad pasada · Archivo 2026</p>
          )}
        </div>
        <ActivityShare key={activity.id} title={activity.title} />
      </div>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="min-w-0 space-y-6">
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
          <ActivityDescription activity={activity} />
        </div>
        <ActivityLocation activity={activity} />
      </div>
      <div className="mt-8">
        <ActivityInformation activity={activity} />
      </div>
    </PageContainer>
  );
}
