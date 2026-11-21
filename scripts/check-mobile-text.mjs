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
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').click({force:true});
  await page.locator('.editorial-text-sheet:not([hidden])').waitFor();
  const field=page.locator('.editorial-text-writing .cronica-rich-headline');
  await field.fill('Probando el editor móvil');
  assert.equal(await page.locator('#headline').inputValue(),'Probando el editor móvil',brand+' source sync');
  await field.evaluate(n=>{const r=document.createRange();r.selectNodeContents(n);const s=getSelection();s.removeAllRanges();s.addRange(r)});
  await page.locator('.editorial-text-tools #formatItalic').click();
  assert.match(await page.locator('#headline').inputValue(),/_Probando el editor móvil_/,brand+' italic');
  await page.locator('.editorial-text-tools #alignLeft').click();
  assert.equal(await page.locator('#alignLeft').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>{
   const viewport=window.visualViewport;
   Object.defineProperty(window,'visualViewport',{configurable:true,value:{height:440,offsetTop:24}});
   window.dispatchEvent(new Event('resize'));
   Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport});
  });
  assert.equal(await page.locator('.editorial-text-sheet').evaluate(n=>n.style.height),'440px');
  assert.equal(await page.locator('.editorial-text-sheet').evaluate(n=>n.style.top),'24px');
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
  await page.locator('.editorial-text-done').click();
  assert.equal(await page.locator('.editorial-text-sheet').getAttribute('hidden'),'');
  assert.equal(await page.locator('.editorial-text-writing .cronica-rich-headline').count(),0,brand+' restored field');
  await page.locator('.modern-text-hit,#dsHeadlineHitButton').click({force:true});
  await page.locator('.editorial-text-sheet:not([hidden])').waitFor();
  assert.equal(await field.innerText(),'Probando el editor móvil');
  await page.setViewportSize({width:1415,height:900});
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.editorial-text-sheet').getAttribute('hidden'),'');
  assert.equal(await page.locator('.editorial-text-tools .typography-row').count(),0);
  console.log(brand+': editing, formatting, alignment, close/reopen and desktop restore OK; page errors: '+JSON.stringify(errors));
  await page.close();
 }
}finally{await browser.close()}
