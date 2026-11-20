const $=s=>document.querySelector(s);
const icon=n=>'<span class="material-symbols-outlined" aria-hidden="true">'+n+'</span>';
const dueIcon=kind=>icon(kind==='ddjj'?'description':kind==='second'?'event_repeat':'payments');
const titles={abl:'Tasa por Servicios Generales',auto:'Impuesto Automotores',moto:'Patente Motovehículos',higiene:'Tasa por Seguridad e Higiene',publicidad:'Publicidad y Propaganda',antenas:'Antenas'};
const nav=[['abl','Inmueble','home'],['auto','Automotor y Motovehículo','directions_car'],['higiene','Seguridad e Higiene','factory'],['publicidad','Publicidad y Propaganda','campaign'],['antenas','Antenas','cell_tower']];
const features=[['document_search','Consultar tus deudas','Revisá el estado de tus tasas municipales y automotores, y accedé a las boletas para realizar el pago.'],['task_alt','Regularizar deudas vencidas','Actualizá deudas pendientes y accedé a las opciones disponibles para poner tu cuenta al día.'],['calendar_month','Solicitar planes de pago','Financiá deudas de la Tasa por Servicios Generales y Automotor en cuotas.'],['upload_file','Presentar declaraciones juradas','Descargá y presentá las declaraciones juradas correspondientes a tu actividad comercial.'],['directions_car','Gestionar automotores y motos','Realizá altas impositivas, bajas y cambios de titularidad de vehículos.'],['folder_open','Consultar expedientes','Seguí el estado y avance de tus trámites y expedientes.'],['mark_email_read','Adherirse a la boleta electrónica','Recibí tus boletas por correo electrónico y simplificá la gestión de tus pagos.'],['bookmark_check','Solicitar certificado de exención','Tramitá el certificado de exención de la Tasa por Servicios Generales.']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateFmt=s=>s?s.split('-').reverse().join('/'): '—';
const dateObj=s=>new Date(s+'T12:00:00Z');
const todayISO=()=>{const p=new Intl.DateTimeFormat('en',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-')};
const dayDiff=(a,b)=>Math.round((dateObj(a)-dateObj(b))/86400000);
const capitalize=s=>s.charAt(0).toUpperCase()+s.slice(1);
const humanDate=s=>{const d=s.split('-')[2];return d+' '+capitalize(new Intl.DateTimeFormat('es-AR',{month:'long',timeZone:'UTC'}).format(dateObj(s)))};
const period=r=>(r.month?months[r.month-1]:'Anual')+' - '+r.year;
let rows=[],months=[],payments=[],current='home',activeTax=null,expanded=false,currentYear=2027,calendarYears={};
const visibleNav=()=>nav;
function yearControl(tax){
 const available=year=>calendarYears[year]?.rows.some(r=>r.tax===tax);
 return '<div class="calendar-year-picker" role="group" aria-label="Ir al año del calendario">'+[2026,2027].map(year=>
 '<button type="button" class="calendar-year-option'+(year===currentYear?' is-active':'')+'" data-year-jump="'+year+'" aria-pressed="'+(year===currentYear)+'"'+(available(year)?'':' disabled aria-label="Sin calendario '+year+' para '+esc(titles[tax])+'"')+'>'+year+'</button>'
 ).join('')+'</div>'
}
function chooseYearIndex(items,year,today=todayISO()){
 const indices=items.map((item,i)=>item.fiscalYear===year?i:-1).filter(i=>i>=0);
 if(!indices.length)return 0;
 const upcoming=indices.find(i=>items[i].date>=today);
 if(upcoming!==undefined)return upcoming;
 const firstWithinYear=indices.find(i=>items[i].date>=year+'-01-01');
 return firstWithinYear??indices[0];
}

const dueText=r=>r.firstDuePending||dateFmt(r.firstDue);
const quotaText=r=>r.quota==='Anual'?'Pago anual':r.quota==='DJ Anual'?'Declaración jurada anual':'Cuota '+r.quota;
const groups=[['Web','Web','Disponible las 24 horas'],['Débito automático','Débito Automático','No te olvidás nunca de pagar'],['Red de cobranza','Red de cobranza','Pagá en puntos habilitados de todo el país'],['Banco','Bancos','Pago a través de entidades bancarias adheridas'],['Cámara','Cámaras de Comercio','Pago presencial en instituciones adheridas'],['Cajero automático','Cajeros Automáticos','Operaciones disponibles en terminales habilitadas']];
const paymentItem=p=>'<article class="payment-item"><h4>'+esc(p.entity)+'</h4>'+(p.address?'<p>'+esc(p.address)+'</p>':'')+(p.hours?'<p>'+esc(p.hours)+'</p>':'')+'<p>'+esc(p.methods.join(', '))+'</p></article>';
function renderPayments(){ $('#payment-groups').innerHTML=groups.map(([k,title,desc])=>'<section class="payment-group"><h3>'+title+'</h3><p>'+desc+'</p><div class="items">'+payments.filter(p=>p.channel===k).map(paymentItem).join('')+'</div></section>').join('');const cg=payments.filter(p=>p.channel==='CGM');$('#cgm').innerHTML=(expanded?cg:cg.slice(0,3)).map(paymentItem).join('');$('#expand-cgm').textContent=expanded?'Ver menos':'Ver todos los CGM';$('#expand-cgm').setAttribute('aria-expanded',String(expanded));}
function banner(compact=false){return compact?'<div class="annual-banner compact-banner"><img src="./assets/banner-calendar-desktop.png?v=20261117-assets-v2" width="1200" height="145" alt="Pago anual 2026 · 2 meses de bonificación · Medios de pago"></div>':'<div class="annual-banner home-banner"><img class="banner-desktop" src="./assets/banner-home-desktop.png?v=20261117-assets-v2" width="1200" height="269" alt="Pago anual 2026 · 2 meses de bonificación · Tasa por Servicios Generales ABL"><img class="banner-mobile" src="./assets/banner-home-mobile.png?v=20261117-assets-v2" width="400" height="153" alt="Pago anual 2026 · 2 meses de bonificación"></div>'}
function home(){return banner()+'<div class="actions">'+[['document_search','Consultar Deuda','Revisá tus deudas, vencimientos y pagos pendientes en un solo lugar.'],['paid','Pagar Tasas','Pagá tus tasas municipales online de forma rápida, simple y segura.']].map(([i,t,d])=>'<a class="action" href="https://sag.lomasdezamora.gov.ar/" target="_blank" rel="noopener noreferrer"><span class="icon">'+icon(i)+'</span><div><h3>'+t+'</h3><p class="muted">'+d+'</p></div></a>').join('')+'</div><section><div class="intro"><h2>Calendario de Pagos</h2><p class="muted">Encontrá el cronograma completo de vencimientos e información tributaria oficial</p></div><div class="tax-grid">'+visibleNav().map(([k,t,i])=>'<a class="tax-card" href="#'+k+'"><span class="icon">'+icon(i)+'</span><div><h3>'+t+'</h3><p class="muted">Ver más</p></div></a>').join('')+'</div></section><section><div class="intro"><h2>¿Qué podés hacer en el Portal de ARLO?</h2><p class="muted">Ahorrá tiempo y resolvé tus trámites de forma online. Consultá tu estado de deuda, pagá tus tasas y descargá tus comprobantes de forma rápida y segura.</p></div><div class="feature-grid">'+features.map(([i,t,d])=>'<article class="feature"><span class="icon">'+icon(i)+'</span><h3>'+t+'</h3><p class="muted">'+d+'</p></article>').join('')+'</div></section>'}
function events(tax){
 return [2026,2027].flatMap(fiscalYear=>(calendarYears[fiscalYear]?.rows||[])
 .filter(r=>r.tax===tax).flatMap(r=>[
 ['ddjj','Entrega de DDJJ','ddjj'],['firstDue','Vencimiento de Pago','first'],['secondDue','2° Vencimiento de Pago','second']
 ].filter(([key])=>r[key]).map(([key,label,kind])=>({r,date:r[key],label,kind,fiscalYear}))))
 .sort((a,b)=>a.date.localeCompare(b.date)||a.fiscalYear-b.fiscalYear||String(a.r.quota).localeCompare(String(b.r.quota)));
}
function dateCard(e,highlight){let d=dayDiff(e.date,todayISO());return '<article class="date-card" data-fiscal-year="'+e.fiscalYear+'"><div class="date-head"><strong>'+humanDate(e.date)+'</strong>'+(highlight&&d>=0?'<span class="days">'+(d===0?'Vence hoy':'Faltan '+d+(d===1?' día':' días'))+'</span>':'')+'</div><span class="tag '+e.kind+'">'+dueIcon(e.kind)+'<span>'+esc(e.label)+'</span></span><p class="period">'+period(e.r)+' · '+quotaText(e.r)+'</p>'+ (e.r.tax==='higiene'?'<p class="regime">'+esc(e.r.regime==='Simplificado'?'Régimen Simplificado':e.r.regime)+'</p>':'')+(highlight&&d>=0&&e.kind!=='ddjj'?'<a class="pay-link" href="https://sag.lomasdezamora.gov.ar/" target="_blank" rel="noopener noreferrer">Pagar ahora</a>':'')+'</article>'}
function calendar(tax){
 const all=events(tax),next=chooseYearIndex(all,currentYear),upcoming=all.findIndex(e=>e.date>=todayISO());
 const pending=rows.filter(r=>r.tax===tax&&(r.ddjjPending||r.firstDuePending||r.secondDuePending));
 return '<section class="calendar-section" data-tax="'+tax+'"><div class="heading-row"><div class="calendar-heading-main"><h1>'+titles[tax]+'</h1><p class="muted">Informate sobre todas las fechas de vencimiento y descargate el calendario completo.</p>'+yearControl(tax)+'</div><div class="arrows"><button data-dir="-1" aria-label="Vencimientos anteriores">'+icon('chevron_left')+'</button><button data-dir="1" aria-label="Vencimientos siguientes">'+icon('chevron_right')+'</button></div></div><div class="rail" tabindex="0" aria-label="Vencimientos de '+titles[tax]+' de 2026 y 2027" data-start="'+next+'">'+all.map((e,i)=>dateCard(e,i===upcoming)).join('')+'</div>'+(pending.length?'<p class="notice">Hay '+pending.length+' fecha'+(pending.length===1?'':'s')+' pendiente'+(pending.length===1?'':'s')+' de precisar. Consultá el calendario completo.</p>':'')+'<div class="controls"><button class="pill" data-open="'+tax+'">'+icon('visibility')+' Ver calendario completo</button><button class="pill" data-pdf="'+tax+'">'+icon('download')+' Descargar calendario completo en PDF</button></div></section>';
}

function docs(tax){const data=tax==='higiene'?[['Información Útil','Encontrá toda la información correspondiente a la Tasa por Seguridad e Higiene.',['Constancia de Categorización','Mínimos Marzo 2026 (Cuota 3)','Mínimos Febrero 2026 (Cuota 2)','Valores RS Enero 2026 (Cuota 1)','Mínimos Noviembre 2025 (Cuota 11)']],['Formularios de DDJJ','Si vas a hacer el trámite de forma presencial, encontrá los formularios afines.',['DDJJ Régimen General Mensual','DDJJ Anual','Anexo Tasa Vial']],['Ordenanzas','Normativa tributaria, categorías, mínimos y condiciones aplicables.',['Ordenanza Impositiva','Ordenanza Fiscal']]]:[['Información Útil','Códigos de Publicidad.',['Códigos de Publicidad']],['Formularios de DDJJ','Declaración jurada de Derechos de Publicidad y Propaganda.',['DDJJ Publicidad y Propaganda / Ocupación de Espacios Públicos 2026']]];return data.map(([t,d,items])=>'<section class="documents"><h3>'+t+'</h3><p class="muted">'+d+'</p><div class="document-grid">'+items.map(n=>'<article class="doc">'+icon('description')+'<div>'+n+'<small>Documento pendiente de vincular</small></div></article>').join('')+'</div></section>').join('')}
function setArrowState(rail){let holder=rail.closest('.calendar-section');holder.querySelector('[data-dir="-1"]').disabled=rail.scrollLeft<=2;holder.querySelector('[data-dir="1"]').disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2}
function initRails(){document.querySelectorAll('.rail').forEach(rail=>{
  const start=Number(rail.dataset.start);
  const oldBehavior=rail.style.scrollBehavior;rail.style.scrollBehavior='auto';rail.scrollLeft=start*304;rail.style.scrollBehavior=oldBehavior;
  setArrowState(rail);
  rail.addEventListener('scroll',()=>setArrowState(rail),{passive:true});
  let pointerId=null,originX=0,originScroll=0,dragged=false;
  rail.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse'||e.button!==0||pointerId!==null)return;
    pointerId=e.pointerId;originX=e.clientX;originScroll=rail.scrollLeft;dragged=false;
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove',e=>{
    if(e.pointerId!==pointerId)return;
    const dx=e.clientX-originX;
    if(!dragged&&Math.abs(dx)>5){dragged=true;rail.classList.add('is-dragging')}
    if(dragged){rail.scrollLeft=originScroll-dx;e.preventDefault()}
  });
  const endDrag=e=>{
    if(e.pointerId!==pointerId)return;
    pointerId=null;
    if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);
    if(dragged){
      // El drag es libre. Al soltar, acercamos suavemente la tarjeta más próxima.
      // Se evita el snap instantáneo del navegador durante el gesto.
      const cards=[...rail.querySelectorAll('.date-card')];
      const nearest=cards.reduce((best,card)=>{
        const distance=Math.abs((card.offsetLeft-rail.offsetLeft)-rail.scrollLeft);
        return !best||distance<best.distance?{card,distance}:best;
      },null);
      rail.dataset.suppressClick='true';
      window.setTimeout(()=>{delete rail.dataset.suppressClick},0);
      if(nearest){
        rail.scrollTo({
          left:nearest.card.offsetLeft-rail.offsetLeft,
          behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
        });
      }
    }
    rail.classList.remove('is-dragging');
    dragged=false;
    setArrowState(rail);
  };
  rail.addEventListener('pointerup',endDrag);
  rail.addEventListener('pointercancel',endDrag);
  rail.addEventListener('lostpointercapture',endDrag);
  rail.addEventListener('click',e=>{
    if(rail.dataset.suppressClick==='true'){
      e.preventDefault();e.stopPropagation();delete rail.dataset.suppressClick;
    }
  },true);
  rail.addEventListener('keydown',e=>{
    if(e.target!==rail||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();
    rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*304,behavior:'smooth'});
  });
})}
function route(){const hash=location.hash.slice(1);if(hash==='medios'){document.getElementById('medios').scrollIntoView();return}current=visibleNav().some(n=>n[0]===hash)?hash:'home';if(current==='antenas'&&currentYear===2026){currentYear=2027;rows=calendarYears[2027].rows;months=calendarYears[2027].months}$('#app').innerHTML=current==='home'?home():'<a href="#home" class="pill back">'+icon('chevron_left')+' Atrás</a>'+calendar(current)+(current==='auto'?calendar('moto'):'')+banner(true)+(['higiene','publicidad'].includes(current)?docs(current):'');document.title=(current==='home'?'Calendario de pagos':titles[current])+' · ARLO';window.scrollTo({top:0,left:0,behavior:'instant'});initRails()}
function tableGroups(tax){
 const subset=rows.filter(r=>r.tax===tax);
 const monthLabel=r=>r.month?months[r.month-1]:'Anual';
 const due2=r=>r.secondDuePending||dateFmt(r.secondDue);
 if(['abl','auto','moto','antenas'].includes(tax)){
   return [{title:titles[tax],headers:['Modalidad','Cuota','Ejercicio','Mes','1er vencimiento','2do vencimiento'],data:subset.map(r=>[r.mode,quotaText(r),r.year,monthLabel(r),dueText(r),due2(r)])}];
 }
 const annual=subset.filter(r=>r.mode==='Anual');
 const monthly=subset.filter(r=>r.mode!=='Anual');
 const result=annual.length?[{title:'Declaración jurada anual',headers:['Régimen','Ejercicio','Vencimiento de entrega de DDJJ'],data:annual.map(r=>[r.regime||'—',r.year,r.ddjjPending?'Fecha a confirmar':dateFmt(r.ddjj)])}]:[];
 for(const reg of [...new Set(monthly.map(r=>r.regime))]){
   const general=reg==='Régimen General';
   result.push({title:tax==='publicidad'?'Tasa por Publicidad':general?'Régimen General':'Régimen Simplificado',
     headers:general?['Modalidad','Mes','Cuota y ejercicio','Entrega de DDJJ','Vencimiento de pago']:['Modalidad','Mes','Cuota y ejercicio','Vencimiento de pago'],
     data:monthly.filter(r=>r.regime===reg).map(r=>[r.mode,monthLabel(r),quotaText(r)+' · '+r.year,...(general?[dateFmt(r.ddjj)]:[]),dueText(r)])});
 }
 return result;
}
function openCalendar(tax){activeTax=tax;$('#calendar-title').textContent=titles[tax]+' · '+currentYear;$('#calendar-tables').innerHTML=tableGroups(tax).map(g=>'<section class="table-wrap"><h3>'+esc(g.title)+'</h3><table><thead><tr>'+g.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+g.data.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></section>').join('');resetCalendarDrawer();calendarDialog.showModal();syncCalendarScrollLock();$('#calendar-dialog .dialog-scroll').scrollTop=0;$('#calendar-dialog .calendar-scroll-content').scrollTop=0}
function pdf(tax){const sections=tableGroups(tax), pages=[];let lines=[];const flush=()=>{if(lines.length)pages.push(lines);lines=[]};const add=(s,size=11,bold=false)=>{if(lines.length>=43)flush();lines.push({s,size,bold})};add('ARLO | Agencia de Recaudación de Lomas de Zamora',14,true);add(titles[tax]+' - Calendario '+currentYear,18,true);add('Prototipo de desarrollo. Fechas según datos provistos.',10);for(const g of sections){if(lines.length>35)flush();add('',10);add(g.title.toUpperCase(),13,true);const widths=g.headers.map((_,i)=>Math.max(g.headers[i].length,...g.data.map(r=>String(r[i]).length))+2);const row=r=>r.map((v,i)=>String(v).padEnd(widths[i])).join('');const rowSize=currentYear===2027?9:10;add(row(g.headers),rowSize,true);for(const r of g.data)add(row(r),rowSize)}flush();const enc=s=>String(s).replace(/[–—]/g,'-').replace(/°/g,'º').replace(/[^\x20-\xFF]/g,'?').replace(/([\\()])/g,'\\$1');const objs=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>'];const ids=[];pages.forEach((p,i)=>{let id=objs.length+1;ids.push(id);const stream='BT\n'+p.map((l,j)=>'/F'+(l.bold?2:1)+' '+l.size+' Tf 1 0 0 1 32 '+(795-j*16)+' Tm ('+enc(l.s)+') Tj').join('\n')+'\nET';objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(id+1)+' 0 R >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream')});objs[1]='<< /Type /Pages /Count '+ids.length+' /Kids ['+ids.map(i=>i+' 0 R').join(' ')+'] >>';let out='%PDF-1.4\n',offsets=[0];objs.forEach((o,i)=>{offsets.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});const xref=out.length;out+='xref\n0 '+offsets.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';const blob=new Blob([Uint8Array.from(out,c=>c.charCodeAt(0))],{type:'application/pdf'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='ARLO-'+tax+'-'+currentYear+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
function jumpToFiscalYear(year){
 if(!calendarYears[year])return;
 currentYear=year;rows=calendarYears[year].rows;months=calendarYears[year].months;
 document.querySelectorAll('.calendar-year-option').forEach(button=>{
  const active=Number(button.dataset.yearJump)===year;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
 });
 document.querySelectorAll('.calendar-section').forEach(section=>{
  const rail=section.querySelector('.rail'),index=chooseYearIndex(events(section.dataset.tax),year);
  const item=rail.children[index];if(!item)return;
  rail.scrollTo({left:item.offsetLeft-rail.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.yearJump){jumpToFiscalYear(Number(b.dataset.yearJump));return}if(b.dataset.dir){const rail=b.closest('.calendar-section').querySelector('.rail');rail.scrollBy({left:Number(b.dataset.dir)*304,behavior:'smooth'})}if(b.dataset.open)openCalendar(b.dataset.open);if(b.dataset.pdf)pdf(b.dataset.pdf);if(b.id==='close-dialog')closeCalendarDrawer();if(b.id==='print-calendar'&&activeTax)pdf(activeTax);if(b.id==='expand-cgm'){expanded=!expanded;renderPayments()}});
$('#calendar-dialog').addEventListener('click',e=>{if(e.target!==calendarDialog)return;const r=calendarDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCalendarDrawer()});
window.addEventListener('hashchange',route);
async function start(){try{
 const [cal26,cal27,pay]=await Promise.all([
 fetch('./data/vencimientos.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar calendario 2026');return r.json()}),
 fetch('./data/vencimientos-2027.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar calendario 2027');return r.json()}),
 fetch('./data/medios-pago.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar medios de pago');return r.json()})
 ]);
 calendarYears={2026:cal26,2027:cal27};rows=cal27.rows;months=cal27.months;payments=pay.rows;
 renderPayments();route();
 if(location.hash==='#medios'&&!$('#app').querySelector('.hero')){$('#app').innerHTML=home();$('#medios').scrollIntoView()}
 }catch(e){$('#app').innerHTML='<h1>No se pudo cargar la información</h1><p>Intentá recargar la página.</p>';console.error(e)}
}
// Drawer de calendario: adaptación del motion de Agenda/Deportes sin dependencias React.
const calendarDialog = $('#calendar-dialog');
const calendarGrabber = calendarDialog.querySelector('.calendar-grabber');
const drawerMobile = window.matchMedia('(max-width: 767px)');
const drawerReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let sheetStartY = null, sheetStartTime = 0, sheetBaseHeight = 0, sheetMoved = false;
let sheetResetTimer = null, sheetCloseTimer = null, previousBodyOverflow = null, sheetPointerId = null;
function clearSheetReset(){
  if(sheetResetTimer!==null) window.clearTimeout(sheetResetTimer);
  sheetResetTimer=null;
}
function clearSheetGesture(){
  calendarDialog.classList.remove('sheet-dragging','sheet-stretching','sheet-rebounding','sheet-stretch-rebounding');
  ['--sheet-drag-y','--sheet-stretch-y','--sheet-base-height','--sheet-backdrop-opacity'].forEach(p=>calendarDialog.style.removeProperty(p));
}
function resetCalendarDrawer(){
  clearSheetReset();
  if(sheetCloseTimer!==null)window.clearTimeout(sheetCloseTimer);
  sheetCloseTimer=null;sheetStartY=null;sheetMoved=false;sheetPointerId=null;
  clearSheetGesture();
  calendarDialog.classList.remove('sheet-settled','sheet-exit');
}
function syncCalendarScrollLock(){
  if(calendarDialog.open&&drawerMobile.matches){
    if(previousBodyOverflow===null){previousBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden'}
  }else if(previousBodyOverflow!==null){document.body.style.overflow=previousBodyOverflow;previousBodyOverflow=null}
}
function closeCalendarDrawer(){
  if(!calendarDialog.open||sheetCloseTimer!==null)return;
  clearSheetReset();sheetStartY=null;sheetPointerId=null;
  if(!drawerMobile.matches||drawerReduced.matches){calendarDialog.close();return}
  calendarDialog.classList.remove('sheet-dragging','sheet-stretching','sheet-rebounding','sheet-stretch-rebounding');
  calendarDialog.classList.add('sheet-settled','sheet-exit');
  sheetCloseTimer=window.setTimeout(()=>{sheetCloseTimer=null;calendarDialog.close()},220);
}
function sheetShouldDismiss(delta,elapsed,height){
  return delta>0&&(delta>=Math.min(168,Math.max(120,height*.24))||(delta>=55&&delta/Math.max(1,elapsed)>=.8));
}
calendarGrabber.addEventListener('pointerdown',e=>{
  if(!drawerMobile.matches||sheetCloseTimer!==null||sheetPointerId!==null||(e.pointerType==='mouse'&&e.button!==0))return;
  clearSheetReset();clearSheetGesture();
  sheetBaseHeight=calendarDialog.getBoundingClientRect().height;
  calendarDialog.style.setProperty('--sheet-base-height',sheetBaseHeight.toFixed(2)+'px');
  calendarDialog.classList.add('sheet-settled');
  sheetStartY=e.clientY;sheetStartTime=e.timeStamp;sheetMoved=false;sheetPointerId=e.pointerId;
  calendarGrabber.setPointerCapture(e.pointerId);
});
calendarGrabber.addEventListener('pointermove',e=>{
  if(sheetStartY===null||e.pointerId!==sheetPointerId)return;
  const delta=e.clientY-sheetStartY;
  if(Math.abs(delta)>8)sheetMoved=true;
  if(delta<0){
    calendarDialog.classList.remove('sheet-dragging');
    calendarDialog.style.setProperty('--sheet-drag-y','0px');
    calendarDialog.style.setProperty('--sheet-stretch-y',(34*(1-Math.exp(Math.abs(delta)/-76))).toFixed(2)+'px');
    calendarDialog.classList.add('sheet-stretching');
    calendarDialog.style.setProperty('--sheet-backdrop-opacity','1');
  }else{
    calendarDialog.classList.remove('sheet-stretching');
    calendarDialog.style.setProperty('--sheet-stretch-y','0px');
    calendarDialog.style.setProperty('--sheet-drag-y',Math.max(0,delta).toFixed(2)+'px');
    calendarDialog.classList.add('sheet-dragging');
    calendarDialog.style.setProperty('--sheet-backdrop-opacity',String(Math.max(.12,1-delta/Math.max(1,sheetBaseHeight))));
  }
});
function endCalendarGesture(e,cancelled){
  if(sheetStartY===null||e.pointerId!==sheetPointerId)return;
  const delta=e.clientY-sheetStartY,elapsed=Math.max(1,e.timeStamp-sheetStartTime);
  sheetStartY=null;sheetPointerId=null;
  if(Math.abs(delta)>8||cancelled)sheetMoved=true;
  if(!cancelled&&sheetShouldDismiss(delta,elapsed,sheetBaseHeight)){closeCalendarDrawer();return}
  const stretched=calendarDialog.classList.contains('sheet-stretching');
  if(drawerReduced.matches||Math.abs(delta)<2){clearSheetGesture();return}
  calendarDialog.classList.remove('sheet-dragging','sheet-stretching');
  calendarDialog.classList.add(stretched?'sheet-stretch-rebounding':'sheet-rebounding');
  calendarDialog.style.setProperty('--sheet-backdrop-opacity','1');
  clearSheetReset();
  sheetResetTimer=window.setTimeout(()=>{clearSheetGesture();sheetResetTimer=null},430);
}
calendarGrabber.addEventListener('pointerup',e=>endCalendarGesture(e,false));
calendarGrabber.addEventListener('pointercancel',e=>endCalendarGesture(e,true));
calendarGrabber.addEventListener('lostpointercapture',e=>endCalendarGesture(e,true));
calendarGrabber.addEventListener('click',()=>{if(!sheetMoved)closeCalendarDrawer();sheetMoved=false});
calendarDialog.addEventListener('cancel',e=>{if(drawerMobile.matches){e.preventDefault();closeCalendarDrawer()}});
calendarDialog.addEventListener('close',()=>{resetCalendarDrawer();syncCalendarScrollLock()});
drawerMobile.addEventListener('change',()=>{if(calendarDialog.open){if(sheetCloseTimer!==null)calendarDialog.close();else resetCalendarDrawer();syncCalendarScrollLock()}});

start();