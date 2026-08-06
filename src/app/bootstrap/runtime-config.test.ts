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
          apiBaseUrl: "http://localhost:18080",
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

  it("accepts an empty apiBaseUrl for same-origin proxy mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          apiBaseUrl: "",
          apiContractId,
          apiContractSha256,
          releaseId: "test",
        }),
      ),
    );

    await expect(loadRuntimeConfig()).resolves.toMatchObject({
      apiBaseUrl: "",
      releaseId: "test",
    });
  });

  it("rejects an unencrypted remote API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          apiBaseUrl: "http://api.example.test",
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
