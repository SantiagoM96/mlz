import { expect, test } from '@playwright/test';

const home = '/agenda-de-la-comunidad';
const dateForShowcase = new Date('2026-11-12T17:30:00.000Z'); // 14:30 en Argentina.

test('la portada elige la próxima actividad deportiva, cultural y ambiental', async ({ page }) => {
  await page.clock.install({ time: dateForShowcase });
  await page.goto(home);
  const cards = page.getByTestId('agenda-upcoming').getByTestId('agenda-card');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0).getByRole('heading')).toHaveText('Fútbol en Comunidad');
  await expect(cards.nth(1).getByRole('heading')).toHaveText('Muestra fotográfica barrial');
  await expect(cards.nth(2).getByRole('heading')).toHaveText('Jornada de reciclaje');

  // Una sola programación por tarjeta, incluso cuando hay varias en el registro.
  for (const card of await cards.all()) {
    await expect(card.locator('[data-agenda-field="date"]')).toHaveCount(1);
    await expect(card.locator('[data-agenda-field="time"]')).toHaveCount(1);
    await expect(card.locator('[data-agenda-field="place"]')).toHaveCount(1);
  }
  await cards.nth(0).getByRole('link', { name: /Ver más sobre Fútbol en Comunidad/ }).click();
  await expect(page).toHaveURL(/\/agenda-de-la-comunidad\/actividades\/preview-v2-futbol--sede-/);
});

test('los enlaces de portada incluyen chevron sin subrayarse al pasar el mouse', async ({ page }) => {
  await page.clock.install({ time: dateForShowcase });
  await page.goto(home);

  const featured = page.getByTestId('agenda-featured');
  await expect(featured.locator('[data-agenda-field="date"]')).toHaveCount(1);
  await expect(featured.locator('[data-agenda-field="time"]')).toHaveCount(1);
  await expect(featured.locator('[data-agenda-field="place"]')).toHaveCount(1);
  await expect(featured).toContainText('Tita & Rhodesia');
  await expect(featured).toContainText('Teatro Municipal');

  const actions = [
    featured.getByRole('link', { name: 'Ver más' }),
    page.getByRole('link', { name: 'Ver todas las actividades' }),
  ];

  for (const action of actions) {
    await expect(action.locator('[data-material-symbol="chevron_right"]')).toBeVisible();
    await action.hover();
    await expect(action).toHaveCSS('text-decoration-line', 'none');
  }
});
