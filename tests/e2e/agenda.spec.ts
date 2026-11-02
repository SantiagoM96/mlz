import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const response = await page.goto('/agenda-de-la-comunidad');
  expect(response?.ok()).toBeTruthy();
});

test('Agenda principal responsive, imágenes y navegación', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: '¡Agenda Anual de la Comunidad 2026!' })).toBeVisible();
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
  await expect(page.getByTestId('agenda-card')).toHaveCount(testInfo.project.name.startsWith('mobile') ? 6 : 9);
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(noOverflow).toBe(true);
  const first = page.getByTestId('agenda-card').first().locator('img');
  await expect(first).toBeVisible();
  expect(await first.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('header')).toHaveCSS('background-color','rgb(35, 105, 153)');
});

test('Búsqueda, estado vacío y limpiar filtros', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Buscar actividades' });
  await input.fill('Patin');
  await expect(page.getByTestId('agenda-card')).toHaveCount(6);
  await input.fill('término inexistente123');
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('agenda-card')).not.toHaveCount(0);
});

test('Filtros por categoría con chips removibles', async ({ page }) => {
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('checkbox', { name: 'Ambiental' }).check();
  await dialog.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Ambiental' }).click();
  await expect(page.getByTestId('agenda-card')).not.toHaveCount(0);
});

test('Detalle de tarjeta y alternancia de vista de mapa', async ({ page }) => {
  await page.getByTestId('agenda-card').first().getByRole('button', { name: /Ver más/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Futbol' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar detalle' }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Ver mapa' }).click();
  await expect(page.getByRole('heading', { name: 'Mapa de actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver grilla' }).click();
  await expect(page.getByTestId('agenda-grid')).toBeVisible();
});

test('Captura de Agenda desktop y mobile', async ({ page }, testInfo) => {
  const folder = testInfo.outputDir;
  await page.screenshot({ path: folder + '/agenda-' + testInfo.project.name + '.png', fullPage: true, animations: 'disabled' });
  await testInfo.attach('agenda-figma-' + testInfo.project.name, { path: folder + '/agenda-' + testInfo.project.name + '.png', contentType: 'image/png' });
});
