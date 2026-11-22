import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { connectTextEditor } from "./connectTextEditor";

export function MobileTextEditor() {
  const sheet = useRef<HTMLDivElement>(null);
  const sizeHome = useRef<HTMLDivElement>(null);
  const sizeButtons = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (sheet.current && sizeHome.current && sizeButtons.current) {
      return connectTextEditor(
        sheet.current,
        sizeHome.current,
        sizeButtons.current,
      );
    }
  }, []);

  return createPortal(
    <div className="editorial-text-sheet" ref={sheet} hidden>
      <section
        className="editorial-text-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editorialTextTitle"
      >
        <header>
          <strong id="editorialTextTitle">Texto principal</strong>
          <div className="editorial-text-header-actions">
            <button type="button" className="editorial-text-select-all" aria-label="Seleccionar todo">
              Sel. todo
            </button>
            <button type="button" className="editorial-text-done">
              Listo
            </button>
          </div>
        </header>
        <div className="editorial-text-writing" />
        <div className="editorial-text-tools">
          <div ref={sizeHome} hidden>
            <div
              ref={sizeButtons}
              className="editorial-text-size"
              role="group"
              aria-label="Tamaño del texto"
            >
              <button type="button" data-step="-2" aria-label="Reducir tamaño">
                <span className="material-icons" aria-hidden="true">
                  remove
                </span>
              </button>
              <button type="button" data-step="2" aria-label="Aumentar tamaño">
                <span className="material-icons" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
