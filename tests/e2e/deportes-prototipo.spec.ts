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
  await expect(form.locator('#medaltura, #medpeso, #sangre, #rh, #archivo_frente, #archivo_dorso')).toHaveCount(0);
  await expect(form.locator('[data-health-show="condicionSalud"]')).toBeHidden();
  await form.locator('[name="condicionSalud"][value="Si"]').check();
  await expect(form.locator('[data-health-show="condicionSalud"]')).toBeVisible();
  await form.locator('[name="patologias"][value="Otra condición"]').check();
  await expect(form.locator('#otraCondicion')).toBeVisible();
  await form.locator('#otraCondicion').fill('Dato ficticio');
  await form.locator('[name="condicionSalud"][value="No"]').check();
  await expect(form.locator('#otraCondicion')).toBeHidden();
  await expect(form.locator('#otraCondicion')).toHaveValue('');
  await form.locator('[name="medicamentosRespuesta"][value="Si"]').check();
  await expect(form.locator('#medicamentos')).toBeVisible();
  await form.locator('[name="cud"][value="Si"]').check();
  await expect(form.locator('#archivo_cud')).toBeEnabled();
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
  await form.locator('[name="alergiasRespuesta"][value="Si"]').check();
  await form.locator('#alergias').fill('Ejemplo ficticio');
  const activities = await page.evaluate('JSON.stringify(ACTIVITIES)');
  release(JSON.stringify([{activities:JSON.parse(String(activities)),revision:999}]));
  await expect.poll(() => page.evaluate('mlzLastPublicRevision')).toBe(999);
  await expect(form.locator('#alergias')).toHaveValue('Ejemplo ficticio');
  await expect(form.locator('[name="alergiasRespuesta"][value="Si"]')).toBeChecked();
});
