import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  className?: string
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
    <Card variant="stat" className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sublabel && (
            <p
              className={cn(
                "text-xs",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground",
                !trend && "text-muted-foreground"
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-accent p-2.5">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
        )}
      </div>
    </Card>
  )
}
