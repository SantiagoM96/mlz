import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const revision = process.env.GITHUB_SHA || (() => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return ''; }
})();
const builtAt = new Date().toISOString();

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/mlz/' : '/',
  plugins: [react(), tailwindcss()],
  define: {
    __MLZ_BUILD_SHA__: JSON.stringify(revision),
    __MLZ_BUILD_AT__: JSON.stringify(builtAt),
  },
}));
