import { expect, test } from '@playwright/test';

test('catálogo react: muestra 125 trámites y filtra por nombre', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('patente');
  await expect(page.getByTestId('tramite-row').first()).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toHaveCount(0);
});

test('ficha react: conserva datos de origen y navegación', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('certificado');
  await expect(page.getByRole('heading', { name: 'Documentación necesaria' })).toBeVisible();
  await expect(page.getByText('pendiente de validación', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Trámites', exact: true }).click();
  await expect(page).toHaveURL(/\/tramites$/);
});
