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

test('componentes Breadcrumbs, iconos y tarjetas cumplen medidas de Figma', async ({ page }, testInfo) => {
  const breadcrumbs = page.getByRole('navigation', { name: 'Ruta de navegación' });
  await expect(breadcrumbs).toHaveCSS('font-size', '18px');
  await expect(breadcrumbs.getByTestId('breadcrumb-current')).toHaveCSS('font-weight', '700');
  await expect(breadcrumbs.locator('[data-material-symbol="chevron_right"]')).toHaveCount(2);

  const indexNavigation = page.getByRole('navigation', { name: 'Índice de iniciativas' });
  const card = indexNavigation.locator('..');
  await expect(card).toHaveCSS('background-color', 'rgb(243, 247, 252)');
  await expect(card).toHaveCSS('padding-left', '24px');
  await expect(card).toHaveCSS('row-gap', '16px');

  const links = indexNavigation.getByRole('link');
  await expect(links).toHaveCount(9);
  await expect(links.first()).toHaveCSS('column-gap', '4px');
  await expect(links.first()).toHaveCSS('font-size', '18px');
  const bookmark = links.first().locator('[data-material-symbol="bookmark"]');
  await expect(bookmark).toHaveCSS('width', '24px');
  await expect(bookmark).toHaveCSS('height', '24px');

  const cardBox = await card.boundingBox();
  expect(cardBox).not.toBeNull();
  // El ancho de tarjeta fijo del diseño se respeta en los frames de referencia.
  if (testInfo.project.name === 'desktop-1415' || testInfo.project.name === 'mobile-432') {
    expect(cardBox!.width).toBe(390);
  }

  const contact = page.getByRole('heading', { name: 'Contacto', level: 2 }).locator('..');
  await expect(contact.locator('img[data-brand-icon="instagram"]')).toHaveCSS('width', '24px');

  // Los iconos del UI Kit deben usar la fuente local de Google, no máscaras SVG.
  await page.evaluate(() => document.fonts.ready);
  const icons = await page.locator('[data-material-symbol]').evaluateAll((items) =>
    items.filter(item => item.getClientRects().length > 0).map(item => ({
      glyph: item.textContent?.trim(),
      font: getComputedStyle(item).fontFamily,
      width: Math.round(item.getBoundingClientRect().width),
      height: Math.round(item.getBoundingClientRect().height),
    })),
  );
  expect(icons.length).toBeGreaterThan(10);
  expect(icons.every(icon => icon.font.includes('Material Symbols Outlined'))).toBeTruthy();
  expect(await page.evaluate(() =>
    Array.from(document.fonts).some(font => font.family.includes('Material Symbols Outlined') && font.status === 'loaded'),
  )).toBe(true);
  expect(icons.every(icon => icon.width > 0 && icon.height > 0)).toBeTruthy();
});
