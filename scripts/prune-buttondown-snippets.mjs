import fs from "node:fs/promises";
import path from "node:path";

import { createButtondownClient } from "./lib/buttondown-api.mjs";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const manifestPath = path.join(
  repoRoot,
  "content",
  "buttondown",
  "retired-snippets.json",
);
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const forceReferenced = args.has("--force-referenced");
const buttondown = createButtondownClient({ cwd: repoRoot });
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const retired = Array.isArray(manifest.retired) ? manifest.retired : [];
const retiredByIdentifier = new Map(
  retired.map((entry) => [entry.identifier, entry]),
);

if (retiredByIdentifier.size === 0) {
  console.log("No retired snippets listed for pruning.");
  process.exit(0);
}

const remoteSnippets = await buttondown.listAll("/snippets", {
  optional: true,
});
const matches = remoteSnippets.filter((snippet) =>
  retiredByIdentifier.has(snippet.identifier),
);

if (matches.length === 0) {
  console.log("No retired remote snippets found.");
  process.exit(0);
}

console.log(
  `${apply ? "Pruning" : "Dry run for"} ${matches.length} retired Buttondown snippet${matches.length === 1 ? "" : "s"}:`,
);

let blocked = 0;
let deleted = 0;

for (const snippet of matches) {
  const entry = retiredByIdentifier.get(snippet.identifier);
  const referenceCount = Number(snippet.reference_count ?? 0);
  const summary = `${snippet.identifier} -> ${entry.replacement} (reference_count=${referenceCount})`;

  if (referenceCount > 0 && !forceReferenced) {
    blocked++;
    console.log(`- blocked: ${summary}`);
    continue;
  }

  if (!apply) {
    console.log(`- would delete: ${summary}`);
    continue;
  }

  await buttondown.request(`/snippets/${snippet.id}`, {
    method: "DELETE",
  });
  deleted++;
  console.log(`- deleted: ${summary}`);
}

if (!apply) {
  console.log("No snippets were deleted. Rerun with --apply to prune.");
}

if (blocked > 0) {
  throw new Error(
    `${blocked} retired snippet${blocked === 1 ? "" : "s"} still referenced; rerun with --force-referenced only after confirming every reference can break`,
  );
}

if (apply) {
  console.log(`Deleted ${deleted} retired snippet${deleted === 1 ? "" : "s"}.`);
}
