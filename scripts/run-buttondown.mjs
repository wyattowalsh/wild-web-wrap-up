import { spawn } from "node:child_process";
import path from "node:path";

import { loadLocalEnv } from "./lib/env.mjs";

const args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error("Usage: node scripts/run-buttondown.mjs <command> [...args]");
}

const executable = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "buttondown.cmd" : "buttondown",
);
const child = spawn(executable, withCredentialArgs(args), {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

let combinedOutput = "";

child.stdout.on("data", (chunk) => {
  combinedOutput += chunk.toString();
  process.stdout.write(chunk);
});

child.stderr.on("data", (chunk) => {
  combinedOutput += chunk.toString();
  process.stderr.write(chunk);
});

const exitCode = await new Promise((resolve) => {
  child.on("close", resolve);
});

const plainOutput = stripAnsi(combinedOutput);
const errorPatterns = [
  /\bError:/,
  /Invalid API key/i,
  /Unauthorized/i,
  /Failed to /,
  /Sync state not found/i,
  /Newsletter ID not found/i,
];
const hasErrorOutput = errorPatterns.some((pattern) =>
  pattern.test(plainOutput),
);

if (exitCode !== 0 || hasErrorOutput) {
  process.exitCode = exitCode === 0 ? 1 : exitCode;
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
}

function withCredentialArgs(originalArgs) {
  if (hasFlag(originalArgs, "--api-key", "-k")) {
    return originalArgs;
  }

  const env = loadLocalEnv();
  const apiKey = process.env.BUTTONDOWN_API_KEY ?? env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    return originalArgs;
  }

  const nextArgs = [...originalArgs, "--api-key", apiKey];
  const baseUrl = process.env.BUTTONDOWN_BASE_URL ?? env.BUTTONDOWN_BASE_URL;

  if (baseUrl && !hasFlag(nextArgs, "--base-url", "-b")) {
    nextArgs.push("--base-url", baseUrl);
  }

  return nextArgs;
}

function hasFlag(values, longFlag, shortFlag) {
  return values.some(
    (value) =>
      value === longFlag ||
      value === shortFlag ||
      value.startsWith(`${longFlag}=`) ||
      value.startsWith(`${shortFlag}=`),
  );
}
