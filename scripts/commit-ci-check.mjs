import { execFileSync } from "node:child_process";

const pullRequestTitle = process.env.PR_TITLE;

if (pullRequestTitle === undefined || pullRequestTitle === "") {
  execFileSync("pnpm", ["commit:check"], { stdio: "inherit" });
} else {
  execFileSync("pnpm", ["exec", "commitlint"], {
    input: `${pullRequestTitle}\n`,
    stdio: ["pipe", "inherit", "inherit"],
  });
}
