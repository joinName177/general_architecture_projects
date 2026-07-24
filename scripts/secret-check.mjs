import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { containsPotentialSecret } from "./secret-patterns.mjs";

const candidateFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter((filePath) => filePath !== "");

const filesWithPotentialSecrets = [];

for (const filePath of candidateFiles) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  if (containsPotentialSecret(contents))
    filesWithPotentialSecrets.push(filePath);
}

if (filesWithPotentialSecrets.length > 0) {
  throw new Error(
    `Potential secrets detected: ${filesWithPotentialSecrets.join(", ")}`,
  );
}
