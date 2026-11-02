import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const response = await page.goto('/jovenes-en-comunidad');
  expect(response?.ok()).toBeTruthy();
  await page.locator('main img').first().waitFor({ state: 'visible' });
});

test('ruta, contenido, colores institucionales y logos cargados', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: 'Jóvenes en Comunidad', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Punto Joven', level: 3 })).toBeVisible();
  const header = page.locator('header');
  await expect(header).toHaveCSS('background-color', 'rgb(35, 105, 153)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(61, 61, 61)');
  await expect(page.getByRole('heading', { name: 'Jóvenes en Comunidad', level: 1 }))
    .toHaveCSS('color', 'rgb(35, 105, 153)');

  const failedImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
  );
  expect(failedImages, 'Hay imágenes o logos sin cargar').toEqual([]);

  const communityLogo = header.getByRole('img', { name: 'Comunidad Lomas' });
  if (testInfo.project.name === 'desktop-1415') {
    await expect(communityLogo).toBeVisible();
  } else {
    await expect(communityLogo).toBeHidden();
  }
});

test('sin overflow horizontal y con orden responsive correcto', async ({ page }, testInfo) => {
  const sizes = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(sizes.scrollWidth, 'Existe scroll horizontal no deseado').toBeLessThanOrEqual(sizes.viewportWidth + 1);

  const intro = page.getByRole('region', { name: 'Presentación de Jóvenes en Comunidad' });
  const aside = page.getByRole('complementary', { name: 'Índice y contacto de Jóvenes en Comunidad' });
  const initiatives = page.getByRole('heading', { name: 'INICIATIVAS', level: 2 });

  const introBox = await intro.boundingBox();
  const asideBox = await aside.boundingBox();
  const initiativesBox = await initiatives.boundingBox();

  expect(introBox).not.toBeNull();
  expect(asideBox).not.toBeNull();
  expect(initiativesBox).not.toBeNull();

  if (testInfo.project.name === 'desktop-1415') {
    expect(asideBox!.x).toBeGreaterThan(introBox!.x + introBox!.width);
    expect(asideBox!.y).toBeLessThan(initiativesBox!.y);
  } else {
    // Figma mobile: introducción → índice/contacto → iniciativas.
    expect(asideBox!.y).toBeGreaterThan(introBox!.y + introBox!.height - 1);
    expect(initiativesBox!.y).toBeGreaterThan(asideBox!.y + asideBox!.height - 1);
  }
});

test('navegación funcional y ruta 404', async ({ page }, testInfo) => {
  const menuButton = page.getByRole('button', { name: 'Abrir navegación' });
  if (testInfo.project.name !== 'desktop-1415') {
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Navegación móvil' })
      .getByRole('link', { name: 'Jóvenes en Comunidad' }).click();
    await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeHidden();
  } else {
    await expect(menuButton).toBeHidden();
  }

  await page.getByRole('navigation', { name: 'Índice de iniciativas' })
    .getByRole('link', { name: 'Copa Joven' }).click();
  await expect(page).toHaveURL(/#copa-joven$/);

  await page.goto('/ruta-que-no-existe');
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
});

test('header alineado con Figma en desktop y mobile', async ({ page }, testInfo) => {
  const logo = page.locator('header').getByRole('img', {
    name: 'Municipio de Lomas de Zamora — Gobierno de la Comunidad',
  });
  const logoBox = await logo.boundingBox();
  expect(logoBox).not.toBeNull();

  if (testInfo.project.name === 'desktop-1415') {
    // (1415 - 1232) / 2 + 16 = 107,5 px: el contenedor desktop queda centrado.
    expect(logoBox!.x).toBeCloseTo(107.5, 1);
    // El SVG exportado tiene un redondeo de <0,5px respecto de la instancia Figma.
    expect(logoBox!.height).toBeCloseTo(72, 0);
  } else {
    expect(logoBox!.x).toBe(24);
    if (testInfo.project.name === 'mobile-432') {
      const menuBox = await page.getByRole('button', { name: 'Abrir navegación' }).boundingBox();
      expect(menuBox).not.toBeNull();
      expect(menuBox!.x).toBe(360);
    }
  }
});
