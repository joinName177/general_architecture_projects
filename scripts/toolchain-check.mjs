import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const requiredScripts = [
  "architecture:check",
  "build",
  "cycle:check",
  "format:check",
  "lint",
  "staged:check",
  "test",
  "typecheck",
  "verify",
];

for (const scriptName of requiredScripts) {
  if (typeof packageJson.scripts?.[scriptName] !== "string") {
    throw new Error(`Missing required script: ${scriptName}`);
  }
}

for (const [packageName, version] of Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})) {
  if (typeof version !== "string" || /^[~^]/u.test(version)) {
    throw new Error(`Dependency must use an exact version: ${packageName}`);
  }
}
