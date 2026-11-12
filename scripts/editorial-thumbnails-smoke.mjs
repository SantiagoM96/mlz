import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
let failures=[];
const cases=[
 {slug:'cronica-dev',thumb:'.carousel-page-thumb',native:'.carousel-design-copy>.cronica-variant-thumbnail',add:'.carousel-add-placeholder',variants:['cover','internal','blank'],choose:v=>'.cronica-variant-option[data-page-variant="'+v+'"]'},
 {slug:'bae-dev',thumb:'.editor-slide-thumb',native:'.editor-slide-native-option>.theme-swatch-thumb',add:'.editor-slide-add-tile',variants:['dark','white','red','blank'],choose:v=>v==='blank'?'[data-editor-blank]':'.theme-swatch[data-theme="'+v+'"]'},
 {slug:'diarioshow-dev',thumb:'.editor-slide-thumb',native:'.editor-slide-native-option>.ds-variant-preview',add:'.editor-slide-add-tile',variants:['pink','blue','quote','quote-blue','blank'],choose:v=>v==='blank'?'[data-editor-blank]':'.ds-variant-option[data-variant="'+v+'"]'},
];
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
for(const data of cases){
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/'+data.slug+'/?onboarding=off',{waitUntil:'load'});
  await page.locator(data.thumb).first().waitFor({timeout:15000});
  for(const variant of data.variants){
   let control=page.locator(data.choose(variant)).first();
   await control.click();
   await page.waitForFunction(([selector,expected])=>document.querySelector(selector)?.dataset.variant===expected,[data.thumb,variant],{timeout:6000});
   const result=await page.locator(data.thumb).first().evaluate((el,selector)=>{
    const design=el.querySelector(selector),number=el.querySelector('.carousel-page-number,.editor-slide-number');
    const rect=x=>{if(!x)return null;const b=x.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
    return {root:rect(el),design:rect(design),number:rect(number),actual:el.dataset.variant,overflow:getComputedStyle(el).overflow};
   },data.native);
   assert(result.actual===variant,data.slug+' '+variant+': variante desincronizada '+JSON.stringify(result));
   assert(result.design,data.slug+' '+variant+': falta miniatura de diseño '+JSON.stringify(result));
   assert(Math.abs(result.root.w-48)<1&&Math.abs(result.root.h-64)<1,data.slug+' '+variant+': tamaño contenedor '+JSON.stringify(result));
   assert(Math.abs(result.design.w-48)<1&&Math.abs(result.design.h-64)<1,data.slug+' '+variant+': tamaño dibujo '+JSON.stringify(result));
   assert(Math.abs(result.root.x-result.design.x)<1&&Math.abs(result.root.y-result.design.y)<1,data.slug+' '+variant+': dibujo desplazado '+JSON.stringify(result));
   assert(result.number&&Math.abs((result.number.x+result.number.w/2)-(result.root.x+24))<2,data.slug+' '+variant+': numero fuera de eje '+JSON.stringify(result));
   console.log('PASS',data.slug,variant,JSON.stringify(result));
  }
  await page.locator(data.add).click();
  assert(await page.locator(data.thumb).count()===2,data.slug+': agregar diapositiva no crea dos');
  const second=await page.locator(data.thumb).nth(1).getAttribute('data-variant');
  assert(second==='blank',data.slug+': segunda diapositiva no es Sin diseño, es '+second);
  console.log('PASS',data.slug,'añadir Sin diseño');
  // La página sin diseño tiene que tener textos de ejemplo al elegir formato.
  const target=data.slug==='cronica-dev'?'cover':data.slug==='bae-dev'?'dark':'pink';
  await page.locator(data.choose(target)).first().click();
  await page.waitForFunction(([selector,expected])=>document.querySelectorAll(selector)[1]?.dataset.variant===expected,[data.thumb,target],{timeout:6000});
  const sample=await page.locator('#headline').inputValue();
  assert(sample.trim().length>25,data.slug+': nueva página sin titular '+JSON.stringify(sample));
  if(data.slug==='cronica-dev'){
   const strap=await page.locator('#strapText').inputValue();
   assert(strap.trim().length>0&&await page.locator('#showStrap').isChecked(),data.slug+': volanta de ejemplo no activa');
  }
  if(data.slug==='bae-dev'){
   assert(await page.locator('#enableQuote').isChecked()&&(await page.locator('#quote').inputValue()).trim().length>0,data.slug+': textual de ejemplo ausente');
  }
  if(data.slug==='diarioshow-dev'){
   // Las variantes de cita deben activar autor y tener un nombre ficticio.
   await page.locator(data.choose('quote')).first().click();
   await page.waitForFunction(()=>document.querySelectorAll('.editor-slide-thumb')[1]?.dataset.variant==='quote',{timeout:6000});
   const author=await page.locator('#quoteAuthor').inputValue();
   assert((await page.locator('#headline').inputValue()).trim().length>0&&author.trim().length>0&&await page.locator('#showQuoteAuthor').isChecked(),data.slug+': cita/autor de ejemplo ausentes');
  }
  // Lo escrito manualmente no debe reemplazarse al cambiar otra vez de variante.
  const custom='Texto editado para verificar que no se sobrescribe';
  await page.locator('#headline').evaluate((node,value)=>{node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}))},custom);
  const changeTo=data.slug==='cronica-dev'?'internal':data.slug==='bae-dev'?'red':'blue';
  await page.locator(data.choose(changeTo)).first().click();
  await page.waitForFunction(([selector,expected])=>document.querySelectorAll(selector)[1]?.dataset.variant===expected,[data.thumb,changeTo],{timeout:6000});
  assert((await page.locator('#headline').inputValue())===custom,data.slug+': se sobrescribió texto editado al cambiar la plantilla');
  console.log('PASS',data.slug,'textos iniciales y persistencia de edición');
  assert(!errors.length,data.slug+' errores JS '+errors.join(' | '));
 }catch(e){failures.push(e.message);console.error('FAIL',e.message)}
 finally{await page.close()}
}
await browser.close();
if(failures.length){console.error('FAILED',failures);process.exit(1)}
console.log('PASS: todas las miniaturas ocupan el área completa y el número es overlay.');
