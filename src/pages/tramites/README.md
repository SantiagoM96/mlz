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
