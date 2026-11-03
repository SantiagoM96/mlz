# MLZ — Frontend institucional

Frontend multipágina de **MLZ / Municipio de Lomas de Zamora**, desarrollado como prototipo visual y funcional a partir de referencias institucionales en Figma. **No es el sitio oficial** ni una fuente de información vigente sobre eventos o trámites. La Agenda contiene datos de demostración y registros importados que no deben presentarse como actividades confirmadas.

## Stack y requisitos

- React 19, React Router 7 y TypeScript 5.9 (modo estricto).
- Vite 8 y Tailwind CSS 4.
- Google Material Symbols Outlined, ESLint, Prettier y Playwright con Chromium.
- Node.js **>= 20.19.0** (se recomienda Node 22 compatible), npm.

## Desarrollo local

```sh
npm install
npm run dev
```

Vite inicia normalmente en `http://localhost:5173`. Para comprobar el proyecto:

| Comando existente | Función |
| --- | --- |
| `npm run typecheck` | TypeScript, `tsc -b --pretty false` |
| `npm run lint` | ESLint |
| `npm run build` | TypeScript + build de Vite |
| `npm run preview` | Vista local del build |
| `npm run format:check` | Comprobación de Prettier |
| `npm run format` | Aplica Prettier |
| `npm run test:e2e` | Playwright: rutas, UI, responsive, motion y capturas |
| `npm run test:visual` | Capturas visuales Playwright |
| `npm run test:visual:report` | Abre el informe de Playwright |
| `npm run build:pages` | Build y preparación de rutas para GitHub Pages |

Instalar el navegador antes de ejecutar pruebas en un entorno nuevo: `npx playwright install chromium` (en Linux puede requerir `--with-deps`). Playwright arranca un servidor Vite de pruebas salvo que se configure `PLAYWRIGHT_BASE_URL`. Los proyectos incluyen **1415, 768, 432 y 390 px**; los reportes se guardan en `test-results/` y `playwright-report/`.

Los workflows de GitHub Actions ejecutan TypeScript, ESLint, build y Playwright en los pull requests. Su existencia no reemplaza la comprobación de los resultados de una ejecución concreta.

## Rutas públicas

| Ruta | Contenido |
| --- | --- |
| `/` | Home municipal provisional |
| `/jovenes-en-comunidad` | Página institucional Jóvenes en Comunidad |
| `/agenda-de-la-comunidad` | Home de Agenda: hero, destacada, eventos y circuitos |
| `/agenda-de-la-comunidad/actividades` | Buscador, filtros y listado |
| `/agenda-de-la-comunidad/actividades/:id` | Ficha completa de actividad |
| `*` | Página 404 |

Las rutas se declaran en `src/app/router.tsx`; no cambiar sus nombres públicos durante refactorizaciones. `SiteLayout` gestiona Header, Footer, el enlace para saltar al contenido y `ScrollRestoration`.

## Arquitectura pragmática por funcionalidades

La modularización es incremental y conserva APIs existentes:

```text
src/
├── app/                         # React Router
├── assets/fonts/                # Geometria, archivos locales
├── components/
│   ├── agenda/                  # Componentes Agenda todavía existentes aquí
│   ├── layout/                  # PageContainer, Footer y estructuras compartidas
│   ├── navigation/              # Header, Breadcrumbs y navegación
│   └── ui/                      # MaterialIcon y primitivas compartidas
├── data/                        # Datos originales e importaciones de Agenda
├── features/
│   └── agenda/
│       ├── components/
│       │   ├── detail/          # Resumen, ubicación e información
│       │   └── filters/         # Selector de ordenamiento
│       ├── hooks/               # Paginación responsive
│       ├── model/               # Contratos de filtros y ordenamiento
│       └── utils/               # Búsqueda, selección, normalización y URLs
├── layouts/                     # SiteLayout
├── pages/                       # Composición por ruta
└── styles/globals.css           # Geometria, tokens, Tailwind y motion
```

No hay obligación de crear todas las carpetas para cada feature. La lógica y el estado específicos deben permanecer cerca de su funcionalidad; los elementos realmente reutilizables van a `components/ui`, `layout` o `navigation`. Evitar importar implementaciones internas de una feature desde otra. Conservar contratos, tests y comportamiento durante migraciones posteriores.

En Agenda, `filterAgendaActivities` ordena una copia filtrada del dataset, `filterState` define los filtros y sus operaciones, `normalizeAgendaText` gestiona coincidencias de búsqueda y `activityMap` compone URLs de mapas. `AgendaPage` y `AgendaActivityDetailPage` se concentran en la composición de la vista. El drawer y las transiciones existentes permanecen en la implementación actual hasta que pueda verificarse una migración sin regresiones.

## Design System

- **Geometria** en `src/assets/fonts/`: Regular (400), Medium (500) y Bold (700), enlazadas con `@font-face` en `src/styles/globals.css`. Formularios y botones heredan la tipografía.
- **Material Symbols Outlined** para iconos de UI a través de `src/components/ui/MaterialIcon.tsx`. No introducir Lucide/Font Awesome ni dibujar SVG para sustituir iconos de interfaz. Los logos oficiales y pictogramas pueden conservar sus recursos.
- **Contenedor institucional** de ancho máximo total **1200 px**, aplicado con `PageContainer`. El gutter pequeño es de 16 px; desde 1232 px el contenedor utiliza el ancho completo. El Header tiene su gutter propio.
- **Tokens principales**: `--color-primary-500: #358dc2`, `--color-primary-600: #236999`, `--color-primary-700: #19577f`, `--color-info-500: #006eff`, `--color-grey-900: #3d3d3d`.
- **Chips**: los filtros seleccionados usan Info 500 con texto blanco; las características de actividades conservan sus colores semánticos.
- **Motion**: `src/styles/globals.css` contiene las curvas y duraciones calibradas de Agenda, sus gestos y soporte para `prefers-reduced-motion`. No cambiarlas solamente para simplificar una refactorización.

### Figma (consulta, no edición)

- [Agenda de Actividades / Teatros Locales](https://www.figma.com/design/i1EyRb02SVGEtP6nWElLlT/AGENDA-DE-ACTIVIDADES---TEATROS-LOCALES): Home desktop `7153:8476`, Home mobile `7153:8509`, ficha `7296:19178`, chips `7358:11951`. Consultar el frame específico de cada componente antes de modificar su presentación.
- [Jóvenes en Comunidad](https://www.figma.com/design/dgnKx8QM8ZyU8HYNCgIriM/EJE-JOVENES-EN-COMUNIDAD): frame mobile `2108:1125` y biblioteca institucional relacionada.

Las capturas y medidas de Playwright ayudan a comparar con Figma, pero **no equivalen a una prueba de igualdad pixel-perfect**: se necesitan baselines aprobados para esa afirmación.

## Despliegues y colaboración

**GitHub Pages:** `.github/workflows/pages.yml` publica únicamente por push a `main` o ejecución manual. `npm run build:pages` utiliza la base `/mlz/` y ejecuta `scripts/prepare-pages.mjs` para crear páginas estáticas de las rutas conocidas y un `404.html`. Al incorporar rutas dinámicas reales, revisar explícitamente ese script. Preview previsto: https://santiagom96.github.io/mlz/.

**Vercel:** despliegue estrictamente manual, sujeto a autorización. No conectar GitHub, crear despliegues automáticos ni modificar `vercel.json` durante refactorizaciones.

**Agentes de IA y colaboradores:** consultar primero el [AGENTS.md](AGENTS.md) raíz y, para trabajos de Agenda, las instrucciones específicas de la feature. Trabajar en una rama, hacer commits acotados y abrir un PR sin merge automático. Respetar Figma, datos originales, rutas y diseño aprobado. Documentar validaciones reales y riesgos antes de pedir revisión.

## Pendientes conocidos

La Home municipal sigue provisional; las actividades importadas no equivalen a un servicio oficial actualizado. La migración de todos los componentes de Agenda a `features/` se realiza de forma progresiva para minimizar regresiones. La fidelidad pixel-perfect requiere un proceso de comparación y aprobación de capturas; no se presupone por el éxito de TypeScript o Playwright.
