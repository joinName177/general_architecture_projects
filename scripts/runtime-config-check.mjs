import { assertRuntimeConfigContract } from "./runtime-config-contract.mjs";

try {
  await assertRuntimeConfigContract({
    configPath: "public/runtime-config.json",
  });
} catch (error) {
  throw new Error(
    `Local runtime configuration is invalid. Run "pnpm runtime-config:init" and retry. ${error instanceof Error ? error.message : "Unknown error."}`,
  );
}
