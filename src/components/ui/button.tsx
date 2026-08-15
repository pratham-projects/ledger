import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Desk's button.
 *
 * Ledger's was a square mono chip — a key on an instrument. Desk's is a pill in the
 * sentence face, because Desk's chrome is a set of soft controls floating over a lit room
 * rather than a panel of switches. Two variants, and they are not strong/weak versions of
 * the same thing:
 *
 * - `primary` is lit. Accent fill, `--on-accent` ink, and the accent glow from
 *   `.desk-cta`. It lifts a pixel on hover so the glow reads as elevation.
 * - `ghost` is glass. It borrows `.desk-pill` wholesale — the same translucent raised
 *   surface the composer's shelf controls use — so a button standing next to a shelf pill
 *   is visibly the same kind of object.
 *
 * `.desk-pill` carries its own padding and beats utilities via a doubled selector, so
 * `size` only reaches `primary`. That is the one wart of reusing the shelf recipe here,
 * and it is cheaper than keeping a second copy of the glass in sync.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans text-[13px] font-semibold transition-[border-color,background-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "desk-pill justify-center",
        primary:
          "desk-cta border border-accent bg-accent text-[var(--on-accent)] hover:-translate-y-px active:translate-y-0",
      },
      size: {
        sm: "px-3.5 py-1.5",
        md: "px-4 py-2",
        lg: "px-[22px] py-3 text-[14px]",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
