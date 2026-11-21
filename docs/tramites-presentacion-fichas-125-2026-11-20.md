# Presentación de documentación y procedimientos en las 125 fichas

20 de noviembre de 2026.

## Alcance y fuente de verdad

Auditoría de las **125 fichas**, partiendo de [GUIA DE TRÁMITES - BASE FINAL](https://docs.google.com/spreadsheets/d/1vFc6Q_wh1tDp4fbGnw7exqXdQM0u72QY_FUxKKBe_44/edit) y del informe previo `docs/tramites-auditoria-integral-125-2026-11-20.md`.

Esta revisión modifica únicamente las transformaciones de presentación de `tramites-format.ts` y sus pruebas. No cambia `src/data/tramites.json`, las categorías, las descripciones públicas, los enlaces ni las respuestas de ORIGEN.

## Defecto y corrección

- Un conjunto de 47 fichas contenía etapas reconocibles que se mostraban como un párrafo continuo. Sus separadores fueron verificados por ID contra ORIGEN, y ahora se presentan en el `tram-timeline` institucional.
- La lectura es conservadora: nunca se separan todas las comas indiscriminadamente ni se interpreta una rama condicional como una etapa obligatoria. Se conservan como texto los casos ambivalentes (por ejemplo R015, R035, R050, R051, R062 y R116).
- En R041 la primera línea de documentación mezclaba el documento «Plano Obra» con una cláusula condicional. Ahora se muestra «Plano Obra» como documento y la salvedad original en una nota; los demás documentos no cambian.
- En R010, R011 y R013, los documentos separados en ORIGEN ya no se representan como un solo archivo; R012 separa los dos documentos base de una documentación adicional condicional.
- Las fichas R015, R056, R062, R104 y R131 describen condiciones, alternativas o datos en lugar de un documento inequívoco: se muestran como notas sin ícono de archivo ficticio. R077 conserva la información pública del requerimiento, omitiendo una sugerencia interna de diseño de formulario que no es un requisito ciudadano.
- Se mantienen R051 y R116 como notas documentales, R033 como lista no numerada y los registros sin procedimiento real (R052 y R125) sin ese módulo.

**IDs con nueva representación de pasos:** R117, R122, R124, R087, R097, R099, R102, R001, R028, R081, R082, R083, R084, R085, R086, R088, R100, R101, R103, R107, R108, R109, R110, R112, R113, R005, R014, R027, R057, R058, R059, R061, R065, R067, R069, R071, R073, R075, R079, R068, R070, R094, R104, R003, R004, R007, R008.

## Comprobaciones

- Contraste directo con las pestañas **CATALOGO DE TRÁMITES** y **ORIGEN**: 125/125 registros, sin cruces de identidad; 13 diferencias de espacios previamente conocidas.
- `tests/e2e/tramites-integridad-125.spec.ts` comprueba todas las fichas en desktop 1415 px y móvil 390 px.
- `tests/e2e/tramites-react.spec.ts` incorpora aserciones independientes sobre cantidad y contenido de pasos, documentación condicional y casos preservados.
- La ejecución de CI se verificará en el pull request; la existencia de las pruebas no equivale a que hayan pasado.

## Pendientes editoriales

Los textos condicionales complejos, con bifurcaciones del circuito administrativo o documentación variable según el tipo de gestión, requieren una aprobación de desglose antes de convertirse en bloques de opciones. La normalización visual no debe cambiar la sustancia de la información.
