import "@vitejs/plugin-react/preamble";
import { connectModuleOrder } from "../connectModuleOrder";
import { createPortal } from "react-dom";
import { TextSpacing } from "./TextSpacing";
import { createRoot } from "react-dom/client";
import { MobileDrawer } from "./MobileDrawer";
import { MobileTextEditor } from "./MobileTextEditor";

if (document.readyState === "complete") connectModuleOrder();
else document.addEventListener("DOMContentLoaded", connectModuleOrder, { once: true });

const main = document.querySelector("main");
if (main) {
  const host = document.createElement("div");
  host.style.display = "contents";
  main.append(host);
  const sizeField = document.getElementById("size")?.closest(".size-field");
  const spacingHost = document.createElement("div");
  spacingHost.className = "editorial-spacing-desktop";
  sizeField?.after(spacingHost);
  createRoot(host).render(
    <>
      <MobileDrawer />
      <MobileTextEditor />
      {sizeField && createPortal(<TextSpacing />, spacingHost)}
    </>,
  );
}
