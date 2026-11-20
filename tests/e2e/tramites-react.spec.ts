import { expect, test } from '@playwright/test';

test('catálogo: 125 trámites, búsqueda, limpieza y dropdown compartido con Agenda', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('patente');
  await expect(page.getByTestId('tramite-row').first()).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await expect(menu).toBeVisible();
  await menu.getByRole('checkbox', { name: 'Vehículos y tránsito' }).check();
  await menu.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(page.getByText('18 trámites', { exact: true })).toBeVisible();
});

test('ficha R036: índice de Jóvenes, contenido de Figma y sin campos descartados', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solicitar un certificado para escribanía');
  await expect(page.getByRole('heading', { name: 'Documentación', exact: true })).toBeVisible();
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Índice de la ficha' }).first()).toBeVisible();
  await expect(page.locator('.tram-detail-aside').getByRole('heading', { name: 'Índice' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir' }).first()).toBeVisible();
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
  await expect(page.locator('#relacionados')).toHaveCount(0);
  await expect(page.locator('#donde-cuando .tram-location-map')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/i })).toHaveCount(0);
});

test('ficha R018: separa correctamente los cuatro pasos de ORIGEN', async ({ page }) => {
  await page.goto('/tramites/R018');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('automotor');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(4);
  await expect(page.locator('#procedimiento')).not.toContainText('1\nRecepcionarse\n2');
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(3);
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
});

test('ficha mobile: índice antes del contenido, filtros tipo Agenda y sin desborde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites/R036');
  const tools = page.locator('.tram-detail-mobile-tools');
  await expect(tools.getByRole('navigation', { name: 'Índice de la ficha' })).toBeVisible();
  await expect(tools.getByRole('button', { name: 'Compartir' })).toBeVisible();
  await expect(page.locator('.tram-detail-aside')).toBeHidden();
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);

  await page.goto('/tramites');
  await page.getByRole('button', { name: '¿Para quién es?', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Opciones de ¿Para quién es?' })).toBeVisible();
  await expect(page.locator('.agenda-mobile-backdrop')).toBeVisible();
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('rutas directas y enlaces públicos verificables', async ({ page }) => {
  await page.goto('/tramites/R001');
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/ }))
    .toHaveAttribute('href', 'https://proveedores.lomasdezamora.gov.ar');
  await page.goto('/tramites/R999');
  await expect(page.getByRole('heading', { name: 'No encontramos ese trámite' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver al catálogo' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
});
