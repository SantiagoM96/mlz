import { expect, test } from '@playwright/test';

test('catálogo: 125 trámites, búsqueda, limpieza y dropdown compartido con Agenda', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar trámite' }).fill('patente');
  await expect(page.getByTestId('tramite-row').first()).toBeVisible();
  await expect(page.getByText('125 trámites', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await expect(menu).toBeVisible();
  // El checkbox de Agenda cubre toda la fila; activar el control real, no el texto debajo.
  await menu.getByRole('radio', { name: 'Vehículos y tránsito' }).click();
  await menu.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(page.getByText('18 trámites', { exact: true })).toBeVisible();
});

test('ficha R036: índice de Jóvenes, contenido de Figma y sin campos descartados', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solicitar un certificado para escribanía');
  // El nombre de la categoría está en el breadcrumb y no se repite sobre el título.
  await expect(page.locator('.tram-eyebrow')).toHaveCount(0);
  await expect(page.locator('.tram-detail-header .tram-start-link')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Documentación', exact: true })).toBeVisible();
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Índice de la ficha' }).first()).toBeVisible();
  const visibleIndex = (page.viewportSize()?.width ?? 1415) <= 900
    ? page.locator('.tram-detail-mobile-tools')
    : page.locator('.tram-detail-aside');
  await expect(visibleIndex.getByRole('heading', { name: 'Índice' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir' }).first()).toBeVisible();
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
  await expect(page.locator('#otros-tramites .tram-related-card')).toHaveCount(3);
  await expect(page.locator('#otros-tramites .tram-related-card').nth(0)).toHaveAttribute('href', /\/R093$/);
  await expect(page.locator('#otros-tramites .tram-related-card').nth(1)).toHaveAttribute('href', /\/R089$/);
  await expect(page.locator('#otros-tramites .tram-related-card').nth(2)).toHaveAttribute('href', /\/R046$/);
  await expect(page.locator('#otros-tramites')).not.toContainText('Solicitar un certificado para escribanía');
  await expect(page.locator('#donde-cuando .tram-location-map')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/i })).toHaveCount(0);
});

test('ficha R018: separa correctamente los cuatro pasos de ORIGEN', async ({ page }) => {
  await page.goto('/tramites/R018');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('automotor');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(4);
  await expect(page.locator('#procedimiento')).not.toContainText('1\nRecepcionarse\n2');
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(3);
  await expect(page.locator('#documentacion .tram-documents li').first())
    .toContainText('Baja impositiva municipio anterior');
  await expect(page.locator('#documentacion .tram-documents li').nth(1))
    .toContainText('Título automotor');
  await expect(page.locator('#documentacion .tram-documents li').nth(2))
    .toContainText('DNI');
  await expect(page.locator('#donde-cuando .tram-location-info'))
    .toContainText('Azara 237 PB');
  await expect(page.locator('#donde-cuando .tram-location-info'))
    .toContainText('Lunes a viernes de 8 a 16 h');
  await expect(page.locator('#costos')).toHaveCount(0);
  await expect(page.locator('#normativa')).toHaveCount(0);
});

test('ficha mobile: índice antes del contenido, filtros tipo Agenda y sin desborde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites/R036');
  const tools = page.locator('.tram-detail-mobile-tools');
  await expect(tools.getByRole('navigation', { name: 'Índice de la ficha' })).toBeVisible();
  await expect(tools.getByRole('button', { name: 'Compartir' })).toBeVisible();
  await expect(page.locator('#otros-tramites .tram-related-card')).toHaveCount(3);
  const cards = page.locator('#otros-tramites .tram-related-card');
  expect(await cards.nth(1).boundingBox().then(rect => rect?.y ?? 0))
    .toBeGreaterThan(await cards.nth(0).boundingBox().then(rect => rect?.y ?? 0));
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
  await expect(page.getByRole('link', { name: /Ir al sitio del trámite/ })).toHaveCount(0);
  await page.goto('/tramites/R999');
  await expect(page.getByRole('heading', { name: 'No encontramos ese trámite' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver al catálogo' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
});


test('Más filtros sincroniza accesos directos sin duplicar sus contadores', async ({ page }) => {
  await page.goto('/tramites');
  const more = page.getByTestId('tramites-more-filters');
  const counter = more.locator('[data-agenda-filter-count]');
  await expect(counter).toHaveCount(0);

  await page.getByRole('button', { name: '¿Para quién es?', exact: true }).click();
  const audience = page.getByRole('dialog', { name: 'Opciones de ¿Para quién es?' });
  await audience.getByRole('checkbox', { name: 'Vecinos y vecinas' }).click();
  await audience.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(counter).toHaveCount(0);

  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const topic = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await topic.getByRole('radio', { name: 'Vehículos y tránsito' }).click();
  await topic.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(counter).toHaveCount(0);

  await more.getByRole('button', { name: /Más filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('checkbox', { name: 'Vecinos y vecinas' })).toBeChecked();
  await panel.getByRole('button', { name: 'Tema', exact: true }).click();
  await expect(panel.getByRole('radio', { name: 'Vehículos y tránsito' })).toBeChecked();

  await panel.getByRole('button', { name: 'Turno', exact: true }).click();
  await panel.getByRole('radio', { name: 'No requiere turno' }).click();
  await expect(counter).toHaveText('1');
  await panel.getByRole('button', { name: 'Ver resultados (10)' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tramite-filter-chip-turno')).toBeVisible();

  // Cambiar el turno desde el panel no suma una segunda selección del mismo criterio.
  await more.getByRole('button', { name: /Más filtros/ }).click();
  const reopened = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await reopened.getByRole('button', { name: 'Turno', exact: true }).click();
  await expect(reopened.getByRole('radio', { name: 'No requiere turno' })).toBeChecked();
  await reopened.getByRole('radio', { name: 'Requiere turno', exact: true }).click();
  await expect(reopened.getByRole('radio', { name: 'No requiere turno' })).not.toBeChecked();
  await expect(counter).toHaveText('1');
  await reopened.getByRole('button', { name: 'Ver resultados (1)' }).click();
  await expect(reopened).toBeHidden();
  await expect(page.getByText('1 trámite', { exact: true })).toBeVisible();
});

test('Turno no incluye trámites cuyo relevamiento no informa si requieren reserva', async ({ page }) => {
  await page.goto('/tramites');
  const more = page.getByTestId('tramites-more-filters');
  await more.getByRole('button', { name: /Más filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await panel.getByRole('button', { name: 'Turno', exact: true }).click();

  // Se comprueban ambas alternativas mientras el mismo panel permanece abierto,
  // sin introducir carreras con el cierre animado de Agenda en móvil.
  await panel.getByRole('radio', { name: 'Requiere turno', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Ver resultados (10)' })).toBeVisible();
  await panel.getByRole('radio', { name: 'No requiere turno' }).click();
  await expect(panel.getByRole('radio', { name: 'Requiere turno', exact: true })).not.toBeChecked();
  await expect(panel.getByRole('button', { name: 'Ver resultados (83)' })).toBeVisible();
  await panel.getByRole('button', { name: 'Ver resultados (83)' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText('83 trámites', { exact: true })).toBeVisible();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveText('1');

  // Con un estado inicial desde la URL, limpiar las opciones mantiene la búsqueda.
  await page.goto('/tramites?q=licencia&turno=No+requiere+turno');
  await more.getByRole('button', { name: /Más filtros/ }).click();
  const filters = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await filters.getByRole('button', { name: 'Limpiar', exact: true }).click();
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
  await panel.getByRole('radio', { name: 'No requiere turno' }).click();
  await panel.getByRole('button', { name: 'Ver resultados (83)' }).click();
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveText('1');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});


test('Compartir copia la URL como Agenda y cambia ícono de enlace a check', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { lastCopiedLink?: string }).lastCopiedLink = text;
        },
      },
    });
  });
  await page.goto('/tramites/R018');
  const actions = (page.viewportSize()?.width ?? 1415) <= 900
    ? page.locator('.tram-detail-mobile-tools')
    : page.locator('.tram-detail-aside');
  const share = actions.getByRole('button', { name: 'Compartir' });
  await expect(share.locator('[data-material-symbol="link"]')).toBeVisible();
  await share.click();
  const copied = actions.getByRole('button', { name: 'Enlace copiado' });
  await expect(copied.locator('[data-material-symbol="check"]')).toBeVisible();
  await expect(actions.locator('[role="status"]'))
    .toContainText('Enlace copiado al portapapeles');
  expect(await page.evaluate(() => (window as Window & { lastCopiedLink?: string }).lastCopiedLink))
    .toContain('/tramites/R018');
});

test('Otros trámites del tema navegan sin inventar categorías ni reutilizar la ficha actual', async ({ page }) => {
  await page.goto('/tramites/R018');
  const currentTitle = await page.getByRole('heading', { level: 1 }).textContent();
  const cards = page.locator('#otros-tramites .tram-related-card');
  await expect(cards).toHaveCount(3);
  await expect(page.locator('#otros-tramites')).not.toContainText(currentTitle ?? '');
  await cards.first().click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(currentTitle ?? '');
  await expect(page.locator('#otros-tramites')).toBeVisible();
});


test('catálogo: burbuja de chevrón aparece al bajar y vuelve arriba sin abrir otra ruta', async ({ page }) => {
  await page.goto('/tramites');
  const boton = page.getByRole('button', { name: 'Volver arriba' });
  await expect(boton).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, 1100));
  await expect(boton).toBeVisible();
  await expect(boton.locator('[data-material-symbol="keyboard_arrow_up"]')).toBeVisible();
  await expect(boton).toHaveCSS('border-radius', '50%');
  await boton.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await page.goto('/tramites/R036');
  await expect(page.getByRole('button', { name: 'Volver arriba' })).toHaveCount(0);
});

test('catálogo: subir respeta preferencia de movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tramites');
  await page.evaluate(() => window.scrollTo(0, 1300));
  const boton = page.getByRole('button', { name: 'Volver arriba' });
  await expect(boton).toBeVisible();
  await boton.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test('ficha R036: jerarquía tipográfica y espaciados según Figma', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.locator('.tram-detail h1')).toHaveCSS('font-size', '32px');
  await expect(page.locator('.tram-detail .tram-eyebrow')).toHaveCount(0);
  await expect(page.locator('#documentacion h2')).toHaveCSS('font-size', '24px');
  await expect(page.locator('#otros-tramites h2')).toHaveCSS('font-size', '24px');
  await expect(page.locator('#otros-tramites .tram-related-grid')).toHaveCSS('gap', '16px');
  await expect(page.locator('#otros-tramites .tram-related-card strong').first()).toHaveCSS('font-size', '18px');
  await expect(page.locator('#otros-tramites .tram-related-card p').first()).toHaveCSS('font-size', '16px');
  const iconBox = page.locator('#otros-tramites .tram-related-card .tram-related-icon').first();
  await expect(iconBox).toHaveCSS('width', '48px');
  await expect(iconBox).toHaveCSS('height', '48px');
  await expect(iconBox.locator('[data-material-symbol="receipt_long"]')).toHaveCSS('width', '32px');
  await expect(iconBox.locator('[data-material-symbol="receipt_long"]')).toHaveCSS('height', '32px');

  // Figma R036: el separador va ANTES de "Otros trámites", nunca después.
  await expect(page.locator('#otros-tramites')).toHaveCSS('border-bottom-width', '0px');
  await expect(page.locator('#otros-tramites')).toHaveCSS('padding-bottom', '0px');

  const isMobile = (page.viewportSize()?.width ?? 1415) <= 680;
  await expect(page.locator('#otros-tramites > h2')).toHaveCSS('margin-bottom', isMobile ? '16px' : '24px');
  await expect(page.locator('.tram-detail-header')).toHaveCSS('gap', isMobile ? '12px' : '16px');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});


test('catálogo: tipografía Geometria y escala Figma desktop/mobile', async ({ page }) => {
  await page.goto('/tramites');
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toHaveCSS('font-size', '32px');
  await expect(page.locator('.tram-group-heading h2').first()).toHaveCSS('font-size', '24px');
  await expect(page.locator('.tram-row h3').first()).toHaveCSS('font-size', '20px');
  await expect(page.locator('.tram-row-content > p').first()).toHaveCSS('font-size', '16px');
  await expect(page.locator('.tram-row-content > p').first()).toHaveCSS('line-height', '21px');
  await expect(page.locator('.tram-row-actions .tram-link-action').first()).toHaveCSS('font-size', '16px');
});


test('destinatarios: varias selecciones, chips individuales y URL reproducible', async ({ page }) => {
  await page.goto('/tramites');
  const audienceTrigger = page.getByRole('button', { name: '¿Para quién es?', exact: true });
  await audienceTrigger.click();
  const menu = page.getByRole('dialog', { name: 'Opciones de ¿Para quién es?' });
  await menu.getByRole('checkbox', { name: 'Vecinos y vecinas' }).click();
  await menu.getByRole('checkbox', { name: 'Profesionales' }).click();
  await menu.getByRole('button', { name: /Ver resultados/ }).click();

  const chips = page.getByRole('group', { name: 'Filtros seleccionados' });
  await expect(chips.locator('.agenda-filter-chip')).toHaveCount(2);
  await expect(chips.getByRole('button', { name: 'Quitar filtro destinatario: Vecinos y vecinas' })).toBeVisible();
  await expect(chips.getByRole('button', { name: 'Quitar filtro destinatario: Profesionales' })).toBeVisible();
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveCount(0);
  expect(await page.evaluate(() => new URLSearchParams(location.search).getAll('destinatario')))
    .toEqual(['Vecinos y vecinas', 'Profesionales']);

  await page.reload();
  await expect(chips.locator('.agenda-filter-chip')).toHaveCount(2);
  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const temasMenu = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await expect(temasMenu.getByRole('radio', { name: 'Vehículos y tránsito' })).toBeVisible();
  await expect(temasMenu.getByRole('checkbox')).toHaveCount(0);
  await temasMenu.getByRole('radio', { name: 'Vehículos y tránsito' }).click();
  await temasMenu.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(chips.locator('.agenda-filter-chip')).toHaveCount(3);
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveCount(0);

  await chips.getByRole('button', { name: 'Quitar filtro destinatario: Profesionales' }).click();
  await expect(chips.locator('.agenda-filter-chip')).toHaveCount(2);
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveCount(0);
  expect(await page.evaluate(() => new URLSearchParams(location.search).getAll('destinatario')))
    .toEqual(['Vecinos y vecinas']);
  await chips.getByRole('button', { name: 'Limpiar' }).click();
  await expect(chips).toHaveCount(0);
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
});

test('Más filtros permite varios destinatarios sin duplicar el contador; Tema utiliza radios', async ({ page }) => {
  await page.goto('/tramites');
  const more = page.getByTestId('tramites-more-filters');
  await more.getByRole('button', { name: /Más filtros/ }).click();
  const panel = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await panel.getByRole('checkbox', { name: 'Vecinos y vecinas' }).click();
  await panel.getByRole('checkbox', { name: 'Profesionales' }).click();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Tema' }).click();
  await expect(panel.getByRole('radio', { name: 'Vehículos y tránsito' })).toBeVisible();
  await panel.getByRole('radio', { name: 'Vehículos y tránsito' }).click();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveCount(0);
  await panel.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(panel).toBeHidden();
  const chips = page.getByRole('group', { name: 'Filtros seleccionados' });
  await expect(chips.locator('.agenda-filter-chip')).toHaveCount(3);

  await more.getByRole('button', { name: /Más filtros/ }).click();
  const reopened = page.getByRole('dialog', { name: 'Filtros de trámites' });
  await expect(reopened.getByRole('checkbox', { name: 'Vecinos y vecinas' })).toBeChecked();
  await expect(reopened.getByRole('checkbox', { name: 'Profesionales' })).toBeChecked();
  await reopened.getByRole('button', { name: 'Tema' }).click();
  await expect(reopened.getByRole('radio', { name: 'Vehículos y tránsito' })).toBeChecked();
  await reopened.getByRole('radio', { name: 'Salud' }).click();
  await expect(reopened.getByRole('radio', { name: 'Vehículos y tránsito' })).not.toBeChecked();
  await expect(more.locator('[data-agenda-filter-count]')).toHaveCount(0);
});

test('procedimientos no uniformes: normaliza R029, R030 y numeración en línea de R089', async ({ page }) => {
  await page.goto('/tramites/R029');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-procedure-note')).toContainText('Solicitar baja automotor');
  await page.goto('/tramites/R030');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-timeline li').first()).toContainText('Recepcionarse');
  await page.goto('/tramites/R089');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(6);
  await expect(page.locator('#procedimiento .tram-timeline li').last()).toContainText('Firma y entrega de planos');
});

test('procedimientos con ramas y datos mal clasificados: sin instrucciones inventadas', async ({ page }) => {
  await page.goto('/tramites/R092');
  await expect(page.locator('#procedimiento .tram-timeline')).toHaveCount(2);
  await expect(page.locator('#procedimiento .tram-procedure-note')).toContainText('En caso de no haber copia');
  await page.goto('/tramites/R033');
  await expect(page.locator('#procedimiento .tram-timeline')).toHaveCount(0);
  await expect(page.locator('#procedimiento .tram-procedure-list li')).toHaveCount(5);
  await page.goto('/tramites/R055');
  await expect(page.locator('#procedimiento .tram-timeline li')).toHaveCount(5);
  await expect(page.locator('#procedimiento .tram-timeline li').first()).toContainText('Ingreso y Primera Escucha');
  await expect(page.locator('#procedimiento .tram-timeline li').first()).toContainText('Siria 75');
  await page.goto('/tramites/R125');
  await expect(page.locator('#procedimiento')).toHaveCount(0);
});

test('íconos de documentación y destinatarios: semánticos y medidas de Figma', async ({ page }) => {
  await page.goto('/tramites/R036');
  await expect(page.locator('#documentacion .tram-document-icon').first()).toHaveCSS('width', '40px');
  await expect(page.locator('#documentacion .tram-document-icon [data-material-symbol="description"]').first())
    .toHaveCSS('width', '24px');
  await expect(page.locator('#destinatarios .tram-audience-tag').first()).toHaveCSS('height', '28px');
  await expect(page.locator('#destinatarios .tram-audience-tag [data-material-symbol]').first()).toHaveCSS('width', '18px');
  await expect(page.locator('#destinatarios [data-material-symbol="work_outline"]')).toHaveCount(1);
  await page.goto('/tramites/R121');
  await expect(page.locator('#destinatarios [data-material-symbol="storefront"]')).toHaveCount(1);
  await page.goto('/tramites/R122');
  await expect(page.locator('#destinatarios [data-material-symbol="account_balance"]')).toHaveCount(1);
  await page.goto('/tramites/R123');
  await expect(page.locator('#destinatarios [data-material-symbol="diversity_3"]')).toHaveCount(1);
});


test('etiquetas del catálogo: Patentes filtra exactamente los registros editoriales y genera chip', async ({ page }) => {
  await page.goto('/tramites');
  const etiqueta = page.locator('.tram-row').first()
    .getByRole('button', { name: 'Filtrar trámites por etiqueta: Patentes' });
  await expect(etiqueta).toBeVisible();
  await etiqueta.click();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filtros seleccionados' })
    .getByRole('button', { name: 'Quitar filtro etiqueta: Patentes' })).toBeVisible();
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveText('1');
  await expect(page).toHaveURL(/(?:\?|&)etiqueta=Patentes(?:&|$)/);
  await expect(page.getByTestId('tramite-row')).toHaveCount(10);

  // Cada trámite visible debe contener la misma etiqueta editorial.
  for (const item of await page.getByTestId('tramite-row').all()) {
    await expect(item.getByRole('button', { name: 'Filtrar trámites por etiqueta: Patentes' }))
      .toHaveAttribute('aria-pressed', 'true');
  }

  await page.reload();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await page.getByRole('group', { name: 'Filtros seleccionados' })
    .getByRole('button', { name: 'Quitar filtro etiqueta: Patentes' }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveCount(0);
});

test('etiquetas de ficha: navegan al catálogo filtrado y combinan con tema sin duplicar chips', async ({ page }) => {
  await page.goto('/tramites/R018');
  const tag = page.locator('.tram-detail-header')
    .getByRole('link', { name: 'Ver trámites con etiqueta: Patentes' });
  await expect(tag).toBeVisible();
  await tag.click();
  await expect(page.getByRole('heading', { name: 'Catálogo de trámites' })).toBeVisible();
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filtros seleccionados' })
    .locator('.agenda-filter-chip')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tema', exact: true }).click();
  const topics = page.getByRole('dialog', { name: 'Opciones de Tema' });
  await topics.getByRole('radio', { name: 'Vehículos y tránsito' }).click();
  await topics.getByRole('button', { name: /Ver resultados/ }).click();
  await expect(page.getByRole('group', { name: 'Filtros seleccionados' })
    .locator('.agenda-filter-chip')).toHaveCount(2);
  await expect(page.getByTestId('tramites-more-filters').locator('[data-agenda-filter-count]')).toHaveText('1');
  await page.getByRole('group', { name: 'Filtros seleccionados' })
    .getByRole('button', { name: 'Limpiar' }).click();
  await expect(page.getByText('125 trámites', { exact: true })).toBeVisible();
});

test('etiquetas en mobile: accesibles por teclado y sin desborde horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites');
  const tag = page.locator('.tram-row').first()
    .getByRole('button', { name: 'Filtrar trámites por etiqueta: Patentes' });
  await tag.focus();
  await expect(tag).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('10 trámites', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filtros seleccionados' })
    .getByRole('button', { name: 'Quitar filtro etiqueta: Patentes' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});


test('chips seleccionados: misma presentación visual real de Agenda en Trámites', async ({ page }) => {
  await page.goto('/agenda-de-la-comunidad/actividades');
  await page.getByRole('button', { name: 'Más Filtros', exact: true }).click();
  const agendaPanel = page.getByRole('dialog', { name: 'Filtros de la agenda' });
  await agendaPanel.getByRole('button', { name: 'Localidad' }).click();
  await agendaPanel.getByRole('checkbox', { name: 'Banfield' }).check();
  await agendaPanel.getByRole('button', { name: /Ver resultados/ }).click();
  const agendaChips = page.getByRole('group', { name: 'Filtros seleccionados' });
  const agendaChip = agendaChips.locator('[data-agenda-chip="selected"]').first();
  await expect(agendaChip).toBeVisible();

  const readStyles = async (selector: typeof agendaChip) => selector.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      minHeight: style.minHeight,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: style.backgroundColor,
      gap: style.gap,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      borderRadius: style.borderRadius,
    };
  });
  const agendaStyle = await readStyles(agendaChip);
  expect(['flex', 'inline-flex']).toContain(agendaStyle.display);
  expect(agendaStyle.minHeight).toBe('30px');
  expect(agendaStyle.fontSize).toBe('14px');
  expect(agendaStyle.borderRadius).toBe('6px');
  expect(agendaStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  const agendaClearStyle = await readStyles(
    agendaChips.getByRole('button', { name: 'Limpiar' }),
  );

  await page.goto('/tramites?destinatario=Instituciones&destinatario=Comercios+y+empresas');
  const tramitesChips = page.getByRole('group', { name: 'Filtros seleccionados' });
  await expect(tramitesChips.locator('[data-agenda-chip="selected"]')).toHaveCount(2);
  const tramitesChip = tramitesChips.locator('[data-agenda-chip="selected"]').first();
  expect(await readStyles(tramitesChip)).toEqual(agendaStyle);
  expect(await readStyles(tramitesChips.getByRole('button', { name: 'Limpiar' })))
    .toEqual(agendaClearStyle);
  await expect(tramitesChip.locator('[data-material-symbol="close"]')).toHaveCSS('font-size', '15px');
  await expect(tramitesChips.getByRole('button', { name: 'Quitar filtro destinatario: Instituciones' }))
    .toBeVisible();
  await tramitesChips.getByRole('button', { name: 'Quitar filtro destinatario: Instituciones' }).click();
  await expect(tramitesChips.locator('[data-agenda-chip="selected"]')).toHaveCount(1);
  await tramitesChips.getByRole('button', { name: 'Limpiar' }).click();
  await expect(tramitesChips).toHaveCount(0);
});

test('chips seleccionados en mobile: scroll horizontal y Limpiar fijo como Agenda', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites?destinatario=Instituciones&destinatario=Comercios+y+empresas&tema=Veh%C3%ADculos+y+tr%C3%A1nsito');
  const selected = page.getByRole('group', { name: 'Filtros seleccionados' });
  await expect(selected.locator('[data-agenda-chip="selected"]')).toHaveCount(3);
  await expect(selected.locator('.agenda-filter-chips-scroll')).toHaveCSS('overflow-x', 'auto');
  await expect(selected.getByRole('button', { name: 'Limpiar' })).toBeInViewport();
  await expect(selected.locator('[data-material-symbol="close"]')).toHaveCount(3);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});


test('procedimiento R121: las cuatro etapas del relevamiento usan el timeline institucional', async ({ page }) => {
  await page.goto('/tramites/R121');
  const seccion = page.locator('#procedimiento');
  const pasos = seccion.locator('.tram-timeline li');
  await expect(pasos).toHaveCount(4);
  await expect(pasos.nth(0)).toContainText('Solicitud');
  await expect(pasos.nth(1)).toContainText('Autorizacion por parte de la direccion');
  await expect(pasos.nth(2)).toContainText('Confirmacion');
  await expect(pasos.nth(3)).toContainText('Implementacion');
  await expect(seccion.locator('.tram-procedure-note')).toHaveCount(0);
  const marcador = pasos.first().locator('.tram-timeline-marker');
  await expect(marcador).toHaveCSS('width', '30px');
  await expect(marcador).toHaveCSS('height', '30px');
  await expect(pasos.first().locator('.tram-timeline-text')).toHaveCSS('font-size', '18px');
  await expect(page.getByText('Para realizar el trámite te van a solicitar la siguiente documentación')).toHaveCount(0);
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(1);
});

test('procedimientos con guiones verificados mantienen etapas, alternativas y orden de ORIGEN', async ({ page }) => {
  for (const { id, etapas, ultimo } of [
    { id: 'R031', etapas: 3, ultimo: 'Resolucion' },
    { id: 'R034', etapas: 5, ultimo: 'Secretaria de Economía y Finanzas' },
    { id: 'R132', etapas: 3, ultimo: 'ejecución' },
    { id: 'R123', etapas: 3, ultimo: 'cobertura del evento solicitado' },
  ]) {
    await page.goto('/tramites/' + id);
    const pasos = page.locator('#procedimiento .tram-timeline li');
    await expect(pasos).toHaveCount(etapas);
    await expect(pasos.last()).toContainText(ultimo, { ignoreCase: true });
    await expect(page.locator('#procedimiento .tram-procedure-note')).toHaveCount(0);
    await expect(page.locator('#documentacion .tram-document-intro')).toHaveCount(0);
  }
  // R123: autorizado/cancelado/rechazado son alternativas en un mismo paso.
  await page.goto('/tramites/R123');
  await expect(page.locator('#procedimiento .tram-timeline li').nth(1))
    .toContainText('autorizado-cancelado-rechazado');
  // R035: guiones internos ambiguos, no dividir un párrafo en pasos ficticios.
  await page.goto('/tramites/R035');
  await expect(page.locator('#procedimiento .tram-timeline')).toHaveCount(0);
  await expect(page.locator('#procedimiento .tram-procedure-note')).toHaveCount(1);
});

test('documentación: sin texto genérico en fichas y sin modificar la lista real', async ({ page }) => {
  for (const { id, documentos } of [
    { id: 'R018', documentos: 3 },
    { id: 'R036', documentos: 4 },
    { id: 'R121', documentos: 1 },
  ]) {
    await page.goto('/tramites/' + id);
    await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(documentos);
    await expect(page.locator('#documentacion .tram-document-intro')).toHaveCount(0);
    await expect(page.getByText('Para realizar el trámite te van a solicitar la siguiente documentación')).toHaveCount(0);
  }
});

test('R121 en 390 px: procedimiento se organiza en pasos y no genera desborde', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tramites/R121');
  await expect(page.locator('#procedimiento .tram-timeline-marker')).toHaveCount(4);
  await expect(page.locator('#procedimiento .tram-timeline li').first().locator('.tram-timeline-marker'))
    .toHaveCSS('width', '30px');
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(2);
});


test('auditoría editorial: otras listas de pasos verificables se presentan en el timeline', async ({ page }) => {
  for (const { id, cantidad, primero } of [
    { id: 'R009', cantidad: 4, primero: 'Asesoramiento' },
    { id: 'R010', cantidad: 7, primero: 'Se recepciona' },
    { id: 'R037', cantidad: 3, primero: 'Inicia en Direccion de obras particulares' },
    { id: 'R114', cantidad: 5, primero: 'Recepción de la persona solicitante' },
    { id: 'R115', cantidad: 5, primero: 'Recepción de la persona solicitante' },
    { id: 'R118', cantidad: 4, primero: 'Iniciamos radex' },
    { id: 'R131', cantidad: 3, primero: 'Ingreso del pedido' },
    { id: 'R133', cantidad: 4, primero: 'Recepcion del pedido de corte' },
  ]) {
    await page.goto('/tramites/' + id);
    const pasos = page.locator('#procedimiento .tram-timeline li');
    await expect(pasos, id + ': cantidad de pasos de ORIGEN').toHaveCount(cantidad);
    await expect(pasos.first(), id).toContainText(primero, { ignoreCase: true });
  }
  await page.goto('/tramites/R118');
  await expect(page.locator('#procedimiento .tram-procedure-note'))
    .toContainText('regularización migratoria');
});

test('documentación: sin archivos falsos cuando ORIGEN declara que no hay o no especifica', async ({ page }) => {
  for (const id of [
    'R124', 'R031', 'R043', 'R057', 'R058', 'R059', 'R060', 'R061',
    'R064', 'R070', 'R072', 'R035',
  ]) {
    await page.goto('/tramites/' + id);
    await expect(page.locator('#documentacion'), id + ': sin lista inventada').toHaveCount(0);
    await expect(page.locator('.tram-detail .tram-document-icon'), id).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Índice de la ficha' })
      .first().getByRole('link', { name: 'Documentación' }), id + ': índice condicional').toHaveCount(0);
  }
});


test('documentación condicional R051 y R116: conserva datos reales sin ícono de archivo falso', async ({ page }) => {
  await page.goto('/tramites/R051');
  await expect(page.locator('#documentacion .tram-document-note'))
    .toContainText('resumen de historia clinica');
  await expect(page.locator('#documentacion .tram-document-note'))
    .toContainText('ordenes medicas');
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(0);
  await page.goto('/tramites/R116');
  await expect(page.locator('#documentacion .tram-document-note'))
    .toContainText('La documentación necesaria se determina en función de cada caso específico');
  await expect(page.locator('#documentacion .tram-documents li')).toHaveCount(0);
});


test('documentación con viñetas y saltos de línea: no convierte continuaciones en documentos', async ({ page }) => {
  await page.goto('/tramites/R082');
  const documentosR082 = page.locator('#documentacion .tram-documents li');
  await expect(documentosR082).toHaveCount(7);
  await expect(documentosR082.last()).toContainText('especificando la fecha del cierre solicitado');
  await expect(documentosR082.last()).toContainText('aclaración del mismo');

  await page.goto('/tramites/R084');
  const documentosR084 = page.locator('#documentacion .tram-documents li');
  await expect(documentosR084).toHaveCount(11);
  await expect(documentosR084.nth(4)).toContainText('propietarios. (comprador)');
  await expect(page.locator('#documentacion .tram-document-note')).toHaveCount(0);
});
