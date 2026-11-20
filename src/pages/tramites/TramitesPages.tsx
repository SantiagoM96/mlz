import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { PageContainer } from '../../components/layout/PageContainer';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { destinatarios, normalizarBusqueda, temas, tramites, type Tramite } from '../../data/tramites';
import './tramites.css';

const base = '/tramites';
const ficha = (id: string) => base + '/' + id;
const resumen = 'Contenido del relevamiento municipal 2026. Los requisitos, horarios, montos y plazos están sujetos a validación del área responsable.';

function AvisoValidacion() {
  return <div className="tram-aviso" role="note"><MaterialIcon name="info" size={22} /><span>{resumen}</span></div>;
}

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
  const [masFiltros, setMasFiltros] = useState(false);
  const busqueda = params.get('q') ?? '';
  const diferida = useDeferredValue(busqueda);
  const tema = params.get('tema') ?? '';
  const destinatario = params.get('destinatario') ?? '';
  const modalidad = params.get('modalidad') ?? '';
  const orden = params.get('orden') === 'az' ? 'az' : 'tema';

  const filtrados = useMemo(() => {
    const q = normalizarBusqueda(diferida);
    const rows = tramites.filter((t) =>
      (!q || normalizarBusqueda([t.titulo, t.descripcion, t.sinonimos, ...t.etiquetas].join(' ')).includes(q)) &&
      (!tema || t.categoria === tema) &&
      (!destinatario || t.destinatarios.includes(destinatario)) &&
      (!modalidad || t.modalidad.toLowerCase().includes(modalidad.toLowerCase()))
    );
    return orden === 'az'
      ? [...rows].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
      : rows;
  }, [diferida, tema, destinatario, modalidad, orden]);

  const grupos = useMemo(() => orden === 'az'
    ? [{ nombre: '', items: filtrados }]
    : temas.map((nombre) => ({ nombre, items: filtrados.filter((tramite) => tramite.categoria === nombre) })).filter((grupo) => grupo.items.length > 0), [filtrados, orden]);

  const hayFiltros = !!(busqueda || tema || destinatario || modalidad);
  return (
    <PageContainer className="tram-container">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites' }]} />
      <h1 className="tram-title">Catálogo de trámites</h1>
      <div className="tram-filters" role="search" aria-label="Filtrar trámites">
        <label className="tram-search"><span className="sr-only">Buscar trámite</span><input aria-label="Buscar trámite" type="search" placeholder="Buscá un trámite: licencia, poda..." value={busqueda} onChange={(e) => elegirValor(setParams, 'q', e.target.value)} /><MaterialIcon name="search" size={24} /></label>
        <label className="tram-select"><span className="sr-only">¿Para quién es?</span><select aria-label="¿Para quién es?" value={destinatario} onChange={(e) => elegirValor(setParams, 'destinatario', e.target.value)}><option value="">¿Para quién es?</option>{destinatarios.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
        <label className="tram-select"><span className="sr-only">Tema</span><select aria-label="Tema" value={tema} onChange={(e) => elegirValor(setParams, 'tema', e.target.value)}><option value="">Tema</option>{temas.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
        <button type="button" aria-expanded={masFiltros} aria-controls="tram-extra" className="tram-filter-more" onClick={() => setMasFiltros((v) => !v)}>Más filtros <MaterialIcon name="tune" size={24} /></button>
      </div>
      {masFiltros && <div className="tram-extra" id="tram-extra"><label>Modalidad <select aria-label="Modalidad" value={modalidad} onChange={(e) => elegirValor(setParams, 'modalidad', e.target.value)}><option value="">Todas</option><option value="Online">Online</option><option value="Presencial">Presencial</option></select></label></div>}
      <div className="tram-results"><strong aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'trámite' : 'trámites'}</strong>
        <div className="tram-sort"><span>Ordenar</span><div className="tram-sort-buttons" role="group" aria-label="Ordenar trámites"><button type="button" className={orden === 'tema' ? 'active' : ''} aria-pressed={orden === 'tema'} onClick={() => elegirValor(setParams, 'orden', '')}>Por tema</button><button type="button" className={orden === 'az' ? 'active' : ''} aria-pressed={orden === 'az'} onClick={() => elegirValor(setParams, 'orden', 'az')}>A–Z</button></div></div>
      </div>
      {hayFiltros && <div className="tram-active-filters"><span>Filtros aplicados</span><button type="button" onClick={() => setParams(new URLSearchParams(orden === 'az' ? { orden: 'az' } : {}))}>Limpiar filtros</button></div>}
      {grupos.length ? grupos.map((grupo) => <section className="tram-group" key={grupo.nombre || 'az'} aria-label={grupo.nombre || 'Trámites ordenados alfabéticamente'}>
        {!!grupo.nombre && <div className="tram-group-heading"><h2>{grupo.nombre} <small>({grupo.items.length})</small></h2>{!tema && <button type="button" onClick={() => { elegirValor(setParams, 'tema', grupo.nombre); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ver el tema <MaterialIcon name="chevron_right" size={24} /></button>}</div>}
        <div>{grupo.items.map((tramite) => <FilaTramite key={tramite.id} tramite={tramite} />)}</div>
      </section>) : <div className="tram-empty"><h2>No encontramos trámites con esos filtros</h2><p>Probá con otras palabras o quitá alguno de los filtros.</p><button type="button" className="tram-btn" onClick={() => setParams({})}>Ver todos los trámites</button></div>}
      <AvisoValidacion />
    </PageContainer>
  );
}


function SeccionFicha({ id, titulo, contenido }: { id: string; titulo: string; contenido: string }) {
  if (!contenido.trim()) return null;
  return <section className="tram-detail-section" id={id}>
    <h2>{titulo}</h2>
    <p className="tram-longtext">{contenido}</p>
  </section>;
}

function AccionesFicha() {
  const [copiado, setCopiado] = useState(false);
  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      // Cancelar la hoja de compartir no debe alterar la navegación.
    }
  }
  return <div className="tram-detail-actions">
    <button type="button" onClick={() => { void compartir(); }}>
      <MaterialIcon name="share" size={24} /> {copiado ? 'Enlace copiado' : 'Compartir'}
    </button>
    <button type="button" onClick={() => window.print()}>
      <MaterialIcon name="print" size={24} /> Imprimir
    </button>
  </div>;
}

function IndiceFicha({ secciones }: { secciones: { id: string; titulo: string }[] }) {
  if (!secciones.length) return null;
  return <nav aria-label="Índice de la ficha" className="tram-index">
    <h2>Índice</h2>
    <ul>{secciones.map((seccion) => <li key={seccion.id}>
      <a href={'#' + seccion.id}><MaterialIcon name="bookmark" size={24} /> {seccion.titulo}</a>
    </li>)}</ul>
  </nav>;
}

function DocumentacionFicha({ texto }: { texto: string }) {
  if (!texto.trim()) return null;
  // Solo dividir cuando el relevamiento trae delimitadores explícitos de lista.
  // No inferir documentos a partir de barras o comas que pueden ser parte del nombre.
  const items = texto.split(/\r?\n|;\s*|(?:^|\s)[•]\s*/).map((item) => item.trim()).filter(Boolean);
  return <section className="tram-detail-section" id="documentacion">
    <h2>Documentación</h2>
    {items.length > 1
      ? <ul className="tram-documents">{items.map((item, index) => <li key={index}>
          <span className="tram-document-icon"><MaterialIcon name="description" size={24} /></span>
          <span>{item}</span>
        </li>)}</ul>
      : <p className="tram-longtext">{texto}</p>}
  </section>;
}

function SedeFicha({ tramite }: { tramite: Tramite }) {
  if (!tramite.direccion.trim() && !tramite.horarios.trim() && !tramite.turno.trim()) return null;
  return <section className="tram-detail-section" id="donde-cuando">
    <h2>Dónde y cuándo</h2>
    <div className="tram-location">
      {tramite.direccion.trim() && <div className="tram-location-item">
        <MaterialIcon name="location_on" size={24} /><p>{tramite.direccion}</p>
      </div>}
      {tramite.horarios.trim() && <div className="tram-location-item">
        <MaterialIcon name="schedule" size={24} /><p>{tramite.horarios}</p>
      </div>}
      {tramite.turno.trim() && <div className="tram-location-item">
        <MaterialIcon name="event" size={24} /><p>Turno: {tramite.turno}</p>
      </div>}
    </div>
  </section>;
}

function RelacionadosFicha({ items }: { items: Tramite[] }) {
  if (!items.length) return null;
  return <section className="tram-related" id="relacionados">
    <h2>Otros trámites del tema</h2>
    <div className="tram-related-grid">{items.map((item) => <Link key={item.id} to={ficha(item.id)} className="tram-related-card">
      <span className="tram-document-icon"><MaterialIcon name="receipt_long" size={24} /></span>
      <strong>{item.titulo}</strong>
      <span>{item.descripcion}</span>
    </Link>)}</div>
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

  const relacionados = tramites.filter((item) => item.categoria === tramite.categoria && item.id !== tramite.id).slice(0, 3);
  const pasos = tramite.pasos || tramite.comoIniciar;
  const secciones = [
    { id: 'destinatarios', titulo: '¿Quién puede solicitarlo?', visible: tramite.destinatarios.length > 0 || Boolean(tramite.requisitos.trim()) },
    { id: 'documentacion', titulo: 'Documentación', visible: Boolean(tramite.documentacion.trim()) },
    { id: 'procedimiento', titulo: '¿Cómo se realiza?', visible: Boolean(pasos.trim()) },
    { id: 'donde-cuando', titulo: 'Dónde y cuándo', visible: Boolean(tramite.direccion.trim() || tramite.horarios.trim() || tramite.turno.trim()) },
    { id: 'costos', titulo: 'Costos y plazos', visible: Boolean(tramite.costo.trim() || tramite.monto.trim() || tramite.pago.trim() || tramite.plazo.trim()) },
    { id: 'normativa', titulo: 'Normativa', visible: Boolean(tramite.normativa.trim()) },
    { id: 'relacionados', titulo: 'Otros trámites del tema', visible: relacionados.length > 0 },
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
        {(tramite.destinatarios.length > 0 || tramite.requisitos.trim()) && <section id="destinatarios" className="tram-detail-section">
          <h2>Quién puede hacerlo</h2>
          {tramite.destinatarios.length > 0 && <p>{tramite.destinatarios.join(', ')}</p>}
          {tramite.requisitos.trim() && <p className="tram-longtext">{tramite.requisitos}</p>}
        </section>}
        <DocumentacionFicha texto={tramite.documentacion} />
        <SeccionFicha id="procedimiento" titulo="Cómo se hace" contenido={pasos} />
        <SedeFicha tramite={tramite} />
        {(tramite.costo || tramite.monto || tramite.pago || tramite.plazo) && <section className="tram-detail-section" id="costos">
          <h2>Costos y plazos</h2>
          {tramite.costo && <p><strong>Costo: </strong>{tramite.costo}</p>}
          {tramite.monto && <p><strong>Monto: </strong>{tramite.monto}</p>}
          {tramite.pago && <p><strong>Forma de pago: </strong>{tramite.pago}</p>}
          {tramite.plazo && <p><strong>Plazo estimado: </strong>{tramite.plazo}</p>}
        </section>}
        <SeccionFicha id="normativa" titulo="Normativa" contenido={tramite.normativa} />
        <RelacionadosFicha items={relacionados} />
      </article>
      <aside className="tram-detail-aside">
        <AccionesFicha />
        <IndiceFicha secciones={secciones} />
      </aside>
    </div>
  </PageContainer>;
}
