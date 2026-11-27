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
 const desktop=(page.viewportSize()?.width??1440)>680;
 await expect(page.locator(desktop?'.deportes-menu:visible':'.deportes-sheet-list:visible')).toHaveCount(1);
 if(!desktop)return;
 const afterY=await page.evaluate(()=>window.scrollY);
 expect(Math.abs(afterY-previousY)).toBeLessThan(2);
 await page.evaluate(()=>window.scrollBy(0,160));
 await expect(page.locator('.deportes-menu')).toHaveCount(0);
 await expect(field).toHaveAttribute('aria-expanded','false');
});

test('Consola Deportes: historial ficticio e inscripción asistida usan la declaración simplificada', async ({page})=>{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="registrations"]').first().click();
 const rows=page.locator('.registration-admin-table tbody [data-action="registration-detail"]');
 await expect(rows).toHaveCount(96);
 await rows.first().click();
 await expect(page.getByText('Información de salud',{exact:true})).toBeVisible();
 await expect(page.getByText('Autorizaciones',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Cerrar',exact:true}).last().click();
 await page.locator('[data-action="enroll-new"]').click();
 await page.locator('[data-action="en-pick"]').first().click();
 await page.locator('[name="en-option"]').first().check();
 await page.locator('[data-action="en-next"]').click();
 const form=page.locator('#en-form');
 await expect(form).toBeVisible();
 await expect(form.locator('[name="medaltura"],[name="sangre"],[name="diagnostico"]')).toHaveCount(0);

  await expect(form.locator('[data-health-show="health"]')).toBeHidden();
  const healthSwitch = form.getByRole('switch', {name:'Condiciones de salud',exact:true});
  await expect(healthSwitch).toHaveCSS('width','44px');
  await expect(healthSwitch).toHaveCSS('height','26px');
  await expect(healthSwitch).toHaveCSS('background-color','rgb(210, 217, 223)');
  await form.locator('[name="healthTopics"][value="health"]').check();
  await expect(healthSwitch).toHaveCSS('background-color','rgb(0, 110, 255)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-left-width','0px');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('background-color','rgb(245, 248, 250)');
  await expect(form.locator('[data-health-show="health"]')).toBeVisible();
  await form.locator('[name="health_health_options"][value="Asma"]').check();
  await form.locator('[name="health_health_options"][value="other"]').check();
  await expect(form.locator('#en-health_health_other')).toBeVisible();
  await form.locator('#en-health_health_other').fill('Dato ficticio');
  await form.locator('#en-health_health_detail').fill('Cuidado ficticio');
  await form.locator('[name="health_health_options"][value="other"]').uncheck();
  await expect(form.locator('#en-health_health_other')).toHaveValue('');
  await expect(form.locator('#en-health_health_detail')).toHaveValue('Cuidado ficticio');
  await form.locator('[name="healthTopics"][value="allergy"]').check();
  await expect(form.locator('#en-health_allergy_detail')).toBeVisible();
  await expect(form.locator('[name="healthTopics"][value="health"]')).toBeChecked();
  await form.locator('[name="healthNone"]').check();
  await expect(form.locator('[name="healthTopics"]:checked')).toHaveCount(0);
  await expect(form.locator('#en-health_health_detail')).toBeHidden();
  await expect(form.locator('#en-health_health_detail')).toHaveValue('');
  await form.locator('[name="healthTopics"][value="surgery"]').check();
  await expect(form.locator('[name="healthNone"]')).not.toBeChecked();
  await expect(form.locator('#en-health_surgery_detail')).toBeVisible();
  await form.locator('[name="health_surgery_options"][value="other"]').check();
  await expect(form.locator('#en-health_surgery_other')).toBeVisible();
  await form.locator('#en-health_surgery_other').fill('Lesión ficticia');
  await form.locator('#en-health_surgery_detail').fill('Cuidado adicional ficticio');
  await expect(form.locator('#en-health_surgery_other')).toHaveValue('Lesión ficticia');
  await expect(form.locator('#en-health_surgery_detail')).toHaveValue('Cuidado adicional ficticio');
 await form.locator('[name="cud"][value="Si"]').check();
 await expect(form.locator('#en-archivo-cud')).toBeEnabled();
  await expect(form.locator('[name="healthNone"]')).toHaveAttribute('type','radio');
  await expect(form.locator('[name="cud"][value="Si"]').locator('..').locator('.mlz-selection-symbol')).toHaveCSS('color','rgb(0, 110, 255)');
  const file=form.locator('#en-archivo_cud'.replace('en-archivo_cud','en-archivo-cud'));
  const attachment=file.locator('xpath=../..');
  await expect(attachment.locator('.mlz-attachment-control')).toHaveCSS('height','48px');
  await file.setInputFiles({name:'invalido.txt',mimeType:'text/plain',buffer:Buffer.from('demo')});
  await expect(attachment.locator('.mlz-attachment-error')).toContainText('Formato no compatible');
  await file.setInputFiles({name:'certificado.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 demo')});
  await expect(attachment.locator('.mlz-attachment-control')).toHaveAttribute('data-phase','uploading');
  await expect(attachment.locator('.mlz-attachment-control')).toHaveAttribute('data-phase','completed',{timeout:10000});
  await expect(attachment.locator('.mlz-attachment-value')).toHaveText('certificado.pdf');
  await expect(attachment.getByRole('button',{name:'Cambiar',exact:true})).toBeVisible();
  await attachment.getByRole('button',{name:'Quitar certificado.pdf'}).click();
  await expect(attachment.locator('.mlz-attachment-control')).toHaveAttribute('data-phase','empty');
  await expect(file).toHaveValue('');

 await form.locator('[name="cud"][value="No"]').check();
 await expect(form.locator('#en-archivo-cud')).toBeDisabled();
});

test('Consola Deportes: el catálogo tardío no reinicia la inscripción asistida',async ({page})=>{
 let release!: (body:string)=>void;
 const payload=new Promise<string>(resolve=>{release=resolve;});
 await page.route('**/rest/v1/mlz_sports_state?**',async route=>{
  await route.fulfill({status:200,contentType:'application/json',body:await payload});
 });
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="registrations"]').first().click();
 await page.locator('[data-action="enroll-new"]').click();
 await page.locator('[data-action="en-pick"]').first().click();
 await page.locator('[name="en-option"]').first().check();
 await page.locator('[data-action="en-next"]').click();
 const form=page.locator('#en-form');
 await form.locator('[name="healthTopics"][value="allergy"]').check();
 await form.locator('#en-health_allergy_detail').fill('Ejemplo ficticio');
 const activities=await page.evaluate('JSON.stringify(records)');
 release(JSON.stringify([{activities:JSON.parse(String(activities)),revision:999}]));
 await expect(page.locator('.mlz-demo-status')).toContainText('Revisión 999');
 await expect(form.locator('#en-health_allergy_detail')).toHaveValue('Ejemplo ficticio');
 await expect(form.locator('[name="healthTopics"][value="allergy"]')).toBeChecked();
});
