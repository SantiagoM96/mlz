import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tramites = JSON.parse(readFileSync(resolve('src/data/tramites.json'), 'utf8'));
const idPattern = /^R\d{3}$/;
const ids = new Set();
const categories = new Set();
const audiences = new Set();

assert.equal(tramites.length, 125, 'La base editorial selecciona exactamente 125 trámites');
for (const [index, item] of tramites.entries()) {
  assert.match(item.id, idPattern, 'ID inválido en índice ' + index);
  assert.ok(!ids.has(item.id), 'ID duplicado: ' + item.id);
  ids.add(item.id);
  for (const key of ['categoria', 'titulo', 'descripcion', 'modalidad']) {
    assert.equal(typeof item[key], 'string', item.id + ': ' + key);
    assert.ok(item[key].trim(), item.id + ': campo editorial vacío ' + key);
  }
  for (const key of ['etiquetas', 'destinatarios']) {
    assert.ok(Array.isArray(item[key]), item.id + ': ' + key);
    assert.ok(item[key].every(value => typeof value === 'string' && value.trim()), item.id + ': valores vacíos en ' + key);
  }
  for (const key of ['requisitos', 'documentacion', 'pasos', 'direccion', 'horarios', 'turno', 'comoIniciar', 'costo', 'monto', 'pago', 'plazo', 'normativa', 'web', 'sinonimos', 'estado']) {
    assert.equal(typeof item[key], 'string', item.id + ': ' + key);
  }
  if (item.web) assert.match(item.web, /^https?:\/\/\S+$/i, item.id + ': enlace no HTTP(S)');
  categories.add(item.categoria);
  item.destinatarios.forEach(value => audiences.add(value));
}
assert.ok(ids.has('R036'), 'Falta la ficha de referencia R036');
assert.ok(categories.size > 0 && audiences.size > 0, 'No hay categorías/destinatarios');
console.log('OK: ' + tramites.length + ' trámites; ' + ids.size + ' IDs únicos; ' +
  categories.size + ' categorías editoriales; ' + audiences.size + ' destinatarios.');

// Contraste opcional con la exportación vigente de CATALOGO DE TRÁMITES:
// node scripts/validate-tramites-editorial.mjs /ruta/catalogo.csv
// La exportación debe proceder de GUIA DE TRÁMITES - BASE FINAL, no de RESPUESTAS FINALES.
if (process.argv[2]) {
  const source = readFileSync(resolve(process.argv[2]), 'utf8').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value); value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(value); value = ''; if (row.some(cell => cell.trim())) rows.push(row); row = [];
    } else value += char;
  }
  row.push(value); if (row.some(cell => cell.trim())) rows.push(row);
  assert.ok(!quoted, 'CSV con comillas sin cerrar');
  const header = rows.shift();
  assert.equal(header?.[0], 'ID origen', 'No es un CSV del catálogo editorial autorizado');
  assert.equal(header?.[2], 'Nombre público (Figma)', 'Cabeceras de catálogo inesperadas');
  const catalog = rows.filter(item => idPattern.test(item[0] || ''));
  assert.equal(catalog.length, tramites.length, 'Cantidad distinta de registros en catálogo fuente');
  for (const sourceRow of catalog) {
    const actual = tramites.find(item => item.id === sourceRow[0]);
    assert.ok(actual, 'No existe ' + sourceRow[0]);
    for (const [position, field] of [[1, 'categoria'], [2, 'titulo'], [3, 'descripcion'], [4, 'modalidad'], [9, 'sinonimos']]) {
      assert.equal(actual[field], sourceRow[position] || '', actual.id + ': difiere ' + field);
    }
    assert.deepEqual(actual.etiquetas, [sourceRow[5], sourceRow[6]].filter(Boolean), actual.id + ': difieren etiquetas');
    assert.deepEqual(actual.destinatarios, (sourceRow[19] || '').split(';').map(text => text.trim()).filter(Boolean), actual.id + ': difieren destinatarios');
  }
  console.log('OK: catálogo público sincronizado con exportación editorial autorizada.');
}
