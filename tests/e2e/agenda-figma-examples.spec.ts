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

test('Agenda V2: los siete ejemplos se muestran en el listado normal, sin página extra', async ({ page }) => {
  await page.goto(list);
  const grid = page.getByTestId('agenda-grid');
  await expect(grid).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver los 7 ejemplos' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ejemplos de actividades' })).toHaveCount(0);
  await expect(grid.getByText('Ejemplo de diseño · No es una convocatoria')).toHaveCount(0);

  for (const [index, [, title]] of items.entries()) {
    const card = grid.getByTestId('agenda-card').nth(index);
    await expect(card).toContainText(title);
    await expect(card).not.toContainText('Ejemplo de diseño');
    await expect(card.getByRole('link', { name: 'Ver más sobre ' + title })).toBeVisible();
  }

  await expect(grid).toContainText('Todos los sábados');
  await expect(grid).toContainText('Del 07/11/2026 al 28/11/2026');

  await page.getByRole('textbox', { name: 'Buscar actividades' }).fill('Jornada ambiental itinerante');
  await expect(page.getByTestId('agenda-grid')).toContainText('Jornada ambiental itinerante');
  await expect(page.getByTestId('agenda-grid').getByText('Ejemplo de diseño · No es una convocatoria')).toHaveCount(0);
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

  await page.goto(list + '/preview-v2-futbol');
  const futbol = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(futbol.locator('section')).toHaveCount(2);
  await expect(futbol).toContainText('Todos los martes');
  await expect(futbol).toContainText('Todos los jueves');
  await expect(futbol.getByRole('link', { name: /Ver en Google Maps/ })).toHaveCount(2);

  await page.goto(list + '/preview-v2-folklore');
  const folklore = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(folklore.locator('section')).toHaveCount(2);
  await expect(folklore).toContainText('Participan Andrea Gauna y Lautaro Rotela.');
  await expect(folklore).toContainText('Participan Brian Albornoz y Luz Pedrosa.');

  await page.goto(list + '/preview-v2-huerta');
  await expect(page.getByRole('heading', { name: 'Inscripción', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inscribirse' })).toHaveCount(0);

  await page.goto(list + '/preview-v2-itinerante');
  const itinerante = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  await expect(itinerante.locator('section')).toHaveCount(2);
  await expect(itinerante).toContainText('Plaza Grigera');
  await expect(itinerante).toContainText('Parque de Lomas');
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
  await expect(page.getByTestId('console-preview-card')).toContainText('+ 1 programación');
  await page.getByTestId('console-preview-card').getByRole('button', { name: 'Ver más' }).click();
  const dialog = page.getByTestId('console-detail-preview');
  await expect(dialog).toContainText('Participan Andrea Gauna y Lautaro Rotela.');
  await expect(dialog).toContainText('Participan Brian Albornoz y Luz Pedrosa.');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('Yoga en Comunidad: una sola ficha, dos sedes con condiciones de lluvia independientes', async ({ page }) => {
  await page.goto(list + '/preview-v2-yoga-dos-sedes/');
  await expect(page.getByRole('heading', { name: 'Yoga en Comunidad', exact: true, level: 1 })).toHaveCount(1);
  const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  const schedules = summary.locator('section');
  await expect(schedules).toHaveCount(2);

  const outdoors = schedules.nth(0);
  await expect(outdoors).toContainText('Todos los martes');
  await expect(outdoors).toContainText('Plaza Grigera');
  await expect(outdoors).toContainText('Se suspende por lluvia');
  await expect(outdoors).not.toContainText('No se suspende por lluvia');

  const indoors = schedules.nth(1);
  await expect(indoors).toContainText('Todos los jueves');
  await expect(indoors).toContainText('Polideportivo Evita');
  await expect(indoors).not.toContainText('suspende por lluvia');

  await expect(summary.getByRole('link', { name: /Ver en Google Maps/ })).toHaveCount(2);
  await expect(page.getByRole('note')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
