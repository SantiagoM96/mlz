# MLZ — Instrucciones para agentes de IA

## Alcance y seguridad
MLZ es un frontend institucional de la Municipalidad de Lomas de Zamora, implementado con React 19, TypeScript, Vite 8, Tailwind CSS 4 y React Router 7. Es un prototipo: no presentar datos de demostración como actividades confirmadas.

- Trabajar en ramas específicas y mediante pull requests; nunca hacer commits de refactorización directamente a `main`, merges automáticos ni despliegues.
- No modificar Figma, Vercel, configuración de producción, datos de actividades ni rutas públicas sin autorización explícita.
- No introducir secretos, credenciales ni nuevas dependencias sin necesidad demostrada.
- No eliminar pruebas ni alterar expectativas solo para que pasen.
- No declarar validaciones completadas sin registrar el comando ejecutado y su resultado.

## Arquitectura y límites
Antes de mover archivos, inspeccionar la estructura real, las importaciones, los consumidores y los tests. Preferir organización por funcionalidades cuando reduzca acoplamiento: `src/pages` compone vistas; `src/components/ui` aloja primitivas realmente compartidas; `src/features/<feature>` contiene lógica, hooks y componentes específicos; `src/styles` centraliza tokens. Mantener las carpetas existentes cuando el cambio no aporte claridad.

- Aplicar DRY, SOLID pragmático, KISS, YAGNI, Separation of Concerns y Clean Code.
- Priorizar cohesión, composición y responsabilidades explícitas; no fragmentar componentes por límites arbitrarios de líneas.
- No importar internals de otra feature; compartir solo conceptos genuinamente comunes.
- Evitar dependencias circulares, barrel files indiscriminados y abstracciones prematuras.
- Mantener los contratos de props, tipos y rutas; migrar consumidores junto con cambios de API.
- Mantener datos fuente inmutables; extraer transformaciones puras, ordenamiento, búsqueda y formateo cuando se reutilicen.

## Design System y fidelidad
- Fuente institucional: Geometria (400 Regular, 500 Medium, 700 Bold). Comprobar archivos y `@font-face` antes de afirmar que está cargada; no reemplazar deliberadamente por Montserrat.
- Iconos generales: Google Material Symbols Outlined mediante `src/components/ui/MaterialIcon.tsx`. Logotipos e ilustraciones pueden usar recursos oficiales.
- Tokens de referencia: `--color-primary-500: #358dc2`, `--color-primary-600: #236999`, `--color-primary-700: #19577f`, `--color-info-500: #006eff`, `--color-grey-900: #3d3d3d`. Consultar las definiciones reales antes de añadir o sustituir valores.
- Ancho máximo institucional: 1200 px, incluyendo el comportamiento de `PageContainer`. Preservar breakpoints, densidad, espaciados, imágenes y jerarquía aprobados.
- Figma Agenda: https://www.figma.com/design/i1EyRb02SVGEtP6nWElLlT/AGENDA-DE-ACTIVIDADES---TEATROS-LOCALES . Consultar el frame concreto de cada vista o componente; Figma es referencia visual, no sustituye la validación funcional. No editar Figma.

## Agenda: invariantes
Preservar filtros multiselección, búsqueda, chips, limpieza, ordenamiento, dropdowns, cierre exterior/Escape, foco y restauración del foco, scroll lock, navegación y scroll restoration. Conservar tarjetas, ficha de detalle, descripción completa, resumen sticky y compartir.

En mobile, preservar drawer, backdrop, gestos de arrastre, resistencia, rebote, animaciones de entrada/salida y `prefers-reduced-motion`; no recalibrar curvas ni duraciones sin evidencia. Mantener áreas táctiles cómodas (objetivo 44 px cuando aplique) sin aumentar artificialmente la separación. Revisar las referencias de UX Motion de Deportes antes de cambiar interacciones.

## React, TypeScript y accesibilidad
Componentes PascalCase; hooks `useCamelCase`; funciones y variables camelCase; tipos PascalCase. Props explícitas y estrechas; evitar `any`, efectos innecesarios, estado derivable duplicado y memoización sin justificación. Limpiar listeners, timers y bloqueos de scroll.

Usar HTML semántico, controles nativos, etiquetas accesibles, foco visible y teclado. WCAG 2.2 AA como referencia. Evitar ARIA redundante.

## Protocolo de modificación
1. Revisar el código y el comportamiento actual, los componentes existentes, los tokens y las pruebas relevantes.
2. Establecer una comparación base y separar problemas preexistentes de regresiones.
3. Realizar cambios incrementales, acotados y con commits descriptivos (preferir Conventional Commits).
4. Ejecutar pruebas relevantes y revisar responsive en 390, 432, 768 y 1415 px, incluida ausencia de overflow horizontal.
5. Registrar resultados reales y limitaciones; no afirmar paridad visual sin comparación.

## Comandos verificados en package.json
- `npm install`: instalación.
- `npm run dev`: desarrollo.
- `npm run typecheck`: TypeScript.
- `npm run lint`: ESLint.
- `npm run build`: TypeScript y build Vite.
- `npm run build:pages`: build específico GitHub Pages y preparación de rutas.
- `npm run test:e2e`: Playwright.
- `npm run test:visual`: capturas Playwright.
- `npm run test:visual:report`: informe.
- `npm run format:check`: formato.
- `npm run preview`: previsualización local.

Para pruebas de navegador, instalar Chromium mediante `npx playwright install chromium` cuando el entorno lo requiera. La existencia de un script no demuestra que haya pasado. Nunca publicar mediante `build:pages` o workflows sin revisar el efecto sobre producción.

## Antes de entregar
Resumir cambios por responsabilidad, rutas y API preservadas, duplicaciones realmente eliminadas, tests ejecutados con sus resultados, pruebas no ejecutadas, riesgos, commits y enlace al PR. No hacer merge automático.
