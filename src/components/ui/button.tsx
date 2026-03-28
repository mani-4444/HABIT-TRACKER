import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-ambient hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.99]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0 active:scale-[0.99]",
        outline:
          "border border-input/90 bg-card/70 shadow-inner-soft backdrop-blur-sm hover:-translate-y-0.5 hover:bg-accent/55 hover:text-accent-foreground active:translate-y-0 active:scale-[0.99]",
        secondary:
          "bg-secondary/85 text-secondary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0 active:scale-[0.99]",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-soft hover:-translate-y-0.5 hover:bg-success/90 active:translate-y-0 active:scale-[0.99]",
        hero: "bg-gradient-to-r from-primary to-chart-3 text-primary-foreground shadow-ambient hover:-translate-y-1 hover:saturate-110 active:translate-y-0 active:scale-[0.99]",
        "hero-secondary":
          "bg-card/80 text-foreground border border-border/80 shadow-soft backdrop-blur-sm hover:-translate-y-0.5 hover:bg-accent/45 hover:border-primary/35 active:translate-y-0 active:scale-[0.99]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-2xl px-9 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
