# Guía de Trámites Lomas — prototipo de revisión

Este módulo vive dentro de `public/prototipos/guia-de-tramites/`, al mismo nivel que `consola-deportes` y `consola-deportes-dev`.

## Páginas

- `index.html` o `d-home.html`: portada, buscador, ocho trámites destacados y quince temas.
- `d-catalogo.html`: catálogo de 91 trámites, búsqueda, filtros y ordenamiento.
- `d-buscar.html?q=...`: acceso al buscador filtrado.
- `d-categoria.html?c=tasas-y-pagos`: categoría y filtros rápidos.
- `d-ficha.html?t=licencia-de-conducir`: ficha de trámite; licencia contiene secciones verificadas en la pantalla QA. Las otras fichas muestran datos de catálogo y advierten dónde aún falta verificar contenido.

## Datos y fuentes

- `data/catalogo.js`: dataset de 91 entradas y 15 categorías extraído de las pantallas abiertas del prototipo QA con sesión autenticada el 19/11/2026. Se trata de datos demostrativos; no usarlos para gestiones reales.
- La ficha de licencia se transcribió a partir de la pantalla QA abierta en el navegador.
- Los datos completos de otras fichas y los valores visuales precisos todavía requieren validación. No se afirma paridad pixel-perfect.
- El prototipo excluye deliberadamente «Preguntale a Mini Muni».

## Desarrollo, validación y publicación

El sitio es HTML/CSS/JS estático, sin dependencias nuevas; se puede servir con cualquier servidor estático en la raíz de este directorio. Las referencias institucionales se leen de `../../assets/` dentro del repositorio MLZ.

Este trabajo se encuentra en una rama y **no se ha integrado a main ni publicado**. GitHub Pages solo ofrecerá `https://santiagom96.github.io/mlz/prototipos/guia-de-tramites/` después de una integración aprobada y un despliegue exitoso.

No se ejecutaron aún pruebas Playwright ni comparación visual lado a lado; deben validarse los breakpoints, filtros, búsqueda, fichas y recursos antes de aprobarse.
