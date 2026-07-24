import { readFile, readdir } from "node:fs/promises";

const requiredPaths = [
  "src/app/bootstrap/bootstrap-application.tsx",
  "src/app/i18n/i18n.ts",
  "src/app/module-catalog.ts",
  "src/app/providers/application-providers.tsx",
  "src/app/router/app-router.tsx",
  "src/shared/i18n/message-catalog.ts",
  "src/styles/theme.css",
];

for (const path of requiredPaths) {
  await readFile(path, "utf8");
}

const catalogSource = await readFile("src/app/module-catalog.ts", "utf8");

if (!catalogSource.includes("readonly ModuleDefinition[]")) {
  throw new Error("Module catalog must be a static readonly catalog.");
}

const sourcePaths = await readdir("src", { recursive: true });
const stylesheetPaths = sourcePaths.filter((path) => path.endsWith(".css"));
const globalStylesheetPaths = new Set([
  "styles/theme.css",
  "styles/tokens.css",
]);
const nonModuleStylesheetPaths = stylesheetPaths.filter(
  (path) => !path.endsWith(".module.css") && !globalStylesheetPaths.has(path),
);

if (nonModuleStylesheetPaths.length > 0) {
  throw new Error(
    `Business styles must use *.module.css: ${nonModuleStylesheetPaths.join(", ")}`,
  );
}

const moduleStylesheetPathsWithoutTypes = stylesheetPaths.filter(
  (path) =>
    path.endsWith(".module.css") && !sourcePaths.includes(`${path}.d.ts`),
);

if (moduleStylesheetPathsWithoutTypes.length > 0) {
  throw new Error(
    `CSS Modules require adjacent class-name declarations: ${moduleStylesheetPathsWithoutTypes.join(", ")}`,
  );
}

const sourceFilePaths = sourcePaths.filter(
  (path) => path.endsWith(".ts") || path.endsWith(".tsx"),
);
const nonEntryGlobalStyleImports = (
  await Promise.all(
    sourceFilePaths.map(async (path) => ({
      path,
      source: await readFile(`src/${path}`, "utf8"),
    })),
  )
).filter(({ path, source }) => {
  const stylesheetImports = [
    ...source.matchAll(/(?:from\s+|import\s+)["']([^"']+\.css)["']/g),
  ].map((match) => match[1]);
  return (
    path !== "main.tsx" &&
    stylesheetImports.some((stylesheetImport) =>
      stylesheetImport !== undefined
        ? !stylesheetImport.endsWith(".module.css")
        : false,
    )
  );
});

if (nonEntryGlobalStyleImports.length > 0) {
  throw new Error(
    `Global styles may only be imported by src/main.tsx: ${nonEntryGlobalStyleImports
      .map(({ path }) => path)
      .join(", ")}`,
  );
}
