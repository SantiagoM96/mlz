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


## Cambio 14 — Miniaturas fieles a Diseño de placas en los tres editores DEV (2026-11-12)
**Estado:** implementado en código; pendiente de validación visual.
- Crónica DEV: cada diapositiva reutiliza un clon visual de `.cronica-variant-thumbnail` según `blank`, `cover` o `internal`, manteniendo el arte exacto del selector.
- BAE DEV: cada diapositiva reutiliza un clon de `.theme-swatch-thumb` de Negro, Blanco, Rojo o Sin diseño; se conserva la clase de color correspondiente en el wrapper.
- Diario Show DEV: cada diapositiva reutiliza un clon de `.ds-variant-preview` de su variante 1–4 o Sin diseño.
- La selección solo añade el aro externo; no recolorea ni reemplaza el arte de las miniaturas.
- Sin diseño en BAE: gris liso `#aeb4bc`, borde `#565a63`; se desactiva el trazo generado por `::before`, sin textos ni líneas. Se aplica también al clon del paginador.
- Se mantiene la lógica independiente de variantes por página, de modo que cambiar de diseño actualiza la miniatura correspondiente.
- Ámbito: exclusivamente `cronica-dev`, `bae-dev`, `diarioshow-dev`; no modifica producción.


## Cambio 15 — Reparación de miniaturas recortadas o desplazadas (2026-11-12)
**Alcance:** Crónica DEV, BAE DEV y Diario Show DEV. Ajuste correctivo del Cambio 14.
- Problema reportado con captura: el arte aparecía pequeño, cortado o desplazado hacia un costado dentro de la miniatura y el número daba la impresión de empujar el layout.
- Causa: las copias visuales del selector de diseño heredaban reglas flex de su wrapper y combinaban escalas distintas entre wrapper y miniatura.
- Corrección: el elemento gráfico original se coloca en un sistema de coordenadas **60×80 px**, se escala **una sola vez al 80 %** hasta **48×64 px**, con `transform-origin: top left`. El contenedor de 48×64 permanece fijo y el número está en `position:absolute` con `z-index` superior.
- En Crónica se eliminó el wrapper flex adicional entre el contenedor y la miniatura original.
- En BAE y Diario Show, el wrapper de clase de variante se conserva únicamente para los estilos de marca, pero se fuerza a un bloque 60×80 y se escala en un único punto.
- La geometría se cubre con `scripts/editorial-thumbnails-smoke.mjs` y el workflow `.github/workflows/editorial-thumbnails-smoke.yml`. Se prueban todas las variantes, offset del dibujo, posición del número y nueva página sin diseño.
- **QA:** análisis sintáctico de scripts correcto; prueba automatizada en Chromium iniciada. El resultado debe consultarse antes de confirmar la validación visual.

**QA final del Cambio 15 (Chromium, 12/11/2026): APROBADO.** El workflow [Miniaturas DEV — geometría visual](https://github.com/SantiagoM96/mlz/actions/runs/43146913962) verificó las 12 variantes de los tres editores, dimensiones exactas 48×64 px, coincidencia de origen de miniatura y tarjeta, número centrado, actualización inmediata de variante y la creación de una nueva diapositiva `Sin diseño`. Se corrigió además el desfase temporal de selección en BAE/Diario Show mediante sincronización posterior al evento de selección. La publicación de GitHub Pages terminó correctamente en el run `43146913993`. **Nota:** los workflows antiguos de pruebas de contexto/onboarding siguen con fallos ajenos a esta geometría y necesitan una actualización independiente de sus expectativas.

## Cambio 16 — Contenido de muestra en nuevas diapositivas (2026-11-12)
**Estado:** implementado únicamente en Crónica DEV, BAE DEV y Diario Show DEV; pendiente de comprobación interactiva.

- Regla transversal: `Sin diseño` continúa siendo visualmente gris y sin elementos. Cada diapositiva nueva guarda una marca `samplePending` hasta su primera selección de diseño; **en ese momento** se cargan textos ficticios, editables y de longitud adecuada para el lienzo. No se sustituyen textos ya editados al cambiar otra vez de variante.
- **Crónica Portada:** volanta `CULTURA EN LA CIUDAD` y titular `Un nuevo espacio cultural abrió sus puertas y presentó actividades para toda la comunidad` (con destacado en espacio cultural).
- **Crónica Interior:** volanta `NUEVAS ACTIVIDADES` y texto `El espacio ofrecerá talleres, muestras y espectáculos durante todo el año. La programación incluirá propuestas gratuitas y actividades para distintas edades.` (con destacado).
- **BAE Negro/Blanco/Rojo:** titular ficticio sobre inversiones de una empresa argentina; textual ficticio `El objetivo es generar más empleo durante el próximo año`. El textual se activa al asignar la primera plantilla para que también se muestre, sin cambiar la identidad gráfica del diseño.
- **Diario Show variantes 1/2:** titular ficticio sobre una artista que sorprendió con un anuncio; variantes 3/4: frase de ejemplo con autor ficticio identificado como `Una artista invitada`, con autor activado.
- Se mantienen la exportación original y las configuraciones/ediciones posteriores de cada página. No se introduce fotografía de ejemplo ni se afirma que los hechos ficticios sean noticias reales.

**Archivos:** `public/cronica-dev/js/app.js`, `public/bae-dev/js/page-carousel.js`, `public/diarioshow-dev/js/page-carousel.js`.
**Registro acumulado:** 16 cambios; el Cambio 16 se aplica a los tres DEV, sin modificar producción.

**Verificación del Cambio 16 (Chromium, 12/11/2026): APROBADA.** [Prueba automatizada](https://github.com/SantiagoM96/mlz/actions/runs/43150967560): creación de diapositiva Sin diseño, elección de plantilla, contenido inicial para Crónica/BAE/Diario Show, volanta activa, textual de BAE, autor de cita de Diario Show y persistencia de modificaciones manuales. El ajuste adicional de Diario Show contempla el cambio entre una placa de titular y una de cita, adaptando los ejemplos solo si no se editaron. [Publicación DEV](https://github.com/SantiagoM96/mlz/actions/runs/43150967690) completada. Los tests heredados de contexto/onboarding continúan con incidencias independientes.

## Cambio 17 — Primera página con ejemplos y Sin diseño sin módulos (2026-11-12)
**Alcance:** Crónica DEV, BAE DEV y Diario Show DEV.
- **Causa de textos antiguos:** el Cambio 16 inicializaba nuevas diapositivas al seleccionar un formato, pero la primera diapositiva continuaba usando el contenido histórico hardcodeado en cada `index.html`. Se actualizaron los textos iniciales del HTML para que coincidan con los ejemplos del generador.
- **Crónica:** primera portada con volanta `CULTURA EN LA CIUDAD` y titular ficticio de espacio cultural.
- **BAE:** primera placa con titular ficticio de inversiones, textual activado y ejemplo sobre empleo. No se borran los textos editados por el usuario.
- **Diario Show:** primera placa con titular ficticio de una artista, autor ficticio `Una artista invitada`; se retiró la condición antigua del motor que sustituía un titular histórico por una cita ajena al ejemplo al seleccionar la variante 3/4.
- **Sin diseño:** refuerzo CSS del estado `data-editor-plate-variant="blank"` para ocultar en Diario Show todos los módulos del panel de Formato salvo `Diseño de placas`, el editor contextual de identidad/logo, el editor contextual de texto y los hotspots de logo/fotografía; BAE conserva únicamente el selector de variantes. Crónica mantiene sus controles contextuales anteriores.
- **QA:** ampliada `scripts/editorial-thumbnails-smoke.mjs` para verificar el texto inicial, el textual de BAE, la volanta de Crónica, el autor de Diario Show y que el estado vacío no muestre los módulos restantes. Pendiente de resultado de ejecución en Chromium.
- **Registro acumulado:** 17 cambios. Aplicados solamente a los tres DEV, sin modificar producción.


## Cambio 18 — Contorno de carga fotográfica igual a hotspots de texto y logo (2026-11-12)
**Estado:** aplicado a Crónica DEV, BAE DEV y Diario Show DEV; pendiente de verificación visual en navegador.
- Se sustituye el dibujo visible de línea fotográfica mediante SVG (`stroke-width:1`, `stroke-dasharray:5 3`) por el mismo **borde CSS `2px dashed`** que usan las selecciones de texto y logo.
- Se conserva el gris de fotografía `#41464e` (en lugar de los colores de marca).
- Se mantiene `border-radius:6px`, los insets del contenedor, el hover, el foco, la interacción drag & drop y el disparo de adjuntar. El contorno SVG se conserva invisible para no alterar el DOM/eventos.
- Diario Show: se aplica también el trazo a ambos placeholders de fotografía compartida sin alterar las mitades ni sus márgenes.
- No modifica el renderizado ni la exportación PNG. Solo UI de preview.
- **Registro acumulativo:** 18 cambios.

## Cambio 19 — Mover Mostrar volanta a Textos en Crónica DEV (2026-11-12)
**Alcance:** Crónica DEV únicamente. **Estado:** aplicado en código, pendiente de QA visual.
- Los controles originales de `Mostrar volanta` y `Texto de la volanta` se mueven desde la tarjeta `Diseño de placas` hasta `Textos`, directamente por encima de `Formato de texto`.
- Se preservan los listeners, la vista previa, el renderizado y los valores por diapositiva.
- El clon de edición contextual de textos también refleja el interruptor y el campo de volanta y sincroniza cambios con los controles principales.
- `Sin diseño` mantiene oculto todo el módulo de textos; no expone interruptor ni campo de volanta.
- No se modifica BAE ni Diario Show en este cambio.
**Registro acumulativo:** 19 cambios.

## Cambio 20 — Switch de volanta en Diseño, contenido en Textos (2026-11-12)
**Alcance:** únicamente Crónica DEV. Corrige y reemplaza la disposición del Cambio 19.
- El switch original `Mostrar volanta` permanece dentro de **Diseño de placas**, conservando su control y estado por diapositiva.
- Solo el campo editable `Texto de la volanta` se ubica en el módulo **Textos**, inmediatamente encima de `Texto principal`.
- El campo de texto aparece cuando el switch está activo y desaparece cuando está inactivo, sin borrar su contenido. No se muestran controles de volanta al usar `Sin diseño`.
- Las copias contextuales mobile de ambos módulos se sincronizan con el mismo switch/valor originales.
- Se actualizó prueba automatizada de composición y visibilidad del campo.
**Registro acumulativo: 20 cambios**, con los cambios 19 y 20 documentados como revisión de ubicación.

## Cambio 21 — Orden correcto de Formato de texto en Crónica DEV (2026-11-12)
**Estado:** aplicado exclusivamente en Crónica DEV; pendiente de prueba visual automatizada.
- En el módulo **Textos** se fija el orden: **Texto de la volanta** (si está activo) → **Formato de texto** → **Texto principal** → **Tamaño de tipografía**.
- El interruptor **Mostrar volanta** permanece en **Diseño de placas**, sin cambios en su funcionamiento.
- Se reubica el grupo de formato original sin recrearlo, preservando listeners, selección de texto, previsualización y exportación.
- **Propuesta UX para evaluar antes de implementar:** renombrar el label a «Formato del texto principal» y añadir una ayuda breve «Seleccioná una parte del texto principal para aplicar o quitar el formato». Este cambio de copy todavía no se implementa.
- **Registro acumulativo:** 21 cambios; BAE y Diario Show no se modificaron y la propuesta UX queda pendiente de definición para replicación.


## Cambio 22 — Botonera de texto igual a Diario Show en Crónica DEV (2026-11-12)
**Estado:** aplicado en Crónica DEV; pendiente de validación visual final.
- El módulo Textos adopta las proporciones y estilos del bloque equivalente de Diario Show: botones de formato **43×43 px**, separación de controles independientes, labels de **14 px / 600** y columnas alineadas.
- Los botones de alineación se presentan como un grupo segmentado **39×43 px** con bordes grises. El estado seleccionado tiene fondo gris `#3b3f46` y **anillo blanco interior de 1,5 px en los cuatro lados**, inclusive el lado compartido central. Es el mismo patrón que Diario Show.
- El botón de mayúsculas conserva su acento rojo institucional de Crónica cuando está activo. No se alteran los listeners del editor de texto enriquecido ni la selección del contenido, ni los demás elementos del panel.
- En mobile angosto, la alineación baja a una segunda fila para evitar desbordes.
- **Registro acumulativo:** 22 cambios. Esta transferencia ocurre únicamente en Crónica DEV; BAE no se modifica.

## Cambio 23 — Ubicación horizontal de logo en Crónica y BAE DEV (2026-11-12)
- Se replica el controlador de Diario Show: **Ubicación logo** con izquierda/derecha y botones segmentados de 39×43 px, estado seleccionado de anillo blanco interior.
- En Crónica y BAE el control aparece junto al selector de logo dentro de Diseño de placas. Derecha es el valor inicial; izquierda conserva el margen superior y lateral original de cada marca.
- La posición se guarda por diapositiva y se restaura al navegar; el PNG usa las mismas coordenadas que la preview.
- Se sincroniza la copia contextual de Diseño de placas con el control original para mobile.
- En Sin diseño no se muestran ni logo ni ubicación. Diario Show no se modifica.
**Registro acumulativo: 23 cambios.**

## Cambio 24 — Botón «+» fijo cuando desborda el paginador (2026-11-12)
- En Crónica DEV el control «+» de la columna derecha se mantiene en posición fija al desbordar las miniaturas, como en Diario Show, con la miniatura punteada desplazable al final.
- Se reservó la celda del botón y se corrigió el ancho flexible del contenedor; el estado visible depende del desborde, no de la posición del scroll.
- Pendiente de validación automatizada de interacción.

## Cambio 25 — Íconos para Firma inferior (2026-11-12)
- Crónica DEV: la opción **Centrada** incorpora Material Symbols `format_align_center` y **Carrusel** incorpora `view_carousel`, ambos a la izquierda del texto.
- Se conservan las etiquetas, estados seleccionados, tamaño de los botones y el comportamiento del control. La versión contextual clona automáticamente el mismo marcado.
- Registrar para evaluación antes de replicar a los demás editores.
**Registro acumulativo: 25 cambios.**

## Cambio 26 — Header con selector visual de plataformas (2026-11-12)
**Piloto aplicado solo a Crónica DEV.**
- Se quita el título «Generador de posteos Crónica» y se sustituye el bloque de marca por un selector horizontal de **Crónica, Diario Show y BAE Negocios** con sus SVG originales.
- La plataforma activa presenta color, tarjeta expandida y animación breve `pop`; las demás se muestran atenuadas en escala de grises y se iluminan al pasar el mouse o recibir foco.
- En Crónica DEV el logo Crónica está seleccionado; los otros dos enlaces llevan a sus URL DEV reales. Se conserva el botón «Volver» al menú principal.
- Responsive: las tres marcas permanecen en una fila con anchos flexibles en mobile y se respeta la preferencia `prefers-reduced-motion`.
- Este header se evalúa en Crónica antes de aplicar el mismo sistema en BAE y Diario Show; al navegar a estos últimos se sigue viendo por ahora su header anterior.
**Registro acumulativo: 26 cambios.**

## Cambio 27 — Header con logos sueltos y colores originales (2026-11-12)
**Piloto exclusivo de Crónica DEV**, pendiente de aceptación para replicar a BAE y Diario Show.
- Se eliminan las tres tarjetas, el fondo rojo activo, sombras, marcos y fondos de hover: quedan únicamente los tres SVG originales separados por espacio.
- Los SVG se mantienen sin filtros cromáticos internos. La desaturación de inactivos es `filter: grayscale(1)` aplicada al enlace completo, **sin** `brightness(0) invert(1)` (que convertía incorrectamente el logo de Diario Show en blanco).
- Activo: logo a color, un poco más grande y con animación breve; inactivos: escala de grises y opacidad moderada. Al pasar el cursor aumenta su legibilidad.
- Altura común de imágenes de escritorio 32 px y anchos proporcionales a los SVG; las vistas angostas reducen el espacio disponible y el tamaño sin deformar el logo.
- Se conservan las rutas entre los 3 DEV y el botón Volver; BAE DEV y Diario Show DEV no se modifican todavía.
**Registro acumulativo: 27 cambios.**

## Cambio 28 — Tamaños ópticos del selector de plataformas (2026-11-12)
- Crónica DEV exclusivamente: se abandona el alto uniforme de 32 px, que hacía que los logos más apaisados dominasen el header.
- En desktop el SVG de Crónica pasa de **32 a 40 px (+25 %)**, Diario Show a **24 px** y BAE Negocios a **18 px** de alto; todos conservan su relación de aspecto y ancho natural.
- Tamaños responsive específicos por marca, con reducción proporcional en pantallas angostas y sin volver a cajas/fondos ni alterar los colores originales.
- Permanecen el estado activo a color, los inactivos en grises, la expansión del activo, la navegación entre entornos DEV y el botón Volver.
- Pendiente de aprobación visual antes de replicar el header a BAE y Diario Show.
**Registro acumulativo: 28 cambios.**

## Cambio 29 — Aumentar Diario Show y BAE un 20 % en el header (2026-11-12)
- **Crónica DEV únicamente.** Crónica permanece en 40 px; Diario Show aumenta **24 → 28,8 px** y BAE Negocios **18 → 21,6 px** en desktop.
- Se aumenta también un **20 %** la escala de Diario Show y BAE en las reglas responsive, respetando siempre la proporción intrínseca de los SVG.
- No se alteran la animación, el color original del logo activo, la escala de grises de inactivos ni las rutas de navegación.
- BAE DEV y Diario Show DEV todavía conservan sus headers propios, a la espera de aprobación del piloto.
**Registro acumulativo: 29 cambios.**

## Cambio 30 — Reducir Diario Show y BAE un 10 % (2026-11-12)
- Piloto exclusivo en Crónica DEV. Diario Show reduce su altura de **28,8 a 25,92 px**, BAE Negocios de **21,6 a 19,44 px**. Crónica permanece en **40 px**.
- Se aplica el mismo factor de reducción del 10 % a las reglas responsive de ambas marcas, preservando proporciones SVG y colores originales.
- El resto del selector, navegación y animaciones permanece sin cambios. Pendiente de aprobación para replicación.
**Registro acumulativo: 30 cambios.**

## Cambio 31 — Replicar selector del header en BAE y Diario Show DEV (2026-11-12)
- Se replica a los otros dos DEV el selector de plataformas aprobado en Crónica DEV (Cambio 30). El HTML mantiene **Crónica → Diario Show → BAE** en ese orden y el mismo CSS de separación, tamaños ópticos, comportamiento responsive y ampliación visual (sin reordenar ni desplazar elementos adyacentes).
- Cada editor tiene su propia identidad activa: Crónica en Crónica DEV, Diario Show en Diario Show DEV y BAE en BAE DEV; solo cambia `is-active` y `aria-current="page"`.
- Los enlaces navegan a cada entorno DEV real y el botón «Volver» sigue enlazando al menú principal.
- El activo usa colores del SVG original; los otros mantienen el efecto de escala de grises, sin fondos, tarjetas ni inversión artificial del logotipo Diario Show.
- Se iguala el ancho de botón Volver en mobile para evitar saltos de línea.
**Registro acumulativo: 31 cambios.**

## Cambio 32 — Orden de volanta y comportamiento blanco de controles (2026-11-12)
- En Crónica DEV el orden dentro de **Textos** es: `Texto de la volanta` (condicional al switch de Diseño de placas) → `Formato de texto` / `Alineación` → `Texto principal` → `Tamaño de tipografía`.
- En Crónica y BAE DEV se adopta el comportamiento de sliders de Diario Show: hover gris solo sobre la bolita real, y bolita blanca con halo blanco al arrastrarla. Afecta el slider de tamaño de texto, opacidad de halftone cuando esté disponible y zoom fotográfico.
- Se mantiene la lógica de valores, los porcentajes, las variantes y el gesto de click sobre pista; no se muestra halo si se toca fuera de la bolita.
- Diario Show DEV conserva su implementación actual, utilizada como referencia.
**Registro acumulativo: 32 cambios.**

## Cambio 33 — Onboarding Shift + clic (2026-11-12)
- Se suma en Crónica, BAE y Diario Show DEV una placa de recorrido para la combinación **Shift + clic**, con una ilustración vectorial animada de tecla Shift, mouse y acordeones sincronizados.
- El dibujo aparece debajo del texto del paso, conserva la demostración de zoom de las demás placas y respeta la configuración de movimiento reducido.
- En Diario Show se reemplaza la comprobación fija del índice de la placa de vista previa por la identificación por selector, para que insertar el nuevo paso no altere el recorrido.

## Cambio 34 — Ritmo interior de Diario Show replicado en BAE y Crónica DEV (2026-11-12)
- El interior de los acordeones utiliza **18 px vertical / 14 px horizontal** en desktop y **15 px / 12 px** en mobile.
- Se unifica en **16 px** la distancia entre submódulos directos, incluidos diseño, fotografía, importación, controles de logo, firma y textos. Se evitan márgenes duplicados.
- Se mantienen los módulos, contenidos y controles propios de cada marca, sin tocar producción.
**Registro acumulativo: 34 cambios.**

**QA de Cambios 33 y 34 (Chromium): APROBADO.** [Workflow](https://github.com/SantiagoM96/mlz/actions/runs/43156340497): la ilustración Shift se muestra y carga correctamente en Crónica, BAE y Diario Show; en Crónica y BAE se comprobaron los padding desktop de 18/14 px y mobile de 15/12 px. La prueba de comportamiento Shift + clic funcional no formó parte de este smoke test; se conserva la lógica preexistente de acordeones.

## Cambio 35 — Máscara de onboarding instantánea como Diario Show (2026-11-12)
- **Crónica DEV:** se elimina la variante propia de máscara basada en `box-shadow: 0 0 0 200vmax` sobre un recuadro que se desplazaba entre destinos. Se vuelve al sistema de cuatro zonas opacas, idéntico al de Diario Show.
- **Crónica y BAE DEV:** se anulan las transiciones de `left`, `top`, `width` y `height` del resaltado y se desactiva cualquier transición de la tarjeta del onboarding. La máscara se actualiza instantáneamente al cambiar de paso, sin volar por el viewport.
- La tarjeta glassmorphism, el texto, los pasos y las ilustraciones se conservan; Diario Show DEV no se modifica.
**Registro acumulativo: 35 cambios.**

## Cambio 36 — Recorrido de módulos y tutorial Shift centrado en la cabecera (2026-11-12)
- Los pasos de módulos siguen la secuencia física de cada editor: **Crónica** Diseño de placas → Fotografía → Textos; **BAE** Diseño de placas → Fotografía → Importar noticia → Textos → Diseño; **Diario Show** Diseño de placas → Distribución fotográfica → Carga de fotografía → Importar noticias → Textos. Se conserva el paso inicial del carrusel y los pasos posteriores de edición contextual y zoom.
- Se elimina la duplicación del paso de logo/firma independiente en Crónica y BAE, integrándolo dentro de Diseño de placas.
- La placa animada **Shift + clic** se ubica inmediatamente después del último módulo de configuración en cada editor y toma como objetivo exclusivamente el botón de cabecera de **Diseño de placas**, no el cuerpo completo. La máscara oscurece el contenido del acordeón y resalta solamente donde se pulsa el encabezado y el chevrón.
- Se preservan la misma máscara instantánea, los botones del recorrido, su copia y el estado real de cada acordeón; se renueva la versión del onboarding en los tres DEV.
**Registro acumulativo: 36 cambios.**

## Cambio 37 — Ilustración Shift simplificada y ajuste final del recorrido (2026-11-12)
- La ilustración compartida de Shift se reorganiza: **acordeones a la izquierda**, tecla Shift y mouse **a la derecha**. Se eliminan la caja adicional que rodeaba la tecla, el signo igual y los textos de instrucciones al pie.
- El fondo de Shift iluminado cambia a un gris azulado moderado `#536279`, con icono y tipografía claros y legibles; sin relleno blanco pleno. La tecla y el mouse accionan sincronizadamente los **tres módulos**, que pasan de **36 px de alto (contraídos)** a **66 px (expandidos)** y regresan juntos, ajustando su posición para evitar superposiciones.
- La ilustración se comparte en los onboarding de los tres DEV; se actualizan las versiones de caché del SVG y de los scripts.
- Diario Show: se elimina el paso de fotografía duplicado entre «Distribución fotográfica» e «Importar noticias» para respetar la secuencia solicitada: Diseño de placas → Distribución fotográfica → Importar noticias → Textos → Shift + clic sobre la cabecera de Diseño.
- Se mantiene sin cambios la lógica real de Shift + clic de cada editor y el resaltado de cabecera definido en Cambio 36.
**Registro acumulativo: 37 cambios.**

## Cambio 38 — Onboarding contextual del logo sobre la vista previa (2026-11-12)
- En Crónica, BAE y Diario Show DEV se incorpora después del paso Shift una explicación «Configurá el logo y la firma» cuyo objetivo es **la zona real clickeable del logo en la vista previa** (`.modern-logo-hit` o `#dsLogoHitButton`), no Diseño de placas.
- Se destaca solo esa zona en la máscara y la tarjeta queda posicionada junto al logo; el texto explica que hacer clic en el logo abre el módulo con sus controles.
- Se separa la explicación de edición de titular: el paso siguiente resalta exclusivamente la zona clickeable del texto en la preview. Se preservan los pasos de módulos, el orden y la máscara sin transición.
- Los triggers del editor son los existentes; se cambia únicamente el onboarding y sus textos. Se renueva la versión del script para evitar caché anterior.
**Registro acumulado: 38 cambios.**

## Cambio 39 — Onboarding por bloques y foco doble de logo (2026-11-12)
- Se formalizan bloques semánticos en las tres marcas: `slides` (introducción a diapositivas) → `panel` (repaso estricto por los acordeones de izquierda) → `shortcuts` (Shift + clic en la cabecera Diseño de placas) → `preview` (logo y titular sobre la placa) → `help` (zoom). El progreso continúa mostrando cada paso individual.
- La explicación de logo no apunta al acordeón entero: se añade una **máscara SVG con tres ventanas independientes** que deja visibles la zona clickeable del logo de preview, el grupo de selector de logo/ubicación y el campo de firma inferior, oscureciendo el resto de Diseño de placas. La tarjeta se posiciona junto al logo de la preview. El spotlight convencional se restaura automáticamente en los demás pasos.
- Se reutilizan los controles existentes sin duplicarlos ni cambiar sus acciones; se respeta el modo sin transiciones y se habilitan los grupos aplicables al mostrar el paso.
- Exclusivo a los tres DEV; sin modificaciones en producción.
**Registro acumulado: 39 cambios.**

**QA Cambio 39 — APROBADA (Chromium, 2026-11-12).** [Ejecución](https://github.com/SantiagoM96/mlz/actions/runs/43158017727): el recorrido de los tres editores mantiene el orden de diapositivas, módulos, Shift y acciones de la preview; el paso Shift enfoca sólo la cabecera. Se verificaron **tres recortes reales** en el paso de logo (logo de la preview, grupo de controles de logo y ubicación, y firma inferior) en Crónica, BAE y Diario Show; la tarjeta se mantiene vinculada al logo. [GitHub Pages](https://github.com/SantiagoM96/mlz/actions/runs/43158017722) publicado satisfactoriamente.

## Cambio 40 — El mouse de la ilustración es un puntero (2026-11-12)
- Corrección de la ilustración animada de Shift compartida por Crónica, BAE y Diario Show DEV: el «mouseito» es un **cursor de flecha**, no un mouse físico.
- El cursor parte del lado derecho, avanza hasta el chevrón del primer acordeón (x=293, y=40), hace un pequeño clic con halo mientras Shift permanece iluminado; a partir de ese clic se abren simultáneamente las tres secciones, permanecen abiertas brevemente y se cierran para reiniciar el ciclo.
- Se conserva la iluminación gris azulada de Shift, con texto/icono contrastado. El SVG y sus referencias tienen nuevos parámetros de caché, sin alterar los otros pasos del onboarding.
**Registro acumulativo: 40 cambios.**

## Cambio 41 — Radio 8 px en ventanas del tour y mayor separación de tarjeta del titular (2026-11-12)
- Todas las ventanas iluminadas del onboarding de **Crónica, BAE y Diario Show DEV** se recortan ahora con esquinas de **8 px de radio**, tanto las ventanas únicas como las tres ventanas simultáneas del tutorial de logo (logo/ubicación/firma). El recorte usa un camino SVG `fill-rule:evenodd` con curvas cuadráticas para preservar las esquinas reales, no solo el contorno decorativo.
- Únicamente en el paso **«Editá el texto desde la vista previa»**, se incrementa un **30 %** la separación de la tarjeta del tooltip respecto del foco: **18 → 23,4 px** en posición horizontal, y **12 → 15,6 px** cuando se posiciona arriba/abajo por falta de espacio.
- Los demás pasos conservan sus separaciones, la máscara salta instantáneamente y ningún cambio altera las interacciones del editor.
**Registro acumulativo: 41 cambios.**

## Cambio 42 — Mano curva detrás de Shift y mouse físico (2026-11-12)
- En la animación compartida de Shift se reemplaza la flecha por un **cursor de mano** de trazado más prolijo, con yema alineada al chevrón.
- Se incorpora de nuevo un **mouse físico** a la derecha, con movimiento corto y botón que se ilumina durante el clic. La mano parte desde abajo y se desplaza con `animateMotion` mediante una curva que evita atravesar Shift; la mano se dibuja debajo de la tecla en el orden SVG.
- Shift sigue iluminado durante el trayecto y el clic; los acordeones comienzan a desplegarse a continuación, se sostienen abiertos y vuelven a cerrarse, con loop.
- SVG compartido en Crónica, BAE y Diario Show DEV; versionado de URL para invalidar caché.
**Registro acumulado: 42 cambios.**

## Cambio 43 — Quitar el aro exterior del botón Siguiente en los tres onboarding (2026-11-12)
- El botón **Siguiente** se enfoca automáticamente por JavaScript al avanzar, y dependiendo de la modalidad de foco, el selector CSS `:focus-visible` generaba un aro exterior intermitente.
- En Crónica, BAE y Diario Show DEV se desactiva **outline y box-shadow** tanto en `:focus` como en `:focus-visible` del botón Siguiente. Para uso por teclado se conserva un indicador no externo: subrayado del texto al recibir `:focus-visible`.
- Se mantienen la gestión de foco, los atajos de teclado, los estados de los restantes controles y el diseño de las tarjetas. Se actualiza la versión del CSS de onboarding para evitar caché.
**Registro acumulado: 43 cambios.**

## Cambio 44 — Color real de degradés en miniaturas Diario Show DEV (2026-11-12)
- **Solo Diario Show DEV.** Se igualan las miniaturas de **Variante 3 (cita fucsia)** y **Variante 4 (cita celeste)** a los tonos reales del canvas `renderQuoteVariant()`: **#E6008D** y **#00A6D9** respectivamente.
- El degradado replica el comportamiento del render: transición del mismo RGB desde **0% a 100% de opacidad** sobre el fondo fotográfico neutro `#aeb4bc`, en lugar de los antiguos colores oscuros de miniatura `#A30065` y `#008FBE`.
- **Diseño de placas y Diapositivas** se actualizan automáticamente: la navegación de páginas clona las miniaturas originales con las mismas clases y estilos. Sin cambios de colores en las placas exportadas ni en Crónica/BAE.
**Registro acumulativo: 44 cambios.**

**QA Cambio 44: APROBADA** — [Chromium / GitHub Actions](https://github.com/SantiagoM96/mlz/actions/runs/43160878649). Se seleccionaron ambas variantes de cita en Diario Show DEV y se comprobó que los estilos computados de sus miniaturas en «Diseño de placas» y sus clones en «Diapositivas» son idénticos. Colores de los degradés finales: fucsia RGB (230,0,141) y celeste RGB (0,166,217), desde alfa 0 a alfa 1.
