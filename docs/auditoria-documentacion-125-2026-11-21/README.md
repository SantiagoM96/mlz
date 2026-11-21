# Auditoría documental de los 125 trámites — 21/11/2026

**Alcance:** campos de `documentacion` de 125 registros en `src/data/tramites.json`, rama main.
**Estado:** inventario técnico y propuesta de normalización. **No modifica ninguna ficha ni la base editorial**. Los requisitos propuestos requieren validación de las áreas responsables antes de publicarse.

## Entregables
- `matriz-requisitos.csv`: una fila por segmento identificado, con trámite, texto separado, nombre normalizado, categoría, tipo de contenido, observación y campo original completo.
- `diccionario-documentos.csv`: agrupación por nombre propuesto, frecuencia de trámites, IDs y variantes textuales observadas.
- `vista-por-tramite.csv`: índice de los 125 trámites y requisitos extraídos.
- `pendientes-editoriales.csv`: aspectos ambiguos, campos que no son documentos y condiciones a revisar.

## Cifras de revisión
- Registros analizados: **125**.
- Segmentos propuestos para evaluación: **513**.
- Familias o nombres normalizados: **146**.
- Registros que contienen segmentos de baja certeza: **14**.
- Fragmentos marcados para revisión editorial/contextual: **298**.
- Casos sin segmentos: **0**.

## Advertencias de método
1. Los delimitadores se interpretaron en base al texto editorial: listas por guiones, números, saltos de línea y algunas comas. **No se presume que toda coma divida documentos**. Las excepciones complejas tienen separaciones supervisadas.
2. Un documento puede ser **alternativo**, **condicional**, parte de un conjunto o corresponder solo a un perfil. Las frecuencias no equivalen a documentos obligatorios para todas las personas.
3. La agrupación se hizo por familias documentales, no por equivalencia legal. Ejemplo: boleta de TSG, pago de TSG y libre deuda de TSG **no son lo mismo**.
4. «Aysa» en R037 no permite saber si piden una factura, constancia, certificado o informe. No se inventó.
5. «DNI» también aparece dentro de campos compuestos y notas; revisar antes de usar los conteos como indicadores de requisitos obligatorios.
6. Las propuestas de palabras normalizadas son **borradores editoriales**; conservar siempre `extraido` y `original` al decidir cambios.

## Ejemplo R037
Texto original: Plano del proyecto. Factura de Edesur vigente. Escritura. Impuesto inmobiliaro, Aysa, Informe catastral, impuesto Municipal. Plancheta catastral
Segmentos propuestos: Plano del proyecto · Factura de Edesur vigente · Escritura · Impuesto inmobiliaro · Aysa · Informe catastral · impuesto Municipal · Plancheta catastral.
**Pendiente**: «Aysa» no identifica el documento solicitado. También «impuesto municipal» requiere precisar si basta boleta o se pide pago/libre deuda.

**Fuente**: https://github.com/SantiagoM96/mlz/blob/main/src/data/tramites.json

## Consideraciones de clasificación
- **22 segmentos en 14 trámites** tienen incertidumbres explícitas que impiden afirmar el documento exacto sin consultar al área correspondiente.
- **298 filas** integran la vista amplia de revisión: incluyen ítems condicionales, datos, notas y otros casos que necesitan clasificación contextual. No deben interpretarse como 298 errores.
- Los **513 segmentos** son una propuesta auditable, no una versión lista para publicación. Las condiciones y alternativas de cada trámite deben conservarse al separar requisitos en fichas.
- Se revisaron todas las cadenas disponibles en el catálogo publicado. No se volvió a descargar el Excel editorial original durante esta auditoría; antes de cambiar la web conviene validar las propuestas contra la fuente editorial y las áreas responsables.
- `R092` («Título de propiedad de D.N.I.»): no se presume que signifique «título de propiedad y DNI».
- `R051`: las imágenes de estudios clínicos se agrupan como evidencias médicas, no fotografías generales.
