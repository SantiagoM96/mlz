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
sheet.innerHTML='<div class="editorial-text-preview" aria-label="Vista previa de la placa"></div><section class="editorial-text-dialog" role="dialog" aria-modal="true" aria-labelledby="editorialTextTitle"><header><strong id="editorialTextTitle">Texto principal</strong><button type="button" class="editorial-text-done">Listo</button></header><div class="editorial-text-writing"></div><div class="editorial-text-tools"></div></section>';
document.body.append(sheet);
const dialog=sheet.querySelector('.editorial-text-dialog'),done=sheet.querySelector('button');
const previewArea=sheet.querySelector('.editorial-text-preview');
const stage=document.getElementById('photoStage');
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
 const available=Math.max(0,(viewport?.height||window.innerHeight)-dialog.getBoundingClientRect().height-16);
 const width=Math.max(0,Math.min(sheet.clientWidth-32,available*1080/1440));
 sheet.style.setProperty('--sheet-preview-width',width+'px');
}
function close(){
 if(sheet.hidden)return;
 document.activeElement?.blur();
 sheet.hidden=true;
 for(const [node,anchor] of anchors){anchor.replaceWith(node)}
 anchors=[];document.body.style.overflow=oldOverflow;
 if(main)main.inert=oldInert;
 window.scrollTo(0,scrollY);
 if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 window.dispatchEvent(new Event('resize'));
}
function open(trigger){
 if(!mobile.matches||!sheet.hidden)return;
 returnFocus=trigger.matches('.modern-text-hit,#dsHeadlineHitButton')?trigger:null;
 scrollY=window.scrollY;oldOverflow=document.body.style.overflow;
 for(const [node,host] of [[toolbar,tools],[editor,writing],...(stage?[[stage,previewArea]]:[]) ]){
  const anchor=document.createComment('mobile-text-home');
  node.before(anchor);anchors.push([node,anchor]);host.append(node);
 }
 sheet.hidden=false;document.body.style.overflow='hidden';fit();
 if(main){oldInert=main.inert;main.inert=true}
 // Focus synchronously within the tap so iOS can show its keyboard.
 editor.focus({preventScroll:true});
 const range=document.createRange();range.selectNodeContents(editor);range.collapse(false);
 const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('.modern-text-hit,#dsHeadlineHitButton');
 if(!trigger||!mobile.matches||trigger.hidden||trigger.disabled)return;
 event.preventDefault();event.stopImmediatePropagation();open(trigger);
},true);
// The field remains reachable from Formato and the contextual text card.
document.addEventListener('focusin',event=>{
 if(mobile.matches&&sheet.hidden&&event.target.matches('.cronica-rich-headline'))open(event.target);
});
tools.addEventListener('pointerdown',event=>{
 if(event.target.closest('button'))event.preventDefault();
});
tools.addEventListener('click',()=>{
 editor.focus({preventScroll:true});
});
done.addEventListener('click',close);
sheet.addEventListener('click',event=>{if(event.target===sheet)close()});
sheet.addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();close();return}
 if(event.key!=='Tab')return;
 const focusable=[...dialog.querySelectorAll('button,[contenteditable="true"]')].filter(n=>n.getClientRects().length);
 const first=focusable[0],last=focusable.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});
window.visualViewport?.addEventListener('resize',fit);
window.visualViewport?.addEventListener('scroll',fit);
window.addEventListener('resize',fit);
new ResizeObserver(fit).observe(dialog);
mobile.addEventListener('change',()=>{if(!mobile.matches)close()});
})();
