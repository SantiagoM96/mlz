# Registro piloto de cambios — Crónica DEV

Este documento enumera los cambios aprobados o en prueba en Crónica DEV desde el inicio de la nueva etapa. Replicar en **BAE DEV** y **Diario Show DEV** solo por solicitud expresa, adaptando los colores y módulos específicos de cada producto.

## Cambio 01 — Foco de acordeones y tecla Shift (2026-11-12)
**Estado:** implementado en Crónica DEV; pendiente de validación visual del usuario y de replicación.

**Problema:** sobre las cabeceras de Páginas, Diseño de placas y otros acordeones aparecía ocasionalmente un segundo rectángulo rojo al presionar Shift o usar Shift + clic. Dependía de si el botón había recibido previamente foco con el mouse, incluso antes de hacer clic con Shift.

**Corrección:**
- Registrar el origen de foco por pointer en la cabecera con atributo `data-pointer-origin`.
- Suprimir el contorno extra `:focus-visible` solamente cuando proviene del mouse, inclusive si el usuario presiona Shift después.
- Restaurar la visualización de foco al navegar mediante teclado (Tab, Enter, Espacio o flechas).
- Conservar Shift + clic global, clic normal individual y el pulso exterior original de la tarjeta (1,05 s; 1 px de borde base + resplandor exterior 2 px), color institucional de Crónica.
- Verificar estados abierto/cerrado, Shift antes/después, hover con Shift y cambios entre acordeones.

**Archivos Crónica DEV:** `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.

**QA:** `scripts/editorial-dev-context-smoke.mjs` comprueba combinaciones de Shift sobre Crónica.

**Para replicar:** copiar la lógica y el estilo de foco según la estructura DOM de cada editor, no reemplazar sus colores de marca ni sus variantes exclusivas.

## Cambio 02 — Pulso contextual en preview y onboarding; máscara redondeada (2026-11-12)
**Estado:** implementado en Crónica DEV; pendiente de validación visual del usuario y de replicación.

**Objetivo y reglas:**
- En desktop, hacer clic en el logo de la preview abre `Diseño de placas`; hacer clic en el titular abre `Textos`. Cada tarjeta se desplaza para quedar centrada en el área visible y recibe el mismo pulso exterior rojo que al abrir un acordeón.
- El pulso se debe reiniciar también cuando la tarjeta ya estaba abierta: 1,05 s, borde base gris de 1 px, anillo exterior rojo institucional de 2 px, sin modificar el tamaño ni sumar otro contorno de foco.
- Al pasar con «Siguiente» o «Anterior» a cada tarjeta dentro del onboarding, forzar el pulso rojo aunque el acordeón ya esté expandido. El paso sobre la preview y el modal final no tienen tarjeta de controles propia, por lo que no se les aplica pulso de acordeón.
- La ventana transparente del spotlight del onboarding debe tener **radio de 12 px**, sin cambiar márgenes ni tamaño. Se reemplaza el oscurecimiento en cuatro piezas visibles por una sombra exterior muy grande alrededor de un elemento transparente con `border-radius:12px`. Los cuatro rectángulos de intercepción de clics se conservan transparentes para impedir interactuar con el fondo. El paso final permanece como modal con fondo oscurecido completo.
- El paso de preview conserva sus hotspots interactivos, y las tarjetas usan sus mismos estilos en desktop y mobile.

**Archivos en Crónica DEV:** `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/js/onboarding.js`, `public/cronica-dev/css/onboarding.css` e index para actualización de caché.

**QA:** `scripts/editorial-dev-context-smoke.mjs` comprueba pulso de preview, reinicio de pulso en los pasos de módulos y radio/sombra del spotlight.

**Replicación futura:** adaptar al color institucional y al selector de tarjeta de Diario Show y BAE, conservando sus diferencias de pasos, geometrías y controles.

## Cambio 03 — Navegación de Páginas sobre Vista previa (2026-11-12)
**Estado:** piloto implementado en Crónica DEV; pendiente de aprobación visual del usuario. No replicado a BAE ni Diario Show.

**Diseño e interacción:**
- Quitar el módulo `Páginas` del panel de acordeones `Formato`. El primer acordeón debe ser `Diseño de placas`.
- Mover **el mismo elemento DOM** de Páginas a la parte superior de Vista previa, en reemplazo de la barra de instrucciones `Vista previa activa · Arrastrá la foto para reencuadrarla`. El nodo `#status` permanece oculto para no romper mensajes internos de app.js.
- El nuevo navegador no tiene cabecera ni chevrón: contiene indicador `N de N · Portada/Interior`, lista de miniaturas y controles.
- Miniaturas de 48×64 px, una sola fila con scroll horizontal y selección roja; las inactivas conservan sus grises. La página seleccionada se mantiene visible al agregar o cambiar de página sin desplazar verticalmente la ventana.
- Botones Añadir y Eliminar en columna derecha de dos filas, 30×30 px. La barra mantiene una altura fija al aumentar de 1 a 10 o más páginas.
- Funciona en desktop y en la pestaña Vista previa de mobile; los nodos originales retienen los listeners de agregar, seleccionar y eliminar.
- El primer paso del onboarding ahora apunta al navegador fijo sobre la preview y le aplica el mismo pulso rojo (1,05 segundos); el resto del tour conserva su comportamiento.

**Archivos piloto:** `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/js/app.js`, `public/cronica-dev/js/onboarding.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.

**QA:** `scripts/editorial-dev-context-smoke.mjs` verifica la nueva ubicación, eliminación del acordeón, 10 páginas sin crecimiento vertical, selección y eliminación, y el pulso del onboarding.

**Replicación futura:** la incorporación de Páginas en Diario Show y BAE requiere adaptar sus motores de estado, exportación e independencia de placas; no debe consistir en copiar solamente este CSS.

## Cambio 04 — Cabecera Diapositivas y tarjeta punteada para añadir (2026-11-12)
**Estado:** piloto implementado en Crónica DEV; pendiente de aprobación visual. No replicado a BAE ni Diario Show.

**Detalles:**
- El navegador fijo de la preview lleva título **Diapositivas** a la izquierda (negrita, como las cabeceras de Formato, sin icono) y contador `N de N` con distintivo `Portada/Interior` alineados a la derecha.
- La lista de diapositivas termina con un botón de 48 × 64 px, mismo formato de miniatura, borde punteado de 2 px y un ícono Material Icons `add` centrado. Al pulsarlo invoca el mismo método original de agregar diapositiva, no crea lógica paralela.
- El placeholder se desplaza al final conforme se agregan diapositivas y se integra al scroll horizontal; cuando el ancho total desborda se hace visible el botón **+** fijo al lado del botón Eliminar, ubicado a la derecha por encima de la pista. Mientras el placeholder cabe, el botón + fijo se oculta para evitar duplicación visual.
- La fila mantiene una sola línea y la misma altura; las miniaturas y el placeholder se desplazan por debajo de las acciones fijas cuando hay desborde.
- El botón Eliminar conserva sus reglas y se mantiene fijo. El anillo exterior rojo y el relleno de la miniatura seleccionada no se alteran.
- Aplica a desktop y a la pestaña Vista previa mobile.

**Archivos:** `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/js/app.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.

**QA:** `scripts/editorial-dev-context-smoke.mjs` verifica posición del título y contador, aparición del placeholder, agregado hasta diez diapositivas, altura fija, aparición del botón fijo, añadido y borrado.

**Replicación futura:** depende del cambio 03 y de implementar previamente la arquitectura multi-página en cada editor; no copiar hasta recibir autorización.

## Ajuste 05 — Controles fijos y espacio de desplazamiento (2026-11-12)
**Estado:** aplicado solo a Crónica DEV, pendiente de validación visual y replicación.

- El botón Eliminar permanece anclado en el extremo inferior derecho, incluso cuando se muestra el botón + de desborde.
- El botón + rojo aparece únicamente arriba del tacho, sin desplazarlo ni centrar la columna de controles.
- La pista horizontal conserva altura constante (84 px), agrega espacio inferior respecto de las miniaturas (12 px de padding en vez de 5 px) y mantiene scroll horizontal.
- La cabecera `Diapositivas` utiliza la misma tipografía que las cabeceras de los acordeones: system-ui, 13 px, peso 600, interlineado 20 px y capitalización normal.
- No se altera el motor de selección, agregado o eliminación, ni BAE/Diario Show.

**Archivo:** `public/cronica-dev/css/modern-editor.css` y versión de caché de `public/cronica-dev/index.html`.

## Ajuste 06 — Anillo visible y botones compactos (2026-11-12)
**Estado:** aplicado exclusivamente a Crónica DEV; pendiente de confirmación visual del usuario.

- La fila desplazable tiene 96 px de alto, con 10 px de espacio superior y 14 px inferior para mostrar completo el contorno rojo exterior de 2 px con offset de 2 px sin recortes.
- El área de los botones también tiene 96 px. Los botones se ubican en dos posiciones fijas de 30 px, separadas por 6 px, centradas verticalmente.
- El tacho permanece en la segunda posición independientemente de la aparición del botón + rojo en la primera; ya no quedan separados por un margen automático.
- Se conserva el scroll horizontal, la selección y la lógica original de agregar/eliminar.

**Archivos:** `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.

## Cambio 07 — Todas las placas pueden ser Portada, Interior o Sin diseño (2026-11-12)
**Estado:** implementado solo en Crónica DEV, pendiente de validación final.

- Las tres variantes están disponibles para cualquier diapositiva, independientemente de la posición. La primera sigue siendo la única que no se puede eliminar, pero su diseño es modificable.
- Se añadió `Sin diseño` como primera opción: miniatura gris uniforme con borde gris oscuro; lienzo exportado gris uniforme, sin textos, fotografía, logo ni franja.
- Las nuevas páginas se crean con variante `blank` y cada página mantiene el diseño que selecciona el editor.
- Miniaturas e indicador reflejan el estado real; Portada e Interior conservan sus formatos.
- Se oculta la barra de scroll horizontal; se navega arrastrando con el mouse en escritorio y deslizando con el dedo en mobile. Se evita activar una miniatura al terminar un arrastre.

**Archivos:** `public/cronica-dev/js/app.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.
**Pendiente de replicación:** BAE y Diario Show, solo con autorización expresa.

## Cambio 08 — Visibilidad contextual de los controles de Diseño de placas (2026-11-12)
**Estado:** implementado solo en Crónica DEV; pendiente de validación visual.

- **Portada:** opciones de diseño, logo y Firma inferior visibles.
- **Interior:** Firma inferior oculta, porque este diseño no la dibuja; logo y resto de controles pertinentes visibles.
- **Sin diseño:** solo quedan las variantes de diseño; se ocultan logo, firma y módulos de fotografía/textos hasta elegir un diseño que los utilice.
- La regla se aplica al panel original y al editor contextual de la vista previa, también al cambiar de diapositiva.
- Se conservan los valores de los controladores ocultos; no se eliminan al cambiar de variante.

**Archivos:** `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.
**Pendiente de replicación:** BAE y Diario Show, con autorización expresa.

**Registro acumulativo:** 8 cambios en Crónica DEV; 8 pendientes de evaluación/adaptación en los otros productos.

## Cambio 09 — Volanta activa con texto explicativo por defecto (2026-11-12)
**Estado:** implementado únicamente en Crónica DEV; pendiente de validación visual.

- En la página inicial de Portada, la volanta viene activada con el texto de ejemplo: `ESCRIBÍ ACÁ UNA FRASE BREVE QUE PRESENTE LA NOTICIA`.
- Cada nueva diapositiva **Sin diseño** conserva internamente una volanta activada y el mismo texto de ejemplo; al seleccionar **Portada** o **Interior** se muestra con texto desde el primer momento.
- El texto de ejemplo es editable; no se vuelve a imponer al cambiar de diseño o de página para no sobrescribir contenido del usuario. Los valores propios de cada diapositiva se conservan.
- El botón Limpiar recupera el texto de ejemplo de la variante activa; el resto de la lógica de selección, renderizado y exportación no se modifica.

**Archivos:** `public/cronica-dev/js/app.js`, `public/cronica-dev/index.html`.
**Registro acumulativo:** 9 cambios en Crónica DEV; pendientes de evaluación/adaptación en BAE y Diario Show, sin replicar todavía.

## Cambio 10 — Volanta más alta y tipografía ampliada (2026-11-12)
**Estado:** aplicado solo en Crónica DEV; pendiente de validación visual en navegador.

- Altura de volanta: **Portada 52 → 68 px** (aprox. +30,8 %) e **Interior 50 → 65 px** (+30 %), sin variar el ancho ni los márgenes laterales.
- Tamaño inicial del texto: **Portada 34 → 37 px**; **Interior 32 → 35 px**. Se conserva el autoajuste de fuente para textos largos.
- Portada: la volanta se mantiene centrada sobre el borde entre la foto y la caja blanca; el espacio inferior entre volanta y titular continúa siendo 50 px.
- Interior: se recalcula la posición superior de la caja para mantener la separación con el titular al crecer la volanta.
- El ajuste se dibuja en el mismo canvas que se exporta a PNG, por lo que preview y exportación usan medidas idénticas.

**Archivos:** `public/cronica-dev/js/app.js`, `public/cronica-dev/index.html`.
**Registro acumulativo:** 10 cambios en Crónica DEV; sin replicar a BAE ni Diario Show.

## Cambio 11 — Sin diseño no tiene controles de volanta (2026-11-12)
**Estado:** aplicado solo a Crónica DEV; pendiente de validación visual.

- La variante `Sin diseño` muestra únicamente la elección de formato; se ocultan el módulo de Textos, el interruptor `Mostrar volanta`, su campo y los controles de Fotografía/Logo/Firma.
- En la vista contextual mobile se aplica la misma regla a los campos clonados.
- Al cambiar de `Sin diseño` a `Portada` o `Interior`, se activa automáticamente `Mostrar volanta` y se recupera el texto explicativo por defecto si estaba vacío.
- Se mantiene la posibilidad de desactivar manualmente la volanta en las variantes que sí tienen diseño; los valores existentes no se borran.

**Archivos:** `public/cronica-dev/js/app.js`, `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.
**Registro acumulativo:** 11 cambios solo en Crónica DEV; BAE y Diario Show pendientes de replicación por solicitud expresa.

## Cambio 12 — «Sin diseño» realmente vacío y volantas breves (2026-11-12)
**Estado:** implementado únicamente en Crónica DEV; pendiente de validación visual del usuario.

- El texto inicial editable de la volanta pasa a `RESUMÍ ACÁ EL TEMA` para Portada e Interior, en lugar del anterior ejemplo largo.
- Tipografía inicial de la volanta: Portada **37 → 40 px** e Interior **35 → 38 px**, conservando el autoajuste de tamaño para texto largo y las alturas ya aprobadas (68 / 65 px).
- La variante de la página queda reflejada en `html[data-cronica-variant]` y determina la visibilidad de tarjetas completas con CSS, no solo de los controles individualmente. En `Sin diseño` se ocultan Texto, Mostrar volanta, Fotografía, Logo y Firma en el panel normal y el contextual mobile; solo queda el selector de diseños.
- Al seleccionar Portada o Interior reaparecen los módulos pertinentes con la volanta habilitada por defecto y texto de ejemplo; las personalizaciones posteriores no se pierden al alternar páginas.

**Archivos:** `public/cronica-dev/js/app.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.
**Registro acumulativo:** 12 cambios exclusivos de Crónica DEV; ninguno replicado aún a BAE ni Diario Show.

## Cambio 13 — Volanta oculta en Sin diseño y edición visual del texto (2026-11-12)
**Estado:** implementado en Crónica DEV; pendiente de validación funcional y visual en navegador.

- Se corrige el selector real del módulo: si la variante es `Sin diseño`, se oculta **el contenedor completo de Mostrar volanta**, aunque esté ubicado físicamente dentro de `Diseño de placas`. También se contempla el clon contextual de mobile.
- El campo `Texto principal` incorpora edición visual con `contenteditable`, mostrando destacados en **negrita**, cursivas y tachados sin exponer `*`, `_` ni `~`.
- Los botones de formato alternan activación/desactivación sobre un fragmento seleccionado. El botón Limpiar formato elimina los tres efectos en la selección.
- Se mantiene un textarea original oculto como fuente para el motor actual de Canvas y exportación: el destacado permanece rojo en el PNG; negrita es solo la representación en el controlador.
- La edición se sincroniza con la carga de páginas y el editor contextual mobile. Las ediciones de texto se convierten al formato interno de forma transparente.

**Archivos:** `public/cronica-dev/js/rich-headline.js` (nuevo), `public/cronica-dev/js/modern-editor.js`, `public/cronica-dev/css/modern-editor.css`, `public/cronica-dev/index.html`.
**Registro acumulativo:** 13 cambios exclusivos de Crónica DEV, pendientes de evaluación para BAE y Diario Show.

---

## Replicación a BAE DEV y Diario Show DEV — lote de los cambios 01–13

**Solicitada y autorizada el 12/11/2026.** Destino exclusivo: `public/bae-dev/` y `public/diarioshow-dev/`, sin modificaciones en BAE o Diario Show de producción.

### Adaptaciones compartidas aplicadas

- **Cambios 01–02 (foco/onboarding):** se incorporó la supresión del foco duplicado con Shift para cabeceras activadas por mouse; Tab y teclado conservan el foco accesible. Se añadió un primer paso de onboarding para la navegación multipágina. Los demás pasos y particularidades del recorrido de cada marca se conservaron.
- **Cambios 03–06 (navegación):** se incorpora una tarjeta fija `Diapositivas` sobre la preview, con contador, miniaturas seleccionables, placeholder punteado al final y controles de agregar y eliminar en una columna lateral. El botón rojo/rosa fijo aparece cuando hay desborde. La barra de scroll está oculta; mouse arrastra y touch desliza; los botones permanecen fijos y las miniaturas no aumentan la altura del bloque.
- **Cambio 07 (multipágina/Sin diseño):** se incorpora un estado de placa completamente gris y sin componentes exportados. La primera página puede cambiar de variante y cada página siguiente nace en estado `Sin diseño`. Las páginas mantienen fotografía, zoom, textos y configuración editorial propios. BAE conserva **Negro, Blanco y Rojo**; Diario Show conserva **Variantes 1 a 4** en lugar de sustituirlas por Portada/Interior de Crónica.
- **Cambio 08 (controles contextuales):** `Sin diseño` oculta los paneles de contenido/fotografía/importación y las opciones de logo/firma que no aplican. En Diario Show las variantes de cita 3 y 4 no ofrecen el estilo de firma inferior. Se preservan valores al alternar páginas.
- **Cambios 09–12 (volantas):** **específicos de las plantillas de Crónica**. No se agregaron volantas rojas a los layouts BAE o Diario Show, que tienen otros recursos y composiciones. El principio transversal —que `Sin diseño` no muestre ningún recurso ni controlador de contenido— sí se aplica.
- **Cambio 13 (edición visual):** se integró un editor enriquecido para titulares. El controlador muestra negrita en vez de marcadores de destacado, además de cursiva y tachado; los botones alternan el estilo sobre una selección. El motor de Canvas y PNG continúa recibiendo el formato interno `*`, `_` y `~`.

### Implementación y arquitectura

- Nuevo módulo compartido (copia adaptada por marca): `js/page-carousel.js` y `css/page-carousel.css`.
- Editor enriquecido: `js/rich-headline.js`.
- Nuevos métodos `getPageState()`, `setPageState()` y `setBlank()` en los motores existentes `js/editor.js`. La instancia de cada marca continúa dibujando su Canvas original de 1080×1440 px.
- Exportación múltiple en PNG individuales, con nombre de marca, número de diapositiva y fecha/hora; separación de un segundo entre descargas. Cuando hay más de una página se muestra el diálogo `Solo esta / Todas / Cancelar`. Si hay una sola, se mantiene la descarga directa original.
- Los importadores, variantes originales de diseño, fotografía compartida exclusiva de Diario Show, logos y controladores de cada producto se mantienen.
- Onboarding adaptado en `js/onboarding.js`; las plantillas originales no se sustituyen por los colores de Crónica.

### Estado de QA y próximos controles

- **Verificado en repositorio:** archivos creados y enlazados en los dos index DEV; los motores y módulos JavaScript modificados pasan análisis sintáctico.
- **Pendiente:** prueba de funcionamiento real en navegador desktop/mobile (agregar y borrar, selección por arrastre, volver a una página editada, fotografía compartida de Diario Show y descarga de todas las páginas); prueba visual de la miniatura `Sin diseño` y de la edición enriquecida con selección y alternancia de estilos.
- Estas pruebas pendientes impiden afirmar paridad funcional completa con Crónica y publicación visual verificada, aunque los cambios de código están guardados.

**Registro:** 13 cambios fuente de Crónica; lote de replicación a dos productos DEV iniciado y aplicado en código. En BAE y Diario Show quedan pendientes las verificaciones funcionales indicadas, no permisos ni instrucciones del usuario.
