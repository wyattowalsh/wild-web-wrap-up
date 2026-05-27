import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { hash as hashEmail } from "../node_modules/@buttondown/cli/dist/lib/serde/email.js";
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

const syncStatePath = path.join(buttondownDir, ".buttondown.json");
const contentIssuesDir = path.join(repoRoot, "content", "issues");
const buttondown = createButtondownClient({ cwd: repoRoot });

const { files: generatedFiles } = await readGeneratedManifest();
const { emails: generatedEmailFiles, snippets: generatedSnippetFiles } =
  splitGeneratedFiles(generatedFiles);
const syncState = await readSyncState();
const remoteEmails = await buttondown.listAll("/emails");
const remoteSnippets = await buttondown.listAll("/snippets", {
  optional: true,
});
const emailResults = {
  created: 0,
  updated: 0,
};
const snippetResults = {
  created: 0,
  updated: 0,
};

for (const relativePath of generatedEmailFiles) {
  const filePath = path.join(buttondownDir, relativePath);
  const parsed = matter(await fs.readFile(filePath, "utf8"));
  const payload = buildEmailPayload(parsed);
  const existingId =
    parsed.data.id ??
    findSyncedEmailId(syncState, relativePath) ??
    remoteEmails.find((email) => email.slug && email.slug === payload.slug)?.id;

  let syncedEmail;

  if (existingId) {
    syncedEmail = await buttondown.request(`/emails/${existingId}`, {
      method: "PATCH",
      body: payload,
    });
    emailResults.updated++;
  } else {
    syncedEmail = await buttondown.request("/emails", {
      method: "POST",
      body: payload,
    });
    emailResults.created++;
  }

  const emailId = syncedEmail.id ?? existingId;

  if (!emailId) {
    throw new Error(
      `Buttondown did not return an email id for ${relativePath}`,
    );
  }

  await persistEmailId(relativePath, parsed, emailId);
  syncState.syncedEmails[emailId] = {
    modified: syncedEmail.modification_date ?? new Date().toISOString(),
    localPath: path.join("buttondown", relativePath),
    slug: syncedEmail.slug ?? payload.slug,
    contentHash: hashEmail({ ...payload, id: emailId }),
  };
}

const snippetsByIdentifier = new Map(
  remoteSnippets
    .filter((snippet) => snippet.identifier)
    .map((snippet) => [snippet.identifier, snippet]),
);

for (const relativePath of generatedSnippetFiles) {
  const filePath = path.join(buttondownDir, relativePath);
  const identifier = path.basename(relativePath, ".md");
  const parsed = matter(await fs.readFile(filePath, "utf8"));
  const payload = buildSnippetPayload(identifier, parsed);

  const existingSnippet = snippetsByIdentifier.get(identifier);

  if (existingSnippet) {
    await buttondown.request(`/snippets/${existingSnippet.id}`, {
      method: "PATCH",
      body: payload,
    });
    snippetResults.updated++;
  } else {
    const snippet = await buttondown.request("/snippets", {
      method: "POST",
      body: payload,
    });
    snippetsByIdentifier.set(identifier, snippet);
    snippetResults.created++;
  }
}

syncState.lastSync = new Date().toISOString();
await fs.writeFile(
  syncStatePath,
  `${JSON.stringify(syncState, null, 2)}\n`,
  "utf8",
);

console.log(
  `Synced ${emailResults.created} generated email${emailResults.created === 1 ? "" : "s"} created, ${emailResults.updated} updated`,
);
console.log(
  `Synced ${snippetResults.created} snippet${snippetResults.created === 1 ? "" : "s"} created, ${snippetResults.updated} updated`,
);

async function persistEmailId(relativePath, parsed, emailId) {
  const generatedPath = path.join(buttondownDir, relativePath);

  if (parsed.data.id !== emailId) {
    await fs.writeFile(
      generatedPath,
      matter.stringify(parsed.content.trim(), {
        ...parsed.data,
        id: emailId,
      }),
      "utf8",
    );
  }

  const slug = parsed.data.slug;

  if (!slug) {
    return;
  }

  const sourcePath = path.join(contentIssuesDir, `${slug}.mdx`);

  if (!fsSync.existsSync(sourcePath)) {
    return;
  }

  const source = await fs.readFile(sourcePath, "utf8");
  const sourceParsed = matter(source);

  if (sourceParsed.data.buttondown_id === emailId) {
    return;
  }

  await fs.writeFile(
    sourcePath,
    matter.stringify(sourceParsed.content.trim(), {
      ...sourceParsed.data,
      buttondown_id: emailId,
    }),
    "utf8",
  );
}

function findSyncedEmailId(state, relativePath) {
  const expectedLocalPath = path.join("buttondown", relativePath);
  const match = Object.entries(state.syncedEmails).find(
    ([, value]) => value.localPath === expectedLocalPath,
  );

  return match?.[0];
}

async function readSyncState() {
  try {
    const state = JSON.parse(await fs.readFile(syncStatePath, "utf8"));
    state.syncedEmails ||= {};
    state.syncedImages ||= {};
    state.syncedNewsletter ||= null;
    return state;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {
        lastSync: null,
        syncedEmails: {},
        syncedImages: {},
        syncedNewsletter: null,
      };
    }

    throw error;
  }
}
