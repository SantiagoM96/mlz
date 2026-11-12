import { chromium } from '@playwright/test';

const browser=await chromium.launch({headless:true});
const host='http://127.0.0.1:8765';
const tests={
 cronica:{name:'Crónica',first:'Organizá las páginas',steps:7,identity:'Diseño de placas'},
 bae:{name:'BAE',first:'Elegí el diseño de tu placa',steps:8,identity:'Identidad gráfica'}
};
function assert(cond,message){if(!cond)throw Error(message)}
const failures=[];
for(const [brand,config] of Object.entries(tests)){
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const mobile=viewport.width<701;
  const page=await browser.newPage({viewport,acceptDownloads:true});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  try{
   await page.goto(host+'/'+brand+'-dev/?onboarding=off',{waitUntil:'load'});
   await page.waitForSelector('.modern-logo-hit',{timeout:10000});
   await page.waitForTimeout(150);
   assert(await page.locator('.modern-card .modern-section-icon').count()>=(brand==='cronica'?5:5),brand+': falta iconografía');
   assert(await page.locator('aside.editor-panel .modern-design-group').count()===1&&await page.locator('aside.editor-panel .modern-identity-group').count()===0,brand+': diseño no absorbió identidad');
   assert(await page.locator('.modern-photo-group').count()===1,brand+': fotografía no separada');
   if(brand==='bae')assert(await page.locator('.modern-import-group #articleUrl').count()===1,'BAE: falta importar noticia');
   if(brand==='cronica')assert(await page.locator('.carousel-panel').count()===1,'Crónica: falta páginas');
   // Paridad visual: no hay pop-up lateral, el zoom vive junto al Canvas.
   assert(await page.locator('#browserZoomTip').isHidden(),brand+': pop-up de zoom todavía visible');
   assert(await page.locator('#photoStage > .modern-photo-zoom #photoZoom').count()===1,brand+': zoom no está al costado de la placa');
   assert(await page.locator('.modern-import-group').count()===(brand==='bae'?1:0),brand+': módulo importar no corresponde a esta variante');
   if(brand==='bae'){
    assert((await page.locator('.header-brand img').first().getAttribute('src')).includes('bae-negocios-logo-color.svg'),'BAE: header no usa el logo bicolor');
   }
   if(mobile){await page.locator('#modernTabcontrols').click();await page.waitForTimeout(350)}
   // El tooltip debe permanecer junto al icono, sin correrse al borde del panel.
   const tipSource=page.locator('aside.editor-panel .help-trigger:visible').first();
   if(await tipSource.count()){
    const help=tipSource.locator('.help-button'),bubble=tipSource.locator('.help-tooltip');
    await help.hover();
    const rects=await help.evaluate(el=>{
     const tip=el.closest('.help-trigger').querySelector('.help-tooltip');
     const a=el.getBoundingClientRect(),b=tip.getBoundingClientRect();
     return {iconRight:a.right,iconLeft:a.left,bubbleLeft:b.left,bubbleRight:b.right,viewWidth:innerWidth,side:tip.classList.contains('modern-tip-left')};
    });
    assert(rects.bubbleRight<=rects.viewWidth-13&&rects.bubbleLeft>=13,
     brand+': tooltip fuera del viewport '+JSON.stringify(rects));
    assert(rects.side?rects.bubbleRight<rects.iconLeft:rects.bubbleLeft>rects.iconRight,
     brand+': tooltip no está al lado del ítem '+JSON.stringify(rects));
   }
   const card=page.locator('aside.editor-panel > .modern-card').first();
   const toggle=card.locator(':scope > .modern-toggle');
   // La ayuda anterior puede haber desplazado el scroll; medir la cabecera
   // únicamente después de centrarla en el viewport.
   await toggle.scrollIntoViewIfNeeded();
   const original=await toggle.locator('span:nth-child(2)').boundingBox();
   await toggle.click();
   const closed=await toggle.locator('span:nth-child(2)').boundingBox();
   assert(original&&closed&&Math.abs(original.x-closed.x)<0.6&&Math.abs(original.y-closed.y)<0.6,brand+': saltó el texto del acordeón '+JSON.stringify({original,closed}));
   assert(await card.evaluate(el=>el.classList.contains('modern-card-flash')),brand+': falta destello al desplegar');
   await toggle.click();
   const opened=await toggle.locator('span:nth-child(2)').boundingBox();
   assert(opened&&Math.abs(original.x-opened.x)<0.6&&Math.abs(original.y-opened.y)<0.6,brand+': saltó la cabecera al abrir');
   assert(await page.locator('aside.editor-panel').first().evaluate(el=>getComputedStyle(el).backgroundColor)==='rgba(0, 0, 0, 0)',brand+': sigue la caja contenedora exterior');
   // Shift + clic debe afectar TODOS los acordeones visibles de Formato.
   // El clic normal debe continuar alterando un único módulo.
   const allToggles=page.locator('aside.editor-panel > .modern-card:visible > .modern-toggle');
   const allStates=()=>allToggles.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-expanded')));
   const firstToggle=allToggles.first();
   assert((await allStates()).every(x=>x==='true'),brand+': acordeones iniciales no abiertos');
   await firstToggle.click({modifiers:['Shift']});
   assert((await allStates()).every(x=>x==='false'),brand+': Shift + clic no cierra todos');
   const focusAfterShift=await firstToggle.evaluate(node=>({
    focused:document.activeElement===node,focusVisible:node.matches(':focus-visible')
   }));
   assert(!focusAfterShift.focused&&!focusAfterShift.focusVisible,
    brand+': Shift + clic dejó contorno adicional en la cabecera '+JSON.stringify(focusAfterShift));
   const cardPulse=await card.evaluate(el=>({
    animation:getComputedStyle(el).animationName,
    border:getComputedStyle(el).borderTopWidth,
    shadow:getComputedStyle(el).boxShadow
   }));
   assert(cardPulse.animation==='editorial-card-pulse'&&cardPulse.border==='1px'&&
    cardPulse.shadow.includes('0px 0px 0px 2px'),
    brand+': resaltado incorrecto de tarjeta '+JSON.stringify(cardPulse));
   await firstToggle.click({modifiers:['Shift']});
   assert((await allStates()).every(x=>x==='true'),brand+': Shift + clic no abre todos');
   await firstToggle.click();
   const normalStates=await allStates();
   assert(normalStates[0]==='false'&&normalStates.slice(1).every(x=>x==='true'),
    brand+': clic normal afectó más de un módulo');
   await firstToggle.click();
   console.log('PASS '+brand+' '+(mobile?'mobile':'desktop')+': Shift + clic global y clic normal local');
   // El anillo exterior debe replicar exactamente a Diario Show: 2 px
   // de outline con 2 px de offset, borde gris propio de la miniatura.
   const selectedThumb=page.locator('aside.editor-panel .modern-design-group .cronica-variant-option[aria-pressed=true] .cronica-variant-thumbnail, aside.editor-panel .modern-design-group .theme-swatch[aria-pressed=true] .theme-swatch-thumb').first();
   const miniStyle=await selectedThumb.evaluate(el=>{
    const css=getComputedStyle(el);
    return {outlineWidth:css.outlineWidth,outlineOffset:css.outlineOffset,
     outlineColor:css.outlineColor,borderColor:css.borderTopColor};
   });
   const color=brand==='cronica'?'rgb(237, 0, 0)':'rgb(216, 38, 38)';
   assert(miniStyle.outlineWidth==='2px'&&miniStyle.outlineOffset==='2px'&&
    miniStyle.outlineColor===color&&miniStyle.borderColor==='rgb(86, 90, 99)',
    brand+': aro de miniatura distinto a Diario Show '+JSON.stringify(miniStyle));
   if(brand==='cronica'){
    const pageRing=await page.locator('.carousel-pages .carousel-page-thumb[aria-current="page"]').first().evaluate(el=>{
     const css=getComputedStyle(el);
     return {width:css.outlineWidth,offset:css.outlineOffset,border:css.borderTopColor};
    });
    assert(pageRing.width==='2px'&&pageRing.offset==='2px'&&pageRing.border==='rgb(85, 90, 100)',
     'Crónica: aro de Páginas incorrecto '+JSON.stringify(pageRing));
   }
   const identity=page.locator('aside.editor-panel .modern-design-group').first();
   const before=await page.locator('#art').evaluate(c=>c.toDataURL());
   const target=brand==='cronica'?'center':'carousel';
   await identity.locator('[data-footer-style="'+target+'"]').click();
   const after=await page.locator('#art').evaluate(c=>c.toDataURL());
   assert(before!==after,brand+': cambio de firma no redibuja Canvas');
   await identity.locator('[data-footer-style="'+(brand==='cronica'?'carousel':'center')+'"]').click();
   assert(await page.locator('#art').evaluate(c=>c.toDataURL())===before,brand+': no restaura firma original');
   if(mobile){
    await page.locator('#modernTabpreview').click();
    await page.waitForTimeout(350);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   }
   const geometry=await page.evaluate(()=>{
    const stage=document.querySelector('#photoStage').getBoundingClientRect();
    const logo=document.querySelector('.modern-logo-hit').getBoundingClientRect();
    const text=document.querySelector('.modern-text-hit').getBoundingClientRect();
    const [logoBounds,textBounds]=[window.__editorialHotspotBounds?.logo,window.__editorialHotspotBounds?.text];
    const coordinate=(r)=>({x:(r.left-stage.left)/stage.width*1080,y:(r.top-stage.top)/stage.height*1440,
     w:r.width/stage.width*1080,h:r.height/stage.height*1440});
    return {logo:coordinate(logo),text:coordinate(text),logoBounds,textBounds};
   });
   const checkBounds=(actual,expected,name)=>{
    assert(expected&&Math.abs(actual.x-expected.left)<2&&Math.abs(actual.y-expected.top)<2&&
      Math.abs(actual.w-(expected.right-expected.left))<2&&
      Math.abs(actual.h-(expected.bottom-expected.top))<2,brand+': '+name+' no sigue geometría Canvas '+JSON.stringify({actual,expected}));
   };
   checkBounds(geometry.logo,geometry.logoBounds,'logo');
   checkBounds(geometry.text,geometry.textBounds,'titular');
   assert(geometry.text.h<370&&geometry.text.w<1050,brand+': el hotspot cubre toda la caja blanca');
   // Hover y punteado usan el color institucional (no el fucsia global).
   const accent=brand==='cronica'?'rgb(237, 0, 0)':'rgb(216, 38, 38)';
   const selectedCursor=await page.locator('.modern-text-hit').evaluate(node=>{
    const css=getComputedStyle(node);
    return {cursor:css.cursor,borderColor:css.borderTopColor};
   });
   assert(selectedCursor.cursor==='pointer',brand+': cursor del titular no es mano '+JSON.stringify(selectedCursor));
   const hotspot=page.locator('.modern-text-hit');
   await hotspot.hover();
   const hoverStyle=await hotspot.evaluate(node=>{
    const css=getComputedStyle(node);
    return {cursor:css.cursor,borderColor:css.borderTopColor,borderWidth:css.borderTopWidth};
   });
   assert(hoverStyle.cursor==='pointer'&&hoverStyle.borderColor===accent&&hoverStyle.borderWidth==='2px',
    brand+': hover del titular no coincide con la marca '+JSON.stringify(hoverStyle));
   await page.locator('.modern-logo-hit').click();
   assert(await page.locator('.modern-logo-hit').evaluate(el=>el.classList.contains('is-hotspot-selected')),brand+': logo sin selección');
   if(mobile){
    assert(await page.locator('.modern-preview-identity-editor').isVisible()&&await page.locator('.modern-preview-identity-editor .theme-swatches,.modern-preview-identity-editor .cronica-variant-options').count()>0,brand+': no se abre Diseño de placas en mobile');
    assert(await page.locator('.modern-preview-text-editor').isHidden(),brand+': Textos no se oculta');
   }else assert(await identity.evaluate(el=>el.classList.contains('modern-context-target')),brand+': identidad no se resalta en desktop');
   await page.locator('.modern-text-hit').click();
   assert(await page.locator('.modern-text-hit').evaluate(el=>el.classList.contains('is-hotspot-selected')),brand+': titular sin selección');
   if(mobile){
    assert(await page.locator('.modern-preview-text-editor').isVisible(),brand+': no se abre Textos en mobile');
    assert(await page.locator('.modern-preview-identity-editor').isHidden(),brand+': Identidad no se oculta');
   }else assert(await page.locator('.modern-text-card').first().evaluate(el=>el.classList.contains('modern-context-target')),brand+': Textos no se resalta');
   if(mobile){
    // La tarjeta reflejada debe contener TODO el halo, con margen por ambos
    // lados, misma cabecera y cuerpo que el módulo original de Formato.
    const mirrored=page.locator('.modern-preview-text-editor .modern-card');
    const reference=page.locator('aside.editor-panel .modern-text-card').first();
    const actual=await mirrored.evaluate(node=>{
     const card=getComputedStyle(node),rect=node.getBoundingClientRect(),parent=node.parentElement.getBoundingClientRect();
     return {animation:card.animationName,duration:card.animationDuration,
      border:card.borderTopWidth,radius:card.borderTopLeftRadius,shadow:card.boxShadow,
      left:rect.left-parent.left,right:parent.right-rect.right,
      head:getComputedStyle(node.querySelector('.modern-toggle')).backgroundColor,
      body:getComputedStyle(node.querySelector('.modern-body')).backgroundColor};
    });
    const native=await reference.evaluate(node=>({
     head:getComputedStyle(node.querySelector('.modern-toggle')).backgroundColor,
     body:getComputedStyle(node.querySelector('.modern-body')).backgroundColor
    }));
    assert(actual.animation==='editorial-card-pulse'&&actual.duration==='1.05s'&&
     actual.border==='1px'&&actual.radius==='10px'&&
     actual.left>=3&&actual.right>=3&&actual.shadow.includes('0px 0px 0px 2px')&&
     actual.head===native.head&&actual.body===native.body,
     brand+': mobile Textos no coincide con desktop '+JSON.stringify({actual,native}));
    await page.locator('.modern-logo-hit').click();
    const logoCard=page.locator('.modern-preview-identity-editor .modern-card');
    const logoCss=await logoCard.evaluate(node=>{
     const cs=getComputedStyle(node),r=node.getBoundingClientRect(),parent=node.parentElement.getBoundingClientRect();
     return {animation:cs.animationName,duration:cs.animationDuration,
      left:r.left-parent.left,right:parent.right-r.right,
      border:cs.borderTopWidth,shadow:cs.boxShadow,
      background:getComputedStyle(node.querySelector('.modern-body')).backgroundColor};
    });
    assert(logoCss.animation==='editorial-card-pulse'&&logoCss.duration==='1.05s'&&
     logoCss.left>=3&&logoCss.right>=3&&logoCss.border==='1px'&&
     logoCss.shadow.includes('0px 0px 0px 2px')&&logoCss.background===native.body,
     brand+': mobile Diseño de placas está recortado '+JSON.stringify(logoCss));
   }
   // El clic fuera elimina solamente el punteado de la preview.
   await page.locator('header').first().click();
   assert(await page.locator('.modern-logo-hit.is-hotspot-selected,.modern-text-hit.is-hotspot-selected').count()===0,
    brand+': la selección sigue visible después de tocar fuera');
   await page.locator('.modern-logo-hit').click();
   assert(await page.locator('.modern-logo-hit.is-hotspot-selected').count()===1,
    brand+': el logo no se vuelve a seleccionar');
   await page.locator('header').first().click();
   assert(await page.locator('.modern-logo-hit.is-hotspot-selected,.modern-text-hit.is-hotspot-selected').count()===0,
    brand+': el logo sigue resaltado después de tocar fuera');
   assert(errors.length===0,brand+': errores de JavaScript: '+errors.join('; '));
   console.log('PASS '+brand+' '+(mobile?'mobile':'desktop')+': módulos, iconos, firma Canvas, hotspots y contexto');
  }catch(e){failures.push(e.message);console.error('FAIL '+brand+' '+viewport.width+': '+e.stack)}
  finally{await page.close()}
 }
 const tour=await browser.newPage({viewport:{width:1440,height:900}});
 try{
  await tour.goto(host+'/'+brand+'-dev/?onboarding=force',{waitUntil:'load'});
  await tour.locator('#dsOnboardingLayer:not([hidden])').waitFor({timeout:10000});
  const first=await tour.locator('#dsTourTitle').textContent();
  assert(first===config.first,brand+': primer paso incorrecto: '+first);
  for(let n=1;n<=config.steps;n++){
   assert((await tour.locator('#dsTourProgress').textContent())===n+' de '+config.steps,brand+': contador '+n);
   if(n<config.steps)await tour.locator('.ds-tour-next').click();
  }
  assert((await tour.locator('#dsTourTitle').textContent())==='¿Poco espacio?',brand+': modal final incorrecto');
  assert(await tour.locator('.ds-onboarding-layer').evaluate(el=>el.classList.contains('is-whole-screen')),brand+': final no es modal');
  assert(await tour.locator('#dsTourZoomDemo .browser-zoom-demo').count()===1,brand+': sin demo de zoom');
  assert(!(await tour.locator('.ds-tour-highlight').isVisible()),brand+': spotlight visible en modal final');
  await tour.locator('.ds-tour-next').click();
  assert(await tour.locator('#dsOnboardingLayer').isHidden(),brand+': no finaliza onboarding');
  console.log('PASS '+brand+': onboarding '+config.steps+' pasos, modal y demo final');
 }catch(e){failures.push(e.message);console.error('FAIL onboarding '+brand+': '+e.stack)}
 finally{await tour.close()}
}
await browser.close();
if(failures.length){console.error('FAILED '+failures.length+': '+failures.join(' | '));process.exitCode=1}
else console.log('ALL PASSED: Crónica y BAE DEV');
