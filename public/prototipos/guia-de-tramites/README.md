# Guía de Trámites Lomas · prototipo UX/UI

Módulo en `public/prototipos/guia-de-tramites/`, al mismo nivel que las consolas de Deportes.
URL pública (tras publicar en main): `https://santiagom96.github.io/mlz/prototipos/guia-de-tramites/`.

## Páginas

- `index.html` y `d-home.html`: home, buscador, 8 más pedidos y 15 temas.
- `d-catalogo.html`: 91 trámites, filtros y ordenamiento.
- `d-categoria.html?c=tasas-y-pagos`: categoría con filtros rápidos.
- `d-buscar.html?q=dni`: búsqueda directa.
- `d-ficha.html?t=certificado-deuda-escribania`: ficha completa desde Excel; `?t=alta-patente` muestra variantes del trámite.

## Contenido, procedencia y protección de datos

`data/catalogo.js` contiene 91 trámites y 15 categorías observados en el prototipo QA (19/11/2026).
`scripts/generate-tramites-catalog.mjs` recupera la hoja de respuestas de origen y **genera** `data/fichas.js` con 91 fichas y 122 registros de relevamiento.
Un trámite puede reunir varias gestiones (por ejemplo, auto/moto, renovación/primera vez). En esos casos la ficha identifica variantes y conserva los datos específicos de cada registro.

Solo se seleccionan campos públicos del trámite: nombre, descripción, destinatarios, requisitos, documentación, canales, modalidad, costos, formas de pago, plazos, procedimiento, normativa y enlaces públicos.
Se omiten las columnas de identificación y contacto personal de las personas que respondieron y las observaciones de gestión interna.
Las cadenas de correo y teléfono contenidas en los campos públicos se sustituyen por indicadores genéricos.

**Importante:** los formularios del Excel son un relevamiento de 2026, no una publicación institucional validada. Montos, horarios, plazos y requisitos deben revisarse por el área competente antes de convertirse en información oficial. No se inventan campos ausentes. El prototipo no ejecuta trámites reales.

El popup «Preguntale a Mini Muni» está excluido.

## Design System

`css/mlz-ui-kit.css` utiliza la biblioteca MLZ de `SantiagoM96/mlz-muni` como referencia:
- `src/styles/tokens.css`
- `src/pages/andy-kit/andy-kit.css`
- `docs/design-system/README.md`
- `docs/design-system/component-library.md`

Aplicación: Geometria 400/500/700, azul `#236999`, foco `#006EFF`, texto `#3D3D3D`, superficies y separadores `#F3F7FC` / `#E1E7EB`, escala de espaciados y radios documentados (4px inputs/botones, 8px cards).
No se modificaron los archivos del UI Kit original.

## Generación y publicación

Antes de ejecutar el prototipo localmente, desde la raíz del repositorio:
```bash
npm ci
node scripts/generate-tramites-catalog.mjs
npm run dev
```
El generador necesita conexión de lectura al Excel y falla explícitamente si la fuente cambia de orden o estructura (133 filas de datos × 66 columnas). No publica una ficha incompleta como si fuera válida.
`quality.yml`, `visual-qa.yml` y `pages.yml` ejecutan el generador antes de validar/compilar. GitHub Pages publica solamente desde main.

Pruebas: `tests/e2e/guia-tramites.spec.ts` (91 fichas, variantes, búsqueda, filtros, responsive, navegación). La paridad visual pixel-perfect con el QA original queda pendiente de revisión por captura.
