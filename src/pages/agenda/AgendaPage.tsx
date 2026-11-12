import { useEffect, useMemo, useState } from 'react';
import { argentinaTodayISO } from '../../data/agenda';
import { publicAgendaShowcase } from '../../features/agenda/utils/publicAgendaShowcase';
import { AgendaIntro } from '../../features/agenda/components/shared/AgendaIntro';
import { filterAgendaActivities } from '../../features/agenda/utils/filterAgendaActivities';
import { isAgendaActivityVisible } from '../../features/agenda/utils/activitySchedules';
import { PageContainer } from '../../components/layout/PageContainer';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AgendaToolbar } from '../../components/agenda/AgendaToolbar';
import { AgendaSortDropdown } from '../../features/agenda/components/filters/AgendaSortDropdown';
import type { AgendaSortValue } from '../../features/agenda/model/sort';
import { AgendaPromo } from '../../components/agenda/AgendaPromo';
import { emptyFilters, type SelectedFilters } from '../../features/agenda/model/filterState';

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
      publicAgendaShowcase,
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
