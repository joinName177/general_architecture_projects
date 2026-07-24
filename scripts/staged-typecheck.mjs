import { execFileSync } from "node:child_process";

execFileSync("node", ["scripts/run-pnpm.mjs", "typecheck"], {
  stdio: "inherit",
});
