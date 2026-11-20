# Guía de trámites (React + TypeScript)

## Alcance
Implementación del nodo Figma **16459:6330** (catálogo desktop/mobile, filtrado por tema y ficha individual), integrada al sitio Vite en rutas:
- /tramites
- /tramites/:id

No reemplaza ni borra el prototipo histórico de public/prototipos/guia-de-tramites/.

## Datos
Snapshot público de **125 registros** exportados de la hoja **CATALOGO DE TRÁMITES** de **GUIA DE TRÁMITES - BASE FINAL** (20/11/2026). Los campos de la ficha se cruzan por "Fila Excel origen" con la pestaña ORIGEN de la misma base; el ID R### es estable. Se guardan únicamente campos públicos del trámite. Se excluyen nombres, direcciones de correo y teléfonos de responsables, observaciones administrativas y campos internos. Cadenas de contacto embebidas se redactan.

**ATENCIÓN:** es información pendiente de validación municipal; no se debe considerar un canal transaccional ni una publicación oficial validada. No se inventan costos, horarios, requisitos o direcciones cuando faltan.

## Implementación
- src/data/tramites.json: snapshot estático revisable en Git.
- src/data/tramites.ts: tipos y normalización de búsqueda.
- src/pages/tramites/TramitesPages.tsx: catálogo filtrable y ficha de detalle.
- src/pages/tramites/tramites.css: adaptación de Figma con tokens MLZ, Geometria y Material Symbols del proyecto.
- Se reutilizan SiteLayout, PageContainer, Breadcrumbs y MaterialIcon.

No se conecta una planilla de Drive desde el navegador (sin credenciales ni solicitudes a hojas institucionales). Para refrescar datos se debe reexportar el catálogo y volver a verificar contenido público y las validaciones editoriales.

## Sincronización reproducible con la planilla editorial final

Exportar exclusivamente desde [GUIA DE TRÁMITES - BASE FINAL](https://docs.google.com/spreadsheets/d/1vFc6Q_wh1tDp4fbGnw7exqXdQM0u72QY_FUxKKBe_44/edit) tres archivos CSV, con cabeceras intactas:

- `CATALOGO DE TRÁMITES` → `catalogo.csv`.
- `BASE NUEVA` → `base-nueva.csv`.
- `ORIGEN` → `origen.csv`.

Ejecutar:
```bash
npm run sync:tramites -- ./catalogo.csv ./base-nueva.csv ./origen.csv
npm run validate:tramites
npm run sync:tramites -- ./catalogo.csv ./base-nueva.csv ./origen.csv --check
```
No incorporar ni subir al repositorio los CSV de entrada (contienen datos administrativos y contactos personales). Se seleccionan únicamente los 125 registros del catálogo, enlazados por ID R### y fila de ORIGEN. Los nombres, categorías, descripciones y etiquetas vigentes provienen de CATALOGO; las propuestas pendientes en REVISIÓN DE ETIQUETAS no se aplican. La app consulta únicamente el JSON estático sin exponer Google Drive ni credenciales.

La normalización específica de la sede R036 elimina de la línea de dirección el texto de canal de contacto ya registrado en la columna de canales, sin publicar el email del relevamiento. Los enlaces se usan solo si son URL HTTP(S) presentes en ORIGEN; los enlaces internos a Google Drive se excluyen de los datos públicos.

`scripts/generate-tramites-catalog.mjs` pertenece al **prototipo histórico independiente** de 91 fichas. No debe usarse para actualizar el catálogo React de 125 trámites.
