import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Calendar, Clock, Link2, CheckCircle } from "lucide-react";
import type { Evidence } from "@/lib/ai-types";

interface EvidenceListProps {
  evidence: Evidence[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) return null;

  const getEvidenceIcon = (type: Evidence["type"]) => {
    switch (type) {
      case "STREAK_CHANGE":
        return <Award className="h-3.5 w-3.5 text-amber-500" />;
      case "PERIOD_TREND":
      case "COMPLETION_RATE":
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case "WEEKDAY_PARITY":
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
      case "LOGGING_TIME_PATTERN":
        return <Clock className="h-3.5 w-3.5 text-purple-500" />;
      case "CROSS_HABIT_CORRELATION":
        return <Link2 className="h-3.5 w-3.5 text-indigo-500" />;
      default:
        return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Supporting Evidence
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {evidence.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs shadow-xs"
          >
            <div className="mt-0.5 shrink-0">{getEvidenceIcon(item.type)}</div>
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="truncate">{item.metric}</span>
                {item.habitName && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {item.habitName}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{item.value}</span>
                {item.comparisonValue !== undefined && (
                  <span> (vs {item.comparisonValue})</span>
                )}
              </p>
              {item.details && (
                <p className="text-[11px] text-muted-foreground/80">{item.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
