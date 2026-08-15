import * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-border bg-panel", className)} {...props} />;
}

export function PanelHead({
  title,
  sub,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { title: string; sub?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-4 py-2.5",
        className
      )}
      {...props}
    >
      {/* Ledger set the region address in ink at reading size, which made
          `browse.base-model` look like the panel's heading. It never was one — it is a
          label on an instrument. Desk demotes it to the shelf-label role (mono, tracked,
          uppercase, muted) and leaves the human heading to the page above the panel. */}
      <span className="desk-pill-label">{title}</span>
      {sub && <span className="desk-data text-[13px] text-ink-muted">{sub}</span>}
    </div>
  );
}

export function PanelBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative p-5", className)} {...props} />;
}
