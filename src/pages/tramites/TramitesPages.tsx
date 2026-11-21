import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { PageContainer } from '../../components/layout/PageContainer';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { TableOfContents } from '../../components/ui/TableOfContents';
import { copyToClipboard } from '../../components/ui/copyToClipboard';
import { AgendaDropdown } from '../../components/agenda/AgendaDropdown';
import { AgendaSortDropdown } from '../../features/agenda/components/filters/AgendaSortDropdown';
import { AgendaSelectedFilterChips } from '../../components/agenda/AgendaSelectedFilterChips';
import { TramitesMoreFilters, camposFiltro, type FiltrosTramites } from './TramitesMoreFilters';
import { documentacionPublica, notaDocumentacionPublica, bloquesProcedimiento, textoPublicoLegible, horarioPublico, sedePublica, otrosTramitesDelTema } from './tramites-format';
import { destinatarios, normalizarBusqueda, temas, tramites, type Tramite } from '../../data/tramites';
import { TramitesBackToTop } from './TramitesBackToTop';
import { iconoDestinatario } from './tramites-icons';
import './tramites.css';

declare const __MLZ_BUILD_SHA__: string;
declare const __MLZ_BUILD_AT__: string;

function TramitesBuildBadge() {
  const sha = __MLZ_BUILD_SHA__;
  const fecha = new Date(__MLZ_BUILD_AT__);
  const hora = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(fecha);
  const version = sha ? sha.slice(-3).toUpperCase() : 'DEV';
  return <span className="tram-build-badge"
    aria-label={`Versión ${version}. Última actualización a las ${hora}, hora de Argentina`}
    title={`Versión ${sha || 'desarrollo'} · Publicado: ${fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`}
  ><span className="tram-build-code">{version}</span><span className="tram-build-time">{hora}</span></span>;
}

function TramitesBreadcrumb({ items }: { items: React.ComponentProps<typeof Breadcrumbs>['items'] }) {
  return <div className="tram-breadcrumb-row"><Breadcrumbs items={items} /><TramitesBuildBadge /></div>;
}

const VISITAS_KEY = 'mlz-tramites-visitas-v1';
function leerVisitas(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(VISITAS_KEY) || '{}') as Record<string, number>; }
  catch { return {}; }
}
function registrarVisita(id: string) {
  try {
    const visitas = leerVisitas();
    visitas[id] = (visitas[id] || 0) + 1;
    localStorage.setItem(VISITAS_KEY, JSON.stringify(visitas));
  } catch { /* El acceso a almacenamiento puede estar bloqueado. */ }
}

const base = '/tramites';
const ficha = (id: string) => base + '/' + id;
function Etiquetas({ items, activa, onSeleccionar }: {
  items: readonly string[];
  activa?: string;
  onSeleccionar?: (etiqueta: string) => void;
}) {
  return <div className="tram-tags" aria-label="Etiquetas del trámite">
    {items.map((item) => onSeleccionar
      ? <button key={item} type="button"
          className={'tram-tag tram-tag-action' + (activa === item ? ' tram-tag-selected' : '')}
          aria-label={'Filtrar trámites por etiqueta: ' + item}
          aria-pressed={activa === item}
          onClick={() => onSeleccionar(item)} title={item}>{item}</button>
      : <Link key={item} to={base + '?etiqueta=' + encodeURIComponent(item)}
          className="tram-tag tram-tag-action"
          aria-label={'Ver trámites con etiqueta: ' + item}
          onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })} title={item}>{item}</Link>)}
  </div>;
}

function FilaTramite({ tramite, etiquetaActiva, onElegirEtiqueta }: {
  tramite: Tramite;
  etiquetaActiva: string;
  onElegirEtiqueta: (etiqueta: string) => void;
}) {
  const navigate = useNavigate();
  const abrirFicha = () => { registrarVisita(tramite.id); navigate(ficha(tramite.id)); };
  return (
    <article className="tram-row" data-testid="tramite-row" role="link" tabIndex={0}
      aria-label={'Ver trámite: ' + tramite.titulo}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a, button')) return;
        abrirFicha();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          abrirFicha();
        }
      }}>
      <div className="tram-row-body">
        <div className="tram-row-content">
          <h3>{tramite.titulo}</h3>
          <p>{tramite.descripcion}</p>
          <span className="tram-modalidad">Modalidad: <strong>{tramite.modalidad}</strong></span>
        </div>
      </div>
      <div className="tram-row-side">
        <h4>Etiquetas</h4>
        <Etiquetas items={tramite.etiquetas} activa={etiquetaActiva} onSeleccionar={onElegirEtiqueta} />
      </div>
      <div className="tram-row-actions">
        <Link className="tram-link-action" to={ficha(tramite.id)} onClick={() => registrarVisita(tramite.id)}>
          Ver trámite <MaterialIcon name="chevron_right" size={20} />
        </Link>
      </div>
    </article>
  );
}

function elegirDestinatarios(setSearchParams: ReturnType<typeof useSearchParams>[1], valores: readonly string[]) {
  setSearchParams((actual) => {
    const siguiente = new URLSearchParams(actual);
    siguiente.delete('destinatario');
    for (const valor of [...new Set(valores)]) {
      if (destinatarios.includes(valor)) siguiente.append('destinatario', valor);
    }
    return siguiente;
  }, { replace: true });
}

function elegirValor(setSearchParams: ReturnType<typeof useSearchParams>[1], key: string, value: string) {
  setSearchParams((actual) => {
    const siguiente = new URLSearchParams(actual);
    if (value) siguiente.set(key, value); else siguiente.delete(key);
    return siguiente;
  }, { replace: true });
}

export function TramitesCatalogPage() {
  const [params, setParams] = useSearchParams();
  // useSearchParams no acumula múltiples actualizaciones funcionales en la
  // misma tanda. Conservar el estado más reciente evita perder destinatarios
  // al seleccionar varias opciones rápidamente desde «Más filtros».
  const parametrosPendientes = useRef(new URLSearchParams(params));
  useEffect(() => {
    parametrosPendientes.current = new URLSearchParams(params);
  }, [params]);
  const busqueda = params.get('q') ?? '';
  const diferida = useDeferredValue(busqueda);
  const tema = params.get('tema') ?? '';
  const destinatario = [...new Set(params.getAll('destinatario'))].filter((nombre) => destinatarios.includes(nombre));
  const modalidad = params.get('modalidad') ?? '';
  const turno = params.get('turno') ?? '';
  const etiqueta = params.get('etiqueta') ?? '';
  const orden = params.get('orden') === 'az' ? 'az' : params.get('orden') === 'recurrencia' ? 'recurrencia' : 'tema';
  const valores: FiltrosTramites = { destinatario, tema, turno, modalidad, etiqueta };
  const modalidades = useMemo(() => Array.from(new Set(tramites.map(t => t.modalidad))), []);
  const limpiarOpciones = () => setParams(actual => {
    const siguiente = new URLSearchParams(actual);
    camposFiltro.forEach(campo => siguiente.delete(campo));
    return siguiente;
  }, { replace: true });

  const limpiarTodo = () => setParams(actual => new URLSearchParams(
    actual.get('orden') === 'az' ? { orden: 'az' } : actual.get('orden') === 'recurrencia' ? { orden: 'recurrencia' } : {}
  ), { replace: true });
  const cambiarFiltro = (campo: (typeof camposFiltro)[number], valor: string) => {
    const siguiente = new URLSearchParams(parametrosPendientes.current);
    if (campo === 'destinatario') {
      const anteriores = [...new Set(siguiente.getAll('destinatario'))];
      const nuevos = anteriores.includes(valor)
        ? anteriores.filter(item => item !== valor)
        : [...anteriores, valor];
      siguiente.delete('destinatario');
      nuevos.filter(item => destinatarios.includes(item)).forEach(item =>
        siguiente.append('destinatario', item));
    } else if (siguiente.get(campo) === valor) {
      siguiente.delete(campo);
    } else {
      siguiente.set(campo, valor);
    }
    parametrosPendientes.current = siguiente;
    setParams(siguiente, { replace: true });
  };
  const chips: { campo: (typeof camposFiltro)[number]; valor: string }[] = [
    ...destinatario.map((valor) => ({ campo: 'destinatario' as const, valor })),
    ...(['tema', 'turno', 'modalidad', 'etiqueta'] as const).flatMap(campo =>
      valores[campo] ? [{ campo, valor: valores[campo] }] : []),
  ];

  const filtrados = useMemo(() => {
    const q = normalizarBusqueda(diferida);
    const rows = tramites.filter((t) =>
      (!q || normalizarBusqueda([t.titulo, t.descripcion, t.sinonimos, ...t.etiquetas].join(' ')).includes(q)) &&
      (!tema || t.categoria === tema) &&
      (!etiqueta || t.etiquetas.some(item => normalizarBusqueda(item) === normalizarBusqueda(etiqueta))) &&
      (!destinatario.length || destinatario.some(item => t.destinatarios.includes(item))) &&
      (!modalidad || t.modalidad === modalidad) &&
      (!turno || (turno === 'Requiere turno' && /^(s[ií])$/i.test(t.turno.trim())) ||
        (turno === 'No requiere turno' && /^no$/i.test(t.turno.trim())))
    );
    const visitas = orden === 'recurrencia' ? leerVisitas() : {};
    return orden === 'az'
      ? [...rows].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
      : orden === 'recurrencia'
        ? [...rows].sort((a, b) => (visitas[b.id] || 0) - (visitas[a.id] || 0))
        : rows;
  }, [diferida, tema, destinatario, modalidad, turno, etiqueta, orden]);

  const grupos = useMemo(() => orden !== 'tema'
    ? [{ nombre: '', items: filtrados }]
    : temas.map((nombre) => ({ nombre, items: filtrados.filter((tramite) => tramite.categoria === nombre) })).filter((grupo) => grupo.items.length > 0), [filtrados, orden]);

  const elegirEtiqueta = (item: string) => {
    elegirValor(setParams, 'etiqueta', etiqueta === item ? '' : item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hayFiltros = !!(busqueda || chips.length);
  return (
    <PageContainer className="tram-container">
      <TramitesBreadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites' }]} />
      <h1 className="tram-title">Catálogo de trámites</h1>
      <div className="tram-filters agenda-search-filterbar" role="search" aria-label="Filtrar trámites">
        <label className="tram-search relative">
          <span className="sr-only">Buscar trámite</span>
          <input
            type="search"
            aria-label="Buscar trámite"
            placeholder="Buscá un trámite: licencia, poda..."
            value={busqueda}
            onChange={(event) => elegirValor(setParams, 'q', event.target.value)}
            className="agenda-search-input"
          />
          {busqueda ? (
            <button type="button" aria-label="Borrar búsqueda" onClick={() => elegirValor(setParams, 'q', '')}>
              <MaterialIcon name="close" size={24}/>
            </button>
          ) : <MaterialIcon name="search" size={24} className="tram-search-icon" />}
        </label>
        <div className="tram-filter-control tram-filter-audience-control">
          <AgendaDropdown label="¿Para quién es?" options={destinatarios}
            selected={destinatario} multiple reserveCounterSpace resultCount={filtrados.length}
            onChange={(seleccion) => elegirDestinatarios(setParams, seleccion)}
            align="end" />
        </div>
        <div className="tram-filter-control tram-filter-topic-control">
          <AgendaDropdown label="Tema" options={temas} selectionControl="radio"
            selected={tema ? [tema] : []} showSelectedLabel resultCount={filtrados.length}
            onChange={(seleccion) => elegirValor(setParams, 'tema', seleccion[0] ?? '')}
            align="end-responsive" />
        </div>
        <div className="tram-filter-control tram-filter-more-control">
          <TramitesMoreFilters
            value={valores}
            temas={temas}
            destinatarios={destinatarios}
            modalidades={modalidades}
            resultCount={filtrados.length}
            onChange={cambiarFiltro}
            onReset={limpiarOpciones}
          />
        </div>
      </div>
      {hayFiltros && <AgendaSelectedFilterChips
        className="tram-active-filters"
        items={chips.map(({ campo, valor }) => ({
          id: campo + ':' + valor,
          label: valor,
          ariaLabel: 'Quitar filtro ' + campo + ': ' + valor,
          testId: 'tramite-filter-chip-' + campo,
          campo,
          valor,
        }))}
        onRemove={chip => cambiarFiltro(chip.campo, chip.valor)}
        onClear={limpiarTodo}
      />}
      <div className="tram-results"><strong aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'trámite' : 'trámites'}</strong>
        <AgendaSortDropdown ghost value={orden === 'tema' ? 'default' : orden}
          options={[{ value: 'default', text: 'Por tema' }, { value: 'az', text: 'Alfabético A–Z' }, { value: 'recurrencia', text: 'Por recurrencia' }]}
          title="Ordenar trámites"
          onChange={(value) => elegirValor(setParams, 'orden', value === 'az' ? 'az' : value === 'recurrencia' ? 'recurrencia' : '')} />
      </div>
      {grupos.length ? grupos.map((grupo) => <section className="tram-group" key={grupo.nombre || 'az'} aria-label={grupo.nombre || (orden === 'recurrencia' ? 'Trámites ordenados por recurrencia' : 'Trámites ordenados alfabéticamente')}>
        {!!grupo.nombre && <div className="tram-group-heading"><h2>{grupo.nombre}</h2>{!tema && <button type="button" onClick={() => { elegirValor(setParams, 'tema', grupo.nombre); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ver todo</button>}</div>}
        <div className="tram-group-grid">{grupo.items.map((tramite) => <FilaTramite key={tramite.id} tramite={tramite}
          etiquetaActiva={etiqueta} onElegirEtiqueta={elegirEtiqueta} />)}</div>
      </section>) : <div className="tram-empty"><h2>No encontramos trámites con esos filtros</h2><p>Probá con otras palabras o quitá alguno de los filtros.</p><button type="button" className="tram-btn" onClick={() => setParams({})}>Ver todos los trámites</button></div>}
      <TramitesBackToTop />
    </PageContainer>
  );
}


function AccionesFicha() {
  const [estado, setEstado] = useState<'idle' | 'copied' | 'error'>('idle');
  async function compartir() {
    // El mismo mecanismo de Agenda: copiar enlace y cambiar el ícono a check.
    const copiado = await copyToClipboard(window.location.href);
    setEstado(copiado ? 'copied' : 'error');
  }
  return <div className="tram-detail-actions" aria-label="Acciones de la ficha">
    <button type="button" onClick={() => { void compartir(); }}
      aria-label={estado === 'copied' ? 'Enlace copiado' : 'Compartir'}
      title={estado === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}>
      <MaterialIcon name={estado === 'copied' ? 'check' : 'link'} size={24} />
      <span>{estado === 'copied' ? 'Enlace copiado' : 'Compartir'}</span>
    </button>
    <button type="button" onClick={() => window.print()}>
      <MaterialIcon name="print" size={24} /><span>Imprimir</span>
    </button>
    <span className="sr-only" role="status" aria-live="polite">
      {estado === 'copied' ? 'Enlace copiado al portapapeles' :
        estado === 'error' ? 'No se pudo copiar el enlace' : ''}
    </span>
  </div>;
}

/** El mismo índice institucional usado por Jóvenes en Comunidad. */
function IndiceFicha({ secciones }: { secciones: { id: string; titulo: string }[] }) {
  return <TableOfContents
    items={secciones.map(({ id, titulo }) => ({ id, label: titulo }))}
    ariaLabel="Índice de la ficha"
  />;
}

function DocumentacionFicha({ tramite }: { tramite: Tramite }) {
  const items = documentacionPublica(tramite);
  const nota = notaDocumentacionPublica(tramite);
  if (!items.length && !nota) return null;
  return <section className="tram-detail-section" id="documentacion">
    <h2>Documentación</h2>
    {nota && <p className="tram-document-note">{textoPublicoLegible(nota)}</p>}
    {items.length > 0 && <ul className="tram-documents">{items.map((item, index) => <li key={index}>
      <span className="tram-document-icon"><MaterialIcon name="verified" size={24} /></span>
      <span>{textoPublicoLegible(item)}</span>
    </li>)}</ul>}
  </section>;
}

function ProcedimientoFicha({ tramite }: { tramite: Tramite }) {
  const bloques = bloquesProcedimiento(tramite);
  if (!bloques.length) return null;

  return <section className="tram-detail-section" id="procedimiento">
    <h2>¿Cómo se realiza?</h2>
    <div className="tram-procedure-blocks">
      {bloques.map((bloque, bloqueIndex) => {
        if (bloque.tipo === 'texto') return <p key={bloqueIndex}
          className="tram-longtext tram-procedure-note">{bloque.texto}</p>;
        if (bloque.tipo === 'lista') return <ul key={bloqueIndex}
          className="tram-procedure-list">{bloque.items.map((item, indice) =>
            <li key={indice}>{textoPublicoLegible(item)}</li>)}</ul>;
        return <ol className="tram-timeline" key={bloqueIndex}>
          {bloque.items.map((paso, index) => <li key={index}>
            <span className="tram-timeline-marker">{index + 1}</span>
            <span className="tram-timeline-text">{textoPublicoLegible(paso)}</span>
          </li>)}
        </ol>;
      })}
    </div>
  </section>;
}

/** Panel institucional del frame de Figma, sin canales operativos de ORIGEN. */
function AyudaFicha() {
  return <section className="tram-contact-help" aria-label="Ayuda sobre el trámite">
    <div className="tram-contact-main">
      <div className="tram-contact-heading">
        <h2>¿Necesitás ayuda?</h2>
      </div>
      <p>¿Tenés dudas sobre este trámite? Comunicate con el Centro de Atención a la Comunidad.</p>
      <a className="tram-whatsapp-link" href="https://wa.me/5491121937726" target="_blank" rel="noopener noreferrer">
        WhatsApp de la Comunidad
      </a>
    </div>
    <div className="tram-support-hours">
      <h2>Horarios de atención</h2>
      <p>Lunes a viernes</p>
      <strong>08:00 a 20:00</strong>
      <p>Sábados, domingos y feriados</p>
      <strong>08:00 a 13:00</strong>
    </div>
  </section>;
}

function SedeFicha({ tramite }: { tramite: Tramite }) {
  const sedes = [
    { lugar: tramite.direccion, dias: tramite.horarios, turno: tramite.turno },
    ...(tramite.sedeAlternativa ? [tramite.sedeAlternativa] : []),
  ].filter(sede => sede.lugar.trim() || sede.dias.trim() || sede.turno.trim());
  if (!sedes.length) return null;
  const turno = tramite.turno.trim();
  const turnoLabel = /^no$/i.test(turno) ? 'No requiere turno' :
    /^(sí|si)$/i.test(turno) ? 'Requiere turno previo' : textoPublicoLegible(turno);
  const direccionMapa = sedePublica(tramite.direccion).direccion || tramite.direccion;
  // Mostrar siempre el mapa de la primera sede, aunque la fuente solo indique oficina o dependencia.
  const mapsQuery = direccionMapa + ', Lomas de Zamora, Buenos Aires, Argentina';
  return <section className="tram-detail-section" id="donde-cuando">
    <div className="tram-location-section-heading">
      <h2>Dónde y cuándo</h2>
      {turnoLabel && <div className="tram-turno-tags">
        <span className="tram-audience-tag"><MaterialIcon name={/^no$/i.test(turno) ? 'event_busy' : 'event_available'} size={18} />{turnoLabel}</span>
      </div>}
    </div>
    <div className="tram-sedes">{sedes.map((sede, index) => { const lugar = sedePublica(sede.lugar); return <div key={index} className="tram-location-card">
      <div className="tram-location-card-top">
        <div className="tram-location-card-details">

          <div className="tram-location-info">
            {sede.dias.trim() && <div className="tram-location-item">
              <MaterialIcon name="schedule" size={24} className="tram-location-symbol" />
              <p>{horarioPublico(sede.dias)}</p>
            </div>}
            {sede.lugar.trim() && <div className="tram-location-item">
              <MaterialIcon name="location_on" size={24} className="tram-location-symbol" />
              {lugar.oficina
                ? <div className="tram-location-address">
                    <strong>{lugar.oficina}</strong>
                    {lugar.direccion && <span>{lugar.direccion}</span>}
                    {lugar.detalle && <span>{lugar.detalle}</span>}
                  </div>
                : <p>{lugar.detalle}</p>}
            </div>}
          </div>

          {index === 0 && <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapsQuery)}
        target="_blank" rel="noopener noreferrer" className="tram-location-map-link">
        Ver en Google Maps <MaterialIcon name="chevron_right" size={20}/>
      </a>}
        </div>
        {index === 0 && <iframe className="tram-location-map"
          title={'Mapa de ' + textoPublicoLegible(tramite.direccion)}
          src={'https://www.google.com/maps?q=' + encodeURIComponent(mapsQuery) + '&output=embed'}
          loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
      </div>
    </div>; })}</div>
  </section>;
}

function OtrosTramitesFicha({ items }: { items: readonly Tramite[] }) {
  if (!items.length) return null;
  return <section className="tram-detail-section tram-related-section" id="otros-tramites">
    <h2>Otros trámites del tema</h2>
    <div className="tram-related-grid">
      {items.map(item => <Link key={item.id} to={ficha(item.id)}
        className="tram-related-card" aria-label={'Ver trámite: ' + item.titulo}>
        <span className="tram-related-icon"><MaterialIcon name="receipt_long" size={32}/></span>
        <strong>{item.titulo}</strong>
        <p>{item.descripcion}</p>
      </Link>)}
    </div>
  </section>;
}

export function TramiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tramite = tramites.find((item) => item.id.toLowerCase() === (id || '').toLowerCase());
  if (!tramite) return <PageContainer className="tram-container">
    <TramitesBreadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites', to: base }, { label: 'No encontrado' }]} />
    <h1 className="tram-title">No encontramos ese trámite</h1>
    <Link to={base} className="tram-btn">Volver al catálogo</Link>
  </PageContainer>;

  // Los bloques siguen Figma; las tarjetas usan únicamente el catálogo editorial.
  const otrosTramites = otrosTramitesDelTema(tramite, tramites);
  const secciones = [
    { id: 'destinatarios', titulo: '¿Quién puede solicitarlo?', visible: tramite.destinatarios.length > 0 },
    { id: 'documentacion', titulo: 'Documentación', visible: documentacionPublica(tramite).length > 0 || Boolean(notaDocumentacionPublica(tramite)) },
    { id: 'procedimiento', titulo: '¿Cómo se realiza?', visible: bloquesProcedimiento(tramite).length > 0 },
    { id: 'donde-cuando', titulo: 'Dónde y cuándo', visible: Boolean(tramite.direccion.trim() || tramite.horarios.trim() || tramite.turno.trim()) },
    { id: 'otros-tramites', titulo: 'Otros trámites del tema', visible: otrosTramites.length > 0 },
  ].filter((seccion) => seccion.visible);

  return <PageContainer className="tram-container tram-detail">
    <TramitesBreadcrumb items={[
      { label: 'Inicio', to: '/' },
      { label: 'Trámites', to: base },
      { label: tramite.categoria, to: base + '?tema=' + encodeURIComponent(tramite.categoria) },
      { label: tramite.titulo },
    ]} />
    <div className="tram-detail-grid">
      <article className="tram-detail-main">
        <header className="tram-detail-header">
          <h1>{tramite.titulo}</h1>
          <p className="tram-lead">{tramite.descripcion}</p>
          <p className="tram-modalidad">Modalidad: <strong>{tramite.modalidad}</strong></p>
          <Etiquetas items={tramite.etiquetas} />
        </header>
        <div className="tram-detail-mobile-tools">
          <AccionesFicha />
          <IndiceFicha secciones={secciones} />
        </div>
        {tramite.destinatarios.length > 0 && <section id="destinatarios" className="tram-detail-section">
          <h2>¿Quién puede solicitarlo?</h2>
          <div className="tram-audiences">{tramite.destinatarios.map((destinatario) =>
            <span className="tram-audience-tag" key={destinatario}>
              <MaterialIcon name={iconoDestinatario(destinatario)} size={18} />{destinatario}
            </span>
          )}</div>
        </section>}
        <DocumentacionFicha tramite={tramite}/>
        <ProcedimientoFicha tramite={tramite}/>
        <SedeFicha tramite={tramite}/>
        <OtrosTramitesFicha items={otrosTramites}/>
        <AyudaFicha/>
      </article>
      <aside className="tram-detail-aside">
        <AccionesFicha />
        <IndiceFicha secciones={secciones} />
      </aside>
    </div>
  </PageContainer>;
}
