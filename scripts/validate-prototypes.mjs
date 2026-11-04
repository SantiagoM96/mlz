/**
 * Public HTML is copied to dist by Vite without compiling its inline scripts.
 * A malformed <script> can publish successfully while leaving the page blank.
 * Verify script syntax in CI before deploying GitHub Pages.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Script } from 'node:vm';

const prototypesDir = join(process.cwd(), 'public', 'prototipos');
let scriptCount = 0;

for (const file of readdirSync(prototypesDir).filter(name => name.endsWith('.html'))) {
  const html = readFileSync(join(prototypesDir, file), 'utf8');
  const inlineScripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script\\s*>/gi)];
  for (const [index, match] of inlineScripts.entries()) {
    if (/\\bsrc\\s*=|\\btype\\s*=\\s*["'](?:application\\/json|importmap)/i.test(match[1])) continue;
    try {
      new Script(match[2], { filename: `${file}:inline-script-${index + 1}` });
    } catch (error) {
      console.error('Invalid JavaScript in ' + file + ' script #' + (index + 1));
      throw error;
    }
    scriptCount++;
  }
}
console.log(`Validated ${scriptCount} inline JavaScript scripts across public prototypes.`);
