import { chromium } from '@playwright/test';

const browser = await chromium.launch({headless:true});
const page = await browser.newPage({
 viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true
});
const issues=[];
page.on('pageerror',err=>issues.push(err.message));
const url='http://127.0.0.1:8765/diarioshow-dev/';
function requireState(condition,message){if(!condition)throw Error(message);}
async function state(label){
 return await page.evaluate(label=>{
  const logo=document.getElementById('dsLogoHitButton');
  const text=document.getElementById('dsHeadlineHitButton');
  const l=logo?.getBoundingClientRect(),t=text?.getBoundingClientRect();
  const targetAt=(r)=>r?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null;
  const host=document.getElementById('dsMobileTextEditor');
  const content=document.getElementById('dsMobileContentEditor');
  return {label,scrollX:window.scrollX,scrollY:window.scrollY,
   maxScrollY:Math.max(0,document.scrollingElement.scrollHeight-window.innerHeight),
   selectionLength:window.getSelection()?.toString()?.length||0,
   targetCenterError:(()=>{
    const active=label==='initial'?document.getElementById('dsMobileTextEditor'):
     document.querySelector('main')?.dataset.previewContext==='logo'
      ?document.getElementById('dsMobileContentEditor')
      :document.getElementById('dsMobileTextEditor');
    const r=active?.getBoundingClientRect();
    if(!r)return null;
    const desired=window.scrollY+r.top+r.height/2-window.innerHeight/2;
    const max=Math.max(0,document.scrollingElement.scrollHeight-window.innerHeight);
    return Math.abs(window.scrollY-Math.max(0,Math.min(max,desired)));
   })(),
   context:document.querySelector('main')?.dataset.previewContext,
   textHidden:host?.hidden,logoHidden:content?.hidden,
   textCSS:host?getComputedStyle(host).display:null,
   logoCSS:content?getComputedStyle(content).display:null,
   logoHit:logo?{rect:[l.x,l.y,l.width,l.height],top:targetAt(l)?.id,topTag:targetAt(l)?.tagName,topClass:targetAt(l)?.className,topHtml:targetAt(l)?.outerHTML?.slice(0,220)}:null,
   textHit:text?{rect:[t.x,t.y,t.width,t.height],top:targetAt(t)?.id}:null,
   textInert:host?.inert,logoInert:content?.inert,
   active:document.activeElement?.id,
   pageHeight:document.scrollingElement.scrollHeight};
 },label);
}
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
 await page.waitForSelector('#dsHeadlineHitButton',{timeout:15000});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(500);
 const expected=[
  {key:'text',textHidden:false,logoHidden:true},
  {key:'logo',textHidden:true,logoHidden:false},
  {key:'text',textHidden:false,logoHidden:true},
  {key:'logo',textHidden:true,logoHidden:false},
  {key:'text',textHidden:false,logoHidden:true}
 ];
 const actual=[];
 actual.push(await state('initial'));
 for(const [i,hit] of ['#dsLogoHitButton','#dsHeadlineHitButton','#dsLogoHitButton','#dsHeadlineHitButton'].entries()){
  // Scrolling back to preview simulates the next contextual selection.
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(80);
  const rect=await page.locator(hit).boundingBox();
  if(!rect)throw Error('HIT BUTTON HIDDEN '+hit);
  const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
  // Real finger tap, not Playwright locator.click and not synthetic JS events.
  await page.touchscreen.tap(x,y);
  await page.waitForTimeout(700);
  const result=await state('finger-tap-'+(i+1));
  requireState(result.active!=='headlineMobile',
    'HEADLINE FOCUSED AUTOMATICALLY on '+result.label);
  requireState(result.targetCenterError<=10,
    'DID NOT CENTER CONTEXT MODULE after '+result.label+' '+JSON.stringify(result));
  actual.push(result);
 }
 for(let i=0;i<expected.length;i++){
  const a=actual[i],e=expected[i];
  requireState(a.context===e.key&&a.textHidden===e.textHidden&&a.logoHidden===e.logoHidden,
   'SWITCH FAIL at '+a.label+' expected '+JSON.stringify(e)+' got '+JSON.stringify(a));
 }
 await page.locator('#dsMobileControlsTab').click();
 await page.locator('#dsMobilePreviewTab').click();
 const afterTabs=await state('after-tab-roundtrip');
 requireState(afterTabs.context==='text'&&afterTabs.textHidden===false&&afterTabs.logoHidden===true,
  'TAB ROUNDTRIP FAIL '+JSON.stringify(afterTabs));
 for(const id of ['dsLogoHitButton','dsHeadlineHitButton']){
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(80);
  const box=await page.locator('#'+id).boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(650);
 }
 const final=await state('after-roundtrip-clicks');
 requireState(final.context==='text'&&!final.textHidden&&final.logoHidden,'POST-TABS SWITCH FAIL '+JSON.stringify(final));
 console.log('CONTEXT DIAGNOSTIC',JSON.stringify({actual,afterTabs,final,issues},null,2));
 requireState(issues.length===0,'JS errors: '+issues.join('; '));
 console.log('PASS: mobile logo/text context switches 5 times + after tab roundtrip, centered panels, no auto-focus');
 // Desktop: same vertical slider must sit to the left of the canvas;
 // both hit areas must lead to their original modules, without focusing text.
 const desktop=await browser.newPage({viewport:{width:1440,height:900}});
 const desktopErrors=[];
 desktop.on('pageerror',e=>desktopErrors.push(e.message));
 await desktop.goto(url+'?onboarding=off',{waitUntil:'domcontentloaded'});
 await desktop.waitForSelector('#dsLogoHitButton');
 await desktop.evaluate(()=>document.fonts.ready);
 await desktop.waitForTimeout(220);
 const desktopZoom=await desktop.evaluate(()=>{
  const z=document.getElementById('dsPhotoZoomControl');
  const stage=document.getElementById('photoStage');
  const r=z.getBoundingClientRect(),c=stage.getBoundingClientRect();
  return {parent:z.parentElement?.id,left:r.left,right:r.right,canvasLeft:c.left,desktopToolbarChildren:document.querySelector('.preview-toolbar')?.children.length,
   writingMode:getComputedStyle(document.getElementById('photoZoom')).writingMode};
 });
 requireState(desktopZoom.parent==='photoStage'&&desktopZoom.right<=desktopZoom.canvasLeft+1,
  'DESKTOP ZOOM NOT AT LEFT '+JSON.stringify(desktopZoom));
 requireState(desktopZoom.writingMode==='vertical-lr','DESKTOP ZOOM NOT VERTICAL '+JSON.stringify(desktopZoom));
 await desktop.locator('#dsLogoHitButton').click();
 requireState(await desktop.locator('#dsLogoHitButton').evaluate(e=>e.classList.contains('is-hotspot-selected')),'LOGO DASHED HOTSPOT NOT SELECTED');
 requireState(!(await desktop.locator('#dsHeadlineHitButton').evaluate(e=>e.classList.contains('is-hotspot-selected'))),'TEXT HOTSPOT MUST NOT REMAIN ACTIVE');
 const contentVisible=await desktop.locator('#dsMobileControlsPanel .ds-content-group .ds-control-card-toggle').getAttribute('aria-expanded');
 requireState(contentVisible==='true','DESKTOP LOGO MUST OPEN CONTENT');
 const logoMarked=await desktop.evaluate(()=>({
  logo:document.querySelector('#dsMobileControlsPanel .ds-content-group').classList.contains('is-preview-context-target'),
  text:document.querySelector('#dsMobileControlsPanel .ds-texts-group').classList.contains('is-preview-context-target')
 }));
 requireState(logoMarked.logo&&!logoMarked.text,'DESKTOP LOGO OUTLINE STATE WRONG '+JSON.stringify(logoMarked));
 await desktop.locator('#dsHeadlineHitButton').click();
 requireState(await desktop.locator('#dsHeadlineHitButton').evaluate(e=>e.classList.contains('is-hotspot-selected')),'TEXT DASHED HOTSPOT NOT SELECTED');
 requireState(!(await desktop.locator('#dsLogoHitButton').evaluate(e=>e.classList.contains('is-hotspot-selected'))),'LOGO HOTSPOT MUST DESELECT');
 const txt=await desktop.locator('#dsMobileControlsPanel .ds-texts-group .ds-control-card-toggle').getAttribute('aria-expanded');
 const focused=await desktop.evaluate(()=>document.activeElement.id);
 const textMarked=await desktop.evaluate(()=>({
  logo:document.querySelector('#dsMobileControlsPanel .ds-content-group').classList.contains('is-preview-context-target'),
  text:document.querySelector('#dsMobileControlsPanel .ds-texts-group').classList.contains('is-preview-context-target'),
  border:getComputedStyle(document.querySelector('#dsMobileControlsPanel .ds-texts-group')).borderTopColor
 }));
 requireState(!textMarked.logo&&textMarked.text&&textMarked.border==='rgb(230, 0, 141)',
  'DESKTOP TEXT OUTLINE STATE WRONG '+JSON.stringify(textMarked));
 requireState(txt==='true'&&focused!=='headline','DESKTOP HEADLINE MUST OPEN TEXT MODULE WITHOUT FOCUS '+focused);
 await desktop.locator('#dsMobileControlsPanel .ds-design-group .ds-control-card-toggle').count().catch(()=>0);
 await desktop.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:42})));
 requireState(!(await desktop.locator('#dsHeadlineHitButton').evaluate(e=>e.classList.contains('is-hotspot-selected'))),'CLICK OUTSIDE MUST REMOVE HOTSPOT DASH');
 // Left-panel accordions must each receive the exact same fading pulse
 // only on expansion. Switching one to another transfers the pulse.
 for(const selector of [
  '#dsMobileControlsPanel .ds-plate-design-group',
  '#dsMobileControlsPanel .ds-photo-layout-group'
 ]){
  const toggle=desktop.locator(selector+' .ds-control-card-toggle');
  if((await toggle.getAttribute('aria-expanded'))==='true')await toggle.click();
  await toggle.click();
  requireState(await desktop.locator(selector).evaluate(el=>el.classList.contains('is-preview-context-target')),
   'EXPANDED CONTROL CARD DID NOT PULSE '+selector);
  const count=await desktop.locator('#dsMobileControlsPanel .ds-control-card.is-preview-context-target').count();
  requireState(count===1,'PULSE MUST TRANSFER EXCLUSIVELY: '+count);
  const appearance=await desktop.locator(selector).evaluate(el=>{
   const css=getComputedStyle(el);
   return {animation:css.animationName,border:css.borderTopWidth,shadow:css.boxShadow};
  });
  requireState(appearance.animation.includes('ds-context-card-flash'),
   'MISSING FADING PULSE '+selector+' '+JSON.stringify(appearance));
  requireState(appearance.border==='1px'&&appearance.shadow.includes('0px 0px 0px 2px'),
   'PULSE MUST HAVE UNIFORM 2PX RING WITHOUT LAYOUT SHIFT '+JSON.stringify(appearance));
 }
 const activeCard=desktop.locator('#dsMobileControlsPanel .ds-photo-layout-group');
 await desktop.waitForTimeout(2400);
 const pulseAfter=await activeCard.evaluate(el=>getComputedStyle(el).boxShadow);
 requireState(pulseAfter==='none'||/^rgba?\([^)]*0\) 0px 0px 0px 0px$/.test(pulseAfter),
  'PULSE SHOULD FADE BACK TO NORMAL '+pulseAfter);
 requireState(!desktopErrors.length,'DESKTOP JS ERRORS '+desktopErrors.join(';'));
 console.log('PASS: desktop vertical side zoom and contextual headline/logo module interactions',JSON.stringify(desktopZoom));
 // New editorial controls must remain functional in the same Canvas model.
 const identity=desktop.locator('#dsMobileControlsPanel .ds-content-group');
 const importer=desktop.locator('#dsMobileControlsPanel .ds-import-group');
 requireState(await importer.locator('#articleUrl').count()===1,'IMPORT MODULE NOT SEPARATED');
 requireState(await identity.locator('[data-footer-style]').count()===2,'FOOTER STYLE CONTROL MISSING');
 requireState(await desktop.locator('#dsMobileControlsPanel .ds-section-icon').count()>=5,'SECTION ICONS MISSING');
 const before=await desktop.locator('#art').evaluate(el=>el.toDataURL());
 await identity.locator('[data-footer-style="carousel"]').click();
 const after=await desktop.locator('#art').evaluate(el=>el.toDataURL());
 requireState(before!==after,'CAROUSEL FOOTER DID NOT CHANGE CANVAS');
 await identity.locator('[data-footer-style="center"]').click();
 const restored=await desktop.locator('#art').evaluate(el=>el.toDataURL());
 requireState(before===restored,'CENTER FOOTER DID NOT RESTORE CANVAS');
 console.log('PASS: separated modules, section icons, canvas footer modes');
 await desktop.close();
 // Tour uses the real page on a fresh desktop context (first-time visit).
 const tourContext=await browser.newContext({viewport:{width:1440,height:900}});
 const tour=await tourContext.newPage();
 const tourErrors=[];
 tour.on('pageerror',e=>tourErrors.push(e.message));
 await tour.goto(url,{waitUntil:'load'});
 await tour.waitForSelector('#dsOnboardingLayer:not([hidden])',{timeout:10000});
 requireState(await tour.locator('#browserZoomTip').count()===0,'OLD FLOATING POCO ESPACIO TIP STILL PRESENT');
 const outline=await tour.locator('.ds-tour-highlight').evaluate(el=>getComputedStyle(el).borderTopWidth);
 requireState(outline==='0px','SPOTLIGHT MUST HAVE NO PINK OUTLINE '+outline);
 requireState(await tour.locator('#dsTourProgress').innerText()==='1 de 7','TOUR DID NOT START AT 1/7');
 requireState(await tour.locator('#dsTourTitle').innerText()==='Elegí el diseño de tu placa','TOUR FIRST STEP WRONG');
 const triggerPosition=await tour.locator('#dsOnboardingTrigger').evaluate(e=>{
  const r=e.getBoundingClientRect(),c=getComputedStyle(e);
  return {hidden:c.display==='none',fixed:c.position==='fixed',
   visibleWidth:Math.max(0,window.innerWidth-r.left),
   centerDifference:Math.abs((r.top+r.height/2)-window.innerHeight/2),
   label:e.textContent.trim(),width:r.width,height:r.height,
   notch:c.clipPath,glass:c.backdropFilter,background:c.backgroundColor};
 });
 requireState(!triggerPosition.hidden&&triggerPosition.fixed&&
  triggerPosition.visibleWidth>=30&&triggerPosition.visibleWidth<=40&&
  triggerPosition.centerDifference<2&&triggerPosition.label.includes('Onboarding')&&
  triggerPosition.width===136&&triggerPosition.height===42&&
  triggerPosition.notch==='none'&&
  (triggerPosition.glass==='none'||triggerPosition.glass==='')&&
  triggerPosition.background==='rgba(0, 0, 0, 0)',
  'TOUR FLAG MUST PEEK OUT AT CENTER-RIGHT VIEWPORT '+JSON.stringify(triggerPosition));
 const flagGeometry=await tour.locator('#dsOnboardingTrigger').evaluate(e=>{
  const svg=e.querySelector('svg.ds-onboarding-flag-art');
  const fill=svg.querySelector('path:first-child'),stroke=svg.querySelector('path[stroke]');
  return {svgCount:e.querySelectorAll('svg.ds-onboarding-flag-art').length,
   pink:fill.getAttribute('fill'),fillShape:fill.getAttribute('d'),
   line:stroke.getAttribute('stroke'),strokeWidth:stroke.getAttribute('stroke-width'),
   vectorEffect:stroke.getAttribute('vector-effect'),
   strokePath:stroke.getAttribute('d'),outerPseudo:getComputedStyle(e,'::before').content};
 });
 requireState(flagGeometry.svgCount===1&&['#FD009B','#e6008d'].includes(flagGeometry.pink)&&
  ['white','#ffffff'].includes(flagGeometry.line)&&flagGeometry.strokeWidth==='2'&&
  flagGeometry.strokePath?.includes('14.3047 21')&&
  flagGeometry.outerPseudo==='none',
  'FLAG MUST HAVE ONE UNIFORM 2PX WHITE SVG PATH WITHOUT LAYERED CLIPS '+JSON.stringify(flagGeometry));
 const names=[
  'Elegí el diseño de tu placa',
  'Definí la distribución fotográfica',
  'Agregá tus fotografías',
  'Importá y personalizá tu placa',
  'Editá los textos',
  'Editá desde la vista previa',
  '¿Poco espacio?'
 ];
 for(let i=0;i<names.length;i++){
  requireState(await tour.locator('#dsTourTitle').innerText()===names[i],
   'WRONG TOUR STEP '+i);
  requireState(await tour.locator('#dsTourProgress').innerText()===(i+1)+' de 7',
   'WRONG TOUR PROGRESS '+i);
  if(i===5){
   const overlays=await tour.locator('#photoStage>.ds-preview-hit-button').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).borderTopStyle));
   requireState(overlays.length===2&&overlays.every(v=>v==='dashed'),'PREVIEW STEP MUST SHOW TWO DASHED HOTSPOTS '+JSON.stringify(overlays));
  }
  if(i===6){
   requireState(await tour.locator('#dsTourZoomDemo .browser-zoom-demo').count()===1,
    'FINAL STEP MUST INCLUDE ZOOM ANIMATION');
   const animationName=await tour.locator('#dsTourZoomDemo .browser-zoom-demo-content').evaluate(el=>getComputedStyle(el).animationName);
   requireState(animationName==='ds-browser-zoom-content','FINAL STEP ZOOM ANIMATION MISSING '+animationName);
   const fullScreen=await tour.locator('#dsOnboardingLayer').evaluate(el=>el.classList.contains('is-whole-screen'));
   const highlightVisible=await tour.locator('.ds-tour-highlight').isVisible();
   requireState(fullScreen&&!highlightVisible,'FINAL STEP MUST HAVE CENTERED MODAL WITHOUT SPOTLIGHT');
  }
  if(i!==names.length-1)await tour.locator('.ds-tour-next').click();
 }
 await tour.locator('.ds-tour-next').click();
 requireState(await tour.locator('#dsOnboardingLayer').isHidden(),
  'TOUR DID NOT CLOSE');
 const complete=await tour.evaluate(()=>localStorage.getItem('ds-dev-tour-desktop-v3'));
 requireState(complete==='complete','TOUR COMPLETION NOT STORED');
 await tour.reload({waitUntil:'load'});
 await tour.waitForTimeout(250);
 requireState(await tour.locator('#dsOnboardingLayer').count()===0||
  await tour.locator('#dsOnboardingLayer').isHidden(),'TOUR REOPENED DESPITE PRIOR COMPLETION');
 // Hover into the exposed 36px tab, not the clipped/offscreen center.
 await tour.mouse.move(1440-7,450);
 await tour.waitForTimeout(550);
 const expandedFlag=await tour.locator('#dsOnboardingTrigger').evaluate(el=>{
  const r=el.getBoundingClientRect();
  return {left:r.left,right:r.right,width:r.width,viewport:window.innerWidth};
 });
 requireState(Math.abs(expandedFlag.right-expandedFlag.viewport)<2&&expandedFlag.width>=135&&expandedFlag.width<=137,
  'TOUR FLAG MUST EXPAND ON HOVER '+JSON.stringify(expandedFlag));
 await tour.locator('#dsOnboardingTrigger').click();
 requireState(await tour.locator('#dsTourProgress').innerText()==='1 de 7','TOUR REPLAY FAILED');
 await tour.locator('.ds-tour-skip').click();
 requireState(await tour.locator('#dsOnboardingLayer').isHidden(),'TOUR SKIP FAILED');
 requireState(!tourErrors.length,'TOUR JS ERRORS '+tourErrors.join(';'));
 console.log('PASS: desktop 7-step spotlight tour, centered final modal, completion and replay');
 await tourContext.close();
 // Tanto la apertura como el cierre activan el mismo pulso de Diario Show.
 const pulsePage=await browser.newPage({viewport:{width:1440,height:900}});
 await pulsePage.goto(url+'?onboarding=off',{waitUntil:'load'});
 const pulseCard=pulsePage.locator('#dsMobileControlsPanel .ds-plate-design-group');
 const pulseToggle=pulseCard.locator('.ds-control-card-toggle');
 const originalBounds=await pulseToggle.boundingBox();
 for(const expanded of [false,true]){
  await pulseToggle.click();
  requireState((await pulseToggle.getAttribute('aria-expanded'))===String(expanded),
   'TOGGLE DID NOT '+(expanded?'OPEN':'CLOSE'));
  const pulse=await pulseCard.evaluate(node=>({
   active:node.classList.contains('is-preview-context-target'),
   animation:getComputedStyle(node).animationName,
   duration:getComputedStyle(node).animationDuration,
   width:getComputedStyle(node).borderTopWidth
  }));
  requireState(pulse.active&&pulse.animation==='ds-context-card-flash'&&pulse.duration==='1.05s'&&pulse.width==='1px',
   'CARD PULSE NOT UNIFIED ON '+(expanded?'OPEN':'CLOSE')+': '+JSON.stringify(pulse));
  const bounds=await pulseToggle.boundingBox();
  requireState(Math.abs(bounds.x-originalBounds.x)<1&&Math.abs(bounds.width-originalBounds.width)<1,
   'CARD WIDTH MOVED DURING TOGGLE');
 }
 console.log('PASS: Diario Show opens/closes with 1.05s pulse, fixed border, stable width');
 await pulsePage.close();
 // Los módulos sin función no deben dejar tarjetas vacías en ninguna variante.
 const variantPage=await browser.newPage({viewport:{width:1440,height:900}});
 await variantPage.goto(url+'?onboarding=off',{waitUntil:'load'});
 for(const [variant,expectedVisible] of [['pink',true],['blue',true],['quote',false],['quote-blue',false],['pink',true]]){
  await variantPage.locator('.ds-variant-option[data-variant="'+variant+'"]').click();
  const isVisible=await variantPage.locator('.ds-import-group').isVisible();
  requireState(isVisible===expectedVisible,
   'IMPORT MODULE INCORRECT FOR '+variant+': expected visible '+expectedVisible+', got '+isVisible);
 }
 console.log('PASS: importar noticia visible solo en variantes 1 y 2, sin tarjetas vacías');
 await variantPage.close();
 // On mobile the tour is never shown, even for a first-time visitor.
 requireState(await page.locator('#dsOnboardingLayer').count()===0,
  'MOBILE TOUR MUST NOT BE MOUNTED');
 requireState(await page.locator('#dsOnboardingTrigger').isHidden(),
  'MOBILE TOUR BUTTON MUST BE HIDDEN');
 console.log('PASS: onboarding disabled on mobile');
}catch(err){
 console.error('FAIL: '+err.stack);
 console.error('LAST STATE',JSON.stringify(await state('failure').catch(()=>null),null,2));
 console.error('JS ERRORS',JSON.stringify(issues));
 process.exitCode=1;
}finally{await browser.close();}
