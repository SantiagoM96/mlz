# Guía de Trámites — auditoría y alcance de la corrección (20/11/2026)

## Fuentes y precedencia
1. Figma `hM1EXhH2gdRp3yLe1auQR4`, nodo `16459:6330`; fichas R036 desktop `16141:7145` y mobile `16242:5274`.
2. Lomas UI del propio repositorio (Geometria, Material Symbols, tokens CSS, layout).
3. Google Sheets **GUIA DE TRÁMITES - BASE FINAL**, identificador `1vFc6Q_wh1tDp4fbGnw7exqXdQM0u72QY_FUxKKBe_44`:
   - `CATALOGO DE TRÁMITES`: ID, títulos y descripciones públicas, etiquetas actuales, términos de búsqueda, modalidades y destinatarios para filtro.
   - `BASE NUEVA`: trazabilidad del R### con el relevamiento y decisiones de clasificación.
   - `ORIGEN`: detalle operativo sin publicar campos internos de responsables.
   - `REFERENCIAS`: normalizaciones.
   - `REVISIÓN DE ETIQUETAS`: propuestas **no adoptadas** si siguen pendientes.
4. La versión actual y el Excel RESPUESTAS FINALES solo sirven como contraste.

## Resultados verificables de la auditoría
- La lectura directa de `CATALOGO DE TRÁMITES` devolvió **125 registros R### y ningún ID duplicado**.
- Se compararon los 125 registros con `src/data/tramites.json`: **0 discrepancias** en identificador, categoría, nombre, descripción, modalidad, etiquetas vigentes, sinónimos y destinatarios del filtro.
- El catálogo editorial tiene **11 categorías distintas**; algunas composiciones de Figma muestran 12. No se añadieron categorías por inferencia.
- `BASE NUEVA` y `ORIGEN` tienen **133 registros**; el catálogo autorizado selecciona 125. No se importaron los ocho restantes.
- En Figma, R036 muestra columna principal de 770 px y lateral de 390 px, separadas 40 px, con índice, acciones, secciones, documentación e información de sede. La versión mobile (390 px) traslada el índice y las acciones antes de los bloques de contenido.
- La implementación previa repetía la descripción y presentaba información mediante secciones apiladas, trasladaba relacionados a la columna lateral y agregaba un enlace de ayuda genérico. Estos son desajustes frente a la ficha R036.
- El script histórico `scripts/generate-tramites-catalog.mjs` aún lee RESPUESTAS FINALES para un prototipo independiente; **no usarlo para actualizar** `src/data/tramites.json`. Debe migrarse separadamente antes de reutilizarlo para datos editoriales.

## Cambios de esta rama
- Estructura de ficha reorganizada: cabecera, contenido principal, documentación, sede, costos/plazos condicionales, normativa, relacionados; índice y compartir/imprimir en lateral (desktop) y antes de los bloques (mobile).
- Ocultación de bloques vacíos y retirada de una ubicación genérica inventada cuando no hay datos.
- Conservación de los 125 registros editoriales y las rutas React Router existentes.
- `npm run validate:tramites`: valida estructura, IDs únicos, cantidad de registros y valores requeridos.
- `npm run validate:tramites -- /ruta/catalogo.csv`: compara los campos públicos con un CSV exportado de **CATALOGO DE TRÁMITES** de la base editorial autorizada.

## Pendiente de aprobación/validación
- Completar la paridad visual por captura en 1440, 768 y 390 px; revisar todas las variantes condicionales de Figma.
- Validar en navegador en distintos registros; R036 por sí sola no cubre todos los formatos de horarios, costos, documentación ni pasos.
- Realizar verificación de campos de detalle uno por uno contra ORIGEN, en especial texto multilineal, costos, enlaces, dirección y horarios, sin publicar datos personales.
- Implementar transformador reproducible a partir de exportaciones *de la base final*, no del Excel de relevamiento, y retirar o aislar el flujo antiguo.
- Resolver editorialmente la divergencia 11 vs 12 categorías sin inventar una categoría.
- Ejecutar `npm run typecheck`, `npm run lint`, `npm run build:pages`, tests existentes y pruebas de URL directa en GitHub Pages antes de considerar merge/publicación.

Este documento **no** certifica paridad visual total, pruebas ejecutadas ni despliegue. No fusionar automáticamente sin revisiones y CI.
