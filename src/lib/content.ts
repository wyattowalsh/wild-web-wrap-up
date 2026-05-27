import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import {
  isIssueStatus,
  isIssueTemplate,
  unsupportedIssueFrontmatterFields,
} from "@/lib/content-contract";

const contentDirectory = path.join(process.cwd(), "content", "issues");
const issueFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/;

const issueSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  subject: z.string().min(1).optional(),
  status: z.string().refine(isIssueStatus).default("draft"),
  email_type: z.string().min(1).default("public"),
  publish_date: z.string().min(1).optional(),
  buttondown_id: z.string().min(1).optional(),
  canonical_url: z.string().url().optional(),
  image: z.string().url().optional(),
  secondary_id: z.number().int().positive().optional(),
  template: z.string().refine(isIssueTemplate).optional(),
  tags: z.array(z.string().min(1)).default([]),
});

export type Issue = z.infer<typeof issueSchema> & {
  body: string;
  dateLabel: string;
};

export function getAllIssues(): Issue[] {
  return getIssueFiles()
    .map(readIssue)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      return byDate === 0 ? a.slug.localeCompare(b.slug) : byDate;
    });
}

export function getIssueBySlug(slug: string): Issue | null {
  const fileName = `${slug}.mdx`;
  const filePath = path.join(contentDirectory, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readIssue(fileName);
}

export function getIssueSlugs() {
  return getIssueFiles().map((fileName) => ({
    slug: fileName.replace(/\.mdx?$/, ""),
  }));
}

function getIssueFiles() {
  return fs
    .readdirSync(contentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && issueFilePattern.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function readIssue(fileName: string): Issue {
  const filePath = path.join(contentDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = matter(source);
  assertNoUnsupportedFreePlanFrontmatter(fileName, parsed.data);
  const frontmatter = issueSchema.parse(parsed.data);
  const expectedSlug = fileName.replace(/\.mdx?$/, "");

  if (frontmatter.slug !== expectedSlug) {
    throw new Error(
      `${fileName}: frontmatter slug "${frontmatter.slug}" must match file name "${expectedSlug}"`,
    );
  }

  return {
    ...frontmatter,
    body: parsed.content.trim(),
    dateLabel: formatIssueDate(frontmatter.date),
  };
}

function assertNoUnsupportedFreePlanFrontmatter(
  fileName: string,
  frontmatter: Record<string, unknown>,
) {
  for (const key of unsupportedIssueFrontmatterFields) {
    if (Object.hasOwn(frontmatter, key)) {
      throw new Error(
        `${fileName}: frontmatter "${key}" is not supported by the current Buttondown free-plan sync path`,
      );
    }
  }
}

function formatIssueDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
