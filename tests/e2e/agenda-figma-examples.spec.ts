import { expect, test } from '@playwright/test';

const list = '/agenda-de-la-comunidad/actividades';
const gallery = '/agenda-de-la-comunidad/ejemplos';
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

test('Agenda V2: los siete casos Figma están juntos y separados de resultados oficiales', async ({ page }) => {
  await page.goto(list);
  await expect(page.getByRole('link', { name: 'Ver los 7 ejemplos' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver los 7 ejemplos' }).click();
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/ejemplos\/?$/);
  await expect(page.getByRole('heading', { name: 'Ejemplos de actividades' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('ejemplos ficticios');
  const grid = page.getByTestId('agenda-examples-grid');
  await expect(grid.getByTestId('agenda-card')).toHaveCount(7);
  await expect(grid.getByRole('link', { name: /Probar este caso en la consola/ })).toHaveCount(7);
  for (const [, title] of items) {
    await expect(grid.getByRole('link', { name: 'Ver más sobre ' + title })).toBeVisible();
  }
  await expect(grid).toContainText('Todos los sábados');
  await expect(grid).toContainText('Del 07/11/2026 al 28/11/2026');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Agenda V2: los siete detalles respetan los casos de programación de Figma', async ({ page }) => {
  for (const [id, title] of items) {
    await page.goto(list + '/' + id);
    await expect(page.getByRole('heading', { name: title, exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole('note')).toContainText('ficticios');
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
  await page.goto(gallery);
  await page.getByRole('link', { name: 'Probar este caso en la consola' }).nth(3).click();
  await expect(page).toHaveURL(/caso=preview-v2-futbol/);
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Fútbol en Comunidad');
  await expect(page.getByRole('heading', { name: 'Programación 2' })).toBeVisible();
  await expect(page.getByText('Todos los jueves · Del 12/11/2026 al 30/11/2026 · 16:00 a 18:00 h · Parque de Lomas')).toBeVisible();

  await page.getByRole('combobox', { name: 'Cargar ejemplo de Figma' }).selectOption('preview-v2-huerta');
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
