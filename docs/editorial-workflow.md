# Flujo editorial: MLZ → Editorial Tools

Fecha de acuerdo: 2026-11-10.

## Autoridad y alcance

- **MLZ** (`SantiagoM96/mlz`) es el origen funcional de trabajo para Crónica, BAE y Diario Show.
- **Editorial Tools** (`SantiagoM96/editorial-tools`) es un destino independiente para una migración futura y controlada. **No se sincroniza ni se despliega por defecto.**
- Los cambios de los generadores no deben afectar los módulos municipales del repositorio MLZ.
- La existencia de una funcionalidad en MLZ no implica que ya esté migrada a la arquitectura TypeScript de Editorial Tools.

## Rutas

| Herramienta | MLZ desarrollo | MLZ estable | Editorial Tools |
| --- | --- | --- | --- |
| Crónica | `public/cronica-dev/` | `public/cronica/` | `public/cronica/` y módulos `src/features/cronica/` |
| BAE | `public/bae-dev/` | `public/bae/` | `public/bae/` |
| Diario Show | `public/diarioshow-dev/` | `public/diarioshow/` | `public/diarioshow/` |

## Interpretación de pedidos

1. «Cambiá / corregí / implementá» sin destino: trabajar en MLZ desarrollo (`*-dev`). No cambiar automáticamente la versión estable.
2. «Implementá en producción»: promover los cambios explícitos y verificados a `public/<producto>/` **en MLZ**. Aclaración: GitHub Pages de MLZ publica un *preview* del repositorio; estas rutas se llaman «estables» dentro de este proyecto, no producción institucional.
3. «Implementá en desarrollo de Editorial Tools»: portar los cambios autorizados a una rama de trabajo de Editorial Tools, con pruebas y revisión, sin actualizar su `main` ni desplegar sin autorización adicional.
4. Nunca interpretar «producción» como la producción de Editorial Tools salvo mención explícita de ese repositorio.
5. Si hay una orden explícita de modificar ambas copias en MLZ, documentar el alcance y hacerlo sin tocar Editorial Tools.

## Método

- Antes de modificar: identificar repositorio, ruta activa, URL visible y versión del JS. Un error anterior se debió a editar otro repositorio distinto del utilizado.
- Trabajar de forma incremental; conservar la composición, las dimensiones de exportación y la identidad de cada marca.
- Comprobar sintaxis, build y pruebas relevantes; además verificar en navegador los flujos afectados cuando sea posible. Un deploy exitoso no equivale a una prueba funcional exitosa.
- Promover solamente cambios verificados al destino solicitado, con posibilidad de revertir mediante commit.
- Registrar cada traslado a Editorial Tools con: fuente (commit MLZ), destino (commit/PR), rutas, cambios funcionales, divergencias intencionadas, resultado de tests y pendientes.
- No sobrescribir componentes TypeScript, modelos, servicios de imágenes ni tests propios de Editorial Tools con archivos heredados de MLZ; portar la **conducta**, no copiar a ciegas.
- Respetar los documentos `docs/ARCHITECTURE.md`, `docs/MIGRATION.md`, `docs/REFACTOR_PLAN.md` y los tests de Editorial Tools al preparar ese traslado.

## Estado inicial

- MLZ y Editorial Tools contienen implementaciones distintas de los editores.
- Editorial Tools ya emplea React/TypeScript para dashboard y partes de Crónica, pero BAE y Diario Show siguen usando JS en `public/`.
- La importación por URL depende de servicios externos y requiere pruebas reales de título/fotografía; no considerarla garantizada por el solo hecho de pasar tests sintácticos.
- No hay sincronización automática entre repositorios; cada traslado a Editorial Tools se ejecutará únicamente por pedido.
