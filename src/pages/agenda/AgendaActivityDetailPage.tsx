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

function ActivitySummary({ activity }: { activity: AgendaActivity }) {
  const venue = activity.venue || activity.locality;
  const address = activity.address;


  return (
    <aside aria-label="Resumen de actividad"
      className="rounded-lg border border-[#dedede] bg-white p-5 sm:p-6
        lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start
        lg:max-h-[calc(100dvh-48px)] lg:overflow-y-auto">
      <h2 className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">Resumen</h2>
      {activity.badges.length > 0 && (
        <div className="mb-5">
          <ActivityBadges badges={activity.badges} />
        </div>
      )}
      <dl className="space-y-5 text-[16px] leading-6 text-grey-900">
        <div className="flex items-start gap-2.5">
          <MaterialIcon name="calendar_month" size={24} className="mt-0.5 shrink-0 text-primary-600" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-6">Fecha</dt>
            <dd>{activity.dayLabel}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MaterialIcon name="schedule" size={24} className="mt-0.5 shrink-0 text-primary-600" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-6">Horario</dt>
            <dd>{activity.timeLabel}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MaterialIcon name="location_on" size={24} className="mt-0.5 shrink-0 text-primary-600" />
          <div className="min-w-0">
            <dt className="text-[18px] font-bold leading-6">Lugar</dt>
            <dd className="font-bold">{venue}</dd>
            <dd>{address || 'Dirección a confirmar'}</dd>
          </div>
        </div>
      </dl>
      {activity.badges.some(badge => badge.kind === 'registration') && (
        <p className="mt-5 text-[13px] leading-5 text-[#69737b]">
          La Agenda es informativa: no gestiona inscripciones ni reservas.
        </p>
      )}
    </aside>
  );
}

/** Mapa debajo de la ficha y encima de información general. */
function ActivityMap({ activity }: { activity: AgendaActivity }) {
  if (!activity.address) return null;
  const mapQuery = encodeURIComponent(activity.address + ', Buenos Aires, Argentina');
  const venue = activity.venue || activity.locality;

  return (
    <section aria-label="Mapa de ubicación" className="mt-9">
      <h2 className="mb-4 text-[24px] font-bold text-primary-600">Ubicación en el mapa</h2>
      <div className="overflow-hidden rounded-lg border border-[#dedede] bg-[#e7eef3]">
        <iframe
          title={'Mapa de ' + venue}
          src={'https://www.google.com/maps?q=' + mapQuery + '&output=embed'}
          className="h-[180px] w-full border-0 sm:h-[200px] lg:h-[220px]"
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
    <section aria-labelledby="agenda-general-information" className="border-t border-[#e1e7eb] pt-7">
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
      <div className="agenda-motion-detail grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
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
        <ActivitySummary activity={activity} />
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
