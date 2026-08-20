import React from "react";
import { Brain, Activity, Clock } from "lucide-react";

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

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-xs">
        <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Brain className="h-3 w-3 text-primary" /> Status
        </p>
        <p className="mt-1 text-xs font-bold text-foreground truncate">
          {getStatusLabel()}
        </p>
      </div>

      <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-xs">
        <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Activity className="h-3 w-3 text-emerald-500" /> Evidence Signals
        </p>
        <p className="mt-1 text-xs font-bold text-foreground">
          {signalCount}
        </p>
      </div>

      <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-xs">
        <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3 w-3 text-blue-500" /> Period
        </p>
        <p className="mt-1 text-xs font-bold text-primary">
          {dataPeriod} {formattedDate ? `(${formattedDate})` : ""}
        </p>
      </div>
    </div>
  );
};
