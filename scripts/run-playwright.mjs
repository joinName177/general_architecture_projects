import { execFileSync } from "node:child_process";

const environment = { ...process.env };
delete environment.FORCE_COLOR;
delete environment.NO_COLOR;

execFileSync("pnpm", ["exec", "playwright", "test"], {
  env: environment,
  stdio: "inherit",
});
