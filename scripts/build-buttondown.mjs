import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import prettier from "prettier";

import {
  buttondownDir,
  emailsDir,
  generatedManifestPath,
  removeManagedMarkdownFiles,
  snippetsDir,
} from "./lib/buttondown-generated.mjs";
import { readIssues, repoRoot } from "./lib/issues.mjs";
import { cleanObject } from "./lib/objects.mjs";

const buttondownSourceDir = path.join(repoRoot, "content", "buttondown");
const snippetsSourceDir = path.join(buttondownSourceDir, "snippets");

const issues = await readIssues();
const prettierConfig = (await prettier.resolveConfig(repoRoot)) ?? {};

await fs.mkdir(emailsDir, { recursive: true });
await fs.mkdir(snippetsDir, { recursive: true });
await removeManagedMarkdownFiles();

const generatedFiles = [];

for (const issue of issues) {
  const relativePath = path.join("emails", `${issue.slug}.md`);
  const outputPath = path.join(buttondownDir, relativePath);
  const frontmatter = cleanObject({
    id: issue.buttondown_id,
    subject: issue.subject ?? issue.title,
    status: issue.status,
    email_type: issue.email_type,
    template: issue.template,
    slug: issue.slug,
    publish_date: issue.publish_date,
    canonical_url: issue.canonical_url,
    description: issue.description,
    image: issue.image,
    secondary_id: issue.secondary_id,
  });
  const emailBody = stripLeadingTitle(issue.body, issue.title).trim();

  const output = await prettier.format(
    matter.stringify(`${emailBody}\n`, frontmatter),
    {
      ...prettierConfig,
      parser: "markdown",
    },
  );

  await fs.writeFile(outputPath, output, "utf8");
  generatedFiles.push(relativePath);
}

for (const snippetFile of await getSnippetFiles()) {
  const relativePath = path.join("snippets", snippetFile);
  const sourcePath = path.join(snippetsSourceDir, snippetFile);
  const outputPath = path.join(buttondownDir, relativePath);
  const source = await fs.readFile(sourcePath, "utf8");
  const output = await prettier.format(source, {
    ...prettierConfig,
    parser: "markdown",
  });

  await fs.writeFile(outputPath, output, "utf8");
  generatedFiles.push(relativePath);
}

await fs.writeFile(
  generatedManifestPath,
  await prettier.format(
    JSON.stringify(
      {
        files: generatedFiles,
      },
      null,
      2,
    ),
    {
      ...prettierConfig,
      parser: "json",
    },
  ),
  "utf8",
);

console.log(
  `Generated ${issues.length} Buttondown email${issues.length === 1 ? "" : "s"} and ${generatedFiles.length - issues.length} snippet${generatedFiles.length - issues.length === 1 ? "" : "s"} in buttondown/`,
);

async function getSnippetFiles() {
  const entries = await fs.readdir(snippetsSourceDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function stripLeadingTitle(body, title) {
  const trimmed = body.trimStart();
  const firstHeading = trimmed.match(/^#\s+(.+)\n+/);

  if (!firstHeading) {
    return body;
  }

  if (firstHeading[1].trim() !== title.trim()) {
    return body;
  }

  return trimmed.slice(firstHeading[0].length);
}
