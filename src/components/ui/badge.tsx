import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      // A badge is a pill in Desk, not a boxed chip — same family as `.desk-pill`, one
      // size down and without the glass, since a badge is read and never pressed. The
      // explicit radius overrides the global `.border` corner, which is square-ish at
      // this height.
      className={cn(
        "inline-flex items-center rounded-full border border-border-2 bg-[color-mix(in_srgb,var(--raised)_48%,transparent)] px-2 py-[1px] font-mono text-[10px] text-ink-muted-2",
        className
      )}
      {...props}
    />
  );
}
