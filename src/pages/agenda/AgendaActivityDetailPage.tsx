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

function DetailSummary({ activity }: { activity: AgendaActivity }) {
  const location = activity.venue ?? activity.locality;
  return (
    <aside className="min-w-0 md:w-[430px] md:shrink-0" aria-label="Resumen de actividad">
      <ActivityShare title={activity.title} />
      <section className="rounded-lg border border-[#d1d1d1] p-6" aria-labelledby="resumen-title">
        <h2 id="resumen-title" className="mb-4 text-[24px] font-bold leading-[30px] text-primary-600">Resumen</h2>
        <ActivityBadges badges={activity.badges} />
        <div className="mt-5 space-y-4 text-[18px] leading-[22px]">
          <div className="flex items-start gap-2">
            <MaterialIcon name="calendar_month" size={24} />
            <div><p className="font-bold">Fecha</p><p>{activity.dayLabel}</p></div>
          </div>
          <div className="flex items-start gap-2">
            <MaterialIcon name="schedule" size={24} />
            <div><p className="font-bold">Horario</p><p>{activity.timeLabel}</p></div>
          </div>
          <div className="flex items-start gap-2">
            <MaterialIcon name="location_on" size={24} />
            <div>
              <p className="font-bold">{location}</p>
              {activity.address && <p>{activity.address}</p>}
              {activity.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-bold text-primary-600 hover:underline"
                >Ver en Google Maps <MaterialIcon name="chevron_right" size={20} /></a>
              )}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

export function AgendaActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const activity = [featuredActivity, ...agendaActivities].find(a => a.id === id);

  useEffect(() => {
    document.title = activity
      ? `${activity.title} | Agenda de la Comunidad`
      : 'Actividad no encontrada | Agenda de la Comunidad';
  }, [activity]);

  if (!activity) return <NotFoundPage />;

  return (
    <PageContainer className="pb-0 pt-1 md:pt-0">
      <Breadcrumbs tone="neutral" items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: 'Actividades', to: '/agenda-de-la-comunidad/actividades' },
        { label: activity.title },
      ]} />
      <div className="grid min-h-[440px] items-start gap-6 pb-6 md:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-4">
          <p className="text-[16px] font-medium uppercase text-[#888]">{activity.category}</p>
          <h1 className="text-[32px] font-bold leading-10 text-primary-600">{activity.title}</h1>
          <ActivityDescription activity={activity} />
          {activity.dateISO && activity.dateISO < argentinaTodayISO() && <p className="text-[14px] text-[#69737b]">Actividad pasada · Archivo 2026</p>}
        </div>
        <DetailSummary activity={activity} />
      </div>
    </PageContainer>
  );
}
