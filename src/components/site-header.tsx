import Link from "next/link";
import { Archive, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

const buttondownUrl =
  process.env.NEXT_PUBLIC_BUTTONDOWN_URL ?? "https://buttondown.com";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            w4w
          </span>
          <span className="text-sm font-semibold tracking-normal">
            Wild Web Wrap-Up
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/archive">
              <Archive />
              Archive
            </Link>
          </Button>
          <Button asChild size="sm">
            <a href={buttondownUrl}>
              <Send />
              Subscribe
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
