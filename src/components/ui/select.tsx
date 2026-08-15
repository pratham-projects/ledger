import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Desk sets control labels in the sentence face — a select holds a word the user
      // chose ("cinematic", "16:9"), not a machine value, so mono was mislabelling it.
      "flex w-full items-center justify-between gap-2 border border-border-2 bg-panel-2 py-2 pl-3 pr-2.5 font-sans text-[13.5px] font-medium text-ink outline-none transition-colors",
      "hover:border-accent data-[state=open]:border-accent data-[placeholder]:font-normal data-[placeholder]:text-ink-muted-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted-2" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    /** Portal target. Defaults to `document.body`; pass a token-scoped node so the
     *  menu inherits that scope's CSS custom properties instead of the app root's. */
    portalContainer?: HTMLElement | null;
  }
>(({ className, children, position = "popper", sideOffset = 4, portalContainer, ...props }, ref) => (
  <SelectPrimitive.Portal container={portalContainer ?? undefined}>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        // `.desk-menu` supplies the surface, the corner and the row rhythm; it is the
        // same menu the home composer's shelf pills open, so every dropdown in the app
        // is one object.
        "desk-menu z-50 max-h-[--radix-select-content-available-height] min-w-[--radix-select-trigger-width] overflow-hidden border shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 duration-150",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center pl-3 pr-7 text-ink-muted outline-none transition-colors",
      "data-[highlighted]:bg-raised data-[highlighted]:text-ink",
      "data-[state=checked]:text-accent",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export interface SimpleSelectOption {
  value: string;
  label: string;
}

/** Common dropdown for flat value/label lists — the shape every select on this site needs. */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  triggerClassName,
  contentClassName,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
