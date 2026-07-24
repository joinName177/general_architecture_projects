import { access, readFile } from "node:fs/promises";

const bootstrapDocumentPath = "docs/architecture-bootstrap.md";

try {
  await access("architecture-profile.yaml");
} catch {
  const bootstrapDocument = await readFile(bootstrapDocumentPath, "utf8");

  if (
    !bootstrapDocument.includes("architecture-bootstrap") ||
    !bootstrapDocument.includes("dify-agent")
  ) {
    throw new Error("Architecture bootstrap status is not documented.");
  }

  process.exit(0);
}

throw new Error(
  "The profile validator must be implemented before adding architecture-profile.yaml.",
);
