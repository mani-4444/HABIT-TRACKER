import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "ambient-panel group relative overflow-hidden rounded-[1.7rem] p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-soft-lg",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-transform duration-700 group-hover:scale-150"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="eyebrow">{label}</p>
          <p className="font-display text-4xl font-bold tracking-tight">
            {value}
          </p>
          {sublabel && (
            <p
              className={cn(
                "truncate text-xs font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                (!trend || trend === "neutral") && "text-muted-foreground",
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="shrink-0 rounded-2xl bg-primary/15 p-3 shadow-inner-soft transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
