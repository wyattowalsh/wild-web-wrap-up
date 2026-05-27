import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Issue } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="overflow-hidden border-primary/15 shadow-[0_14px_32px_rgba(20,49,61,0.06)]">
      <div className="h-1 bg-primary" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{issue.status}</Badge>
          <Badge variant="outline">{issue.email_type}</Badge>
          <span className="text-xs text-muted-foreground">
            {issue.dateLabel}
          </span>
        </div>
        <CardTitle className="text-xl">
          <Link href={`/issues/${issue.slug}`}>{issue.title}</Link>
        </CardTitle>
        <CardDescription>{issue.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {issue.tags.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {issue.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <Separator className="mb-4" />
        <Button asChild variant="outline" size="sm">
          <Link href={`/issues/${issue.slug}`}>
            Read issue
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
