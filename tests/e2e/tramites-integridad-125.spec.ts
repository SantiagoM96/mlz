import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Tramite } from '../../src/data/tramites';
import { bloquesProcedimiento, documentacionPublica } from '../../src/pages/tramites/tramites-format';

const tramites = JSON.parse(readFileSync(resolve('src/data/tramites.json'), 'utf8')) as Tramite[];

/**
 * Auditoría real de las 125 fichas públicas, no una prueba de un solo ejemplo.
 * Se ejecuta en desktop y 390px; mantiene viable el tiempo de ejecución en CI.
 */
test('auditoría integral: 125 fichas conservan identidad, bloques y contenido documental', async ({ page }, info) => {
  test.skip(!['desktop-1415', 'mobile-390'].includes(info.project.name),
    'Los 125 registros ya se comprueban en desktop y móvil 390 px');
  test.setTimeout(360_000);
  expect(tramites).toHaveLength(125);
  await page.route('https://www.google.com/maps/**', route => route.abort());
  const ids = new Set<string>();
  const reporte = {
    registros: tramites.length,
    conDocumentacion: 0,
    sinDocumentacionPublica: 0,
    conTimeline: 0,
    conTextoDescriptivo: 0,
    sinProcedimiento: 0,
    conListaNoNumerada: 0,
    verificados: [] as string[],
  };

  for (const registro of tramites) {
    expect(ids.has(registro.id), 'ID duplicado ' + registro.id).toBe(false);
    ids.add(registro.id);
    const documentos = documentacionPublica(registro);
    const bloques = bloquesProcedimiento(registro);
    const cantidadPasos = bloques.filter(b => b.tipo === 'pasos')
      .reduce((total, bloque) => total + (bloque.tipo === 'pasos' ? bloque.items.length : 0), 0);
    const cantidadListas = bloques.filter(b => b.tipo === 'lista')
      .reduce((total, bloque) => total + (bloque.tipo === 'lista' ? bloque.items.length : 0), 0);
    const cantidadTextos = bloques.filter(b => b.tipo === 'texto').length;

    await page.goto('/tramites/' + registro.id, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.tram-detail h1'), registro.id + ': título editorial')
      .toHaveText(registro.titulo);
    await expect(page.locator('#documentacion .tram-documents li'),
      registro.id + ': cantidad de documentos públicos')
      .toHaveCount(documentos.length);
    await expect(page.locator('#documentacion'), registro.id + ': bloque de documentación')
      .toHaveCount(documentos.length ? 1 : 0);
    await expect(page.locator('#documentacion .tram-document-intro'),
      registro.id + ': sin frase genérica').toHaveCount(0);
    await expect(page.locator('#procedimiento'), registro.id + ': bloque condicional')
      .toHaveCount(bloques.length ? 1 : 0);
    await expect(page.locator('#procedimiento .tram-timeline li'), registro.id + ': pasos reales')
      .toHaveCount(cantidadPasos);
    await expect(page.locator('#procedimiento .tram-procedure-list li'), registro.id + ': lista de origen')
      .toHaveCount(cantidadListas);
    await expect(page.locator('#procedimiento .tram-procedure-note'), registro.id + ': notas')
      .toHaveCount(cantidadTextos);
    await expect(page.locator('.tram-detail .tram-start-link'), registro.id + ': sin CTA genérico')
      .toHaveCount(0);

    if (info.project.name === 'mobile-390') {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, registro.id + ': desborde horizontal 390px').toBeLessThanOrEqual(2);
    }

    if (documentos.length) reporte.conDocumentacion++;
    else reporte.sinDocumentacionPublica++;
    if (cantidadPasos) reporte.conTimeline++;
    if (cantidadListas) reporte.conListaNoNumerada++;
    if (cantidadTextos) reporte.conTextoDescriptivo++;
    if (!bloques.length) reporte.sinProcedimiento++;
    reporte.verificados.push(registro.id);
  }

  expect(ids.size).toBe(125);
  await info.attach('auditoria-125-fichas.json', {
    body: Buffer.from(JSON.stringify(reporte, null, 2), 'utf8'),
    contentType: 'application/json',
  });
});
