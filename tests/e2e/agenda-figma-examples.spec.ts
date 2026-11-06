import { expect, test } from '@playwright/test';

const list = '/agenda-de-la-comunidad/actividades';
const consoleRoute = '/agenda-de-la-comunidad/consola-preview';
const items = [
  ['preview-v2-reciclaje', 'Jornada de reciclaje'],
  ['preview-v2-muestra', 'Muestra fotográfica barrial'],
  ['preview-v2-compostaje', 'Taller de compostaje'],
  ['preview-v2-futbol', 'Fútbol en Comunidad'],
  ['preview-v2-folklore', 'Folklore en Comunidad'],
  ['preview-v2-huerta', 'Taller de huerta comunitaria'],
  ['preview-v2-itinerante', 'Jornada ambiental itinerante'],
] as const;

test('Agenda V2: una ficha por sede en el mismo listado y filtros', async ({ page }) => {
  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  const grid = page.getByTestId('agenda-grid');
  await expect(grid).toBeVisible();
  await expect(grid.getByTestId('agenda-card')).toHaveCount(10);
  await expect(page.getByText('Mostrando - 10 de 10 actividades')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar más actividades' })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Buscar actividades' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver los 7 ejemplos' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ejemplos de actividades' })).toHaveCount(0);

  const expected = [
    ['Jornada de reciclaje', 1],
    ['Muestra fotográfica barrial', 1],
    ['Taller de compostaje', 1],
    ['Fútbol en Comunidad', 2],
    ['Folklore en Comunidad', 2],
    ['Taller de huerta comunitaria', 1],
    ['Yoga en Comunidad', 2],
  ] as const;
  for (const [title, count] of expected) {
    await search.fill(title);
    await expect(grid.locator('a[href*="preview-v2-"]')).toHaveCount(count);
    await expect(grid.getByRole('link', { name: 'Ver más sobre ' + title })).toHaveCount(count);
  }
  await search.fill('Jornada ambiental itinerante');
  await expect(page.getByTestId('agenda-empty-state')).toBeVisible();
  await search.fill('Yoga en Comunidad');
  await expect(grid).toContainText('Plaza Grigera');
  await expect(grid).toContainText('Polideportivo Evita');
  await expect(grid.getByText('Se suspende por lluvia')).toHaveCount(1);

  await search.fill('Taller de compostaje');
  await expect(grid).toContainText('Todos los sábados');
  await expect(grid).toContainText('Del 7 al 28 de noviembre');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Agenda V2: los siete detalles respetan los casos de programación de Figma', async ({ page }) => {
  for (const [id, title] of items) {
    await page.goto(list + '/' + id);
    await expect(page.getByRole('heading', { name: title, exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole('note')).toHaveCount(0);
    await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toBeVisible();
  }

  await page.goto(list + '/preview-v2-reciclaje');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toContainText('Sábado 14 de noviembre');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();

  await page.goto(list + '/preview-v2-muestra');
  const muestra = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  const muestraDate = muestra.locator('section').first().locator('[data-agenda-field="date"]');
  await expect(muestraDate.locator('p').first()).toHaveText('Todos los días');
  await expect(muestraDate.locator('p').nth(1)).toHaveText('Del 10 al 17 de noviembre');
  await expect(muestra.locator('section').first().locator('[data-agenda-field="time"] p')).toHaveText('11:00 a 19:00 h');

  await page.goto(list + '/preview-v2-compostaje');
  const compostaje = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  const compostajeDate = compostaje.locator('section').first().locator('[data-agenda-field="date"]');
  await expect(compostajeDate.locator('p').first()).toHaveText('Todos los sábados');
  await expect(compostajeDate.locator('p').nth(1)).toHaveText('Del 7 al 28 de noviembre');
  await expect(compostaje.locator('section').first().locator('[data-agenda-field="time"] p')).toHaveText('10:00 a 12:00 h');
  await expect(page.getByRole('button', { name: 'Inscribirse' })).toBeDisabled();

  await page.goto(list + '/preview-v2-futbol--sede-plaza-grigera');
  const futbol = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(futbol.locator('section')).toHaveCount(1);
  await expect(futbol).toContainText('Todos los martes');
  await expect(futbol).not.toContainText('Todos los jueves');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();

  await page.goto(list + '/preview-v2-futbol--sede-parque-de-lomas');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toContainText('Todos los jueves');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).not.toContainText('Todos los martes');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();

  // El enlace editorial anterior sigue vigente y redirige al primer encuentro.
  await page.goto(list + '/preview-v2-folklore');
  await expect(page).toHaveURL(/preview-v2-folklore--sede-plaza-grigera--fecha-2026-11-14$/);
  const folklore14 = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(folklore14.locator('section')).toHaveCount(1);
  await expect(folklore14).toContainText('Sábado 14 de noviembre');
  await expect(folklore14).toContainText('Andrea Gauna y Lautaro Rotela');
  await expect(folklore14).not.toContainText('Participan');
  await expect(folklore14.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
  await expect(folklore14).not.toContainText('Brian Albornoz');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Plaza Grigera');

  await page.goto(list + '/preview-v2-folklore--sede-plaza-grigera--fecha-2026-11-21');
  const folklore21 = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(folklore21.locator('section')).toHaveCount(1);
  await expect(folklore21).toContainText('Sábado 21 de noviembre');
  await expect(folklore21).toContainText('Brian Albornoz y Luz Pedrosa');
  await expect(folklore21).not.toContainText('Participan');
  await expect(folklore21.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
  await expect(folklore21).not.toContainText('Andrea Gauna');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Plaza Grigera');

  await page.goto(list + '/preview-v2-huerta');
  await expect(page.getByRole('heading', { name: 'Inscripción', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inscribirse' })).toHaveCount(0);

  await page.goto(list + '/preview-v2-itinerante--sede-plaza-grigera');
  const itinerante = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(itinerante.locator('section')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();
  await expect(page.getByText('Plaza Grigera').first()).toBeVisible();

  await page.goto(list + '/preview-v2-itinerante--sede-parque-de-lomas');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' }).locator('section')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toBeVisible();
  await expect(page.getByText('Parque de Lomas').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Consola V2: desde cada ficha de ejemplo se cargan fechas y campos editables', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-futbol');
  await expect(page).toHaveURL(/caso=preview-v2-futbol/);
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Fútbol en Comunidad');
  await expect(page.getByTestId('console-schedule-row')).toHaveCount(2);
  await expect(page.getByTestId('console-schedules-table')).toContainText('Todos los jueves');
  await expect(page.getByTestId('console-schedules-table')).toContainText('Parque de Lomas');

  await page.getByRole('combobox', { name: 'Casos de demostración' }).selectOption('preview-v2-huerta');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Taller de huerta comunitaria');
  await expect(page.getByRole('combobox', { name: 'Modalidad', exact: true })).toHaveValue('in-person');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').getByRole('button', { name: 'Ver más' }).click();
  await expect(page.getByTestId('console-detail-preview')).toContainText('La inscripción se realiza de manera presencial');
  await expect(page.getByTestId('console-detail-preview').getByRole('button', { name: 'Inscribirse' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar vista previa del detalle' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Consola V2: portada, detalle y texto de programación se visualizan sin publicación', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-folklore');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Folklore en Comunidad');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const folkloreCards = page.getByTestId('console-preview-card');
  await expect(folkloreCards).toHaveCount(2);
  await expect(folkloreCards.nth(0)).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCards.nth(0)).not.toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(1)).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(1)).not.toContainText('Sábado 14 de noviembre');
  await expect(folkloreCards.nth(0)).toContainText('Andrea Gauna y Lautaro Rotela');
  await expect(folkloreCards.nth(1)).toContainText('Brian Albornoz y Luz Pedrosa');
  for (const card of await folkloreCards.all()) {
    await expect(card.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
    await expect(card).not.toContainText('Participan');
    await expect(card.getByTestId('agenda-card-schedules').locator(':scope > [data-agenda-characteristic]')).toHaveCount(4);
    await expect(card.locator('[data-agenda-programming-divider]')).toHaveCount(0);
  }
  await folkloreCards.nth(0).getByRole('button', { name: 'Ver más' }).click();
  const dialog = page.getByTestId('console-detail-preview');
  await expect(dialog).toContainText('Andrea Gauna y Lautaro Rotela');
  await expect(dialog).not.toContainText('Participan');
  await expect(dialog.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
  await expect(dialog).not.toContainText('Brian Albornoz');
  await page.keyboard.press('Escape');
  await folkloreCards.nth(1).getByRole('button', { name: 'Ver más' }).click();
  await expect(dialog).toContainText('Brian Albornoz y Luz Pedrosa');
  await expect(dialog).not.toContainText('Participan');
  await expect(dialog.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
  await expect(dialog).not.toContainText('Andrea Gauna');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('Yoga en Comunidad: dos fichas públicas independientes y un mapa por sede', async ({ page }) => {
  const path = list + '/preview-v2-yoga-dos-sedes--sede-';
  await page.goto(path + 'plaza-grigera');
  await expect(page.getByRole('heading', { name: 'Yoga en Comunidad', exact: true, level: 1 })).toBeVisible();
  const plaza = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(plaza.locator('section')).toHaveCount(1);
  await expect(plaza).toContainText('Todos los martes');
  await expect(plaza).toContainText('Del 10 de noviembre al 15 de diciembre');
  await expect(plaza.locator('[data-agenda-chip-kind="rain"]')).toHaveCount(1);
  await expect(plaza.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Plaza Grigera');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).not.toContainText('Polideportivo Evita');

  await page.goto(path + 'polideportivo-evita');
  await expect(page.getByRole('heading', { name: 'Yoga en Comunidad', exact: true, level: 1 })).toBeVisible();
  const polideportivo = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(polideportivo.locator('section')).toHaveCount(1);
  await expect(polideportivo).toContainText('Todos los jueves');
  await expect(polideportivo).toContainText('Del 12 de noviembre al 17 de diciembre');
  await expect(polideportivo.locator('[data-agenda-chip-kind="rain"]')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Polideportivo Evita');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).not.toContainText('Plaza Grigera');

  await page.goto(list + '/preview-v2-yoga-dos-sedes');
  await expect(page).toHaveURL(/preview-v2-yoga-dos-sedes--sede-plaza-grigera/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('La consola agrupa fechas por sede y permite la vista previa de cada ubicación', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Yoga en Comunidad');
  await expect(page.getByTestId('console-schedule-row')).toHaveCount(2);
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const cards = page.getByTestId('console-preview-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Plaza Grigera');
  await expect(cards.nth(0)).toContainText('Se suspende por lluvia');
  await expect(cards.nth(1)).toContainText('Polideportivo Evita');
  await expect(cards.nth(1)).not.toContainText('suspende por lluvia');

  await cards.nth(1).getByRole('button', { name: 'Ver más' }).click();
  const detail = page.getByTestId('console-detail-preview');
  await expect(detail.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Polideportivo Evita');
  await expect(detail).not.toContainText('Plaza Grigera');
  await page.getByRole('button', { name: 'Cerrar vista previa del detalle' }).click();

  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Formulario', exact: true }).click();
  }
  await page.getByRole('combobox', { name: 'Casos de demostración' }).selectOption('preview-v2-folklore');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const folkloreCards = page.getByTestId('console-preview-card');
  await expect(folkloreCards).toHaveCount(2);
  await expect(folkloreCards.nth(0)).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCards.nth(1)).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(0)).not.toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(1)).not.toContainText('Sábado 14 de noviembre');
});

test('Tarjetas Figma: componentes con/sin label, grupos 8 px y bloques 16 px', async ({ page }, info) => {
  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Taller de compostaje');
  const card = page.getByTestId('agenda-card');
  await expect(card).toHaveCount(1);
  const schedules = card.getByTestId('agenda-card-schedules');
  await expect(schedules.locator('[data-agenda-characteristic="con-label"]')).toHaveCount(2);
  await expect(schedules.locator('[data-agenda-characteristic="sin-label"]')).toHaveCount(1);
  await expect(schedules).toContainText('Todos los sábados');
  await expect(schedules).toContainText('Del 7 al 28 de noviembre');
  await expect(schedules.locator('[data-agenda-field="date"] p').first()).toHaveText('Todos los sábados');
  await expect(schedules.locator('[data-agenda-field="date"] p').nth(1)).toHaveText('Del 7 al 28 de noviembre');
  await expect(schedules).toContainText('10:00 a 12:00 h');
  const gaps = await schedules.evaluate(element => ({
    groups: getComputedStyle(element).gap,
    inside: getComputedStyle(element.firstElementChild as Element).gap,
    iconText: getComputedStyle(element.querySelector('[data-agenda-characteristic]') as Element).gap,
  }));
  expect(gaps).toEqual({ groups: '16px', inside: '8px', iconText: '8px' });
  const textSizes = await schedules.locator('[data-agenda-characteristic] p').evaluateAll(
    elements => elements.map(element => getComputedStyle(element).fontSize),
  );
  expect(textSizes.length).toBeGreaterThanOrEqual(5);
  expect(textSizes.every(size => size === '18px')).toBe(true);
  await expect(schedules).toContainText('Parque de Lomas');
  await expect(schedules).toContainText('Frías y Portela');
  // Fecha, horario y lugar son tres componentes hermanos independientes.
  await expect(schedules.locator(':scope > [data-agenda-characteristic]')).toHaveCount(3);
  await expect(schedules.locator(':scope > [data-agenda-characteristic]').nth(0)).toContainText('Todos los sábados');
  await expect(schedules.locator(':scope > [data-agenda-characteristic]').nth(1)).toContainText('10:00 a 12:00 h');
  await expect(schedules.locator(':scope > [data-agenda-characteristic]').nth(2)).toContainText('Parque de Lomas');
  await expect(schedules.locator('[data-agenda-programming-divider]')).toHaveCount(0);
  const chip = card.locator('[data-agenda-chip="activity"]').first();
  await expect(chip).toBeVisible();
  expect(await chip.evaluate(element => getComputedStyle(element).fontSize)).toBe('16px');

  await search.fill('Folklore en Comunidad');
  const folkloreCards = page.getByTestId('agenda-card');
  await expect(folkloreCards).toHaveCount(2);
  await expect(folkloreCards.nth(0).getByTestId('agenda-card-schedules').locator(':scope > [data-agenda-characteristic]')).toHaveCount(4);
  await expect(folkloreCards.nth(1).getByTestId('agenda-card-schedules').locator(':scope > [data-agenda-characteristic]')).toHaveCount(4);
  await expect(page.locator('[data-agenda-programming-divider]')).toHaveCount(0);
  await expect(folkloreCards.nth(0)).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCards.nth(1)).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(0)).not.toContainText('Sábado 21 de noviembre');
  await expect(folkloreCards.nth(1)).not.toContainText('Sábado 14 de noviembre');
  await expect(folkloreCards.nth(0)).toContainText('Andrea Gauna y Lautaro Rotela');
  await expect(folkloreCards.nth(1)).toContainText('Brian Albornoz y Luz Pedrosa');
  for (const card of await folkloreCards.all()) {
    await expect(card.locator('[data-agenda-field="artists"] [data-material-symbol="comedy_mask"]')).toHaveCount(1);
    await expect(card).not.toContainText('Participan');
  }

  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});

test('Chips de Agenda: alineación óptica, tipografía, altura e íconos según Figma', async ({ page }) => {
  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Taller de compostaje');
  const chips = page.locator('[data-testid="agenda-card"] [data-agenda-chip="activity"]');
  await expect(chips).toHaveCount(2);
  const measurements = await chips.evaluateAll(elements => elements.map(element => {
    const icon = element.querySelector('[data-agenda-chip-icon]') as HTMLElement;
    const label = element.querySelector('[data-agenda-chip-label]') as HTMLElement;
    const chipBounds = element.getBoundingClientRect();
    const iconBounds = icon.getBoundingClientRect();
    const textBounds = label.getBoundingClientRect();
    return {
      chipHeight: chipBounds.height,
      fontSize: getComputedStyle(label).fontSize,
      gap: getComputedStyle(element).gap,
      alignItems: getComputedStyle(element).alignItems,
      iconWidth: iconBounds.width,
      iconOffset: Math.abs(iconBounds.y + iconBounds.height / 2 - (chipBounds.y + chipBounds.height / 2)),
      labelOffset: Math.abs(textBounds.y + textBounds.height / 2 - (chipBounds.y + chipBounds.height / 2)),
    };
  }));
  for (const chip of measurements) {
    expect(chip.chipHeight).toBeCloseTo(24, 2);
    expect(chip.fontSize).toBe('16px');
    expect(chip.gap).toBe('6px');
    expect(chip.alignItems).toBe('center');
    expect(chip.iconWidth).toBeCloseTo(16, 2);
    expect(chip.iconOffset).toBeLessThanOrEqual(1);
    expect(chip.labelOffset).toBeLessThanOrEqual(1);
  }

  await search.fill('Yoga en Comunidad');
  const rainyChip = page.locator('[data-agenda-chip-kind="rain"]');
  await expect(rainyChip).toHaveCount(1);
  expect(await rainyChip.locator('[data-agenda-chip-icon]').evaluate(element => element.getBoundingClientRect().width)).toBeCloseTo(18, 2);
  expect(await rainyChip.locator('[data-agenda-chip-label]').evaluate(element => getComputedStyle(element).fontSize)).toBe('16px');
});


test('Agenda V2: chevron de tarjetas 24 × 24 y bordes de detalles como el mapa (8 px)', async ({ page }, info) => {
  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Folklore en Comunidad');
  const cards = page.getByTestId('agenda-card');
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    const chevron = card.locator('[data-material-symbol="chevron_right"]');
    await expect(chevron).toHaveCount(1);
    const size = await chevron.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    // Chromium puede devolver fracciones de subpíxel (ej.: 23.99993896484375).
    // Tolerar centésimas de píxel conserva la exigencia de geometría 24 × 24.
    expect(size.width).toBeCloseTo(24, 2);
    expect(size.height).toBeCloseTo(24, 2);
  }

  await page.goto(list + '/preview-v2-folklore--sede-plaza-grigera--fecha-2026-11-14');
  const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' }).locator('section');
  await expect(summary).toHaveCount(1);
  const summaryRadius = await summary.evaluate(element => getComputedStyle(element).borderTopLeftRadius);
  const locationRadius = await page.getByRole('region', { name: 'Mapa de ubicación' })
    .locator('div.grid').first().evaluate(element => getComputedStyle(element).borderTopLeftRadius);
  expect(summaryRadius).toBe('8px');
  expect(summaryRadius).toBe(locationRadius);

  await page.goto(consoleRoute + '?caso=preview-v2-folklore');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const card = page.getByTestId('console-preview-card').first();
  const previewChevron = card.locator('[data-material-symbol="chevron_right"]');
  const previewSize = await previewChevron.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(previewSize.width).toBeCloseTo(24, 2);
  expect(previewSize.height).toBeCloseTo(24, 2);

  await card.getByRole('button', { name: 'Ver más' }).click();
  const preview = page.getByTestId('console-detail-preview');
  const previewRadius = await preview.getByRole('complementary', { name: 'Cuándo y dónde' })
    .locator('section').first().evaluate(element => getComputedStyle(element).borderTopLeftRadius);
  expect(previewRadius).toBe('8px');
});


test('Agenda V2: mismo bloque con calendario, recurrencia bold, período regular y reloj en todas las vistas', async ({ page }, info) => {
  const verify = async (root: import('@playwright/test').Locator, title: string, period: string, time: string) => {
    const date = root.locator('[data-agenda-field="date"]').first();
    await expect(date.locator('[data-material-symbol="event_available"]')).toHaveCount(1);
    await expect(date.locator('p').first()).toHaveText(title);
    await expect(date.locator('p').nth(1)).toHaveText(period);
    const weights = await date.locator('p').evaluateAll(
      elements => elements.map(element => getComputedStyle(element).fontWeight),
    );
    expect(weights).toEqual(['700', '400']);
    const timeField = root.locator('[data-agenda-field="time"]').first();
    await expect(timeField.locator('[data-material-symbol="schedule"]')).toHaveCount(1);
    await expect(timeField.locator('p')).toHaveText(time);
    expect(await timeField.locator('p').evaluate(el => getComputedStyle(el).fontWeight)).toBe('700');
    await expect(root).not.toContainText(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
  };

  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Yoga en Comunidad');
  await verify(page.getByTestId('agenda-card').first(), 'Todos los martes',
    'Del 10 de noviembre al 15 de diciembre', '09:00 a 10:00 h');

  await page.goto(list + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  await verify(page.getByRole('complementary', { name: 'Cuándo y dónde' }), 'Todos los martes',
    'Del 10 de noviembre al 15 de diciembre', '09:00 a 10:00 h');

  await page.goto(list + '/preview-v2-muestra');
  await verify(page.getByRole('complementary', { name: 'Cuándo y dónde' }), 'Todos los días',
    'Del 10 al 17 de noviembre', '11:00 a 19:00 h');

  await page.goto(list);
  await search.fill('Muestra fotográfica barrial');
  await verify(page.getByTestId('agenda-card').first(), 'Todos los días',
    'Del 10 al 17 de noviembre', '11:00 a 19:00 h');

  await page.goto(consoleRoute + '?caso=preview-v2-muestra');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const previewCard = page.getByTestId('console-preview-card').first();
  await verify(previewCard, 'Todos los días', 'Del 10 al 17 de noviembre', '11:00 a 19:00 h');
  await previewCard.getByRole('button', { name: 'Ver más' }).click();
  await verify(page.getByTestId('console-detail-preview'), 'Todos los días',
    'Del 10 al 17 de noviembre', '11:00 a 19:00 h');
});


test('Figma Agenda V2: mapa de sede, tipografía, separación, chevron y borde responsive', async ({ page }, info) => {
  await page.goto(list + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const region = page.getByRole('region', { name: 'Mapa de ubicación' });
  const location = region.getByTestId('agenda-location-card');
  const details = region.getByTestId('agenda-location-details');
  await expect(location).toBeVisible();
  await expect(details.getByText('Plaza Grigera', { exact: true })).toBeVisible();
  const metrics = await details.evaluate(element => {
    const items = Array.from(element.children) as HTMLElement[];
    const style = getComputedStyle(element);
    return {
      padding: style.padding,
      gap: style.gap,
      type: items.map(child => ({
        size: getComputedStyle(child).fontSize,
        weight: getComputedStyle(child).fontWeight,
      })),
    };
  });
  expect(metrics.padding).toBe('16px');
  expect(metrics.gap).toBe('8px');
  expect(metrics.type).toEqual([
    { size: '18px', weight: '700' },
    { size: '18px', weight: '400' },
    { size: '18px', weight: '500' },
  ]);
  const link = region.getByRole('link', { name: 'Ver en Google Maps' });
  await expect(link).toHaveAttribute('target', '_blank');
  const icon = link.locator('[data-material-symbol="chevron_right"]');
  await expect(icon).toHaveCount(1);
  const size = await icon.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return [rect.width, rect.height];
  });
  expect(size).toEqual([24, 24]);
  expect(await location.evaluate(element => getComputedStyle(element).borderTopLeftRadius)).toBe('8px');
  expect(await location.evaluate(element => getComputedStyle(element).borderTopColor)).toBe('rgb(209, 209, 209)');
  await expect(region.getByTitle('Mapa de Plaza Grigera')).toBeVisible();
  const responsive = await region.evaluate(element => {
    const card = element.querySelector('[data-testid="agenda-location-card"]')!;
    const panel = element.querySelector('[data-testid="agenda-location-details"]')!;
    const frame = element.querySelector('iframe')!;
    return {
      panel: panel.getBoundingClientRect().toJSON(),
      frame: frame.getBoundingClientRect().toJSON(),
      card: card.getBoundingClientRect().toJSON(),
    };
  });
  if ((info.project.use.viewport?.width ?? 0) < 640) {
    expect(Math.abs(responsive.frame.y - responsive.card.y)).toBeLessThanOrEqual(2);
    expect(responsive.frame.x).toBeGreaterThanOrEqual(responsive.panel.right - 1);
    expect(Math.round(responsive.frame.width)).toBe(112);
  } else {
    expect(Math.abs(responsive.frame.y - responsive.card.y)).toBeLessThanOrEqual(2);
    expect(responsive.frame.width / responsive.card.width).toBeGreaterThan(0.4);
    expect(responsive.frame.width / responsive.card.width).toBeLessThan(0.43);
  }
});

test('Agenda V2: Ver más alineado con categoría y título; chevron centrado', async ({ page }, info) => {
  await page.goto(list);
  const search = page.getByRole('textbox', { name: 'Buscar actividades' });
  await search.fill('Yoga en Comunidad');
  const card = page.getByTestId('agenda-card').first();
  const category = card.locator('p.uppercase').first();
  const title = card.getByRole('heading', { name: 'Yoga en Comunidad' });
  const more = card.getByText('Ver más', { exact: true });
  const icon = card.locator('[data-material-symbol="chevron_right"]');
  const positions = await Promise.all([category, title, more, icon].map(locator =>
    locator.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, centerY: rect.y + rect.height / 2 };
    })));
  expect(Math.abs(positions[0].x - positions[1].x)).toBeLessThanOrEqual(1);
  expect(Math.abs(positions[0].x - positions[2].x)).toBeLessThanOrEqual(1);
  expect(Math.abs(positions[2].centerY - positions[3].centerY)).toBeLessThanOrEqual(1);
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }

  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const preview = page.getByTestId('console-preview-card').first();
  const aligned = await Promise.all([
    preview.locator('p.uppercase').first(),
    preview.getByRole('button', { name: 'Ver más' }).getByText('Ver más', { exact: true }),
  ].map(locator => locator.evaluate(el => el.getBoundingClientRect().x)));
  expect(Math.abs(aligned[0] - aligned[1])).toBeLessThanOrEqual(1);
});


test('Agenda V2: sidebar fija Cuándo y dónde a 24 px con el contenido REAL; Compartir no es sticky', async ({ page }, info) => {
  const width = info.project.use.viewport?.width ?? 0;
  await page.setViewportSize({ width: Math.max(width, 390), height: 620 });
  await page.goto(list + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');

  const sidebar = page.getByTestId('agenda-detail-sidebar');
  const sticky = page.getByTestId('agenda-detail-sticky');
  const share = sidebar.getByLabel('Compartir actividad');
  const summary = sidebar.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(summary).toBeVisible();

  if (width < 1024) {
    await expect(sticky).toHaveCSS('position', 'static');
    await expect(page.locator('[data-layout-container="true"]').first()).toBeVisible();
    return;
  }

  await expect(sticky).toHaveCSS('position', 'sticky');
  await expect(sticky).toHaveCSS('top', '24px');
  await expect(sidebar).toHaveCSS('display', 'flex');
  await expect(sticky).toHaveCSS('max-height', '572px');
  expect(await sticky.evaluate(element => element.contains(document.querySelector('[aria-label="Compartir actividad"]')))).toBe(false);

  // No se introduce ninguna altura sintética: medir la propia ficha publicada.
  const initial = await page.evaluate(() => {
    const grid = document.querySelector('.agenda-motion-detail')!;
    const sidebar = document.querySelector('[data-testid="agenda-detail-sidebar"]')!;
    const sticky = document.querySelector('[data-testid="agenda-detail-sticky"]')!;
    return {
      gridTop: grid.getBoundingClientRect().top,
      gridHeight: grid.getBoundingClientRect().height,
      sidebarHeight: sidebar.getBoundingClientRect().height,
      stickyHeight: sticky.getBoundingClientRect().height,
      maxScroll: document.documentElement.scrollHeight - innerHeight,
    };
  });
  expect(initial.sidebarHeight).toBeGreaterThanOrEqual(initial.gridHeight - 2);
  expect(initial.gridHeight - initial.stickyHeight).toBeGreaterThan(110);
  expect(initial.maxScroll).toBeGreaterThan(220);

  // Avanzar solo dentro del espacio donde existe recorrido real para el sticky.
  const scrollTarget = Math.max(0, Math.floor(initial.gridTop + 140));
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scrollTarget);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  // Esperar a que termine el reposicionamiento antes de medir el sticky.
  // Se conserva exactamente el rango exigido (24 ± 1 px), sin modificar el CSS.
  await expect.poll(async () => {
    const top = await sticky.evaluate(element => element.getBoundingClientRect().top);
    return Math.abs(top - 24);
  }).toBeLessThanOrEqual(1);

  // Compartir queda arriba y se aleja de la pantalla al desplazar la página.
  expect(await share.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(24);

  // El panel queda contenido dentro de la ficha: nunca invade el footer.
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  const bounds = await page.evaluate(() => {
    const grid = document.querySelector('.agenda-motion-detail')!.getBoundingClientRect();
    const sticky = document.querySelector('[data-testid="agenda-detail-sticky"]')!.getBoundingClientRect();
    const footer = document.querySelector('footer')!.getBoundingClientRect();
    return { stickyBottom: sticky.bottom, gridBottom: grid.bottom, footerTop: footer.top };
  });
  expect(bounds.stickyBottom).toBeLessThanOrEqual(bounds.gridBottom + 1);
  expect(bounds.stickyBottom).toBeLessThanOrEqual(bounds.footerTop + 1);
});

test('Agenda V2: consola mantiene Compartir afuera del sticky y respeta su encabezado', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const sidebar = page.getByTestId('agenda-console-detail-sidebar');
  const sticky = page.getByTestId('agenda-console-detail-sticky');
  await expect(sidebar).toBeVisible();
  if ((info.project.use.viewport?.width ?? 0) >= 1024) {
    await expect(sidebar).toHaveCSS('display', 'flex');
    await expect(sticky).toHaveCSS('position', 'sticky');
    await expect(sticky).toHaveCSS('top', '88px');
  } else {
    await expect(sticky).toHaveCSS('position', 'static');
  }
  expect(await sticky.evaluate(el => el.contains(el.previousElementSibling))).toBe(false);
});

test('Agenda V2: la lluvia corresponde a cada programación y queda fuera de su caja', async ({ page }, info) => {
  await page.goto(list + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const rainy = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  const chip = rainy.locator('[data-agenda-chip-kind="rain"]');
  await expect(chip).toHaveCount(1);
  await expect(rainy.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  const badgeBottom = await chip.evaluate(element => element.getBoundingClientRect().bottom);
  const cardTop = await rainy.locator('section').first().evaluate(element => element.getBoundingClientRect().top);
  expect(badgeBottom).toBeLessThan(cardTop);

  await page.goto(list + '/preview-v2-yoga-dos-sedes--sede-polideportivo-evita');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' }).locator('[data-agenda-chip-kind="rain"]')).toHaveCount(0);

  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  await expect(page.getByRole('checkbox', { name: 'Se suspende por lluvia' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar programación 2' }).click();
  const rainControl = page.getByTestId('console-schedule-editor').getByRole('checkbox', { name: 'Se suspende por lluvia' });
  await expect(rainControl).not.toBeChecked();
  await rainControl.check();
  await page.getByTestId('console-schedule-editor').getByRole('button', { name: 'Guardar programación' }).click();
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const cards = page.getByTestId('console-preview-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).locator('[data-agenda-chip-kind="rain"]')).toHaveCount(1);
  await expect(cards.nth(1).locator('[data-agenda-chip-kind="rain"]')).toHaveCount(1);
  await cards.nth(1).getByRole('button', { name: 'Ver más' }).click();
  const detail = page.getByTestId('console-detail-preview');
  await expect(detail.locator('[data-agenda-chip-kind="rain"]')).toHaveCount(1);
  await expect(detail.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
});
