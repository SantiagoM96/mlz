import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { FeaturedActivityCard } from '../../components/agenda/FeaturedActivityCard';
import { AgendaIntro } from '../../features/agenda/components/shared/AgendaIntro';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AgendaCircuitCard, type AgendaCircuit } from '../../components/agenda/AgendaCircuitCard';
import { agendaActivities } from '../../data/agenda';
import { featuredActivity } from '../../data/agenda-featured';

const circuits: AgendaCircuit[] = [
  { title: 'Circuito Cultural', description: 'Obras, funciones, encuentros culturales y propuestas culturales en salas y espacios independientes del municipio.', actionLabel: 'Ir a cartelera', image: import.meta.env.BASE_URL + 'assets/agenda/home-theater.jpg', variant: 'theater' },
  { title: 'Circuito del Café', description: 'Conocé todas las cafeterías de Lomas y los productos destacados de cada una de ellas. Navegá el mapa y elegí una ubicación para ver las tiendas de café en la zona.', actionLabel: 'Ir al recorrido', image: import.meta.env.BASE_URL + 'assets/agenda/home-cafe.jpg', variant: 'cafe' },
];

export function AgendaHomePage() {
  useEffect(() => {
    document.title = 'Agenda de la Comunidad | Municipio de Lomas de Zamora';
  }, []);

  return (
    <PageContainer className="pb-6 pt-6">
      <img
        data-testid="agenda-home-banner"
        src={import.meta.env.BASE_URL + 'assets/agenda/home-hero.jpg'}
        alt="Agenda de la Comunidad"
        width="1200"
        height="336"
        className="aspect-[400/179] w-full rounded-lg object-cover md:aspect-[1200/336]"
        fetchPriority="high"
      />
      <AgendaIntro className="mb-10 mt-6" />
      <FeaturedActivityCard activity={featuredActivity} />
      <section aria-labelledby="proximos-eventos" className="mt-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h2 id="proximos-eventos" className="text-[32px] leading-10 font-bold text-primary-600">Próximos eventos</h2>
          <Link className="inline-flex min-h-7 items-center gap-2 text-[18px] font-bold text-primary-600 hover:underline" to="/agenda-de-la-comunidad/actividades">
            Ver todas las actividades <MaterialIcon name="chevron_right" size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-testid="agenda-upcoming">
          {agendaActivities.slice(0, 3).map(activity => <ActivityCard key={activity.id} activity={activity} />)}
        </div>
      </section>
      <section aria-label="Circuitos de la Comunidad" className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {circuits.map(circuit => <AgendaCircuitCard key={circuit.title} circuit={circuit} />)}
      </section>
    </PageContainer>
  );
}
