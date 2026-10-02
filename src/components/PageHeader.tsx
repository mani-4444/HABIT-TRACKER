import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  /** Second part of the title, set in the primary colour like the login page. */
  accent?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, accent, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-[1.02] text-foreground sm:text-4xl lg:text-5xl">
          {title}
          {accent && <span className="text-primary"> {accent}</span>}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
