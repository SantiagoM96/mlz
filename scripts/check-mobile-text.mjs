import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 for(const brand of ['cronica','bae','diarioshow']){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:8765/${brand}-dev/`,{waitUntil:'networkidle'});
  await page.evaluate(()=>{document.querySelectorAll('[class*="onboarding"]').forEach(n=>n.remove())});
  const count=await page.locator('.editorial-text-sheet').count();
  assert.equal(count,1,brand+' sheet initialized: '+errors.join(';'));
  const drawer=page.locator('.editorial-mobile-drawer');
  const handle=drawer.locator('.editorial-drawer-handle');
  const content=drawer.locator('.editorial-drawer-content');
  assert.ok(await drawer.isVisible());
  assert.ok(!(await content.isVisible()));
  assert.ok(!(await page.locator('.bae-credits').isVisible()));
  assert.equal(await drawer.locator('.preview-actions button:visible').count(),3);
  const actions=drawer.locator('.editorial-drawer-actions');
  assert.deepEqual(await actions.evaluate(node=>{
   const bar=getComputedStyle(node);
   const drawer=getComputedStyle(node.parentElement);
   return [bar.paddingTop,drawer.paddingRight,bar.paddingBottom,drawer.paddingLeft];
  }),['16px','16px','16px','16px']);
  const divider=()=>actions.evaluate(node=>getComputedStyle(node,'::before').borderTopWidth);
  assert.equal(await divider(),'0px');
  const touch=await page.context().newCDPSession(page);
  const drag=async (dy)=>{
   const grip=await handle.boundingBox();
   const x=Math.round(grip.x+grip.width/2), y=Math.round(grip.y+grip.height/2);
   await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy}]});
   const moved=await handle.boundingBox();
   assert.ok(Math.abs(moved.y-grip.y-dy)<2,brand+' drawer tracks the finger before release');
   await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };
  await drag(-96);
  assert.ok(await content.isVisible());
  assert.equal(await divider(),'1px');
  assert.equal(await content.evaluate(node=>getComputedStyle(node).scrollbarWidth),'none');
  assert.equal(await content.locator(':is(.modern-toggle,.ds-control-card-toggle)[aria-expanded="false"]:visible').count(),0);
  await drawer.evaluate(node=>Promise.allSettled(node.getAnimations().map(animation=>animation.finished)));
  await drag(96);
  assert.ok(!(await content.isVisible()));
  await drawer.evaluate(node=>Promise.allSettled(node.getAnimations().map(animation=>animation.finished)));
  await touch.detach();

  const sampleDrawer=()=>drawer.evaluate(async node=>{
   const bar=node.querySelector('.editorial-drawer-actions');
   const grip=node.querySelector('.editorial-drawer-handle');
   const before=bar.getBoundingClientRect().top;
   const startHeight=node.getBoundingClientRect().height;
   grip.click();
   const frames=[];
   const start=performance.now();
   do {
    await new Promise(requestAnimationFrame);
    frames.push({top:bar.getBoundingClientRect().top,height:node.getBoundingClientRect().height});
   } while(performance.now()-start<240);
   return {before,startHeight,frames};
  });
  for(const direction of ['opening','closing']){
   const {before,startHeight,frames}=await sampleDrawer();
   const endHeight=frames.at(-1).height;
   const min=Math.min(startHeight,endHeight);
   const max=Math.max(startHeight,endHeight);
   assert.ok(frames.some(frame=>frame.height>min+1&&frame.height<max-1),brand+' tap drawer animates while '+direction);
   assert.ok(frames.every(frame=>Math.abs(frame.top-before)<1),brand+' actions stay fixed while '+direction);
  }

  const slides=page.locator('.cronica-preview-pages,.editor-slide-nav');
  const add=slides.locator('.carousel-add-placeholder,.editor-slide-add-tile');
  let blankHeight;
  for(let i=0;i<2;i++){
   await add.tap();
   await content.waitFor();
   await page.waitForFunction(()=>scrollY===0);
   assert.match(await slides.innerText(),/Sin diseño/i);
   const designToggle=content.locator('.modern-design-group > button,.ds-plate-design-group > button');
   assert.equal(await designToggle.getAttribute('aria-expanded'),'true');
   blankHeight=(await drawer.boundingBox()).height;
   assert.ok(blankHeight<844*.62,brand+' blank design fits its own content');
  }
  const design=brand==='cronica'?'[data-page-variant="internal"]':brand==='bae'?'[data-theme="dark"]':'[data-variant="pink"].ds-variant-option';
  await page.locator(design).first().evaluate(n=>n.click());
  await page.waitForFunction(previous=>document.querySelector('.editorial-mobile-drawer').offsetHeight>previous, blankHeight);
  await handle.tap();
  const thumbnails=slides.locator('.carousel-page-thumb,.editor-slide-thumb');
  const existing=thumbnails.first();
  await existing.tap();
  assert.ok(!(await content.isVisible()),brand+' designed page keeps closed drawer closed');
  await handle.tap();
  await thumbnails.last().tap();
  assert.ok(await content.isVisible(),brand+' designed page keeps open drawer open');
  await handle.tap();
  await thumbnails.nth(1).tap();
  assert.ok(await content.isVisible(),brand+' blank page opens design drawer');
  await existing.tap();
  assert.ok(await content.isVisible(),brand+' switching back keeps drawer open');
  await handle.tap();
  await page.locator('.modern-logo-hit,#dsLogoHitButton').first().evaluate(node=>node.click());
  assert.ok(await content.locator('.editor-logo-layout-row,.ds-logo-layout-row').isVisible());
  assert.ok(!(await content.locator('.modern-design-group > button,.ds-plate-design-group > button').isVisible()));
  await handle.tap();
  if(brand==='cronica'){
   await page.getByRole('button',{name:'Editar volanta'}).tap();
   const strap=page.locator('.editorial-text-writing #strapText');
   assert.ok(await strap.isVisible());
   await page.getByRole('button',{name:'Aumentar tamaño'}).click();
   assert.equal(await strap.getAttribute('data-size-offset'),'2');
   await page.locator('.editorial-text-done').click();
  }
  const initialPreview=await page.locator('#art').boundingBox();
  assert.ok(initialPreview.width>=235,brand+' mobile preview keeps its width');
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').evaluate(node=>node.click());
  assert.ok(!(await content.locator('.modern-text-card,.ds-texts-group').isVisible()));
  await page.locator('.editorial-text-sheet:not([hidden])').waitFor();
  await page.waitForTimeout(100);
  const geometry=await page.evaluate(()=>{
   const rect=n=>n.getBoundingClientRect();
   const field=rect(document.querySelector('.editorial-text-writing'));
   const iconSize=getComputedStyle(document.querySelector('.editorial-text-tools #formatItalic :is(.material-icons,.material-symbols-outlined)')).fontSize;
   const buttons=[...document.querySelectorAll('.editorial-text-tools .format-buttons button,.editorial-text-tools .align-buttons button')].map(n=>({id:n.id,w:rect(n).width,h:rect(n).height,radius:getComputedStyle(n).borderRadius}));
   return {buttons,iconSize,fieldBottom:field.bottom,toolsTop:rect(document.querySelector('.editorial-text-tools')).top,background:getComputedStyle(document.querySelector('.editorial-text-sheet')).backgroundColor,stageInPage:!!document.querySelector('.preview #photoStage')};
  });
  assert.equal(geometry.background,'rgba(0, 0, 0, 0)');
  assert.ok(geometry.stageInPage);
  assert.equal(geometry.iconSize,'18px');
  assert.ok(geometry.toolsTop>=geometry.fieldBottom+10);
  for(const b of geometry.buttons){assert.equal(b.w,32,b.id+' width');assert.equal(b.h,32,b.id+' height')}
  assert.equal(geometry.buttons.find(b=>b.id==='formatItalic').radius,'0px');
  const field=page.locator('.editorial-text-writing .cronica-rich-headline');
  const size=page.locator('#size');
  const done=page.getByRole('button',{name:'Listo',exact:true});
  assert.equal(await done.evaluate(node=>node.classList.contains('has-changes')),false);
  await page.getByRole('button',{name:'Seleccionar todo',exact:true}).click();
  assert.equal(await field.evaluate(node=>getSelection().rangeCount===1&&getSelection().getRangeAt(0).cloneContents().textContent===node.textContent),true);
  assert.equal(await done.evaluate(node=>node.classList.contains('has-changes')),false);
  const spacing=page.locator('.editorial-text-dialog').getByRole('group',{name:'Espaciado del texto'});
  const textTop=()=>page.locator('.modern-text-hit,#dsHeadlineHitButton').evaluate(node=>node.style.top);
  const standardTop=await textTop();
  assert.equal(await spacing.getByRole('button',{name:'XS · 50 px'}).getAttribute('aria-pressed'),'true');
  await spacing.getByRole('button',{name:'XL · 150 px'}).click();
  assert.equal(await page.locator('#headlineSpacing').inputValue(),'3');
  assert.notEqual(await textTop(),standardTop,brand+' spacing repositions text on canvas');
  await spacing.getByRole('button',{name:'XS · 50 px'}).click();
  assert.equal(await textTop(),standardTop);
  const headerActions=page.locator('.editorial-text-header-actions');
  assert.equal(await headerActions.evaluate(node=>getComputedStyle(node).gap),'8px');
  for(const button of await headerActions.getByRole('button').all()){
   const box=await button.boundingBox();
   assert.equal(box.height,32);
   assert.equal(box.width,68);
  }
  const previousSize=Number(await size.inputValue());
  await page.getByRole('button',{name:'Aumentar tamaño'}).click();
  assert.equal(Number(await size.inputValue()),previousSize+2);
  assert.equal(await done.evaluate(node=>node.classList.contains('has-changes')),true);
  await page.getByRole('button',{name:'Reducir tamaño'}).click();
  assert.equal(Number(await size.inputValue()),previousSize);
  await field.fill('Probando el editor móvil');
  assert.equal(await page.locator('#headline').inputValue(),'Probando el editor móvil',brand+' source sync');
  await field.evaluate(n=>{const r=document.createRange();r.selectNodeContents(n);const s=getSelection();s.removeAllRanges();s.addRange(r)});
  await page.locator('.editorial-text-tools #formatItalic').click();
  assert.match(await page.locator('#headline').inputValue(),/_Probando el editor móvil_/,brand+' italic');
  await page.locator('.editorial-text-tools #alignLeft').click();
  assert.equal(await page.locator('#alignLeft').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>{
   window.__nativeTestViewport=window.visualViewport;
   Object.defineProperty(window,'visualViewport',{configurable:true,value:{height:440,offsetTop:24}});
   window.dispatchEvent(new Event('resize'));

  });
  assert.equal(await page.locator('.editorial-text-sheet').evaluate(n=>n.style.height),'440px');
  assert.equal(await page.locator('.editorial-text-sheet').evaluate(n=>n.style.top),'24px');
  await page.waitForTimeout(100);
  const previewBounds=await page.evaluate(()=>{
   const hit=document.querySelector('.modern-text-hit,#dsHeadlineHitButton').getBoundingClientRect();
   const art=document.querySelector('#art').getBoundingClientRect();
   const panel=document.querySelector('.editorial-text-dialog').getBoundingClientRect();
   return {center:(hit.top+hit.bottom)/2,target:(24+panel.top)/2,width:art.width,scroll:scrollY,mini:!!document.querySelector('.editorial-text-preview')};
  });
  assert.ok(Math.abs(previewBounds.center-previewBounds.target)<3,JSON.stringify(previewBounds));
  assert.ok(Math.abs(previewBounds.width-initialPreview.width)<1,'preview keeps original scale');
  assert.ok(!previewBounds.mini);
  assert.ok(previewBounds.scroll>0);
  await page.evaluate(()=>{Object.defineProperty(window,'visualViewport',{configurable:true,value:window.__nativeTestViewport});window.dispatchEvent(new Event('resize'))});
  await page.locator('.editorial-text-done').click();
  assert.equal(await page.locator('.editorial-text-sheet').getAttribute('hidden'),'');
  assert.equal(await page.locator('.editorial-text-writing .cronica-rich-headline').count(),0,brand+' restored field');
  assert.equal(await page.locator('.preview #photoStage').count(),1,brand+' restored preview');
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').evaluate(node=>node.click());
  await page.locator('.editorial-text-sheet:not([hidden])').waitFor();
  assert.equal(await field.textContent(),'Probando el editor móvil');
  if(brand==='cronica')assert.equal(await field.evaluate(n=>getComputedStyle(n).textTransform),'uppercase');
  await page.setViewportSize({width:432,height:900});
  assert.ok(await page.locator('.editorial-text-dialog').evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
  await page.setViewportSize({width:768,height:1024});
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.editorial-text-sheet').getAttribute('hidden'),'');
  await page.setViewportSize({width:1415,height:900});
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.editorial-text-sheet').getAttribute('hidden'),'');
  assert.equal(await page.locator('.editorial-text-tools .typography-row').count(),0);
  const desktopSpacing=page.locator('.editorial-spacing-desktop');
  const small=desktopSpacing.getByRole('button',{name:'S · 75 px'});
  if(!(await small.isVisible())){
   await page.locator('main .editor-panel :is(.modern-text-card,.ds-texts-group)').first().locator(':scope > button').click();
  }
  await small.click();
  assert.equal(await page.locator('#headlineSpacing').inputValue(),'1.5');
  assert.equal(await small.getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);
  console.log(brand+': editing, formatting, alignment, close/reopen and desktop restore OK; page errors: '+JSON.stringify(errors));
  await page.close();
 }
}finally{await browser.close()}
