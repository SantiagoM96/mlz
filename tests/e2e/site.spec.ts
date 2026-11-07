import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
});

test('portada institucional provisional y recursos compartidos', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: 'Municipio de Lomas de Zamora', level: 1 })).toBeVisible();
  await expect(page.getByText('Los prototipos independientes de BAE, Crónica y Deportes')).toBeVisible();
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(35, 105, 153)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(61, 61, 61)');

  const failedImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
  );
  expect(failedImages).toEqual([]);

  const logo = page.locator('header').getByRole('img', { name: 'Comunidad Lomas' });
  if (testInfo.project.name === 'desktop-1415') {
    await expect(logo).toBeVisible();
  } else {
    await expect(logo).toBeHidden();
  }
});

test('portada sin overflow horizontal y menú responsive funcional', async ({ page }, testInfo) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const menuButton = page.getByRole('button', { name: 'Abrir navegación' });
  if (testInfo.project.name === 'desktop-1415') {
    await expect(menuButton).toBeHidden();
  } else {
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    const navigation = page.getByRole('navigation', { name: 'Navegación móvil' });
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Inicio' }).click();
    await expect(navigation).toBeHidden();
  }
});

test('rutas retiradas e inexistentes presentan 404', async ({ page }) => {
  for (const route of ['/agenda-de-la-comunidad', '/agenda-de-la-comunidad/actividades', '/jovenes-en-comunidad']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  }
  await page.goto('/ruta-que-no-existe');
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
});

test('BAE, Crónica y Deportes continúan accesibles', async ({ page }) => {
  for (const route of ['/bae/', '/cronica/', '/prototipos/deportes_formulario_resumen_compacto.html']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator('body')).not.toBeEmpty();
  }
});
