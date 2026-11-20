import { expect, test } from '@playwright/test';

test('catálogo react: 125 trámites, búsqueda, filtros y limpieza', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('patente');
  await expect(page.getByTestId('tramite-row').first()).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
});

test('ficha R036: información editorial y estructura de Figma', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solicitar un certificado para escribanía');
  await expect(page.getByRole('heading', { name: 'Documentación', exact: true })).toBeVisible();
  await expect(page.locator('#documentacion')).toContainText(/1361|catastral|DNI/i);
  await expect(page.getByRole('navigation', { name: 'Índice de la ficha' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir' }).first()).toBeVisible();
  await expect(page.locator('.tram-detail-main #relacionados')).toBeVisible();
  await expect(page.locator('#relacionados .tram-related-card')).toHaveCount(3);
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(4);
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/i })).toHaveCount(0);
});

test('ficha R036 mobile: índice previo al contenido y sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites/R036');
  const mobileTools = page.locator('.tram-detail-mobile-tools');
  await expect(mobileTools.getByRole('navigation', { name: 'Índice de la ficha' })).toBeVisible();
  await expect(mobileTools.getByRole('button', { name: 'Compartir' })).toBeVisible();
  await expect(page.locator('.tram-detail-aside')).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('fichas: ruta dinámica y navegación directa', async ({ page }) => {
  await page.goto('/tramites/R018');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('automotor');
  await expect(page.locator('#costos')).toBeVisible();
  await page.goto('/tramites/R999');
  await expect(page.getByRole('heading', { name: 'No encontramos ese trámite' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver al catálogo' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
});

test('ficha R001: muestra únicamente enlace de plataforma declarado en la fuente', async ({ page }) => {
  await page.goto('/tramites/R001');
  const link = page.getByRole('link', { name: 'Ir al sitio del trámite' });
  await expect(link).toHaveAttribute('href', 'https://proveedores.lomasdezamora.gov.ar');
});
