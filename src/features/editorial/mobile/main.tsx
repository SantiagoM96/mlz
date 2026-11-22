import "@vitejs/plugin-react/preamble";
import { createRoot } from "react-dom/client";
import { MobileDrawer } from "./MobileDrawer";
import { MobileTextEditor } from "./MobileTextEditor";

const main = document.querySelector("main");
if (main) {
  const host = document.createElement("div");
  host.style.display = "contents";
  main.append(host);
  createRoot(host).render(
    <>
      <MobileDrawer />
      <MobileTextEditor />
    </>,
  );
}
