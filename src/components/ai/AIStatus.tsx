import React from "react";
import { Brain, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIStatusProps {
  status: "idle" | "loading" | "ready" | "error";
  signalCount?: number;
  lastGeneratedAt?: string;
  dataPeriod?: string;
}

export const AIStatus: React.FC<AIStatusProps> = ({
  status,
  signalCount = 0,
  lastGeneratedAt,
  dataPeriod = "30d",
}) => {
  const getStatusLabel = () => {
    switch (status) {
      case "loading":
        return "Analyzing Patterns...";
      case "ready":
        return "Active & Verified";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  };

  const formattedDate = lastGeneratedAt
    ? new Date(lastGeneratedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const tile = "rounded-2xl border border-border/65 bg-card/80 px-3 py-2.5 text-center backdrop-blur-sm";
  const label = "flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className={tile}>
        <p className={label}>
          <Brain className="h-3 w-3 text-primary" /> Status
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 truncate text-xs font-bold text-foreground">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              status === "ready" && "bg-success",
              status === "loading" && "animate-pulse bg-primary",
              status === "error" && "bg-destructive",
              status === "idle" && "bg-muted-foreground/50",
            )}
          />
          {getStatusLabel()}
        </p>
      </div>

      <div className={tile}>
        <p className={label}>
          <Activity className="h-3 w-3 text-success" /> Evidence Signals
        </p>
        <p className="mt-1 text-xs font-bold text-foreground">
          {signalCount}
        </p>
      </div>

      <div className={tile}>
        <p className={label}>
          <Clock className="h-3 w-3 text-tone-sky" /> Period
        </p>
        <p className="mt-1 text-xs font-bold text-primary">
          {dataPeriod} {formattedDate ? `(${formattedDate})` : ""}
        </p>
      </div>
    </div>
  );
};
