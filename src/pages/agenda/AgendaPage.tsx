import { useEffect, useMemo, useState } from 'react';
import { argentinaTodayISO } from '../../data/agenda';
import { agendaV2PreviewActivities } from '../../data/agenda-v2-previews';
import { AgendaIntro } from '../../features/agenda/components/shared/AgendaIntro';
import { filterAgendaActivities } from '../../features/agenda/utils/filterAgendaActivities';
import { isAgendaActivityVisible } from '../../features/agenda/utils/activitySchedules';
import { getPublicActivityList } from '../../features/agenda/utils/publicActivityViews';
import { PageContainer } from '../../components/layout/PageContainer';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AgendaToolbar } from '../../components/agenda/AgendaToolbar';
import { AgendaSortDropdown } from '../../features/agenda/components/filters/AgendaSortDropdown';
import type { AgendaSortValue } from '../../features/agenda/model/sort';
import { AgendaPromo } from '../../components/agenda/AgendaPromo';
import { emptyFilters, type SelectedFilters } from '../../features/agenda/model/filterState';

/**
 * 10 tarjetas públicas para revisión visual de Agenda V2.
 * Una actividad puede generar dos tarjetas por sede o encuentro.
 * No se borran datos: los demás casos siguen disponibles en la consola
 * y las fichas pueden abrirse directamente por su URL.
 */
const showcaseIds = new Set([
  'preview-v2-yoga-dos-sedes', // 2 sedes
  'preview-v2-folklore',       // 2 encuentros con artistas distintos
  'preview-v2-futbol',         // 2 sedes
  'preview-v2-reciclaje',      // fecha puntual
  'preview-v2-muestra',        // período
  'preview-v2-compostaje',     // recurrencia e inscripción online
  'preview-v2-huerta',         // inscripción presencial
]);
const publicActivities = getPublicActivityList(
  agendaV2PreviewActivities.filter(activity => showcaseIds.has(activity.id)),
);

/** Buscador/listado de actividades; separado de la Home de la Agenda. */
export function AgendaPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SelectedFilters>(emptyFilters);
  const [sort, setSort] = useState<AgendaSortValue>('default');

  useEffect(() => {
    document.title = 'Actividades | Agenda de la Comunidad | Municipio Lomas de Zamora';
  }, []);

  const filtered = useMemo(() => {
    return filterAgendaActivities(
      search,
      filters,
      sort,
      argentinaTodayISO(),
      publicActivities,
    ).filter(activity =>
      activity.id.startsWith('preview-v2-') || isAgendaActivityVisible(activity),
    );
  }, [search, filters, sort]);

  const onReset = () => { setSearch(''); setFilters(emptyFilters()); setSort('default'); };
  const visible = filtered;

  return (
    <PageContainer className="pt-6 pb-6" >
      <AgendaIntro className="mb-6" />

      <AgendaToolbar search={search} onSearch={setSearch} filters={filters} resultCount={filtered.length}
        onFilters={setFilters} onReset={onReset} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-[16px] leading-[26px] text-grey-900">
          Mostrando - {filtered.length ? `${visible.length} de ${filtered.length} actividades` : 'Sin resultados'}
        </p>
        <AgendaSortDropdown value={sort} onChange={setSort} />
      </div>

      {filtered.length === 0 ? (
        <section data-testid="agenda-empty-state"
          className="agenda-motion-empty flex min-h-[355px] flex-col items-center justify-center text-center" aria-live="polite">
          <img src={import.meta.env.BASE_URL + 'assets/agenda/no-results.png'}
            alt="" width={194} height={207}
            className="h-[207px] w-[194px] shrink-0 object-contain" />
          <div className="mt-6 max-w-full px-3 text-[18px] leading-[26px] text-grey-900">
            <h2 className="font-bold">No encontramos actividades</h2>
            <p>Probá cambiar los filtros o buscá con otro término.</p>
          </div>
          <button type="button" onClick={onReset}
            className="mt-6 h-12 min-w-[175px] rounded bg-primary-600 px-6 text-[18px] font-bold text-white
              transition-colors duration-150 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-info-500">
            Limpiar filtros
          </button>
        </section>
      ) : (
        <>
          <div key={JSON.stringify({ filters, sort })} data-testid="agenda-grid" className="agenda-motion-grid mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map(activity => <ActivityCard
              key={activity.id}
              activity={activity}
              previewDateISO={activity.id.startsWith('preview-v2-') ? '1900-01-01' : undefined}
            />)}
          </div>

        </>
      )}

      <AgendaPromo />
    </PageContainer>
  );
}
