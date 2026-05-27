import fs from "node:fs";
import path from "node:path";

export function getButtondownConfig(options = {}) {
  const env = loadLocalEnv(options);

  return {
    apiBaseUrl: normalizeButtondownBaseUrl(
      process.env.BUTTONDOWN_BASE_URL ?? env.BUTTONDOWN_BASE_URL,
    ),
    apiKey: process.env.BUTTONDOWN_API_KEY ?? env.BUTTONDOWN_API_KEY,
  };
}

export function loadLocalEnv(options = {}) {
  const cwd = options.cwd ?? process.cwd();

  return [".env", ".env.local"].reduce((loaded, file) => {
    const filePath = path.join(cwd, file);

    if (!fs.existsSync(filePath)) {
      return loaded;
    }

    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    return {
      ...loaded,
      ...parsed,
    };
  }, {});
}

function parseEnvFile(source) {
  const entries = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();

    entries[key] = unquoteEnvValue(rawValue);
  }

  return entries;
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeButtondownBaseUrl(value) {
  const baseUrl = value || "https://api.buttondown.com/v1";
  return baseUrl.replace(/\/$/, "");
}
