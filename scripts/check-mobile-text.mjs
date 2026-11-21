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
  const design=brand==='cronica'?'[data-page-variant="internal"]':brand==='bae'?'[data-theme="dark"]':'[data-variant="pink"].ds-variant-option';
  await page.locator(design).first().evaluate(n=>n.click());
  const initialPreview=await page.locator('#art').boundingBox();
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').click({force:true});
  await page.locator('.editorial-text-sheet:not([hidden])').waitFor();
  await page.waitForTimeout(100);
  const geometry=await page.evaluate(()=>{
   const rect=n=>n.getBoundingClientRect();
   const field=rect(document.querySelector('.editorial-text-writing'));
   const buttons=[...document.querySelectorAll('.editorial-text-tools .format-buttons button,.editorial-text-tools .align-buttons button')].map(n=>({id:n.id,w:rect(n).width,h:rect(n).height,radius:getComputedStyle(n).borderRadius}));
   return {buttons,fieldBottom:field.bottom,toolsTop:rect(document.querySelector('.editorial-text-tools')).top,background:getComputedStyle(document.querySelector('.editorial-text-sheet')).backgroundColor,stageInPage:!!document.querySelector('.preview #photoStage')};
  });
  assert.equal(geometry.background,'rgba(0, 0, 0, 0)');
  assert.ok(geometry.stageInPage);
  assert.ok(geometry.toolsTop>=geometry.fieldBottom+10);
  for(const b of geometry.buttons){assert.equal(b.w,32,b.id+' width');assert.equal(b.h,32,b.id+' height')}
  assert.equal(geometry.buttons.find(b=>b.id==='formatItalic').radius,'0px');
  const field=page.locator('.editorial-text-writing .cronica-rich-headline');
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
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').click({force:true});
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
  console.log(brand+': editing, formatting, alignment, close/reopen and desktop restore OK; page errors: '+JSON.stringify(errors));
  await page.close();
 }
}finally{await browser.close()}
