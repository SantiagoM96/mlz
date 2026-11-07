import { expect, test } from '@playwright/test';
import {
  formatActivityAddress,
  formatActivityCardAddress,
} from '../../src/features/agenda/utils/formatActivityAddress';

test.describe('Agenda V2 — presentación de direcciones', () => {
  test('separa calle y localidad cuando la fuente utiliza coma', () => {
    const address = 'Maipú 123, Banfield';
    expect(formatActivityAddress(address, 'Lomas de Zamora')).toBe('Maipú N° 123 - Banfield');
    expect(formatActivityCardAddress(address, 'Lomas de Zamora')).toBe('Maipú 123 · Banfield');
  });

  test('reconoce el separador con guion sin alterar los formatos de salida', () => {
    const address = 'Maipú 123 - Banfield';
    expect(formatActivityAddress(address, 'Temperley')).toBe('Maipú N° 123 - Banfield');
    expect(formatActivityCardAddress(address, 'Temperley')).toBe('Maipú 123 · Banfield');
  });

  test('utiliza la localidad de la actividad si no figura en la dirección', () => {
    expect(formatActivityAddress('Calle 123', 'Temperley')).toBe('Calle N° 123 - Temperley');
    expect(formatActivityCardAddress('Calle 123', 'Temperley')).toBe('Calle 123 · Temperley');
  });

  test('respeta numeración explícita y letras de altura en la ficha', () => {
    expect(formatActivityAddress('Av. Siempre Viva N° 742', 'Lomas de Zamora'))
      .toBe('Av. Siempre Viva N° 742 - Lomas de Zamora');
    expect(formatActivityAddress('Pasaje 12B, Banfield', 'Temperley'))
      .toBe('Pasaje N° 12B - Banfield');
    expect(formatActivityCardAddress('Pasaje 12B, Banfield', 'Temperley'))
      .toBe('Pasaje 12B · Banfield');
  });

  test('conserva el fallback cuando falta la dirección, sin inferir una calle', () => {
    for (const address of [undefined, '', '   ']) {
      expect(formatActivityAddress(address, 'Banfield')).toBe('Dirección a confirmar');
      expect(formatActivityCardAddress(address, 'Banfield')).toBe('Dirección a confirmar');
    }
  });

  test('preserva la salida sin localidad cuando ambas fuentes están vacías', () => {
    expect(formatActivityAddress('Maipú 123', ' ')).toBe('Maipú N° 123');
    expect(formatActivityCardAddress('Maipú 123', ' ')).toBe('Maipú 123');
  });
});
