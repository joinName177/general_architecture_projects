import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const requiredScripts = [
  "architecture:check",
  "build",
  "commit:check",
  "commit:ci-check",
  "cycle:check",
  "dependency:check",
  "diagram:check",
  "format",
  "format:check",
  "generated:check",
  "instructions:check",
  "license:check",
  "lint",
  "lint:fix",
  "profile:check",
  "secret:check",
  "security:check",
  "commit:prepare",
  "commit:ready",
  "staged:check",
  "test",
  "test:ci",
  "test:coverage",
  "test:e2e",
  "toolchain:check",
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
