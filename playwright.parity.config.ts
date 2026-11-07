import { defineConfig } from '@playwright/test';
import generalConfig from './playwright.config';

/**
 * La comparación main vs PR tiene una referencia de imágenes temporal.
 * Se ejecuta en un conjunto de tests separado para no contaminar el E2E habitual.
 */
export default defineConfig({
  ...generalConfig,
  testDir: './tests/visual-parity',
});
