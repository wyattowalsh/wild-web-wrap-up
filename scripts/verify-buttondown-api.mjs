import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import {
  buttondownDir,
  readGeneratedManifest,
  splitGeneratedFiles,
} from "./lib/buttondown-generated.mjs";
import { createButtondownClient } from "./lib/buttondown-api.mjs";
import {
  buildEmailPayload,
  buildSnippetPayload,
} from "./lib/buttondown-payloads.mjs";
import { repoRoot } from "./lib/issues.mjs";

const buttondown = createButtondownClient({ cwd: repoRoot });
const { files: generatedFiles } = await readGeneratedManifest();
const { emails: generatedEmailFiles, snippets: generatedSnippetFiles } =
  splitGeneratedFiles(generatedFiles);
const [remoteEmails, remoteSnippets] = await Promise.all([
  buttondown.listAll("/emails"),
  buttondown.listAll("/snippets", { optional: true }),
]);
const remoteSnippetsByIdentifier = new Map(
  remoteSnippets
    .filter((snippet) => snippet.identifier)
    .map((snippet) => [snippet.identifier, snippet]),
);
const failures = [];

for (const relativePath of generatedEmailFiles) {
  const parsed = await readGenerated(relativePath);
  const expected = buildEmailPayload(parsed);
  const remoteEmail = findRemoteEmail(parsed, expected);

  if (!remoteEmail) {
    failures.push(`${relativePath}: no matching remote email by id or slug`);
    continue;
  }

  compareFields(relativePath, expected, remoteEmail, [
    "subject",
    "email_type",
    "status",
    "slug",
    "publish_date",
    "description",
    "image",
    "canonical_url",
    "secondary_id",
    "template",
    "body",
  ]);
}

for (const relativePath of generatedSnippetFiles) {
  const identifier = path.basename(relativePath, ".md");
  const parsed = await readGenerated(relativePath);
  const expected = buildSnippetPayload(identifier, parsed);
  const remoteSnippet = remoteSnippetsByIdentifier.get(identifier);

  if (!remoteSnippet) {
    failures.push(`${relativePath}: no matching remote snippet by identifier`);
    continue;
  }

  compareFields(relativePath, expected, remoteSnippet, [
    "name",
    "content",
    "mode",
  ]);
}

if (failures.length > 0) {
  throw new Error(
    `Buttondown verification failed:\n${failures
      .map((failure) => `- ${failure}`)
      .join("\n")}`,
  );
}

console.log(
  `Verified ${generatedEmailFiles.length} generated email${generatedEmailFiles.length === 1 ? "" : "s"} and ${generatedSnippetFiles.length} snippet${generatedSnippetFiles.length === 1 ? "" : "s"} against Buttondown API`,
);

async function readGenerated(relativePath) {
  const source = await fs.readFile(
    path.join(buttondownDir, relativePath),
    "utf8",
  );
  return matter(source);
}

function findRemoteEmail(parsed, expected) {
  return (
    remoteEmails.find((email) => email.id === parsed.data.id) ??
    remoteEmails.find((email) => email.slug && email.slug === expected.slug)
  );
}

function compareFields(relativePath, expected, actual, fields) {
  for (const field of fields) {
    if (!Object.hasOwn(expected, field)) {
      continue;
    }

    if (
      normalizeComparable(expected[field], field) !==
      normalizeComparable(actual[field], field)
    ) {
      failures.push(`${relativePath}: remote ${field} does not match local`);
    }
  }
}

function normalizeComparable(value, field) {
  if (field === "body" && typeof value === "string") {
    return value
      .trim()
      .replace(/^<!--\s*buttondown-editor-mode:\s*[\w-]+\s*-->\s*/, "")
      .trim();
  }

  return value ?? null;
}
