import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:8765/diarioshow-dev/?onboarding=off',{waitUntil:'load'});
const expected={quote:'rgba(230, 0, 141, 0)', 'quote-blue':'rgba(0, 166, 217, 0)'};
const full={quote:'rgb(230, 0, 141)','quote-blue':'rgb(0, 166, 217)'};
for(const variant of ['quote','quote-blue']){
 const option=page.locator('#dsMobileControlsPanel .ds-plate-design-group .ds-variant-option[data-variant="'+variant+'"]').first();
 const thumb=option.locator('.ds-variant-preview');
 const colors=await thumb.evaluate(el=>{
  const style=getComputedStyle(el);
  return {image:style.backgroundImage,color:style.backgroundColor};
 });
 if(!colors.image.includes(expected[variant])||!colors.image.includes(full[variant])||colors.color!=='rgb(174, 180, 188)')
  throw Error('Diseño de placas '+variant+': '+JSON.stringify(colors));
 await option.click();
 const slide=page.locator('.editor-slide-thumb[data-variant="'+variant+'"] .ds-variant-preview').first();
 await slide.waitFor();
 const copied=await slide.evaluate(el=>({image:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).backgroundColor}));
 if(copied.image!==colors.image||copied.color!==colors.color)
  throw Error('Diapositivas '+variant+' difiere de Diseño de placas: '+JSON.stringify({colors,copied}));
 console.log('PASS Diario Show',variant,'miniatura de variante y diapositivas usan exactamente el mismo degradé',colors.image);
}
await browser.close();
