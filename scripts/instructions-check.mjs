import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

const requiredFiles = [
  ".github/actions/pnpm-check/action.yml",
  ".github/pull_request_template.md",
  ".github/workflows/verify.yml",
  "AGENTS.md",
  "ARCHITECTURE.md",
  "CONTRIBUTING.md",
  "engineering-standards.md",
];

for (const fileName of requiredFiles) {
  await access(fileName);
}

const workflow = parse(await readFile(".github/workflows/verify.yml", "utf8"));
parse(await readFile(".github/actions/pnpm-check/action.yml", "utf8"));
const requiredCheckIds = [
  "architecture-check",
  "commit-policy-check",
  "cycle-check",
  "diagram-check",
  "format-check",
  "generated-code-drift",
  "instructions-check",
  "lint-zero-warning",
  "profile-check",
  "toolchain-check",
  "typecheck",
];

for (const checkId of requiredCheckIds) {
  if (workflow.jobs?.[checkId]?.name !== checkId) {
    throw new Error(`CI workflow is missing required check id: ${checkId}`);
  }
}

const nestedAgentFiles = [];

async function findNestedAgentFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }

    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await findNestedAgentFiles(entryPath);
    } else if (entry.name === "AGENTS.md" && entryPath !== "AGENTS.md") {
      nestedAgentFiles.push(entryPath);
    }
  }
}

await findNestedAgentFiles(".");

if (nestedAgentFiles.length > 0) {
  throw new Error(
    `Nested AGENTS.md files are forbidden: ${nestedAgentFiles.join(", ")}`,
  );
}
