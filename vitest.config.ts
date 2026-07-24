import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    coverage: {
      exclude: ["src/generated/**", "**/*.test.{ts,tsx}"],
      include: [
        "scripts/runtime-config-contract.mjs",
        "src/app/**/*.{ts,tsx}",
        "src/modules/**/*.{ts,tsx}",
        "src/shared/**/*.{ts,tsx}",
      ],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    globals: true,
  },
});
