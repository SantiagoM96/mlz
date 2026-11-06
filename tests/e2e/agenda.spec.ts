import { expect, test } from '@playwright/test';

const agenda = '/agenda-de-la-comunidad';
const activities = agenda + '/actividades';

test('Geometria real se carga en las vistas institucionales, sin fuentes de reemplazo', async ({ page }) => {
  for (const path of ['/', '/jovenes-en-comunidad', '/agenda-de-la-comunidad', activities, activities + '/actividad-1']) {
    await page.goto(path);
    await expect(page.locator('body')).toHaveCSS('font-family', /^Geometria(?:,|$)/);
  }
  const fonts = await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 18px Geometria'),
      document.fonts.load('500 18px Geometria'),
      document.fonts.load('700 18px Geometria'),
    ]);
    await document.fonts.ready;
    return Array.from(document.fonts)
      .filter(face => face.family === 'Geometria')
      .map(face => ({ weight: face.weight, status: face.status }));
  });
  for (const weight of ['400', '500', '700']) {
    expect(fonts.some(face => face.weight === weight && face.status === 'loaded'), 'Debe cargarse Geometria ' + weight).toBe(true);
  }
});


test('tarjetas de Agenda respetan tamaños principales de Figma', async ({ page }) => {
  await page.goto(activities);
  const card = page.getByTestId('agenda-card').first();
  const image = card.locator('img').first();
  await expect(image).toHaveCSS('height', '154px');
  await expect(card.getByRole('heading', { level: 2 })).toHaveCSS('font-size', '22px');
  await expect(card.locator('[data-material-symbol="event_available"]').first()).toHaveCSS('font-size', '20px');
  await expect(card.locator('[data-material-symbol="schedule"]').first()).toHaveCSS('font-size', '20px');
  await expect(card.locator('[data-agenda-chip="activity"]').first()).toHaveCSS('min-height', '24px');
  await expect(card.getByText('Actividad pasada')).toHaveCount(0);
});

test('barra de búsqueda replica cuatro columnas de la captura en desktop', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) < 1280) return;
  await page.goto(activities);
  const toolbar = page.getByTestId('agenda-toolbar');
  const search = toolbar.getByRole('textbox', { name: 'Buscar actividades' });
  const locality = toolbar.getByTestId('agenda-dropdown-localidad');
  const date = toolbar.getByTestId('agenda-dropdown-fecha');
  const more = toolbar.getByRole('button', { name: 'Más Filtros', exact: true });
  const boxes = await Promise.all([search, locality, date, more].map(el => el.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  for (let i = 0; i < boxes.length - 1; i++) {
    expect(boxes[i + 1]!.x - (boxes[i]!.x + boxes[i]!.width)).toBeCloseTo(16, 0);
  }
  expect(boxes[1]!.width).toBeCloseTo(207, 0);
  expect(boxes[2]!.width).toBeCloseTo(207, 0);
  const moreContent = more.locator('[data-agenda-more-content]');
  const intrinsicWidth = await more.evaluate(node => {
    const inner = node.querySelector('[data-agenda-more-content]')!;
    const s = getComputedStyle(node);
    return inner.getBoundingClientRect().width
      + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight)
      + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth);
  });
  expect(boxes[3]!.width).toBeCloseTo(intrinsicWidth, 0);
  expect(boxes[3]!.width).toBeLessThan(190);
  await expect(moreContent).toBeVisible();
  for (const box of boxes) expect(box!.height).toBeCloseTo(48, 0);
  const results = page.getByText(/^Mostrando -/);
  const sort = page.getByRole('button', { name: 'Ordenar', exact: true });
  const resultBox = await results.boundingBox();
  const sortBox = await sort.boundingBox();
  expect(resultBox).not.toBeNull();
  expect(sortBox).not.toBeNull();
  expect(sortBox!.y).toBeGreaterThan(boxes[3]!.y + boxes[3]!.height);
  expect(sortBox!.x + sortBox!.width).toBeCloseTo(boxes[3]!.x + boxes[3]!.width, 0);
});

test('Más Filtros agrupa texto, contador e icono sin espacio vacío', async ({ page }) => {
  await page.goto(activities);
  const trigger = page.getByRole('button', { name: 'Más Filtros', exact: true });
  const label = trigger.locator('[data-agenda-more-label]');
  const icon = trigger.locator('[data-material-symbol="tune"]');
  const gap = async (left: typeof label, right: typeof label) => {
    const leftBox = await left.boundingBox();
    const rightBox = await right.boundingBox();
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();
    return rightBox!.x - (leftBox!.x + leftBox!.width);
  };

  const assertHugWidth = async () => {
    const dimensions = await trigger.evaluate(node => {
      const inner = node.querySelector('[data-agenda-more-content]')!;
      const s = getComputedStyle(node);
      return {
        actual: node.getBoundingClientRect().width,
        expected: inner.getBoundingClientRect().width + parseFloat(s.paddingLeft)
          + parseFloat(s.paddingRight) + parseFloat(s.borderLeftWidth)
          + parseFloat(s.borderRightWidth),
      };
    });
    expect(dimensions.actual).toBeCloseTo(dimensions.expected, 0);
  };
  await expect(trigger.locator('[data-agenda-filter-count]')).toHaveCount(0);
  await assertHugWidth();
  expect(await gap(label, icon)).toBeGreaterThanOrEqual(0);
  expect(await gap(label, icon)).toBeLessThanOrEqual(12);

  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await panel.getByRole('checkbox').first().check();
  const badge = trigger.locator('[data-agenda-filter-count]');
  await expect(badge).toHaveText('1');
  await assertHugWidth();
  expect(await gap(label, badge)).toBeGreaterThanOrEqual(0);
  expect(await gap(label, badge)).toBeLessThanOrEqual(12);
  expect(await gap(badge, icon)).toBeGreaterThanOrEqual(0);
  expect(await gap(badge, icon)).toBeLessThanOrEqual(12);
});

test('los badges de Localidad, Fecha y Más Filtros reflejan el grupo, no el origen de la selección', async ({ page }, info) => {
  await page.goto(activities);
  const mobile = (info.project.use.viewport?.width ?? 0) <= 680;
  const moreTrigger = page.getByRole('button', { name: 'Más Filtros', exact: true });
  await expect(moreTrigger.locator('[data-agenda-filter-count]')).toHaveCount(0);

  await moreTrigger.click();
  const more = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await expect(more.getByRole('button', { name: 'Cerrar opciones' })).toHaveCount(0);
  const localitySection = more.getByRole('button', { name: 'Localidad', exact: true });
  await localitySection.click();
  await more.getByRole('checkbox', { name: 'Banfield', exact: true }).check();
  await more.getByRole('checkbox', { name: 'Temperley', exact: true }).check();
  await expect(moreTrigger.locator('[data-agenda-filter-count]')).toHaveCount(0);
  if (!mobile) {
    await expect(page.getByTestId('agenda-dropdown-localidad').locator('[data-agenda-filter-count]')).toHaveText('2');
  }

  const dateSection = more.getByRole('button', { name: 'Fecha', exact: true });
  await dateSection.click();
  await more.getByRole('checkbox', { name: 'Hoy', exact: true }).check();
  await expect(page.getByTestId('agenda-dropdown-fecha').locator('[data-agenda-filter-count]')).toHaveText('1');
  await expect(moreTrigger.locator('[data-agenda-filter-count]')).toHaveCount(0);

  const typeSection = more.getByRole('button', { name: 'Tipo de actividad', exact: true });
  await expect(typeSection).toHaveAttribute('aria-expanded', 'true');
  await more.getByRole('checkbox', { name: 'Charla', exact: true }).check();
  await expect(moreTrigger.locator('[data-agenda-filter-count]')).toHaveText('1');
  await expect(page.getByTestId('agenda-dropdown-fecha').locator('[data-agenda-filter-count]')).toHaveText('1');

  const summary = (await page.getByText(/^Mostrando -/).textContent()) ?? '';
  const total = Number(summary.match(/de (\d+) actividades/)?.[1] ?? 0);
  await expect(more.getByRole('button', { name: /Ver resultados/ })).toHaveText(`Ver resultados (${total})`);
  await more.getByRole('button', { name: /Ver resultados/ }).click();

  if (!mobile) {
    await page.getByTestId('agenda-dropdown-localidad').click();
    const locality = page.getByRole('dialog', { name: 'Opciones de Localidad' });
    await expect(locality.getByRole('checkbox', { name: 'Banfield', exact: true })).toBeChecked();
    await expect(locality.getByRole('checkbox', { name: 'Temperley', exact: true })).toBeChecked();
    await expect(locality.getByRole('button', { name: /Ver resultados/ })).toHaveText(`Ver resultados (${total})`);
    await locality.getByRole('button', { name: /Ver resultados/ }).click();
  }
});

test('los cheurones de Más Filtros indican cerrado abajo y abierto arriba; en mobile no aparece la X', async ({ page }, info) => {
  await page.goto(activities);
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  const type = panel.getByRole('button', { name: 'Tipo de actividad', exact: true });
  const arrow = type.locator('[data-material-symbol="expand_more"]');
  await expect(type).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => arrow.evaluate(node => getComputedStyle(node).rotate)).toBe('180deg');
  await type.click();
  await expect(type).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => arrow.evaluate(node => getComputedStyle(node).rotate)).toBe('none');
  if ((info.project.use.viewport?.width ?? 0) <= 680) {
    await expect(panel.locator('.agenda-sheet-heading').getByRole('button', { name: 'Cerrar opciones' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Cerrar panel de opciones' }).click({ position: { x: 10, y: 10 } });
    await page.getByTestId('agenda-dropdown-fecha').click();
    await expect(page.getByRole('dialog', { name: 'Opciones de Fecha' }).getByRole('button', { name: 'Cerrar opciones' })).toHaveCount(0);
  }
});

test('Más filtros: opciones táctiles separadas sin seleccionar la opción vecina', async ({ page }, info) => {
  await page.goto(activities);
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  const checkboxes = dialog.getByRole('checkbox');
  await expect(checkboxes.first()).toBeVisible();
  const first = checkboxes.nth(0);
  const second = checkboxes.nth(1);
  const firstLabel = first.locator('..');
  const secondLabel = second.locator('..');
  await expect(firstLabel).toHaveCSS('min-height', '44px');
  await expect(secondLabel).toHaveCSS('min-height', '44px');
  if ((info.project.use.viewport?.width ?? 0) <= 680) {
    // Tomar ambas medidas en el mismo frame evita desfases durante la animación de entrada.
    const boxes = await checkboxes.evaluateAll(nodes => nodes.slice(0, 2).map(node => {
      const rect = node.parentElement!.getBoundingClientRect();
      return { y: rect.y, height: rect.height };
    }));
    expect(boxes).toHaveLength(2);
    expect(boxes[1]!.y - (boxes[0]!.y + boxes[0]!.height)).toBeGreaterThanOrEqual(3);
  }
  await second.check();
  await expect(first).not.toBeChecked();
  await expect(second).toBeChecked();
});

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
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Yoga en Comunidad');
  await page.getByTestId('agenda-card').first().getByRole('link', { name: /Ver más/ }).click();
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/preview-v2-yoga-dos-sedes--sede-/);
  await expect(page.getByRole('heading', { level: 1, name: 'Yoga en Comunidad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toHaveCSS('color', 'rgb(35, 105, 153)');
  const crumbs = page.getByRole('navigation', { name: 'Ruta de navegación' });
  if ((page.viewportSize()?.width ?? 0) < 640) {
    await crumbs.getByTestId('breadcrumb-mobile-back').click();
  } else {
    await crumbs.getByRole('link', { name: 'Actividades' }).click();
  }
  await expect(page).toHaveURL(new RegExp(activities + '/?$'));
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
});

test('evento destacado accede a su propia ficha por URL', async ({ page }) => {
  await page.goto(agenda);
  await page.getByTestId('agenda-featured').getByRole('link', { name: 'Ver más' }).click();
  await expect(page).toHaveURL(new RegExp(activities + '/tita-y-rhodesia/?$'));
  await expect(page.getByRole('heading', { name: 'Tita & Rhodesia', level: 1 })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' }).getByRole('link', { name: 'Ver en Google Maps' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compartir por WhatsApp' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compartir por Facebook' })).toBeVisible();
});

test('fichas: el mapa conserva dirección normalizada y un enlace por sede', async ({ page }) => {
  const address = 'Manuel Castro N° 262 - Lomas de Zamora';
  for (const path of [activities + '/actividad-1', activities + '/tita-y-rhodesia']) {
    await page.goto(path);
    const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
    const location = page.getByRole('region', { name: 'Mapa de ubicación' });
    await expect(summary.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
    await expect(location.locator('p').nth(1)).toHaveText(address);
    await expect(location.locator('p').nth(1)).toHaveCSS('text-decoration-line', 'none');
    await expect(summary.getByRole('link', { name: /Google Maps/ })).toHaveCount(0);
    await expect(location.getByRole('link', { name: 'Ver en Google Maps' })).toBeVisible();
  }
});


test('listado responsive, búsqueda, filtros y controles', async ({ page }) => {
  await page.goto(activities);
  // Listado de revisión V2 aprobado: 10 tarjetas, en todos los breakpoints.
  await expect(page.getByTestId('agenda-card')).toHaveCount(10);
  await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
  const firstImage = page.getByTestId('agenda-card').first().locator('img');
  await expect.poll(() => firstImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    { message: 'La primera ilustración debe cargar correctamente' }).toBe(true);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Yoga en Comunidad');
  await expect(page.getByTestId('agenda-card')).toHaveCount(2);
  await search.fill('término inexistente');
  await expect(page.getByRole('heading', { name: 'No encontramos actividades' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const filter = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await filter.getByRole('button', { name: 'Categoría' }).click();
  await filter.getByRole('checkbox', { name: 'Ambiental', exact: true }).check();
  await filter.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(page.getByTestId('agenda-grid')).toContainText('Taller de compostaje');
  await page.getByRole('button', { name: 'Ambiental' }).click();
  await expect(page.getByTestId('agenda-card')).toHaveCount(10);
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

test('las superficies azules llegan al borde izquierdo sin franja de scrollbar', async ({ page }, info) => {
  const paths = ['/', '/agenda-de-la-comunidad/actividades', '/jovenes-en-comunidad'];
  for (const path of paths) {
    await page.goto(path);
    const edges = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect();
      return {
        htmlGutter: getComputedStyle(document.documentElement).scrollbarGutter,
        headerLeft: rect('header')?.left,
        footerLeft: rect('footer')?.left,
        bodyLeft: rect('body')?.left,
        headerWidth: rect('header')?.width,
      };
    });
    expect(edges.bodyLeft, path + ' body corrido').toBe(0);
    expect(edges.headerLeft, path + ' header con margen lateral').toBe(0);
    expect(edges.footerLeft, path + ' footer con margen lateral').toBe(0);
    if ((info.project.use.viewport?.width ?? 0) > 680) {
      expect(edges.htmlGutter).toBe('stable');
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
        // Centrado respecto del viewport completo, sin fabricar un gutter blanco
        // en el borde izquierdo para compensar la scrollbar derecha.
        expect(width).toBeCloseTo(1200, 0);
        expect(x).toBeCloseTo(((info.project.use.viewport?.width ?? 0) - 1200) / 2, 0);
      }
    }
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > (info.project.use.viewport?.width ?? 1200) + 1) {
      const diagnostics = await page.evaluate(viewportWidth => ({
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        visualWidth: window.visualViewport?.width,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        overflowContainers: [document.documentElement, document.body, ...document.body.querySelectorAll('*')]
          .map(el => ({ tag: el.tagName, className: typeof el.className === 'string' ? el.className.slice(0, 90) : '',
            width: el.clientWidth, scroll: el.scrollWidth, overflow: getComputedStyle(el).overflowX }))
          .filter(el => el.scroll > el.width + 1).sort((a, b) => b.scroll - b.width - (a.scroll - a.width))
          .slice(0, 15),
        textOffenders: (() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const overflow: { text: string; right: number; left: number; parent: string }[] = [];
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if (!node.textContent?.trim() || !node.parentElement) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const rect = range.getBoundingClientRect();
            if (rect.right > viewportWidth + 1 || rect.left < -1) {
              overflow.push({ text: node.textContent.trim().slice(0, 65),
                right: Math.round(rect.right), left: Math.round(rect.left),
                parent: node.parentElement.tagName + '.' + node.parentElement.className.toString().slice(0, 70) });
            }
          }
          return overflow.slice(0, 15);
        })(),
        offenders: [...document.body.querySelectorAll('*')]
          .map(el => {
            const rect = el.getBoundingClientRect();
            return { tag: el.tagName, className: typeof el.className === 'string' ? el.className.slice(0, 125) : '',
              text: el.textContent?.trim().slice(0, 35), x: rect.x, right: rect.right,
              width: rect.width, overflow: getComputedStyle(el).overflowX };
          }).filter(item => item.right > viewportWidth + 1 || item.x < -1)
          .sort((a, b) => b.right - a.right).slice(0, 25),
      }), info.project.use.viewport?.width ?? 1200);
      console.log('MLZ_OVERFLOW_DIAGNOSTIC', route, JSON.stringify(diagnostics));
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
  let observedChips = 0;
  for (const route of routes) {
    await page.goto(route);
    const activityChips = page.locator('[data-agenda-chip="activity"]');
    const count = await activityChips.count();
    observedChips += count;
    for (let index = 0; index < count; index++) {
      await expect(activityChips.nth(index)).not.toHaveCSS('background-color', 'rgb(0, 110, 255)');
      await expect(activityChips.nth(index).locator('[data-material-symbol]')).toBeVisible();
    }
  }
  // Los badges son opcionales por actividad; la portada ofrece ejemplos reales.
  expect(observedChips).toBeGreaterThan(0);

  await page.goto('/agenda-de-la-comunidad/actividades');
  const filters = page.getByRole('button', { name: /Más Filtros/ });
  await expect(filters.locator('[data-material-symbol="tune"]')).toBeVisible();
  await filters.click();
  const dialog = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await dialog.getByRole('button', { name: 'Localidad' }).click();
  await dialog.getByRole('checkbox', { name: 'Banfield', exact: true }).check();
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
  // Fecha no necesita un buscador interno; Localidad sí lo conserva.
  await expect(dateOptions.getByRole('textbox', { name: 'Buscar fecha' })).toHaveCount(0);
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


test('ficha sin texto provisional ni enlace de regreso duplicado', async ({ page }, info) => {
  await page.goto(activities + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  await expect(page.getByRole('heading', { level: 1, name: 'Yoga en Comunidad' })).toBeVisible();
  await expect(page.getByText('Contenido de demostración basado en Figma')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Volver a las actividades' })).toHaveCount(0);
  const breadcrumb = page.getByRole('navigation', { name: 'Ruta de navegación' });
  if ((info.project.use.viewport?.width ?? 0) < 640) {
    await expect(breadcrumb.getByTestId('breadcrumb-mobile-back')).toBeVisible();
    await expect(breadcrumb.getByTestId('breadcrumb-mobile-back')).toContainText('Volver');
    await expect(breadcrumb.getByTestId('breadcrumb-mobile-back')).toHaveAttribute('href', /\/actividades\/?$/);
    await expect(breadcrumb.getByRole('link', { name: 'Agenda de la Comunidad' })).toBeHidden();
  } else {
    await expect(breadcrumb.getByRole('link', { name: 'Agenda de la Comunidad' })).toHaveAttribute('href', /\/agenda-de-la-comunidad\/?$/);
    await expect(breadcrumb.getByRole('link', { name: 'Actividades' })).toHaveAttribute('href', /\/agenda-de-la-comunidad\/actividades\/?$/);
  }
});

test('buscador y dropdowns replican el foco y el margen inferior de 50px del prototipo', async ({ page }, info) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.focus();
  await expect(search).toHaveCSS('border-top-color', 'rgb(0, 110, 255)');
  await expect(search).toHaveCSS('border-top-width', '2px');
  await expect(search).toHaveCSS('background-color', 'rgb(246, 246, 246)');
  await expect(search).toHaveCSS('box-shadow', 'none');
  if ((info.project.use.viewport?.width ?? 0) <= 680) return;
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const checkBottom = async (label: string) => {
    const dialog = page.getByRole('dialog', { name: label });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate(node => node.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(viewportHeight - 49);
  };
  for (const label of ['Fecha', 'Localidad']) {
    const button = page.getByRole('button', { name: label, exact: true });
    if (!(await button.count())) continue;
    await button.click();
    await checkBottom(`Opciones de ${label}`);
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  await checkBottom('Filtros de la agenda');
  await page.evaluate(() => window.scrollBy(0, 110));
  await checkBottom('Filtros de la agenda');
  await expect(page.getByRole('dialog', { name: 'Filtros de la agenda' })
    .getByRole('button', { name: 'Ver resultados' })).toBeVisible();
});

test('Más Filtros se mantiene dentro del viewport y conserva acciones accesibles', async ({ page }) => {
  await page.goto(activities);
  const trigger = page.getByRole('button', { name: /Más Filtros/ });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  // El bottom sheet entra desde abajo: validar su posición una vez terminada la entrada.
  const viewport = page.viewportSize()!;
  const rect = () => panel.evaluate(node => {
    const r = node.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  });
  await expect.poll(async () => (await rect()).bottom).toBeLessThanOrEqual(viewport.height + 1);
  const settledRect = await rect();
  expect(settledRect.top).toBeGreaterThanOrEqual(0);
  expect(settledRect.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(settledRect.left).toBeGreaterThanOrEqual(0);
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
  // Hacer clic en la zona visible del backdrop, no en el centro cubierto por la hoja.
  await page.getByRole('button', { name: 'Cerrar panel de opciones' }).click({ position: { x: 10, y: 10 } });
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
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Taller de compostaje');
  const card = page.getByTestId('agenda-card').first();
  const link = card.getByRole('link', { name: 'Ver más sobre Taller de compostaje' });
  await expect(link).toHaveCSS('cursor', 'pointer');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(card.getByText('Ver más')).toHaveCSS('text-decoration-line', 'none');
  await card.getByRole('heading', { name: 'Taller de compostaje' }).click();
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/preview-v2-compostaje\/?$/);
});


test('listado V2: búsqueda por nombre y tipo, sin incluir actividades excluidas', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Taller de compostaje');
  await expect(page.getByTestId('agenda-card')).toHaveCount(1);
  await expect(page.getByTestId('agenda-card').first().locator('p').first()).toHaveText('Taller');
  await search.fill('Palabras desde el barrio');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);
  await search.fill('nombre inhallable 2026');
  await expect(page.getByTestId('agenda-empty-state')).toBeVisible();
});


test('todas las fechas y horarios mantienen el estilo editorial de Figma', async ({ page }) => {
  await page.goto(activities);
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Taller de compostaje');
  const card = page.getByTestId('agenda-card').first();
  await expect(card).toContainText('Todos los sábados');
  await expect(card).toContainText('Del 7 al 28 de noviembre');
  await expect(card).toContainText('10:00 a 12:00 h');
  await card.click();
  const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Todos los sábados');
  await expect(summary).toContainText('Del 7 al 28 de noviembre');
  await expect(summary).toContainText('10:00 a 12:00 h');
});


test('listado V2 excluye importados antiguos pero conserva sus URL directas', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Palabras desde el barrio');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);
  await search.fill('Festival Internacional del Jazz');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);
  await search.fill('La Chamameceada');
  await expect(page.getByTestId('agenda-card')).toHaveCount(0);
  // El listado se limita a 10 casos, pero las fichas históricas mantienen su URL.
  await page.goto(activities + '/actividad-1');
  await expect(page.getByRole('heading', { level: 1, name: 'La Chamameceada' })).toBeVisible();
  await expect(page.getByText('Dirección a confirmar')).toHaveCount(0);
});

test('una ficha omitida no se publica aunque se conozca su URL anterior', async ({ page }) => {
  await page.goto(activities + '/actividad-24');
  await expect(page.getByRole('heading', { name: 'La Chamameceada' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Información general' })).toHaveCount(0);
});

test('descripciones de la ficha aparecen sin marcas ni comentarios de prototipo', async ({ page }) => {
  for (const { path, text } of [
    { path: activities + '/actividad-1', text: 'Primera edición de La Chamameceada' },
    { path: activities + '/actividad-2', text: 'percusión' },
    { path: activities + '/tita-y-rhodesia', text: 'Una propuesta teatral' },
  ]) {
    await page.goto(path);
    const description = page.getByRole('region', { name: 'Descripción de la actividad' });
    await expect(description).toContainText(text);
    await expect(description.getByTestId('agenda-illustrative-dot')).toHaveCount(0);
    await expect(description).not.toContainText('Descripción ilustrativa');
    await expect(description).not.toContainText('Información pendiente de validación');
  }
});



test('las tarjetas usan ilustraciones de Figma según el tipo de actividad', async ({ page }) => {
  await page.goto(activities);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  const examples = [
    { title: 'Folklore en Comunidad', filename: 'musica.png' },
    { title: 'Yoga en Comunidad', filename: 'cuerpo-mente.png' },
    { title: 'Taller de compostaje', filename: 'taller-ambiental.png' },
    { title: 'Fútbol en Comunidad', filename: 'entrenamiento.png' },
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
  await search.fill('Folklore en Comunidad');
  const card = page.getByTestId('agenda-card').first();
  await expect(card.locator('p').first()).toHaveText('Música');
  await expect(card.locator('img')).toHaveAttribute('src', /\/types\/musica\.png/);
  await card.getByRole('link', { name: /Ver más/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Folklore en Comunidad' })).toBeVisible();
  await expect(page.locator('h1').locator('..').locator('p').first()).toHaveText('Música');

  await page.goto(activities);
  await search.fill('Yoga en Comunidad');
  await expect(page.getByTestId('agenda-card').first().locator('p').first()).toHaveText('Cuerpo–mente');
  await expect(page.getByTestId('agenda-card').first().locator('img')).toHaveAttribute('src', /\/types\/cuerpo-mente\.png/);
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
  await page.mouse.move(0, 0); // La comprobación evalúa el color base, no el hover deliberadamente más oscuro.
  const selectedDate = dateOptions.locator('label:has(input[aria-label="Hoy"])');
  await expect(selectedDate).toHaveCSS('background-color', 'rgb(0, 110, 255)');
  await expect(selectedDate).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(selectedDate.locator(':scope > span[aria-hidden="true"]')).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
  await expect(selectedDate.locator(':scope > span[aria-hidden="true"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
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
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/preview-v2-/);
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
  const width = info.project.use.viewport?.width ?? 0;
  const height = await nav.evaluate(element => element.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(30);
  if (width < 640) {
    await expect(current).toBeHidden();
    const back = nav.getByTestId('breadcrumb-mobile-back');
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', /\/agenda-de-la-comunidad\/actividades\/?$/);
    await expect(back.getByText('Volver')).toBeVisible();
    await expect(back.locator('[data-material-symbol="arrow_back"]')).toHaveCount(1);
    await expect(nav.locator('ol')).toBeHidden();
  } else {
    await expect(current).toBeVisible();
    await expect(current).toHaveCSS('text-overflow', 'ellipsis');
    const arrowAlignment = await current.evaluate(element => {
      const arrow = element.parentElement?.querySelector('[data-material-symbol]');
      if (!arrow) return false;
      const a = arrow.getBoundingClientRect();
      const t = element.getBoundingClientRect();
      return Math.abs(a.top + a.height / 2 - (t.top + t.height / 2)) < 4;
    });
    expect(arrowAlignment).toBe(true);
    await expect(nav.getByRole('link', { name: 'Agenda de la Comunidad' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Actividades' })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
});

test('ficha V2: mapa compacto, descripción completa y sección Cuándo y dónde', async ({ page }, info) => {
  await page.goto(activities + '/actividad-1');
  const description = page.getByRole('region', { name: 'Descripción de la actividad' });
  await expect(description).toContainText('Primera edición de La Chamameceada');
  await expect(description.locator('p')).toHaveCount(3);
  const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(summary.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
  await expect(summary).toContainText('Jueves 5 de noviembre');
  await expect(summary).toContainText('21:00 h');
  const map = page.getByRole('region', { name: 'Mapa de ubicación' });
  await expect(map.getByRole('link', { name: 'Ver en Google Maps' })).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  const mapHeight = await map.locator('iframe').evaluate(el => el.getBoundingClientRect().height);
  expect(mapHeight).toBeLessThanOrEqual(220);
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);
  if ((info.project.use.viewport?.width ?? 0) >= 1024) {
    await expect(summary.locator('..')).toHaveCSS('position', 'sticky');
  }
});

test('ficha V2: tipo único, imagen, ubicación y sin inscripción ficticia', async ({ page }, info) => {
  for (const path of [activities + '/actividad-1', activities + '/tita-y-rhodesia']) {
    await page.goto(path);
    const image = page.getByTestId('agenda-detail-image');
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(400);
    await expect(page.getByRole('heading', { name: 'Información general' })).toHaveCount(0);
    const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
    await expect(summary.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
    await expect(summary.locator('section')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Ubicación en el mapa' })).toBeVisible();
    await expect(summary.getByRole('link', { name: /Google Maps/ })).toHaveCount(0);
    await expect(page.locator('iframe[title^="Mapa de"]')).toHaveAttribute('src', new RegExp('google[.]com/maps[?]q='));
    await expect(page.getByRole('button', { name: /Elegir horario|Inscribirme|Reservar cupo/ })).toHaveCount(0);
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(noOverflow, 'La ficha tiene overflow en ' + path + ' (' + info.project.name + ')').toBe(true);
  }
});

test('ficha sin Instagram y con CTA de inscripción solo si hay una URL válida', async ({ page }) => {
  for (const path of [activities + '/actividad-1', activities + '/tita-y-rhodesia']) {
    await page.goto(path);
    const share = page.getByLabel('Compartir actividad');
    await expect(share.getByRole('link', { name: 'Compartir por WhatsApp' })).toBeVisible();
    await expect(share.getByRole('link', { name: 'Compartir por Facebook' })).toBeVisible();
    await expect(share.locator('img[src*="instagram"]')).toHaveCount(0);
    await expect(share.getByRole('button', { name: 'Compartir desde el dispositivo' })).toHaveCount(0);
    // La planilla marca inscripción, pero no contiene los destinos externos.
    await expect(page.getByTestId('agenda-registration-link')).toHaveCount(0);
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

test('motion UX: desktop popovers y mobile sheets tienen duraciones coherentes', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(activities);
  const mobile = (info.project.use.viewport?.width ?? 0) <= 680;
  await page.getByRole('button', { name: 'Fecha', exact: true }).click();
  const dateSheet = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(dateSheet).toBeVisible();
  const motion = await dateSheet.evaluate(node => {
    const styles = getComputedStyle(node);
    return { animationName: styles.animationName, duration: styles.animationDuration };
  });
  expect(motion.animationName).toContain(mobile ? 'agenda-sheet-in' : 'agenda-popover-in');
  expect(motion.duration).toBe(mobile ? '0.23s' : '0.15s');
  await dateSheet.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(dateSheet).toHaveCount(0);

  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await panel.getByRole('button', { name: 'Tipo de actividad' }).click();
  await panel.getByRole('button', { name: 'Tipo de actividad' }).click();
  await expect(panel.locator('.agenda-motion-accordion')).toBeVisible();
  await panel.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(panel).toHaveCount(0);
});

test('motion UX mobile: chips deslizables con acción Limpiar visible', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) > 680) return;
  await page.goto(activities);
  await page.getByRole('button', { name: /Más Filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await panel.getByRole('checkbox', { name: 'Teatro', exact: true }).check();
  await panel.getByRole('checkbox', { name: 'Taller', exact: true }).check();
  await panel.getByRole('button', { name: 'Categoría' }).click();
  await panel.getByRole('checkbox', { name: 'Cultural' }).check();
  await panel.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(panel).toHaveCount(0);
  const chips = page.getByLabel('Filtros seleccionados');
  await expect(chips.locator('.agenda-filter-chips-scroll')).toHaveCSS('overflow-x', 'auto');
  await expect(chips.getByRole('button', { name: 'Limpiar' })).toBeVisible();
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(fits).toBe(true);
});

test('ficha V2: descripción antes de imagen, columna lateral y mapa para sede única', async ({ page }, info) => {
  for (const path of [activities + '/actividad-1', activities + '/tita-y-rhodesia']) {
    await page.goto(path);
    const description = page.getByRole('region', { name: 'Descripción de la actividad' });
    const image = page.getByTestId('agenda-detail-image');
    const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
    const map = page.getByRole('region', { name: 'Mapa de ubicación' });
    await expect(description).toBeVisible();
    await expect(image).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(map).toBeVisible();
    const descriptionBox = await description.boundingBox();
    const imageBox = await image.boundingBox();
    const summaryBox = await summary.boundingBox();
    const mapBox = await map.boundingBox();
    expect(descriptionBox).not.toBeNull();
    expect(imageBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(mapBox).not.toBeNull();
    expect(descriptionBox!.y).toBeLessThan(imageBox!.y);
    expect(mapBox!.y).toBeGreaterThan(imageBox!.y + imageBox!.height);
    if ((info.project.use.viewport?.width ?? 0) >= 1024) {
      expect(summaryBox!.x).toBeGreaterThan(imageBox!.x);
    }
    await expect(summary.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
    if (path.endsWith('/tita-y-rhodesia')) {
      await expect(summary.locator('[data-agenda-chip="activity"]').first()).toBeVisible();
    }
    const crumbs = page.getByRole('navigation', { name: 'Ruta de navegación' });
    if ((info.project.use.viewport?.width ?? 0) < 640) {
      await expect(crumbs.getByTestId('breadcrumb-mobile-back')).toBeVisible();
    } else {
      await expect(crumbs.getByTestId('breadcrumb-current')).toBeVisible();
    }
  }
});


test('vistas de Agenda V2: recurrencia, dos sedes y período', async ({ page }) => {
  await page.goto(activities + '/preview-v2-compostaje');
  await expect(page.getByRole('note')).toHaveCount(0);
  const compostaje = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(compostaje).toContainText('Todos los sábados');
  await expect(compostaje).toContainText('Del 7 al 28 de noviembre');
  await expect(compostaje).toContainText('10:00 a 12:00 h');
  await expect(page.getByRole('button', { name: 'Inscribirse', exact: true })).toBeDisabled();

  await page.goto(activities + '/preview-v2-futbol--sede-plaza-grigera');
  const futbol = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(futbol.locator('section')).toHaveCount(1);
  await expect(futbol).toContainText('Todos los martes');
  await expect(futbol).not.toContainText('Todos los jueves');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Plaza Grigera');
  await page.goto(activities + '/preview-v2-futbol--sede-parque-de-lomas');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toContainText('Todos los jueves');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Parque de Lomas');

  await page.goto(activities + '/preview-v2-muestra');
  const muestra = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(muestra).toContainText('Del 10 al 17 de noviembre');
  await expect(muestra).toContainText('Todos los días');
  await expect(muestra).toContainText('11:00 a 19:00 h');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();

  await page.goto(activities);
  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Taller de compostaje');
  await expect(page.getByTestId('agenda-card')).toHaveCount(1);
});
