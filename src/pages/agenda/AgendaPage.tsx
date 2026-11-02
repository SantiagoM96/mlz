import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AgendaToolbar } from '../../components/agenda/AgendaToolbar';
import { AgendaSortDropdown, type AgendaSortValue } from '../../components/agenda/AgendaDropdown';
import { AgendaPromo } from '../../components/agenda/AgendaPromo';
import { emptyFilters, type SelectedFilters } from '../../components/agenda/AgendaFilterPanel';
import { agendaActivities, argentinaTodayISO } from '../../data/agenda';

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
    const normalize = (v: string) => v.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').replace('–', '-');
    const term = normalize(search.trim());
    const today = argentinaTodayISO();
    const todayDate = new Date(today + 'T12:00:00Z');
    const monday = new Date(todayDate);
    monday.setUTCDate(todayDate.getUTCDate() - (todayDate.getUTCDay() + 6) % 7);
    const weekStart = monday.toISOString().slice(0, 10);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const weekEnd = sunday.toISOString().slice(0, 10);

    const results = agendaActivities.filter(activity => {
      if (term && !normalize([
        activity.title, activity.category, activity.type, activity.locality,
        activity.venue ?? '',
      ].join(' ')).includes(term)) return false;
      if (filters.type.length && !filters.type.some(type => normalize(type) === normalize(activity.type))) return false;
      if (filters.category.length && !filters.category.includes(activity.category)) return false;
      if (filters.locality.length && !filters.locality.includes(activity.locality)) return false;
      if (filters.date.length) {
        const date = activity.dateISO ?? '';
        const isWeek = date >= weekStart && date <= weekEnd;
        const weekDay = date ? new Date(date + 'T12:00:00Z').getUTCDay() : -1;
        const matchesDate = filters.date.some(option =>
          (option === 'Hoy' && date === today) ||
          (option === 'Esta semana' && isWeek) ||
          (option === 'Este fin de semana' && isWeek && (weekDay === 0 || weekDay === 6)));
        if (!matchesDate) return false;
      }
      return true;
    });

    if (sort === 'az') results.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    if (sort === 'za') results.sort((a, b) => b.title.localeCompare(a.title, 'es'));
    if (sort === 'default') {
      // Primero las fechas actuales/futuras, después el archivo (más reciente primero).
      results.sort((a, b) => {
        const aFuture = (a.dateISO ?? '') >= today;
        const bFuture = (b.dateISO ?? '') >= today;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        const order = (a.dateISO ?? '').localeCompare(b.dateISO ?? '');
        return aFuture ? order : -order;
      });
    }
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
        <p className="mt-2 text-[14px] leading-5 text-[#69737b]">Información de la planilla 2026; incluye registros históricos. Confirmá fechas y disponibilidad antes de asistir.</p>
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
        <section data-testid="agenda-empty-state"
          className="flex min-h-[355px] flex-col items-center justify-center text-center" aria-live="polite">
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
