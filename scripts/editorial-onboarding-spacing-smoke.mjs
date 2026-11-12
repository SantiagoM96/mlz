import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
for(const slug of ['cronica-dev','bae-dev','diarioshow-dev']){
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/'+slug+'/?onboarding=force',{waitUntil:'load'});
 await page.locator('.ds-tour-card:not([hidden])').waitFor({timeout:12000});
 let found=false;
 for(let i=0;i<13;i++){
  const title=await page.locator('#dsTourTitle').textContent();
  if(title?.includes('Abrí o cerrá todos los módulos')){
   found=true;
   const visible=await page.locator('#dsTourShiftDemo').isVisible();
   const image=await page.locator('#dsTourShiftDemo img').evaluate(el=>({
    loaded:el.complete&&el.naturalWidth>0,
    src:el.getAttribute('src'),
    alt:el.getAttribute('alt')
   }));
   if(!visible||!image.loaded||!image.src.endsWith('shift-click-demo.svg'))
    throw Error(slug+': falta imagen Shift '+JSON.stringify({visible,image}));
   console.log('PASS onboarding',slug,'Shift + clic e ilustración cargada');
   break;
  }
  await page.locator('.ds-tour-next').click();
 }
 if(!found)throw Error(slug+': no aparece paso Shift en el onboarding');
 if(errors.length)throw Error(slug+': errores JS '+errors.join(' | '));
 await page.locator('.ds-tour-close').click();
 if(slug!=='diarioshow-dev'){
  const layout=await page.locator('.editor-panel .modern-card .modern-body:not([hidden])').first().evaluate(el=>{
   const s=getComputedStyle(el);
   return {top:s.paddingTop,right:s.paddingRight,bottom:s.paddingBottom,left:s.paddingLeft};
  });
  if(layout.top!=='18px'||layout.bottom!=='18px'||layout.left!=='14px'||layout.right!=='14px')
   throw Error(slug+': padding desktop distinto de Diario Show '+JSON.stringify(layout));
  await page.setViewportSize({width:390,height:844});
  const layoutMobile=await page.locator('.editor-panel .modern-card .modern-body:not([hidden])').first().evaluate(el=>{
   const s=getComputedStyle(el);
   return {top:s.paddingTop,right:s.paddingRight,bottom:s.paddingBottom,left:s.paddingLeft};
  });
  if(layoutMobile.top!=='15px'||layoutMobile.bottom!=='15px'||layoutMobile.left!=='12px'||layoutMobile.right!=='12px')
   throw Error(slug+': padding mobile distinto de Diario Show '+JSON.stringify(layoutMobile));
  console.log('PASS espaciados',slug,'desktop 18/14 mobile 15/12');
 }
 await page.close();
}
await browser.close();
console.log('PASS onboarding y espaciados');
