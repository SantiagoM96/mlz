# Interfaz móvil de Herramientas Editoriales DEV

Crónica, BAE y Diario Show cargan una sola entrada de Vite. La interfaz compartida está en `src/features/editorial/mobile/`.

| Cambio | Ubicación |
| --- | --- |
| Estructura del cajón, tirador y botonera | `MobileDrawer.tsx` |
| Altura, gesto, apertura contextual y centrado | `connectDrawer.ts` |
| Controles del editor sobre el teclado | `MobileTextEditor.tsx` |
| Edición directa, tamaño y centrado del texto | `connectTextEditor.ts` |
| Integración con el Canvas y los controles originales | `legacyEditor.ts` |
| Espaciados y estados visuales | `public/shared/editorial-mobile-drawer.css` y `public/shared/editorial-mobile-text.css` |

Los componentes de React montan la interfaz. Los adaptadores conservan los controles originales mientras cada marca mantiene su motor de Canvas y sus diapositivas. Una nueva interacción compartida pertenece al módulo móvil. El motor de marca cambia cuando cambia el dibujo o un dato específico de sus placas.

Con `npm run dev` se pueden abrir `/cronica-dev/`, `/bae-dev/` y `/diarioshow-dev/`. Vite entrega la entrada compartida desde el código fuente. El build pone el nombre versionado del bundle en las tres páginas.

Para probar el artefacto publicado, ejecutar `npm run build:pages`, servir `dist` en el puerto 8765 y correr `node scripts/check-mobile-text.mjs`. Esta comprobación cubre las tres marcas con Chromium.
