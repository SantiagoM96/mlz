import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');

// Vite publica los prototipos de public/: /bae/, /cronica/ y /prototipos/.
const baeSource = join(process.cwd(), 'public', 'bae', 'index.html');
if (!existsSync(baeSource)) {
  throw new Error('Missing BAE standalone editor: public/bae/index.html');
}
mkdirSync(join(dist, 'bae'), { recursive: true });
copyFileSync(baeSource, join(dist, 'bae', 'index.html'));

for (const asset of ['halftone-editable.svg', 'halftone-2.svg', 'bae-negocios-logo.svg']) {
  const source = join(process.cwd(), 'public', 'bae', asset);
  if (!existsSync(source)) throw new Error('Missing BAE asset: ' + asset);
  copyFileSync(source, join(dist, 'bae', asset));
}

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
console.log('Prototipos estáticos preservados; Agenda y Jóvenes fuera de esta publicación.');
