import { initializeRuntimeConfig } from "./runtime-config-contract.mjs";
import { stdout } from "node:process";

await initializeRuntimeConfig({
  configPath: "public/runtime-config.json",
  examplePath: "public/runtime-config.example.json",
});

stdout.write("Local runtime configuration is synchronized.\n");
