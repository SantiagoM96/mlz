import { expect, test } from '@playwright/test';

const prototype = '/prototipos/deportes_formulario_resumen_compacto.html';

test('Deportes: seleccionar horario, inscribirse y usar el formulario sin bloqueo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(prototype + '#02_seleccion_horario.html', { waitUntil: 'domcontentloaded' });
  // Hasta 850px se abre primero la pestaña Información; Horarios es una vista separada.
  if ((page.viewportSize()?.width ?? 1415) <= 850) {
    await page.locator('.mobile-view-schedules').click();
  }
  const schedules = page.locator('.option');
  await expect(schedules.first()).toBeVisible();
  await schedules.first().click();

  const go = page.locator('#continue');
  await expect(go).toBeEnabled();
  await go.click();

  await expect.poll(() => new URL(page.url()).hash).toContain('03_formulario_inscripcion.html');
  // El circuito actual introduce el trámite antes de mostrar el formulario.
  await expect(page.locator('.enrollment-guide')).toBeVisible();
  await page.getByRole('link', { name: /Iniciar inscripción/ }).click();
  await expect(page).toHaveURL(/paso=form/);
  const form = page.locator('#signup');
  await expect(form).toBeVisible();
  await expect(page.locator('#personalTitle')).toBeVisible();

  // Detección de event loop bloqueado: si vuelve el observer recursivo,
  // esta lectura y las interacciones agotan el timeout.
  await expect(page.locator('#nombre')).toHaveValue('Lucía');
  await expect(page.locator('#nombre')).toBeDisabled();
  await expect(page.locator('#minorNote')).toBeVisible();

  const switchMinor = page.locator('#minor');
  await switchMinor.check({ force: true });
  await expect(page.locator('#minorNote')).toBeHidden();
  await expect(page.locator('#nombre')).toBeEnabled();
  await page.locator('#nombre').fill('Ana');

  const gender = page.locator('#formButton_genero');
  await expect(gender).toBeEnabled();
  await gender.click();
  const mobile = (await page.viewportSize())!.width <= 680;
  const options = mobile ? page.locator('#formOptionSheet .form-option-row') : page.locator('#formOptions_genero .form-option-row');
  await expect(options.first()).toBeVisible();
  await options.filter({ hasText: 'Femenino' }).first().click();
  await expect(gender.locator('.select-value')).toHaveText('Femenino');

  await expect.poll(() => page.evaluate(() => document.readyState)).toBe('complete');
  expect(errors).toEqual([]);
});

// Regression: URL completa compartida por el diseñador, con query y deep-link hash.
// Un error de sintaxis en cualquier <script> dejaba el body blanco sin mostrar el formulario.
test('Deportes: la URL pública directa del formulario no queda en blanco', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(
    prototype + '?utm_source=chatgpt.com#03_formulario_inscripcion.html?ficha=act-003-gimnasio-de-deportes-de-combate&comision=1',
    { waitUntil: 'domcontentloaded' },
  );
  await expect(page.locator('.enrollment-guide')).toBeVisible();
  await page.getByRole('link', { name: /Iniciar inscripción/ }).click();
  await expect(page.locator('#signup')).toBeVisible();
  await expect(page.locator('#personalTitle')).toBeVisible();
  await expect(page.locator('.form-title')).toHaveText('Boxeo femenino');
  await expect(page.locator('.summary-row')).toContainText('Martes y Jueves');
  await expect(page.locator('body')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test('Deportes: la declaración de salud y los adjuntos se muestran según la respuesta', async ({ page }) => {
  await page.goto(prototype + '#03_formulario_inscripcion.html?ficha=act-003-gimnasio-de-deportes-de-combate&comision=1&paso=form');
  const form = page.locator('#signup');
  await expect(form).toBeVisible();
  await expect(form.locator('.personal-source-note')).toHaveCSS('font-size','18px');
  await expect(form.locator('#medaltura, #medpeso, #sangre, #rh, #archivo_frente, #archivo_dorso')).toHaveCount(0);

  const healthAlert=form.locator('.mlz-health-alert');
  await expect(healthAlert).toBeVisible();
  await expect(healthAlert.locator('strong')).toHaveText('Cuidemos tu salud');
  await expect(healthAlert.locator('strong')).toHaveCSS('font-size','18px');
  await expect(healthAlert.locator('strong')).toHaveCSS('font-weight','700');
  await expect(healthAlert.locator('p')).toHaveCSS('font-size','18px');
  await expect(healthAlert.locator('p')).toHaveCSS('font-weight','400');
  await expect(healthAlert).toHaveCSS('background-color','rgb(229, 240, 255)');
  await expect(healthAlert).toHaveCSS('padding-top','16px');
  await expect(healthAlert.locator('xpath=following-sibling::*[1]')).toHaveClass('health-topics');
  await expect(form.locator('.health-topics > legend')).toHaveCSS('font-size','18px');
  await expect(form.locator('.health-topics > legend')).toHaveCSS('font-weight','700');
  await expect(form.locator('.health-topics > .health-hint')).toHaveCSS('font-size','18px');
  await expect(form.locator('[data-health-show="health"]')).toBeHidden();
  const healthSwitch = form.getByRole('switch', {name:'Condiciones de salud',exact:true});
  await expect(healthSwitch).toHaveCSS('width','44px');
  await expect(healthSwitch).toHaveCSS('height','26px');
  await expect(healthSwitch).toHaveCSS('background-color','rgb(210, 217, 223)');
  await form.locator('[name="healthTopics"][value="health"]').check();
  await expect(healthSwitch).toHaveCSS('background-color','rgb(0, 110, 255)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-left-width','1px');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-top-width','1px');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-top-left-radius','8px');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-left-color','rgb(220, 228, 234)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('padding-left',(page.viewportSize()?.width??1440)<=680?'12px':'16px');
  const switchRow=healthSwitch.locator('..');
  await expect(switchRow.locator('strong')).toHaveCSS('font-size','18px');
  await expect(switchRow.locator('strong')).toHaveCSS('font-weight','700');
  await expect(switchRow.locator('.health-hint')).toHaveCSS('font-size','18px');
  await expect(switchRow.locator('.health-hint')).toHaveCSS('font-weight','400');
  await expect(form.locator('[data-health-show="health"]')).toBeVisible();
  await form.locator('[name="health_health_options"][value="Asma"]').check();
  await form.locator('[name="health_health_options"][value="other"]').check();
  await expect(form.locator('#health_health_other')).toBeVisible();
  await form.locator('#health_health_other').fill('Dato ficticio');
  await form.locator('#health_health_detail').fill('Cuidado ficticio');
  await form.locator('[name="health_health_options"][value="other"]').uncheck();
  await expect(form.locator('#health_health_other')).toHaveValue('');
  await expect(form.locator('#health_health_detail')).toHaveValue('Cuidado ficticio');
  await form.locator('[name="healthTopics"][value="allergy"]').check();
  await expect(form.locator('#health_allergy_detail')).toBeVisible();
  await expect(form.locator('[name="healthTopics"][value="health"]')).toBeChecked();
  await expect(form.locator('[name="healthNone"]')).toHaveCount(0);
  await expect(form.locator('.health-topic').last().getByRole('switch',{name:'Apoyos y adaptaciones',exact:true})).toBeVisible();
  await form.locator('[name="healthTopics"][value="health"]').uncheck();
  await form.locator('[name="healthTopics"][value="allergy"]').uncheck();
  await expect(form.locator('[name="healthTopics"]:checked')).toHaveCount(0);
  await expect(form.locator('#health_health_detail')).toBeHidden();
  await expect(form.locator('#health_health_detail')).toHaveValue('');
  await form.locator('[name="healthTopics"][value="surgery"]').check();
  await expect(form.locator('#health_surgery_detail')).toBeVisible();
  await form.locator('[name="health_surgery_options"][value="other"]').check();
  await expect(form.locator('#health_surgery_other')).toBeVisible();
  await form.locator('#health_surgery_other').fill('Lesión ficticia');
  await form.locator('#health_surgery_detail').fill('Cuidado adicional ficticio');
  await expect(form.locator('#health_surgery_other')).toHaveValue('Lesión ficticia');
  await expect(form.locator('#health_surgery_detail')).toHaveValue('Cuidado adicional ficticio');
  await form.locator('[name="cud"][value="Si"]').check();
  await expect(form.locator('#archivo_cud')).toBeEnabled();
  await expect(form.locator('[name="cud"][value="Si"]').locator('..').locator('.mlz-selection-symbol')).toHaveCSS('color','rgb(0, 110, 255)');
  const file=form.locator('#archivo_cud'.replace('en-archivo_cud','en-archivo-cud'));
  const attachment=file.locator('xpath=../..');
  await expect(attachment.locator('.mlz-attachment-control')).toHaveCSS('height','48px');
  const documentWidths=await attachment.evaluate(el=>({field:el.getBoundingClientRect().width,container:el.parentElement!.getBoundingClientRect().width,control:el.querySelector('.mlz-attachment-control')!.getBoundingClientRect().width}));
  expect(Math.abs(documentWidths.field-documentWidths.container)).toBeLessThan(1);
  expect(Math.abs(documentWidths.control-documentWidths.field)).toBeLessThan(1);
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
  await expect(form.locator('#archivo_cud')).toBeDisabled();
  await expect(form.locator('[name="urgencia"]:checked, [name="imagenes"]:checked')).toHaveCount(0);
});

test('Deportes: una respuesta tardía del catálogo no borra la inscripción', async ({ page }) => {
  let release!: (body: string) => void;
  const payload = new Promise<string>(resolve => { release = resolve; });
  await page.route('**/rest/v1/mlz_sports_state?**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: await payload });
  });
  await page.goto(prototype + '#03_formulario_inscripcion.html?ficha=act-003-gimnasio-de-deportes-de-combate&comision=1&paso=form', {waitUntil:'domcontentloaded'});
  const form = page.locator('#signup');
  await form.locator('[name="healthTopics"][value="allergy"]').check();
  await form.locator('#health_allergy_detail').fill('Ejemplo ficticio');
  const activities = await page.evaluate('JSON.stringify(ACTIVITIES)');
  const updated=JSON.parse(String(activities));
  const activity=updated.find((a: {id:string})=>a.id==='act-003-gimnasio-de-deportes-de-combate');
  activity.tipo='Recreativo / Competitivo / Federado';
  activity.commissions.forEach((c:{tipo:string})=>{c.tipo='Recreativo'});
  release(JSON.stringify([{activities:updated,revision:999}]));
  await expect.poll(() => page.evaluate('mlzLastPublicRevision')).toBe(999);
  await expect(form.locator('#tipo')).toBeEnabled();
  await expect(form.locator('#formButton_tipo')).toBeEnabled();
  await expect(form.locator('#tipo option')).toHaveText(['Seleccionar','Recreativo','Competitivo','Federado']);
  await form.locator('#formButton_tipo').click();
  const mobile=(page.viewportSize()?.width??1440)<=680;
  await expect(page.locator(mobile?'#formOptionSheet .form-option-row':'#formOptions_tipo .form-option-row')).toHaveCount(3);
  await page.locator(mobile?'#formOptionSheet .form-option-row':'#formOptions_tipo .form-option-row').filter({hasText:'Federado'}).click();
  await expect(form.locator('#tipo')).toHaveValue('Federado');
  await expect(form.locator('#archivo_fed')).toBeEnabled();
  await expect(form.locator('#archivo_comp')).toBeDisabled();
  await expect(form.locator('#condicion')).toBeDisabled();
  await expect(form.locator('#health_allergy_detail')).toHaveValue('Ejemplo ficticio');
  await expect(form.locator('[name="healthTopics"][value="allergy"]')).toBeChecked();
});

test('Deportes: no publica actividades sin comisiones y conserva las completas',async ({page})=>{
 await page.route('**/rest/v1/mlz_sports_state?**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await page.goto(prototype+'#01_buscador.html');
 const sample=await page.evaluate('JSON.stringify(BASE_ACTIVITIES[0])');
 const base=JSON.parse(String(sample));
 const without={...base,id:'qa-sin-comisiones',name:'QA sin comisiones',_hidden:false,commissions:[]};
 const full={...base,id:'qa-lista-espera',name:'QA lista de espera',_hidden:false,commissions:[{...base.commissions[0],cupos:0}]};
 const hidden={...base,id:'qa-oculta',name:'QA oculta',_hidden:true};
 await page.unroute('**/rest/v1/mlz_sports_state?**');
 await page.route('**/rest/v1/mlz_sports_state?**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{revision:101,activities:[without,full,hidden]}])}));
 await page.evaluate('loadSharedActivities()');
 await expect.poll(()=>page.evaluate('ACTIVITIES.map(a=>a.id)')).toEqual(['qa-lista-espera']);
 await expect(page.getByText('QA lista de espera',{exact:true})).toBeVisible();
 await expect(page.getByText('QA sin comisiones',{exact:true})).toHaveCount(0);
 await page.goto(prototype+'#02_seleccion_horario.html?ficha=qa-lista-espera');
 await expect(page.locator('.d-title')).toHaveText('QA lista de espera');
 if((page.viewportSize()?.width??1440)<=850)await page.locator('.mobile-view-schedules').click();
 await page.locator('.option').first().click();
 await expect(page.locator('#continue')).toHaveText('Anotarme en lista de espera');
 await expect(page.locator('#continue')).toBeEnabled();
 await page.goto(prototype+'#02_seleccion_horario.html?ficha=qa-sin-comisiones');
 await expect(page).toHaveURL(/#01_buscador.html$/);
 await page.goto(prototype+'#03_formulario_inscripcion.html?ficha=qa-sin-comisiones&comision=0&paso=form');
 await expect(page).toHaveURL(/#01_buscador.html$/);
 await expect(page.locator('#signup')).toHaveCount(0);
});
