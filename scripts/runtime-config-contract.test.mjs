import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertRuntimeConfigContract,
  initializeRuntimeConfig,
} from "./runtime-config-contract.mjs";

const temporaryDirectories = [];
const contractId = "dify-agent-api/v1";
const contractSha256 = "a".repeat(64);

async function createFixture() {
  const directoryPath = await mkdtemp(join(tmpdir(), "runtime-config-test-"));
  const profilePath = join(directoryPath, "architecture-profile.yaml");
  const examplePath = join(directoryPath, "runtime-config.example.json");
  const configPath = join(directoryPath, "runtime-config.json");
  const runtimeConfig = {
    apiBaseUrl: "http://localhost:18080/api/v1",
    apiContractId: contractId,
    apiContractSha256: contractSha256,
    releaseId: "local",
  };

  temporaryDirectories.push(directoryPath);
  await writeFile(
    profilePath,
    JSON.stringify({ api: { contractId, sha256: contractSha256 } }),
  );
  await writeFile(examplePath, JSON.stringify(runtimeConfig));
  return { configPath, examplePath, profilePath, runtimeConfig };
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directoryPath) =>
        rm(directoryPath, { force: true, recursive: true }),
      ),
  );
});

describe("runtime config contract", () => {
  it("accepts a runtime config matching the architecture profile", async () => {
    const fixture = await createFixture();
    await writeFile(fixture.configPath, JSON.stringify(fixture.runtimeConfig));

    await expect(assertRuntimeConfigContract(fixture)).resolves.toMatchObject({
      apiContractId: contractId,
    });
  });

  it("rejects a stale API contract digest", async () => {
    const fixture = await createFixture();
    await writeFile(
      fixture.configPath,
      JSON.stringify({ ...fixture.runtimeConfig, apiContractSha256: "stale" }),
    );

    await expect(assertRuntimeConfigContract(fixture)).rejects.toThrow(
      "API contract digest does not match the profile",
    );
  });

  it("creates a missing local config from the validated example", async () => {
    const fixture = await createFixture();

    await initializeRuntimeConfig(fixture);

    await expect(readFile(fixture.configPath, "utf8")).resolves.toContain(
      contractSha256,
    );
  });

  it("refreshes contract fields while preserving local settings", async () => {
    const fixture = await createFixture();
    await writeFile(
      fixture.configPath,
      JSON.stringify({
        ...fixture.runtimeConfig,
        apiBaseUrl: "http://127.0.0.1:19090/api/v1",
        apiContractSha256: "stale",
        releaseId: "developer-a",
      }),
    );

    await initializeRuntimeConfig(fixture);
    const initializedConfig = JSON.parse(
      await readFile(fixture.configPath, "utf8"),
    );

    expect(initializedConfig).toMatchObject({
      apiBaseUrl: "http://127.0.0.1:19090/api/v1",
      apiContractSha256: contractSha256,
      releaseId: "developer-a",
    });
  });
});
