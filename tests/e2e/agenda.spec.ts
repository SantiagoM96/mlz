import { expect, test } from '@playwright/test';

const agenda = '/agenda-de-la-comunidad';
const activities = agenda + '/actividades';

test('portada propia de la Agenda y Home municipal separada', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Municipio de Lomas de Zamora' })).toBeVisible();
  await page.goto(agenda);
  await expect(page.getByRole('heading', { name: '¡Agenda Anual de la Comunidad 2026!' })).toBeVisible();
  const banner = page.getByTestId('agenda-home-banner');
  await expect(banner).toBeVisible();
  const bannerSize = await banner.evaluate((img: HTMLImageElement) => ({ natural: img.naturalWidth, rendered: img.clientWidth }));
  expect(bannerSize.natural).toBeGreaterThanOrEqual(bannerSize.rendered - 1);
  await expect(page.getByTestId('agenda-featured')).toBeVisible();
  // Las imágenes de la Home no deben ampliarse respecto de su exportación original.
  const sourceWidths = await page.locator('main img').evaluateAll((images) =>
    images.filter(image => getComputedStyle(image).display !== 'none')
      .map(image => ({ src: image.getAttribute('src'), natural: image.naturalWidth, displayed: image.clientWidth })),
  );
  expect(sourceWidths.every(img => img.natural >= img.displayed - 1), JSON.stringify(sourceWidths)).toBeTruthy();
  await expect(page.getByTestId('agenda-upcoming').getByTestId('agenda-card')).toHaveCount(3);
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(noOverflow, 'La Home tiene overflow horizontal').toBe(true);
  const path = info.outputPath('agenda-home.png');
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await info.attach('agenda-home-' + info.project.name, { path, contentType: 'image/png' });
});

test('vínculo de portada a listado, luego a ficha y navegación de regreso', async ({ page }) => {
  await page.goto(agenda);
  await page.getByRole('link', { name: /Ver todas las actividades/ }).click();
  await expect(page).toHaveURL(new RegExp(activities + '/?$'));
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
  await page.getByTestId('agenda-card').first().getByRole('link', { name: /Ver más/ }).click();
  await expect(page).toHaveURL(new RegExp(activities + '/actividad-1/?$'));
  await expect(page.getByRole('heading', { level: 1, name: 'Futbol' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toHaveCSS('color', 'rgb(61, 61, 61)');
  await page.getByRole('link', { name: 'Volver a las actividades' }).click();
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
});

test('evento destacado accede a su propia ficha por URL', async ({ page }) => {
  await page.goto(agenda);
  await page.getByTestId('agenda-featured').getByRole('link', { name: 'Ver más' }).click();
  await expect(page).toHaveURL(new RegExp(activities + '/tita-y-rhodesia/?$'));
  await expect(page.getByRole('heading', { name: 'Tita & Rhodesia', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ver en Google Maps/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compartir por WhatsApp' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compartir por Facebook' })).toBeVisible();
});

test('listado responsive, búsqueda, filtros y controles', async ({ page }, info) => {
  await page.goto(activities);
  const count = info.project.name.startsWith('mobile') ? 6 : 9;
  await expect(page.getByTestId('agenda-card')).toHaveCount(count);
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
  const allImagesLoaded = await page.getByTestId('agenda-card').first().locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(allImagesLoaded).toBe(true);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Patin');
  await expect(page.getByTestId('agenda-card')).toHaveCount(6);
  await search.fill('término inexistente');
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const filter = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await filter.getByRole('checkbox', { name: 'Ambiental' }).check();
  await filter.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Ambiental' }).click();
  await expect(page.getByTestId('agenda-card')).not.toHaveCount(0);
  await page.getByRole('button', { name: 'Ver mapa' }).click();
  await expect(page.getByRole('heading', { name: 'Mapa de actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver grilla' }).click();
  await expect(page.getByTestId('agenda-grid')).toBeVisible();
});

test('las tres rutas principales admiten recarga y generan capturas', async ({ page }, info) => {
  for (const [label, path] of [
    ['home', agenda],
    ['list', activities],
    ['detail', activities + '/actividad-1'],
  ]) {
    await page.goto(path);
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
    const shot = info.outputPath(label + '.png');
    await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
    await info.attach(label + '-' + info.project.name, { path: shot, contentType: 'image/png' });
    // Vista previa directa en logs del navegador para revisión contra Figma.
    if (process.env.CI && ['desktop-1415', 'mobile-432'].includes(info.project.name)) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const preview = await page.screenshot({ type: 'jpeg', quality: 30, fullPage: false, animations: 'disabled' });
      console.log('MLZ_AGENDA_PREVIEW_' + info.project.name + '_' + label + ':' + preview.toString('base64'));
    }
  }
});

test('todos los contenedores institucionales respetan el máximo de 1200px', async ({ page }, info) => {
  const routes = ['/', '/agenda-de-la-comunidad', '/agenda-de-la-comunidad/actividades',
    '/agenda-de-la-comunidad/actividades/actividad-1', '/jovenes-en-comunidad'];
  const expected = Math.min(info.project.use.viewport?.width ?? 1200, 1200);

  for (const route of routes) {
    await page.goto(route);
    const widths = await page.locator('[data-layout-container="true"]').evaluateAll(elements =>
      elements.map(element => ({
        width: element.getBoundingClientRect().width,
        x: element.getBoundingClientRect().x,
      })),
    );
    expect(widths.length, `Sin contenedores en ${route}`).toBeGreaterThan(0);
    for (const { width, x } of widths) {
      expect(width, `Contenedor demasiado ancho en ${route}`).toBeLessThanOrEqual(1200.5);
      expect(width, `Contenedor fuera de pantalla en ${route}`).toBeLessThanOrEqual(expected + 0.5);
      if ((info.project.use.viewport?.width ?? 0) >= 1232) {
        expect(width).toBeCloseTo(1200, 0);
        expect(x).toBeCloseTo(((info.project.use.viewport?.width ?? 0) - 1200) / 2, 0);
      }
    }
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > (info.project.use.viewport?.width ?? 1200) + 1) {
      const offenders = await page.evaluate(() => [...document.body.querySelectorAll('*')]
        .map(el => {
          const rect = el.getBoundingClientRect();
          return { tag: el.tagName, className: typeof el.className === 'string' ? el.className.slice(0, 125) : '',
            text: el.textContent?.trim().slice(0, 35), x: rect.x, right: rect.right,
            width: rect.width, overflow: getComputedStyle(el).overflowX };
        }).filter(item => item.right > window.innerWidth + 1 || item.x < -1).slice(0, 20));
      console.log('MLZ_OVERFLOW_DIAGNOSTIC', route, JSON.stringify(offenders));
    }
    expect(scrollWidth, `Overflow horizontal en ${route}`).toBeLessThanOrEqual((info.project.use.viewport?.width ?? 1200) + 1);
  }
});

test('la iconografía de todas las rutas usa Google Material Symbols', async ({ page }) => {
  const routes = [
    '/',
    '/jovenes-en-comunidad',
    '/agenda-de-la-comunidad',
    '/agenda-de-la-comunidad/actividades',
    '/agenda-de-la-comunidad/actividades/actividad-1',
  ];

  for (const route of routes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const icons = page.locator('[data-material-symbol]');
    expect(await icons.count(), `No hay Material Symbols en ${route}`).toBeGreaterThan(0);
    const state = await icons.evaluateAll((nodes) => nodes.map(node => ({
      font: getComputedStyle(node).fontFamily,
      size: getComputedStyle(node).fontSize,
      text: node.textContent?.trim(),
      labelHidden: node.getAttribute('aria-hidden'),
    })));
    expect(state.every(icon => icon.font.includes('Material Symbols Outlined')),
      `Iconos no estandarizados: ${route}`).toBeTruthy();
    expect(state.every(icon => icon.labelHidden === 'true' && !!icon.text)).toBeTruthy();
    expect(await page.evaluate(() =>
    Array.from(document.fonts).some(font => font.family.includes('Material Symbols Outlined') && font.status === 'loaded'),
  )).toBeTruthy();
    await expect(page.locator('main svg, header svg')).toHaveCount(0);
  }
});
