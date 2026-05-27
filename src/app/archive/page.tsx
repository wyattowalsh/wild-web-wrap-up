import type { Metadata } from "next";

import { IssueCard } from "@/components/issue-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllIssues } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archive",
};

export default function ArchivePage() {
  const issues = getAllIssues();

  return (
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
        {issues.map((issue) => (
          <IssueCard key={issue.slug} issue={issue} />
        ))}
      </div>
    </main>
  );
}
