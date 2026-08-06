import { readFile, rename, writeFile } from "node:fs/promises";
import { URL } from "node:url";
import { parse } from "yaml";

function assertObject(value, sourcePath) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${sourcePath} must contain a JSON object.`);
  }
}

function isLocalOrPrivateHost(host) {
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
    return true;
  }
  if (
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return true;
  }
  return false;
}

function assertApiBaseUrl(apiBaseUrl, sourcePath) {
  if (typeof apiBaseUrl !== "string") {
    throw new Error(`${sourcePath} apiBaseUrl must be a string.`);
  }

  // Empty string means same-origin proxy — valid.
  if (apiBaseUrl === "") return;

  let apiUrl;
  try {
    apiUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error(
      `${sourcePath} apiBaseUrl must be a valid absolute URL or empty for proxy mode.`,
    );
  }

  if (apiUrl.pathname !== "/" && apiUrl.pathname !== "") {
    throw new Error(
      `${sourcePath} apiBaseUrl must be a root URL without a path.`,
    );
  }

  const isLocal = isLocalOrPrivateHost(apiUrl.hostname);
  if (apiUrl.protocol !== "https:" && !isLocal) {
    throw new Error(`${sourcePath} remote API endpoints must use HTTPS.`);
  }
}

async function readJsonObject(sourcePath) {
  const value = JSON.parse(await readFile(sourcePath, "utf8"));
  assertObject(value, sourcePath);
  return value;
}

async function readProfile(profilePath) {
  const profile = parse(await readFile(profilePath, "utf8"));
  assertObject(profile, profilePath);
  assertObject(profile.api, `${profilePath} api`);
  return profile;
}

export async function assertRuntimeConfigContract({
  configPath,
  profilePath = "architecture-profile.yaml",
}) {
  const [runtimeConfig, profile] = await Promise.all([
    readJsonObject(configPath),
    readProfile(profilePath),
  ]);

  assertApiBaseUrl(runtimeConfig.apiBaseUrl, configPath);
  if (
    typeof runtimeConfig.releaseId !== "string" ||
    runtimeConfig.releaseId === ""
  ) {
    throw new Error(`${configPath} releaseId must be a non-empty string.`);
  }
  if (runtimeConfig.apiContractId !== profile.api.contractId) {
    throw new Error(
      `${configPath} API contract id does not match the profile.`,
    );
  }
  if (runtimeConfig.apiContractSha256 !== profile.api.sha256) {
    throw new Error(
      `${configPath} API contract digest does not match the profile.`,
    );
  }

  return runtimeConfig;
}

export async function initializeRuntimeConfig({
  configPath,
  examplePath,
  profilePath = "architecture-profile.yaml",
}) {
  const exampleConfig = await assertRuntimeConfigContract({
    configPath: examplePath,
    profilePath,
  });
  let existingConfig;

  try {
    existingConfig = await readJsonObject(configPath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  const runtimeConfig = {
    ...exampleConfig,
    ...(typeof existingConfig?.apiBaseUrl === "string"
      ? { apiBaseUrl: existingConfig.apiBaseUrl }
      : {}),
    ...(typeof existingConfig?.releaseId === "string"
      ? { releaseId: existingConfig.releaseId }
      : {}),
  };
  const temporaryPath = `${configPath}.${process.pid}.tmp`;

  await writeFile(
    temporaryPath,
    `${JSON.stringify(runtimeConfig, null, 2)}\n`,
    {
      flag: "wx",
    },
  );
  await rename(temporaryPath, configPath);
  await assertRuntimeConfigContract({ configPath, profilePath });
  return runtimeConfig;
}
