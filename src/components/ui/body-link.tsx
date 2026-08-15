import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The link-inside-prose treatment, as a class rather than a component.
 *
 * Router links need the same look but cannot be an `<a>` we render ourselves, so the
 * styling lives here and both paths use it. One definition, two elements — rather than a
 * second hand-tuned underline colour drifting into a page somewhere.
 */
export const bodyLinkClass =
  "text-accent underline decoration-[rgba(139,127,255,0.45)] underline-offset-2 transition-[text-decoration-color] duration-150 hover:decoration-accent";

export function BodyLink({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn(bodyLinkClass, className)} {...props} />;
}
