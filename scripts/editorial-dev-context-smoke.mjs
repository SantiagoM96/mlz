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
   if(mobile)await page.locator('#modernTabcontrols').click();
   const identity=page.locator('aside.editor-panel .modern-identity-group').first();
   const before=await page.locator('#art').evaluate(c=>c.toDataURL());
   const target=brand==='cronica'?'center':'carousel';
   await identity.locator('[data-footer-style="'+target+'"]').click();
   const after=await page.locator('#art').evaluate(c=>c.toDataURL());
   assert(before!==after,brand+': cambio de firma no redibuja Canvas');
   await identity.locator('[data-footer-style="'+(brand==='cronica'?'carousel':'center')+'"]').click();
   assert(await page.locator('#art').evaluate(c=>c.toDataURL())===before,brand+': no restaura firma original');
   if(mobile)await page.locator('#modernTabpreview').click();
   await page.locator('.modern-logo-hit').click({force:true});
   assert(await page.locator('.modern-logo-hit').evaluate(el=>el.classList.contains('is-hotspot-selected')),brand+': logo sin selección');
   if(mobile){
    assert(await page.locator('.modern-preview-identity-editor').isVisible(),brand+': no se abre identidad en mobile');
    assert(await page.locator('.modern-preview-text-editor').isHidden(),brand+': Textos no se oculta');
   }else assert(await identity.evaluate(el=>el.classList.contains('modern-context-target')),brand+': identidad no se resalta en desktop');
   await page.locator('.modern-text-hit').click({force:true});
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
