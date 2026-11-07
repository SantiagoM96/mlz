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

## Avance P3/P4 — editor y secciones de formulario (06/11/2026)

### Refactor P3: estado final de módulos

- `ConsoleScheduleEditorDialog.tsx`: ~131 líneas (original ~302). Conserva modo, estado editado, errores, manejo modal, foco, guardado y coordinación.
- `scheduleEditorRules.ts`: funciones puras `normalizeConsoleSchedule` y `validateConsoleSchedule` con **mismo orden y textos** de validación, sin mutar valores.
- `ConsoleScheduleDateFields.tsx`: fecha puntual/período/recurrencia, días de semana y horarios; el estado permanece en el editor.
- `ConsoleScheduleAdditionalFields.tsx`: suspensión por lluvia, participantes y detalle independiente de programación.
- `ConsoleVenueSelector.tsx`: selector, alta manual de sede, dirección y enlace a mapa; mantiene `data-testid`, estructura original y estado local del formulario de lugar.
- `venueRules.ts`: normalización de espacios y validaciones de obligatorios y duplicados por nombre/localidad. No se amplían las reglas.
- `ConsoleScheduleFormPrimitives.tsx`: campos y clase original de input con radio de 6 px.
- `ConsoleGeneralInfoSection.tsx`: título, categoría fija, tipos administrables, descripción, disciplina inclusiva.
- `ConsoleRegistrationSection.tsx`: modalidad online/presencial/sin inscripción, información y el enlace no activado desde preview.
- `ConsoleImagesSection.tsx`: portada, galería, imagen local mediante FileReader y opción de destacada, sin persistencia.
- `AgendaConsolePreviewPage.tsx`: ~232 líneas tras extraer secciones; coordinación de casos, estado, navegación y preview. Los callbacks de galería mantienen las operaciones previas con `setDraft(current => ...)`.

### P4 inicial — estilos controlados

- Se mantienen los tokens institucionales existentes (principal `#236999`) y Tailwind del proyecto.
- El estilo del formulario (radio 4 px) y el del editor de programaciones (radio 6 px) siguen diferenciados.
- Las clases de días de recurrencia y de tabs mobile se extrajeron a funciones semánticas sin alterar las cadenas resultantes en DOM.
- No se trasladaron estilos indiscriminadamente a `@apply`, no se agregaron dependencias y no se creó CSS global adicional.

### Caracterización ampliada

- `tests/e2e/agenda-console-rules.spec.ts`: normalización, validación y comparación de programaciones; normalización y validación de sedes.
- `tests/e2e/agenda-console-preview.spec.ts`: validación de sedes obligatorias/duplicadas, selección posterior, trampa de foco y Escape, además de los flujos CRUD, preview y responsive existentes.
- Los resultados E2E deben tomarse del **SHA final** del PR; las ejecuciones previas de Actions se pueden cancelar por concurrencia.
- Aún falta una comparación real screenshot-vs-baseline aprobado: las capturas y aserciones geométricas E2E no constituyen por sí solas regresión visual pixel a pixel.

### Pendientes siguientes, sin intervención automática

1. Auditar accesibilidad y restauración del foco de `ConsoleTypeEditorDialog` y `ConsoleDetailDialog` antes de cualquier cambio de comportamiento.
2. Evitar duplicación del contenido de ficha entre `ConsoleDetailDialog` y presentación pública solo donde coincidan contratos de props y estilos.
3. Evaluar si nuevas primitivas tipadas aportan reutilización concreta; no crear un componente universal para cada control.
4. Baseline visual aprobado y workflow de comparación por viewport, incluyendo los diez casos públicos.
5. Revisar integración con `main` antes de merge: el archivo `public/cronica/index.html` cambió externamente y no forma parte de esta refactorización.

**Proteger `main`:** no fusionar ni desplegar la refactorización desde este PR en borrador.

## Avance P5 — accesibilidad de los diálogos y resumen de la ficha demo (06/11/2026)

### Gestión de teclado y foco

- Nuevo `useConsoleDialogFocus.ts` compartido por `ConsoleScheduleEditorDialog`, `ConsoleTypeEditorDialog` y `ConsoleDetailDialog`.
- Al abrir, mueve el foco al campo principal o al botón de cerrar; el tabulado queda contenido en el modal con Tab y Shift+Tab.
- Escape cierra el diálogo, los listeners se limpian al desmontar, el scroll del cuerpo se restaura y el foco regresa al control que abrió el diálogo (si permanece conectado).
- El callback `onClose` se mantiene actualizado en un ref para evitar reenfocar al cambiar la identidad de la función en un render del padre.
- Esto incorpora bloqueo de scroll y trampa de foco también al diálogo de tipos, que antes no implementaba ambas protecciones.

### Ficha pública simulada

- `ConsoleDetailScheduleSummary.tsx`: extracción del resumen «Cuándo y dónde» de la ficha demo, conservando JSX, clases, badges, estados sin programación, fechas, participantes y enlaces de mapa. La ficha sigue reutilizando `ActivityDescription`, `ActivityScheduleDateTime`, `ActivityScheduleParticipants`, `ActivityBadges`, `ActivityRegistrationLink` y `ActivityLocationMap`.
- **No se fuerza la sustitución por `ActivitySummary` de la Agenda pública:** sus contratos actuales difieren (placeholder de programación incompleta, encabezado h3 frente a h2 y algunas clases/estados). Unificarlo ahora sería un cambio visual/funcional, no un traslado neutro.
- No se tocaron rutas públicas, datos de agenda, componentes públicos, CSS global ni mecanismos de publicación.

### Regresiones específicas incorporadas

- Trampa de foco del diálogo de tipos, Escape, retorno del foco, bloqueo y restauración del scroll al cancelar y guardar.
- Alta de sede en editor: al guardar, foco al selector de lugar; al cancelar, foco al botón «Agregar nuevo lugar», sin cambiar el diseño.
- Retorno del foco al botón «Editar programación» tras Cancelar y Escape.
- Trampa de foco en la ficha demo, Escape/cierre por botón, retorno a «Ver más» y restauración del scroll.
- Ficha demo sin programaciones: estado vacío, sin filas ni mapa.
- Comprobación pendiente hasta su resultado real: `npm run typecheck`, `npm run lint`, `npm run build` y matriz Playwright de 390, 432, 768 y 1415 px sobre el SHA final.

### Pendientes fuera de este lote

- Comparación automática de capturas contra un baseline visual aprobado; no se equiparan E2E y paridad pixel a pixel.
- Evaluación de criterios de `aria-describedby`, anuncios de errores e interacciones de lectores de pantalla; las pruebas de teclado no reemplazan auditoría WCAG.
- Revisión de diferencias intencionales de `ActivitySummary` entre sitio y consola antes de plantear una variante compartida, sin modificar la página pública sin autorización.

**Estado de integración:** PR de refactor en borrador; sin merge ni despliegue.


## Avance P6 — comparación visual real entre base y PR

### Implementación

- Nuevo workflow `.github/workflows/agenda-console-parity.yml` exclusivo de pull requests a `main` con cambios relevantes de Agenda.
- Nuevo `playwright.parity.config.ts` y suite aislada `tests/visual-parity/agenda-console-parity.spec.ts`: la suite visual **no** corre dentro del `npm run test:e2e` habitual, porque necesita su propia referencia.
- En cada matriz se descargan dos versiones exactas: `github.event.pull_request.base.sha` y `github.event.pull_request.head.sha`. Se sirven localmente en dos puertos diferentes, con idéntica versión de Chromium, sistema operativo, fuentes, viewport y casos de prueba.
- La primera pasada genera snapshots de **la base** usando `--update-snapshots`. La segunda compara el PR contra esas mismas imágenes mediante `toHaveScreenshot`. Los snapshots no se actualizan al comparar el PR: cualquier diferencia superior al umbral falla.
- Umbral declarado: `maxDiffPixelRatio: 0.0005` (0,05 % de píxeles diferentes), con `animations: 'disabled'`, `caret: 'hide'` y página completa.
- Matriz: **390, 432, 768 y 1415 px**. Se toman **20 capturas por viewport**, 80 comparaciones en total: estado inicial y siete casos seleccionables, tanto formulario como tarjetas; diálogos de edición, alta de lugar, alta de tipo y detalle de Yoga en Comunidad.
- Referencias, capturas fallidas, diffs y reportes se conservan como artefactos GitHub Actions durante 14 días.
- El módulo de pruebas usa IDs estables directamente, porque los módulos Vite con `import.meta.env` no deben importarse directamente en Node/Playwright. La espera de imágenes solo decodifica las ya cargadas; no bloquea en elementos ocultos o `loading=lazy`.

### Evidencia y criterio de aceptación

- [Comparación visual entre base y PR](https://github.com/SantiagoM96/mlz/actions/runs/42317346733): consultar el estado final de los cuatro proyectos, sin inferir aprobaciones de una ejecución parcial.
- [QA funcional habitual](https://github.com/SantiagoM96/mlz/actions/runs/42317346783) y [TypeScript, ESLint y build](https://github.com/SantiagoM96/mlz/actions/runs/42317346738) se ejecutan por separado.
- **Referencia técnica vs. referencia editorial:** las capturas de la base prueban que la refactorización no introduce cambios visuales significativos frente a esa versión; **no prueban** que el diseño sea el definitivo o esté aprobado por Comunicación. Todavía se necesita una referencia visual aprobada y revisión humana antes de integrar cambios que modifiquen estilos.
- No se consultó Figma, no se tocaron las páginas públicas, no se hizo merge y no se publicó este refactor.

### Próxima decisión

Una vez aprobadas paridad visual 4/4 y regresiones 4/4 sobre el código final, hacer revisión humana de los diffs y del PR antes de plantear su integración. Si el código base cambia, volver a ejecutar para verificar el nuevo contrato visual y resolver diferencias deliberadas en lugar de elevar la tolerancia.
