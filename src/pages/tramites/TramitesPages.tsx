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

function DetalleCampo({ titulo, valor }: { titulo: string; valor: string }) {
  return valor ? <div className="tram-detail-field"><h3>{titulo}</h3><p>{valor}</p></div> : null;
}
function TextoSeccion({ titulo, texto, id }: { titulo: string; texto: string; id?: string }) {
  return texto ? <section className="tram-detail-section" id={id}><h2>{titulo}</h2><p className="tram-longtext">{texto}</p></section> : null;
}
function AccionesFicha({ tramite }: { tramite: Tramite }) {
  return <div className="tram-detail-actions">
    {tramite.web && <a className="tram-btn" href={tramite.web} target="_blank" rel="noopener noreferrer">Ir al sitio del trámite <MaterialIcon name="arrow_forward" size={20} /></a>}
    <button type="button" className="tram-action-secondary" onClick={() => window.print()}>Imprimir ficha</button>
  </div>;
}

export function TramiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tramite = tramites.find((t) => t.id.toLowerCase() === (id || '').toLowerCase());
  if (!tramite) return <PageContainer className="tram-container"><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites', to: base }, { label: 'No encontrado' }]} /><h1 className="tram-title">No encontramos ese trámite</h1><Link to={base} className="tram-btn">Volver al catálogo</Link></PageContainer>;
  const relacionados = tramites.filter((t) => t.categoria === tramite.categoria && t.id !== tramite.id).slice(0, 3);
  return <PageContainer className="tram-container tram-detail">
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Trámites', to: base }, { label: tramite.categoria, to: base + '?tema=' + encodeURIComponent(tramite.categoria) }, { label: tramite.titulo }]} mobileParentOnly />
    <header className="tram-detail-header"><p className="tram-eyebrow">Guía de trámites</p><h1>{tramite.titulo}</h1><p className="tram-lead">{tramite.descripcion}</p><div className="tram-detail-meta"><span>Modalidad: <strong>{tramite.modalidad}</strong></span>{tramite.destinatarios.length > 0 && <span>Destinatarios: <strong>{tramite.destinatarios.join(', ')}</strong></span>}</div><Etiquetas items={tramite.etiquetas} /><AccionesFicha tramite={tramite} /></header>
    <AvisoValidacion />
    <div className="tram-detail-grid"><article>
      <TextoSeccion titulo="¿De qué se trata?" texto={tramite.descripcion} />
      <TextoSeccion titulo="¿Qué necesitás?" texto={tramite.requisitos} />
      <TextoSeccion titulo="Documentación necesaria" texto={tramite.documentacion} />
      <TextoSeccion titulo="Cómo se hace" texto={tramite.pasos || tramite.comoIniciar} />
      <section className="tram-detail-section"><h2>Dónde y cuándo</h2>
        <div className="tram-location">
          <DetalleCampo titulo="Lugar de atención" valor={tramite.direccion} />
          <DetalleCampo titulo="Días y horarios" valor={tramite.horarios} />
          <DetalleCampo titulo="¿Requiere turno?" valor={tramite.turno} />
          {!tramite.direccion && !tramite.horarios && <p>Consultá con el área responsable los canales y horarios vigentes.</p>}
        </div>
      </section>
      {(tramite.costo || tramite.monto || tramite.pago || tramite.plazo) && <section className="tram-detail-section"><h2>Costos y plazos</h2><DetalleCampo titulo="¿Tiene costo?" valor={tramite.costo} /><DetalleCampo titulo="Monto informado" valor={tramite.monto} /><DetalleCampo titulo="Forma de pago" valor={tramite.pago} /><DetalleCampo titulo="Plazo estimado" valor={tramite.plazo} /></section>}
      <TextoSeccion titulo="Normativa" texto={tramite.normativa} />
    </article>
    <aside className="tram-detail-aside">
      <div className="tram-help"><span className="tram-help-icon"><MaterialIcon name="info" size={28} /></span><h2>¿Necesitás ayuda?</h2><p>Consultá los canales de atención del Municipio antes de iniciar el trámite.</p><Link to="/" className="tram-help-link">Ir al sitio municipal <MaterialIcon name="arrow_forward" size={20} /></Link></div>
      {relacionados.length > 0 && <section className="tram-related"><h2>Otros trámites del tema</h2>{relacionados.map((t) => <Link key={t.id} to={ficha(t.id)} className="tram-related-card"><MaterialIcon name="confirmation_number" size={24} /><strong>{t.titulo}</strong><span>{t.descripcion}</span></Link>)}</section>}
    </aside></div>
  </PageContainer>;
}
