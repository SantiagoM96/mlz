# MLZ — Réplica frontend del sitio municipal

Base multipágina para construir progresivamente una réplica del sitio institucional de la Municipalidad de Lomas de Zamora. La primera página desarrollada es **Jóvenes en Comunidad**. La Home es provisional.

**Stack:** React 19, TypeScript estricto, Vite 8, Tailwind CSS 4, React Router, ESLint y Prettier.

## Ejecutar localmente

Requiere Node.js >=20.19.0 (se recomienda Node 22 LTS o superior compatible).

1. `npm install`
2. `npm run dev`
3. Abrir http://localhost:5173/jovenes-en-comunidad

Otras tareas: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`, `npm run format`.

## Páginas

- `/`: pantalla provisional, aún no diseñada.
- `/jovenes-en-comunidad`: primera página real de la réplica municipal.
- `/*`: página básica 404.

## Referencias visuales

- Figma: https://www.figma.com/design/dgnKx8QM8ZyU8HYNCgIriM/EJE-JOVENES-EN-COMUNIDAD?node-id=2101-1124
- Sitio oficial de referencia: https://lomasdezamora.gov.ar/

El frame de escritorio de Jóvenes en Comunidad se utilizó como fuente primaria. **El frame mobile de 432 px ya está disponible en Figma (nodo `2108:1125`) y fue incorporado como referencia de la implementación.** Mobile presenta introducción, índice y contacto antes de las iniciativas; desktop mantiene el índice en la columna lateral. El banner mobile utiliza una exportación dedicada del mismo recurso de Figma.

La familia tipográfica de Figma es Geometria. El proyecto declara esa fuente y utiliza fallback a Arial, sin distribuir archivos tipográficos con licencia. Incorporar las fuentes licenciadas si corresponde.

Los banners `public/assets/jovenes-hero.jpg` y `public/assets/jovenes-hero-mobile.jpg` provienen de Figma. Los logotipos institucionales oficiales se exportaron como SVG a partir de los componentes de Figma (`2112:1590` y `2112:1653`): `public/assets/logo-municipio-blanco.svg` y `public/assets/logo-comunidad-blanco.svg`. Se reutilizan en Header y Footer. No son capturas completas de la página.

## Organización

- `src/app`: rutas.
- `src/layouts`: layout general reutilizable.
- `src/components`: navegación, UI Kit y componentes globales.
- `src/data`: contenidos separados de su presentación.
- `src/pages`: páginas independientes.
- `src/styles/globals.css`: tokens semánticos de Tailwind y estilos tipográficos.

Los tokens principales de la biblioteca Figma se encuentran en `src/styles/globals.css`: **Primario 600 `#236999`** (`--color-primary-600`) para títulos y enlaces azules y **Grey 900 `#3d3d3d`** (`--color-grey-900`) para texto oscuro. El header usa ambos logos oficiales en desktop; en mobile muestra el logo municipal y el botón de menú. Para modificar el color municipal principal, actualizar los tokens en ese archivo. La imagen y los textos están fuera de las piezas visuales reutilizables.

**Pendientes:** Home definitiva, enlaces oficiales de los botones genéricos del header y footer, página Puntos Jóvenes, verificación visual automatizada contra Figma, integración de fuente Geometria.

## GitHub Pages — preview

La acción `.github/workflows/pages.yml` compila y publica la página **solo en GitHub Pages**, tras un push a `main` o una ejecución manual.

Para habilitarla, un administrador del repo debe ir a **Settings → Pages → Build and deployment → Source → GitHub Actions**. Según la visibilidad del repositorio y el plan de GitHub, es posible que GitHub Pages no esté disponible; el proyecto no cambia automáticamente la privacidad del repo.

- URL prevista: https://santiagom96.github.io/mlz/
- Página: https://santiagom96.github.io/mlz/jovenes-en-comunidad/
- Build manual local: `npm run build:pages`

`build:pages` usa `/mlz/` como ruta base y genera una copia de `index.html` para las rutas conocidas. Esto permite abrir y recargar directamente `/jovenes-en-comunidad/` en GitHub Pages. La ruta 404 también tiene fallback estático. Al agregar páginas nuevas, incluirlas en `scripts/prepare-pages.mjs`.

## Vercel — estrictamente manual

**No está integrado GitHub con Vercel. No hay despliegues automáticos de Vercel.**

Cuando el responsable autorice expresamente publicar, desde una máquina autenticada:

1. `npm install`
2. `npm run build`
3. `npx vercel` para un Preview o `npx vercel --prod` para producción, solamente tras autorización.

No crear la integración Git que dispara despliegues por cada push. `vercel.json` contiene exclusivamente la regla SPA para recarga de rutas limpias.

## Verificación

Configurados typecheck, ESLint y build mediante GitHub Actions en pull requests; la publicación de GitHub Pages solo se produce desde `main`. No hay pruebas visuales automatizadas configuradas todavía. Validar en anchos 375, 390, 432, 768, 1024 y 1440 px, y comparar frente a los frames desktop (1415 px) y mobile (432 px) de Figma. El código implementa los layouts de referencia; todavía no se ha automatizado un diff visual del navegador.

Este repositorio es un prototipo frontend. No es el sitio oficial ni debe tratarse como canal de atención ciudadana o información vigente de trámites.
