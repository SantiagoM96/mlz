import { useId, useSyncExternalStore } from "react";
import { renderEvent } from "./legacyEditor";

const options = [
  { value: "1", label: "S", title: "Estándar" },
  { value: "2", label: "M", title: "Doble" },
  { value: "3", label: "L", title: "Triple" },
];

function subscribe(sync: () => void) {
  window.addEventListener(renderEvent, sync);
  return () => window.removeEventListener(renderEvent, sync);
}

function getSpacing() {
  return document.querySelector<HTMLInputElement>("#headlineSpacing")?.value ?? "1";
}

export function TextSpacing() {
  const id = useId();
  const active = useSyncExternalStore(subscribe, getSpacing);

  function applySpacing(value: string) {
    const control = document.querySelector<HTMLInputElement>("#headlineSpacing");
    if (!control || control.value === value) return;
    control.value = value;
    control.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <div className="editorial-headline-spacing">
      <span id={id}>Espaciado del texto</span>
      <div role="group" aria-labelledby={id}>
        {options.map(({ value, label, title }) => (
          <button
            key={value}
            type="button"
            title={title}
            aria-label={label + " · " + title}
            aria-pressed={active === value}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => applySpacing(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
