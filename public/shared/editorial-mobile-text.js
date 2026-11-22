/* Mobile headline sheet: move the live controls, preserving state and listeners. */
(()=>{
'use strict';
const mobile=matchMedia('(max-width:700px)');
const source=document.getElementById('headline');
const editor=source?.parentElement.querySelector('.cronica-rich-headline');
const toolbar=document.getElementById('formatAccent')?.closest('.typography-row');
if(!source||!editor||!toolbar)return;
const sheet=document.createElement('div');
sheet.className='editorial-text-sheet';sheet.hidden=true;
sheet.innerHTML='<section class="editorial-text-dialog" role="dialog" aria-modal="true" aria-labelledby="editorialTextTitle"><header><strong id="editorialTextTitle">Texto principal</strong><button type="button" class="editorial-text-done">Listo</button></header><div class="editorial-text-writing"></div><div class="editorial-text-tools"></div></section>';
document.body.append(sheet);
const dialog=sheet.querySelector('.editorial-text-dialog'),done=sheet.querySelector('button');
const stage=document.getElementById('photoStage');
const canvas=stage.querySelector('canvas');
const headlineSelector='.modern-text-hit,#dsHeadlineHitButton';
const secondary=[
 ['strapText','Volanta'],['quote','Textual'],['quoteAuthor','Autor de la cita'],
].map(([id,label])=>({field:document.getElementById(id),label})).find(item=>item.field);
const secondaryHit=document.createElement('button');
secondaryHit.type='button';
secondaryHit.className='editorial-secondary-text-hit';
secondaryHit.hidden=true;
if(secondary){
 secondaryHit.setAttribute('aria-label','Editar '+secondary.label.toLocaleLowerCase('es-AR'));
 stage.append(secondaryHit);
}
function syncSecondaryHit(){
 if(!secondary)return;
 const bounds=window.__editorialSecondaryTextBounds??window.__editorialHotspotBounds?.secondary;
 const blank=document.documentElement.dataset.editorPlateVariant==='blank';
 secondaryHit.hidden=!mobile.matches||!bounds||blank;
 if(secondaryHit.hidden)return;
 Object.assign(secondaryHit.style,{
  left:Math.max(0,bounds.left-12)/canvas.width*100+'%',
  top:Math.max(0,bounds.top-8)/canvas.height*100+'%',
  width:Math.min(canvas.width,bounds.right-bounds.left+24)/canvas.width*100+'%',
  height:(bounds.bottom-bounds.top+16)/canvas.height*100+'%',
 });
}
const title=sheet.querySelector('#editorialTextTitle');
const sizeRange=document.getElementById('size');
const sizeButtons=document.createElement('div');
sizeButtons.className='editorial-text-size';
sizeButtons.setAttribute('role','group');
sizeButtons.setAttribute('aria-label','Tamaño del texto');
for(const [step,icon,label] of [[-2,'remove','Reducir tamaño'],[2,'add','Aumentar tamaño']]){
 const button=document.createElement('button');
 button.type='button';button.dataset.step=step;button.setAttribute('aria-label',label);
 button.innerHTML='<span class="material-icons" aria-hidden="true">'+icon+'</span>';
 sizeButtons.append(button);
}
let activeEditor=editor;
const alignment=toolbar.querySelector('.align-buttons')?.closest('.control-field');

const scrollRoom=document.createElement('div');scrollRoom.setAttribute('aria-hidden','true');
let centerFrame=0;
function centerHeadline(){
 centerFrame=0;if(sheet.hidden)return;
 const viewport=window.visualViewport;
 const top=viewport?.offsetTop||0;
 const available=Math.max(0,(viewport?.height||innerHeight)-dialog.getBoundingClientRect().height);
 const hit=returnFocus??stage.querySelector(headlineSelector);
 const rect=hit?.getBoundingClientRect();
 const art=stage?.querySelector('canvas')?.getBoundingClientRect();
 if(!art)return;
 const center=rect&&rect.height>0?(rect.top+rect.bottom)/2:art.top+art.height*.8;
 const delta=center-(top+available/2);
 if(Math.abs(delta)>1)window.scrollTo({top:window.scrollY+delta,behavior:'instant'});
}
function queueCenter(){if(!sheet.hidden&&!centerFrame)centerFrame=requestAnimationFrame(centerHeadline)}
dialog.style.setProperty('--text-accent',getComputedStyle(editor).getPropertyValue('--rich-editor-accent').trim()||getComputedStyle(toolbar).getPropertyValue('--editor-accent').trim()||'#ed0000');
const tools=sheet.querySelector('.editorial-text-tools');
const writing=sheet.querySelector('.editorial-text-writing');
const main=document.querySelector('main');
let anchors=[],returnFocus=null,scrollY=0,oldOverflow='',oldInert=false;
function fit(){
 if(sheet.hidden)return;
 const viewport=window.visualViewport;
 sheet.style.top=(viewport?.offsetTop||0)+'px';
 sheet.style.height=(viewport?.height||window.innerHeight)+'px';
 scrollRoom.style.height=(window.innerHeight+dialog.getBoundingClientRect().height)+'px';
 queueCenter();
}
function close(){
 if(sheet.hidden)return;
 document.activeElement?.blur();
 sheet.hidden=true;
 for(const [node,anchor] of anchors){anchor.replaceWith(node)}
 anchors=[];sizeButtons.remove();scrollRoom.remove();cancelAnimationFrame(centerFrame);centerFrame=0;
 document.body.style.overflow=oldOverflow;
 if(main)main.inert=oldInert;
 window.scrollTo(0,scrollY);
 if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 window.dispatchEvent(new Event('resize'));
}
function open(trigger){
 if(!mobile.matches||!sheet.hidden)return;
 const isSecondary=trigger===secondaryHit;
 activeEditor=isSecondary?secondary.field:editor;
 title.textContent=isSecondary?secondary.label:'Texto principal';
 returnFocus=trigger;
 window.dispatchEvent(new Event('editorial:text-editing'));
 scrollY=window.scrollY;oldOverflow=document.body.style.overflow;
 const items=isSecondary?[[activeEditor,writing]]:[[toolbar,tools],[activeEditor,writing]];
 for(const [node,host] of items){
  const anchor=document.createComment('mobile-text-home');
  node.before(anchor);anchors.push([node,anchor]);host.append(node);
 }
 if(isSecondary)tools.append(sizeButtons);
 else if(alignment)alignment.before(sizeButtons);
 else toolbar.append(sizeButtons);
 document.body.append(scrollRoom);
 sheet.hidden=false;fit();
 if(main){oldInert=main.inert;main.inert=true}
 // Focus synchronously within the tap so iOS can show its keyboard.
 activeEditor.focus({preventScroll:true});
 if(isSecondary){
  if(activeEditor.tagName==='TEXTAREA')activeEditor.setSelectionRange(activeEditor.value.length,activeEditor.value.length);
 }else{
  const range=document.createRange();range.selectNodeContents(editor);range.collapse(false);
  const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
 }
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest(headlineSelector+',.editorial-secondary-text-hit');
 if(!trigger||!mobile.matches||trigger.hidden||trigger.disabled)return;
 event.preventDefault();event.stopImmediatePropagation();open(trigger);
},true);
sizeButtons.addEventListener('click',event=>{
 const button=event.target.closest('button[data-step]');
 if(!button)return;
 const step=Number(button.dataset.step);
 if(activeEditor===editor||activeEditor.id==='quote'){
  sizeRange.value=Math.min(Number(sizeRange.max),Math.max(Number(sizeRange.min),sizeRange.valueAsNumber+step));
  sizeRange.dispatchEvent(new Event('input',{bubbles:true}));
 }else{
  const offset=Number(activeEditor.dataset.sizeOffset||0)+step;
  activeEditor.dataset.sizeOffset=Math.min(20,Math.max(-16,offset));
  activeEditor.dispatchEvent(new Event('input',{bubbles:true}));
 }
});
tools.addEventListener('pointerdown',event=>{
 if(event.target.closest('button'))event.preventDefault();
});
tools.addEventListener('click',()=>{
 activeEditor.focus({preventScroll:true});
});
done.addEventListener('click',close);
sheet.addEventListener('click',event=>{if(event.target===sheet)close()});
sheet.addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();close();return}
 if(event.key!=='Tab')return;
 const focusable=[...dialog.querySelectorAll('button,textarea,input:not([type=hidden]),[contenteditable="true"]')].filter(n=>n.getClientRects().length);
 const first=focusable[0],last=focusable.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});
window.visualViewport?.addEventListener('resize',fit);
window.visualViewport?.addEventListener('scroll',fit);
window.addEventListener('resize',fit);
new ResizeObserver(fit).observe(dialog);
window.addEventListener('modern:render',()=>{syncSecondaryHit();queueCenter()});
syncSecondaryHit();
source.addEventListener('input',queueCenter);
mobile.addEventListener('change',()=>{syncSecondaryHit();if(!mobile.matches)close()});
})();
