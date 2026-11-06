# Agenda de la Comunidad V2 — plan de refactorización segura

> Estado auditado: `main` en `c501fccccd5376952705fd89c9831469b1f91095` (06/11/2026). Documento de diagnóstico y estrategia; no implica aprobación de cambios visuales.

## Alcance y límites

- La implementación actual de consola y Agenda pública es el **contrato funcional y visual**.
- Sin cambios deliberados de diseño, interacción, datos de ejemplos, rutas, librerías ni despliegue.
- La consola sigue siendo **solo demostrativa**: sin backend, persistencia ni publicación.
- No se consulta Figma durante esta refactorización. Los identificadores de casos y pruebas heredados son datos existentes del repositorio.
- Trabajar en rama y PR. No hacer merge automático ni commits a `main`.

## Línea base comprobada

- GitHub: `main` idéntica al SHA anterior al empezar; la comparación reportó cero commits adicionales.
- `src/pages/agenda/AgendaConsolePreviewPage.tsx`: aprox. 590 líneas, ~86 `className`, ~54 dimensiones arbitrarias. Un mismo archivo compone página, secciones, tabla, estado y conversiones a la vista pública.
- `ConsoleScheduleEditorDialog.tsx`: aprox. 302 líneas. Mezcla foco/scroll modal, validación, registro de sedes, normalización y renderizado.
- `ConsoleDetailDialog.tsx`: aprox. 212 líneas; duplicación parcial con la ficha pública y foco no uniformado.
- `consolePreview/model.ts`: tipos, catálogos, fixtures y `sameScheduleContent` mezclados.
- Estilos: `inputClass` duplicada entre página (radio 4 px) y editor (6 px). No unificarlas visualmente por accidente.
- Test E2E existente: `tests/e2e/agenda-console-preview.spec.ts` cubre CRUD de programaciones, validación, sedes y tipos, imágenes, preview y sticky.
- Playwright configura 390, 432, 768 y 1415 px.
- Workflows: `quality.yml` ejecuta typecheck/lint/build en PR; `visual-qa.yml` ejecuta Playwright matricial. `pages.yml` despliega únicamente por push a `main` o trigger manual.
- **Fallo preexistente**: ejecución `42292327030` de `main`. Tablet 768: 85 passing, 1 failing en `agenda-figma-examples.spec.ts` debido a comparación exacta entre `24` y `23.99993896484375` para la altura del Chevron. Otros tres proyectos pasaron. Esto no es evidencia de cambio visual.

## Invariantes obligatorios

1. Un registro de actividad con N programaciones; puntuales, períodos y recurrentes.
2. Cada programación mantiene sus fechas, horarios, sede, lluvia, participantes y detalle.
3. Agregar, editar, duplicar, eliminar; rechazo de duplicados reales; validaciones visibles; pie fijo y scroll interno del editor.
4. Agregar/reutilizar sedes y tipos; tres categorías fijas.
5. Inscripción sin, online o presencial, portada/galería, destacadas e inclusión.
6. Preview responsive: panel sticky en desktop, cambio de vista en mobile.
7. Fichas públicas por sede o por encuentro según `getPublicActivityViews`; diez casos públicos de revisión y compatibilidad con URLs editoriales.
8. Breadcrumb mobile «Volver», ruta completa en desktop; `#236999` y diseño actual.
9. En consola no publicar/guardar; enlaces de inscripción ingresados no se activan desde preview.
10. Sin regresiones en filtros, chips, mapas, tarjetas, scroll, foco y navegación.

## Arquitectura objetivo (evolutiva; no crear todo por anticipado)

```text
src/
  pages/agenda/                    # Entradas de ruta; composición y navegación
  features/agenda/
    consolePreview/
      components/                  # ScheduleTable, FormSection, VenueSelector, etc. SOLO si hay reutilización
      hooks/                       # Estado y handlers de consola, solo si reducen acoplamiento
      model.ts                     # Tipos de la consola
      demoData.ts                  # Fixtures/catálogos de demostración
      scheduleRules.ts             # Funciones puras de comparación/validación
      ...                          # Diálogos actuales hasta extracción segura
    components/                    # Presentación pública de Agenda
    utils/                         # Proyecciones públicas, fechas, dirección y agrupación
  components/ui/                   # Solo primitivas genuinamente compartidas
  styles/                          # Tokens institucionales existentes
tests/e2e/                         # Characterization tests y regresiones por viewport
```

**Regla de dependencias:** las páginas consumen feature y componentes; las reglas de dominio no importan React, DOM ni páginas; la Agenda pública no importa internals de la consola. Evitar barrels y stores globales.

## Mapa de responsabilidad propuesto

| Módulo | Responsabilidad |
| --- | --- |
| `AgendaConsolePreviewPage` | Composición, selección de caso, coordinación de vistas |
| `consolePreview/model.ts` | Tipos `ConsoleDraft`, `ConsoleSchedule`, `ConsoleVenue` |
| `consolePreview/demoData.ts` | Catálogos, weekdays, valores iniciales, datos ficticios |
| `consolePreview/scheduleRules.ts` | Creación de programación por defecto, comparación normalizada (y, cuando se caracterice, validación) |
| `ConsoleScheduleEditorDialog` | Edición interactiva de una programación y su modal |
| `ScheduleTable` | Tabla y acciones por fila, sin estado autónomo; botones tipados por tono |
| `ConsoleCardPreview` | Lista de tarjetas de vista previa; reutiliza `ActivityCard` |
| `previewActivity.ts` | Conversión de borrador + programaciones a actividad pública sin guardar |
| `demoCasePreset.ts` | Transformación de casos ficticios a borradores editables |
| `useConsoleSchedules.ts` | Estado de programaciones, sedes, editor y operaciones CRUD demo |
| `ConsoleFormPrimitives.tsx` | Labels, campos, títulos y clases actuales del formulario |
| `VenueSelector` (futuro) | Lugar guardado o nuevo, sin conocimiento de la página |
| `ConsoleTypeEditorDialog` | Alta de tipo en la categoría activa |
| `ConsoleDetailDialog` | Contenedor de vista previa de ficha pública, sin duplicar reglas |
| `publicActivityViews.ts` | Proyección inmutable a fichas por sede/encuentro |
| `activitySchedules.ts` | Fechas y programaciones presentables |
| `ActivityCard` / detalle | Presentación pública reutilizada por consola |

## Estrategia de estilos

1. Inventariar estilos y sus **diferencias existentes** (por ejemplo radios de inputs), sin normalizarlos ciegamente.
2. Reutilizar tokens CSS institucionales existentes, en especial `--color-primary-600: #236999`.
3. Consolidar variantes tipadas a nivel de primitivas `FormField`, `IconButton` u otros componentes **solo si los consumidores tienen el mismo contrato**.
4. Mantener Tailwind para layout y utilidades cortas. CSS Modules locales solo para bloques con clases largas y repetición comprobada; evitar mover todo a `@apply` o crear hojas globales gigantes.
5. Congelar geometría, estados y responsive con capturas comparables antes/después. Una prueba que corre y guarda capturas **no** equivale a una comparación visual automática.

## Orden de intervención y criterios de aceptación

| Etapa | Cambio máximo | Evidencia requerida |
| --- | --- | --- |
| P0 | Documentar baseline y eliminar fragilidad numérica de prueba de Chevron sin cambiar tolerancias perceptibles | CI + validación exacta a escala de centésimas de px |
| P1 | Separar tipos, demo data y reglas puras de `model.ts` | imports revisados; typecheck/lint/build + Playwright |
| P2 | Extraer `ScheduleTable` y operaciones de programaciones del componente de página | E2E CRUD y sin cambios visuales |
| P3 | Extraer formularios/selector de sedes y tipos | Casos de crear/reutilizar + validaciones |
| P4 | Normalizar estilos con variantes sin alterar radios, colores, tamaños, foco ni hover | comparación de screenshots y tests por breakpoint |
| P5 | Compartir presentación pública y uniformar semántica/foco de modales | pruebas de teclado, screen readers y regresión completa |

## Ejecución de pruebas

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- --project=desktop-1415` (repetir para 390, 432 y 768)
- `npm run test:visual` para captura, comparando artefactos antes/después de forma expresa.
- No reclamar validación local: en el entorno de auditoría el clon de GitHub no pudo descargarse por resolución DNS. Usar ejecuciones observables de GitHub Actions, indicando SHA y resultados.
- Las comprobaciones visuales deben detectar también overflow horizontal y cambios de layout de tarjeta/ficha/modal; una captura aislada no demuestra paridad.

## Deuda fuera de la primera intervención

- Modal de detalle sin un mecanismo equivalente al trap de foco del editor.
- Reglas `sameScheduleContent` no comparan `detailType`; evaluar semántica y pruebas antes de cambiar.
- La proyección demo a `AgendaActivity` ya no reside en la página: está en `previewActivity.ts`; la resolución de imagen sigue leyendo `import.meta.env.BASE_URL` y aún no está desacoplada para test unitario de Node.
- Los handlers de creación de IDs de sedes y programaciones se movieron a `useConsoleSchedules.ts`; aún pueden extraerse como funciones puras si aparecen nuevos consumidores.
- `getDemoCasePreset` ya vive en `demoCasePreset.ts`. Se conservaron IDs, datos, rutas y nombres de pruebas heredadas; no se consultó Figma.
- El conjunto de siete presets produce diez fichas públicas de revisión en la configuración vigente; no confundir cantidad de actividades y fichas.

## Avance real de P2 y primera consolidación de componentes (06/11/2026)

- `ScheduleTable.tsx`: extraída la tabla (markup y `data-testid` intactos); recibe datos, sedes y handlers. Incluye `ScheduleActionButton` local con variantes tipadas `primary`/`danger`, sin cambio en strings CSS finales.
- `previewActivity.ts`: aisladas `imageForDraft` y `makePreviewActivity` (conversión no persistente); `ConsoleCardPreview.tsx` reproduce el JSX previo y sigue usando `ActivityCard`.
- `demoCasePreset.ts`: casos ficticios editables y función `getDemoCasePreset`; se conservó todo el contenido de prueba.
- `useConsoleSchedules.ts`: estado de sedes/programaciones, operaciones CRUD y modo de edición. La página sigue coordinando la vista mobile y el cambio de caso; no se añadió un store global.
- `ConsoleFormPrimitives.tsx`: `FormField`, `SectionTitle` y clases existentes fuera de la página. El editor reutiliza el estilo exacto de `labelClass`; mantiene la geometría diferenciada de los controles.
- `tests/e2e/agenda-console-preview.spec.ts`: prueba adicional para cambios de caso, limpieza del editor y creación posterior, además de cobertura CRUD preexistente.
- `AgendaConsolePreviewPage.tsx`: de ~589 líneas tras P1 a ~337 líneas. La página sigue componiendo el formulario; no se reemplazaron bloques de JSX por diseños nuevos.
- La Agenda pública, las rutas, los ejemplos, los diez casos de revisión y los estilos CSS globales **no fueron modificados**.

### Pendientes para otro lote revisable

1. Dividir `ConsoleScheduleEditorDialog` (validación de fechas, subformulario de sede y modal/foco) previa caracterización por pruebas.
2. Reducir duplicación de `ConsoleDetailDialog` vs ficha pública conservando su comportamiento de preview.
3. Establecer baseline de **comparación automática de screenshots**; actualmente se capturan evidencias pero no se comparan imágenes pixel a pixel.
4. Evaluar CSS Modules / variantes únicamente sobre patrones duplicados adicionales, sin uniformar radios `4px` y `6px` ni mover Tailwind indiscriminadamente.
5. Revisión de accesibilidad de foco en diálogo de detalle y restauración del foco tras cierre; fuera del refactor visualmente neutro.

**Verificación de la tanda:** consultar los checks del SHA final del PR #8. No inferir éxito desde el código o ejecuciones anteriores.
