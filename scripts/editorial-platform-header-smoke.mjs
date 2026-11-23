import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const editors = [
 { slug: 'cronica-dev', brand: 'Crónica', mobileWidth: 104 },
 { slug: 'diarioshow-dev', brand: 'Diario Show', mobileWidth: 136 },
 { slug: 'bae-dev', brand: 'BAE Negocios', mobileWidth: 148 },
];

try {
 for (const width of [390, 432, 768, 1415]) {
  await page.setViewportSize({ width, height: 900 });
  for (const { slug, brand, mobileWidth } of editors) {
   await page.goto('http://127.0.0.1:8765/' + slug + '/?onboarding=off');
   const header = page.locator('header .header-inner');
   const logo = header.getByRole('img', { name: brand, exact: true });
   assert.equal(await header.locator('img').count(), 1);
   assert.equal((await header.textContent()).trim(), '');
   assert.equal(await header.getByRole('link').getAttribute('href'), '../dev/');
   await logo.evaluate(image => image.decode());
   const box = await logo.boundingBox();
   assert.ok(box && box.x >= 0 && box.x + box.width <= width, slug + ': logo dentro del viewport');
   if (width <= 700) {
    assert.equal(box.width, mobileWidth);
    const drawer = page.locator('.editorial-mobile-drawer');
    await drawer.waitFor();
    assert.equal(await drawer.locator('.preview-actions button:visible').count(), 3);
    assert.equal(await drawer.locator('.editorial-drawer-content').isVisible(), false);
   }
   console.log('PASS', slug, width);
  }
 }
} finally {
 await browser.close();
}
