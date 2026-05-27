import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import {
  assertConfiguredContrastPairs,
  assertCssTokenContrast,
  assertInlineHtmlContrast,
} from "./lib/contrast.mjs";
import { snippetCategories } from "./lib/content-contract.mjs";
import { assertFreePlanData, assertFreePlanText } from "./lib/free-plan.mjs";
import { readIssues, repoRoot } from "./lib/issues.mjs";

const issues = await readIssues();
const buttondownSourceDir = path.join(repoRoot, "content", "buttondown");
const baseTemplatePath = path.join(
  buttondownSourceDir,
  "templates",
  "base.html",
);
const snippetsSourceDir = path.join(buttondownSourceDir, "snippets");
const globalsCssPath = path.join(repoRoot, "src", "app", "globals.css");
const contentReadmePath = path.join(repoRoot, "content", "README.md");
const snippetSchema = z
  .object({
    name: z.string().min(1),
    mode: z.literal("naked"),
    category: z.enum(snippetCategories).optional(),
  })
  .strict();
const snippetIdentifierSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const requiredTemplateTokens = [
  "%%EMAIL_BODY%%",
  "%%ISSUE_DATE%%",
  "%%ISSUE_DESCRIPTION%%",
  "%%ISSUE_TITLE%%",
  "%%PREHEADER%%",
];
const unsafeEmailPatterns = [
  {
    name: "script tag",
    pattern: /<script\b/i,
  },
  {
    name: "iframe tag",
    pattern: /<iframe\b/i,
  },
  {
    name: "form tag",
    pattern: /<form\b/i,
  },
  {
    name: "embedded media tag",
    pattern: /<(audio|video)\b/i,
  },
  {
    name: "SVG tag",
    pattern: /<svg\b/i,
  },
  {
    name: "javascript URL",
    pattern: /javascript:/i,
  },
  {
    name: "class attribute",
    pattern: /\sclass\s*=/i,
  },
];

if (issues.length === 0) {
  throw new Error("No issue files found in content/issues");
}

assertConfiguredContrastPairs();
assertCssTokenContrast(
  await fs.readFile(globalsCssPath, "utf8"),
  "src/app/globals.css",
);

const templateSource = await fs.readFile(baseTemplatePath, "utf8");
validateEmailSafeHtml(templateSource, "content/buttondown/templates/base.html");
assertInlineHtmlContrast(
  templateSource,
  "content/buttondown/templates/base.html",
);

for (const token of requiredTemplateTokens) {
  if (!templateSource.includes(token)) {
    throw new Error(`Base email template is missing required token ${token}`);
  }
}

const snippets = await readSnippets();
await validateCatalogDocs(snippets);

console.log(
  `Validated ${issues.length} issue${issues.length === 1 ? "" : "s"}:`,
);

for (const issue of issues) {
  console.log(`- ${issue.slug} (${issue.date}, ${issue.status})`);
}

console.log(
  `Validated ${snippets.length} Buttondown snippet${snippets.length === 1 ? "" : "s"} and base email template`,
);

async function readSnippets() {
  const entries = await fs.readdir(snippetsSourceDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    throw new Error(
      "No Buttondown snippets found in content/buttondown/snippets",
    );
  }

  for (const file of files) {
    const identifier = file.replace(/\.md$/, "");
    snippetIdentifierSchema.parse(identifier);

    const source = await fs.readFile(
      path.join(snippetsSourceDir, file),
      "utf8",
    );
    const parsed = matter(source);
    assertFreePlanData(`content/buttondown/snippets/${file}`, parsed.data);
    const result = snippetSchema.safeParse(parsed.data);

    if (!result.success) {
      throw new Error(
        `content/buttondown/snippets/${file}: snippet frontmatter must include name, mode: naked, and optional category`,
      );
    }

    validateEmailSafeHtml(
      parsed.content,
      `content/buttondown/snippets/${file}`,
    );
    assertInlineHtmlContrast(
      parsed.content,
      `content/buttondown/snippets/${file}`,
    );
  }

  return files;
}

async function validateCatalogDocs(files) {
  const source = await fs.readFile(contentReadmePath, "utf8");
  const catalogSource = source.split("Current snippet catalog:")[1] ?? "";
  const documentedIdentifiers = new Set(
    Array.from(
      catalogSource.matchAll(/^- `([a-z0-9]+(?:-[a-z0-9]+)*)`:/gm),
    ).map(([, identifier]) => identifier),
  );
  const snippetIdentifiers = files.map((file) => file.replace(/\.md$/, ""));
  const missing = snippetIdentifiers.filter(
    (identifier) => !documentedIdentifiers.has(identifier),
  );
  const extra = [...documentedIdentifiers].filter(
    (identifier) => !snippetIdentifiers.includes(identifier),
  );

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      [
        "content/README.md snippet catalog does not match content/buttondown/snippets",
        missing.length > 0 ? `Missing: ${missing.join(", ")}` : null,
        extra.length > 0 ? `Extra: ${extra.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function validateEmailSafeHtml(source, label) {
  assertFreePlanText(source, label);

  for (const { name, pattern } of unsafeEmailPatterns) {
    if (pattern.test(source)) {
      throw new Error(`${label}: contains unsupported email content: ${name}`);
    }
  }
}
