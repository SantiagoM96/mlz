import { expect, test } from '@playwright/test';

test('catálogo: 125 trámites, búsqueda, limpieza y dropdown compartido con Agenda', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('patente');
  await expect(page.getByTestId('tramite-row').first()).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await expect(menu).toBeVisible();
  // El checkbox de Agenda cubre toda la fila; activar el control real, no el texto debajo.
  await menu.getByRole('checkbox', { name: 'Vehículos y tránsito' }).click();
  await menu.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(page.getByText('18 trámites', { exact: true })).toBeVisible();
});

test('ficha R036: índice de Jóvenes, contenido de Figma y sin campos descartados', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solicitar un certificado para escribanía');
  await expect(page.getByRole('heading', { name: 'Documentación', exact: true })).toBeVisible();
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Índice de la ficha' }).first()).toBeVisible();
  const visibleIndex = (page.viewportSize()?.width ?? 1415) <= 680
    ? page.locator('.tram-detail-mobile-tools')
    : page.locator('.tram-detail-aside');
  await expect(visibleIndex.getByRole('heading', { name: 'Índice' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir' }).first()).toBeVisible();
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
  await expect(page.locator('#relacionados')).toHaveCount(0);
  await expect(page.locator('#donde-cuando .tram-location-map')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/i })).toHaveCount(0);
});

test('ficha R018: separa correctamente los cuatro pasos de ORIGEN', async ({ page }) => {
  await page.goto('/tramites/R018');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('automotor');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(4);
  await expect(page.locator('#procedimiento')).not.toContainText('1\nRecepcionarse\n2');
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(3);
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
});

test('ficha mobile: índice antes del contenido, filtros tipo Agenda y sin desborde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites/R036');
  const tools = page.locator('.tram-detail-mobile-tools');
  await expect(tools.getByRole('navigation', { name: 'Índice de la ficha' })).toBeVisible();
  await expect(tools.getByRole('button', { name: 'Compartir' })).toBeVisible();
  await expect(page.locator('.tram-detail-aside')).toBeHidden();
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);

  await page.goto('/tramites');
  await page.getByRole('button', { name: '¿Para quién es?', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Opciones de ¿Para quién es?' })).toBeVisible();
  await expect(page.locator('.agenda-mobile-backdrop')).toBeVisible();
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('rutas directas y enlaces públicos verificables', async ({ page }) => {
  await page.goto('/tramites/R001');
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/ }))
    .toHaveAttribute('href', 'https://proveedores.lomasdezamora.gov.ar');
  await page.goto('/tramites/R999');
  await expect(page.getByRole('heading', { name: 'No encontramos ese trámite' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver al catálogo' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
});


test('Más filtros sincroniza destinatario y tema seleccionados en accesos directos', async ({ page }) => {
  await page.goto('/tramites');
  const more = page.getByTestId('tramites-more-filters');
  const counter = more.locator('[data-agenda-filter-count]');
  await expect(counter).toHaveCount(0);

  await page.getByRole('button', { name: '¿Para quién es?', exact: true }).click();
  const audience = page.getByRole('dialog', { name: 'Opciones de ¿Para quién es?' });
  await audience.getByRole('checkbox', { name: 'Vecinos y vecinas' }).click();
  await audience.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(counter).toHaveText('1');

  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const topic = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await topic.getByRole('checkbox', { name: 'Vehículos y tránsito' }).click();
  await topic.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(counter).toHaveText('2');

  await more.getByRole('button', { name: /Más filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('checkbox', { name: 'Vecinos y vecinas' })).toBeChecked();
  await panel.getByRole('button', { name: 'Tema', exact: true }).click();
  await expect(panel.getByRole('checkbox', { name: 'Vehículos y tránsito' })).toBeChecked();

  await panel.getByRole('button', { name: 'Turno', exact: true }).click();
  await panel.getByRole('checkbox', { name: 'No requiere turno' }).click();
  await expect(counter).toHaveText('3');
  await panel.getByRole('button', { name: 'Ver resultados (10)' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tramite-filter-chip-turno')).toBeVisible();

  // Cambiar el turno desde el panel no suma una segunda selección del mismo criterio.
  await more.getByRole('button', { name: /Más filtros/ }).click();
  const reopened = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await reopened.getByRole('button', { name: 'Turno', exact: true }).click();
  await expect(reopened.getByRole('checkbox', { name: 'No requiere turno' })).toBeChecked();
  await reopened.getByRole('checkbox', { name: 'Requiere turno', exact: true }).click();
  await expect(reopened.getByRole('checkbox', { name: 'No requiere turno' })).not.toBeChecked();
  await expect(counter).toHaveText('3');
  await reopened.getByRole('button', { name: 'Ver resultados (1)' }).click();
  await expect(reopened).toBeHidden();
  await expect(page.getByText('1 trámite', { exact: true })).toBeVisible();
});

test('Turno no incluye trámites cuyo relevamiento no informa si requieren reserva', async ({ page }) => {
  await page.goto('/tramites');
  const more = page.getByTestId('tramites-more-filters');
  await more.getByRole('button', { name: /Más filtros/ }).click();
  let panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await panel.getByRole('button', { name: 'Turno', exact: true }).click();
  await panel.getByRole('checkbox', { name: 'Requiere turno', exact: true }).click();
  await panel.getByRole('button', { name: 'Ver resultados (10)' }).click();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();

  await more.getByRole('button', { name: /Más filtros/ }).click();
  panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await panel.getByRole('button', { name: 'Turno', exact: true }).click();
  await panel.getByRole('checkbox', { name: 'No requiere turno' }).click();
  await panel.getByRole('button', { name: 'Ver resultados (83)' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText('83 trámites', { exact: true })).toBeVisible();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveText('1');

  // Limpiar el panel conserva búsqueda y orden, pero limpia todos los criterios.
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('licencia');
  await more.getByRole('button', { name: /Más filtros/ }).click();
  panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await panel.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveCount(0);
  await expect(page.getByRole('searchbox', { name: 'Buscar trámite' })).toHaveValue('licencia');
});

test('Más filtros usa bottom sheet de Agenda en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites');
  await page.getByTestId('tramites-more-filters').getByRole('button', { name: 'Más filtros' }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await expect(panel).toBeVisible();
  await expect(page.locator('.agenda-mobile-backdrop')).toBeVisible();
  await expect(panel.getByRole('button', { name: '¿Para quién es?' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Tema' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Turno' })).toBeVisible();
  await panel.getByRole('button', { name: 'Turno' }).click();
  await panel.getByRole('checkbox', { name: 'No requiere turno' }).click();
  await panel.getByRole('button', { name: 'Ver resultados (83)' }).click();
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveText('1');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
