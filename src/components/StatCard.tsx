import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
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
    <Card
      variant="stat"
      className={cn(
        "rounded-[1.7rem] border-border/55 p-6 shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="font-display text-4xl font-bold tracking-tight">
            {value}
          </p>
          {sublabel && (
            <p
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground",
                !trend && "text-muted-foreground",
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-2xl bg-primary/15 p-3 shadow-inner-soft">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}
