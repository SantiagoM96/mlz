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
