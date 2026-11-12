import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const cases=[
 {slug:'cronica-dev',active:0},
 {slug:'diarioshow-dev',active:1},
 {slug:'bae-dev',active:2}
];
const destinations=['../cronica-dev/','../diarioshow-dev/','../bae-dev/'];
const layouts={};
for(const viewport of [1440,390]){
 layouts[viewport]=[];
 for(const config of cases){
  const page=await browser.newPage({viewport:{width:viewport,height:900},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8765/'+config.slug+'/',{waitUntil:'load'});
  await page.locator('.editor-platform-switcher .editor-platform-option').first().waitFor();
  const result=await page.evaluate(()=>{
   const nodes=[...document.querySelectorAll('.editor-platform-switcher .editor-platform-option')];
   const header=document.querySelector('.header-inner').getBoundingClientRect();
   const back=document.querySelector('.dashboard-back-link').getBoundingClientRect();
   return {
    logos:nodes.map(n=>{
     const img=n.querySelector('img'),rect=n.getBoundingClientRect(),iRect=img.getBoundingClientRect(),s=getComputedStyle(n);
     return {href:n.getAttribute('href'),active:n.getAttribute('aria-current')==='page',
       color:s.filter,background:s.backgroundColor,logoNatural:img.naturalWidth,
       x:n.offsetLeft,right:rect.right,y:n.offsetTop,w:n.offsetWidth,h:n.offsetHeight,imgW:img.offsetWidth,imgH:img.offsetHeight};
    }),
    header:{x:header.x,right:header.right},back:{x:back.x,right:back.right}
   };
  });
  if(result.logos.length!==3)throw Error(config.slug+': no hay tres logos');
  if(result.logos.some((l,i)=>l.active!==(i===config.active)))throw Error(config.slug+': logo activo equivocado');
  if(result.logos.some((l,i)=>!l.logoNatural||l.background!=='rgba(0, 0, 0, 0)'||
    (i===config.active?l.color!=='none':!l.color.includes('grayscale(1)'))))throw Error(config.slug+': colores o imágenes incorrectos '+JSON.stringify(result.logos));
  if(result.logos.some((l,i)=>i>0&&l.x<result.logos[i-1].right-3)||
   result.logos[2].right>result.back.x+3)throw Error(config.slug+': logos superpuestos '+JSON.stringify(result));
  if(result.back.right>viewport+2)throw Error(config.slug+': botón Volver fuera de viewport');
  layouts[viewport].push(result.logos.map(l=>({x:l.x,w:l.w,h:l.imgH})));
  console.log('PASS header',config.slug,'viewport',viewport,'active',config.active,'logos',result.logos.map(l=>Math.round(l.imgH)));
  await page.close();
 }
 // El selector no depende de la marca activa: mismas ubicaciones y dimensiones de imagen.
 const baseline=layouts[viewport][0];
 for(let site=1;site<3;site++){
  for(let i=0;i<3;i++){
   const expected=baseline[i],actual=layouts[viewport][site][i];
   if(Math.abs(expected.x-actual.x)>3||Math.abs(expected.h-actual.h)>2)
    throw Error('El header se desplaza al cambiar de plataforma viewport='+viewport+
     ' site='+site+' logo='+i+' baseline='+JSON.stringify(expected)+' actual='+JSON.stringify(actual));
  }
 }
}
await browser.close();
console.log('PASS los tres headers tienen el mismo orden, posiciones y sólo cambia la marca activa');
