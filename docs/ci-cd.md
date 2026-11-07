# CI/CD — MLZ

El repositorio publica un **preview**, no el sitio oficial del Municipio. Los workflows de GitHub Actions se ejecutan con Node.js 22 y con dependencias fijadas en `package-lock.json`, generadas usando `npm install --package-lock-only` y verificadas con `npm ci`.

## Disparadores y responsabilidad

| Workflow | Ejecución automática | Qué verifica |
| --- | --- | --- |
| `quality.yml` | Todos los pull requests contra `main` | `npm ci`, TypeScript, ESLint y build. También permite ejecución manual. |
| `visual-qa.yml` | Todos los pull requests; pushes a `main` solo con cambios web/test relevantes | Suite E2E completa en Chromium (1415, 768, 432 y 390 px), incluido `tests/e2e/motion-smoke.spec.ts`. Publica evidencias de fallos. |
| `motion-smoke.yml` | **Solo manual**, mediante **Run workflow** | Diagnóstico dirigido de motion en las cuatro resoluciones; no duplica la batería automática. |
| `agenda-console-parity.yml` | Pull requests que modifican Agenda, su configuración o dependencias | Genera imágenes de referencia desde `main` y compara con el PR; conserva artefactos durante 14 días. |
| `pages.yml` | Pushes a `main` con cambios que afectan la publicación; también manual | Valida prototipos, ejecuta lint, compila `build:pages` y publica el preview en GitHub Pages. |

Los cambios exclusivamente editoriales en `docs/**`, `README.md` o en `public/cronica/**` **no ejecutan E2E al entrar en `main`** si no modifican archivos cubiertos. Cambios en `public/cronica/**` sí actualizan el preview en Pages, porque esa carpeta forma parte de su contenido estático. Los PR mantienen toda la cobertura E2E para no afectar posibles reglas de revisión y protección de ramas.

## Publicación y garantías

La publicación del **preview** es automática desde `main`. El workflow de Pages corre sus verificaciones de build antes de publicar, **pero no espera a que finalice Playwright**: los workflows de QA posteriores a un push informan la calidad del commit, no bloquean retroactivamente el despliegue. No confundir la publicación de un preview con una liberación controlada a producción. Si se requiere un gate de publicación condicionado al QA E2E, debe definirse explícitamente un flujo separado.

La prueba de paridad compara versiones concretas. El `baseline` usa `npm ci` si dispone de lockfile; durante la adopción inicial, tolera `npm install` para una referencia anterior a la introducción de `package-lock.json`. El candidato usa siempre `npm ci`. La paridad técnica no reemplaza una revisión humana.

## Comprobación local

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

No se deben modificar mensajes, expectativas, rutas o datos públicos únicamente para conseguir checks verdes. Una ejecución en verde corresponde al commit exacto informado por GitHub Actions.
