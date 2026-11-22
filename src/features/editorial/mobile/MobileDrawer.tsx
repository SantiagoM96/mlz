import { useLayoutEffect, useRef } from "react";
import { connectDrawer } from "./connectDrawer";

export function MobileDrawer() {
  const drawer = useRef<HTMLElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (
      drawer.current &&
      handle.current &&
      content.current &&
      actions.current
    ) {
      return connectDrawer(
        drawer.current,
        handle.current,
        content.current,
        actions.current,
      );
    }
  }, []);

  return (
    <section
      ref={drawer}
      className="editorial-mobile-drawer"
      aria-label="Formato y acciones de la placa"
      hidden
    >
      <button
        ref={handle}
        type="button"
        className="editorial-drawer-handle"
        aria-expanded="false"
        aria-controls="editorialDrawerContent"
        aria-label="Abrir formato"
      />
      <div
        ref={content}
        id="editorialDrawerContent"
        className="editorial-drawer-content"
        hidden
      />
      <div ref={actions} className="editorial-drawer-actions" />
    </section>
  );
}
