# Guía de Trámites · auditoría de dimensiones y tipografía

Fecha: 20 de noviembre de 2026.

## Fuentes revisadas

- Figma **GUIA DE TRAMITES**: ficha R036 desktop, nodo `16141:7145`; ficha mobile, nodo `16242:5274`; catálogo mobile, nodo `16238:3631`.
- Implementación React de `src/pages/tramites/` y componentes institucionales de MLZ.
- La planilla **GUIA DE TRÁMITES - BASE FINAL** sigue siendo la única fuente editorial. **No se modificó ningún registro ni el esquema de los 125 trámites**.

## Comparación y cambios

| Elemento | Figma | Implementación anterior | Corrección |
|---|---|---|---|
| Contenedor ficha desktop | 1200 px máximo | 1200 px máximo | Se conserva |
| Distribución ficha desktop | Columna principal 770 px, lateral 390 px, gap 40 px | Máximos fijos que podían desbordar entre 1000 y 1200 px | Distribución fluida `minmax(0,1fr) minmax(280px,390px)`, gap 40 px; a 1200 px = 770 + 390 |
| Header de ficha | Stack de 16 px desktop / 12 px mobile | Márgenes independientes de 12, 16 y 20 px, varios superpuestos | `display: flex`, `gap: 16px` desktop / 12 px mobile, eliminando márgenes previos |
| Título de ficha mobile | Geometria Bold 32 px | 28 px | 32 px |
| Categoría en ficha | Solo en breadcrumb (feedback posterior) | Se repetía encima del título | Se eliminó el rótulo duplicado |
| Descripción y cuerpo de ficha | Geometria Regular 18 px | 18 px | Se mantiene |
| Títulos de sección | Geometria Bold 24 px | 24 px / 30 px | 24 px, `line-height: normal` |
| Espacio entre título y contenido de sección | 16 px | 20 px | 16 px |
| Separadores entre secciones | 24 px antes y después de línea de 1 px | 28 px antes y después (y línea al final) | 24 px en ambos lados; último bloque sin separador |
| Última sección "Otros trámites del tema" | **No existe separador inferior** | Línea de 1 px debajo de las tres cards | Se elimina border y padding inferiores |
| Título → tarjetas relacionadas | 24 px desktop, 16 px mobile | 20 px en ambos | 24 px desktop / 16 px mobile |
| Grid de relacionadas | 3 columnas desktop, 1 mobile, gap 16 px | Ya implementado | Se conserva |
| Cards relacionadas | Padding 16, radio 8, gap interno 16, ícono 40 px/24 px, textos 18 px | 16/8/16/40; interlineados heterogéneos | Se conservan dimensiones; tipografía de 18 px con interlínea de 26 px |
| Acciones de ficha | Material Symbols 24 px, Geometria Bold 18 px, gap 8 px | Íconos 20, texto 16 Medium | Íconos 24, texto 18 Bold, gap 8 |
| Título catálogo mobile | Geometria Bold 32 px | 28 px | 32 px |
| Título de tema catálogo | Geometria Bold 24 px | 26 px desktop / 22 px mobile | 24 px en ambos |
| Título de fila | Geometria Bold 20 px / 26 px | 20 px | Se conserva |
| Descripción de fila | Geometria Regular 16 px / 21 px | 16 px / 24 px | 16 px / 21 px |
| Acción "Ver trámite" en filas | Geometria Medium 16 px | 18 px Bold genérico | 16 px Medium solo para filas; botón de ficha sin cambios |

## Nueva navegación de catálogo largo

- Botón flotante **solo chevrón** (`keyboard_arrow_up` de Material Symbols), sin texto visual ni otra acción.
- Se renderiza **solo en el catálogo**, al superar 600 px de scroll; no se renderiza en fichas.
- 52 × 52 px desktop; 48 × 48 px mobile; circular, borde suave, primario institucional y sombra discreta.
- Se posiciona en esquina inferior derecha, respetando `safe-area-inset-*`; no forma parte de la grilla ni empuja tarjetas.
- Scroll suave y soporte `prefers-reduced-motion`; `aria-label="Volver arriba"`, foco visible y listener de scroll pasivo.
- Oculto en impresión.

## Alcance de validación automatizada

Playwright verifica en el proyecto:
- tamaños de tipografía en catálogo y ficha;
- `gap` de 16/12 px en encabezado y 16 px en cards;
- inexistencia de separador inferior en la última sección;
- no desbordamiento horizontal;
- botón ausente al inicio, visible tras desplazamiento, retorno a 0 y ausencia en fichas;
- comportamiento con movimiento reducido.

La última revisión también elimina el enlace de sitio genérico en el encabezado de ficha y diferencia destinatarios con iconos semánticos de 18 px. La revisión compara los valores disponibles del diseño con la estructura y estilos de la aplicación; **no equivale a una certificación de igualdad píxel a píxel** mediante superposición de capturas a todas las resoluciones.
