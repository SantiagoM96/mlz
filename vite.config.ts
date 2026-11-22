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

function editorialDevRoutes(): Plugin {
  return {
    name: 'editorial-dev-routes',
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (item) => item.type === 'chunk' && item.isEntry && item.name === editorialMobileEntry,
      );
      if (!entry) this.error('Missing editorial mobile entry');
      for (const brand of editorBrands) {
        const fileName = `${brand}-dev/index.html`;
        const html = readFileSync(new URL(`./public/${fileName}`, import.meta.url), 'utf8');
        this.emitFile({
          type: 'asset',
          fileName,
          source: html.replace(`..${editorialMobileAsset}`, `../${entry.fileName}`),
        });
      }
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '';
        const path = url.split('?')[0];
        if (path === editorialMobileAsset) {
          req.url = url.replace(path, editorialMobileSource);
        } else if (path && /^\/(cronica|bae|diarioshow)-dev\/$/.test(path)) {
          req.url = url.replace(path, path + 'index.html');
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
