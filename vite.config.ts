import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const revision = process.env.GITHUB_SHA || (() => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return ''; }
})();
const builtAt = new Date().toISOString();

const editorialMobileSource = '/src/features/editorial/mobile/main.tsx';
const editorialMobileEntry = 'editorial-mobile';
const editorialMobileAsset = '/assets/editorial-mobile.js';
const editorBrands = ['cronica', 'bae', 'diarioshow'];

function readEditorialHtml(fileName: string) {
  const html = readFileSync(new URL(`./public/${fileName}`, import.meta.url), 'utf8');
  const time = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(builtAt));
  const version = /^[a-f0-9]{40}$/i.test(revision) ? revision.slice(-3).toUpperCase() : 'DEV';
  const badge = `<span class="editorial-build-badge"><strong aria-label="Versión ${version}">${version}</strong><span aria-hidden="true">·</span><time datetime="${builtAt}" aria-label="Última actualización a las ${time}, hora argentina">${time}</time></span>`;
  return html.replace('<!-- editorial-build-badge -->', badge);
}

function editorialDevRoutes(): Plugin {
  return {
    name: 'editorial-dev-routes',
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (item) => item.type === 'chunk' && item.isEntry && item.name === editorialMobileEntry,
      );
      if (!entry) this.error('Missing editorial mobile entry');
      for (const route of editorBrands.flatMap((brand) => [brand, brand + '-dev'])) {
        const fileName = `${route}/index.html`;
        const html = readEditorialHtml(fileName);
        this.emitFile({
          type: 'asset',
          fileName,
          source: html.replace(`..${editorialMobileAsset}`, `../${entry.fileName}`),
        });
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        const path = url.split('?')[0];
        if (path === editorialMobileAsset) {
          req.url = url.replace(path, editorialMobileSource);
        } else if (req.method === 'GET' && path && /^\/(cronica|bae|diarioshow)(-dev)?\/(index\.html)?$/.test(path)) {
          const fileName = path.endsWith('/') ? path.slice(1) + 'index.html' : path.slice(1);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readEditorialHtml(fileName));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/mlz/' : '/',
  plugins: [react(), tailwindcss(), editorialDevRoutes()],
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        [editorialMobileEntry]: fileURLToPath(new URL('.' + editorialMobileSource, import.meta.url)),
      },
    },
  },
  define: {
    __MLZ_BUILD_SHA__: JSON.stringify(revision),
    __MLZ_BUILD_AT__: JSON.stringify(builtAt),
  },
}));
