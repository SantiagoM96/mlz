import { test, expect, type Locator } from '@playwright/test';

// Una sola lectura de layout evita combinar posiciones tomadas antes y después
// de un reflow asíncrono (por ejemplo, al cargar la fuente Geometria).
async function descriptionImageGap(description: Locator): Promise<number> {
  await expect(description).toBeVisible();
  return description.evaluate(element => {
    const image = element.nextElementSibling;
    if (!(image instanceof HTMLImageElement)) {
      throw new Error('La imagen debe seguir a la descripción dentro de la misma sección.');
    }
    return Math.round(image.getBoundingClientRect().top - element.getBoundingClientRect().bottom);
  });
}

const base = '/agenda-de-la-comunidad/actividades';
const consoleRoute = '/agenda-de-la-comunidad/consola-preview';

test('Ficha mobile: descripción, imagen, fechas y mapa en un solo scroll', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  await expect(page.getByRole('tablist', { name: 'Secciones de la actividad' })).toHaveCount(0);
  const information = page.getByTestId('agenda-detail-information');
  const sidebar = page.getByTestId('agenda-detail-sidebar');
  const summary = sidebar.getByRole('complementary', { name: 'Cuándo y dónde' });
  const map = page.getByRole('region', { name: 'Mapa de ubicación' });
  await expect(information).toBeVisible();
  await expect(information).toContainText('Clases de yoga');
  await expect(page.getByTestId('agenda-detail-image')).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(summary).toContainText('Todos los martes');
  await expect(map).toBeVisible();
  if ((info.project.use.viewport?.width ?? 0) >= 1024) {
    await expect(page.getByTestId('agenda-detail-sticky')).toHaveCSS('position', 'sticky');
    await expect(page.getByTestId('agenda-detail-sticky')).toHaveCSS('top', '24px');
  } else {
    await expect(page.getByTestId('agenda-detail-sticky')).toHaveCSS('position', 'static');
    const layout = await page.evaluate(() => {
      const image = document.querySelector('[data-testid="agenda-detail-image"]')!.getBoundingClientRect();
      const summary = document.querySelector('[aria-label="Cuándo y dónde"]')!.getBoundingClientRect();
      const map = document.querySelector('[aria-label="Mapa de ubicación"]')!.getBoundingClientRect();
      return { imageBottom: image.bottom, summaryTop: summary.top, summaryBottom: summary.bottom, mapTop: map.top };
    });
    expect(layout.summaryTop).toBeGreaterThanOrEqual(layout.imageBottom - 1);
    expect(layout.mapTop).toBeGreaterThanOrEqual(layout.summaryBottom - 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('Mapa horizontal: textos y enlace a la izquierda, miniatura a la derecha', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const card = page.getByTestId('agenda-location-card');
  const detail = card.getByTestId('agenda-location-details');
  const frame = card.getByTitle('Mapa de Plaza Grigera');
  await expect(frame).toBeVisible();
  await expect(detail.getByText('Plaza Grigera', { exact: true })).toBeVisible();
  await expect(card.getByRole('link', { name: 'Ver en Google Maps' })).toHaveAttribute('target', '_blank');
  const size = await Promise.all([card, detail, frame].map(item => item.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, right: rect.right };
  })));
  expect(size[2].x).toBeGreaterThanOrEqual(size[1].right - 1);
  expect(Math.abs(size[2].y - size[0].y)).toBeLessThanOrEqual(2);
  if ((info.project.use.viewport?.width ?? 0) < 640) {
    expect(Math.round(size[2].width)).toBe(112);
  } else {
    expect(size[2].width / size[0].width).toBeGreaterThan(0.4);
    expect(size[2].width / size[0].width).toBeLessThan(0.43);
  }
});

test('Consola: ficha sin pestañas, fechas y mapa visibles en todas las pantallas', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024)
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const modal = page.getByTestId('console-detail-preview');
  await expect(modal.getByRole('tablist')).toHaveCount(0);
  const information = modal.getByTestId('agenda-console-detail-information');
  const sidebar = modal.getByTestId('agenda-console-detail-sidebar');
  await expect(information).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toContainText('Todos los martes');
  await expect(modal.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();
  await expect(modal.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  if ((info.project.use.viewport?.width ?? 0) >= 1024) {
    await expect(modal.getByTestId('agenda-console-detail-sticky')).toHaveCSS('position', 'sticky');
  } else {
    const boxes = await Promise.all([information, sidebar].map(item =>
      item.evaluate(el => el.getBoundingClientRect().toJSON())));
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].top);
  }
  await modal.getByRole('button', { name: 'Cerrar vista previa del detalle' }).click();
  await expect(modal).toHaveCount(0);
});

test('Lluvia por programación: chip afuera de la caja con 16px', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const program = page.getByTestId('agenda-detail-programming').first();
  await expect(program.getByTestId('agenda-schedule-rain')).toBeVisible();
  const geometry = await program.evaluate(el => {
    const badge = el.querySelector('[data-testid="agenda-schedule-rain"]')!;
    const box = el.querySelector(':scope > section')!;
    return { outside: !box.contains(badge), gap: Math.round(box.getBoundingClientRect().top - badge.getBoundingClientRect().bottom) };
  });
  expect(geometry).toEqual({ outside: true, gap: 16 });
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-polideportivo-evita');
  await expect(page.getByTestId('agenda-schedule-rain')).toHaveCount(0);

  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024)
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const preview = page.getByTestId('console-detail-preview').getByTestId('agenda-detail-programming').first();
  await expect(preview.getByTestId('agenda-schedule-rain')).toBeVisible();
  const previewGap = await preview.evaluate(el => {
    const badge = el.querySelector('[data-testid="agenda-schedule-rain"]')!;
    const box = el.querySelector(':scope > section')!;
    return Math.round(box.getBoundingClientRect().top - badge.getBoundingClientRect().bottom);
  });
  expect(previewGap).toBe(16);
});


// Regresión: sin inscripción no debe existir un contenedor vacío que agregue 16px
// tras la última caja de horarios. El texto e imagen tienen separación de 16px.
test('Ficha mobile: sin margen fantasma tras horarios y descripción a imagen a 16px', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const width = info.project.use.viewport?.width ?? 0;
  const infoPanel = page.getByTestId('agenda-detail-information');
  const description = infoPanel.getByRole('region', { name: 'Descripción de la actividad' });
  await expect(page.getByTestId('agenda-detail-image')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  expect(await descriptionImageGap(description)).toBe(width < 1024 ? 16 : 24);

  // Yoga no requiere inscripción. El único hijo del sticky debe ser el resumen.
  const sticky = page.getByTestId('agenda-detail-sticky');
  await expect(sticky.locator(':scope > *')).toHaveCount(1);
  if (width < 1024) {
    const panelBottom = await sticky.evaluate(el => {
      const summary = el.firstElementChild!;
      return Math.round(el.getBoundingClientRect().bottom - summary.getBoundingClientRect().bottom);
    });
    expect(panelBottom).toBe(0);
  }

  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if (width < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const modal = page.getByTestId('console-detail-preview');
  const modalDescription = modal.getByRole('region', { name: 'Descripción de la actividad' });
  await expect(modal.getByTestId('agenda-console-detail-image')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
  expect(await descriptionImageGap(modalDescription)).toBe(width < 1024 ? 16 : 24);
  const modalSticky = modal.getByTestId('agenda-console-detail-sticky');
  await expect(modalSticky.locator(':scope > *')).toHaveCount(1);
  if (width < 1024) {
    const extra = await modalSticky.evaluate(el => Math.round(
      el.getBoundingClientRect().bottom - el.firstElementChild!.getBoundingClientRect().bottom,
    ));
    expect(extra).toBe(0);
  }
});

test('Agenda mobile: breadcrumb sin título truncado y vínculo al listado', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-polideportivo-evita');
  const nav = page.getByRole('navigation', { name: 'Ruta de navegación' });
  const back = nav.getByTestId('breadcrumb-mobile-back');
  if ((info.project.use.viewport?.width ?? 0) < 640) {
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', /\/agenda-de-la-comunidad\/actividades\/?$/);
    await expect(back.getByText('Volver')).toBeVisible();
    await expect(back.locator('[data-material-symbol="arrow_back"]')).toHaveCount(1);
    await expect(nav.getByTestId('breadcrumb-current')).toBeHidden();
    await back.click();
    await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/?$/);
    await expect(page.getByTestId('agenda-toolbar')).toBeVisible();
  } else {
    await expect(back).toBeHidden();
    await expect(nav.getByTestId('breadcrumb-current')).toBeVisible();
  }
});
