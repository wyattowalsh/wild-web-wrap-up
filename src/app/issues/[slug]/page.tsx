import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Badge } from "@/components/ui/badge";
import { mdxComponents } from "@/components/mdx-content";
import { Separator } from "@/components/ui/separator";
import { getIssueBySlug, getIssueSlugs } from "@/lib/content";

type IssuePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getIssueSlugs();
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);

  if (!issue) {
    return {};
  }

  return {
    title: issue.title,
    description: issue.description,
  };
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{issue.status}</Badge>
        <Badge variant="outline">{issue.email_type}</Badge>
        <span className="text-sm text-muted-foreground">{issue.dateLabel}</span>
      </div>
      <h1 className="mb-3 text-4xl font-semibold tracking-normal">
        {issue.title}
      </h1>
      <p className="mb-6 text-base leading-7 text-muted-foreground">
        {issue.description}
      </p>
      <Separator className="mb-8" />
      <article>
        <MDXRemote
          source={stripLeadingTitle(issue.body, issue.title)}
          components={mdxComponents}
        />
      </article>
    </main>
  );
}

function stripLeadingTitle(body: string, title: string) {
  const trimmed = body.trimStart();
  const firstHeading = trimmed.match(/^#\s+(.+)\n+/);

  if (!firstHeading || firstHeading[1].trim() !== title.trim()) {
    return body;
  }

  return trimmed.slice(firstHeading[0].length);
}
