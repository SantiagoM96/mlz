import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const formatTime = new Intl.DateTimeFormat('es-AR', {
 timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
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
   const badge = header.locator('.editorial-build-badge');
   const time = badge.locator('time');
   assert.equal(await badge.locator('strong').textContent(), revision.slice(-3).toUpperCase());
   assert.equal(await time.textContent(), formatTime.format(new Date(await time.getAttribute('datetime'))));
   const headerBox = await header.boundingBox();
   const badgeBox = await badge.boundingBox();
   assert.ok(headerBox && badgeBox && Math.abs(badgeBox.x + badgeBox.width - headerBox.x - headerBox.width) <= 1,
    slug + ': chip alineado a la derecha');
   assert.equal(await header.getByRole('link').getAttribute('href'), '../dev/');
   await logo.evaluate(image => image.decode());
   const box = await logo.boundingBox();
   assert.ok(box && box.x >= 0 && box.x + box.width <= width, slug + ': logo dentro del viewport');
   assert.ok(badgeBox.x >= box.x + box.width && badgeBox.y < box.y + box.height,
    slug + ': chip al lado del logo');
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
 await page.goto('http://127.0.0.1:8765/dev/');
 assert.equal(await page.locator('header .env').textContent(), 'Entorno de desarrollo');
 assert.equal(await page.locator('.editorial-build-badge').count(), 0);
} finally {
 await browser.close();
}
