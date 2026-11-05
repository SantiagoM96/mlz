import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const dist = join(process.cwd(), 'dist');
const staticPaths = [
  'jovenes-en-comunidad',
  'agenda-de-la-comunidad',
  'agenda-de-la-comunidad/actividades',
  'agenda-de-la-comunidad/actividades/tita-y-rhodesia',
  ...Array.from({ length: 18 }, (_, i) => `agenda-de-la-comunidad/actividades/actividad-${i + 1}`),
];
for (const route of staticPaths) {
  const directory = join(dist, route);
  mkdirSync(directory, { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(directory, 'index.html'));
}
// BAE is a standalone HTML editor, not a React route. Publish its own index explicitly.
const baeSource = join(process.cwd(), 'public', 'bae', 'index.html');
if (!existsSync(baeSource)) throw new Error('Missing BAE standalone editor: public/bae/index.html');
mkdirSync(join(dist, 'bae'), { recursive: true });
copyFileSync(baeSource, join(dist, 'bae', 'index.html'));
const halftoneSource = join(process.cwd(), 'public', 'bae', 'halftone-editable.svg');
if (!existsSync(halftoneSource)) throw new Error('Missing BAE halftone SVG');
copyFileSync(halftoneSource, join(dist, 'bae', 'halftone-editable.svg'));
const baeLogoSource = join(process.cwd(), 'public', 'bae', 'bae-negocios-logo.svg');
if (!existsSync(baeLogoSource)) throw new Error('Missing BAE logo SVG');
copyFileSync(baeLogoSource, join(dist, 'bae', 'bae-negocios-logo.svg'));
console.log('BAE editor and halftone SVG published');
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
console.log('Rutas estáticas preparadas en GitHub Pages:', staticPaths.length);
