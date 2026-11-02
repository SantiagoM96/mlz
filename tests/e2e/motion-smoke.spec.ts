import { expect, test } from '@playwright/test';

const route = '/agenda-de-la-comunidad/actividades';
test.use({ reducedMotion: 'no-preference' });

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
  expect(motion.duration).toBe(mobile ? '0.3s' : '0.22s');
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
  await expect(page.getByRole('heading', { name: 'Información general' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copiar enlace' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
