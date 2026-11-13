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
close.setAttribute('aria-label','Cerrar vista previa');close.textContent='Cerrar';
const frame=document.createElement('div');frame.className='editorial-mobile-preview-frame';
const picture=document.createElement('canvas');picture.setAttribute('role','img');
picture.setAttribute('aria-label','Imagen final de la diapositiva actual');
frame.append(picture);dialog.append(close,frame);document.body.append(dialog);
let oldOverflow='',opening=false;
function fitSize(width,height,availableWidth,availableHeight){
 const scale=Math.min(availableWidth/width,availableHeight/height);
 return {width:width*scale,height:height*scale};
}
function previewLayout(width,height,viewportWidth,viewportHeight,padding){
 const gap=32,buttonHeight=44;
 const availableWidth=Math.max(0,viewportWidth-padding.left-padding.right);
 const availableHeight=Math.max(0,viewportHeight-padding.top-padding.bottom);
 const size=fitSize(width,height,availableWidth,Math.max(0,availableHeight-gap-buttonHeight));
 const top=padding.top+(availableHeight-size.height-gap-buttonHeight)/2;
 return {width:size.width,height:size.height,top,buttonTop:top+size.height+gap,
  centerX:padding.left+availableWidth/2,frameWidth:availableWidth};
}
function fit(){
 if(!dialog.open)return;
 const bounds=dialog.getBoundingClientRect(),style=getComputedStyle(dialog);
 const layout=previewLayout(picture.width,picture.height,bounds.width,bounds.height,{
  top:parseFloat(style.paddingTop)||12,bottom:parseFloat(style.paddingBottom)||12,
  left:parseFloat(style.paddingLeft)||12,right:parseFloat(style.paddingRight)||12
 });
 frame.style.top=layout.top+'px';frame.style.left=(parseFloat(style.paddingLeft)||12)+'px';
 frame.style.width=layout.frameWidth+'px';frame.style.height=layout.height+'px';
 picture.style.width=layout.width+'px';picture.style.height=layout.height+'px';
 close.style.top=layout.buttonTop+'px';close.style.left=layout.centerX+'px';
}
opener.addEventListener('click',async()=>{
 if(!mobile.matches||opening||dialog.open)return;
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