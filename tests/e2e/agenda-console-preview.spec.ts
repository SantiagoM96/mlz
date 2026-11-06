import { expect, test } from '@playwright/test';

const route = '/agenda-de-la-comunidad/consola-preview';

test('consola demostrativa: muestra formulario y actualiza la tarjeta en vivo', async ({ page }, info) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Nueva actividad' })).toBeVisible();
  const isMobile = (info.project.use.viewport?.width ?? 0) < 1024;
  const title = page.getByLabel('Título');
  await title.fill('Jornada de reciclaje');

  if (isMobile) {
    await expect(page.getByTestId('console-preview-card')).toBeHidden();
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }

  const card = page.getByTestId('console-preview-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Jornada de reciclaje');
  await expect(card).toContainText('Todos los sábados');
  await expect(card).toContainText('Del 7 al 28 de noviembre');
  await expect(card).toContainText('10:00 a 12:00 h');

  if (isMobile) {
    await page.getByRole('button', { name: 'Volver al formulario' }).click();
    await expect(page.getByLabel('Título')).toHaveValue('Jornada de reciclaje');
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Consola Agenda V2: tabla compacta, modal y guardado independiente por programación', async ({ page }, info) => {
  await page.goto(route);
  await expect(page.getByTestId('console-schedules-table')).toBeVisible();
  const rows = page.getByTestId('console-schedule-row');
  await expect(rows).toHaveCount(1);
  await expect(page.getByRole('checkbox', { name: 'Se suspende por lluvia' })).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Modalidad', exact: true }).selectOption('in-person');
  await expect(page.getByLabel('Enlace de inscripción')).toHaveCount(0);
  await expect(page.getByLabel('Información de inscripción', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Editar programación 1' }).click();
  const modal = page.getByTestId('console-schedule-editor');
  await expect(modal.getByRole('heading', { name: 'Editar programación' })).toBeVisible();
  await expect(modal.getByRole('checkbox', { name: 'Se suspende por lluvia' })).not.toBeChecked();
  await modal.getByRole('combobox', { name: 'Tipo de fecha' }).selectOption('exact');
  await expect(modal.getByLabel('Hasta')).toHaveCount(0);
  await modal.getByLabel('Fecha', { exact: true }).fill('2026-11-22');
  await modal.getByRole('combobox', { name: 'Participantes (tipo)' }).selectOption('speakers');
  await modal.getByLabel('Artistas, oradores o participantes (opcional)').fill('María Gómez y Juan Pérez');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal).toHaveCount(0);
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Domingo 22 de noviembre');

  await page.getByRole('button', { name: 'Duplicar programación 1' }).click();
  await expect(rows).toHaveCount(2);
  await page.getByRole('button', { name: 'Eliminar programación 2' }).click();
  await expect(rows).toHaveCount(1);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  const addModal = page.getByTestId('console-schedule-editor');
  await expect(addModal.getByRole('heading', { name: 'Agregar programación' })).toBeVisible();
  await addModal.getByLabel('Fecha', { exact: true }).fill('2026-11-29');
  await addModal.getByLabel('Horario de inicio').fill('13:00');
  await addModal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(rows).toHaveCount(2);

  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const cards = page.getByTestId('console-preview-card');
  await expect(cards.first()).toContainText('María Gómez y Juan Pérez');
  await cards.first().getByRole('button', { name: 'Ver más' }).click();
  const detail = page.getByTestId('console-detail-preview');
  await expect(detail).toContainText('María Gómez y Juan Pérez');
  await expect(detail.locator('[data-material-symbol="record_voice_over"]')).toHaveCount(1);
  await detail.getByRole('button', { name: 'Cerrar vista previa del detalle' }).click();
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Formulario', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Guardar actividad' })).toBeDisabled();
  await expect(page.getByText('Esta es una demostración. No se guardó ni publicó ninguna actividad.')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('consola demostrativa: captura de pantalla responsive', async ({ page }, info) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Nueva actividad' })).toBeVisible();
  if ((info.project.use.viewport?.width ?? 0) < 1024) {
    await page.getByRole('button', { name: 'Vista previa', exact: true }).click();
  }
  const shot = info.outputPath('consola-preview-' + info.project.name + '.png');
  await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });
  await info.attach('consola-preview-' + info.project.name, { path: shot, contentType: 'image/png' });
});
