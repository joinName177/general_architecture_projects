import { execFileSync } from "node:child_process";

const allowedLicenses = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-3-Clause",
  "ISC",
  "MIT",
]);
const report = JSON.parse(
  execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
    encoding: "utf8",
  }),
);
const rejectedLicenses = Object.keys(report).filter(
  (license) => !allowedLicenses.has(license),
);

if (rejectedLicenses.length > 0) {
  throw new Error(
    `Production dependencies use unapproved licenses: ${rejectedLicenses.join(", ")}`,
  );
}
