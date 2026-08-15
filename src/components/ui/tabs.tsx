import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    // Desk's tab strip is a glass track holding pills, matching the tool tabs on the
    // home hero. The rail rounds fully so the selected pill can sit flush inside it.
    className={cn(
      "inline-flex items-center gap-1 rounded-full border border-border-2 bg-[color-mix(in_srgb,var(--panel)_82%,transparent)] p-1 backdrop-blur-[10px]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "rounded-full px-3.5 py-1.5 font-sans text-[13px] font-medium text-ink-muted outline-none transition-colors",
      "hover:text-ink",
      "data-[state=active]:bg-accent data-[state=active]:text-[var(--on-accent)] data-[state=active]:font-semibold",
      "data-[state=active]:shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--accent)_60%,transparent)]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = TabsPrimitive.Content;
