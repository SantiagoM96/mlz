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

  await expect(form.locator('[data-health-show="health"]')).toBeHidden();
  const healthSwitch = form.getByRole('switch', {name:'Condiciones de salud',exact:true});
  await expect(healthSwitch).toHaveCSS('width','44px');
  await expect(healthSwitch).toHaveCSS('height','26px');
  await expect(healthSwitch).toHaveCSS('background-color','rgb(210, 217, 223)');
  await form.locator('[name="healthTopics"][value="health"]').check();
  await expect(healthSwitch).toHaveCSS('background-color','rgb(0, 110, 255)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('border-left-width','0px');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await expect(form.locator('[data-health-show="health"]')).toHaveCSS('padding-left','0px');
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
  await form.locator('[name="healthNone"]').check();
  await expect(form.locator('[name="healthTopics"]:checked')).toHaveCount(0);
  await expect(form.locator('#health_health_detail')).toBeHidden();
  await expect(form.locator('#health_health_detail')).toHaveValue('');
  await form.locator('[name="healthTopics"][value="surgery"]').check();
  await expect(form.locator('[name="healthNone"]')).not.toBeChecked();
  await expect(form.locator('#health_surgery_detail')).toBeVisible();
  await form.locator('[name="health_surgery_options"][value="other"]').check();
  await expect(form.locator('#health_surgery_other')).toBeVisible();
  await form.locator('#health_surgery_other').fill('Lesión ficticia');
  await form.locator('#health_surgery_detail').fill('Cuidado adicional ficticio');
  await expect(form.locator('#health_surgery_other')).toHaveValue('Lesión ficticia');
  await expect(form.locator('#health_surgery_detail')).toHaveValue('Cuidado adicional ficticio');
  await form.locator('[name="cud"][value="Si"]').check();
  await expect(form.locator('#archivo_cud')).toBeEnabled();
  await expect(form.locator('[name="healthNone"]')).toHaveAttribute('type','radio');
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
  release(JSON.stringify([{activities:JSON.parse(String(activities)),revision:999}]));
  await expect.poll(() => page.evaluate('mlzLastPublicRevision')).toBe(999);
  await expect(form.locator('#health_allergy_detail')).toHaveValue('Ejemplo ficticio');
  await expect(form.locator('[name="healthTopics"][value="allergy"]')).toBeChecked();
});
