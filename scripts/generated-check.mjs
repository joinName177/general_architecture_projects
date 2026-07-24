import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { spawn } from "node:child_process";

const committedDirectory = "src/generated/dify-agent-api";
const temporaryRoot = await mkdtemp(join(tmpdir(), "dify-agent-openapi-"));
const temporaryDirectory = join(temporaryRoot, "generated");

try {
  await runGenerator(temporaryDirectory);
  const committed = await snapshot(committedDirectory);
  const generated = await snapshot(temporaryDirectory);
  if (JSON.stringify(committed) !== JSON.stringify(generated)) {
    throw new Error("Generated API client has drifted; run pnpm generate:api.");
  }
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}

async function runGenerator(outputDirectory) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/generate-api-client.mjs"], {
      env: { ...process.env, DIFY_AGENT_GENERATED_OUTPUT: outputDirectory },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Generator exited ${String(code)}.`)),
    );
  });
}

async function snapshot(directory) {
  const entries = (
    await readdir(directory, { recursive: true, withFileTypes: true })
  )
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
  return Promise.all(
    entries.map(async (file) => [
      relative(directory, file),
      await readFile(file, "utf8"),
    ]),
  );
}
