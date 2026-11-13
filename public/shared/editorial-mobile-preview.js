/* Vista previa ampliada compartida por los tres editores DEV. */
(()=>{
'use strict';
const mobile=matchMedia('(max-width:700px)'),source=document.getElementById('art');
const clear=document.getElementById('clearAll'),actions=clear?.closest('.preview-actions');
if(!source||!actions)return;
const opener=document.createElement('button');
opener.type='button';opener.className='secondary clear-button editorial-mobile-preview-button';
opener.title='Vista previa ampliada';opener.setAttribute('aria-label','Abrir vista previa ampliada');
opener.innerHTML='<span class="material-icons" aria-hidden="true">visibility</span>';
actions.insertBefore(opener,clear);
const dialog=document.createElement('dialog');dialog.className='editorial-mobile-preview-dialog';
dialog.setAttribute('aria-label','Vista previa ampliada de la placa');
const close=document.createElement('button');close.type='button';close.className='secondary clear-button editorial-mobile-preview-close';
close.setAttribute('aria-label','Volver al editor');close.textContent='Volver';
const frame=document.createElement('div');frame.className='editorial-mobile-preview-frame';
const picture=document.createElement('canvas');picture.setAttribute('role','img');
picture.setAttribute('aria-label','Imagen final de la diapositiva actual');
frame.append(picture);dialog.append(close,frame);document.body.append(dialog);
let oldOverflow='',opening=false,anchorY=0,anchorHeight=1;
function fitSize(width,height,availableWidth,availableHeight){
 const scale=Math.min(availableWidth/width,availableHeight/height);
 return {width:width*scale,height:height*scale};
}
function backButtonTop(centerY,height,buttonHeight,paddingTop,paddingBottom){
 const maxTop=Math.max(paddingTop,height-paddingBottom-buttonHeight);
 const minTop=Math.min(maxTop,paddingTop+60);
 return Math.max(minTop,Math.min(maxTop,centerY-buttonHeight/2));
}
function fit(){
 if(!dialog.open)return;
 const bounds=dialog.getBoundingClientRect(),style=getComputedStyle(dialog);
 const topPadding=parseFloat(style.paddingTop)||12,bottomPadding=parseFloat(style.paddingBottom)||12;
 const rightPadding=parseFloat(style.paddingRight)||12;
 const top=backButtonTop(anchorY*bounds.height/anchorHeight,bounds.height,44,topPadding,bottomPadding);
 close.style.top=top+'px';
 frame.style.height=Math.max(0,top-topPadding-12)+'px';
 const rect=frame.getBoundingClientRect();
 const size=fitSize(picture.width,picture.height,rect.width,rect.height);
 picture.style.width=size.width+'px';picture.style.height=size.height+'px';
 close.style.right=(rightPadding+Math.max(0,(rect.width-size.width)/2))+'px';
}
opener.addEventListener('click',async()=>{
 if(!mobile.matches||opening||dialog.open)return;
 const origin=opener.getBoundingClientRect();anchorY=origin.top+origin.height/2;anchorHeight=window.innerHeight;
 opening=true;opener.disabled=true;opener.setAttribute('aria-busy','true');
 try{
  if(document.fonts)await document.fonts.ready;
  if(!mobile.matches)return;
  let captured=false,captureError=null;
  window.dispatchEvent(new CustomEvent('editorial:preview-snapshot',{detail:{capture(canvas){
   try{
    picture.width=canvas.width;picture.height=canvas.height;
    picture.getContext('2d').drawImage(canvas,0,0);captured=true;
   }catch(error){captureError=error}
  }}}));
  if(!captured)throw captureError||new Error('No se pudo preparar la vista previa.');
  oldOverflow=document.body.style.overflow;
  dialog.showModal();document.body.style.overflow='hidden';fit();
 }catch(error){
  const status=document.getElementById('status');
  if(status)status.textContent='No se pudo abrir la vista previa: '+error.message;
 }finally{
  opening=false;opener.disabled=false;opener.removeAttribute('aria-busy');
 }
});
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog||event.target===frame)dialog.close()});
dialog.addEventListener('close',()=>{
 document.body.style.overflow=oldOverflow;
 if(mobile.matches)opener.focus({preventScroll:true});
});
window.addEventListener('resize',fit);
mobile.addEventListener('change',()=>{if(!mobile.matches&&dialog.open)dialog.close()});
})();