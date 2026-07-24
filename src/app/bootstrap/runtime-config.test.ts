import { afterEach, describe, expect, it, vi } from "vitest";

import { loadRuntimeConfig } from "~/app/bootstrap/runtime-config";
import {
  apiContractId,
  apiContractSha256,
} from "~/generated/dify-agent-api/contract.gen";

afterEach(() => vi.unstubAllGlobals());

describe("loadRuntimeConfig", () => {
  it("accepts the pinned local API contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          apiBaseUrl: "http://localhost:18080/api/v1",
          apiContractId,
          apiContractSha256,
          releaseId: "test",
        }),
      ),
    );

    await expect(loadRuntimeConfig()).resolves.toMatchObject({
      apiContractId,
      releaseId: "test",
    });
  });

  it("rejects an unencrypted remote API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          apiBaseUrl: "http://api.example.test/api/v1",
          apiContractId,
          apiContractSha256,
          releaseId: "test",
        }),
      ),
    );

    await expect(loadRuntimeConfig()).rejects.toThrow(
      "Remote API endpoints must use HTTPS.",
    );
  });
});
