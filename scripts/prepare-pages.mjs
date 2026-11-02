import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const staticPaths = ['jovenes-en-comunidad', 'agenda-de-la-comunidad'];
for (const route of staticPaths) {
  const directory = join(dist, route);
  mkdirSync(directory, { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(directory, 'index.html'));
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
console.log('Rutas estáticas de GitHub Pages preparadas:', staticPaths.join(', '));
