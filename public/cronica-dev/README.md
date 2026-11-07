# Crónica Dev — Generador de posteos

Versión de desarrollo: https://santiagom96.github.io/mlz/cronica-dev/

Versión estable (sin cambios en esta migración): https://santiagom96.github.io/mlz/cronica/

## Organización
- `index.html`: marcado y controles de usuario.
- `css/base.css`: estilos base y elementos generales, en el mismo orden que el original.
- `css/editor.css`: navegación de páginas, distribución y controles.
- `css/preview.css`: área de imagen, hover, logos y diálogo de exportación.
- `js/app.js`: lógica original del generador, extraída sin modificar el funcionamiento.

Los logotipos se comparten desde `../cronica/` para evitar copias duplicadas.

## Publicación
El workflow existente `.github/workflows/pages.yml` publica desde `main` cuando cambia `public/**`.
Para cambios visuales de desarrollo, editar solo `public/cronica-dev/**`. La URL estable se mantiene intacta.
Para promover una modificación aprobada a producción, aplicar los cambios equivalentes en `public/cronica/` mediante una revisión separada.

Nota: esta es una vista previa publicada en GitHub Pages, no un servidor con hot reload.
Puede haber demoras de despliegue y caché del navegador; comprobar la ejecución de GitHub Actions antes de informar la publicación.

## Pruebas mínimas
1. La portada muestra logo y tipografías correctamente.
2. Carga y arrastre de foto, zoom y encuadre.
3. Cambio de logo, volanta y formato.
4. Añadir y seleccionar páginas internas.
5. Exportar una página y todas las páginas.
6. Comprobar versión móvil.
