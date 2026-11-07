import { expect, test, type Page } from '@playwright/test';


/**
 * Estas capturas NO se generan desde el código probado.
 * El workflow primero crea snapshots desde el commit base de main y luego
 * ejecuta la misma especificación contra el PR, con los mismos recursos.
 * Son una referencia técnica comparativa, no un baseline editorial aprobado.
 */
const route = '/agenda-de-la-comunidad/consola-preview';
// IDs editoriales públicos, sin importar módulos Vite dentro de Node/Playwright.
const cases = [
  { id: '', label: 'inicial' },
  ...[
    'preview-v2-reciclaje',
    'preview-v2-muestra',
    'preview-v2-compostaje',
    'preview-v2-futbol',
    'preview-v2-folklore',
    'preview-v2-huerta',
    'preview-v2-itinerante',
  ].map(id => ({ id, label: id })),
];

const screenshotOptions = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  fullPage: true,
  // Equivale a permitir hasta 0,05 % de píxeles distintos.
  // Evita aprobar cambios visuales notorios sin bajar a tolerancias arbitrarias.
  maxDiffPixelRatio: 0.0005,
};

async function readyForCapture(page: Page) {
  await expect(page.getByRole('heading', { name: 'Nueva actividad', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    // No esperar `decode()` sobre imágenes ocultas/lazy aún no solicitadas:
    // en mobile la tarjeta de la vista previa puede permanecer fuera del DOM visible.
    await Promise.all(Array.from(document.images)
      .filter(image => image.complete && image.naturalWidth > 0)
      .map(image => image.decode().catch(() => undefined)));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

for (const sample of cases) {
  test('paridad consola - formulario y tarjetas - ' + sample.label, async ({ page }, info) => {
    await page.goto(route + (sample.id ? '?caso=' + encodeURIComponent(sample.id) : ''));
    await readyForCapture(page);

    await expect(page).toHaveScreenshot(sample.label + '-formulario.png', screenshotOptions);

    if ((info.project.use.viewport?.width ?? 0) < 1024) {
      await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
    }
    await expect(page.getByTestId('console-preview-card').first()).toBeVisible();
    await readyForCapture(page);
    await expect(page).toHaveScreenshot(sample.label + '-tarjetas.png', screenshotOptions);
  });
}

test('paridad consola - edición y creación de lugar', async ({ page }) => {
  await page.goto(route);
  await readyForCapture(page);
  await page.getByRole('button', { name: 'Editar programación 1' }).click();
  const editor = page.getByTestId('console-schedule-editor');
  await expect(editor.getByRole('heading', { name: 'Editar programación' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('modal-editar-programacion.png', screenshotOptions);

  await editor.getByRole('button', { name: 'Agregar nuevo lugar' }).click();
  await expect(editor.getByTestId('console-new-venue')).toBeVisible();
  await expect(page).toHaveScreenshot('modal-agregar-lugar.png', screenshotOptions);
});

test('paridad consola - agregar tipo', async ({ page }) => {
  await page.goto(route);
  await readyForCapture(page);
  await page.getByRole('button', { name: 'Agregar tipo de actividad' }).click();
  await expect(page.getByTestId('console-type-editor')).toBeVisible();
  await expect(page).toHaveScreenshot('modal-agregar-tipo.png', screenshotOptions);
});

test('paridad consola - ficha de vista previa', async ({ page }, info) => {
  await page.goto(route + '?caso=preview-v2-yoga-dos-sedes');
  await readyForCapture(page);
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  await page.getByTestId('console-preview-card').first().getByRole('button', { name: 'Ver más' }).click();
  await expect(page.getByTestId('console-detail-preview')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    // No esperar `decode()` sobre imágenes ocultas/lazy aún no solicitadas:
    // en mobile la tarjeta de la vista previa puede permanecer fuera del DOM visible.
    await Promise.all(Array.from(document.images)
      .filter(image => image.complete && image.naturalWidth > 0)
      .map(image => image.decode().catch(() => undefined)));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await expect(page).toHaveScreenshot('modal-detalle-yoga.png', screenshotOptions);
});
