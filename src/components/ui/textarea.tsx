import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // The focus state is a 2px accent ring rather than a border swap, matching
          // `.desk-composer:focus-within` — in Desk the writing surface lights up, it
          // doesn't just outline.
          "w-full resize-none border border-border-2 bg-panel-2 px-3.5 py-3 font-sans text-[15px] leading-[1.6] text-ink placeholder:text-ink-muted-2",
          "transition-[box-shadow,border-color] duration-200 focus:border-accent focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_38%,transparent)] focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
