import { chromium } from '@playwright/test';

const browser=await chromium.launch({headless:true});
const host='http://127.0.0.1:8765';
const tests={
 cronica:{name:'Crónica',first:'Organizá las páginas',steps:7,identity:'Identidad gráfica'},
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
   assert(await page.locator('aside.editor-panel .modern-identity-group').count()===1,brand+': identidad no separada');
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
    assert(rects.bubbleRight<=rects.viewWidth-15&&rects.bubbleLeft>=15,
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
   const identity=page.locator('aside.editor-panel .modern-identity-group').first();
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
   await page.locator('.modern-logo-hit').click();
   assert(await page.locator('.modern-logo-hit').evaluate(el=>el.classList.contains('is-hotspot-selected')),brand+': logo sin selección');
   if(mobile){
    assert(await page.locator('.modern-preview-identity-editor').isVisible(),brand+': no se abre identidad en mobile');
    assert(await page.locator('.modern-preview-text-editor').isHidden(),brand+': Textos no se oculta');
   }else assert(await identity.evaluate(el=>el.classList.contains('modern-context-target')),brand+': identidad no se resalta en desktop');
   await page.locator('.modern-text-hit').click();
   assert(await page.locator('.modern-text-hit').evaluate(el=>el.classList.contains('is-hotspot-selected')),brand+': titular sin selección');
   if(mobile){
    assert(await page.locator('.modern-preview-text-editor').isVisible(),brand+': no se abre Textos en mobile');
    assert(await page.locator('.modern-preview-identity-editor').isHidden(),brand+': Identidad no se oculta');
   }else assert(await page.locator('.modern-text-card').first().evaluate(el=>el.classList.contains('modern-context-target')),brand+': Textos no se resalta');
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
