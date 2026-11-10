/* Diario Show editor shell adapted for Crónica and BAE DEV.
   Preserves each product's native rendering, importing and export. */
(function(){
'use strict';
const main=document.querySelector('main');
const panel=main?.querySelector(':scope > .editor-panel');
const preview=main?.querySelector(':scope > .preview');
const canvas=document.getElementById('art');
if(!main||!panel||!preview||!canvas)return;
const $=id=>document.getElementById(id);
const brand=location.pathname.includes('cronica')?'cronica':'bae';
document.body.dataset.editorBrand=brand;
const isCronica=brand==='cronica';
const narrow=window.matchMedia('(max-width:700px)');

function makeCard(section,title,isText=false){
 section.classList.add('modern-card');
 if(isText)section.classList.add('modern-text-card');
 const body=document.createElement('div');
 body.className='modern-body';
 body.id='modern-body-'+Math.random().toString(36).slice(2,9);
 while(section.firstChild)body.appendChild(section.firstChild);
 const toggle=document.createElement('button');
 toggle.type='button';toggle.className='modern-toggle';
 toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-controls',body.id);
 const label=document.createElement('span');label.textContent=title;
 const chev=document.createElement('span');
 chev.className='material-icons modern-chevron';chev.setAttribute('aria-hidden','true');
 chev.textContent='expand_less';
 toggle.append(label,chev);
 section.append(toggle,body);
 toggle.addEventListener('click',()=>{
  const expanded=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(expanded));
  body.hidden=!expanded;
  requestAnimationFrame(updateHeight);
 });
 return section;
}
// Preserve original nodes and handlers by moving only, never recreating controls.
const sections=[...panel.querySelectorAll(':scope > section.panel-group')];
let textPanel;
if(isCronica){
 const content=sections.find(s=>s.querySelector('#headline'));
 textPanel=document.createElement('section');textPanel.className='panel-group';
 textPanel.setAttribute('aria-label','Textos');
 for(const sel of ['.typography-row','#headline','#size']){
  const node=content.querySelector(sel);
  const field=sel==='.typography-row'?node:node?.closest('.control-field');
  if(field)textPanel.appendChild(field);
 }
 content.after(textPanel);
}else{
 textPanel=sections.find(s=>s.querySelector('#headline'));
 const size=textPanel?.querySelector('#size')?.closest('.control-field');
 const headline=textPanel?.querySelector('#headline')?.closest('.control-field');
 if(size&&headline)headline.after(size);
}
for(const section of [...panel.querySelectorAll(':scope > section.panel-group')]){
 let title=section.querySelector(':scope > h2')?.textContent?.trim()||
  (section===textPanel?'Textos':section.classList.contains('carousel-panel')?'Páginas':'Diseño de la placa');
 if(section.classList.contains('cronica-variant-panel'))title='Diseño de placas';
 if(section===textPanel)title='Textos';
 makeCard(section,title,section===textPanel);
}
if(!textPanel)return;
// Photo input card: native file input and its existing image loader remain intact.
const photoFile=$('file');
if(photoFile&&!photoFile.closest('.modern-photo-picker')){
 const photoField=photoFile.closest('.control-field');
 const photoPicker=document.createElement('div');photoPicker.className='modern-photo-picker';
 const photoSurface=document.createElement('label');
 photoSurface.className='modern-photo-surface';photoSurface.setAttribute('for','file');
 photoSurface.innerHTML='<span class="material-symbols-outlined modern-photo-icon" aria-hidden="true">add_photo_alternate</span><span class="modern-photo-text"><strong class="modern-photo-action">Seleccioná</strong> <span class="modern-photo-caption">una fotografía</span></span>';
 photoFile.classList.add('modern-photo-input');
 photoFile.parentNode.insertBefore(photoPicker,photoFile);
 photoPicker.append(photoFile,photoSurface);
 photoFile.addEventListener('change',()=>{
  const name=photoFile.files?.[0]?.name;
  photoSurface.querySelector('.modern-photo-action').textContent=name?'Cambiar':'Seleccioná';
  photoSurface.querySelector('.modern-photo-caption').textContent=name||'una fotografía';
 },true);
 $('clearAll')?.addEventListener('click',()=>queueMicrotask(()=>{
  photoSurface.querySelector('.modern-photo-action').textContent='Seleccioná';
  photoSurface.querySelector('.modern-photo-caption').textContent='una fotografía';
 }));
}
// Keep icon buttons in separate blocks just like Diario Show.
for(const id of ['formatUppercase','formatClear']){
 const button=$(id);if(button)button.classList.add('modern-independent');
}
const headline=$('headline');
const size=$('size');
const sizeField=size?.closest('.control-field');
if(sizeField){
 sizeField.classList.add('modern-size-field');
 const out=$('sizeLabel');
 if(out&&out.parentElement!==sizeField)sizeField.append(out);
}
headline?.closest('.control-field')?.classList.add('modern-headline-field');
// BAE's original render now supports the independent uppercase mode.
if(!isCronica&&!$('formatUppercase')){
 const format=$('formatClear')?.parentElement;
 const upper=document.createElement('button');
 upper.type='button';upper.id='formatUppercase';upper.className='modern-independent';
 upper.setAttribute('aria-label','Mostrar texto en mayúsculas');
 upper.setAttribute('aria-pressed','false');upper.title='Mostrar texto en mayúsculas';
 upper.innerHTML='<span class="material-symbols-outlined" aria-hidden="true">match_case</span>';
 format?.insertBefore(upper,$('formatClear'));
 upper.addEventListener('click',()=>{
  upper.setAttribute('aria-pressed',String(upper.getAttribute('aria-pressed')!=='true'));
  headline.classList.toggle('uppercase-preview',upper.getAttribute('aria-pressed')==='true');
  headline.dispatchEvent(new Event('input',{bubbles:true}));
 });
}
// Build mobile tabs / slider track, preserving original desktop layout.
const nav=document.createElement('nav');nav.className='modern-mobile-tabs';
nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Secciones del editor');
const buttons=['preview','controls'].map((name,i)=>{
 const b=document.createElement('button');b.type='button';b.id='modernTab'+name;
 b.setAttribute('role','tab');b.textContent=i?'Formato':'Vista previa';b.dataset.tab=name;nav.append(b);
 return b;
});
const shell=document.createElement('div');shell.className='modern-shell';
const track=document.createElement('div');track.className='modern-track';
main.prepend(nav);main.append(shell);shell.append(track);track.append(panel,preview);
const zoom=$('photoZoom'),zoomBox=zoom?.closest('.preview-zoom');
const toolbar=preview.querySelector('.preview-toolbar'),stage=$('photoStage');
if(zoomBox){
 zoomBox.classList.add('modern-photo-zoom');
 const label=zoomBox.querySelector('label');
 const desktop=document.createElement('span');desktop.className='modern-zoom-desktop';desktop.textContent='Zoom';
 const icon=document.createElement('span');icon.className='modern-zoom-icon material-icons';
 icon.setAttribute('aria-hidden','true');icon.textContent='zoom_in';
 label.replaceChildren(desktop,icon);
}
function positionZoom(){
 if(!zoomBox)return;
 if(narrow.matches){if(zoomBox.parentElement!==stage)stage.appendChild(zoomBox)}
 else if(zoomBox.parentElement!==toolbar)toolbar.insertBefore(zoomBox,$('status'));
}
function progress(range){
 const min=Number(range.min)||0,max=Number(range.max)||100,v=Number(range.value);
 range.style.setProperty('--modern-progress',(max>min?(v-min)/(max-min)*100:0)+'%');
}
function trackThumb(range,host){
 if(!range||!host)return;
 range.addEventListener('pointerdown',()=>{
  host.classList.add('is-thumb-engaged','is-adjusting');
 });
 const stop=()=>host.classList.remove('is-thumb-engaged','is-adjusting');
 window.addEventListener('pointerup',stop);window.addEventListener('pointercancel',stop);
 range.addEventListener('blur',stop);range.addEventListener('input',()=>progress(range));
 progress(range);
}
trackThumb(zoom,zoomBox);
trackThumb(size,sizeField);
const dots=$('dots');
if(dots)trackThumb(dots,dots.closest('.control-field'));
function updateHeight(){
 if(!narrow.matches){shell.style.height='';return}
 const current=main.dataset.mobileTab==='controls'?panel:preview;
 shell.style.height=current.offsetHeight+'px';
}
function selectTab(name){
 main.dataset.mobileTab=name;
 buttons.forEach(b=>{
  const selected=b.dataset.tab===name;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;
 });
 if(narrow.matches){preview.inert=name!=='preview';panel.inert=name!=='controls'}
 else{preview.inert=false;panel.inert=false}
 requestAnimationFrame(updateHeight);
}
buttons.forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.tab)));
function handleBreakpoint(){positionZoom();selectTab(main.dataset.mobileTab||'preview')}
narrow.addEventListener('change',handleBreakpoint);
window.addEventListener('resize',()=>{updateHeight();progress(zoom);});
if(typeof ResizeObserver!=='undefined'){
 const observer=new ResizeObserver(updateHeight);observer.observe(preview);observer.observe(panel);
}
handleBreakpoint();
// Inline preview editor: separate markup, same authoritative product state.
const clone=textPanel.cloneNode(true);
clone.removeAttribute('aria-label');clone.classList.add('modern-mirror-card');
clone.querySelectorAll('[id]').forEach(n=>n.id+='Mobile');
clone.querySelectorAll('[for]').forEach(n=>n.setAttribute('for',n.getAttribute('for')+'Mobile'));
clone.querySelectorAll('[aria-controls]').forEach(n=>n.setAttribute('aria-controls',n.getAttribute('aria-controls')+'Mobile'));
const host=document.createElement('div');
host.className='editor-panel modern-preview-text-editor';
host.setAttribute('aria-label','Editar textos desde Vista previa');
host.append(clone);preview.insertBefore(host,preview.querySelector('.preview-actions'));
const mirrorId=id=>$(id+'Mobile');
const mirrorToggle=clone.querySelector('.modern-toggle');
const mirrorBody=clone.querySelector('.modern-body');
mirrorToggle?.addEventListener('click',()=>{
 const expanded=mirrorToggle.getAttribute('aria-expanded')!=='true';
 mirrorToggle.setAttribute('aria-expanded',String(expanded));mirrorBody.hidden=!expanded;
 requestAnimationFrame(updateHeight);
});
function syncMirror(){
 if(!host.isConnected)return;
 const ids=['headline','size',...(isCronica?[]:['quote','enableQuote'])];
 for(const id of ids){
  const source=$(id),mirror=mirrorId(id);
  if(!source||!mirror)continue;
  if(source.type==='checkbox')mirror.checked=source.checked;
  else if(document.activeElement!==mirror&&mirror.value!==source.value)mirror.value=source.value;
 }
 const textValue=$('sizeLabel')?.textContent;
 if(mirrorId('sizeLabel'))mirrorId('sizeLabel').textContent=textValue||size.value;
 if(mirrorId('quote'))mirrorId('quote').hidden=$('quote').hidden;
 for(const id of ['formatUppercase','alignLeft','alignCenter']){
  const source=$(id),mirror=mirrorId(id);
  if(source&&mirror)mirror.setAttribute('aria-pressed',source.getAttribute('aria-pressed'));
 }
 if(mirrorId('headline'))mirrorId('headline').classList.toggle('uppercase-preview',headline.classList.contains('uppercase-preview'));
 progress(size);if(mirrorId('size'))progress(mirrorId('size'));
 progress(zoom);if(dots)progress(dots);
}
for(const id of ['headline','size','quote','enableQuote']){
 const source=$(id),mirror=mirrorId(id);if(!source||!mirror)continue;
 mirror.addEventListener(source.type==='checkbox'?'change':'input',()=>{
  if(source.type==='checkbox')source.checked=mirror.checked;else source.value=mirror.value;
  source.dispatchEvent(new Event(source.type==='checkbox'?'change':'input',{bubbles:true}));
  syncMirror();
 });
}
for(const id of ['alignLeft','alignCenter','formatUppercase']){
 const mirror=mirrorId(id),source=$(id);if(!mirror||!source)continue;
 mirror.addEventListener('click',()=>{source.click();syncMirror()});
}
const mirrorHeadline=mirrorId('headline');
for(const [id,marker] of [['formatAccent','*'],['formatItalic','_'],['formatStrike','~'],['formatClear',null]]){
 const btn=mirrorId(id);if(!btn||!mirrorHeadline)continue;
 btn.addEventListener('pointerdown',e=>e.preventDefault());
 btn.addEventListener('click',()=>{
  let a=mirrorHeadline.selectionStart,b=mirrorHeadline.selectionEnd;
  if(a===b){mirrorHeadline.focus();return}
  const selection=mirrorHeadline.value.slice(a,b);
  const replacement=marker?marker+selection+marker:selection.replace(/[\*_~]/g,'');
  mirrorHeadline.setRangeText(replacement,a,b,'select');
  headline.value=mirrorHeadline.value;headline.dispatchEvent(new Event('input',{bubbles:true}));
  mirrorHeadline.focus({preventScroll:true});syncMirror();
 });
}
if(mirrorId('size'))trackThumb(mirrorId('size'),mirrorId('size').closest('.modern-size-field'));
// Tooltips within the mirrored module use their own cloned nodes.
clone.querySelectorAll('.help-trigger').forEach(t=>{
 const b=t.querySelector('.help-button');if(!b)return;
 b.addEventListener('click',e=>{e.stopPropagation();const open=!t.classList.contains('is-open');
  t.classList.toggle('is-open',open);b.setAttribute('aria-expanded',String(open))});
});
function syncAfterRender(){syncMirror();updateHeight()}
window.addEventListener('modern:render',syncAfterRender);
document.addEventListener('click',()=>requestAnimationFrame(syncAfterRender));
syncMirror();
// Tap on headline area, never on scroll or long-press; native click opens keyboard.
let tap=null,allowClick=false;
canvas.addEventListener('pointerdown',e=>{
 if(!narrow.matches||main.dataset.mobileTab!=='preview'||e.isPrimary===false)return;
 const rect=canvas.getBoundingClientRect();
 const y=(e.clientY-rect.top)/rect.height;
 const photo=parseFloat(stage.style.getPropertyValue('--photo-height'))||60;
 if(y<photo/100)return;
 allowClick=false;tap={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};
});
canvas.addEventListener('pointermove',e=>{
 if(tap&&e.pointerId===tap.id&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>9)tap=null;
});
canvas.addEventListener('pointerup',e=>{
 allowClick=Boolean(tap&&tap.id===e.pointerId&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<9
  &&performance.now()-tap.time<550);
 tap=null;
});
canvas.addEventListener('pointercancel',()=>{tap=null;allowClick=false});
canvas.addEventListener('click',e=>{
 if(!allowClick||!narrow.matches||main.dataset.mobileTab!=='preview')return;
 allowClick=false;e.preventDefault();
 if(mirrorBody.hidden){mirrorToggle.setAttribute('aria-expanded','true');mirrorBody.hidden=false;updateHeight()}
 syncMirror();
 mirrorHeadline.focus();mirrorHeadline.select();
});
})();
