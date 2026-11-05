import { expect, test } from '@playwright/test';

const route = '/agenda-de-la-comunidad/consola-preview';

test('consola demostrativa: muestra formulario y actualiza la tarjeta en vivo', async ({ page }, info) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Nueva actividad' })).toBeVisible();
  const isMobile = (info.project.use.viewport?.width ?? 0) < 1024;
  const title = page.getByLabel('Título');
  await title.fill('Jornada de reciclaje');

  if (isMobile) {
    await expect(page.getByTestId('console-preview-card')).toBeHidden();
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }

  const card = page.getByTestId('console-preview-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Jornada de reciclaje');
  await expect(card).toContainText('Todos los sábados');
  await expect(card).toContainText('Del 07/11/2026 al 28/11/2026');
  await expect(card).toContainText('10:00 a 12:00 h');

  if (isMobile) {
    await page.getByRole('button', { name: 'Volver al formulario' }).click();
    await expect(page.getByLabel('Título')).toHaveValue('Jornada de reciclaje');
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('consola demostrativa: programaciones e inscripción son editables sin guardar', async ({ page }, info) => {
  await page.goto(route);
  await page.getByRole('combobox', { name: 'Modalidad', exact: true }).selectOption('in-person');
  await expect(page.getByLabel('Enlace de inscripción')).toHaveCount(0);
  await expect(page.getByLabel('Información de inscripción', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Tipo de fecha', exact: true }).selectOption('exact');
  await expect(page.getByLabel('Hasta')).toHaveCount(0);
  await page.getByRole('button', { name: /Agregar otra programación/ }).click();
  await expect(page.getByRole('heading', { name: 'Programación 2' })).toBeVisible();
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await expect(page.getByTestId('console-preview-card')).toContainText('programación');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Formulario', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Guardar actividad' }).click();
  await expect(page.getByRole('status')).toContainText('No se guardó ni publicó ninguna actividad');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('consola demostrativa: captura de pantalla responsive', async ({ page }, info) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Nueva actividad' })).toBeVisible();
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const shot = info.outputPath('consola-preview-' + info.project.name + '.png');
  await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
  await info.attach('consola-preview-' + info.project.name, { path: shot, contentType: 'image/png' });
});
