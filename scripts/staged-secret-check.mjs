import { execFileSync } from "node:child_process";
import { relative, isAbsolute } from "node:path";

const secretPatterns = [
  /-----BEGIN (?:EC|OPENSSH|PGP|RSA) PRIVATE KEY-----/u,
  /AKIA[0-9A-Z]{16}/u,
  /gh[pousr]_[A-Za-z0-9_]{20,}/u,
  /(?:api|auth|private|secret)[_-]?key\s*[:=]\s*["'][^"']{8,}/iu,
];

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const stagedFiles = process.argv.slice(2);

for (const filePath of stagedFiles) {
  // Convert absolute path to repo-relative path for git show
  const relativePath = isAbsolute(filePath)
    ? relative(repoRoot, filePath)
    : filePath;

  // Skip files that are not inside the current repo
  if (relativePath.startsWith("..")) {
    continue;
  }

  const stagedContents = execFileSync("git", ["show", `:${relativePath}`], {
    encoding: "utf8",
  });

  if (secretPatterns.some((pattern) => pattern.test(stagedContents))) {
    throw new Error(`Potential secret detected in staged file: ${filePath}`);
  }
}
