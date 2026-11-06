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
  await expect(page.getByRole('link', { name: 'Ver los 7 ejemplos' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ejemplos de actividades' })).toHaveCount(0);

  const expected = [
    ['Jornada de reciclaje', 1],
    ['Muestra fotográfica barrial', 1],
    ['Taller de compostaje', 1],
    ['Fútbol en Comunidad', 2],
    ['Folklore en Comunidad', 1],
    ['Taller de huerta comunitaria', 1],
    ['Jornada ambiental itinerante', 2],
    ['Yoga en Comunidad', 2],
  ] as const;
  for (const [title, count] of expected) {
    await search.fill(title);
    await expect(grid.locator('a[href*="preview-v2-"]')).toHaveCount(count);
    await expect(grid.getByRole('link', { name: 'Ver más sobre ' + title })).toHaveCount(count);
  }
  await search.fill('Yoga en Comunidad');
  await expect(grid).toContainText('Plaza Grigera');
  await expect(grid).toContainText('Polideportivo Evita');
  await expect(grid.getByText('Se suspende por lluvia')).toHaveCount(1);

  await search.fill('Taller de compostaje');
  await expect(grid).toContainText('Todos los sábados');
  await expect(grid).toContainText('Del 07/11/2026 al 28/11/2026');
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
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toContainText('Todos los días');

  await page.goto(list + '/preview-v2-compostaje');
  await expect(page.getByRole('complementary', { name: 'Cuándo y dónde' })).toContainText('Del 07/11/2026 al 28/11/2026');
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

  await page.goto(list + '/preview-v2-folklore');
  const folklore = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(folklore.locator('section')).toHaveCount(2);
  await expect(folklore).toContainText('Participan Andrea Gauna y Lautaro Rotela.');
  await expect(folklore).toContainText('Participan Brian Albornoz y Luz Pedrosa.');

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
  await expect(page.getByRole('heading', { name: 'Programación 2' })).toBeVisible();
  await expect(page.getByText('Todos los jueves · Del 12/11/2026 al 30/11/2026 · 16:00 a 18:00 h · Parque de Lomas')).toBeVisible();

  await page.getByRole('combobox', { name: 'Cargar actividad' }).selectOption('preview-v2-huerta');
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
  const folkloreCard = page.getByTestId('console-preview-card');
  await expect(folkloreCard).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCard).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCard).not.toContainText('+ 1 programación');
  await expect(folkloreCard.getByTestId('agenda-card-schedules').locator(':scope > div')).toHaveCount(2);
  await page.getByTestId('console-preview-card').getByRole('button', { name: 'Ver más' }).click();
  const dialog = page.getByTestId('console-detail-preview');
  await expect(dialog).toContainText('Participan Andrea Gauna y Lautaro Rotela.');
  await expect(dialog).toContainText('Participan Brian Albornoz y Luz Pedrosa.');
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
  await expect(plaza).toContainText('Se suspende por lluvia');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Plaza Grigera');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).not.toContainText('Polideportivo Evita');

  await page.goto(path + 'polideportivo-evita');
  await expect(page.getByRole('heading', { name: 'Yoga en Comunidad', exact: true, level: 1 })).toBeVisible();
  const polideportivo = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(polideportivo.locator('section')).toHaveCount(1);
  await expect(polideportivo).toContainText('Todos los jueves');
  await expect(polideportivo).not.toContainText('suspende por lluvia');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).toContainText('Polideportivo Evita');
  await expect(page.getByRole('region', { name: 'Mapa de ubicación' })).not.toContainText('Plaza Grigera');

  await page.goto(list + '/preview-v2-yoga-dos-sedes');
  await expect(page).toHaveURL(/preview-v2-yoga-dos-sedes--sede-plaza-grigera/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('La consola agrupa fechas por sede y permite la vista previa de cada ubicación', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Yoga en Comunidad');
  await expect(page.getByRole('heading', { name: 'Programación 2' })).toBeVisible();
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
  await page.getByRole('combobox', { name: 'Cargar actividad' }).selectOption('preview-v2-folklore');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await expect(page.getByTestId('console-preview-card')).toHaveCount(1);
  const folkloreCard = page.getByTestId('console-preview-card');
  await expect(folkloreCard).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCard).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCard).not.toContainText('+ 1 programación');
  await expect(folkloreCard.getByTestId('agenda-card-schedules').locator(':scope > div')).toHaveCount(2);
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
  await expect(schedules).toContainText('Del 07/11/2026 al 28/11/2026');
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

  await search.fill('Folklore en Comunidad');
  const folkloreCard = page.getByTestId('agenda-card');
  await expect(folkloreCard).toHaveCount(1);
  await expect(folkloreCard.getByTestId('agenda-card-schedules').locator(':scope > div')).toHaveCount(2);
  await expect(folkloreCard).toContainText('Sábado 14 de noviembre');
  await expect(folkloreCard).toContainText('Sábado 21 de noviembre');
  await expect(folkloreCard).not.toContainText('programación');

  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});
