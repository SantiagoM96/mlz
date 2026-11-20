/**
 * Compila exclusivamente los CSV exportados de GUIA DE TRÁMITES - BASE FINAL.
 * No consulta Google Sheets desde el navegador ni usa RESPUESTAS FINALES.xlsx.
 *
 * Uso:
 * node scripts/generate-tramites-from-base-final.mjs <catalogo.csv> <base-nueva.csv> <origen.csv> [--check]
 *
 * Las tres exportaciones provienen del mismo spreadsheet y deben conservar
 * las columnas originales. No se publican hojas completas, contactos internos
 * ni credenciales.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseCsv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(value); value = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(value); value = '';
      if (row.some(v => v.trim())) rows.push(row);
      row = [];
    } else value += ch;
  }
  row.push(value);
  if (row.some(v => v.trim())) rows.push(row);
  assert.ok(!quoted, 'CSV inválido: comillas sin cerrar');
  return rows;
}

function safeText(value) {
  return String(value ?? '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
    .replace(/(?<!\d)(?:\+?54[\s-]?)?(?:11|0?800)[\s-]?\d(?:[\s-]?\d){7,12}(?!\d)/g, '')
    .replace(/\[contacto reservado\]/gi, '')
    .replace(/\s+([,;])/g, '$1')
    .replace(/[,;]\s*$/, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
function publicUrls(value) {
  return (String(value ?? '').match(/https?:\/\/[^\s<>"'()]+/gi) ?? [])
    .map(link => link.replace(/[),;.]+$/, ''))
    .filter(link => !/(?:docs|drive)\.google\.com/i.test(link));
}
function load(path, header, expectedRows) {
  const rows = parseCsv(readFileSync(resolve(path), 'utf8'));
  assert.equal(rows[0]?.[0], header, 'CSV incorrecto: ' + path);
  assert.equal(rows.length - 1, expectedRows, 'Cantidad inesperada en ' + path);
  return rows;
}

const [catalogPath, basePath, originPath, flag] = process.argv.slice(2);
if (!catalogPath || !basePath || !originPath || (flag && flag !== '--check')) {
  console.error('Uso: node scripts/generate-tramites-from-base-final.mjs catalogo.csv base-nueva.csv origen.csv [--check]');
  process.exitCode = 2;
} else {
  const catalog = load(catalogPath, 'ID origen', 125);
  const base = load(basePath, 'ID de origen', 133);
  const origin = load(originPath, 'Marca temporal', 133);
  assert.equal(catalog[0][2], 'Nombre público (Figma)');
  assert.equal(catalog[0][19], 'Destinatarios para filtro');
  assert.equal(origin[0][44], 'Describí brevemente cuál es la documentación requerida para iniciar el trámite');
  const baseMap = new Map(base.slice(1).map(row => [row[0], row]));
  const seen = new Set();
  const data = catalog.slice(1).map(c => {
    const id = c[0], rowNumber = Number(c[15]);
    assert.match(id, /^R\d{3}$/);
    assert.ok(!seen.has(id), 'ID duplicado: ' + id);
    seen.add(id);
    const b = baseMap.get(id);
    assert.ok(b && Number(b[1]) === rowNumber, 'Correspondencia editorial/origen inválida: ' + id);
    const o = origin[rowNumber - 1];
    assert.ok(o?.[9], 'No existe registro de origen para ' + id);
    // Difieren algunas convenciones de espacios y mayúsculas en los títulos
    // técnicos; por eso el título público siempre se obtiene de CATALOGO.
    const f = i => safeText(o[i]);
    const first = { lugar: f(16), dias: f(17), turno: f(18) };
    const second = { lugar: f(24), dias: f(25), turno: f(26) };
    const primary = Object.values(first).some(Boolean) ? first : second;
    const secondary = Object.values(first).some(Boolean) && Object.values(second).some(Boolean) ? second : null;
    const links = [...new Set([19, 27, 65].flatMap(i => publicUrls(o[i])))];
    const normativeLinks = publicUrls(o[62]);
    const item = {
      id,
      categoria: safeText(c[1]),
      titulo: safeText(c[2]),
      descripcion: safeText(c[3]),
      modalidad: safeText(c[4]),
      etiquetas: [c[5], c[6]].map(safeText).filter(Boolean),
      destinatarios: String(c[19] ?? '').split(';').map(safeText).filter(Boolean),
      sinonimos: safeText(c[9]),
      requisitos: f(43),
      documentacion: f(44),
      pasos: f(55),
      direccion: id === 'R036' ? primary.lugar.replace(/\s+(?:prsencial|presencial) o via mail.*$/i, '').trim() : primary.lugar,
      horarios: primary.dias,
      turno: primary.turno,
      comoIniciar: f(31),
      costo: f(37),
      monto: f(38),
      pago: f(39),
      plazo: f(52),
      normativa: f(61),
      web: links[0] ?? '',
      estado: safeText(c[17]),
      filaOrigen: rowNumber,
      canales: f(32),
      formatoDocumentacion: f(45),
      exenciones: f(41),
      detalleExenciones: f(42),
      normativaUrl: normativeLinks[0] ?? '',
      ...(secondary ? { sedeAlternativa: secondary } : {}),
      ...(links.length > 1 ? { otrosEnlaces: links.slice(1) } : {}),
    };
    assert.ok(item.titulo && item.descripcion && item.categoria, id + ': información pública faltante');
    assert.ok(!/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/i.test(JSON.stringify(item)), id + ': posible correo personal');
    return item;
  });
  assert.equal(data.length, 125);
  const target = resolve('src/data/tramites.json');
  const next = JSON.stringify(data, null, 2) + '\n';
  if (flag === '--check') {
    assert.equal(readFileSync(target, 'utf8'), next, 'Snapshot desactualizado: ejecutar generación desde exportaciones vigentes');
    console.log('OK: snapshot 125/125 idéntico a las exportaciones de BASE FINAL.');
  } else {
    writeFileSync(target, next, 'utf8');
    console.log('Generados ' + data.length + ' trámites desde BASE FINAL (sin contactos privados).');
  }
}
