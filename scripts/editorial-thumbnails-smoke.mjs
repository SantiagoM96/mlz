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
  if(data.slug==='cronica-dev'){
   const headers=await page.locator('.editor-platform-switcher .editor-platform-option').evaluateAll(nodes=>nodes.map(n=>({href:n.getAttribute('href'),current:n.getAttribute('aria-current'),img:n.querySelector('img')?.getAttribute('src'),loaded:n.querySelector('img')?.naturalWidth>0})));
   assert(headers.length===3&&headers.every(n=>n.loaded)&&headers[0].current==='page'&&headers[1].href==='../diarioshow-dev/'&&headers[2].href==='../bae-dev/', 'Crónica: header de plataformas incorrecto '+JSON.stringify(headers));
   const checkLayout=async()=>page.evaluate(()=>{
    const bar=document.querySelector('.header-inner').getBoundingClientRect();
    const links=[...document.querySelectorAll('.editor-platform-option')].map(n=>n.getBoundingClientRect());
    const back=document.querySelector('.dashboard-back-link').getBoundingClientRect();
    return {barWidth:bar.width,links:links.map(n=>({left:n.left,right:n.right,top:n.top,bottom:n.bottom})),backLeft:back.left,backRight:back.right};
   });
   const visual=await page.locator('.editor-platform-switcher .editor-platform-option').evaluateAll(nodes=>nodes.map(n=>{
    const cs=getComputedStyle(n),img=getComputedStyle(n.querySelector('img'));
    return {filter:cs.filter,background:cs.backgroundColor,border:cs.borderTopWidth,shadow:cs.boxShadow,
      imgFilter:img.filter,active:n.classList.contains('is-active')};
   }));
   assert(visual.length===3&&visual.every(x=>x.background==='rgba(0, 0, 0, 0)'&&x.border==='0px'&&x.shadow==='none'&&x.imgFilter==='none')&&visual[0].filter==='none'&&visual.slice(1).every(x=>x.filter.includes('grayscale(1)')),
    'Crónica: logos no están sueltos o conservan filtros anteriores '+JSON.stringify(visual));
   const desktop=await checkLayout();
   assert(desktop.links.every((x,i)=>i===0||x.left>=desktop.links[i-1].right-2)&&desktop.links[2].right<desktop.backLeft+4, 'Crónica: selector se superpone en desktop '+JSON.stringify(desktop));
   await page.setViewportSize({width:390,height:844});
   const mobile=await checkLayout();
   assert(mobile.links.every((x,i)=>i===0||x.left>=mobile.links[i-1].right-2)&&mobile.links[2].right<mobile.backLeft+4, 'Crónica: selector se superpone en mobile '+JSON.stringify(mobile));
   await page.setViewportSize({width:1440,height:900});
   console.log('PASS cronica-dev selector de plataformas desktop/mobile');
  }
  const initial=await page.locator('#headline').inputValue();
  const expected=data.slug==='cronica-dev'?'espacio cultural':data.slug==='bae-dev'?'nuevas inversiones':'anuncio inesperado';
  assert(initial.includes(expected),data.slug+': el texto de la página inicial sigue viejo: '+JSON.stringify(initial));
  if(data.slug==='cronica-dev'){
   assert((await page.locator('#strapText').inputValue())==='CULTURA EN LA CIUDAD',data.slug+': volanta inicial no actualizada');
  }
  if(data.slug==='bae-dev'){
   assert(await page.locator('#enableQuote').isChecked()&&(await page.locator('#quote').inputValue()).includes('generar más empleo'),data.slug+': textual inicial no actualizado');
  }
  if(data.slug==='diarioshow-dev'){
   assert((await page.locator('#quoteAuthor').inputValue())==='Una artista invitada',data.slug+': autor inicial no actualizado');
  }
  if(data.slug==='cronica-dev'){
   const placement=await page.evaluate(()=>{
    const text=document.querySelector('.editor-panel .modern-text-card');
    const design=document.querySelector('.editor-panel .modern-design-group');
    const switchField=document.getElementById('showStrap')?.closest('.control-field');
    const strapField=document.getElementById('strapText')?.closest('.control-field');
    const headline=document.getElementById('headline')?.closest('.control-field');
    return {switchInDesign:!!design?.contains(switchField),
      strapInText:!!text?.contains(strapField),
      strapBeforeHeadline:!!(strapField&&headline&&
       (strapField.compareDocumentPosition(headline)&Node.DOCUMENT_POSITION_FOLLOWING)),
      mirrorSwitch:!!document.getElementById('showStrapIdentityPreview'),
      mirrorText:!!document.getElementById('strapTextMobile')};
   });
   assert(placement.switchInDesign&&placement.strapInText&&placement.strapBeforeHeadline&&placement.mirrorSwitch&&placement.mirrorText,
    'Crónica: interruptor en Diseño y campo sobre Texto principal '+JSON.stringify(placement));
   await page.locator('#showStrap').uncheck();
   assert(await page.locator('#strapField').isHidden(), 'Crónica: campo de volanta no se oculta al desactivar');
   await page.locator('#showStrap').check();
   assert(await page.locator('#strapField').isVisible(), 'Crónica: campo de volanta no reaparece');
   console.log('PASS cronica-dev interruptor en Diseño, texto condicional en Textos');
  }
  if(data.slug==='cronica-dev'){
   const icons=await page.locator('.modern-design-group .modern-footer-options [data-footer-style]').evaluateAll(buttons=>buttons.map(b=>({style:b.dataset.footerStyle,icon:b.querySelector('.material-symbols-outlined')?.textContent.trim(),label:b.textContent.trim()})));
   assert(icons.length===2&&icons.some(b=>b.style==='center'&&b.icon==='format_align_center')&&icons.some(b=>b.style==='carousel'&&b.icon==='view_carousel'),'Crónica: íconos de firma inferior incorrectos '+JSON.stringify(icons));
   console.log('PASS cronica-dev íconos Material en Firma inferior');
  }
  console.log('PASS',data.slug,'primera diapositiva con contenido de ejemplo');
  // El punteado de foto utiliza el mismo border CSS que texto/logo,
  // manteniendo el gris editorial y sin superponer el SVG anterior.
  const dash=await page.evaluate(()=>{
   const b=document.querySelector('.preview .photo-hover-border');
   const cs=getComputedStyle(b);
   const svg=getComputedStyle(b.querySelector('.photo-hover-outline'));
   const split=document.querySelector('.preview .split-photo-zone');
   const half=split?getComputedStyle(split,'::before'):null;
   return {width:cs.borderTopWidth,style:cs.borderTopStyle,color:cs.borderTopColor,
    svg:svg.display,split:half?{width:half.borderTopWidth,style:half.borderTopStyle,color:half.borderTopColor}:null};
  });
  assert(dash.width==='2px'&&dash.style==='dashed'&&dash.color==='rgb(65, 70, 78)'&&dash.svg==='none',
   data.slug+': trazo fotográfico distinto al de texto/logo '+JSON.stringify(dash));
  if(data.slug==='diarioshow-dev'){
   assert(dash.split?.width==='2px'&&dash.split?.style==='dashed'&&dash.split?.color==='rgb(65, 70, 78)',
    data.slug+': trazo fotográfico compartido incorrecto '+JSON.stringify(dash));
  }
  console.log('PASS',data.slug,'punteado fotográfico de 2px y gris conservado');
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
  if(data.slug==='diarioshow-dev'){
   const groups=await page.locator('#dsMobileControlsPanel > .panel-group').evaluateAll(nodes=>
    nodes.map(n=>({className:n.className,visible:getComputedStyle(n).display!=='none'})));
   const remaining=groups.filter(g=>g.visible);
   assert(remaining.length===1&&remaining[0].className.includes('ds-plate-design-group'),
    data.slug+': sin diseño muestra otros módulos '+JSON.stringify(groups));
   const context=await page.locator('#dsMobileContentEditor').evaluate(n=>getComputedStyle(n).display);
   assert(context==='none',data.slug+': panel contextual de logo visible en Sin diseño');
  }
  if(data.slug==='bae-dev'){
   assert(await page.locator('.editor-panel .modern-text-card').first().isHidden(),data.slug+': textos visibles en Sin diseño');
  }
  console.log('PASS',data.slug,'Sin diseño sin controladores');
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
