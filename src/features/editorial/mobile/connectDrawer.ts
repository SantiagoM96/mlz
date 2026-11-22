import { logoHitSelector, mobileQuery, textEditingEvent } from "./legacyEditor";

interface DrawerGesture {
  id: number;
  y: number;
  open: boolean;
  height: number;
  min: number;
  max: number;
}

export function connectDrawer(
  drawer: HTMLElement,
  handle: HTMLButtonElement,
  content: HTMLDivElement,
  actionBar: HTMLDivElement,
) {
  const listeners = new AbortController();
  const { signal } = listeners;
  const mobile = matchMedia(mobileQuery);
  const main = document.querySelector("main");
  const panelNode = main?.querySelector<HTMLElement>(
    ".modern-track > .editor-panel, #dsMobileControlsPanel",
  );
  const actionNode = main?.querySelector<HTMLElement>(".preview-actions");
  if (!main || !panelNode || !actionNode) return;
  const panel: HTMLElement = panelNode;
  const actions: HTMLElement = actionNode;
  const workArea: HTMLElement = main;

  const panelHome = document.createComment("format panel");
  const actionsHome = document.createComment("preview actions");
  panel.before(panelHome);
  actions.before(actionsHome);

  const design = panel.querySelector<HTMLElement>(
    ".modern-design-group, .ds-plate-design-group",
  );
  const cards = [
    ...panel.querySelectorAll<HTMLElement>(
      ":scope > .modern-card, :scope > .ds-control-card",
    ),
  ];

  let gesture: DrawerGesture | null = null;
  let dragged = false;
  let centerFrame = 0;
  let desktopCards: boolean[] = [];
  let panelLabel: string | null = null;


  function cardControls(card: HTMLElement) {
    return {
      toggle: card.querySelector(
        ":scope > .modern-toggle, :scope > .ds-control-card-toggle",
      ),
      body: card.querySelector<HTMLElement>(
        ":scope > .modern-body, :scope > .ds-control-card-body",
      ),
    };
  }

  function expandCard(card: HTMLElement, expanded: boolean) {
    const { toggle, body } = cardControls(card);
    if (!toggle || !body) return;
    toggle.setAttribute("aria-expanded", String(expanded));
    body.hidden = !expanded;
  }

  function setOpen(open: boolean) {
    if (!open && content.contains(document.activeElement))
      handle.focus({ preventScroll: true });
    drawer.classList.toggle("is-open", open);
    content.hidden = !open;
    content.inert = !open;
    if (open) fitOpenHeight();
    handle.setAttribute("aria-expanded", String(open));
    handle.setAttribute(
      "aria-label",
      open ? "Cerrar formato" : "Abrir formato",
    );
    if (!open) {
      content.scrollTop = 0;
      drawer.classList.remove("is-logo-only");
      cancelAnimationFrame(centerFrame);
    }
  }

  function openDesign(logoOnly = false) {
    if (!design || design.hidden) return;
    drawer.classList.toggle("is-logo-only", logoOnly);
    cards.forEach((item) => expandCard(item, item === design));
    drawer.classList.remove("is-settling");
    setOpen(true);
    cancelAnimationFrame(centerFrame);
    centerFrame = requestAnimationFrame(() => {
      if (content.hidden) return;
      const rect = design.getBoundingClientRect();
      const viewport = content.getBoundingClientRect();
      const offset =
        rect.height > viewport.height ? 0 : (viewport.height - rect.height) / 2;
      content.scrollTop += rect.top - viewport.top - offset;
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  function syncLayout() {
    if (mobile.matches) {
      if (!drawer.hidden) return;
      desktopCards = cards.map(
        (card) =>
          cardControls(card).toggle?.getAttribute("aria-expanded") === "true",
      );
      panelLabel = panel.getAttribute("aria-labelledby");
      drawer.hidden = false;
      content.append(panel);
      actionBar.append(actions);
      panel.removeAttribute("role");
      panel.removeAttribute("aria-labelledby");
      panel.inert = false;
      measureClosedHeight();
      workArea.classList.add("has-editorial-mobile-drawer");
      return;
    }
    if (drawer.hidden) return;
    if (gesture) finishDrag(false);
    drawer.classList.remove("is-settling");
    setOpen(false);
    panelHome.after(panel);
    actionsHome.after(actions);
    if (panelLabel) panel.setAttribute("aria-labelledby", panelLabel);
    cards.forEach((card, index) =>
      expandCard(card, desktopCards[index] ?? false),
    );
    drawer.hidden = true;
    workArea.classList.remove("has-editorial-mobile-drawer");
  }

  function measureClosedHeight() {
    const style = getComputedStyle(drawer);
    const height =
      handle.offsetHeight +
      actionBar.offsetHeight +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth);
    drawer.style.setProperty("--drawer-closed-height", height + "px");
    return height;
  }

  function fitOpenHeight() {
    if (content.hidden) return;
    const style = getComputedStyle(content);
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const min = measureClosedHeight();
    const max = (window.visualViewport?.height ?? innerHeight) * 0.62;
    const height = Math.max(
      min,
      Math.min(max, min + panel.offsetHeight + padding),
    );
    const value = height + "px";
    if (drawer.style.getPropertyValue("--drawer-open-height") === value) return;
    drawer.style.setProperty("--drawer-open-height", value);

  }

  function revealAll() {
    drawer.classList.remove("is-logo-only");

    cards.forEach((card) => expandCard(card, true));
  }

  function toggleFromHandle() {
    const opening = content.hidden;
    drawer.classList.toggle("is-settling", !opening);
    if (opening) revealAll();
    setOpen(opening);
  }

  function moveDrawer(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const delta = gesture.y - event.clientY;
    if (!dragged && Math.abs(delta) < 4) return;
    dragged = true;
    if (
      !drawer.classList.contains("is-dragging") &&
      (gesture.open ? delta >= 0 : delta <= 0)
    )
      return;
    if (content.hidden) {
      revealAll();
      content.hidden = false;
      content.inert = true;
    }
    const height = Math.max(
      gesture.min,
      Math.min(gesture.max, gesture.height + delta),
    );
    drawer.style.setProperty("--drawer-drag-height", height + "px");
    drawer.classList.add("is-dragging");
  }

  function finishDrag(accept: boolean) {
    if (!gesture) return;
    const { open, height, min, max } = gesture;
    gesture = null;
    if (!dragged) return;
    const current = drawer.getBoundingClientRect().height;
    const snapDistance = Math.min(48, (max - min) / 2);
    const changed =
      current !== height && Math.abs(current - height) >= snapDistance;
    const next = accept && changed ? current > height : open;
    drawer.classList.replace("is-dragging", "is-settling");
    drawer.style.removeProperty("--drawer-drag-height");
    setOpen(next);
  }

  const actionResize = new ResizeObserver(() => {
    if (!drawer.hidden) {
      measureClosedHeight();
      fitOpenHeight();
    }
  });
  actionResize.observe(actionBar);
  actionResize.observe(panel);
  window.addEventListener("resize", fitOpenHeight, { signal });
  handle.addEventListener(
    "pointerdown",
    (event) => {
      if (gesture || !event.isPrimary || event.button !== 0) return;
      dragged = false;
      drawer.classList.remove("is-settling");
      const min = measureClosedHeight();
      const viewport = window.visualViewport?.height ?? innerHeight;
      gesture = {
        id: event.pointerId,
        y: event.clientY,
        open: !content.hidden,
        height: drawer.getBoundingClientRect().height,
        min,
        max: Math.max(min, viewport * 0.62),
      };
      handle.setPointerCapture(event.pointerId);
    },
    { signal },
  );
  handle.addEventListener("pointermove", moveDrawer, { signal });
  handle.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerId === gesture?.id) finishDrag(true);
    },
    { signal },
  );
  for (const type of ["pointercancel", "lostpointercapture"] as const) {
    handle.addEventListener(
      type,
      (event: PointerEvent) => {
        if (event.pointerId === gesture?.id) finishDrag(false);
      },
      { signal },
    );
  }
  handle.addEventListener(
    "click",
    (event) => {
      if (!dragged || event.detail === 0) toggleFromHandle();
      dragged = false;
    },
    { signal },
  );
  drawer.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && !content.hidden) setOpen(false);
    },
    { signal },
  );

  document.addEventListener(
    "click",
    (event) => {
      if (drawer.hidden) return;
      const hit =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>(logoHitSelector)
          : null;
      if (!hit || hit.hidden || hit.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openDesign(true);
    },
    { capture: true, signal },
  );

  document.addEventListener(
    "click",
    (event) => {
      if (drawer.hidden) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "#addPage, .editor-slide-add-fixed, .editor-slide-add-tile, .carousel-page-thumb[data-variant='blank'], .editor-slide-thumb[data-variant='blank']",
        )
      ) {
        openDesign();
      }
    },
    { signal },
  );

  window.addEventListener(
    textEditingEvent,
    () => {
      drawer.classList.remove("is-settling");
      if (!drawer.hidden) setOpen(false);
    },
    { signal },
  );
  mobile.addEventListener("change", syncLayout, { signal });
  syncLayout();

  return () => {
    listeners.abort();
    actionResize.disconnect();
    setOpen(false);
    panelHome.replaceWith(panel);
    actionsHome.replaceWith(actions);
    if (panelLabel) panel.setAttribute("aria-labelledby", panelLabel);
    cards.forEach((card, index) => {
      const expanded = desktopCards[index];
      if (expanded !== undefined) expandCard(card, expanded);
    });
    workArea.classList.remove("has-editorial-mobile-drawer");
  };
}
