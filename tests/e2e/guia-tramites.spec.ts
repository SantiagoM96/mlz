import { expect, test } from '@playwright/test';

const base = '/prototipos/guia-de-tramites/';

test('Guía: portada, 15 temas y destacados navegables', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await expect(page.getByRole('heading', { name: '¿Qué trámite necesitás hacer?' })).toBeVisible();
  await expect(page.locator('.popular-card')).toHaveCount(8);
  await expect(page.locator('.topic-card')).toHaveCount(15);
  await expect(page.locator('body')).not.toContainText('Preguntale a Mini Muni');
  await expect(page.locator('body')).not.toHaveJSProperty('scrollWidth', 0);
  expect(errors).toEqual([]);
});

test('Guía: buscador, filtros y ordenamiento del catálogo', async ({ page }) => {
  await page.goto(base + 'd-catalogo.html');
  await expect(page.locator('.count')).toHaveText('91 trámites');
  await expect(page.locator('.result-card')).toHaveCount(91);

  await page.locator('[data-search-form] input').fill('dni');
  await page.locator('[data-search-form] button').click();
  await expect(page.locator('.result-card').first()).toBeVisible();
  await expect(page.locator('.count')).not.toHaveText('91 trámites');

  if ((page.viewportSize()?.width ?? 1415) <= 760) {
    await page.locator('[data-action="open-filters"]').click();
    await expect(page.locator('#catalog-filters')).toHaveClass(/is-open/);
    await page.locator('[data-action="close-filters"]').last().click();
  }
});

test('Guía: 91 fichas de Excel enlazadas con datos públicos', async ({ page }) => {
  await page.goto(base + 'd-ficha.html?t=certificado-deuda-escribania');
  await expect(page.getByRole('heading', { name: 'Certificado de deuda para escribanos' })).toBeVisible();
  await expect(page.locator('#requisitos')).toContainText(/escribano/i);
  await expect(page.locator('#documentacion')).toContainText(/catastral|DNI/i);
  await expect(page.locator('#pasos')).toBeVisible();
  const facts = await page.evaluate(() => {
    const data = (window as typeof window & { GUIA_TRAMITES_FICHAS?: Record<string, { forms: { sourceName: string; summary: string }[] }> }).GUIA_TRAMITES_FICHAS;
    return {
      count: Object.keys(data || {}).length,
      noEmpty: Object.values(data || {}).every(record => record.forms.length > 0 && record.forms.every(f => f.sourceName && f.summary)),
      leakedEmail: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(JSON.stringify(data)),
    };
  });
  expect(facts).toEqual({ count: 91, noEmpty: true, leakedEmail: false });
});

test('Guía: variantes de patentes y ficha de licencia', async ({ page }) => {
  await page.goto(base + 'd-ficha.html?t=alta-patente');
  await expect(page.locator('#variantes')).toBeVisible();
  await expect(page.locator('#variantes')).toContainText(/moto/i);
  await page.goto(base + 'd-ficha.html?t=licencia-de-conducir');
  await expect(page.locator('#documentacion')).toBeVisible();
  await expect(page.locator('#requisitos')).toBeVisible();
  await expect(page.locator('#normativa')).toBeVisible();
});

test('Guía: sin desborde horizontal en sus vistas principales', async ({ page }) => {
  for (const route of [
    '',
    'd-catalogo.html',
    'd-categoria.html?c=tasas-y-pagos',
    'd-ficha.html?t=certificado-deuda-escribania',
  ]) {
    await page.goto(base + route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(2);
  }
});
