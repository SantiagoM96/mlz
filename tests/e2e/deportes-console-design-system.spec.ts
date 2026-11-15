import { test, expect } from '@playwright/test';

const url='/prototipos/consola-deportes-dev/index.html';

test('Consola de Deportes: DS MLZ en formulario, selects, botones y navegación',async ({page})=>{
 const pageErrors:string[]=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#app')).not.toBeEmpty();
 const add=page.getByRole('button',{name:/Agregar actividad/}).first();
 await expect(add).toBeVisible();
 await expect(add).toHaveCSS('background-color','rgb(35, 105, 153)');
 await expect(add).toHaveCSS('border-top-left-radius','4px');
 await add.click();
 await expect(page.locator('#activity-form')).toBeVisible();
 const name=page.locator('#activity-form #name');
 await expect(name).toHaveCSS('height','48px');
 await expect(name).toHaveCSS('border-top-left-radius','4px');
 await expect(name).toHaveCSS('color','rgb(61, 61, 61)');
 await name.fill('Actividad de muestra');
 await expect(name).toHaveValue('Actividad de muestra');
 await name.focus();
 await expect(name).toHaveCSS('border-top-color','rgb(0, 110, 255)');
 const trigger=page.locator('#activity-form .deportes-select-trigger').first();
 await expect(trigger).toBeVisible();
 await expect(trigger.locator('.mi')).toHaveCSS('color','rgb(35, 105, 153)');
 await trigger.click();
 const mobile=(page.viewportSize()?.width??1415)<=680;
 const options=page.locator(mobile?'.deportes-sheet-list':'.deportes-menu');
 await expect(options).toBeVisible();
 await expect(options).toHaveCSS('scrollbar-width','none');
 const selected=options.locator('.deportes-menu-option[aria-selected="true"]').first();
 await expect(selected).toHaveCSS('background-color','rgb(0, 110, 255)');
 await expect(selected).toHaveCSS('color','rgb(255, 255, 255)');
 // La interacción del select debe conservar la opción original.
 await options.locator('.deportes-menu-option').last().click();
 if(mobile)await page.getByRole('button',{name:'Confirmar',exact:true}).last().click();
 await expect(page.locator('#activity-form')).toBeVisible();
 expect(pageErrors).toEqual([]);
});

test('Consola de Deportes: el CSS institucional carga y conserva scrollbar global y de diálogos',async ({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const stylesheet=page.locator('link[rel="stylesheet"][href="./mlz-design-system.css"]');
 await expect(stylesheet).toHaveCount(1);
 const styleIsLoaded=await page.evaluate(()=>{
   const sheet=[...document.styleSheets].find(s=>s.href?.includes('mlz-design-system.css'));
   try{return Boolean(sheet && sheet.cssRules.length>0)}catch{return false}
 });
 expect(styleIsLoaded).toBe(true);
 const root=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--mlz-info-500').trim());
 expect(root).toBe('#006eff');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollbarWidth)).not.toBe('none');
});


test('Consola Deportes: checkboxes no tienen cajas y conservan la selección',async ({page})=>{
 await page.goto(url);
 await page.getByRole('button',{name:/Agregar actividad/}).first().click();
 await expect(page.locator('#activity-form')).toBeVisible();
 const disability=page.locator('#pcd');
 const disabilityLabel=page.locator('.sports-boolean-row .activity-toggle-card').filter({has:disability});
 await expect(disabilityLabel).toHaveCSS('border-top-width','0px');
 await expect(disabilityLabel).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 const symbol=disabilityLabel.locator('.outlined-check');
 await expect(symbol).toHaveCSS('color','rgb(35, 105, 153)');
 await disabilityLabel.click();
 await expect(disability).toBeChecked();
 await expect(symbol).toHaveCSS('color','rgb(0, 110, 255)');
 await expect(disabilityLabel).toHaveCSS('border-top-width','0px');
 const modality=page.locator('.activity-modality-options label').first();
 await expect(modality).toHaveCSS('border-top-width','0px');
 await modality.click();
 await expect(modality.locator('input[type=checkbox]')).toBeChecked();
 await expect(modality).toHaveCSS('border-top-width','0px');
});

test('Consola Deportes: abrir dropdown no desplaza la página y scroll exterior lo cierra',async ({page})=>{
 await page.goto(url);
 await page.getByRole('button',{name:/Agregar actividad/}).first().click();
 const field=page.locator('#activity-form .deportes-select-trigger').first();
 await field.scrollIntoViewIfNeeded();
 const previousY=await page.evaluate(()=>window.scrollY);
 await field.click();
 await expect(page.locator('.deportes-menu:visible')).toHaveCount(1);
 const afterY=await page.evaluate(()=>window.scrollY);
 expect(Math.abs(afterY-previousY)).toBeLessThan(2);
 const desktop=(page.viewportSize()?.width??1440)>680;
 if(!desktop){
  await expect(page.locator('.deportes-sheet-list')).toBeVisible();
  return;
 }
 await page.evaluate(()=>window.scrollBy(0,160));
 await expect(page.locator('.deportes-menu')).toHaveCount(0);
 await expect(field).toHaveAttribute('aria-expanded','false');
});
