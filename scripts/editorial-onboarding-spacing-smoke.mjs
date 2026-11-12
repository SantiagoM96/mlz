import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
for(const slug of ['cronica-dev','bae-dev','diarioshow-dev']){
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/'+slug+'/?onboarding=force',{waitUntil:'load'});
 await page.locator('.ds-tour-card:not([hidden])').waitFor({timeout:12000});
 if(slug!=='diarioshow-dev'){
  const mask=await page.locator('.ds-tour-highlight').evaluate(el=>{
   const s=getComputedStyle(el),shade=getComputedStyle(document.querySelector('.ds-tour-shade'));
   return {transition:s.transitionDuration,shadow:s.boxShadow,shadeBackground:shade.backgroundColor,shadeTransition:shade.transitionDuration};
  });
  if(mask.transition!=='0s'||mask.shadeTransition!=='0s'||mask.shadow!=='none'||
    mask.shadeBackground!=='rgba(9, 10, 14, 0.77)')
   throw Error(slug+': máscara no igualada a Diario Show '+JSON.stringify(mask));
  console.log('PASS máscara instantánea',slug);
 }
 const expected=slug==='cronica-dev'
  ?['Elegí el diseño de cada placa','Agregá una fotografía','Editá los textos']
  :slug==='bae-dev'
   ?['Elegí el diseño de tu placa','Agregá una fotografía','Importá una noticia','Editá los textos','Ajustá el diseño']
   :['Elegí el diseño de tu placa','Definí la distribución fotográfica','Importá y personalizá tu placa','Editá los textos'];
 let found=false;
 const titles=[];
 for(let i=0;i<13;i++){
  const title=await page.locator('#dsTourTitle').textContent();
  titles.push(title);
  if(title?.includes('Abrí o cerrá todos los módulos')){
   const before=titles.slice(0,-1);
   let cursor=-1;
   for(const name of expected){
    const idx=before.indexOf(name);
    if(idx<=cursor)throw Error(slug+': módulos no aparecen en orden: '+JSON.stringify(titles));
    cursor=idx;
   }
   const geometry=await page.evaluate(slug=>{
    const header=document.querySelector(slug==='diarioshow-dev'
     ?'#dsMobileControlsPanel .ds-plate-design-group > .ds-control-card-toggle'
     :'section.modern-design-group > .modern-toggle');
    const highlight=document.querySelector('.ds-tour-highlight');
    const box=header?.getBoundingClientRect(),mask=highlight?.getBoundingClientRect();
    const whole=header?.parentElement?.getBoundingClientRect();
    return {header:box?{top:box.top,height:box.height}:null,
     mask:mask?{top:mask.top,height:mask.height}:null,
     whole:whole?{height:whole.height}:null};
   },slug);
   if(!geometry.header||!geometry.mask||geometry.mask.height>geometry.header.height+18||
      Math.abs(geometry.mask.top-geometry.header.top)>9||
      (geometry.whole.height>geometry.header.height+35&&geometry.mask.height>=geometry.whole.height))
    throw Error(slug+': la máscara no señala solo la cabecera '+JSON.stringify(geometry));
   console.log('PASS orden y spotlight cabecera',slug,JSON.stringify(titles));

   found=true;
   const visible=await page.locator('#dsTourShiftDemo').isVisible();
   const image=await page.locator('#dsTourShiftDemo img').evaluate(el=>({
    loaded:el.complete&&el.naturalWidth>0,
    src:el.getAttribute('src'),
    alt:el.getAttribute('alt')
   }));
   if(!visible||!image.loaded||!image.src.includes('shift-click-demo.svg'))
    throw Error(slug+': falta imagen Shift '+JSON.stringify({visible,image}));
   const illustration=await page.evaluate(async()=>{
    const response=await fetch('../shared/shift-click-demo.svg?v=shift-layout-v37-20261112');
    const svg=await response.text();
    const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
    return {
     status:response.status,
     panels:parsed.querySelectorAll('#modules .module').length,
     expandedHeights:[...parsed.querySelectorAll('#modules .module animate[attributeName="height"]')].map(x=>x.getAttribute('values')),
     shift:parsed.querySelector('#shift-key .shift')?.getAttribute('x'),
     mouse:parsed.querySelector('#mouse-button .mouse')?.getAttribute('x'),
     hasBottomCaption:svg.includes('Mantené presionada Shift'),
     hasEquals:svg.includes('> = </text>')||svg.includes('>=</text>'),
     shiftKeyBoxCount:parsed.querySelectorAll('#shift-key rect').length,
     lightBackground:svg.includes('#536279')
    };
   });
   if(illustration.status!==200||illustration.panels!==3||
      illustration.expandedHeights.some(v=>!v?.includes('36;36;66;66;36'))||
      !(Number(illustration.shift)>320&&Number(illustration.mouse)>Number(illustration.shift))||
      illustration.hasBottomCaption||illustration.hasEquals||
      illustration.shiftKeyBoxCount!==1||!illustration.lightBackground)
    throw Error(slug+': SVG Shift no coincide con diseño aprobado '+JSON.stringify(illustration));
   console.log('PASS ilustración Shift',slug,'tres módulos animados a la izquierda y teclas a la derecha');

   console.log('PASS onboarding',slug,'Shift + clic e ilustración cargada');
   break;
  }
  await page.locator('.ds-tour-next').click();
 }
 if(!found)throw Error(slug+': no aparece paso Shift en el onboarding');
 await page.locator('.ds-tour-next').click();
 const logoTitle=await page.locator('#dsTourTitle').textContent();
 if(logoTitle!=='Configurá el logo y la firma')
  throw Error(slug+': no sigue el paso del logo de la preview: '+logoTitle);
 const logo=await page.evaluate(slug=>{
  const selector=slug==='diarioshow-dev'?'#dsLogoHitButton':'.modern-logo-hit';
  const target=document.querySelector(selector),overlay=document.querySelector('.ds-tour-multispot'),layer=document.querySelector('#dsOnboardingLayer');
  const design=document.querySelector(slug==='diarioshow-dev'?'#dsMobileControlsPanel .ds-plate-design-group':'.editor-panel .modern-design-group');
  const field=design?.querySelector(slug==='diarioshow-dev'?'.ds-logo-layout-row':'.editor-logo-layout-row');
  const footer=design?.querySelector(slug==='diarioshow-dev'?'.ds-footer-style-field':'.modern-footer-field');
  const t=target?.getBoundingClientRect(),f=field?.getBoundingClientRect(),b=footer?.getBoundingClientRect();
  const path=overlay?.firstElementChild?.getAttribute('d')||'';
  const n=(path.match(/M/g)||[]).length-1;
  return {
   group:layer?.dataset.tourGroup,
   active:layer?.classList.contains('is-logo-spotlight'),
   display:overlay?getComputedStyle(overlay).display:null,
   title:document.querySelector('#dsTourTitle')?.textContent,
   target:t?{x:t.x,y:t.y,width:t.width,height:t.height}:null,
   controls:f?{x:f.x,y:f.y,width:f.width,height:f.height}:null,
   footer:b?{x:b.x,y:b.y,width:b.width,height:b.height}:null,
   holes:n,path
  };
 },slug);
 if(logo.group!=='preview'||!logo.active||logo.display!=='block'||logo.holes!==3||
  !logo.target||logo.target.width<5||logo.target.height<5||
  !logo.controls||logo.controls.width<5||logo.controls.height<5||
  !logo.footer||logo.footer.width<5||logo.footer.height<5)
  throw Error(slug+': foco doble no recorta logo, controles y firma '+JSON.stringify(logo));
 console.log('PASS spotlight del logo en preview',slug,JSON.stringify(logo));
 await page.locator('.ds-tour-next').click();
 const textTitle=await page.locator('#dsTourTitle').textContent();
 if(textTitle!=='Editá el texto desde la vista previa')
  throw Error(slug+': no sigue el paso de titular '+textTitle);

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
