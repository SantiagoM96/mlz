import {
  attachAtOriginalPosition,
  getSecondaryTextBounds,
  headlineHitSelector,
  mobileQuery,
  renderEvent,
  textEditingEvent,
} from "./legacyEditor";

export function connectTextEditor(
  sheet: HTMLDivElement,
  sizeHome: HTMLDivElement,
  sizeButtons: HTMLDivElement,
) {
  const listeners = new AbortController();
  const { signal } = listeners;
  const mobile = matchMedia(mobileQuery);
  const source = document.querySelector<HTMLTextAreaElement>("#headline");
  const headlineEditor = source?.parentElement?.querySelector<HTMLElement>(
    ".cronica-rich-headline",
  );
  const formatRow = document
    .getElementById("formatAccent")
    ?.closest<HTMLElement>(".typography-row");
  const stage = document.getElementById("photoStage");
  const drawing = stage?.querySelector("canvas");
  const sizeInput = document.querySelector<HTMLInputElement>("#size");
  if (
    !source ||
    !headlineEditor ||
    !formatRow ||
    !stage ||
    !drawing ||
    !sizeInput
  )
    return;
  const headlineSource: HTMLTextAreaElement = source;
  const editor: HTMLElement = headlineEditor;
  const toolbar: HTMLElement = formatRow;
  const canvas: HTMLCanvasElement = drawing;
  const sizeRange: HTMLInputElement = sizeInput;
  const dialog = sheet.querySelector<HTMLElement>(".editorial-text-dialog")!;
  const handle = sheet.querySelector<HTMLButtonElement>(".editorial-text-handle")!;
  const selectAll = sheet.querySelector<HTMLButtonElement>(".editorial-text-select-all")!;
  const reset = sheet.querySelector<HTMLButtonElement>(".editorial-text-reset")!;
  const writing = sheet.querySelector<HTMLElement>(".editorial-text-writing")!;
  const tools = sheet.querySelector<HTMLElement>(".editorial-text-tools")!;
  const title = sheet.querySelector<HTMLElement>("#editorialTextTitle")!;
  const secondary = [
    ["strapText", "Volanta"],
    ["quote", "Textual"],
    ["quoteAuthor", "Autor de la cita"],
  ]
    .map(([id, label]) => ({
      field: document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        "#" + id,
      ),
      label,
    }))
    .find((item) => item.field);
  const secondaryHit = document.createElement("button");
  secondaryHit.type = "button";
  secondaryHit.className = "editorial-secondary-text-hit";
  secondaryHit.hidden = true;
  if (secondary) {
    secondaryHit.setAttribute(
      "aria-label",
      "Editar " + secondary.label?.toLocaleLowerCase("es-AR"),
    );
    stage.append(secondaryHit);
  }
  function syncSecondaryHit() {
    if (!secondary) return;
    const bounds = getSecondaryTextBounds();
    const blank =
      document.documentElement.dataset.editorPlateVariant === "blank";
    secondaryHit.hidden = !mobile.matches || !bounds || blank;
    if (secondaryHit.hidden || !bounds) return;
    Object.assign(secondaryHit.style, {
      left: (Math.max(0, bounds.left - 12) / canvas.width) * 100 + "%",
      top: (Math.max(0, bounds.top - 8) / canvas.height) * 100 + "%",
      width:
        (Math.min(canvas.width, bounds.right - bounds.left + 24) /
          canvas.width) *
          100 +
        "%",
      height: ((bounds.bottom - bounds.top + 16) / canvas.height) * 100 + "%",
    });
  }
  let activeEditor: HTMLElement = editor;
  const alignment = toolbar
    .querySelector(".align-buttons")
    ?.closest(".control-field");

  const scrollRoom = document.createElement("div");
  scrollRoom.setAttribute("aria-hidden", "true");
  let centerFrame = 0;
  function centerHeadline() {
    centerFrame = 0;
    if (sheet.hidden) return;
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop || 0;
    const available = Math.max(
      0,
      (viewport?.height || innerHeight) - dialog.getBoundingClientRect().height,
    );
    const hit =
      returnFocus ?? canvas.parentElement?.querySelector(headlineHitSelector);
    const rect = hit?.getBoundingClientRect();
    const art = stage?.querySelector("canvas")?.getBoundingClientRect();
    if (!art) return;
    const center =
      rect && rect.height > 0
        ? (rect.top + rect.bottom) / 2
        : art.top + art.height * 0.8;
    const delta = center - (top + available / 2);
    if (Math.abs(delta) > 1)
      window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
  }
  function queueCenter() {
    if (!sheet.hidden && !centerFrame)
      centerFrame = requestAnimationFrame(centerHeadline);
  }
  dialog.style.setProperty(
    "--text-accent",
    getComputedStyle(editor).getPropertyValue("--rich-editor-accent").trim() ||
      getComputedStyle(toolbar).getPropertyValue("--editor-accent").trim() ||
      "#ed0000",
  );
  const main = document.querySelector("main");
  let restoreControls: (() => void)[] = [];
  let returnFocus: HTMLElement | null = null;
  let scrollY = 0,
    oldOverflow = "",
    oldInert = false;
  let resetSession = () => {};
  function captureSession(field: HTMLInputElement | HTMLTextAreaElement | null | undefined) {
    const textField = field ?? headlineSource;
    const spacing = document.querySelector<HTMLInputElement>("#headlineSpacing");
    const values = [textField, sizeRange, ...(spacing ? [spacing] : [])].map(
      (input) => ({ input, value: input.value }),
    );
    const offset = field?.dataset.sizeOffset;
    const uppercase = !field ? toolbar.querySelector<HTMLButtonElement>("#formatUppercase") : null;
    const wasUppercase = uppercase?.getAttribute("aria-pressed");
    const align = !field ? toolbar.querySelector<HTMLButtonElement>('.align-buttons [aria-pressed="true"]') : null;

    return () => {
      if (uppercase && uppercase.getAttribute("aria-pressed") !== wasUppercase) uppercase.click();
      if (align?.getAttribute("aria-pressed") === "false") align.click();
      if (field) {
        if (offset === undefined) delete field.dataset.sizeOffset;
        else field.dataset.sizeOffset = offset;
      }
      for (const { input, value } of values) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
  }

  function fit() {
    if (sheet.hidden) return;
    const viewport = window.visualViewport;
    sheet.style.top = (viewport?.offsetTop || 0) + "px";
    sheet.style.height = (viewport?.height || window.innerHeight) + "px";
    scrollRoom.style.height =
      window.innerHeight + dialog.getBoundingClientRect().height + "px";
    queueCenter();
  }
  function close() {
    if (sheet.hidden) return;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    sheet.hidden = true;
    restoreControls.forEach((restore) => restore());
    restoreControls = [];
    sizeHome.append(sizeButtons);
    scrollRoom.remove();
    cancelAnimationFrame(centerFrame);
    centerFrame = 0;
    document.body.style.overflow = oldOverflow;
    if (main) main.inert = oldInert;
    window.scrollTo(0, scrollY);
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
  }
  function open(trigger: HTMLElement) {
    if (!mobile.matches || !sheet.hidden) return;
    const field = trigger === secondaryHit ? secondary?.field : null;
    activeEditor = field ?? editor;
    resetSession = captureSession(field);
    title.textContent = field
      ? (secondary?.label ?? "Texto")
      : "Texto principal";
    returnFocus = trigger;
    window.dispatchEvent(new Event(textEditingEvent));
    scrollY = window.scrollY;
    oldOverflow = document.body.style.overflow;
    restoreControls.push(attachAtOriginalPosition(activeEditor, writing));
    if (field) tools.append(sizeButtons);
    else {
      restoreControls.push(attachAtOriginalPosition(toolbar, tools));
      if (alignment) alignment.before(sizeButtons);
      else toolbar.append(sizeButtons);
    }
    document.body.append(scrollRoom);
    sheet.hidden = false;
    fit();
    if (main) {
      oldInert = main.inert;
      main.inert = true;
    }
    // Focus synchronously within the tap so iOS can show its keyboard.
    activeEditor.focus({ preventScroll: true });
    if (field) {
      const end = field.value.length;
      field.setSelectionRange(end, end);
    } else {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>(
              headlineHitSelector + ",.editorial-secondary-text-hit",
            )
          : null;
      if (!trigger || !mobile.matches || trigger.hidden || trigger.disabled)
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      open(trigger);
    },
    { capture: true, signal },
  );
  sizeButtons.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>("button[data-step]")
          : null;
      if (!button) return;
      const step = Number(button.dataset.step);
      if (activeEditor === editor || activeEditor.id === "quote") {
        sizeRange.valueAsNumber = Math.min(
          Number(sizeRange.max),
          Math.max(Number(sizeRange.min), sizeRange.valueAsNumber + step),
        );
        sizeRange.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        const offset = Number(activeEditor.dataset.sizeOffset || 0) + step;
        activeEditor.dataset.sizeOffset = String(
          Math.min(20, Math.max(-16, offset)),
        );
        activeEditor.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    { signal },
  );
  tools.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target instanceof Element && event.target.closest("button"))
        event.preventDefault();
    },
    { signal },
  );
  tools.addEventListener(
    "click",
    () => {
      activeEditor.focus({ preventScroll: true });
    },
    { signal },
  );
  selectAll.addEventListener("pointerdown", (event) => event.preventDefault(), { signal });
  selectAll.addEventListener("click", () => {
    activeEditor.focus({ preventScroll: true });
    if (activeEditor instanceof HTMLInputElement || activeEditor instanceof HTMLTextAreaElement) {
      activeEditor.select();
    } else {
      getSelection()?.selectAllChildren(activeEditor);
    }
  }, { signal });
  reset.addEventListener("pointerdown", (event) => event.preventDefault(), { signal });
  reset.addEventListener("click", () => {
    resetSession();
    activeEditor.focus({ preventScroll: true });
  }, { signal });

  let drag: { id: number; start: number; distance: number } | null = null;
  let suppressTap = false;
  handle.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    suppressTap = false;
    drag = { id: event.pointerId, start: event.clientY, distance: 0 };
    handle.setPointerCapture(event.pointerId);
  }, { signal });
  handle.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.distance = Math.max(0, event.clientY - drag.start);
    dialog.style.setProperty("--editorial-text-drag", drag.distance + "px");
  }, { signal });
  function endDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const distance = drag.distance;
    drag = null;
    suppressTap = distance > 8 || event.type !== "pointerup";
    dialog.style.removeProperty("--editorial-text-drag");
    if (event.type === "pointerup" && distance >= 48) close();
  }
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
    handle.addEventListener(type, endDrag, { signal });
  }
  handle.addEventListener("click", (event) => {
    if (!suppressTap || event.detail === 0) close();
  }, { signal });
  sheet.addEventListener(
    "click",
    (event) => {
      if (event.target === sheet) close();
    },
    { signal },
  );
  sheet.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button,textarea,input:not([type=hidden]),[contenteditable="true"]',
        ),
      ].filter((n) => n.getClientRects().length);
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal },
  );
  window.visualViewport?.addEventListener("resize", fit, { signal });
  window.visualViewport?.addEventListener("scroll", fit, { signal });
  window.addEventListener("resize", fit, { signal });
  const resize = new ResizeObserver(fit);
  resize.observe(dialog);
  window.addEventListener(
    renderEvent,
    () => {
      syncSecondaryHit();
      queueCenter();
    },
    { signal },
  );
  syncSecondaryHit();
  source.addEventListener("input", queueCenter, { signal });
  mobile.addEventListener(
    "change",
    () => {
      syncSecondaryHit();
      if (!mobile.matches) close();
    },
    { signal },
  );

  return () => {
    close();
    listeners.abort();
    resize.disconnect();
    secondaryHit.remove();
  };
}
