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
  const duplicateModal = page.getByTestId('console-schedule-editor');
  await expect(duplicateModal.getByRole('heading', { name: 'Duplicar programación' })).toBeVisible();
  await expect(rows).toHaveCount(1); // La copia no se crea hasta confirmar.
  await duplicateModal.getByRole('button', { name: 'Crear copia' }).click();
  await expect(duplicateModal.getByRole('alert')).toContainText('Ya existe una programación idéntica');
  await duplicateModal.getByLabel('Fecha', { exact: true }).fill('2026-11-23');
  await duplicateModal.getByRole('button', { name: 'Crear copia' }).click();
  await expect(duplicateModal).toHaveCount(0);
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

test('Consola: tipos nuevos según categoría fija y lugares reutilizables', async ({ page }) => {
  await page.goto(route);
  const category = page.getByLabel('Categoría', { exact: true });
  const type = page.getByLabel('Tipo de actividad', { exact: true });
  await expect(category.locator('option')).toHaveCount(3);
  await category.selectOption('Cultural');
  await expect(type).toHaveValue('Teatro');

  await page.getByRole('button', { name: 'Agregar tipo de actividad' }).click();
  const typeDialog = page.getByTestId('console-type-editor');
  await typeDialog.getByLabel('Nombre del nuevo tipo').fill('Seminario');
  await typeDialog.getByRole('button', { name: 'Guardar tipo' }).click();
  await expect(typeDialog).toHaveCount(0);
  await expect(type).toHaveValue('Seminario');
  await expect(type.locator('option', { hasText: 'Seminario' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Agregar tipo de actividad' }).click();
  await typeDialog.getByLabel('Nombre del nuevo tipo').fill('seminario');
  await typeDialog.getByRole('button', { name: 'Guardar tipo' }).click();
  await expect(typeDialog.getByRole('alert')).toContainText('ya existe');
  await typeDialog.getByRole('button', { name: 'Cancelar' }).click();

  await page.getByRole('button', { name: 'Editar programación 1' }).click();
  const modal = page.getByTestId('console-schedule-editor');
  await modal.getByRole('button', { name: 'Agregar nuevo lugar' }).click();
  const venuePanel = modal.getByTestId('console-new-venue');
  await venuePanel.getByLabel('Nombre del lugar').fill('Centro Cultural Banfield');
  await venuePanel.getByLabel('Localidad').fill('Banfield');
  await venuePanel.getByLabel('Dirección').fill('Maipú 123');
  await venuePanel.getByRole('button', { name: 'Guardar lugar' }).click();
  await expect(venuePanel).toHaveCount(0);
  await expect(modal.getByLabel('Lugar')).toContainText('Centro Cultural Banfield');
  await expect(modal).toContainText('Maipú 123');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(page.getByTestId('console-schedules-table')).toContainText('Centro Cultural Banfield');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  const newModal = page.getByTestId('console-schedule-editor');
  await expect(newModal.getByLabel('Lugar')).toContainText('Centro Cultural Banfield');
  await newModal.getByRole('button', { name: 'Cancelar' }).click();
});

test('Consola: validaciones esenciales y barra de acciones fija dentro del modal', async ({ page }) => {
  await page.goto(route);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  const modal = page.getByTestId('console-schedule-editor');
  const footer = modal.locator('footer');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal.getByRole('alert')).toContainText('Completá la fecha y el horario de inicio');

  await modal.getByRole('combobox', { name: 'Tipo de fecha' }).selectOption('range');
  await modal.getByLabel('Desde').fill('2026-11-20');
  await modal.getByLabel('Hasta').fill('2026-11-18');
  await modal.getByLabel('Horario de inicio').fill('11:00');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal.getByRole('alert')).toContainText('La fecha de fin debe ser igual o posterior');
  await modal.getByLabel('Hasta').fill('2026-11-21');
  await modal.getByLabel('Horario de fin (opcional)').fill('10:00');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal.getByRole('alert')).toContainText('El horario de fin debe ser posterior');
  await modal.getByRole('combobox', { name: 'Tipo de fecha' }).selectOption('recurring');
  await modal.getByRole('button', { name: 'Todos los Sáb' }).click();
  await modal.getByLabel('Horario de fin (opcional)').fill('12:00');
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal.getByRole('alert')).toContainText('Seleccioná al menos un día');
  await modal.getByRole('button', { name: 'Todos los Mar' }).click();

  await page.setViewportSize({ width: 390, height: 600 });
  await expect(footer).toBeVisible();
  const positionBefore = await footer.evaluate(el => el.getBoundingClientRect().bottom);
  const form = modal.getByRole('form', { name: 'Formulario de programación' });
  await form.evaluate(el => { el.scrollTop = el.scrollHeight; });
  const positionAfter = await footer.evaluate(el => el.getBoundingClientRect().bottom);
  expect(Math.abs(positionAfter - positionBefore)).toBeLessThanOrEqual(2);
  await modal.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByTestId('console-schedule-row')).toHaveCount(2);
});

test('Consola: portada y galería permiten reemplazar y eliminar imágenes', async ({ page }) => {
  await page.goto(route);
  const png = { name: 'prueba.png', mimeType: 'image/png', buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/fQcAAAAASUVORK5CYII=', 'base64') };
  await page.getByLabel('Agregar portada').setInputFiles(png);
  await expect(page.getByRole('button', { name: 'Eliminar Portada' })).toBeVisible();
  await expect(page.getByAltText('Portada seleccionada')).toBeVisible();
  await page.getByLabel('Agregar foto adicional 1').setInputFiles(png);
  await expect(page.getByRole('button', { name: 'Eliminar Foto adicional 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar Portada' }).click();
  await expect(page.getByAltText('Portada seleccionada')).toHaveCount(0);
  await page.getByRole('button', { name: 'Eliminar Foto adicional 1' }).click();
  await expect(page.getByRole('button', { name: 'Eliminar Foto adicional 1' })).toHaveCount(0);
});

test('Consola desktop: la vista previa acompaña el scroll sin superar el formulario', async ({ page }, info) => {
  if ((info.project.use.viewport?.width ?? 0) < 1024) return;
  await page.setViewportSize({ width: 1415, height: 620 });
  await page.goto(route);
  const sticky = page.getByTestId('console-preview-sticky');
  await expect(sticky).toHaveCSS('position', 'sticky');
  const form = page.getByRole('form', { name: 'Formulario de nueva actividad' });
  const start = await sticky.evaluate(el => el.getBoundingClientRect().top);
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(async () => sticky.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(24);
  expect(start).toBeGreaterThan(24);
  const formBottom = await form.evaluate(el => el.getBoundingClientRect().bottom);
  const asideBottom = await sticky.evaluate(el => el.getBoundingClientRect().bottom);
  expect(asideBottom).toBeLessThanOrEqual(Math.max(formBottom, 620));
});

test('Consola: al cambiar de caso reinicia las programaciones y el editor no arrastra valores', async ({ page }) => {
  await page.goto(route + '?caso=preview-v2-folklore');
  const rows = page.getByTestId('console-schedule-row');
  await expect(rows).toHaveCount(2);

  await page.getByRole('button', { name: 'Editar programación 1' }).click();
  const editor = page.getByTestId('console-schedule-editor');
  await expect(editor).toBeVisible();
  await editor.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(editor).toHaveCount(0);

  await page.getByLabel('Casos de demostración').selectOption('preview-v2-reciclaje');
  await expect(page.getByLabel('Título')).toHaveValue('Jornada de reciclaje');
  await expect(rows).toHaveCount(1);
  await expect(page).toHaveURL(/caso=preview-v2-reciclaje/);

  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(editor.getByRole('heading', { name: 'Agregar programación' })).toBeVisible();
  await expect(editor.getByLabel('Fecha', { exact: true })).toHaveValue('');
  await editor.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(rows).toHaveCount(1);
});

test('Consola: normalización y duplicados al crear un lugar se validan dentro del modal', async ({ page }) => {
  await page.goto(route);
  await page.getByRole('button', { name: 'Editar programación 1' }).click();
  const editor = page.getByTestId('console-schedule-editor');
  await editor.getByRole('button', { name: 'Agregar nuevo lugar' }).click();
  const venuePanel = editor.getByTestId('console-new-venue');

  await venuePanel.getByRole('button', { name: 'Guardar lugar' }).click();
  await expect(venuePanel.getByRole('alert')).toHaveText('Completá nombre, localidad y dirección para guardar la sede.');

  await venuePanel.getByLabel('Nombre del lugar').fill('  plaza grigera  ');
  await venuePanel.getByLabel('Localidad').fill('lomas de zamora');
  await venuePanel.getByLabel('Dirección').fill('Calle de prueba');
  await venuePanel.getByRole('button', { name: 'Guardar lugar' }).click();
  await expect(venuePanel.getByRole('alert')).toHaveText('Esta sede ya está registrada. Seleccionala en la lista.');

  await venuePanel.getByLabel('Nombre del lugar').fill('  Centro   Cultural   de Prueba ');
  await venuePanel.getByRole('button', { name: 'Guardar lugar' }).click();
  await expect(venuePanel).toHaveCount(0);
  await expect(editor.getByLabel('Lugar')).toHaveValue(/nueva-sede-/);
  await expect(editor.getByLabel('Lugar')).toContainText('Centro Cultural de Prueba');
  await expect(editor).toContainText('Calle de prueba');
  await editor.getByRole('button', { name: 'Guardar programación' }).click();
  await expect(page.getByTestId('console-schedules-table')).toContainText('Centro Cultural de Prueba');
});
