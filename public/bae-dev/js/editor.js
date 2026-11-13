
(function(){
'use strict';
const CIRCLE_SIZE=320,CIRCLE_MARGIN=80,CIRCLE_STROKE=12;
const newCirclePhoto=()=>({enabled:false,image:null,x:380,y:80,positioned:false,color:'white',zoom:1,offsetX:0,offsetY:0});
let circlePhoto=newCirclePhoto(),circleHit=null,circlePreviewCanvas=null,circleControls=[],circleEditing=false,circlePhotoClickTimer=null;
function circlePhotoGeometry(state,bottom){
 const fits=bottom>=CIRCLE_SIZE+CIRCLE_MARGIN*2;
 const x=Math.max(CIRCLE_MARGIN,Math.min(W-CIRCLE_MARGIN-CIRCLE_SIZE,state.x));
 const y=Math.max(CIRCLE_MARGIN,Math.min(bottom-CIRCLE_MARGIN-CIRCLE_SIZE,state.y));
 return {x,y,fits};
}
function circlePhotoRotation(x){
 const left=CIRCLE_MARGIN,right=W-CIRCLE_MARGIN-CIRCLE_SIZE;
 return (Math.max(left,Math.min(right,x))-left)/(right-left)*20-10;
}
function circlePhotoReframeDelta(dx,dy,x){
 const angle=circlePhotoRotation(x)*Math.PI/180;
 return {x:dx*Math.cos(angle)+dy*Math.sin(angle),y:-dx*Math.sin(angle)+dy*Math.cos(angle)};
}
function circlePhotoAllowed(){return !pageBlank&&['dark','white','red'].includes(el('theme').value)}

function circlePhotoCrop(photo,state){
 const scale=Math.max(CIRCLE_SIZE/photo.naturalWidth,CIRCLE_SIZE/photo.naturalHeight)*(state.zoom||1);
 const width=photo.naturalWidth*scale,height=photo.naturalHeight*scale;
 return {width,height,x:Math.max(-(width-CIRCLE_SIZE)/2,Math.min((width-CIRCLE_SIZE)/2,state.offsetX||0)),
  y:Math.max(-(height-CIRCLE_SIZE)/2,Math.min((height-CIRCLE_SIZE)/2,state.offsetY||0))};
}
function setCircleEditing(active){
 clearTimeout(circlePhotoClickTimer);
 circleEditing=Boolean(active&&circlePhoto.image?.complete&&circlePhoto.image.naturalWidth&&circlePhotoAllowed()&&circlePhoto.enabled);
 syncPhotoZoom();render();
}
function initializeCirclePhotoPosition(state,bottom){
 if(state.positioned!==false||bottom<CIRCLE_SIZE+CIRCLE_MARGIN*2)return;
 state.x=(W-CIRCLE_SIZE)/2;
 state.y=bottom-CIRCLE_MARGIN-CIRCLE_SIZE;
 state.positioned=true;
}
function drawCirclePhoto(includeHover,paint=ctx){
 if(!circlePhotoAllowed()||!circlePhoto.enabled)return;
 initializeCirclePhotoPosition(circlePhoto,photoBottom);
 const geometry=circlePhotoGeometry(circlePhoto,photoBottom);
 if(!geometry.fits)return;
 circlePhoto.x=geometry.x;circlePhoto.y=geometry.y;
 const photo=circlePhoto.image,ready=photo?.complete&&photo.naturalWidth>0;
 if(!ready&&!includeHover)return;
 const cx=geometry.x+CIRCLE_SIZE/2,cy=geometry.y+CIRCLE_SIZE/2,r=(CIRCLE_SIZE-CIRCLE_STROKE)/2;
 paint.save();paint.beginPath();paint.arc(cx,cy,r,0,Math.PI*2);paint.clip();
 paint.fillStyle='#808791';paint.fillRect(geometry.x,geometry.y,CIRCLE_SIZE,CIRCLE_SIZE);
 if(ready){
  const crop=circlePhotoCrop(photo,circlePhoto);
  circlePhoto.offsetX=crop.x;circlePhoto.offsetY=crop.y;
  paint.translate(cx,cy);
  paint.rotate(circlePhotoRotation(geometry.x)*Math.PI/180);
  paint.drawImage(photo,-crop.width/2+crop.x,-crop.height/2+crop.y,crop.width,crop.height);
 }
 paint.restore();
 paint.save();paint.beginPath();paint.arc(cx,cy,r,0,Math.PI*2);
 paint.strokeStyle=circlePhoto.color==='brand'?'#D82626':'#fff';paint.lineWidth=CIRCLE_STROKE;paint.stroke();paint.restore();
}
function syncCirclePhotoUI(){
 const allowed=circlePhotoAllowed(),geometry=circlePhotoGeometry(circlePhoto,photoBottom);
 if(circleEditing&&(!allowed||!circlePhoto.enabled||!geometry.fits)){circleEditing=false;syncPhotoZoom()}
 for(const ui of circleControls){
  ui.field.hidden=!allowed;
  ui.options.hidden=!circlePhoto.enabled;
  ui.toggle.checked=circlePhoto.enabled;
  for(const button of ui.field.querySelectorAll('[data-circle-color]'))button.setAttribute('aria-pressed',String(button.dataset.circleColor===circlePhoto.color));
  ui.upload.textContent=circlePhoto.image?'Cambiar':'Seleccioná';
  ui.caption.textContent=circlePhoto.image?(circlePhoto.filename||'foto bolita'):'una foto bolita';
  ui.picker.classList.toggle('has-photo',Boolean(circlePhoto.image));
  ui.notice.hidden=!circlePhoto.enabled||geometry.fits;
 }
 if(!circleHit)return;
 circleHit.hidden=!allowed||!circlePhoto.enabled||!geometry.fits;
 if(circleHit.hidden)return;
 circleHit.style.left=geometry.x/W*100+'%';circleHit.style.top=geometry.y/H*100+'%';
 circleHit.style.width=CIRCLE_SIZE/W*100+'%';circleHit.style.height=CIRCLE_SIZE/H*100+'%';
 const icon=circleHit.querySelector('.material-icons');
 if(icon)icon.hidden=Boolean(circlePhoto.image);
 if(circlePreviewCanvas){
  circlePreviewCanvas.width=CIRCLE_SIZE;circlePreviewCanvas.height=CIRCLE_SIZE;
  const paint=circlePreviewCanvas.getContext('2d');
  paint.translate(-geometry.x,-geometry.y);
  drawCirclePhoto(true,paint);
 }
 circleHit.classList.toggle('is-editing',circleEditing);
 circleHit.setAttribute('aria-pressed',String(circleEditing));
 el('photoZoom').setAttribute('aria-label',circleEditing?'Zoom de la foto bolita':'Zoom de la fotografía');
 if(circleEditing)el('status').textContent='Foto bolita · Usá el zoom lateral y arrastrá la imagen para reencuadrar. Hacé clic afuera para terminar.';
 circleHit.setAttribute('aria-label',circlePhoto.image?(circleEditing?'Reencuadrar foto bolita. Hacé clic afuera para terminar.':'Mover foto bolita. Doble clic para reencuadrar y usar el zoom lateral.'):'Cargar foto bolita o arrastrar para moverla');
}
function loadCirclePhoto(file){
 if(!file)return;
 if(!file.type.startsWith('image/')){el('status').textContent='Elegí una imagen para la foto bolita.';return}
 const photo=new Image(),url=URL.createObjectURL(file);
 circleEditing=false;circlePhoto.zoom=1;circlePhoto.offsetX=0;circlePhoto.offsetY=0;
 circlePhoto.filename=file.name;
 circlePhoto.image=photo;
 photo.onload=()=>{URL.revokeObjectURL(url);if(circlePhoto.image===photo)render()};
 photo.onerror=()=>{URL.revokeObjectURL(url);if(circlePhoto.image===photo){circlePhoto.image=null;el('status').textContent='No se pudo cargar la foto bolita.';render()}};
 photo.src=url;render();
}
function installCirclePhoto(){
 function makeControls(host,suffix){
  const field=document.createElement('div');field.className='control-field ds-circle-photo-field';
  const inputId='circlePhotoInput'+suffix,toggleId='circlePhotoEnabled'+suffix;
  field.innerHTML='<label class="switch-row" for="'+toggleId+'"><span class="ds-circle-label">Foto bolita <span class="ds-new-chip">Nuevo</span></span><span class="switch"><input id="'+toggleId+'" type="checkbox" role="switch" data-circle-enabled><span class="switch-track"></span></span></label><div class="ds-circle-photo-options"><div class="ds-circle-upload-row"><div class="ds-photo-picker"><input id="'+inputId+'" type="file" accept="image/*" class="ds-photo-picker-native"><div class="ds-photo-picker-surface"><label for="'+inputId+'" class="ds-photo-picker-clickable"><span class="material-symbols-outlined ds-photo-picker-icon" aria-hidden="true">add_photo_alternate</span><span class="ds-photo-picker-text"><strong class="ds-photo-picker-action">Seleccioná</strong> <span class="ds-photo-picker-caption">una foto bolita</span></span></label></div></div><button type="button" class="ds-circle-color-swatch is-white" data-circle-color="white" aria-label="Anillo blanco" aria-pressed="true" title="Anillo blanco"><span class="material-icons" aria-hidden="true">check</span></button><button type="button" class="ds-circle-color-swatch is-brand" data-circle-color="brand" aria-label="Anillo rojo" aria-pressed="false" title="Anillo rojo"><span class="material-icons" aria-hidden="true">check</span></button></div><p class="hint ds-circle-notice" hidden>No hay espacio suficiente para la foto bolita y sus márgenes de 80 px. Reducí el texto o su tamaño.</p></div>';
  const options=field.querySelector('.ds-circle-photo-options'),picker=field.querySelector('.ds-photo-picker'),
   upload=field.querySelector('.ds-photo-picker-action'),caption=field.querySelector('.ds-photo-picker-caption'),
   input=field.querySelector('input[type=file]'),toggle=field.querySelector('[data-circle-enabled]'),notice=field.querySelector('.ds-circle-notice');
  input.addEventListener('change',()=>{loadCirclePhoto(input.files[0]);input.value=''});
  toggle.addEventListener('change',()=>{circlePhoto.enabled=toggle.checked;render()});
  field.addEventListener('click',event=>{
   const button=event.target.closest('[data-circle-color]');
   if(!button)return;
   circlePhoto.color=button.dataset.circleColor;render();
  });
  picker.addEventListener('dragover',event=>{event.preventDefault();picker.classList.add('is-drag-over')});
  picker.addEventListener('dragleave',event=>{if(!picker.contains(event.relatedTarget))picker.classList.remove('is-drag-over')});
  picker.addEventListener('drop',event=>{
   event.preventDefault();event.stopPropagation();picker.classList.remove('is-drag-over');
   loadCirclePhoto([...event.dataTransfer.files].find(file=>file.type.startsWith('image/')));
  });
  host.append(field);circleControls.push({field,options,upload,caption,picker,toggle,notice,input});
 }
 const host=document.querySelector('main .editor-panel .modern-photo-group>.modern-body');
 if(host)makeControls(host,'Main');
 circleHit=document.createElement('button');circleHit.type='button';circleHit.className='ds-circle-photo-hit';circleHit.hidden=true;
 circlePreviewCanvas=document.createElement('canvas');circlePreviewCanvas.className='ds-circle-preview-canvas';circlePreviewCanvas.setAttribute('aria-hidden','true');
 const placeholderIcon=document.createElement('span');placeholderIcon.className='material-icons';placeholderIcon.textContent='add_photo_alternate';placeholderIcon.setAttribute('aria-hidden','true');
 circleHit.append(circlePreviewCanvas,placeholderIcon);
 el('photoStage').append(circleHit);
 let drag=null,suppressClick=false,lastTouchTap=0;
 circleHit.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType!=='touch')return;
  event.preventDefault();event.stopPropagation();suppressClick=false;clearTimeout(circlePhotoClickTimer);
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:circleEditing?circlePhoto.offsetX:circlePhoto.x,startY:circleEditing?circlePhoto.offsetY:circlePhoto.y,crop:circleEditing,moved:false};
  circleHit.setPointerCapture(event.pointerId);
 });
 circleHit.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  event.preventDefault();event.stopPropagation();
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<4)return;
  drag.moved=true;const scale=W/el('art').getBoundingClientRect().width;
  if(drag.crop){
   const delta=circlePhotoReframeDelta(dx*scale,dy*scale,circlePhoto.x);
   circlePhoto.offsetX=drag.startX+delta.x;circlePhoto.offsetY=drag.startY+delta.y;
  }else{
   const next=circlePhotoGeometry({x:drag.startX+dx*scale,y:drag.startY+dy*scale},photoBottom);
   circlePhoto.x=next.x;circlePhoto.y=next.y;
  }
  render();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])circleHit.addEventListener(type,event=>{
  event.stopPropagation();if(!drag||drag.id!==event.pointerId)return;
  suppressClick=drag.moved||type!=='pointerup';
  if(type==='pointerup'&&!drag.moved&&event.pointerType==='touch'&&circlePhoto.image){
   const now=performance.now();
   if(lastTouchTap&&now-lastTouchTap<350){setCircleEditing(true);lastTouchTap=0}else lastTouchTap=now;
  }else if(drag.moved)lastTouchTap=0;
  drag=null;
 });
 circleHit.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  if(suppressClick){suppressClick=false;return}
  if(!circlePhoto.image)circleControls[0]?.input.click();
  else if(!circleEditing){
   clearTimeout(circlePhotoClickTimer);
   const selectedPhoto=circlePhoto.image;
   if(event.detail<2)circlePhotoClickTimer=setTimeout(()=>{
    if(!circleEditing&&circlePhoto.image===selectedPhoto&&circlePhoto.enabled&&circlePhotoAllowed())circleControls[0]?.input.click();
   },350);
  }
 });
 circleHit.addEventListener('dblclick',event=>{
  event.preventDefault();event.stopPropagation();setCircleEditing(true);
 });
 document.addEventListener('pointerdown',event=>{
  if(circleHit.contains(event.target)||el('photoZoom').closest('.preview-zoom')?.contains(event.target))return;
  clearTimeout(circlePhotoClickTimer);
  if(circleEditing)setCircleEditing(false);
 },true);
 document.addEventListener('keydown',event=>{if(circleEditing&&event.key==='Escape'){event.preventDefault();setCircleEditing(false)}});
 circleHit.addEventListener('keydown',event=>{
  const deltas={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]},delta=deltas[event.key];
  if(!delta)return;event.preventDefault();event.stopPropagation();
  if(circleEditing){const local=circlePhotoReframeDelta(delta[0],delta[1],circlePhoto.x);circlePhoto.offsetX+=local.x;circlePhoto.offsetY+=local.y}
  else{const next=circlePhotoGeometry({x:circlePhoto.x+delta[0],y:circlePhoto.y+delta[1]},photoBottom);circlePhoto.x=next.x;circlePhoto.y=next.y}
  render();
 });
 syncCirclePhotoUI();
}

function syncPhotoZoom(){
 const current=circleEditing?circlePhoto.zoom:zoom,slider=el('photoZoom');
 slider.value=Math.round(current*100);el('zoomLabel').textContent=Math.round(current*100)+' %';
 const min=Number(slider.min),max=Number(slider.max);
 slider.style.setProperty('--modern-progress',((Number(slider.value)-min)/(max-min)*100)+'%');
}

const el=id=>document.getElementById(id),canvas=el('art'),ctx=canvas.getContext('2d'),W=1080,H=1440;
const DIVIDER_HEIGHT=24;
let halftone=null;const halftoneLayer=document.createElement('canvas');halftoneLayer.width=1080;halftoneLayer.height=1236;const halftoneCtx=halftoneLayer.getContext('2d');let importingArticle=false;let selectedTexture='1';const halftoneAssets={};function loadTexture(id,path){const asset=new Image();asset.onload=()=>{halftoneAssets[id]=asset;if(selectedTexture===id){halftone=asset;render()}};asset.onerror=()=>console.error('No se pudo cargar '+path);asset.src=path}loadTexture('1','../bae/halftone-2.svg?v=1');loadTexture('2','./textures/punteado-grises-ajustados.svg?v=1');let textAlignment='left';let image=null,zoom=1,offsetX=0,offsetY=0,dragging=false,lastX=0,lastY=0,photoBottom=820;
const LOGO_MARGIN=80,LOGO_WIDTH=123.75*1.15,LOGO_HEIGHT=LOGO_WIDTH*192/358;
let selectedLogo='primary',logoPosition='right',footerStyle='center',pageBlank=false;
document.addEventListener('editorial:footer-style',event=>{footerStyle=event.detail.style;render()});
const logoImages={},logoSources={primary:'./logos/primario.svg',white:'./logos/blanco.svg'};
for(const [key,src] of Object.entries(logoSources)){
 const img=new Image();logoImages[key]=img;
 img.onload=()=>render();
 img.onerror=()=>console.error('No se pudo cargar el logo de BAE:',src);
 img.src=src;
}
function drawBrandLogo(){
 if(selectedLogo==='none')return;
 const img=logoImages[selectedLogo];
 if(!img||!img.complete||!img.naturalWidth)return;
 ctx.drawImage(img,logoPosition==='left'?LOGO_MARGIN:W-LOGO_MARGIN-LOGO_WIDTH,LOGO_MARGIN,LOGO_WIDTH,LOGO_HEIGHT);
}
function syncLogoChoices(){
 document.querySelectorAll('.logo-choice').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.logo===selectedLogo)));
}
document.querySelectorAll('.logo-choice').forEach(button=>button.addEventListener('click',()=>{
 selectedLogo=button.dataset.logo;syncLogoChoices();render();
}));
syncLogoChoices();
function syncLogoPosition(){
 document.querySelectorAll('[data-logo-position]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.logoPosition===logoPosition)));
}
document.querySelectorAll('[data-logo-position]').forEach(button=>button.addEventListener('click',()=>{
 logoPosition=button.dataset.logoPosition;syncLogoPosition();render();
}));
syncLogoPosition();
const palette={dark:{bg:'#171717',text:'#fff',accent:'#D82626'},white:{bg:'#fff',text:'#171717',accent:'#D82626'},red:{bg:'#D82626',text:'#fff',accent:'#fff'}};
function parseRich(text){const out=[];let style={accent:false,italic:false,strike:false},buffer='';const flush=()=>{if(buffer){out.push({text:buffer,...style});buffer=''}};for(const c of String(text)){const field=c==='*'?'accent':c==='_'?'italic':c==='~'?'strike':null;if(field){flush();style={...style,[field]:!style[field]}}else buffer+=c}flush();return out}
function wrapRich(text,size,quote=false){const result=[];for(const paragraph of String(text).split('\n')){const spans=quote?[{text:paragraph,italic:true,accent:false,strike:false}]:parseRich(paragraph);let line=[],width=0;for(const span of spans){for(const part of span.text.match(/\S+|\s+/g)||[]){const font=(span.italic?'italic ':'')+size+'px "DM Serif Display",Georgia,serif';ctx.font=font;const partWidth=ctx.measureText(part).width;if(width+partWidth>920&&width>0&&part.trim()){result.push({parts:line,quote});line=[];width=0}if(!line.length&&!part.trim())continue;line.push({...span,text:part,width:partWidth});width+=partWidth}}if(line.length)result.push({parts:line,quote})}return result}
function render(includeHover=true){
try{
 if(pageBlank){ctx.clearRect(0,0,W,H);ctx.fillStyle='#aeb4bc';ctx.fillRect(0,0,W,H);photoBottom=H;updatePhotoStage();return;}
const colors=palette[el('theme').value]||palette.dark,size=Number(el('size').value),lineHeight=Math.round(size*1.12*0.8*1.10),main=wrapRich(document.getElementById('formatUppercase')?.getAttribute('aria-pressed')==='true'?el('headline').value.toLocaleUpperCase('es-AR'):el('headline').value,size),quotes=el('enableQuote').checked?wrapRich(el('quote').value,size,true):[];
// Coordenadas en píxeles reales del PNG (1080 × 1440), no píxeles CSS.
// Piso de la firma exactamente a 80 px del borde inferior.
ctx.textBaseline='alphabetic';
ctx.font='30px Arial';
const footerMetrics=ctx.measureText('baenegocios.com');
const footerAscent=footerMetrics.actualBoundingBoxAscent||29;
const footerDescent=footerMetrics.actualBoundingBoxDescent||0;
const footerBaseline=H-80-footerDescent;
const footerTop=footerBaseline-footerAscent;
// Construir las líneas en orden visual y posicionarlas desde abajo.
const lines=[...main,...quotes];
const lineMetrics=lines.map(line=>{
 ctx.font=(line.quote?'italic ':'')+size+'px "DM Serif Display",Georgia,serif';
 const m=ctx.measureText(line.parts.map(p=>p.text).join('')||' ');
 return {ascent:m.actualBoundingBoxAscent||size,descent:m.actualBoundingBoxDescent||Math.ceil(size*.2)};
});
const baselines=new Array(lines.length);
if(lines.length){
 const last=lines.length-1;
 baselines[last]=footerTop-50-lineMetrics[last].descent;
 for(let i=last-1;i>=0;i--){
  const groupGap=!lines[i].quote&&lines[i+1].quote?20:0;
  baselines[i]=baselines[i+1]-lineHeight-groupGap;
 }
}
const firstBaseline=baselines[0]??footerTop-50;
const firstAscent=lineMetrics[0]?.ascent??size;
const boxTop=Math.max(80,firstBaseline-firstAscent-50);
photoBottom=boxTop-DIVIDER_HEIGHT;
ctx.clearRect(0,0,W,H);
ctx.fillStyle='#aeb4bc';ctx.fillRect(0,0,W,photoBottom);
if(image){
const base=Math.max(W/image.width,photoBottom/image.height),scale=base*zoom,iw=image.width*scale,ih=image.height*scale;
const maxX=Math.max(0,(iw-W)/2),maxY=Math.max(0,(ih-photoBottom)/2);
offsetX=Math.max(-maxX,Math.min(maxX,offsetX));offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
ctx.save();ctx.beginPath();ctx.rect(0,0,W,photoBottom);ctx.clip();ctx.drawImage(image,(W-iw)/2+offsetX,(photoBottom-ih)/2+offsetY,iw,ih);ctx.restore();
} // El aviso de carga es HTML interactivo, no forma parte del PNG.
drawCirclePhoto(includeHover);
drawBrandLogo();
ctx.fillStyle=colors.bg;ctx.fillRect(0,boxTop,W,H-boxTop);
ctx.save();ctx.beginPath();ctx.rect(0,boxTop,W,H-boxTop);ctx.clip();
ctx.globalAlpha=Number(el('dots').value)/100;if(halftone){
 if(selectedTexture==='2'){
  // Zoom 200 % del SVG original, reducción del 50 % respecto al tamaño anterior (400 %).
  // Renderizar directamente el vector evita ampliar píxeles de un canvas intermedio.
  const scale=2,drawW=1080*scale;
  const previousFilter=ctx.filter;
  ctx.filter=el('theme').value==='white'?'none':'invert(1)';
  // Equivalente al recorte original con origen en 115: anclado a boxTop.
  ctx.drawImage(halftone,(W-drawW)/2,boxTop-115*scale,drawW,1235.84*scale);
  ctx.filter=previousFilter;
 }else{
  // Textura 1: conservar exactamente el render y el recorte anteriores.
  halftoneCtx.clearRect(0,0,1080,1236);
  halftoneCtx.globalCompositeOperation='source-over';
  halftoneCtx.drawImage(halftone,0,0,1080,1235.84);
  halftoneCtx.globalCompositeOperation='source-in';
  halftoneCtx.fillStyle=el('theme').value==='dark'?'#ffffff':'#000000';
  halftoneCtx.fillRect(0,0,1080,1236);
  halftoneCtx.globalCompositeOperation='source-over';
  ctx.drawImage(halftoneLayer,0,115,1080,1121,0,boxTop,1080,1121);
 }
}ctx.restore();
ctx.fillStyle=el('theme').value==='white'?'#D82626':'#ffffff';ctx.fillRect(0,boxTop-DIVIDER_HEIGHT,W,DIVIDER_HEIGHT);
const centered=textAlignment==='center';
let visibleTextTop=Infinity,visibleTextBottom=-Infinity;
ctx.textAlign=centered?'center':'left';ctx.textBaseline='alphabetic';
for(let i=0;i<lines.length;i++){
 const line=lines[i],total=line.parts.reduce((sum,p)=>sum+p.width,0);
 let x=centered?(W-total)/2:80;
 for(const part of line.parts){
  ctx.font=((line.quote||part.italic)?'italic ':'')+size+'px "DM Serif Display",Georgia,serif';
  ctx.textAlign='left';ctx.fillStyle=(line.quote||part.accent)?colors.accent:colors.text;
  const glyphMetrics=ctx.measureText(part.text);
  if(part.text.trim()){
   visibleTextTop=Math.min(visibleTextTop,baselines[i]-glyphMetrics.actualBoundingBoxAscent);
   visibleTextBottom=Math.max(visibleTextBottom,baselines[i]+glyphMetrics.actualBoundingBoxDescent);
  }
  ctx.fillText(part.text,x,baselines[i]);
  if(part.strike&&!line.quote){const y=baselines[i]-size*.32;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(2,size*.045);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+part.width,y);ctx.stroke()}
  x+=part.width;
 }
}
ctx.fillStyle=colors.text;ctx.font='30px Arial';
ctx.textAlign=footerStyle==='center'?'center':'left';
ctx.fillText('baenegocios.com',footerStyle==='center'?W/2:80,footerBaseline);
if(footerStyle==='carousel'){
 ctx.font='54px "Material Icons"';ctx.textAlign='right';ctx.textBaseline='middle';
 ctx.fillText('arrow_forward',W-80,H-80-16);ctx.textBaseline='alphabetic';
}
ctx.textAlign='left';
// Los rectángulos interactivos siguen los glifos medidos, no la caja de diseño.
const widths=lines.map(line=>line.parts.reduce((sum,p)=>sum+p.width,0));
const minX=centered?Math.min(...widths.map(w=>(W-w)/2)):80;
const maxX=centered?Math.max(...widths.map(w=>(W+w)/2)):Math.max(...widths.map(w=>80+w));
// Conservar el tamaño del recuadro, centrando su altura sobre los glifos reales.
const estimatedTop=(baselines[0]??footerTop)-size*1.05-10;
const estimatedBottom=(baselines.at(-1)??footerTop)+size*.28+10;
const textOffsetY=Number.isFinite(visibleTextTop)&&Number.isFinite(visibleTextBottom)
 ?(visibleTextTop+visibleTextBottom-estimatedTop-estimatedBottom)/2:0;
window.__editorialHotspotBounds={
 // Los márgenes laterales se conservan; solo se corrige el centrado vertical.
 text:{left:Math.max(0,minX-26),right:Math.min(W,maxX+26),
  top:Math.max(0,estimatedTop+textOffsetY),
  bottom:Math.min(H,estimatedBottom+textOffsetY)},
 logo:{left:(logoPosition==='left'?LOGO_MARGIN:W-LOGO_MARGIN-LOGO_WIDTH)-54,top:LOGO_MARGIN-54,
  right:(logoPosition==='left'?LOGO_MARGIN:W-LOGO_MARGIN-LOGO_WIDTH)+LOGO_WIDTH+54,bottom:LOGO_MARGIN+LOGO_HEIGHT+54}
};
const overlay=el('importOverlay');if(overlay){overlay.style.height=(photoBottom/H*100)+'%';}updatePhotoStage();el('dotsLabel').textContent=el('dots').value+'%';el('sizeLabel').textContent=size;el('zoomLabel').textContent=Math.round(zoom*100)+' %';el('photoZoom').value=Math.round(zoom*100);el('status').textContent=boxTop<=80?'Texto demasiado largo: reducí el tamaño.':'Vista previa activa · Arrastrá la foto para reencuadrarla.';
}catch(error){el('status').textContent='Error de vista previa: '+error.message;console.error(error)}
finally{syncPhotoZoom();syncCirclePhotoUI();window.dispatchEvent(new Event('modern:render'))}
}
// Algunos navegadores restauran el valor anterior del slider aunque el HTML diga 5.
function resetDefaultHalftone(){el('dots').value='5';el('dotsLabel').textContent='5%';render()}
resetDefaultHalftone();
window.addEventListener('pageshow',event=>{if(event.persisted)resetDefaultHalftone()});
el('enableQuote').addEventListener('change',()=>{el('quote').hidden=!el('enableQuote').checked;render()});for(const id of ['headline','quote','enableQuote','size','dots'])el(id).addEventListener('input',render);for(const [id,value] of [['alignLeft','left'],['alignCenter','center']])el(id).addEventListener('click',()=>{textAlignment=value;el('alignLeft').setAttribute('aria-pressed',String(value==='left'));el('alignCenter').setAttribute('aria-pressed',String(value==='center'));render()});for(const [id,marker] of [['formatAccent','*'],['formatItalic','_'],['formatStrike','~']]){const button=el(id);button.addEventListener('mousedown',e=>e.preventDefault());button.addEventListener('click',()=>{const field=el('headline'),a=field.selectionStart,b=field.selectionEnd;if(a===b){field.focus();return}const selected=field.value.slice(a,b);field.setRangeText(marker+selected+marker,a,b,'select');field.setSelectionRange(a+1,b+1);field.focus();render()})}

const clearFormatButton=el('formatClear');
clearFormatButton.addEventListener('mousedown',event=>event.preventDefault());
clearFormatButton.addEventListener('click',()=>{
 const field=el('headline'),value=field.value,start=field.selectionStart,end=field.selectionEnd;
 if(start===end){field.focus();return}
 const marks=new Set(['*','_','~']);
 let left=start,right=end;
 while(left>0&&right<value.length&&marks.has(value[left-1])&&value[left-1]===value[right]){left--;right++}
 const cleaned=value.slice(left,right).replace(/[*_~]/g,'');
 field.setRangeText(cleaned,left,right,'select');
 field.setSelectionRange(left,left+cleaned.length);
 field.focus();render();
});
document.querySelectorAll('.texture-option').forEach(button=>button.addEventListener('click',()=>{selectedTexture=button.dataset.texture;halftone=halftoneAssets[selectedTexture]||null;document.querySelectorAll('.texture-option').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()}));
// Selector accesible de variante, sin librerías externas.
const themeSwatches=[...document.querySelectorAll('.theme-swatch')];themeSwatches.forEach(button=>button.addEventListener('click',()=>{el('theme').value=button.dataset.theme;themeSwatches.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));el('theme').dispatchEvent(new Event('change',{bubbles:true}))}));
el('theme').addEventListener('change',render);
function updatePhotoStage(){
 const stage=el('photoStage'),zone=el('photoDropzone');if(!stage||!zone)return;
 stage.style.setProperty('--photo-height',(photoBottom/H*100)+'%');
 const scale=stage.getBoundingClientRect().width/W;
 stage.style.setProperty('--hover-inset',(50*scale)+'px');
 stage.style.setProperty('--hover-radius',(16*scale)+'px');
 zone.hidden=Boolean(image)||importingArticle;
 canvas.style.cursor=image?'grab':'default';
}
window.addEventListener('resize',updatePhotoStage);
function loadPhoto(file){
 if(!file)return;
 if(!file.type.startsWith('image/')){el('status').textContent='Seleccioná un archivo de imagen válido.';return}
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{image=img;zoom=1;offsetX=0;offsetY=0;render();URL.revokeObjectURL(url)};
 img.onerror=()=>{el('status').textContent='No se pudo abrir esta fotografía';URL.revokeObjectURL(url)};
 img.src=url;
}
el('file').addEventListener('change',event=>{loadPhoto(event.target.files[0]);event.target.value=''});
const photoStage=el('photoStage'),photoZone=el('photoDropzone');
photoZone.addEventListener('click',()=>el('file').click());
photoZone.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();el('file').click()}});
function isImageDrag(event){
 const dt=event.dataTransfer;
 return Boolean(dt&&([...dt.types].includes('Files')||[...dt.items||[]].some(item=>item.kind==='file'&&item.type.startsWith('image/'))));
}
function isOverPhoto(event){
 const r=photoStage.getBoundingClientRect();
 return event.clientY>=r.top&&event.clientY<=r.top+r.height*(photoBottom/H);
}
photoStage.addEventListener('dragenter',event=>{
 if(isImageDrag(event)&&isOverPhoto(event)){event.preventDefault();photoStage.classList.add('is-drag-over')}
});
photoStage.addEventListener('dragover',event=>{
 if(isImageDrag(event)&&isOverPhoto(event)){event.preventDefault();event.dataTransfer.dropEffect='copy';photoStage.classList.add('is-drag-over')}
 else photoStage.classList.remove('is-drag-over');
});
photoStage.addEventListener('dragleave',event=>{
 if(!photoStage.contains(event.relatedTarget))photoStage.classList.remove('is-drag-over');
});
photoStage.addEventListener('drop',event=>{
 photoStage.classList.remove('is-drag-over');
 if(!isImageDrag(event)||!isOverPhoto(event))return;
 event.preventDefault();
 loadPhoto([...event.dataTransfer.files].find(file=>file.type.startsWith('image/'))||event.dataTransfer.files[0]);
});
el('photoZoom').addEventListener('input',event=>{if(circleEditing)circlePhoto.zoom=Number(event.target.value)/100;else zoom=Number(event.target.value)/100;render()});
canvas.addEventListener('pointerdown',event=>{if(!image)return;const r=canvas.getBoundingClientRect();if((event.clientY-r.top)*H/r.height>photoBottom)return;dragging=true;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(event.pointerId)});
canvas.addEventListener('pointermove',event=>{if(!dragging)return;const ratio=W/canvas.getBoundingClientRect().width;offsetX+=(event.clientX-lastX)*ratio;offsetY+=(event.clientY-lastY)*ratio;lastX=event.clientX;lastY=event.clientY;render()});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
el('clearAll').addEventListener('click',()=>{
 clearTimeout(circlePhotoClickTimer);circleEditing=false;circlePhoto=newCirclePhoto();
 footerStyle='center';document.querySelectorAll('[data-footer-style]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.footerStyle===footerStyle)));
 el('articleUrl').value='';el('headline').value='';el('quote').value='';el('enableQuote').checked=false;el('quote').hidden=true;el('file').value='';
 selectedTexture='1';halftone=halftoneAssets['1']||null;document.querySelectorAll('.texture-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.texture==='1')));
 el('theme').value='dark';document.querySelectorAll('.theme-swatch').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme==='dark')));
 el('size').value='70';el('dots').value='5';textAlignment='left';
 el('alignLeft').setAttribute('aria-pressed','true');el('alignCenter').setAttribute('aria-pressed','false');
 image=null;zoom=1;offsetX=0;offsetY=0;dragging=false;selectedLogo='primary';logoPosition='right';syncLogoChoices();syncLogoPosition();photoStage.classList.remove('is-drag-over');
 el('importStatus').textContent='Pegá una URL de BAE Negocios.';
 render();
});
el('download').addEventListener('click',()=>{
 const button=el('download');
 button.disabled=true;
 try{
  render(false);
  canvas.toBlob(blob=>{
   render();
   button.disabled=false;
   if(!blob){el('status').textContent='No se pudo generar el PNG. Probá cargar la fotografía manualmente.';return}
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='BAE-posteo.png';document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   el('status').textContent='PNG listo para descargar · 1080 × 1440 px';
  },'image/png');
 }catch(error){
  button.disabled=false;
  console.error('Error al exportar PNG:',error);
  el('status').textContent=error.name==='SecurityError'?'La fotografía importada bloquea la exportación. Volvé a importar la URL o cargá la foto manualmente.':'No se pudo exportar: '+error.message;
 }
});
// Tooltips: ajustar ancho dentro del panel; hover, teclado, toque y Escape.
function sizeHelpTooltips(){
 const panel=document.querySelector('.editor-panel');if(!panel)return;
 const rightLimit=panel.getBoundingClientRect().right-12;
 document.querySelectorAll('.help-trigger').forEach(trigger=>{
  const button=trigger.querySelector('.help-button');
  const space=Math.floor(rightLimit-button.getBoundingClientRect().right-12);
  trigger.style.setProperty('--help-available-width',Math.max(85,space)+'px');
 });
}
window.addEventListener('resize',sizeHelpTooltips);
document.querySelectorAll('.help-trigger').forEach(trigger=>{
 trigger.addEventListener('pointerenter',sizeHelpTooltips);
 trigger.addEventListener('focusin',sizeHelpTooltips);
 const button=trigger.querySelector('.help-button');
 button.addEventListener('click',event=>{
  event.stopPropagation();
  const open=!trigger.classList.contains('is-open');
  document.querySelectorAll('.help-trigger').forEach(other=>{
   other.classList.remove('is-open');other.querySelector('.help-button').setAttribute('aria-expanded','false');
  });
  trigger.classList.toggle('is-open',open);
  button.setAttribute('aria-expanded',String(open));
 });
});
function closeHelpTooltips(){
 document.querySelectorAll('.help-trigger.is-open').forEach(trigger=>{
  trigger.classList.remove('is-open');
  trigger.querySelector('.help-button').setAttribute('aria-expanded','false');
 });
}
document.addEventListener('click',event=>{if(!event.target.closest('.help-trigger'))closeHelpTooltips()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeHelpTooltips()});
sizeHelpTooltips();
/* El aviso sigue el borde derecho real del canvas. Se desplaza hacia
   adentro cuando faltarían menos de 24px al borde de la pantalla. */
function positionBrowserZoomTip(){
 const tip=el('browserZoomTip');
 const stage=el('photoStage');
 if(!tip||!stage||tip.hidden||document.documentElement.clientWidth<=700)return;
 const stageRect=stage.getBoundingClientRect();
 const tipWidth=tip.getBoundingClientRect().width;
 const viewportWidth=document.documentElement.clientWidth;
 // A la derecha de la placa (+24px), hasta que toca el límite de 20px.
 // Al reducir el viewport se superpone a la placa, sin cambiar el layout.
 const left=Math.min(stageRect.right+24,viewportWidth-tipWidth-20);
 const top=stageRect.top+24;
 tip.style.setProperty('--zoom-tip-x',left+'px');
 tip.style.setProperty('--zoom-tip-y',top+'px');
}
let zoomTipPositionFrame=0;
function scheduleBrowserZoomTipPosition(){
 if(zoomTipPositionFrame)return;
 zoomTipPositionFrame=window.requestAnimationFrame(()=>{
  zoomTipPositionFrame=0;
  positionBrowserZoomTip();
 });
}
window.addEventListener('resize',scheduleBrowserZoomTipPosition);
window.addEventListener('scroll',scheduleBrowserZoomTipPosition,{passive:true});
if(typeof ResizeObserver!=='undefined'){
 const zoomTipResizeObserver=new ResizeObserver(scheduleBrowserZoomTipPosition);
 zoomTipResizeObserver.observe(el('photoStage'));
 zoomTipResizeObserver.observe(el('browserZoomTip'));
 zoomTipResizeObserver.observe(el('browserZoomTip').closest('.preview'));
}
el('dismissBrowserZoomTip').addEventListener('click',()=>{el('browserZoomTip').hidden=true;});
scheduleBrowserZoomTipPosition();
window.BAEEditor={
 getPageState(){return {variant:pageBlank?'blank':el('theme').value,theme:el('theme').value,
 headline:el('headline').value,quote:el('quote').value,enableQuote:el('enableQuote').checked,
 size:el('size').value,dots:el('dots').value,alignment:textAlignment,
 uppercase:el('formatUppercase')?.getAttribute('aria-pressed')==='true',
 image,zoom,offsetX,offsetY,selectedLogo,logoPosition,footerStyle,selectedTexture,circlePhoto:{...circlePhoto}};},
 setPageState(s){
  clearTimeout(circlePhotoClickTimer);circleEditing=false;circlePhoto={...newCirclePhoto(),...s.circlePhoto};
  pageBlank=s.variant==='blank';document.documentElement.dataset.editorPlateVariant=s.variant;
  el('theme').value=s.theme||'dark';
  document.querySelectorAll('.theme-swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===s.variant)));
  el('headline').value=s.headline||'';el('quote').value=s.quote||'';
  el('enableQuote').checked=Boolean(s.enableQuote);el('quote').hidden=!s.enableQuote;
  el('size').value=s.size||'70';el('dots').value=s.dots||'5';
  textAlignment=s.alignment||'left';
  el('alignLeft').setAttribute('aria-pressed',String(textAlignment==='left'));
  el('alignCenter').setAttribute('aria-pressed',String(textAlignment==='center'));
  const upper=el('formatUppercase');if(upper){upper.setAttribute('aria-pressed',String(Boolean(s.uppercase)));el('headline').classList.toggle('uppercase-preview',Boolean(s.uppercase))}
  image=s.image||null;zoom=s.zoom||1;offsetX=s.offsetX||0;offsetY=s.offsetY||0;
  selectedLogo=s.selectedLogo||'primary';syncLogoChoices();logoPosition=s.logoPosition||'right';syncLogoPosition();footerStyle=s.footerStyle||'center';
  document.querySelectorAll('[data-footer-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.footerStyle===footerStyle)));
  selectedTexture=s.selectedTexture||'1';halftone=halftoneAssets[selectedTexture]||null;
  document.querySelectorAll('.texture-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.texture===selectedTexture)));
  el('sizeLabel').textContent=el('size').value;el('dotsLabel').textContent=el('dots').value+'%';
  render();el('headline').dispatchEvent(new Event('input',{bubbles:true}));
 },
 setBlank(active){pageBlank=Boolean(active);document.documentElement.dataset.editorPlateVariant=pageBlank?'blank':el('theme').value;render();},
 setImporting(active){importingArticle=active;render()},setImage(img){image=img;zoom=1;offsetX=0;offsetY=0;render()},refresh:render};render();document.fonts.ready.then(render);
document.addEventListener('DOMContentLoaded',()=>{installCirclePhoto();render()},{once:true});
})();