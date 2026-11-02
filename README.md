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


## QA visual con Playwright + Chromium

Se incluye una batería de pruebas de navegador con `@playwright/test` y Chromium, independiente de Vercel.

1. `npm install`
2. `npx playwright install chromium` (en Linux puede requerir `--with-deps`)
3. `npm run test:e2e` — rutas, colores, logos, responsive y capturas.
4. `npm run test:visual` — genera únicamente capturas visuales.
5. `npm run test:visual:report` — abre el informe HTML local.

Playwright inicia Vite localmente por defecto. Para probar una página ya publicada (sin iniciar Vite), ejecutar `PLAYWRIGHT_BASE_URL=https://santiagom96.github.io/mlz npm run test:e2e`. 

Se prueban los anchos **1415, 432, 390 y 768 px**, comprobando el orden mobile del índice y la ausencia de overflow horizontal. Se generan capturas de viewport, página completa, header y footer, además de un JSON de medidas y colores. Los resultados se guardan en `test-results`.

El workflow `.github/workflows/visual-qa.yml` ejecuta los tests automáticamente con push a main, pull requests o bajo demanda, adjuntando **playwright-visual-report** en la pestaña Actions. Esto utiliza **GitHub Actions**, no Vercel.

Las capturas son evidencia para comparar con Figma. La suite no debe confundirse con una prueba pixel-perfect: falta registrar y aprobar baselines visuales de referencia con la tipografía Geometria licenciada para habilitar regresiones de píxeles automatizadas. Los reportes permiten revisar y corregir diferencias manualmente sin inventar un porcentaje de fidelidad.


### Biblioteca visual compartida — Figma

El UI Kit contiene los componentes `Breadcrumbs` (Geometria 18, 24 px de icono de separación, gap 8), `Icon` (mascara CSS con SVG originales de Figma), `IconLink` (icono 24 px + texto 18/26, gap 4), `InfoCard` (SimpleCard, padding 24/gap 16) y `TableOfContents` desacoplado de la lista de iniciativas. `PageHero` también es reutilizable entre páginas institucionales. Se extraen SVG a `public/assets/icons` y no se copian dibujos aproximados dentro de cada página. Los datos y los destinos de enlaces siguen siendo específicos de cada página.

Tests Playwright específicos verifican fuentes, color, medidas de iconos, gaps, padding y el ancho de las tarjetas en frames Figma desktop (1415 px) y mobile (432 px). El reporte guarda capturas individuales del breadcrumb y el índice, además del header y la página completa. La fidelidad tipográfica exacta sigue condicionada a disponer de Geometria bajo licencia.

## Agenda de la Comunidad — Home inicial

Figma: https://www.figma.com/design/i1EyRb02SVGEtP6nWElLlT/AGENDA-DE-ACTIVIDADES---TEATROS-LOCALES?node-id=7358-11662

La primera vista real de Home es **Agenda Anual de la Comunidad 2026**. Se publica tanto en `/` como en `/agenda-de-la-comunidad`; esto no implica que esté terminada la Home global del municipio.

- Frame desktop `7358:11786` (1292px); mobile `7358:11747` (432px).
- Componentes reutilizables en `src/components/agenda/`: `ActivityCard`, `AgendaToolbar`, `AgendaFilterPanel`, `ActivityDetails`, `AgendaPromo`, `AgendaIcon`.
- Datos de demostración separados en `src/data/agenda.ts`; las 18 tarjetas representan las variantes visuales repetidas en el prototipo, **no eventos reales confirmados**.
- Búsqueda por texto, filtros, chips removibles, orden alfabético, paginación, detalles en modal, resultado vacío.
- La vista mapa es una pantalla informativa temporal: todavía **no existe información geográfica validada**.
- Exportaciones originales de Figma en `public/assets/agenda/`: ilustraciones Cine, Deportes, Humor y logo Recorrido del Café. El fondo fotográfico de esa promoción todavía no se incorporó y se reemplaza provisionalmente por un gradiente.
- La tipografía Geometria no está incorporada por falta de archivos licenciados; usa fallback.

Pruebas Playwright específicas en `tests/e2e/agenda.spec.ts` comprueban las rutas y el funcionamiento en 1415, 768, 432 y 390 px. Ejecutar `npm run test:e2e`.

En GitHub Pages la ruta se prepara en `scripts/prepare-pages.mjs`. Vercel sigue **sin conexión automática ni despliegues**.


## Corrección de rutas de Agenda (Figma Home y ficha final)
- `/`: Home **general municipal** provisional, no Agenda.
- `/agenda-de-la-comunidad`: Home de Agenda con imagen hero, actividad destacada, 3 eventos y circuitos.
- `/agenda-de-la-comunidad/actividades`: buscador y filtros.
- `/agenda-de-la-comunidad/actividades/:id`: página de detalle/Resumen y Compartir, reemplaza el modal anterior.
- Exportaciones actualizadas desde Figma en resolución nativa o superior para banner, foto destacada, ilustraciones y circuitos.
- Figma Home desktop `7153:8476`, mobile `7153:8509`. Figma detalle `7296:19178`.
- Los IDs de demo se preparan como directorios en GitHub Pages para soportar refresh. Actividades reales requerirán datos estables y actualizar el script de rutas.
- La programación del diseño es de ejemplo: no presentar como eventos confirmados.
