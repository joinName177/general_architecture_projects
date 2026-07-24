import { access, readdir, readFile } from "node:fs/promises";

try {
  await access("generated");
} catch {
  process.exit(0);
}

const generatedEntries = await readdir("generated", { recursive: true });

for (const entry of generatedEntries) {
  const entryPath = `generated/${entry}`;
  const contents = await readFile(entryPath, "utf8");

  if (!contents.includes("generated")) {
    throw new Error(`Generated file lacks its generated marker: ${entryPath}`);
  }
}
