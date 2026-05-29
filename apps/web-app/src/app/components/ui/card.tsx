import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// â”€â”€â”€ Variant definition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const cardVariants = cva("bg-card border border-neutral-200 rounded-lg", {
  variants: {
    /**
     * default    â€” no shadow, faint border. The standard in-app card style.
     * elevated   â€” adds a subtle shadow for visual lift.
     * interactive â€” hover lift + accent border tint; use for clickable cards.
     * accent     â€” accent-tinted background; for callout or highlighted cards.
     * ghost      â€” dashed border on muted bg; for empty-state placeholders.
     */
    variant: {
      default: "",
      elevated: "shadow-sm",
      interactive:
        "transition-all cursor-pointer hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-sm",
      accent: "bg-accent/5 border-accent/20",
      ghost:
        "bg-muted/10 border-2 border-dashed border-muted-foreground/20 rounded-lg",
    },
    /**
     * Padding shorthand. Use "none" for cards that contain full-bleed
     * content (tables, images, overflow-hidden panels).
     */
    padding: {
      none: "",
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
      xl: "p-10 md:p-12",
    },
    /** Radius override for pages that need a tighter or looser rounding. */
    radius: {
      sm: "rounded-md",
      default: "rounded-lg",
      lg: "rounded-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
    radius: "default",
  },
});

// â”€â”€â”€ Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export function Card({
  variant,
  padding,
  radius,
  className,
  asChild = false,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(cardVariants({ variant, padding, radius }), className)}
      {...props}
    />
  );
}

// â”€â”€â”€ Sub-components (structural card decomposition) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold text-foreground tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mt-6 pt-4 border-t border-neutral-200",
        className,
      )}
      {...props}
    />
  );
}
