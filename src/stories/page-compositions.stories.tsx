import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, ListChecks, MailCheck } from "lucide-react";

import { IssueCard } from "@/components/issue-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { issueFixtures, primaryIssue } from "@/stories/fixtures";

const meta = {
  title: "Pages/Compositions",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const HomeWithIssues: Story = {
  render: () => <HomeComposition issues={issueFixtures} />,
};

export const HomeEmpty: Story = {
  render: () => <HomeComposition issues={[]} />,
};

export const Archive: Story = {
  render: () => (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="secondary">Archive</Badge>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">
            Every Wrap-Up
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Local issue sources with Buttondown-safe export status and reusable
            editorial structure.
          </p>
        </div>
        <Separator className="mb-6" />
        <div className="grid gap-4 md:grid-cols-2">
          {issueFixtures.map((issue) => (
            <IssueCard key={issue.slug} issue={issue} />
          ))}
        </div>
      </main>
    </>
  ),
};

export const IssueDetail: Story = {
  render: () => {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{primaryIssue.status}</Badge>
            <Badge variant="outline">{primaryIssue.email_type}</Badge>
            <span className="text-sm text-muted-foreground">
              {primaryIssue.dateLabel}
            </span>
          </div>
          <h1 className="mb-3 text-4xl font-semibold tracking-normal">
            {primaryIssue.title}
          </h1>
          <p className="mb-6 text-base leading-7 text-muted-foreground">
            {primaryIssue.description}
          </p>
          <Separator className="mb-8" />
          <article>
            <p className="mt-5 text-base leading-7 text-foreground/90">
              The first pass is simple: collect the interesting parts of the
              web, explain why they matter, and keep the archive clean enough to
              search later.
            </p>
            <h2 className="mt-10 scroll-m-20 border-t pt-8 text-2xl font-semibold tracking-normal">
              The Brief
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-foreground/90">
              <li className="leading-7">
                A weekly editorial issue is the source of truth.
              </li>
              <li className="leading-7">
                The web archive and Buttondown draft are generated from the same
                file.
              </li>
              <li className="leading-7">
                Drafts start local, then move to Buttondown when they are ready
                for review.
              </li>
            </ul>
            <h2 className="mt-10 scroll-m-20 border-t pt-8 text-2xl font-semibold tracking-normal">
              Worth Watching
            </h2>
            <p className="mt-5 text-base leading-7 text-foreground/90">
              The most useful version of this project is not a link dump. Each
              issue should separate quick finds from durable references.
            </p>
          </article>
        </main>
      </>
    );
  },
};

function HomeComposition({ issues }: { issues: typeof issueFixtures }) {
  const [latestIssue, ...olderIssues] = issues;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b bg-[linear-gradient(180deg,#f7faf8_0%,#ffffff_100%)]">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-14">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge variant="secondary">Free-plan safe</Badge>
                <Badge variant="outline">Manual MDX</Badge>
                <Badge variant="outline">Snippet studio</Badge>
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-balance sm:text-6xl">
                Wild Web Wrap-Up
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                A weekly archive for the links, notes, and web-native ideas
                worth carrying forward.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {latestIssue ? (
                  <Button asChild>
                    <Link href={`/issues/${latestIssue.slug}`}>
                      Latest issue
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link href="/archive">View archive</Link>
                </Button>
              </div>
            </div>

            <Card className="self-end border-primary/15 shadow-[0_18px_42px_rgba(20,49,61,0.08)]">
              <CardContent className="grid gap-5 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <MailCheck className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Current source</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {latestIssue
                        ? `${latestIssue.title} is ready as a ${latestIssue.status} issue.`
                        : "No issue drafts yet."}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <ListChecks className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Archive count</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {issues.length} issue{issues.length === 1 ? "" : "s"} in
                      the local collection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">
                Recent Issues
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The latest published and draft editions.
              </p>
            </div>
            {olderIssues.length > 0 ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/archive">
                  All issues
                  <ArrowRight />
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {issues.slice(0, 4).map((issue) => (
              <IssueCard key={issue.slug} issue={issue} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
