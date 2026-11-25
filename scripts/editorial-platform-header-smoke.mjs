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
   const mobile = width <= 700;
   const header = page.locator(mobile ? 'header .header-inner' : '.editorial-sidebar-top');
   await header.waitFor();
   const logo = header.getByRole('img', { name: brand, exact: true });
   assert.equal(await header.locator('img').count(), 1);
   const badge = page.locator(mobile ? 'header .editorial-build-badge' : '.editorial-sidebar-footer .editorial-build-badge');
   const time = badge.locator('time');
   assert.equal(await badge.locator('strong').textContent(), revision.slice(-3).toUpperCase());
   assert.equal(await time.textContent(), formatTime.format(new Date(await time.getAttribute('datetime'))));
   assert.equal(await header.getByRole('link').getAttribute('href'), '../dev/');
   await logo.evaluate(image => image.decode());
   const box = await logo.boundingBox();
   assert.ok(box && box.x >= 0 && box.x + box.width <= width, slug + ': logo dentro del viewport');
   if (mobile) {
    const menu = await header.locator('.editorial-profile-trigger').boundingBox();
    const badgeBox = await badge.boundingBox();
    assert.ok(menu && badgeBox && badgeBox.x + badgeBox.width <= menu.x);
    assert.equal(box.width, mobileWidth);
    const drawer = page.locator('.editorial-mobile-drawer');
    await drawer.waitFor();
    assert.equal(await drawer.locator('.preview-actions button:visible').count(), 3);
    assert.equal(await drawer.locator('.editorial-drawer-content').isVisible(), false);
   } else {
    const preview = page.locator('section.preview');
    const pages = page.locator('aside.editor-panel .editorial-sidebar-pages');
    await pages.waitFor();
    await page.waitForFunction(() => {
      const rect = document.getElementById('photoStage').getBoundingClientRect();
      return rect.height > 0 && rect.top >= 0 && rect.bottom <= innerHeight;
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), 900);
    await badge.waitFor();
    assert.ok((await preview.boundingBox()).x >= (await header.boundingBox()).width);
    await page.getByRole('button', { name: 'Contraer barra lateral' }).click();
    await page.getByRole('navigation', { name: 'Módulos del editor' })
      .getByRole('button', { name: 'Diapositivas' }).click();
    await page.locator('.editorial-sidebar-pages:popover-open').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.editorial-sidebar-pages:popover-open').count(), 0);
    await page.getByRole('button', { name: 'Expandir barra lateral' }).click();
    await pages.waitFor();
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
