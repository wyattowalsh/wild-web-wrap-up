import fs from "node:fs/promises";
import path from "node:path";

import { repoRoot } from "./issues.mjs";

export const buttondownDir = path.join(repoRoot, "buttondown");
export const emailsDir = path.join(buttondownDir, "emails");
export const snippetsDir = path.join(buttondownDir, "snippets");
export const generatedManifestPath = path.join(
  buttondownDir,
  ".wild-web-wrap-up-generated.json",
);

const managedDirs = [emailsDir, snippetsDir];

export async function readGeneratedManifest() {
  const manifest = JSON.parse(await fs.readFile(generatedManifestPath, "utf8"));

  if (!Array.isArray(manifest.files)) {
    throw new Error("Generated Buttondown manifest must include a files array");
  }

  return {
    files: manifest.files.map(assertManagedRelativePath),
  };
}

export function splitGeneratedFiles(files) {
  return {
    emails: files.filter((file) => file.startsWith("emails/")),
    snippets: files.filter((file) => file.startsWith("snippets/")),
  };
}

export async function removeManagedMarkdownFiles() {
  for (const directory of managedDirs) {
    await fs.mkdir(directory, { recursive: true });

    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        continue;
      }

      await fs.rm(path.join(directory, entry.name), { force: true });
    }
  }
}

export function assertManagedRelativePath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("Generated Buttondown manifest paths must be strings");
  }

  const normalizedPath = relativePath.replaceAll(
    path.win32.sep,
    path.posix.sep,
  );
  const parts = normalizedPath.split(path.posix.sep);
  const managedRoot = parts[0];

  if (
    path.isAbsolute(relativePath) ||
    parts.length < 2 ||
    parts.some((part) => part === "" || part === "." || part === "..") ||
    !["emails", "snippets"].includes(managedRoot)
  ) {
    throw new Error(
      `Refusing to use generated path outside managed Buttondown directories: ${relativePath}`,
    );
  }

  const outputPath = path.resolve(path.join(buttondownDir, normalizedPath));
  const allowedRoots = managedDirs.map((directory) => path.resolve(directory));
  const isAllowed = allowedRoots.some((root) =>
    outputPath.startsWith(`${root}${path.sep}`),
  );

  if (!isAllowed) {
    throw new Error(
      `Refusing to use generated path outside managed Buttondown directories: ${relativePath}`,
    );
  }

  return normalizedPath;
}
