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
  const rect=await page.locator(hit).boundingBox();
  if(!rect)throw Error('HIT BUTTON HIDDEN '+hit);
  const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
  // Real finger tap, not Playwright locator.click and not synthetic JS events.
  await page.touchscreen.tap(x,y);
  await page.waitForTimeout(130);
  actual.push(await state('finger-tap-'+(i+1)));
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
  const box=await page.locator('#'+id).boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(130);
 }
 const final=await state('after-roundtrip-clicks');
 requireState(final.context==='text'&&!final.textHidden&&final.logoHidden,'POST-TABS SWITCH FAIL '+JSON.stringify(final));
 console.log('CONTEXT DIAGNOSTIC',JSON.stringify({actual,afterTabs,final,issues},null,2));
 requireState(issues.length===0,'JS errors: '+issues.join('; '));
 console.log('PASS: mobile logo/text context switches 5 times + after tab roundtrip');
}catch(err){
 console.error('FAIL: '+err.stack);
 console.error('LAST STATE',JSON.stringify(await state('failure').catch(()=>null),null,2));
 console.error('JS ERRORS',JSON.stringify(issues));
 process.exitCode=1;
}finally{await browser.close();}
