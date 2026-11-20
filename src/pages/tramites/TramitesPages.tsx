import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { PageContainer } from '../../components/layout/PageContainer';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { TableOfContents } from '../../components/ui/TableOfContents';
import { copyToClipboard } from '../../components/ui/copyToClipboard';
import { AgendaDropdown } from '../../components/agenda/AgendaDropdown';
import { TramitesMoreFilters, camposFiltro, type FiltrosTramites } from './TramitesMoreFilters';
import { documentacionPublica, pasosPublicos, textoPublicoLegible, otrosTramitesDelTema } from './tramites-format';
import { destinatarios, normalizarBusqueda, temas, tramites, type Tramite } from '../../data/tramites';
import { TramitesBackToTop } from './TramitesBackToTop';
import './tramites.css';

const base = '/tramites';
const ficha = (id: string) => base + '/' + id;
function Etiquetas({ items }: { items: readonly string[] }) {
  return <div className="tram-tags">{items.map((item) => <span className="tram-tag" key={item}>{item}</span>)}</div>;
}

function FilaTramite({ tramite }: { tramite: Tramite }) {
  return (
    <article className="tram-row" data-testid="tramite-row">
      <div className="tram-row-body">
        <h3>{tramite.titulo}</h3>
        <p>{tramite.descripcion}</p>
        <div className="tram-row-actions">
          <Link className="tram-btn" to={ficha(tramite.id)}>Ver trámite</Link>
          <span className="tram-modalidad">Modalidad: <strong>{tramite.modalidad}</strong></span>
        </div>
      </div>
      <div className="tram-row-side">
        <h4>Etiquetas</h4>
        <Etiquetas items={tramite.etiquetas} />
      </div>
    </article>
  );
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
  const busqueda = params.get('q') ?? '';
  const diferida = useDeferredValue(busqueda);
  const tema = params.get('tema') ?? '';
  const destinatario = params.get('destinatario') ?? '';
  const modalidad = params.get('modalidad') ?? '';
  const turno = params.get('turno') ?? '';
  const orden = params.get('orden') === 'az' ? 'az' : 'tema';
  const valores: FiltrosTramites = { destinatario, tema, turno, modalidad };
  const modalidades = useMemo(() => Array.from(new Set(tramites.map(t => t.modalidad))), []);
  const limpiarOpciones = () => setParams(actual => {
    const siguiente = new URLSearchParams(actual);
    camposFiltro.forEach(campo => siguiente.delete(campo));
    return siguiente;
  }, { replace: true });

  const filtrados = useMemo(() => {
    const q = normalizarBusqueda(diferida);
    const rows = tramites.filter((t) =>
      (!q || normalizarBusqueda([t.titulo, t.descripcion, t.sinonimos, ...t.etiquetas].join(' ')).includes(q)) &&
      (!tema || t.categoria === tema) &&
      (!destinatario || t.destinatarios.includes(destinatario)) &&
      (!modalidad || t.modalidad === modalidad) &&
      (!turno || (turno === 'Requiere turno' && /^(s[ií])$/i.test(t.turno.trim())) ||
        (turno === 'No requiere turno' && /^no$/i.test(t.turno.trim())))
    );
    return orden === 'az'
      ? [...rows].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
      : rows;
  }, [diferida, tema, destinatario, modalidad, turno, orden]);

  const grupos = useMemo(() => orden === 'az'
    ? [{ nombre: '', items: filtrados }]
    : temas.map((nombre) => ({ nombre, items: filtrados.filter((tramite) => tramite.categoria === nombre) })).filter((grupo) => grupo.items.length > 0), [filtrados, orden]);

  const hayFiltros = !!(busqueda || tema || destinatario || modalidad || turno);
  return (
    <PageContainer className="tram-container">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites' }]} />
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
        <div className="tram-filter-control">
          <AgendaDropdown label="¿Para quién es?" options={destinatarios}
            selected={destinatario ? [destinatario] : []} resultCount={filtrados.length}
            onChange={(values) => elegirValor(setParams, 'destinatario', values[0] ?? '')}
            align="end" />
        </div>
        <div className="tram-filter-control">
          <AgendaDropdown label="Tema" options={temas}
            selected={tema ? [tema] : []} resultCount={filtrados.length}
            onChange={(values) => elegirValor(setParams, 'tema', values[0] ?? '')}
            align="end-responsive" />
        </div>
        <div className="tram-filter-control tram-filter-more-control">
          <TramitesMoreFilters
            value={valores}
            temas={temas}
            destinatarios={destinatarios}
            modalidades={modalidades}
            resultCount={filtrados.length}
            onChange={(campo, value) => elegirValor(setParams, campo, value)}
            onReset={limpiarOpciones}
          />
        </div>
      </div>
      <div className="tram-results"><strong aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'trámite' : 'trámites'}</strong>
        <div className="tram-sort"><span>Ordenar</span><div className="tram-sort-buttons" role="group" aria-label="Ordenar trámites"><button type="button" className={orden === 'tema' ? 'active' : ''} aria-pressed={orden === 'tema'} onClick={() => elegirValor(setParams, 'orden', '')}>Por tema</button><button type="button" className={orden === 'az' ? 'active' : ''} aria-pressed={orden === 'az'} onClick={() => elegirValor(setParams, 'orden', 'az')}>A–Z</button></div></div>
      </div>
      {hayFiltros && <div className="tram-active-filters">
        <span>Filtros aplicados</span>
        <div className="tram-selected-filters">
          {camposFiltro.filter(campo => valores[campo]).map(campo =>
            <button type="button" key={campo} data-testid={'tramite-filter-chip-' + campo}
              aria-label={'Quitar filtro ' + campo + ': ' + valores[campo]}
              onClick={() => elegirValor(setParams, campo, '')}
              className="agenda-filter-chip inline-flex min-h-[30px] items-center gap-2 rounded-[6px] bg-info-500 px-2.5 text-[14px] font-medium text-white hover:bg-[#005bd1]">
              {valores[campo]} <MaterialIcon name="close" size={15} />
            </button>)}
          <button type="button" onClick={() => setParams(new URLSearchParams(orden === 'az' ? { orden: 'az' } : {}))}>
            Limpiar filtros
          </button>
        </div>
      </div>}
      {grupos.length ? grupos.map((grupo) => <section className="tram-group" key={grupo.nombre || 'az'} aria-label={grupo.nombre || 'Trámites ordenados alfabéticamente'}>
        {!!grupo.nombre && <div className="tram-group-heading"><h2>{grupo.nombre} <small>({grupo.items.length})</small></h2>{!tema && <button type="button" onClick={() => { elegirValor(setParams, 'tema', grupo.nombre); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ver el tema <MaterialIcon name="chevron_right" size={24} /></button>}</div>}
        <div>{grupo.items.map((tramite) => <FilaTramite key={tramite.id} tramite={tramite} />)}</div>
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
  if (!items.length) return null;
  return <section className="tram-detail-section" id="documentacion">
    <h2>Documentación</h2>
    <p className="tram-document-intro">Para realizar el trámite te van a solicitar la siguiente documentación</p>
    <ul className="tram-documents">{items.map((item, index) => <li key={index}>
      <span className="tram-document-icon"><MaterialIcon name="description" size={24} /></span>
      <span>{textoPublicoLegible(item)}</span>
    </li>)}</ul>
  </section>;
}

function ProcedimientoFicha({ tramite }: { tramite: Tramite }) {
  const texto = tramite.pasos || tramite.comoIniciar;
  const pasos = pasosPublicos(tramite);
  if (!texto.trim() && !pasos.length) return null;
  return <section className="tram-detail-section" id="procedimiento">
    <h2>¿Cómo se realiza?</h2>
    {pasos.length > 0 ? <ol className="tram-timeline">{pasos.map((paso, index) =>
      <li key={index}>
        <span className="tram-timeline-marker">{index + 1}</span>
        <span>{paso}</span>
      </li>
    )}</ol> : <p className="tram-longtext">{texto}</p>}
  </section>;
}

/** Panel institucional del frame de Figma, sin canales operativos de ORIGEN. */
function AyudaFicha() {
  return <section className="tram-contact-help" aria-label="Ayuda sobre el trámite">
    <div className="tram-contact-heading">
      <span className="tram-help-icon"><MaterialIcon name="support_agent" size={24}/></span>
      <h2>¿Necesitás ayuda?</h2>
    </div>
    <p>¿Tenés dudas sobre este trámite? Comunicate con el Centro de Atención a la Comunidad.</p>
    <a className="tram-whatsapp-link" href="https://wa.me/5491121937726" target="_blank" rel="noopener noreferrer">
      WhatsApp de la Comunidad
    </a>
    <div className="tram-support-hours">
      <h3><MaterialIcon name="schedule" size={22}/> Horarios de atención</h3>
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
  const showMap = /\b\d{2,5}\b/.test(tramite.direccion);
  const mapsQuery = tramite.direccion + ', Lomas de Zamora, Buenos Aires, Argentina';
  return <section className="tram-detail-section" id="donde-cuando">
    <h2>Dónde y cuándo</h2>
    {turnoLabel && <div className="tram-turno-tags">
      <span><MaterialIcon name={/^no$/i.test(turno) ? 'event' : 'event_available'} size={18} />{turnoLabel}</span>
    </div>}
    <div className="tram-sedes">{sedes.map((sede, index) => <div key={index} className="tram-location">
      <div className="tram-location-info">
        {sede.dias.trim() && <div className="tram-location-item">
          <MaterialIcon name="schedule" size={24} className="tram-location-symbol" />
          <p>{textoPublicoLegible(sede.dias)}</p>
        </div>}
        {sede.lugar.trim() && <div className="tram-location-item">
          <MaterialIcon name="location_on" size={24} className="tram-location-symbol" />
          <p>{textoPublicoLegible(sede.lugar)}</p>
        </div>}
      </div>
      {index === 0 && showMap && <div className="tram-location-map-wrap">
        <iframe className="tram-location-map"
          title={'Mapa de ' + textoPublicoLegible(tramite.direccion)}
          src={'https://www.google.com/maps?q=' + encodeURIComponent(mapsQuery) + '&output=embed'}
          loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapsQuery)}
          target="_blank" rel="noopener noreferrer" className="tram-location-map-link">
          Ver en Google Maps <MaterialIcon name="chevron_right" size={20}/>
        </a>
      </div>}
    </div>)}</div>
  </section>;
}

function OtrosTramitesFicha({ items }: { items: readonly Tramite[] }) {
  if (!items.length) return null;
  return <section className="tram-detail-section tram-related-section" id="otros-tramites">
    <h2>Otros trámites del tema</h2>
    <div className="tram-related-grid">
      {items.map(item => <Link key={item.id} to={ficha(item.id)}
        className="tram-related-card" aria-label={'Ver trámite: ' + item.titulo}>
        <span className="tram-related-icon"><MaterialIcon name="receipt_long" size={24}/></span>
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
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites', to: base }, { label: 'No encontrado' }]} />
    <h1 className="tram-title">No encontramos ese trámite</h1>
    <Link to={base} className="tram-btn">Volver al catálogo</Link>
  </PageContainer>;

  // Los bloques siguen Figma; las tarjetas usan únicamente el catálogo editorial.
  const otrosTramites = otrosTramitesDelTema(tramite, tramites);
  const secciones = [
    { id: 'destinatarios', titulo: '¿Quién puede solicitarlo?', visible: tramite.destinatarios.length > 0 },
    { id: 'documentacion', titulo: 'Documentación', visible: documentacionPublica(tramite).length > 0 },
    { id: 'procedimiento', titulo: '¿Cómo se realiza?', visible: Boolean(tramite.pasos.trim() || tramite.comoIniciar.trim()) },
    { id: 'donde-cuando', titulo: 'Dónde y cuándo', visible: Boolean(tramite.direccion.trim() || tramite.horarios.trim() || tramite.turno.trim()) },
    { id: 'otros-tramites', titulo: 'Otros trámites del tema', visible: otrosTramites.length > 0 },
  ].filter((seccion) => seccion.visible);

  return <PageContainer className="tram-container tram-detail">
    <Breadcrumbs items={[
      { label: 'Inicio', to: '/' },
      { label: 'Trámites', to: base },
      { label: tramite.categoria, to: base + '?tema=' + encodeURIComponent(tramite.categoria) },
      { label: tramite.titulo },
    ]} />
    <div className="tram-detail-grid">
      <article className="tram-detail-main">
        <header className="tram-detail-header">
          <p className="tram-eyebrow">{tramite.categoria}</p>
          <h1>{tramite.titulo}</h1>
          <p className="tram-lead">{tramite.descripcion}</p>
          <p className="tram-modalidad">Modalidad: <strong>{tramite.modalidad}</strong></p>
          <Etiquetas items={tramite.etiquetas} />
          {tramite.web && <a className="tram-btn tram-start-link" href={tramite.web} target="_blank" rel="noopener noreferrer">
            Ir al sitio del trámite <MaterialIcon name="arrow_forward" size={20} />
          </a>}
        </header>
        <div className="tram-detail-mobile-tools">
          <AccionesFicha />
          <IndiceFicha secciones={secciones} />
        </div>
        {tramite.destinatarios.length > 0 && <section id="destinatarios" className="tram-detail-section">
          <h2>¿Quién puede solicitarlo?</h2>
          <div className="tram-audiences">{tramite.destinatarios.map((destinatario) =>
            <span className="tram-audience-tag" key={destinatario}>
              <MaterialIcon name={destinatario === 'Profesionales' ? 'work_outline' : 'groups'} size={18}/>{destinatario}
            </span>
          )}</div>
        </section>}
        <DocumentacionFicha tramite={tramite}/>
        <ProcedimientoFicha tramite={tramite}/>
        <SedeFicha tramite={tramite}/>
        <OtrosTramitesFicha items={otrosTramites}/>
        <div className="tram-detail-mobile-help"><AyudaFicha/></div>
      </article>
      <aside className="tram-detail-aside">
        <AccionesFicha />
        <IndiceFicha secciones={secciones} />
        <AyudaFicha/>
      </aside>
    </div>
  </PageContainer>;
}
