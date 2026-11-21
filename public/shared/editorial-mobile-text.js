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
const scrollRoom=document.createElement('div');scrollRoom.setAttribute('aria-hidden','true');
let centerFrame=0;
function centerHeadline(){
 centerFrame=0;if(sheet.hidden)return;
 const viewport=window.visualViewport;
 const top=viewport?.offsetTop||0;
 const available=Math.max(0,(viewport?.height||innerHeight)-dialog.getBoundingClientRect().height);
 const hit=stage?.querySelector('.modern-text-hit,#dsHeadlineHitButton');
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
 anchors=[];scrollRoom.remove();cancelAnimationFrame(centerFrame);centerFrame=0;
 document.body.style.overflow=oldOverflow;
 if(main)main.inert=oldInert;
 window.scrollTo(0,scrollY);
 if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
 window.dispatchEvent(new Event('resize'));
}
function open(trigger){
 if(!mobile.matches||!sheet.hidden)return;
 returnFocus=trigger.matches('.modern-text-hit,#dsHeadlineHitButton')?trigger:null;
 scrollY=window.scrollY;oldOverflow=document.body.style.overflow;
 for(const [node,host] of [[toolbar,tools],[editor,writing]]){
  const anchor=document.createComment('mobile-text-home');
  node.before(anchor);anchors.push([node,anchor]);host.append(node);
 }
 document.body.append(scrollRoom);
 sheet.hidden=false;fit();
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
window.addEventListener('modern:render',queueCenter);
source.addEventListener('input',queueCenter);
mobile.addEventListener('change',()=>{if(!mobile.matches)close()});
})();
