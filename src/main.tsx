import { createRoot } from "react-dom/client";

import { BootstrapApplication } from "@/app/bootstrap/bootstrap-application";
import { loadRuntimeConfig } from "@/app/bootstrap/runtime-config";
import "@/styles/theme.css";

import * as styles from "./app/bootstrap/bootstrap-error.module.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Application root is unavailable.");
}

const root = createRoot(rootElement);

void loadRuntimeConfig()
  .then((runtimeConfig) => {
    root.render(<BootstrapApplication runtimeConfig={runtimeConfig} />);
  })
  .catch(() => {
    root.render(
      <main className={styles.container} role="alert">
        <h1>应用暂时无法启动</h1>
        <p>运行时配置无效，请联系系统管理员。</p>
      </main>,
    );
  });
