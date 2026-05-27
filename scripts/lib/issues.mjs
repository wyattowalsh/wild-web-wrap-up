import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { z } from "zod";

import {
  assertFreePlanData,
  assertFreePlanText,
  assertNoUnsupportedIssueFrontmatter,
} from "./free-plan.mjs";
import { issueStatuses, issueTemplates } from "./content-contract.mjs";

export const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
export const contentDir = path.join(repoRoot, "content", "issues");

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const issueFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/;
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const issueSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  date: dateSchema,
  description: z.string().min(1),
  subject: z.string().min(1).optional(),
  status: z.enum(issueStatuses).default("draft"),
  email_type: z.string().min(1).default("public"),
  publish_date: z.string().min(1).optional(),
  buttondown_id: z.string().min(1).optional(),
  canonical_url: z.string().url().optional(),
  image: z.string().url().optional(),
  secondary_id: z.number().int().positive().optional(),
  template: z.enum(issueTemplates).optional(),
  tags: z.array(z.string().min(1)).default([]),
});

const unsafeMdxPatterns = [
  {
    name: "ES module import/export",
    pattern: /(^|\n)\s*(import|export)\s+/,
  },
  {
    name: "uppercase JSX component",
    pattern: /<[A-Z][A-Za-z0-9]*(\s|>|\/)/,
  },
];

export async function readIssues() {
  const entries = await fs.readdir(contentDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && issueFilePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const issues = await Promise.all(files.map(readIssue));

  return issues.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    return byDate === 0 ? a.slug.localeCompare(b.slug) : byDate;
  });
}

async function readIssue(fileName) {
  const filePath = path.join(contentDir, fileName);
  const source = await fs.readFile(filePath, "utf8");
  const parsed = matter(source);
  assertNoUnsupportedIssueFrontmatter(fileName, parsed.data);
  assertFreePlanData(fileName, parsed.data);
  const frontmatter = issueSchema.parse(parsed.data);
  const expectedSlug = fileName.replace(/\.mdx?$/, "");

  if (frontmatter.slug !== expectedSlug) {
    throw new Error(
      `${fileName}: frontmatter slug "${frontmatter.slug}" must match file name "${expectedSlug}"`,
    );
  }

  for (const { name, pattern } of unsafeMdxPatterns) {
    if (pattern.test(parsed.content)) {
      throw new Error(
        `${fileName}: body contains ${name}; keep issue bodies Buttondown-safe Markdown`,
      );
    }
  }

  assertFreePlanText(parsed.content, fileName);

  return {
    ...frontmatter,
    sourceFile: fileName,
    body: parsed.content.trim(),
  };
}
