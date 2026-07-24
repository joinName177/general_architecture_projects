import { readFile } from "node:fs/promises";

const architectureDocument = await readFile("ARCHITECTURE.md", "utf8");

if (!architectureDocument.includes("# Dify Agent 前端架构")) {
  throw new Error("Architecture document is missing its title.");
}
