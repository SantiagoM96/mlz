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
