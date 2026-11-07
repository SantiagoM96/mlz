# CI/CD — MLZ

El repositorio publica un **preview** de prototipos, no el sitio oficial del Municipio. Los workflows usan Node.js 22, `npm ci` y `package-lock.json`.

| Workflow | Disparador | Validaciones |
| --- | --- | --- |
| `quality.yml` | Pull requests contra `main` y ejecución manual | TypeScript, ESLint y build |
| `visual-qa.yml` | PRs y pushes relevantes a `main` | Playwright Chromium a 1415, 768, 432 y 390 px |
| `pages.yml` | Push a `main` con archivos relevantes, o manual | Valida los prototipos, lint, build y publica Pages |

Los workflows exclusivos de Agenda y sus pruebas de paridad se retiraron junto con esa funcionalidad. La prueba E2E restante verifica la portada, la navegación y el prototipo Deportes. El preview estático BAE y la página Crónica continúan publicados desde `public/`.

La publicación en Pages no espera a que finalicen los tests E2E posteriores al push a `main`. Un check verde certifica el commit correspondiente, no cualquier versión posterior.

## Comprobación local

```sh
npm ci
npm run validate:prototypes
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

No reescribir historial ni forzar cambios sobre trabajo de otros colaboradores. La eliminación de una funcionalidad implica eliminar sus pruebas específicas y documentar el alcance.
