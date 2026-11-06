import { expect, test, type Locator } from '@playwright/test';

const route = '/agenda-de-la-comunidad/actividades';
test.use({ reducedMotion: 'no-preference' });


// Para medir gestos, el tirador debe estar quieto: la hoja entra con una animación de 230 ms.
async function awaitSheetEntrance(sheet: Locator): Promise<void> {
  await sheet.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => undefined)));
  });
}

test('Apertura y cierre de Fecha conservan un ritmo de movimiento consistente', async ({ page }, info) => {
  await page.goto(route);
  const mobile = (info.project.use.viewport?.width ?? 0) <= 680;
  const trigger = page.getByTestId('agenda-dropdown-fecha');
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(panel).toBeVisible();
  const motion = await panel.evaluate(node => {
    const styles = getComputedStyle(node);
    return { name: styles.animationName, duration: styles.animationDuration, position: styles.position };
  });
  expect(motion.name).toContain(mobile ? 'agenda-sheet-in' : 'agenda-popover-in');
  expect(motion.duration).toBe(mobile ? '0.23s' : '0.15s');
  expect(motion.position).toBe(mobile ? 'fixed' : 'absolute');
  const today = panel.getByRole('checkbox', { name: 'Hoy' });
  await today.check();
  await page.mouse.move(0, 0); // Evitar el estado hover oscuro del elemento seleccionado.
  await expect(panel.locator('label:has(input[aria-label="Hoy"])')).toHaveCSS('background-color', 'rgb(0, 110, 255)');
  await panel.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: /Hoy/ }).first()).toBeVisible();
});

test('Ordenar abre, permite selección y cierra con Escape', async ({ page }, info) => {
  await page.goto(route);
  await page.getByRole('button', { name: 'Ordenar', exact: true }).click();
  const sorter = page.getByRole('group', { name: 'Opciones para ordenar' });
  await expect(sorter).toBeVisible();
  await page.getByRole('button', { name: 'Alfabético A-Z' }).click();
  await expect(sorter).toHaveCount(0);
  await page.getByRole('button', { name: 'Ordenar', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(sorter).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  if ((info.project.use.viewport?.width ?? 0) <= 680) {
    await expect(page.locator('.agenda-mobile-backdrop')).toHaveCount(0);
  }
});

test('Más filtros abre/cierra y aplica selección sin perder el estado', async ({ page }, info) => {
  await page.goto(route);
  const trigger = page.getByRole('button', { name: /Más Filtros/ });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await expect(sheet).toBeVisible();
  const theatre = sheet.getByRole('checkbox', { name: 'Teatro', exact: true });
  await theatre.check();
  await expect(theatre).toBeChecked();
  await sheet.getByRole('button', { name: 'Ver resultados' }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.locator('[data-agenda-chip="selected"]')).toContainText(['Teatro']);
  if ((info.project.use.viewport?.width ?? 0) <= 680) {
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar panel de opciones' }).click({ position: { x: 10, y: 10 } });
    await expect(sheet).toHaveCount(0);
  }
});

test('Panel móvil acompaña el arrastre, rebota y se cierra con deslizamiento largo', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) > 680) return;
  await page.goto(route);
  await page.getByRole('button', { name: 'Fecha', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(sheet).toBeVisible();
  await awaitSheetEntrance(sheet);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  const handle = sheet.getByRole('button', { name: 'Deslizar o tocar para cerrar panel' });
  const rect = await handle.boundingBox();
  expect(rect).not.toBeNull();
  const x = rect!.x + rect!.width / 2;
  const y = rect!.y + rect!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 40, { steps: 6 });
  await expect(sheet).toHaveClass(/agenda-sheet-dragging/);
  await page.mouse.up();
  await expect(sheet).toBeVisible();
  await expect.poll(async () => sheet.evaluate(el => {
    const transform = getComputedStyle(el).transform;
    return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
  })).toBe(true);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 180, { steps: 8 });
  await page.mouse.up();
  await expect(sheet).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('Abrir una ficha desde el listado respeta scroll y diseño responsive', async ({ page }) => {
  await page.goto(route);
  const card = page.getByTestId('agenda-card').first();
  await card.scrollIntoViewIfNeeded();
  await card.getByRole('link', { name: /Ver más sobre/ }).click();
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toBeInViewport();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.getByTestId('agenda-detail-image')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copiar enlace' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('ficha V2: información y fechas juntas en mobile, columnas y mapa en desktop', async ({ page }, info) => {
  for (const path of ['/agenda-de-la-comunidad/actividades/actividad-1',
    '/agenda-de-la-comunidad/actividades/tita-y-rhodesia']) {
    await page.goto(path);
    const desc = page.getByRole('region', { name: 'Descripción de la actividad' });
    const image = page.getByTestId('agenda-detail-image');
    await expect(desc).toBeVisible();
    await expect(image).toBeVisible();
    const informationPositions = await page.evaluate(() => ({
      desc: document.querySelector('[aria-label="Descripción de la actividad"]')!.getBoundingClientRect().top,
      image: document.querySelector('[data-testid="agenda-detail-image"]')!.getBoundingClientRect().top,
      imageBottom: document.querySelector('[data-testid="agenda-detail-image"]')!.getBoundingClientRect().bottom,
    }));
    expect(informationPositions.desc).toBeLessThan(informationPositions.image);
    const sidebar = page.getByRole('complementary', { name: 'Cuándo y dónde' });
    const map = page.getByRole('region', { name: 'Mapa de ubicación' });
    await expect(sidebar).toBeVisible();
    await expect(map).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'Cuándo y dónde' })).toBeVisible();
    await expect(sidebar.locator('section')).toHaveCount(1);
    if (path.endsWith('/tita-y-rhodesia')) {
      await expect(sidebar.locator('[data-agenda-chip="activity"]')).not.toHaveCount(0);
    }
    const positions = await page.evaluate(() => ({
      sidebar: document.querySelector('[aria-label="Cuándo y dónde"]')!.getBoundingClientRect().toJSON(),
      map: document.querySelector('[aria-label="Mapa de ubicación"]')!.getBoundingClientRect().toJSON(),
    }));
    if ((info.project.use.viewport?.width ?? 0) >= 1024) {
      expect(positions.map.top).toBeGreaterThan(informationPositions.imageBottom);
      const imageX = await page.getByTestId('agenda-detail-image')
        .evaluate(element => element.getBoundingClientRect().x);
      expect(positions.sidebar.x).toBeGreaterThan(imageX);
    } else {
      expect(positions.map.top).toBeGreaterThanOrEqual(positions.sidebar.bottom);
      await expect(desc).toBeVisible();
      await expect(image).toBeVisible();
    }
    await expect(sidebar.getByRole('link', { name: /Google Maps/ })).toHaveCount(0);
    await expect(map.getByRole('link', { name: 'Ver en Google Maps' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Ruta de navegación' }))
      .toHaveCSS('color', 'rgb(35, 105, 153)');
  }
});

test('mobile: arrastre hacia arriba estira el drawer y recupera su altura como en Deportes', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) > 680) return;
  await page.goto(route);
  await page.getByTestId('agenda-dropdown-fecha').click();
  const sheet = page.getByRole('dialog', { name: 'Opciones de Fecha' });
  await expect(sheet).toBeVisible();
  await awaitSheetEntrance(sheet);
  const handle = sheet.getByRole('button', { name: 'Deslizar o tocar para cerrar panel' });
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  const base = await sheet.boundingBox();
  expect(base).not.toBeNull();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 90, { steps: 8 });
  await expect(sheet).toHaveClass(/agenda-sheet-stretching/);
  const stretch = await sheet.boundingBox();
  expect(stretch).not.toBeNull();
  expect(stretch!.height).toBeGreaterThan(base!.height + 10);
  expect(stretch!.height).toBeLessThan(base!.height + 35);
  expect(Math.abs((stretch!.y + stretch!.height) - (base!.y + base!.height))).toBeLessThan(2);
  const backdrop = page.getByRole('button', { name: 'Cerrar panel de opciones' });
  await expect(backdrop).toHaveCSS('opacity', '1');
  await page.mouse.up();
  await expect(sheet).toBeVisible();
  await expect.poll(() => sheet.evaluate(el =>
    el.classList.contains('agenda-sheet-stretching')
      || el.classList.contains('agenda-sheet-stretch-rebounding'))).toBe(false);
  const settled = await sheet.boundingBox();
  expect(Math.abs(settled!.height - base!.height)).toBeLessThan(2);
  // La X fue eliminada a pedido de diseño: cerrar desde el backdrop.
  await backdrop.click({ position: { x: 10, y: 10 } });
  await expect(sheet).toHaveCount(0);
});

test('ficha V2: Cuándo y dónde sticky, mapa compacto y tipografía institucional', async ({ page }, info) => {
  await page.goto('/agenda-de-la-comunidad/actividades/actividad-1');
  const summary = page.getByRole('complementary', { name: 'Cuándo y dónde' });
  const map = page.getByRole('region', { name: 'Mapa de ubicación' });
  const iframe = map.locator('iframe');
  await expect(summary).toBeVisible();
  await expect(iframe).toBeVisible();
  const mobile = (info.project.use.viewport?.width ?? 0) < 1024;
  await expect(summary.locator('..')).toHaveCSS('position', mobile ? 'static' : 'sticky');
  await expect(summary).toHaveCSS('font-family', /^Geometria(?:,|$)/);
  const height = await iframe.evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(mobile ? 201 : 221);
  await expect(summary.getByRole('heading', { name: 'Cuándo y dónde' })).toHaveCSS('font-size', '24px');
  await expect(summary.locator('section > div').first()).toHaveCSS('font-size', '18px');
  if (!mobile) {
    const base = await summary.boundingBox();
    await page.evaluate(() => window.scrollBy(0, 180));
    const moved = await summary.boundingBox();
    expect(base).not.toBeNull();
    expect(moved).not.toBeNull();
    expect(moved!.y).toBeGreaterThanOrEqual(23);
    expect(moved!.y).toBeLessThanOrEqual(base!.y + 1);
  }
});

