export const mobileQuery = "(max-width: 700px)";
export const headlineHitSelector = ".modern-text-hit, #dsHeadlineHitButton";
export const logoHitSelector = ".modern-logo-hit, #dsLogoHitButton";
export const renderEvent = "modern:render";
export const textEditingEvent = "editorial:text-editing";

export interface CanvasBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type CanvasEditorWindow = Window & {
  __editorialSecondaryTextBounds?: CanvasBounds | null;
  __editorialHotspotBounds?: { secondary?: CanvasBounds | null };
};

export function getSecondaryTextBounds() {
  const engine = window as CanvasEditorWindow;
  return (
    engine.__editorialSecondaryTextBounds ??
    engine.__editorialHotspotBounds?.secondary
  );
}

export function attachAtOriginalPosition(
  node: HTMLElement,
  host: HTMLElement,
): () => void {
  const anchor = document.createComment("editorial-control-home");
  node.before(anchor);
  host.append(node);
  return () => anchor.replaceWith(node);
}
