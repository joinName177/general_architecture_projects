import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

const requiredFiles = [
  ".github/pull_request_template.md",
  "AGENTS.md",
  "ARCHITECTURE.md",
  "CONTRIBUTING.md",
  "engineering-standards.md",
];

for (const fileName of requiredFiles) {
  await access(fileName);
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
