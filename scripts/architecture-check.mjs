import { readFile } from "node:fs/promises";

const requiredPaths = [
  "src/app/bootstrap/bootstrap-application.tsx",
  "src/app/module-catalog.ts",
  "src/app/providers/application-providers.tsx",
  "src/app/router/app-router.tsx",
  "src/shared/i18n/i18n.ts",
  "src/styles/theme.css",
];

for (const path of requiredPaths) {
  await readFile(path, "utf8");
}

const catalogSource = await readFile("src/app/module-catalog.ts", "utf8");

if (!catalogSource.includes("readonly ModuleDefinition[]")) {
  throw new Error("Module catalog must be a static readonly catalog.");
}
