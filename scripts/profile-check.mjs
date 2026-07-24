import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

import { assertRuntimeConfigContract } from "./runtime-config-contract.mjs";

const schema = JSON.parse(
  await readFile("architecture-profile.schema.json", "utf8"),
);
const profile = parse(await readFile("architecture-profile.yaml", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

if (!ajv.validate(schema, profile)) {
  throw new Error(
    `Architecture profile is invalid: ${ajv.errorsText(ajv.errors)}`,
  );
}

const digest = (await readFile(profile.api.digestFile, "utf8")).trim();
if (digest !== profile.api.sha256) {
  throw new Error("Architecture profile API digest does not match artifact.");
}

const artifact = await readFile(profile.api.artifact);
const artifactDigest = createHash("sha256").update(artifact).digest("hex");
if (artifactDigest !== digest) {
  throw new Error("Pinned OpenAPI artifact does not match its digest file.");
}

await assertRuntimeConfigContract({
  configPath: "public/runtime-config.example.json",
});
