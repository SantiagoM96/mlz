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
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('La Chamameceada');
  await page.getByTestId('agenda-card').first().getByRole('link', { name: /Ver más/ }).click();
  await expect(page).toHaveURL(new RegExp(activities + '/actividad-1/?$'));
  await expect(page.getByRole('heading', { level: 1, name: 'La Chamameceada' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Información general' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toHaveCSS('color', 'rgb(61, 61, 61)');
  await page.getByRole('navigation', { name: 'Ruta de navegación' }).getByRole('link', { name: 'Actividades' }).click();
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
  await search.fill('La Chamameceada');
  await expect(page.getByTestId('agenda-card')).toHaveCount(1);
  await search.fill('término inexistente');
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const filter = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await filter.getByRole('button', { name: 'Categoría' }).click();
  await filter.getByRole('checkbox', { name: 'Ambiental' }).check();
  await filter.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(page.getByTestId('agenda-card').first()).toContainText('Salida de observación de hongos');
  await page.getByRole('button', { name: 'Ambiental' }).click();
  await expect(page.getByTestId('agenda-card')).not.toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver mapa' })).toHaveCount(0);
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

test('solo filtros seleccionados son azules; activity badges conservan colores semanticos y tune', async ({ page }) => {
  const routes = ['/agenda-de-la-comunidad', '/agenda-de-la-comunidad/actividades',
    '/agenda-de-la-comunidad/actividades/actividad-1'];
  for (const route of routes) {
    await page.goto(route);
    const activityChips = page.locator('[data-agenda-chip="activity"]');
    await expect(activityChips.first()).not.toHaveCSS('background-color', 'rgb(0, 110, 255)');
    await expect(activityChips.first().locator('[data-material-symbol]')).toBeVisible();
  }

  await page.goto('/agenda-de-la-comunidad/actividades');
  const filters = page.getByRole('button', { name: /Más Filtros/ });
  await expect(filters.locator('[data-material-symbol="tune"]')).toBeVisible();
  await filters.click();
  const dialog = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await dialog.getByRole('checkbox', { name: 'Banfield' }).check();
  await dialog.getByRole('button', { name: 'Ver resultados' }).click();
  const selected = page.locator('[data-agenda-chip="selected"]');
  await expect(selected.first()).toHaveCSS('background-color', 'rgb(0, 110, 255)');
  await expect(selected.first()).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('dropdowns de localidad, fecha y ordenar respetan el diseño y funcionan', async ({ page }, info) => {
  await page.goto(activities);
  const dateButton = page.getByRole('button', { name: 'Fecha', exact: true });
  await dateButton.click();
  const dateOptions = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(dateOptions.getByRole('textbox', { name: 'Buscar fecha' })).toBeFocused();
  await dateOptions.getByRole('checkbox', { name: 'Hoy' }).check();
  await dateOptions.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(page.locator('[data-agenda-chip="selected"]')).toContainText(['Hoy']);

  if ((info.project.use.viewport?.width ?? 0) >= 768) {
    const localityButton = page.getByRole('button', { name: 'Localidad', exact: true });
    await localityButton.click();
    const localityOptions = page.getByRole('dialog', { name: 'Opciones de Localidad' });
    await localityOptions.getByRole('textbox', { name: 'Buscar localidad' }).fill('Banfield');
    await localityOptions.getByRole('checkbox', { name: 'Banfield' }).check();
    await localityOptions.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page.locator('[data-agenda-chip="selected"]')).toContainText(['Banfield', 'Hoy']);
  }

  const sorter = page.getByRole('button', { name: 'Ordenar', exact: true });
  await sorter.click();
  await page.getByRole('button', { name: 'Alfabético A-Z' }).click();
  await expect(sorter).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Ver mapa' })).toHaveCount(0);
});

test('ficha sin texto provisional ni enlace de regreso duplicado', async ({ page }) => {
  await page.goto(activities + '/actividad-1');
  await expect(page.getByRole('heading', { level: 1, name: 'La Chamameceada' })).toBeVisible();
  await expect(page.getByText('Contenido de demostración basado en Figma')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Volver a las actividades' })).toHaveCount(0);
  const breadcrumb = page.getByRole('navigation', { name: 'Ruta de navegación' });
  await expect(breadcrumb.getByRole('link', { name: 'Actividades' })).toHaveAttribute('href', /\/agenda-de-la-comunidad\/actividades\/?$/);
});

test('Más Filtros se mantiene dentro del viewport y conserva acciones accesibles', async ({ page }) => {
  await page.goto(activities);
  const trigger = page.getByRole('button', { name: /Más Filtros/ });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  const rect = await panel.evaluate(node => {
    const r = node.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  });
  const viewport = page.viewportSize()!;
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(viewport.height + 1);
  expect(rect.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(rect.left).toBeGreaterThanOrEqual(0);
  await expect(panel.getByRole('button', { name: 'Ver resultados' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Limpiar', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});


test('mobile: filtros y ordenar usan bottom sheet animado del prototipo Deportes', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) > 680) return;
  await page.goto(activities);

  await page.getByRole('button', { name: 'Fecha', exact: true }).click();
  const dates = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(dates).toBeVisible();
  await expect(dates.locator('.agenda-sheet-grabber')).toBeVisible();
  await expect(dates).toHaveCSS('position', 'fixed');
  await expect(dates).toHaveCSS('border-top-left-radius', '16px');
  await expect(page.getByRole('button', { name: 'Cerrar panel de opciones' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.getByRole('button', { name: 'Cerrar panel de opciones' }).click();
  await expect(dates).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');

  await page.getByRole('button', { name: 'Ordenar', exact: true }).click();
  const sort = page.getByRole('group', { name: 'Opciones para ordenar' });
  await expect(sort).toBeVisible();
  await expect(sort.locator('.agenda-sheet-grabber')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar opciones' }).click();
  await expect(sort).toHaveCount(0);

  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const more = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await expect(more).toBeVisible();
  await expect(more.locator('.agenda-sheet-grabber')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(more).toHaveCount(0);
});

test('el estado sin resultados reproduce la ilustración de Figma', async ({ page }) => {
  await page.goto(activities);
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('zzzzz-sin-coincidencias');
  const empty = page.getByTestId('agenda-empty-state');
  const image = empty.locator('img');
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty('naturalWidth', 194);
  await expect(image).toHaveJSProperty('naturalHeight', 207);
  await expect(empty.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await expect(empty.getByRole('button', { name: 'Limpiar filtros' })).toHaveCSS('height', '48px');
  await empty.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(empty).toHaveCount(0);
});

test('tarjeta completa clickeable, cursor pointer, Ver más sin subrayado', async ({ page }) => {
  await page.goto(activities);
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('La Chamameceada');
  const first = page.getByTestId('agenda-card').first();
  const link = first.getByRole('link', { name: 'Ver más sobre La Chamameceada' });
  await expect(link).toHaveCSS('cursor', 'pointer');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(first.getByText('Ver más')).toHaveCSS('text-decoration-line', 'none');
  await first.getByRole('heading', { name: 'La Chamameceada' }).click();
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/actividad-1\/?$/);
});

test('planilla 2026: nuevas localidades y tipos funcionan en los filtros', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Salida de observación de hongos');
  await expect(page.getByTestId('agenda-card')).toHaveCount(1);
  await expect(page.getByTestId('agenda-card').first().locator('p').first()).toHaveText('Visita guiada');
  await search.fill('Palabras desde el barrio');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);
  await search.fill('nombre inhallable 2026');
  await expect(page.getByTestId('agenda-empty-state')).toBeVisible();
});

test('todas las fechas y horarios mantienen el estilo editorial de Figma', async ({ page }) => {
  await page.goto(activities);
  await expect(page.getByTestId('agenda-card').first()).toContainText('Jueves 5 de noviembre');
  await expect(page.getByTestId('agenda-card').first()).toContainText('21:00 h');
  await page.getByTestId('agenda-card').first().click();
  await expect(page.getByRole('heading', { name: 'Información general' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Información general' }).locator('..')).toContainText('Jueves 5 de noviembre');
  await expect(page.getByRole('heading', { name: 'Información general' }).locator('..')).toContainText('21:00 h');
});

test('excluye registros importados con datos incompletos o fecha aproximada', async ({ page }) => {
  await page.goto(activities);
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Palabras desde el barrio');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Festival Internacional del Jazz');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('La Chamameceada');
  await expect(page.getByTestId('agenda-card')).toHaveCount(1);
  await page.getByTestId('agenda-card').first().click();
  await expect(page).toHaveURL(/actividad-1\/?$/);
  await expect(page.getByRole('heading', { name: 'La Chamameceada' })).toBeVisible();
  await expect(page.getByText('Dirección a confirmar')).toHaveCount(0);
});

test('una ficha omitida no se publica aunque se conozca su URL anterior', async ({ page }) => {
  await page.goto(activities + '/actividad-24');
  await expect(page.getByRole('heading', { name: 'La Chamameceada' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Información general' })).toHaveCount(0);
});

test('descripciones del Excel no muestran marca de contenido ficticio y las ilustrativas sí', async ({ page }) => {
  await page.goto(activities + '/actividad-1');
  const description = page.getByRole('region', { name: 'Descripción de la actividad' });
  await expect(description).toContainText('Primera edición de La Chamameceada');
  await expect(description.getByTestId('agenda-illustrative-dot')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Información general' }).locator('..')).toContainText('21:00 h');

  await page.goto(activities + '/actividad-2');
  const illustrative = page.getByRole('region', { name: 'Descripción de la actividad' });
  await expect(illustrative).toContainText('percusión');
  await expect(illustrative.getByTestId('agenda-illustrative-dot')).toHaveCSS('background-color', 'rgb(211, 47, 47)');
  await expect(illustrative).toContainText('Descripción ilustrativa');

  await page.goto(activities + '/tita-y-rhodesia');
  await expect(page.getByRole('region', { name: 'Descripción de la actividad' })).toContainText('Una propuesta teatral');
  await expect(page.getByTestId('agenda-illustrative-dot')).toHaveCount(1);
});


test('las tarjetas usan ilustraciones de Figma según el tipo de actividad', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  const examples = [
    { title: 'La Chamameceada', filename: 'musica.png' },
    { title: 'Zumba', filename: 'aerobica.png' },
    { title: 'Salida de observación de hongos', filename: 'visita-guiada.png' },
    { title: 'Truco en Comunidad', filename: 'torneo.png' },
  ] as const;

  for (const example of examples) {
    await search.fill(example.title);
    const img = page.getByTestId('agenda-card').first().locator('img');
    await expect(img).toHaveAttribute('src', new RegExp('/types/' + example.filename.replace('.', '\\.')));
    await expect(img).toBeVisible();
    await expect.poll(async () => img.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(400);
  }
});

test('tarjetas y fichas muestran el tipo específico en vez de la categoría general', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('La Chamameceada');
  const card = page.getByTestId('agenda-card').first();
  await expect(card.locator('p').first()).toHaveText('Música');
  await expect(card.locator('img')).toHaveAttribute('src', /\/types\/musica\.png/);
  await card.getByRole('link', { name: /Ver más/ }).click();
  await expect(page.getByRole('heading', { name: 'La Chamameceada' })).toBeVisible();
  await expect(page.locator('h1').locator('..').locator('p').first()).toHaveText('Música');

  await page.goto(activities);
  await search.fill('Ballet Yago');
  await expect(page.getByTestId('agenda-card').first().locator('p').first()).toHaveText('Danza');
  await expect(page.getByTestId('agenda-card').first().locator('img')).toHaveAttribute('src', /\/types\/danza\.png/);
});


test('dropdown: fondo Info 500, check blanco sin relleno y opciones alfabéticas', async ({ page }, info) => {
  await page.goto(activities);
  const collator = new Intl.Collator('es-AR', { sensitivity: 'base', numeric: true });
  const assertSorted = (options: string[]) =>
    expect(options).toEqual([...options].sort(collator.compare));

  await page.getByRole('button', { name: 'Fecha', exact: true }).click();
  const dateOptions = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  const dates = await dateOptions.getByRole('checkbox').evaluateAll(elements =>
    elements.map(element => element.getAttribute('aria-label') ?? ''));
  assertSorted(dates);
  const today = dateOptions.getByRole('checkbox', { name: 'Hoy' });
  await today.check();
  const selectedDate = dateOptions.locator('label', { has: today });
  await expect(selectedDate).toHaveCSS('background-color', 'rgb(0, 110, 255)');
  await expect(selectedDate).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(selectedDate.locator('span[aria-hidden="true"]')).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
  await expect(selectedDate.locator('span[aria-hidden="true"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await dateOptions.getByRole('button', { name: 'Ver resultados' }).click();

  if ((info.project.use.viewport?.width ?? 0) >= 768) {
    await page.getByRole('button', { name: 'Localidad', exact: true }).click();
    const localityMenu = page.getByRole('dialog', { name: 'Opciones de Localidad' });
    const localities = await localityMenu.getByRole('checkbox').evaluateAll(elements =>
      elements.map(element => element.getAttribute('aria-label') ?? ''));
    assertSorted(localities);
    await localityMenu.getByRole('button', { name: 'Ver resultados' }).click();
  }

  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const filters = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  const groupType = filters.getByRole('button', { name: 'Tipo de actividad' }).locator('..');
  const typeLabels = await groupType.locator('label').allTextContents();
  assertSorted(typeLabels.map(label => label.trim()));
  await filters.getByRole('button', { name: 'Categoría' }).click();
  const groupCategory = filters.getByRole('button', { name: 'Categoría' }).locator('..');
  const categories = await groupCategory.locator('label').allTextContents();
  assertSorted(categories.map(label => label.trim()));
});

test('navegar desde una tarjeta inferior abre la ficha arriba y volver restaura el scroll', async ({ page }) => {
  await page.goto(activities);
  const lastCard = page.getByTestId('agenda-card').last();
  await lastCard.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
  await lastCard.getByRole('link', { name: /Ver más sobre/ }).click();
  await expect(page).toHaveURL(new RegExp('/agenda-de-la-comunidad/actividades/actividad-[0-9]+/?$'));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(new RegExp('/agenda-de-la-comunidad/actividades/?$'));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
});

test('breadcrumb de título largo permanece en una línea sin separar la flecha', async ({ page }, info) => {
  await page.goto(activities + '/actividad-10');
  const nav = page.getByRole('navigation', { name: 'Ruta de navegación' });
  const current = nav.getByTestId('breadcrumb-current');
  await expect(current).toHaveText('Presentación del libro «Solo sé hablar de cosas que no existen», de Manuel Marchioni');
  await expect(current).toHaveCSS('text-overflow', 'ellipsis');
  const height = await nav.evaluate(element => element.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(30);
  const arrowAlignment = await current.evaluate(element => {
    const arrow = element.parentElement?.querySelector('[data-material-symbol]');
    if (!arrow) return false;
    const a = arrow.getBoundingClientRect();
    const t = element.getBoundingClientRect();
    return Math.abs(a.top + a.height / 2 - (t.top + t.height / 2)) < 4;
  });
  expect(arrowAlignment).toBe(true);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  expect(overflow).toBe(false);
  if ((info.project.use.viewport?.width ?? 0) < 640) {
    await expect(nav.getByRole('link', { name: 'Actividades' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Inicio' })).toBeHidden();
  }
});

test('ficha: imagen original, ubicación y datos generales sin flujo de inscripción', async ({ page }, info) => {
  for (const path of [activities + '/actividad-1', activities + '/tita-y-rhodesia']) {
    await page.goto(path);
    const image = page.getByTestId('agenda-detail-image');
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(400);
    const information = page.getByRole('heading', { name: 'Información general' }).locator('..');
    await expect(information).toContainText('Fecha');
    await expect(information).toContainText('Horario');
    await expect(information).toContainText('Tipo de actividad');
    await expect(page.getByRole('heading', { name: 'Resumen' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Ubicación' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver en Google Maps' })).toHaveAttribute('href', new RegExp('google[.]com/maps/search'));
    await expect(page.locator('iframe[title^="Mapa de"]')).toHaveAttribute('src', new RegExp('google[.]com/maps[?]q='));
    await expect(page.getByRole('button', { name: /Elegir horario|Inscribirme|Reservar cupo/ })).toHaveCount(0);
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noOverflow, 'La ficha tiene overflow en ' + path + ' (' + info.project.name + ')').toBe(true);
  }
});

test('copiar enlace en una ficha muestra confirmación y copia la URL actual', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { (window as Window & { __testCopiedLink?: string }).__testCopiedLink = value; } },
    });
  });
  await page.goto(activities + '/actividad-10');
  await page.getByRole('button', { name: 'Copiar enlace' }).click();
  await expect(page.getByRole('button', { name: 'Enlace copiado' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Enlace copiado al portapapeles');
  const copied = await page.evaluate(() => (window as Window & { __testCopiedLink?: string }).__testCopiedLink);
  expect(copied).toBe(page.url());
});
