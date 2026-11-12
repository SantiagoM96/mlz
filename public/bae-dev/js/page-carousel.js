/* Navegador editorial compartido — adaptado por marca para BAE y Diario Show DEV.
   Las placas guardan sus propios estados del motor nativo; no se sustituye el canvas. */
(()=>{
'use strict';
const isDS=location.pathname.includes('diarioshow-dev');
const editor=isDS?window.DiarioShowEditor:window.BAEEditor;
const main=document.querySelector('main'),preview=main?.querySelector('.preview');
if(!editor||!preview)return;
const brand=isDS?'Diario-Show':'BAE';
const canvas=document.getElementById('art');
const originalDownload=document.getElementById('download');
const variantSelector=isDS?'.ds-variant-option[data-variant]':'.theme-swatch[data-theme]';
const blankParent=document.querySelector(isDS?'.ds-variant-options':'.theme-swatches');
let pages=[editor.getPageState()],active=0,drag=null,suppressClick=false;
const $=(name)=>nav.querySelector(name);
function blankPage(){
 const initial=editor.getPageState();
 return {...initial,variant:'blank',headline:'',image:null,zoom:1,offsetX:0,offsetY:0,
  quote:'',enableQuote:false,quoteAuthor:'',showQuoteAuthor:false,
  photoLayout:'single',splitPhotos:{left:{image:null,zoom:1,x:0,y:0},right:{image:null,zoom:1,x:0,y:0}}};
}
function variantName(s){
 if(s.variant==='blank')return 'Sin diseño';
 if(isDS)return {pink:'Variante 1',blue:'Variante 2',quote:'Variante 3','quote-blue':'Variante 4'}[s.variant]||'Variante';
 return {dark:'Negro',white:'Blanco',red:'Rojo'}[s.variant]||'Diseño';
}
function syncBlankOptions(){
 document.querySelectorAll('[data-editor-blank]').forEach(button=>{
  button.setAttribute('aria-pressed',String(pages[active]?.variant==='blank'));
 });
}
function insertBlankOptions(){
 const locations=[blankParent,...document.querySelectorAll(isDS?'.ds-mobile-content-editor .ds-variant-options':'.modern-preview-identity-editor .theme-swatches')].filter(Boolean);
 for(const parent of locations){
  if(parent.querySelector('[data-editor-blank]'))continue;
  const b=document.createElement('button');b.type='button';b.dataset.editorBlank='true';
  b.className=isDS?'ds-variant-option editor-blank-option':'theme-swatch editor-blank-option';
  b.setAttribute('aria-label','Sin diseño');b.setAttribute('aria-pressed','false');
  const preview=document.createElement('span');preview.className=isDS?'ds-variant-preview editor-blank-thumb':'theme-swatch-thumb editor-blank-thumb';
  const text=document.createElement('span');text.className=isDS?'':'theme-swatch-caption';text.textContent='Sin diseño';
  b.append(preview,text);parent.prepend(b);
 }
 syncBlankOptions();
}
const nav=document.createElement('section');nav.className='editor-slide-nav';
nav.setAttribute('aria-label','Diapositivas');
nav.innerHTML='<div class="editor-slide-heading"><strong>Diapositivas</strong><span class="editor-slide-indicator" aria-live="polite"></span></div><div class="editor-slide-row"><div class="editor-slide-track" role="group" aria-label="Seleccionar diapositiva"></div><div class="editor-slide-actions"><button type="button" class="editor-slide-add-fixed" aria-label="Agregar diapositiva" title="Agregar diapositiva"><span class="material-icons">add</span></button><button type="button" class="editor-slide-delete" aria-label="Eliminar diapositiva" title="Eliminar diapositiva"><span class="material-icons">delete_outline</span></button></div></div>';
preview.insertBefore(nav,preview.querySelector('.preview-toolbar'));
function save(){pages[active]=editor.getPageState()}
function load(index){
 active=index;editor.setPageState(pages[index]);syncBlankOptions();draw();
}
function select(index){if(index===active)return;save();load(index)}
function add(){save();pages.splice(active+1,0,blankPage());load(active+1)}
function remove(){if(pages.length===1)return;pages.splice(active,1);load(Math.min(active,pages.length-1))}
function updateOverflow(){
 const track=$('.editor-slide-track');nav.classList.toggle('is-overflowing',track.scrollWidth>track.clientWidth+2);
}
function draw(){
 const track=$('.editor-slide-track');track.replaceChildren();
 pages.forEach((p,i)=>{
  const btn=document.createElement('button');btn.type='button';btn.className='editor-slide-thumb';btn.dataset.variant=p.variant;
  btn.setAttribute('aria-label','Diapositiva '+(i+1)+', '+variantName(p));
  btn.setAttribute('aria-current',String(active===i));
  btn.title='Diapositiva '+(i+1)+' · '+variantName(p);
  const art=document.createElement('span');art.className='editor-slide-art';art.setAttribute('aria-hidden','true');
  const photo=document.createElement('span');photo.className='editor-slide-photo';
  const footer=document.createElement('span');footer.className='editor-slide-footer';
  footer.append(document.createElement('i'),document.createElement('i'));
  art.append(photo,footer);
  const num=document.createElement('span');num.className='editor-slide-number';num.textContent=String(i+1);
  btn.append(art,num);btn.addEventListener('click',()=>select(i));track.append(btn);
 });
 const addTile=document.createElement('button');addTile.type='button';addTile.className='editor-slide-add-tile';
 addTile.setAttribute('aria-label','Agregar nueva diapositiva');addTile.title='Agregar nueva diapositiva';
 addTile.innerHTML='<span class="material-icons" aria-hidden="true">add</span>';addTile.addEventListener('click',add);track.append(addTile);
 $('.editor-slide-indicator').textContent=(active+1)+' de '+pages.length+' · '+variantName(pages[active]);
 $('.editor-slide-delete').disabled=pages.length===1;
 syncBlankOptions();
 requestAnimationFrame(()=>{
  updateOverflow();
  const current=track.querySelector('[aria-current="true"]');
  if(current&&current.offsetLeft<track.scrollLeft)track.scrollLeft=current.offsetLeft-5;
  if(current&&current.offsetLeft+current.offsetWidth>track.scrollLeft+track.clientWidth)
   track.scrollLeft=current.offsetLeft+current.offsetWidth-track.clientWidth+5;
 });
}
$('.editor-slide-add-fixed').addEventListener('click',add);
$('.editor-slide-delete').addEventListener('click',remove);
const track=$('.editor-slide-track');
track.addEventListener('pointerdown',event=>{
 if(event.pointerType==='touch'||event.button!==0)return;
 suppressClick=false;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY,scroll:track.scrollLeft,moved:false};
});
track.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 if(!drag.moved&&Math.abs(dx)<6)return;
 if(!drag.moved&&Math.abs(dy)>Math.abs(dx))return;
 if(!drag.moved){drag.moved=true;track.classList.add('is-dragging');track.setPointerCapture(event.pointerId)}
 track.scrollLeft=drag.scroll-dx;event.preventDefault();
});
function stopDrag(event){
 if(!drag||drag.id!==event.pointerId)return;
 if(drag.moved){suppressClick=true;track.classList.remove('is-dragging')}
 drag=null;
}
for(const type of ['pointerup','pointercancel','lostpointercapture'])track.addEventListener(type,stopDrag);
track.addEventListener('click',event=>{
 if(!suppressClick)return;
 suppressClick=false;event.preventDefault();event.stopImmediatePropagation();
},true);
if(window.ResizeObserver)new ResizeObserver(updateOverflow).observe(track);
document.addEventListener('click',event=>{
 const blankButton=event.target.closest('[data-editor-blank]');
 if(blankButton){
  event.preventDefault();event.stopImmediatePropagation();
  editor.setBlank(true);save();syncBlankOptions();draw();return;
 }
 const variantButton=event.target.closest(variantSelector);
 if(!variantButton)return;
 if(pages[active]?.variant==='blank')editor.setBlank(false);
 // El controlador de la marca actualiza el resto del estado después de este evento.
 queueMicrotask(()=>{save();draw()});
},true);
// La tarjeta sin diseño debe aparecer en el mismo selector del producto.
insertBlankOptions();
const dialog=document.createElement('div');dialog.className='editor-slide-export';dialog.hidden=true;
dialog.innerHTML='<div class="editor-slide-export-card" role="dialog" aria-modal="true" aria-labelledby="editorSlideExportTitle"><strong id="editorSlideExportTitle">Descargar diapositivas</strong><p>Elegí si querés exportar esta placa o todas las diapositivas del carrusel.</p><div><button type="button" data-export="current">Solo esta</button><button type="button" data-export="all">Todas</button><button type="button" data-export="cancel">Cancelar</button></div></div>';
document.body.append(dialog);
function close(){dialog.hidden=true}
dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.hidden)close()});
const clock=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0'),String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),String(d.getSeconds()).padStart(2,'0')].join('-')};
const pngBlob=()=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('No se pudo exportar el PNG')),'image/png'));
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
let exporting=false;
async function exportSlides(all){
 if(exporting)return;
 exporting=true;const buttons=[...dialog.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
 const original=active,stamp=clock(),indices=all?pages.map((_,i)=>i):[active];
 save();
 try{
  for(let n=0;n<indices.length;n++){
   const i=indices[n];editor.setPageState(pages[i]);
   const blob=await pngBlob();download(blob,brand+'-diapositiva-'+String(i+1).padStart(2,'0')+'_'+stamp+'.png');
   if(n<indices.length-1)await new Promise(resolve=>setTimeout(resolve,1000));
  }
 }catch(err){alert('No se pudo exportar la diapositiva: '+err.message)}
 finally{editor.setPageState(pages[original]);active=original;draw();buttons.forEach(b=>b.disabled=false);exporting=false;close()}
}
dialog.addEventListener('click',event=>{
 const key=event.target.closest('[data-export]')?.dataset.export;
 if(key==='cancel')close();
 else if(key==='current'||key==='all')exportSlides(key==='all');
});
originalDownload.addEventListener('click',event=>{
 if(pages.length===1)return;
 event.preventDefault();event.stopImmediatePropagation();dialog.hidden=false;
},true);
// «Limpiar» modifica solo la placa actual. El estado guardado se refresca después.
document.getElementById('clearAll')?.addEventListener('click',()=>queueMicrotask(()=>{save();draw()}));
window.EditorialSlides={count:()=>pages.length,active:()=>active,add,remove,select,save,exportSlides};
draw();
})();