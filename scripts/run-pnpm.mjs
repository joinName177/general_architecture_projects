import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error("Usage: node scripts/run-pnpm.mjs <pnpm-args...>");
}

function run(command, commandArgs) {
  execFileSync(command, commandArgs, { stdio: "inherit" });
}

try {
  run("pnpm", args);
} catch (error) {
  if (error.code !== "ENOENT") {
    process.exit(typeof error.status === "number" ? error.status : 1);
  }

  run("corepack", ["pnpm", ...args]);
}
