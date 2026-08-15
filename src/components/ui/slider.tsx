import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex h-4 w-full touch-none select-none items-center", className)}
    {...props}
  >
    {/* Desk thickens Ledger's 2px hairline to a 3px rounded track and rounds the thumb.
        A square thumb on a lit ground read as a rendering artefact; a round one reads as
        a bead you can take hold of, and it carries the same accent glow as the CTAs. */}
    <SliderPrimitive.Track className="relative h-[3px] w-full grow rounded-full bg-border-2">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-[13px] w-[13px] rounded-full border border-accent bg-accent shadow-[0_2px_10px_-2px_color-mix(in_srgb,var(--accent)_70%,transparent)] outline-none transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label="value"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
