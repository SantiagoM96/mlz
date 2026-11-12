import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',err=>errors.push(err.message));
const url='http://127.0.0.1:8765/';
await page.goto(url+'bae-dev/?onboarding=off',{waitUntil:'load'});
const bae=await page.evaluate(()=>{
 const design=document.querySelector('.modern-design-group > .modern-body');
 const text=document.querySelector('.modern-text-card > .modern-body');
 const toggle=document.querySelector('#enableQuote');
 const textarea=document.querySelector('#quote');
 const controls=[...text.children].map(n=>({cls:n.className,headline:!!n.querySelector('#headline'),format:!!n.querySelector('.typography-row'),size:!!n.querySelector('#size'),quote:!!n.querySelector('#quote')}));
 return {designHasToggle:design?.contains(toggle),textHasInput:text?.contains(textarea),
  firstQuote:!!text?.firstElementChild?.querySelector('#quote'),
  lastSize:!!text?.lastElementChild?.querySelector('#size'),
  controls,
  label:getComputedStyle(text.querySelector('.typography-row .help-label-row>label')).fontSize,
  formatHeight:getComputedStyle(text.querySelector('.format-buttons button')).height,
  alignHeight:getComputedStyle(text.querySelector('.align-buttons button')).height,
  alignShadow:getComputedStyle(text.querySelector('.align-buttons button[aria-pressed="true"]')).boxShadow};
});
if(!bae.designHasToggle||!bae.textHasInput||!bae.firstQuote||!bae.lastSize||
 bae.label!=='14px'||bae.formatHeight!=='43px'||bae.alignHeight!=='43px'||bae.alignShadow==='none')
 throw Error('BAE: estructura/estilos incorrectos '+JSON.stringify(bae));
await page.locator('#enableQuote').uncheck({force:true});
if(await page.locator('.modern-track > .editor-panel .modern-quote-input-field').first().isVisible())throw Error('BAE: textual no se oculta');
await page.locator('#enableQuote').check({force:true});
if(!await page.locator('.modern-track > .editor-panel .modern-quote-input-field').first().isVisible())throw Error('BAE: textual no reaparece');
console.log('PASS BAE: switch en Diseño, campo arriba en Textos, tamaño al final, formato y alineación DS');
await page.goto(url+'diarioshow-dev/?onboarding=off',{waitUntil:'load'});
for(const variant of ['pink','blue','quote','quote-blue']){
 await page.locator('#dsMobileControlsPanel .ds-variant-option[data-variant="'+variant+'"]').first().click();
 const state=await page.evaluate(()=>{
  const design=document.querySelector('#dsMobileControlsPanel .ds-plate-design-group > .ds-control-card-body');
  const text=document.querySelector('#dsMobileControlsPanel .ds-texts-group > .ds-control-card-body');
  const authorField=document.querySelector('#quoteAuthorField');
  const switchField=document.querySelector('#quoteAuthorToggleField');
  const headline=document.querySelector('#headline');
  const size=document.querySelector('#size');
  return {designHasToggle:design?.contains(switchField),textHasAuthor:text?.contains(authorField),
   firstAuthor:text?.firstElementChild===authorField,
   authorVisible:!authorField.hidden,
   switchVisible:!switchField.hidden,
   sizeAfterHeadline:headline?.closest('.ds-headline-field')?.contains(size),
   inputVisible:!document.querySelector('#quoteAuthorInputField').hidden,
   theme:document.querySelector('#theme').value};
 });
 const quote=variant==='quote'||variant==='quote-blue';
 if(!state.designHasToggle||!state.textHasAuthor||!state.firstAuthor||
   state.authorVisible!==quote||state.switchVisible!==quote||!state.sizeAfterHeadline||state.theme!==variant)
  throw Error('Diario Show '+variant+': '+JSON.stringify(state));
 console.log('PASS Diario Show',variant,'switch visible',state.switchVisible,'campo condicionado',state.authorVisible);
 if(quote){
  await page.locator('#showQuoteAuthor').uncheck({force:true});
  if(await page.locator('#quoteAuthorInputField').isVisible())throw Error('Diario Show: autor no se oculta '+variant);
  await page.locator('#showQuoteAuthor').check({force:true});
  if(!await page.locator('#quoteAuthorInputField').isVisible())throw Error('Diario Show: autor no reaparece '+variant);
 }
}
if(errors.length)throw Error('Errores JS: '+errors.join(' | '));
await browser.close();
console.log('PASS Cambio 45: BAE y Diario Show');
