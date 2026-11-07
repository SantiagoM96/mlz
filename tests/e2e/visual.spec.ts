import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

test('capturas del layout compartido en Chromium', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Municipio de Lomas de Zamora', level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });

  const folder = join(testInfo.outputDir, 'visual', testInfo.project.name);
  mkdirSync(folder, { recursive: true });

  for (const [name, locator] of [
    ['header', page.locator('header')],
    ['footer', page.locator('footer')],
  ] as const) {
    const path = join(folder, name + '.png');
    await locator.screenshot({ path, animations: 'disabled' });
    await testInfo.attach(name, { path, contentType: 'image/png' });
  }

  const path = join(folder, 'home.png');
  await page.screenshot({ path, animations: 'disabled', fullPage: true });
  await testInfo.attach('home', { path, contentType: 'image/png' });

  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  await testInfo.attach('mediciones.json', {
    body: Buffer.from(JSON.stringify(dimensions, null, 2)),
    contentType: 'application/json',
  });
});
