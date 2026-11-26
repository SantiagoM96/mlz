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

async function dragHandle(handle, x, y) {
 await handle.scrollIntoViewIfNeeded();
 const rect = await handle.boundingBox();
 await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
 await page.mouse.down();
 await page.mouse.move(x, y, { steps: 8 });
 await page.mouse.up();
}

try {
 for (const width of [390, 432, 768, 1415]) {
  await page.setViewportSize({ width, height: 900 });
  for (const { slug, brand, mobileWidth } of editors) {
   await page.goto('http://127.0.0.1:8765/' + slug + '/?onboarding=off');
   const mobile = width <= 700;
   const header = page.locator(mobile ? 'header .header-inner' : '.editorial-sidebar-top');
   await header.waitFor();
   const logo = header.getByRole('img', { name: brand, exact: true });
   assert.equal(await header.locator('img:not(.editorial-compact-logo)').count(), 1);
   const badge = page.locator(mobile ? 'header .editorial-build-badge' : '.editorial-workspace-version .editorial-build-badge');
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
    assert.deepEqual(await page.locator('aside.editor-panel').evaluate(panel => {
      const style = getComputedStyle(panel);
      return [style.padding, style.overflowX, style.scrollbarWidth];
    }), ['16px', 'hidden', 'none']);
    await header.locator('.editorial-draft-status').waitFor();
    const addPage = pages.locator('#addPage, .editor-slide-add-fixed');
    await addPage.waitFor();
    const deletePage = pages.locator('#removePage, .editor-slide-delete');
    assert.ok((await addPage.boundingBox()).x < (await deletePage.boundingBox()).x);
    const thumbnails = pages.locator(".carousel-page-thumb, .editor-slide-thumb");
    const originalCount = await thumbnails.count();
    await addPage.click();
    assert.equal(await thumbnails.count(), originalCount + 1);
    await deletePage.click();
    assert.equal(await thumbnails.count(), originalCount);
    const session = page.locator('.editorial-sidebar-footer .editorial-profile-trigger');
    const menu = page.locator('.editorial-sidebar-footer .editorial-session-summary');
    await menu.waitFor();
    const footer = page.locator('.editorial-sidebar-footer');
    const footerBox = await footer.boundingBox();
    assert.equal((await menu.boundingBox()).width, footerBox.width - 24);
    assert.equal(await session.isVisible(), false);
    await footer.getByRole('img', { name: 'Dispositivo' }).waitFor();
    const reset = menu.getByRole('button', { name: 'Empezar de cero' });
    const rename = menu.locator('[data-rename]');
    const device = await menu.locator('[data-session-device]').boundingBox();
    const activity = await menu.locator('time[data-session-activity]').boundingBox();
    const deviceIcon = await footer.getByRole('img', { name: 'Dispositivo' }).boundingBox();
    assert.ok(device.x - deviceIcon.x - deviceIcon.width >= 8);
    for (const action of [rename, reset]) {
      assert.equal(await action.locator('.material-symbols-outlined').evaluate(icon => getComputedStyle(icon).fontSize), '16px');
    }
    assert.ok((await reset.boundingBox()).x > (await rename.boundingBox()).x);
    assert.ok(activity.x > device.x && Math.abs(activity.y - device.y) <= 1);
    assert.ok(await menu.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
    }), slug + ': menú de sesión sobre los módulos');
    await rename.click();
    const renameDialog = page.locator('[data-rename-dialog]');
    await renameDialog.waitFor();
    await page.keyboard.press('Escape');
    await renameDialog.waitFor({ state: 'hidden' });
    await reset.click();
    const resetDialog = page.locator('[data-reset-dialog]');
    await resetDialog.waitFor();
    await page.keyboard.press('Escape');
    await resetDialog.waitFor({ state: 'hidden' });
    const grip = page.getByRole('separator', { name: 'Ancho de la barra lateral' });
    const minWidth = Number(await grip.getAttribute('aria-valuemin'));
    const maxWidth = Number(await grip.getAttribute('aria-valuemax'));
    await grip.press('Home');
    assert.equal((await header.boundingBox()).width, minWidth);
    const handle = await grip.boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + 200);
    await page.mouse.down();
    assert.deepEqual(await grip.evaluate(handle => [
      getComputedStyle(handle.closest('main'), '::before').backgroundColor,
      getComputedStyle(handle, '::after').content,
      getComputedStyle(handle.closest('main'), '::before').width,
    ]), ['rgb(243, 245, 248)', 'none', '1px']);
    await page.mouse.move(handle.x + handle.width / 2 + 220, handle.y + 200);
    await page.mouse.up();
    assert.equal((await header.boundingBox()).width, maxWidth);
    await grip.press('Home');
    const surfaces = await page.evaluate(() => ['.editorial-sidebar-top', 'aside.editor-panel', '.editorial-sidebar-footer']
      .map(selector => {
        const style = getComputedStyle(document.querySelector(selector));
        return [style.backgroundColor, style.borderTopWidth, style.borderBottomWidth];
      }));
    assert.deepEqual(surfaces[0], surfaces[1]);
    assert.deepEqual(surfaces[0], surfaces[2]);
    const collapse = page.getByRole('button', { name: 'Contraer barra lateral' });
    const expandedPosition = await collapse.boundingBox();
    const expandedSidebar = await header.boundingBox();
    assert.ok(Math.abs(expandedSidebar.x + expandedSidebar.width - expandedPosition.x - expandedPosition.width - 12) <= 1);
    await collapse.click();
    const collapsedPosition = await page.getByRole('button', { name: 'Expandir barra lateral' }).boundingBox();
    assert.ok(collapsedPosition.x < expandedPosition.x);
    const collapsedSidebar = await header.boundingBox();
    const sidebarEdge = collapsedSidebar.x + collapsedSidebar.width;
    assert.equal(await menu.isVisible(), false);
    assert.equal(await session.isVisible(), false);
    await footer.getByRole('img', { name: 'Dispositivo' }).waitFor();
    assert.ok(Math.abs(collapsedPosition.x - sidebarEdge - 16) <= 1);
    assert.equal(await addPage.isVisible(), false);
    assert.equal(await page.locator('.editorial-sidebar-rail').evaluate(rail => getComputedStyle(rail).scrollbarWidth), 'none');
    const compactLogo = header.locator('.editorial-compact-logo');
    await compactLogo.waitFor();
    await compactLogo.evaluate(image => image.decode());
    assert.equal(await logo.isVisible(), false);
    assert.equal(await header.locator('.editorial-draft-status').isVisible(), false);
    assert.equal(collapsedPosition.y, expandedPosition.y);
    await page.getByRole('navigation', { name: 'Módulos del editor' })
      .getByRole('button', { name: 'Diapositivas' }).click();
    await page.locator('.editorial-sidebar-pages:popover-open').waitFor();
    await addPage.waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.editorial-sidebar-pages:popover-open').count(), 0);
    await page.getByRole('navigation', { name: 'Módulos del editor' })
      .getByRole('button', { name: 'Diapositivas' }).click();
    const pagesShortcut = page.locator('.editorial-sidebar-rail button[aria-label="Diapositivas"]');
    const shortcutPosition = await pagesShortcut.boundingBox();
    const pagesHandle = await pages.getByRole('button', { name: 'Mover Diapositivas' }).boundingBox();
    const pagesThreshold = pagesHandle.x + 13 + (await pages.boundingBox()).width * 0.25;
    await page.mouse.move(pagesHandle.x + 13, pagesHandle.y + 14);
    await page.mouse.down();
    await page.mouse.move(pagesThreshold + 4, pagesHandle.y + 14);
    assert.equal(await pagesShortcut.isVisible(), false);
    assert.equal(await pages.evaluate(card => getComputedStyle(card).outlineStyle), 'solid');
    await page.mouse.move(pagesThreshold - 4, pagesHandle.y + 14);
    assert.equal(await pagesShortcut.isVisible(), true);
    await page.mouse.move(240, 170);
    assert.equal(await pagesShortcut.isVisible(), false);
    await page.mouse.up();
    const floatingPages = page.locator('.editorial-sidebar-pages.editorial-floating-module:popover-open');
    await floatingPages.waitFor();
    const pageIcon = floatingPages.locator('.editorial-pages-icon');
    assert.equal(await pageIcon.textContent(), 'description');
    const glyph = await pageIcon.boundingBox();
    const close = await floatingPages.locator('.editorial-floating-close').boundingBox();
    assert.ok(Math.abs(glyph.y + glyph.height / 2 - close.y - close.height / 2) <= 2);
    const indication = await floatingPages.locator('#pageIndicator, .editor-slide-indicator').boundingBox();
    assert.ok(close.x - indication.x - indication.width >= 8, slug + ': espacio entre indicador y X');
    const dragIcon = await floatingPages.locator('.editorial-module-handle').boundingBox();
    assert.ok(glyph.x - dragIcon.x - dragIcon.width >= 6, slug + ': espacio entre agarrador e ícono');
    const resize = floatingPages.getByRole('separator', { name: 'Ancho de Diapositivas' });
    const beforeResize = await floatingPages.boundingBox();
    const widthGrip = await resize.boundingBox();
    await dragHandle(resize, widthGrip.x + 36, widthGrip.y + 42);
    const afterResize = await floatingPages.boundingBox();
    assert.ok(afterResize.width > beforeResize.width);
    assert.equal(afterResize.x, beforeResize.x);
    const originalSlides = await thumbnails.count();
    await addPage.click();
    assert.equal(await thumbnails.count(), originalSlides + 1);
    await deletePage.click();
    await dragHandle(floatingPages.getByRole('button', { name: 'Mover Diapositivas' }), 29, shortcutPosition.y + 15);
    await pagesShortcut.waitFor();
    assert.equal(await floatingPages.count(), 0);
    await page.getByRole('button', { name: 'Expandir barra lateral' }).click();
    await pages.waitFor();

    const design = page.locator('aside.editor-panel > :is(.modern-design-group, .ds-plate-design-group)');
    const designHandle = design.locator('.editorial-module-handle');
    await designHandle.scrollIntoViewIfNeeded();
    const handleStart = await designHandle.boundingBox();
    const designStart = await design.boundingBox();
    const startX = handleStart.x + handleStart.width / 2;
    const startY = handleStart.y + handleStart.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 24, startY, { steps: 4 });
    const inMotion = await design.boundingBox();
    assert.equal(inMotion.width, designStart.width);
    assert.ok(Math.abs(inMotion.x - designStart.x - 24) < 1);
    assert.equal(await design.evaluate(card => card.classList.contains('editorial-floating-module')), false);
    const slot = page.locator('aside.editor-panel > .editorial-sidebar-drop-slot');
    const designThreshold = startX + designStart.width * 0.25;
    await page.mouse.move(designThreshold + 4, startY);
    assert.equal(await slot.count(), 0);
    await page.mouse.move(designThreshold - 4, startY);
    assert.equal(await slot.count(), 1);
    await page.mouse.move(designThreshold + 4, startY);
    assert.equal(await slot.count(), 0);
    await page.mouse.up();
    const closeDesign = design.getByRole('button', { name: /^Devolver/ });
    await closeDesign.waitFor();
    assert.equal(await design.evaluate(card => card.matches(':popover-open')), true);
    await page.mouse.click(10, 75);
    assert.equal(await design.evaluate(card => card.matches(':popover-open')), true);
    await design.locator(':scope > :is(.modern-toggle, .ds-control-card-toggle)').click({ position: { x: 100, y: 18 } });
    assert.equal(await design.evaluate(card => card.matches(':popover-open')), true);
    await closeDesign.click();
    assert.equal(await design.evaluate(card => card.matches(':popover-open')), false);
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
