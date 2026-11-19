(function guiaApp(){
  'use strict';
  const source=window.GUIA_TRAMITES_DATA;
  const mount=document.getElementById('app');
  if(!mount)return;
  if(!source){mount.textContent='No se pudo cargar el catálogo local.';return;}
  const entries=source.items;
  const categories=source.categories;
  const byId=Object.fromEntries(entries.map(t=>[t.id,t]));
  const byCategory=Object.fromEntries(categories.map(c=>[c.slug,c]));
  const params=new URLSearchParams(window.location.search);
  const page=document.body.dataset.page||'home';
  const selectedCategory=byCategory[params.get('c')]||categories[0];
  const selectedItem=byId[params.get('t')];
  const state={search:params.get('q')||'',onlineOnly:false,method:'all',cost:'all',audiences:new Set(),sort:'theme',quick:'all',filtersOpen:false};
  const icon=(name)=>`<span class="mi" aria-hidden="true">${name}</span>`;
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const detailUrl=(t)=>`d-ficha.html?t=${encodeURIComponent(t.id)}`;
  const categoryUrl=(c)=>`d-categoria.html?c=${encodeURIComponent(c.slug)}`;
  const normal=(str)=>String(str||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isOnline=t=>normal(t.mode).includes('linea');
  const isFree=t=>/^(gratis|sin arancel)/i.test(t.cost);
  const isPaid=t=>/(\$|con costo|desde \$)/i.test(t.cost);
  const needsAppointment=t=>t.id==='licencia-de-conducir'||/turnos?|licencia/.test(t.id);
  const audiences=t=>{
    const c=t.category,text=normal(t.title);
    const out=new Set(['vecinos']);
    if(['comercio-e-industria','proveedores-y-organismos'].includes(c)||/comercio|proveedor|empresa|industria/.test(text))out.add('comercios');
    if(['instituciones','educacion-cultura-y-cursos'].includes(c)||/instituci|asociacion|club/.test(text))out.add('instituciones');
    if(['ambiente-y-espacio-publico','educacion-cultura-y-cursos'].includes(c))out.add('organizaciones');
    if(['obras-y-catastro','tasas-y-pagos'].includes(c)||/escribano|profesional|mensura|plano/.test(text))out.add('profesionales');
    return out;
  };
  const topicIcon=(slug)=>({
    'tasas-y-pagos':'account_balance_wallet','vehiculos-y-transito':'directions_car','comercio-e-industria':'storefront',
    'obras-y-catastro':'architecture','ambiente-y-espacio-publico':'park','salud':'medical_services','discapacidad':'accessible',
    'asistencia-social-y-genero':'diversity_3','educacion-cultura-y-cursos':'school','vivienda-y-escrituras':'home',
    'documentacion-e-identidad':'badge','cementerio':'local_florist','instituciones':'groups',
    'defensa-del-consumidor':'verified_user','proveedores-y-organismos':'inventory_2'
  }[slug]||'description');
  function header(){
    const catalogPage=page==='catalog'||page==='search'||page==='category'||page==='detail';
    return `<header>
      <div class="topbar"><div class="wrap topbar-inner">
        <a class="brand" href="d-home.html" aria-label="Municipio Lomas de Zamora · Inicio de Guía de Trámites"><img src="../../assets/logo-municipio-blanco.svg" alt="Municipio Lomas de Zamora · Gobierno de la Comunidad"></a>
        <nav class="site-nav" aria-label="Navegación general"><span>Municipio</span><span>Gestión</span><a href="d-catalogo.html" ${catalogPage?'aria-current="page"':''}>Trámites</a><span>Turnos</span></nav>
        <div class="community-mark"><img src="../../assets/logo-comunidad-blanco.svg" alt="Comunidad Lomas"></div>
      </div></div>
      <div class="subbar"><div class="wrap subbar-inner"><a class="section-brand" href="d-home.html">Guía de Trámites Lomas</a>
      <nav class="subnav" aria-label="Navegación de la guía"><a href="d-home.html" ${page==='home'?'aria-current="page"':''}>Inicio</a><a href="d-catalogo.html" ${catalogPage?'aria-current="page"':''}>Trámites</a></nav></div></div>
    </header>`;
  }
  function footer(){
    return `<footer class="site-footer">
    <div class="wrap footer-main">
      <div><img src="../../assets/logo-municipio-blanco.svg" alt="Municipio Lomas de Zamora · Gobierno de la Comunidad">
        <h2>Centro de Atención a la Comunidad</h2><p>Escribinos por WhatsApp<br>Consultas o solicitudes<br><strong>0800-666-6666</strong><br><strong>0800-122-5662</strong></p></div>
      <div><h2>Información municipal</h2><ul><li>Newsletter</li><li>Boletín Oficial</li><li>HCD</li><li>Términos y privacidad</li><li>¡Seguinos en nuestras redes!</li></ul></div>
      <div><h2>Números de emergencia</h2><div class="footer-urgent">
        <span><b>100</b> Bomberos</span><span><b>103</b> Defensa Civil</span><span><b>107</b> Emergencias médicas</span>
        <span><b>911</b> Policía</span><span><b>147</b> Seguridad Lomas</span><span><b>144</b> Violencia de género</span>
      </div></div>
    </div>
    <div class="footer-bottom"><div class="wrap">Municipio de Lomas de Zamora · Guía de Trámites Lomas · Prototipo con datos de ejemplo</div></div>
    </footer>`;
  }
  function breadcrumb(items){
    return `<nav class="breadcrumb" aria-label="Ruta de navegación"><a href="d-home.html">Inicio</a>${items.map((it,i)=>`${icon('chevron_right')}${it.href?`<a href="${esc(it.href)}">${esc(it.name)}</a>`:`<span aria-current="page">${esc(it.name)}</span>`}`).join('')}</nav>`;
  }
  function searchForm(ariaLabel='Buscar trámite'){
    return `<form class="search" data-search-form role="search">
      <label class="search-field">${icon('search')}<input name="q" type="search" aria-label="${esc(ariaLabel)}" placeholder="¿Qué trámite estás buscando?" value="${esc(state.search)}" autocomplete="off"></label>
      <button class="btn" type="submit">Buscar</button>
    </form>`;
  }
  function popularCard(t){
    return `<a class="popular-card" href="${detailUrl(t)}"><div class="card-symbol">${icon(topicIcon(t.category))}</div>
      <h3>${esc(t.title)}</h3><p>${esc(t.description)}</p>
      <span class="more">Ver requisitos ${icon('arrow_forward')}</span></a>`;
  }
  function resultCard(t){
    return `<a class="result-card" href="${detailUrl(t)}">
      <h3>${esc(t.title)}</h3><p>${esc(t.description)}</p>
      <div class="result-meta"><span class="tag ${isFree(t)?'free':isPaid(t)?'cost':''}">${esc(t.cost)}</span><span class="tag">${esc(t.time)}</span><span class="tag ${isOnline(t)?'online':''}">${esc(t.mode)}</span></div>
    </a>`;
  }
  function home(){
    const featured=source.featured.map(id=>byId[id]).filter(Boolean);
    return `<main id="main">
      <section class="hero"><div class="wrap"><p class="eyebrow">Guía de Trámites Lomas</p><h1>¿Qué trámite necesitás hacer?</h1>${searchForm()}</div></section>
      <section class="section wrap"><div class="section-heading"><h2>Los más pedidos</h2><a href="d-catalogo.html">Ver todos los trámites ${icon('arrow_forward')}</a></div><div class="popular-grid">${featured.map(popularCard).join('')}</div></section>
      <section class="section wrap"><div class="section-heading"><h2>Trámites por tema</h2><a href="d-catalogo.html">Ver el catálogo completo ${icon('arrow_forward')}</a></div>
        <div class="topics-grid">${categories.map(c=>`<a class="topic-card" href="${categoryUrl(c)}">
          <span class="topic-icon">${icon(topicIcon(c.slug))}</span><span class="topic-details"><strong>${esc(c.name)}</strong><small>${c.count} ${c.count===1?'trámite':'trámites'}</small></span>${icon('chevron_right')}
        </a>`).join('')}</div></section>
      <section class="section wrap"><div class="help-band"><div><h2>¿Preferís que te ayudemos?</h2><p>En los 14 Centros de Gestión te orientan y lo inician con vos.</p></div>
        <div class="help-actions"><a class="btn secondary" href="https://lomasdezamora.gov.ar/" target="_blank" rel="noopener noreferrer">Sitio del Municipio ${icon('open_in_new')}</a></div>
      </div></section>
    </main>`;
  }
  function matches(t){
    const q=normal(state.search).trim();
    if(q&&!normal([t.title,t.description,byCategory[t.category]?.name].join(' ')).includes(q))return false;
    if(state.onlineOnly&&!isOnline(t))return false;
    if(state.method==='online'&&!isOnline(t))return false;
    if(state.method==='presencial'&&isOnline(t))return false;
    if(state.method==='acompanamiento'&&!normal(t.mode).includes('acompanamiento'))return false;
    if(state.cost==='gratis'&&!isFree(t))return false;
    if(state.cost==='con-costo'&&!isPaid(t))return false;
    for(const a of state.audiences)if(!audiences(t).has(a))return false;
    return true;
  }
  function filterPanel(){
    const option=(value,title,description)=>`<label class="filter-option"><input type="checkbox" data-action="audience" data-value="${value}" ${state.audiences.has(value)?'checked':''}><span>${title}${description?`<small>${description}</small>`:''}</span></label>`;
    const choices=(name,options)=>`<div class="filter-choices">${options.map(([value,label])=>`<button type="button" data-action="${name}" data-value="${value}" class="${state[name==='method'?'method':'cost']===value?'active':''}" aria-pressed="${state[name==='method'?'method':'cost']===value}">${label}</button>`).join('')}</div>`;
    return `${state.filtersOpen?'<button type="button" class="filters-backdrop" data-action="close-filters" aria-label="Cerrar filtros"></button>':''}
    <aside class="filters ${state.filtersOpen?'is-open':''}" id="catalog-filters" aria-label="Filtros de trámites">
    <div class="filters-header"><h2>Filtrar</h2><button type="button" class="clear-link" data-action="clear">Limpiar</button>
    <button type="button" class="btn ghost close-mobile" data-action="close-filters" aria-label="Cerrar filtros">${icon('close')}</button></div>
    <div class="filter-block"><label class="filter-option"><input type="checkbox" data-action="online-only" ${state.onlineOnly?'checked':''}><span>Solo 100 % en línea<small>Sin ir a ninguna oficina</small></span></label></div>
    <div class="filter-block"><h3>¿Para quién es?</h3>
      ${option('vecinos','Vecinos y vecinas')}
      ${option('comercios','Comercios y empresas')}
      ${option('instituciones','Instituciones')}
      ${option('organizaciones','Organizaciones sociales')}
      ${option('profesionales','Profesionales')}
    </div>
    <div class="filter-block"><h3>Cómo se hace</h3>${choices('method',[['all','Todas'],['online','En línea'],['presencial','Presencial'],['acompanamiento','Con acompañamiento']])}</div>
    <div class="filter-block"><h3>Costo</h3>${choices('cost',[['all','Todos'],['gratis','Gratis'],['con-costo','Con costo']])}</div>
    </aside>`;
  }
  function sortItems(list){
    const result=[...list];
    if(state.sort==='az')result.sort((a,b)=>a.title.localeCompare(b.title,'es'));
    if(state.sort==='popular')result.sort((a,b)=>(a.popularRank||999)-(b.popularRank||999)||a.title.localeCompare(b.title,'es'));
    return result;
  }
  function resultContent(list){
    if(!list.length)return `<div class="empty"><h2>No encontramos trámites con esos filtros</h2><p>Probá con otros términos o limpiá los filtros.</p><button class="btn secondary" data-action="clear" type="button">Limpiar filtros</button></div>`;
    if(state.sort!=='theme')return `<div class="result-grid">${sortItems(list).map(resultCard).join('')}</div>`;
    return categories.map(c=>{
      const sub=list.filter(t=>t.category===c.slug);
      if(!sub.length)return '';
      return `<section class="topic-results"><div class="topic-results-head"><h2>${esc(c.name)} <span class="quantity">${sub.length}</span></h2>
        <a class="inline-link" href="${categoryUrl(c)}">Ver el tema ${icon('arrow_forward')}</a></div><div class="result-grid">${sub.map(resultCard).join('')}</div></section>`;
    }).join('');
  }
  function catalog(){
    const filtered=entries.filter(matches);
    const count=filtered.length;
    return `<main id="main"><div class="wrap">${breadcrumb([{name:'Trámites'}])}
      <div class="page-intro"><h1>Catálogo de trámites</h1></div>
      <div class="catalog-layout">${filterPanel()}<div class="catalog-main">
      <div class="catalog-toolbar"><button type="button" class="btn secondary mobile-filter-button" data-action="open-filters">${icon('tune')} Filtrar</button>${searchForm('Buscar en el catálogo')}</div>
      <div class="result-toolbar"><span class="count" role="status">${count} ${count===1?'trámite':'trámites'}</span>
      <div class="sorts"><span>Ordenar:</span>${[['theme','Por tema'],['az','A–Z'],['popular','Más pedidos']].map(([id,label])=>`<button type="button" data-action="sort" data-value="${id}" class="${state.sort===id?'active':''}" aria-pressed="${state.sort===id}">${label}</button>`).join('')}</div>
      </div>${resultContent(filtered)}</div></div></div></main>`;
  }
  function category(){
    const cat=selectedCategory;
    const all=entries.filter(t=>t.category===cat.slug);
    const q=state.quick;
    const filtered=all.filter(t=>q==='all'||(q==='online'&&isOnline(t))||(q==='free'&&isFree(t))||(q==='appointment'&&needsAppointment(t)));
    const quicks=[['all','Todos',all.length],['online','100 % en línea',all.filter(isOnline).length],['free','Gratis',all.filter(isFree).length],['appointment','Con turno',all.filter(needsAppointment).length]];
    return `<main id="main"><div class="wrap">${breadcrumb([{name:'Trámites',href:'d-catalogo.html'},{name:cat.name}])}</div>
    <section class="category-intro"><div class="wrap"><h1>${esc(cat.name)}</h1><p>${esc(cat.description)}</p></div></section>
    <div class="wrap category-results"><div class="quick-filters">${quicks.map(([id,name,n])=>`<button type="button" data-action="quick" data-value="${id}" class="${q===id?'active':''}" aria-pressed="${q===id}">${name} (${n})</button>`).join('')}</div>
    ${filtered.length?`<div class="result-grid">${filtered.map(resultCard).join('')}</div>`:'<div class="empty"><p>No hay trámites en esta selección.</p><button type="button" class="btn secondary" data-action="quick" data-value="all">Ver todos</button></div>'}
    <div class="hint"><div><h2>¿No encontrás tu trámite?</h2><p>Buscalo por nombre o escribinos: te decimos cuál es y cómo se hace.</p></div><a class="btn" href="d-buscar.html">Buscar un trámite ${icon('search')}</a></div></div></main>`;
  }
  function detail(){
    if(!selectedItem)return `<main id="main" class="wrap main-section">${breadcrumb([{name:'Trámites',href:'d-catalogo.html'},{name:'Trámite no encontrado'}])}<h1>No encontramos ese trámite</h1><p>Volvé al catálogo para buscar otra gestión.</p><a class="btn" href="d-catalogo.html">Ver catálogo</a></main>`;
    const t=selectedItem,cat=byCategory[t.category],info=source.details[t.id];
    const related=entries.filter(x=>x.category===t.category&&x.id!==t.id).slice(0,3);
    const sections=[['quien','Quién puede hacerlo'],['documentacion','Documentación'],['costo','Costo y formas de pago'],['tiempos','Tiempos'],['pasos','Cómo se hace'],['donde','Dónde y cuándo'],['faq','Preguntas frecuentes'],['relacionados','Otros trámites del tema'],['normativa','Normativa']];
    const notice='<div class="notice">Esta información detallada todavía no se pudo verificar en la sesión de referencia. Es una estructura de prototipo, no una indicación oficial para iniciar el trámite.</div>';
    return `<main id="main" class="wrap main-section">${breadcrumb([{name:'Trámites',href:'d-catalogo.html'},{name:cat.name,href:categoryUrl(cat)},{name:t.title}])}
      <div class="detail-head">
        <div class="title-actions"><div><a class="eyebrow" href="${categoryUrl(cat)}">${esc(cat.name)}</a><p style="font-size:12px;color:var(--muted);margin:7px 0">Ficha ${info?`actualizada el ${esc(info.updated)}`:'de referencia'}</p></div>
        <div class="small-actions actions"><button type="button" class="btn secondary" data-action="share">${icon('share')} Compartir</button><button type="button" class="btn secondary" data-action="print">${icon('print')} Imprimir</button></div></div>
        <h1>${esc(info?.displayTitle||t.title)}</h1><p class="summary">${esc(t.description)}</p>
        ${info?`<p class="agency">Lo resuelve: ${esc(info.agency)}</p>`:''}
        <div class="result-meta"><span class="tag ${isFree(t)?'free':isPaid(t)?'cost':''}">${esc(t.cost)}</span><span class="tag">${esc(t.time)}</span><span class="tag ${isOnline(t)?'online':''}">${esc(t.mode)}</span>${info?.appointment?'<span class="tag">Con turno</span>':''}</div>
      </div>
      <div class="detail-columns"><div class="detail-body">
        <section id="quien"><h2>Quién puede hacerlo</h2><h3>Requisitos</h3>${info?`<ul>${info.requirements.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${esc(info.holder)}</p>`:notice}</section>
        <section id="documentacion"><h2>Documentación</h2>${info?`<p>Tenés que presentar ${info.documents.length} documentos</p>${info.documents.map(x=>`<div class="doc-item">${icon('description')}<div><strong>${esc(x.title)}</strong><p>${esc(x.description)}</p></div></div>`).join('')}`:notice}</section>
        <section id="costo"><h2>Costo y formas de pago</h2><div class="result-meta"><span class="tag ${isFree(t)?'free':'cost'}">${esc(t.cost)}</span></div>${info?`<p>Te mostramos el monto exacto antes de pagar.</p><h3>Cómo pagás</h3><ul>${info.payments.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>Exenciones: ${esc(info.exemptions)}</p>`:`<p>Importe informado en el catálogo de referencia. Consultá el valor actualizado con el área responsable.</p>`}</section>
        <section id="tiempos"><h2>Tiempos</h2><p><strong>${esc(t.time)}</strong></p></section>
        <section id="pasos"><h2>Cómo se hace</h2>${info?`<ol class="steps">${info.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:notice}</section>
        <section id="donde"><h2>Dónde y cuándo</h2>${info?`<p><strong>${esc(info.location)}</strong></p><p>${esc(info.hours)}</p>`:notice}</section>
        <section id="faq" class="faq"><h2>Preguntas frecuentes</h2>
        <details><summary>¿Cuánto sale?</summary><p>${esc(t.cost)}.${info?` Hay exenciones: ${esc(info.exemptions)}.`:''}</p></details>
        <details><summary>¿Cuánto tarda?</summary><p>${esc(t.time)}.</p></details>
        ${info?`<details><summary>¿Lo puede hacer otra persona por mí?</summary><p>No, lo tiene que hacer la persona titular.</p></details><details><summary>¿Necesito turno?</summary><p>Sí. Lo sacás desde esta página de referencia.</p></details>`:''}
        <p>¿Otra duda? Centro de Atención a la Comunidad: <strong>0800-666-6666</strong>.</p></section>
        <section id="relacionados"><h2>Otros trámites del tema</h2><div class="related-list">${related.map(x=>`<a href="${detailUrl(x)}"><span>${esc(x.title)}</span><small>${esc(x.cost)} · ${esc(x.time)}</small></a>`).join('')}</div></section>
        <section id="normativa"><h2>Normativa</h2>${info?`<p>${esc(info.norm)}</p>`:notice}</section>
      </div><aside class="detail-aside"><h2>En esta ficha</h2><nav aria-label="Secciones del trámite">${sections.map(([id,name])=>`<a href="#${id}">${name}</a>`).join('')}</nav>
      <a class="btn" href="#donde">Ver dónde se hace ${icon('place')}</a><p style="font-size:12px;color:var(--muted);margin-top:14px">Este es un prototipo de consulta, no un sistema de gestión de trámites.</p>
      </aside></div></main>`;
  }

function detailExcel(){
 const item=selectedItem;
 if(!item)return `<main id="main" class="wrap main-section">${breadcrumb([{name:'Trámites',href:'d-catalogo.html'},{name:'Trámite no encontrado'}])}<h1>No encontramos ese trámite</h1><a class="btn" href="d-catalogo.html">Volver al catálogo</a></main>`;
 const cat=byCategory[item.category];
 const record=window.GUIA_TRAMITES_FICHAS?.[item.id];
 const forms=record?.forms||[];
 const info=forms[0];
 const related=entries.filter(x=>x.category===item.category&&x.id!==item.id).slice(0,3);
 const safePortal=p=>/^https?:\/\//i.test(p||'')?`<a href="${esc(p)}" target="_blank" rel="noopener noreferrer">Acceder a la gestión ${icon('open_in_new')}</a>`:'';
 const paragraph=(value,missing='No especificado en la planilla de relevamiento')=>value?`<p>${esc(value)}</p>`:`<p class="detail-none">${esc(missing)}</p>`;
 const infoRow=(name,value)=>value?`<tr><th scope="row">${esc(name)}</th><td>${esc(value)}</td></tr>`:'';
 const table=rows=>`<table class="meta-table"><tbody>${rows}</tbody></table>`;
 const part=(form,index,full=false)=>{
  const tag=full?'h2':'h3';
  return `<div class="detail-variant">
    <${tag}>${full?'Información del trámite':esc(form.sourceName)}</${tag}>
    ${form.summary&&form.summary.toLowerCase()!==item.description.toLowerCase()?`<p>${esc(form.summary)}</p>`:''}
    <h3 class="mini-heading">Quién puede hacerlo y requisitos</h3>
    ${table(infoRow('Destinatarios',form.audience)+infoRow('Condiciones para acceder',form.eligibility)+infoRow('Requisitos',form.requirements))}
    <h3 class="mini-heading">Documentación necesaria</h3>
    ${paragraph(form.documentation)}
    ${form.documentFormat?`<p><strong>Presentación:</strong> ${esc(form.documentFormat)}</p>`:''}
    <h3 class="mini-heading">Costo y pago</h3>
    ${table(infoRow('Costo (relevamiento)',form.costDetail)+infoRow('Forma de pago',form.payment)+infoRow('Exenciones',form.exemptions))}
    <h3 class="mini-heading">Cómo se hace</h3>
    ${paragraph(form.process,'La planilla no describe los pasos para este trámite')}
    <h3 class="mini-heading">Dónde y cuándo</h3>
    ${table(infoRow('Modalidad',form.modality)+infoRow('Lugar de atención',form.place)+infoRow('Días y horarios',form.hours)+infoRow('Tiempo estimado de resolución',form.leadTime)+infoRow('Canales de atención',form.channels))}
    ${form.portal?`<p>${safePortal(form.portal)}</p>`:''}
    <h3 class="mini-heading">Normativa</h3>
    ${paragraph(form.regulations,'No se informó normativa específica')}
    ${form.regulationLink?`<p>${safePortal(form.regulationLink).replace('Acceder a la gestión','Ver normativa')}</p>`:''}
    <p class="source-note">Fuente: relevamiento municipal de trámites · ${esc(form.surveyDate||'2026')}${index>0?' · Variante de la gestión':''}</p>
  </div>`;
 };
 const sections=[['requisitos','Quién puede hacerlo'],['documentacion','Documentación'],['costo','Costo y formas de pago'],['pasos','Cómo se hace'],['atencion','Dónde y cuándo'],['normativa','Normativa'],...(forms.length>1?[['variantes','Variantes del trámite']]:[]),['relacionados','Otros trámites del tema']];
 let body='';
 if(info){
  body=`
  <section id="requisitos"><h2>Quién puede hacerlo</h2>${table(infoRow('Destinatarios',info.audience)+infoRow('Condiciones',info.eligibility)+infoRow('Requisitos',info.requirements))}</section>
  <section id="documentacion"><h2>Documentación</h2>${paragraph(info.documentation)}${info.documentFormat?`<p><strong>Formato de presentación:</strong> ${esc(info.documentFormat)}</p>`:''}</section>
  <section id="costo"><h2>Costo y formas de pago</h2><div class="result-meta"><span class="tag ${isFree(item)?'free':'cost'}">${esc(item.cost)}</span></div>${table(infoRow('Detalle según Excel',info.costDetail)+infoRow('Medios de pago',info.payment)+infoRow('Exenciones',info.exemptions))}</section>
  <section id="pasos"><h2>Cómo se hace</h2>${paragraph(info.process,'No se detallan pasos en la planilla de relevamiento')}</section>
  <section id="atencion"><h2>Dónde y cuándo</h2>${table(infoRow('Modalidad',info.modality)+infoRow('Lugar de atención',info.place)+infoRow('Días y horarios',info.hours)+infoRow('Plazo estimado según Excel',info.leadTime)+infoRow('Canales de atención',info.channels))}${info.portal?`<p>${safePortal(info.portal)}</p>`:''}</section>
  <section id="normativa"><h2>Normativa</h2>${paragraph(info.regulations,'No se informó normativa específica')}${info.regulationLink?`<p>${safePortal(info.regulationLink).replace('Acceder a la gestión','Ver normativa')}</p>`:''}</section>
  ${forms.length>1?`<section id="variantes"><h2>Variantes del trámite</h2><p>El relevamiento incluye ${forms.length} gestiones relacionadas. Revisá el caso que corresponda: pueden cambiar los requisitos, los costos o el procedimiento.</p>${forms.slice(1).map((form,index)=>part(form,index+1)).join('')}</section>`:''}
  `;
 }else{
  body='<section><h2>Información del trámite</h2><p>La ficha de origen no está disponible en esta compilación. Consultá el área municipal antes de realizar la gestión.</p></section>';
 }
 body+=`<section id="relacionados"><h2>Otros trámites del tema</h2><div class="related-list">${related.map(x=>`<a href="${detailUrl(x)}"><span>${esc(x.title)}</span><small>${esc(x.cost)} · ${esc(x.time)}</small></a>`).join('')}</div></section>`;
 return `<main class="wrap main-section" id="main">
  ${breadcrumb([{name:'Trámites',href:'d-catalogo.html'},{name:cat.name,href:categoryUrl(cat)},{name:item.title}])}
  <div class="detail-head">
   <div class="title-actions"><div><a class="eyebrow" href="${categoryUrl(cat)}">${esc(cat.name)}</a><p class="detail-source">Información obtenida de la planilla de relevamiento municipal de 2026</p></div>
    <div class="small-actions actions"><button type="button" class="btn secondary" data-action="share">${icon('share')} Compartir</button><button type="button" class="btn secondary" data-action="print">${icon('print')} Imprimir</button></div>
   </div>
   <h1>${esc(item.title)}</h1><p class="summary">${esc(item.description)}</p>
   <div class="result-meta"><span class="tag ${isFree(item)?'free':'cost'}">${esc(item.cost)}</span><span class="tag">${esc(item.time)}</span><span class="tag ${isOnline(item)?'online':''}">${esc(item.mode)}</span></div>
  </div>
  <div class="detail-columns">
    <div class="detail-body">${body}</div>
    <aside class="detail-aside"><h2>En esta ficha</h2><nav aria-label="Contenido de la ficha">${sections.map(([id,name])=>`<a href="#${id}">${esc(name)}</a>`).join('')}</nav>
       <div class="detail-highlight"><p>Este es un prototipo de trabajo con datos relevados. Confirmá requisitos, plazos y montos antes de hacer una gestión real.</p></div>
       <a class="btn" href="d-catalogo.html">Volver al catálogo ${icon('arrow_back')}</a>
    </aside>
  </div>
 </main>`;
}
  function render(){
    let main=page==='home'?home():page==='category'?category():page==='detail'?detailExcel():catalog();
    mount.innerHTML=header()+main+footer();
    document.title=(page==='home'?'Inicio':page==='category'?selectedCategory.name:page==='detail'?(selectedItem?.title||'Trámite'): 'Catálogo de trámites')+' · Guía de Trámites Lomas';
  }
  document.addEventListener('submit',e=>{
    const form=e.target.closest('[data-search-form]');if(!form)return;
    e.preventDefault();
    const value=String(new FormData(form).get('q')||'').trim();
    if(page==='catalog'||page==='search'){
      state.search=value;const url=new URL(location.href);value?url.searchParams.set('q',value):url.searchParams.delete('q');history.replaceState(null,'',url);render();
    }else{location.href=`d-catalogo.html${value?'?q='+encodeURIComponent(value):''}`;}
  });
  document.addEventListener('click',async e=>{
    const control=e.target.closest('[data-action]');if(!control)return;
    const action=control.dataset.action, value=control.dataset.value;
    if(action==='sort'){state.sort=value;render();}
    if(action==='method'){state.method=value;render();}
    if(action==='cost'){state.cost=value;render();}
    if(action==='quick'){state.quick=value;render();}
    if(action==='online-only'){state.onlineOnly=control.checked;render();}
    if(action==='audience'){control.checked?state.audiences.add(value):state.audiences.delete(value);render();}
    if(action==='clear'){state.onlineOnly=false;state.method='all';state.cost='all';state.search='';state.audiences.clear();state.filtersOpen=false;const url=new URL(location.href);url.searchParams.delete('q');history.replaceState(null,'',url);render();}
    if(action==='open-filters'){state.filtersOpen=true;render();document.querySelector('.close-mobile')?.focus();}
    if(action==='close-filters'){state.filtersOpen=false;render();document.querySelector('.mobile-filter-button')?.focus();}
    if(action==='print'){window.print();}
    if(action==='share'){
      try{
        if(navigator.share){await navigator.share({title:document.title,url:location.href});return;}
        if(navigator.clipboard){await navigator.clipboard.writeText(location.href);control.textContent='Enlace copiado';return;}
      }catch(error){if(error?.name==='AbortError')return;}
      window.prompt('Copiá el enlace:',location.href);
    }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.filtersOpen){state.filtersOpen=false;render();}});
  render();
})();
