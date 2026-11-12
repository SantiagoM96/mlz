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
