import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AgendaToolbar } from '../../components/agenda/AgendaToolbar';
import { AgendaSortDropdown, type AgendaSortValue } from '../../components/agenda/AgendaDropdown';
import { AgendaPromo } from '../../components/agenda/AgendaPromo';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { emptyFilters, type SelectedFilters } from '../../components/agenda/AgendaFilterPanel';
import { agendaActivities } from '../../data/agenda';

function usePageSize() {
  const [size, setSize] = useState(9);
  useEffect(() => {
    const update = () => setSize(window.matchMedia('(max-width: 767px)').matches ? 6 : 9);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

/** Buscador/listado de actividades; separado de la Home de la Agenda. */
export function AgendaPage() {
  const pageSize = usePageSize();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SelectedFilters>(emptyFilters);
  const [sort, setSort] = useState<AgendaSortValue>('default');
  const [limit, setLimit] = useState(9);

  useEffect(() => {
    document.title = 'Actividades | Agenda de la Comunidad | Municipio Lomas de Zamora';
  }, []);

  const filtered = useMemo(() => {
    const normalize = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
    const term = normalize(search.trim());
    const results = agendaActivities.filter(a => {
      if (term && !normalize([a.title, a.category, a.type, a.locality].join(' ')).includes(term)) return false;
      if (filters.type.length && !filters.type.includes(a.type)) return false;
      if (filters.category.length && !filters.category.includes(a.category)) return false;
      if (filters.locality.length && !filters.locality.includes(a.locality)) return false;
      if (filters.date.includes('Este fin de semana')) return false;
      if (filters.date.includes('Hoy') && new Date().getDay() !== 4) return false;
      return true;
    });
    if (sort === 'az') results.sort((a,b) => a.title.localeCompare(b.title,'es'));
    if (sort === 'za') results.sort((a,b) => b.title.localeCompare(a.title,'es'));
    return results;
  }, [search, filters, sort]);

  const onReset = () => { setSearch(''); setFilters(emptyFilters()); setSort('default'); setLimit(9); };
  const visible = filtered.slice(0, Math.max(pageSize, limit === 9 ? pageSize : limit));
  const hasMore = filtered.length > visible.length;

  return (
    <PageContainer className="pt-6 pb-6" >
      <div className="mb-6">
        <h1 className="text-[32px] font-bold leading-10 text-primary-600">¡Agenda Anual de la Comunidad 2026!</h1>
        <p className="mt-2 text-[18px] leading-[26px] text-grey-900">Encontrá mes a mes todas las actividades culturales, deportivas y ambientales para disfrutar en tu barrio.</p>
      </div>

      <AgendaToolbar search={search} onSearch={value => { setSearch(value); setLimit(9); }} filters={filters}
        onFilters={value => { setFilters(value); setLimit(9); }} onReset={onReset} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-[16px] leading-[26px] text-grey-900">
          Mostrando - {filtered.length ? `${visible.length} de ${filtered.length} actividades` : 'Sin resultados'}
        </p>
        <AgendaSortDropdown value={sort} onChange={setSort} />
      </div>

      {filtered.length === 0 ? (
        <section className="flex min-h-[380px] flex-col items-center justify-center gap-3 text-center" aria-live="polite">
          <MaterialIcon name="search" size={64} className="text-[#8da3af]" />
          <h2 className="text-[20px] font-bold text-grey-900">No encontramos actividades</h2>
          <p className="text-[16px] text-grey-900">Probá cambiar los filtros o buscá con otro término.</p>
          <button type="button" onClick={onReset} className="mt-3 rounded bg-primary-600 px-6 py-3 font-bold text-white">Limpiar filtros</button>
        </section>
      ) : (
        <>
          <div data-testid="agenda-grid" className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
          </div>
          {hasMore && <div className="mt-7 text-center">
            <button type="button" onClick={() => setLimit(n => Math.max(n, pageSize) + pageSize)} className="rounded bg-primary-600 px-6 py-3 font-bold text-white hover:bg-primary-700">Mostrar más actividades</button>
          </div>}
        </>
      )}

      <AgendaPromo />
    </PageContainer>
  );
}
