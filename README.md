# MLZ — Área de prototipos web

Este repositorio mantiene los prototipos y desarrollos independientes que continúan bajo `mlz`. No es el sitio oficial de la Municipalidad de Lomas de Zamora.

## Proyectos que permanecen

| Ruta | Contenido |
| --- | --- |
| `/` | Portada provisional de prototipos |
| `/bae/` | Editor BAE y sus recursos |
| `/cronica/` | Prototipo Crónica |
| `/prototipos/deportes_formulario_resumen_compacto.html` | Prototipo de Deportes |

**Agenda de la Comunidad y Jóvenes en Comunidad ya no forman parte del código activo de este repositorio.** Se retiraron sus páginas, componentes, datos, imágenes, rutas, pruebas y workflows específicos. Esto no modifica otros repositorios ni reescribe el historial Git.

## Stack

React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4 y React Router 7. Node.js >= 20.19.0 (se recomienda Node 22).

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
npm run validate:prototypes
npm run test:e2e
```

Para Playwright en una instalación nueva: `npx playwright install chromium`.

## Publicación

GitHub Pages publica el preview desde `main` con `.github/workflows/pages.yml`; `scripts/prepare-pages.mjs` conserva el editor estático BAE y genera el fallback 404. Vite copia los prototipos y demás recursos de `public/`. Los checks de PR se ejecutan mediante `quality.yml` y `visual-qa.yml`.

La versión de Pages se sirve con base `/mlz/`. El código existente de BAE, Crónica y Deportes permanece sin cambios en esta limpieza.

**Colaboración:** crear ramas específicas y PRs; no hacer merges automáticos ni alterar despliegues Vercel. Consultar `AGENTS.md` y `docs/ci-cd.md`.
