import { createRoot } from "react-dom/client";

import { BootstrapApplication } from "@/app/bootstrap/bootstrap-application";
import "@/styles/theme.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Application root is unavailable.");
}

createRoot(rootElement).render(<BootstrapApplication />);
