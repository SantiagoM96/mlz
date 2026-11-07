# Hub de desarrollo editorial

Entrada: https://santiagom96.github.io/mlz/dev/
- Crónica Dev: https://santiagom96.github.io/mlz/cronica-dev/
- BAE Dev: https://santiagom96.github.io/mlz/bae-dev/

Las versiones de producción siguen en /mlz/cronica/ y /mlz/bae/.

## Arquitectura de BAE Dev

- `public/bae-dev/index.html`: HTML idéntico al original, con enlaces a archivos separados.
- `css/base.css`, `css/controls.css`, `css/editor.css`: CSS original dividido sin cambios y en idéntico orden.
- `js/editor.js`: script del generador original.
- `js/importer.js`: script original de importación de noticias. Se ejecuta después de editor.js.
- Los SVG se comparten con `../bae/`; no se alteran los archivos de producción.

Publicación automática: GitHub Pages desde `main`. Las URLs de desarrollo son previews publicados, no servidores con recarga instantánea.

## QA
1. Comparar interfaz BAE Dev con BAE original.
2. Comprobar logo, texturas 1 y 2, fotografías y edición.
3. Probar los controles y exportación PNG.
4. Probar importación desde URL, contemplando posibles restricciones CORS externas.
5. Revisar interfaz móvil y navegación desde `/dev/`.
