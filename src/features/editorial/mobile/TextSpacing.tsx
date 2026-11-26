import { useId, useSyncExternalStore } from "react";
import { renderEvent } from "./legacyEditor";

const options = [
  { value: "1", label: "XS", title: "50 px" },
  { value: "1.5", label: "S", title: "75 px" },
  { value: "2", label: "M", title: "100 px" },
  { value: "2.5", label: "L", title: "125 px" },
  { value: "3", label: "XL", title: "150 px" },
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
