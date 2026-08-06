import { z } from "zod";

import {
  apiContractId,
  apiContractSha256,
} from "~/generated/dify-agent-api/contract.gen";

const runtimeConfigSchema = z
  .object({
    apiBaseUrl: z.string(),
    apiContractId: z.literal(apiContractId),
    apiContractSha256: z.literal(apiContractSha256),
    releaseId: z.string().min(1),
  })
  .superRefine((config, context) => {
    // Empty string means same-origin proxy — skip URL validation.
    if (config.apiBaseUrl === "") return;

    let apiUrl: URL;
    try {
      apiUrl = new URL(config.apiBaseUrl);
    } catch {
      context.addIssue({
        code: "custom",
        message:
          "apiBaseUrl must be a valid absolute URL or empty for proxy mode.",
        path: ["apiBaseUrl"],
      });
      return;
    }

    if (apiUrl.pathname !== "/" && apiUrl.pathname !== "") {
      context.addIssue({
        code: "custom",
        message: "apiBaseUrl must be a root URL without a path.",
        path: ["apiBaseUrl"],
      });
      return;
    }

    const isLocal = isLocalOrPrivateHost(apiUrl.hostname);
    if (apiUrl.protocol !== "https:" && !isLocal) {
      context.addIssue({
        code: "custom",
        message: "Remote API endpoints must use HTTPS.",
        path: ["apiBaseUrl"],
      });
    }
  });

function isLocalOrPrivateHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
    return true;
  }
  // Quick check for common private IPv4 prefixes.
  if (
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return true;
  }
  return false;
}

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
