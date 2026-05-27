import * as React from "react";

import { cn } from "@/lib/utils";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center",
        className,
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn("mt-1 max-w-sm text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Empty, EmptyDescription, EmptyTitle };
