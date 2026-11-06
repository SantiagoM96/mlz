import { test, expect } from '@playwright/test';

const base = '/agenda-de-la-comunidad/actividades';
const consoleRoute = '/agenda-de-la-comunidad/consola-preview';

test('Ficha Agenda: mobile tiene tabs Información y Cuándo y dónde; desktop conserva dos columnas', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  const width = info.project.use.viewport?.width ?? 0;
  const tabs = page.getByRole('tablist', { name: 'Secciones de la actividad' });
  const infoPanel = page.getByTestId('agenda-detail-information');
  const sidebar = page.getByTestId('agenda-detail-sidebar');
  const map = page.getByRole('region', { name: 'Mapa de ubicación' });
  if (width >= 1024) {
    await expect(tabs).toBeHidden();
    await expect(infoPanel).toBeVisible();
    await expect(sidebar).toBeVisible();
    await expect(map).toBeVisible();
    await expect(page.getByTestId('agenda-detail-sticky')).toHaveCSS('top', '24px');
    return;
  }

  await expect(tabs).toBeVisible();
  const infoTab = tabs.getByRole('tab', { name: 'Información' });
  const whenTab = tabs.getByRole('tab', { name: 'Cuándo y dónde' });
  await expect(infoTab).toHaveAttribute('aria-selected', 'true');
  await expect(whenTab).toHaveAttribute('aria-selected', 'false');
  await expect(infoTab).toHaveCSS('font-weight', '700');
  await expect(whenTab).toHaveCSS('font-weight', '400');
  await expect(infoTab).toHaveCSS('border-bottom-width', '3px');
  await expect(infoPanel).toBeVisible();
  await expect(infoPanel).toContainText('Clases de yoga');
  await expect(page.getByTestId('agenda-detail-image')).toBeVisible();
  await expect(sidebar).toBeHidden();
  await expect(map).toBeHidden();
  await whenTab.click();
  await expect(whenTab).toHaveAttribute('aria-selected', 'true');
  await expect(infoPanel).toBeHidden();
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toContainText('Todos los martes');
  const rain = sidebar.locator('[data-agenda-chip-kind="rain"]');
  await expect(rain).toHaveCount(1);
  await expect(sidebar.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  await expect(map).toBeVisible();
  await expect(map).toContainText('Plaza Grigera');
  await expect(page.getByTestId('agenda-detail-sticky')).toHaveCSS('position', 'static');
  await expect(page.getByRole('heading', { name: 'Yoga en Comunidad', level: 1 })).toBeVisible();
  await infoTab.click();
  await expect(infoPanel).toBeVisible();
  await expect(sidebar).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('Consola Agenda: las tabs móviles también se aplican a la ficha de vista previa', async ({ page }, info) => {
  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const dialog = page.getByTestId('console-detail-preview');
  const tabs = dialog.getByRole('tablist', { name: 'Secciones de la actividad' });
  const informationPanel = dialog.getByTestId('agenda-console-detail-information');
  const when = dialog.getByTestId('agenda-console-detail-sidebar');
  const map = dialog.getByRole('region', { name: 'Mapa de ubicación' });
  if ((info.project.use.viewport?.width ?? 0) >= 1024) {
    await expect(tabs).toBeHidden();
    await expect(informationPanel).toBeVisible();
    await expect(when).toBeVisible();
    await expect(map).toBeVisible();
    return;
  }
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole('tab', { name: 'Información' })).toHaveAttribute('aria-selected', 'true');
  await expect(informationPanel).toBeVisible();
  await expect(when).toBeHidden();
  await tabs.getByRole('tab', { name: 'Cuándo y dónde' }).click();
  await expect(informationPanel).toBeHidden();
  await expect(when).toBeVisible();
  await expect(map).toBeVisible();
  await expect(when).toContainText('Todos los martes');
  await expect(when.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Cerrar vista previa del detalle' }).click();
  await expect(dialog).toHaveCount(0);
});


test('Agenda V2: lluvia arriba y afuera de la caja en public y consola, incluidas mobile tabs', async ({ page }, info) => {
  await page.goto(base + '/preview-v2-yoga-dos-sedes--sede-plaza-grigera');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('tab', { name: 'Cuándo y dónde' }).click();
  }
  const programming = page.getByTestId('agenda-detail-programming').first();
  const rain = programming.getByTestId('agenda-schedule-rain');
  const card = programming.locator(':scope > section');
  await expect(rain).toBeVisible();
  await expect(card).toBeVisible();
  await expect(programming.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  const geometry = await programming.evaluate(element => {
    const badge = element.querySelector('[data-testid="agenda-schedule-rain"]')!;
    const box = element.querySelector(':scope > section')!;
    const outer = badge.getBoundingClientRect();
    const inner = box.getBoundingClientRect();
    return { outside: !box.contains(badge), distance: Math.round(inner.top - outer.bottom), alignment: Math.abs(outer.left - inner.left) };
  });
  expect(geometry).toEqual({ outside: true, distance: 16, alignment: 0 });

  await page.goto(consoleRoute + '?caso=preview-v2-yoga-dos-sedes');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  const modal = page.getByTestId('console-detail-preview');
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await modal.getByRole('tab', { name: 'Cuándo y dónde' }).click();
  }
  const previewProgramming = modal.getByTestId('agenda-detail-programming').first();
  const previewRain = previewProgramming.getByTestId('agenda-schedule-rain');
  await expect(previewRain).toBeVisible();
  await expect(previewProgramming.locator('section [data-agenda-chip-kind="rain"]')).toHaveCount(0);
  const previewGap = await previewProgramming.evaluate(element => {
    const badge = element.querySelector('[data-testid="agenda-schedule-rain"]')!;
    const box = element.querySelector(':scope > section')!;
    return Math.round(box.getBoundingClientRect().top - badge.getBoundingClientRect().bottom);
  });
  expect(previewGap).toBe(16);
});
