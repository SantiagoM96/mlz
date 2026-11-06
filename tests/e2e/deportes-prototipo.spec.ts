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
