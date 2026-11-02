import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

test('capturas visuales auditables en Chromium', async ({ page }, testInfo) => {
  await page.goto('/jovenes-en-comunidad');
  await expect(page.getByRole('heading', { name: 'Jóvenes en Comunidad', level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });

  const folder = join(testInfo.outputDir, 'visual', testInfo.project.name);
  mkdirSync(folder, { recursive: true });

  const viewport = join(folder, 'jovenes-viewport.png');
  const complete = join(folder, 'jovenes-full.png');
  const header = join(folder, 'header.png');
  const breadcrumbs = join(folder, 'breadcrumbs.png');
  const indexCard = join(folder, 'index-card.png');
  const footer = join(folder, 'footer.png');

  await page.screenshot({ path: viewport, animations: 'disabled' });
  await page.screenshot({ path: complete, animations: 'disabled', fullPage: true });
  await page.locator('header').screenshot({ path: header });
  await page.getByRole('navigation', { name: 'Ruta de navegación' }).screenshot({ path: breadcrumbs });
  await page.getByRole('navigation', { name: 'Índice de iniciativas' }).locator('..').screenshot({ path: indexCard });
  await page.locator('footer').screenshot({ path: footer });

  for (const [name, path] of Object.entries({ viewport, complete, header, breadcrumbs, indexCard, footer })) {
    await testInfo.attach(name, { path, contentType: 'image/png' });
  }

  // Inspeccionar en una pestaña independiente: las capturas del footer alteran el scroll.
  const reviewPage = await page.context().newPage();
  await reviewPage.goto('/jovenes-en-comunidad');
  await expect(reviewPage.getByRole('heading', { name: 'Jóvenes en Comunidad', level: 1 })).toBeVisible();
  await reviewPage.evaluate(() => document.fonts.ready);
  const metrics = await reviewPage.evaluate(() => {
    const bounds = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null;
    };

    return {
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      colors: {
        header: getComputedStyle(document.querySelector('header')!).backgroundColor,
        text: getComputedStyle(document.body).color,
        heading: getComputedStyle(document.querySelector('h1')!).color,
        font: getComputedStyle(document.body).fontFamily,
      },
      geometry: {
        header: bounds('header'),
        headerLogo: bounds('header img'),
        municipalityCommunityLogo: bounds('header img[alt="Comunidad Lomas"]'),
        hero: bounds('main picture img'),
        introduction: bounds('section[aria-label="Presentación de Jóvenes en Comunidad"]'),
        indexAndContact: bounds('aside'),
        initiativesHeading: bounds('[data-testid="initiatives-heading"]'),
      },
    };
  });

  await testInfo.attach('mediciones.json', {
    body: Buffer.from(JSON.stringify(metrics, null, 2)),
    contentType: 'application/json',
  });
  console.log('MLZ_VISUAL_METRICS_' + testInfo.project.name + ':' + JSON.stringify(metrics));

  // Previsualización liviana en los logs para revisión técnica remota.
  // Las capturas originales sin compresión se guardan como artefactos.
  if (['desktop-1415', 'mobile-432'].includes(testInfo.project.name) && process.env.CI) {
    const preview = await reviewPage.screenshot({
      type: 'jpeg', quality: 23, animations: 'disabled', fullPage: false,
    });
    console.log('MLZ_VISUAL_PREVIEW_' + testInfo.project.name + ':' + preview.toString('base64'));
  }
  // Fragmentos reducidos para inspección directa sin descargar los artefactos.
  if (['desktop-1415', 'mobile-432'].includes(testInfo.project.name) && process.env.CI) {
    for (const [name, locator] of [
      ['breadcrumbs', reviewPage.getByRole('navigation', { name: 'Ruta de navegación' })],
      ['index', reviewPage.getByRole('navigation', { name: 'Índice de iniciativas' }).locator('..')],
    ] as const) {
      const bytes = await locator.screenshot({ type: 'jpeg', quality: 65, animations: 'disabled' });
      console.log('MLZ_COMPONENT_PREVIEW_' + testInfo.project.name + '_' + name + ':' + bytes.toString('base64'));
    }
  }
  await reviewPage.close();
});
