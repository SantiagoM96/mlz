import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  agendaV2ExampleCases, agendaV2PreviewActivities,
} from '../../data/agenda-v2-previews';

/**
 * Galería de los siete casos de Figma: deliberadamente separada
 * del catálogo de actividades reales y de los filtros públicos.
 */
export function AgendaExamplesPage() {
  useEffect(() => {
    document.title = 'Ejemplos Agenda V2 | Revisión de diseño';
  }, []);

  return (
    <PageContainer className="pb-12 pt-6">
      <Breadcrumbs items={[
        { label: 'Inicio', to: '/' },
        { label: 'Agenda de la Comunidad', to: '/agenda-de-la-comunidad' },
        { label: 'Ejemplos de Agenda V2' },
      ]} />

      <div className="mt-7 space-y-3">
        <p className="text-[15px] font-bold uppercase tracking-[.08em] text-[#708395]">
          Estudio de diseño · Agenda V2
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-primary-600">
          Ejemplos de actividades
        </h1>
        <p className="max-w-[850px] text-[18px] leading-[27px] text-grey-900">
          Reunimos los siete casos definidos en Figma para comparar tarjetas,
          fechas, recurrencias, sedes y modalidades de inscripción.
        </p>
        <p role="note" className="rounded-[8px] border border-[#cedfea] bg-[#f3f7fc] p-4 text-[16px] leading-6 text-grey-900">
          <strong>Son ejemplos ficticios para revisar la interfaz.</strong> No son
          actividades confirmadas ni inscripciones abiertas. Los datos de estas
          fichas no se incorporan al listado de convocatorias.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/agenda-de-la-comunidad/consola-preview"
            className="inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-primary-600 px-5 py-2.5 text-[16px] font-bold text-white hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600">
            Probar formulario de consola
            <MaterialIcon name="arrow_forward" size={20} />
          </Link>
          <Link to="/agenda-de-la-comunidad/actividades"
            className="inline-flex min-h-11 items-center rounded-[4px] border border-primary-600 px-5 py-2.5 text-[16px] font-bold text-primary-600 hover:bg-[#f3f7fc] focus-visible:outline-2 focus-visible:outline-primary-600">
            Volver al listado
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        data-testid="agenda-examples-grid">
        {agendaV2ExampleCases.map(example => {
          const activity = agendaV2PreviewActivities.find(item => item.id === example.id);
          if (!activity) return null;
          return (
            <section key={example.id} className="min-w-0 space-y-3">
              <div className="min-h-[79px]">
                <p className="text-[15px] font-bold uppercase tracking-[.04em] text-primary-600">
                  {example.label}
                </p>
                <p className="mt-1 text-[16px] leading-6 text-grey-900">
                  {example.description}
                </p>
              </div>
              <ActivityCard activity={activity} previewDateISO="1900-01-01" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  className="inline-flex min-h-10 items-center gap-1 text-[15px] font-bold text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
                  to={'/agenda-de-la-comunidad/consola-preview?caso=' + activity.id}
                >
                  Probar este caso en la consola
                  <MaterialIcon name="chevron_right" size={18} />
                </Link>
                <a className="inline-flex min-h-10 items-center text-[14px] font-medium text-[#687d8d] hover:underline"
                  href={'https://www.figma.com/design/i1EyRb02SVGEtP6nWElLlT/AGENDA-DE-ACTIVIDADES---TEATROS-LOCALES?node-id=' + example.figmaNode}
                  target="_blank" rel="noopener noreferrer">
                  Ver en Figma
                </a>
              </div>
            </section>
          );
        })}
      </div>
    </PageContainer>
  );
}
