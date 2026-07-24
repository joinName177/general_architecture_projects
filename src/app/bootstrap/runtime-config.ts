import { z } from "zod";

import {
  apiContractId,
  apiContractSha256,
} from "~/generated/dify-agent-api/contract.gen";

const runtimeConfigSchema = z
  .object({
    apiBaseUrl: z.url(),
    apiContractId: z.literal(apiContractId),
    apiContractSha256: z.literal(apiContractSha256),
    releaseId: z.string().min(1),
  })
  .superRefine((config, context) => {
    const apiUrl = new URL(config.apiBaseUrl);
    const isLocal = ["localhost", "127.0.0.1"].includes(apiUrl.hostname);

    if (apiUrl.protocol !== "https:" && !isLocal) {
      context.addIssue({
        code: "custom",
        message: "Remote API endpoints must use HTTPS.",
        path: ["apiBaseUrl"],
      });
    }
    if (apiUrl.pathname !== "/api/v1" || config.apiBaseUrl.endsWith("/")) {
      context.addIssue({
        code: "custom",
        message: "API base URL must end with /api/v1 without a trailing slash.",
        path: ["apiBaseUrl"],
      });
    }
  });

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch("/runtime-config.json", {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error("Runtime configuration is unavailable.");
  }

  return runtimeConfigSchema.parse(await response.json());
}
