import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Calendar, Clock, Link2, CheckCircle, type LucideIcon } from "lucide-react";
import { toneStyle } from "@/lib/tones";
import type { Evidence } from "@/lib/ai-types";

interface EvidenceListProps {
  evidence: Evidence[];
}

const EVIDENCE_STYLES: Partial<Record<Evidence["type"], { icon: LucideIcon; tone: string }>> = {
  STREAK_CHANGE: { icon: Award, tone: "--tone-amber" },
  PERIOD_TREND: { icon: TrendingUp, tone: "--tone-mint" },
  COMPLETION_RATE: { icon: TrendingUp, tone: "--tone-mint" },
  WEEKDAY_PARITY: { icon: Calendar, tone: "--tone-sky" },
  LOGGING_TIME_PATTERN: { icon: Clock, tone: "--tone-rose" },
  CROSS_HABIT_CORRELATION: { icon: Link2, tone: "--tone-orange" },
};

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="eyebrow text-[10px]">Supporting Evidence</p>
      <div className="grid grid-cols-1 gap-2">
        {evidence.map((item, idx) => {
          const style = EVIDENCE_STYLES[item.type] ?? { icon: CheckCircle, tone: "--tone-orange" };
          const Icon = style.icon;
          return (
            <div
              key={idx}
              style={toneStyle(style.tone)}
              className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/60 p-2.5 text-xs"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--tone)/0.15)]">
                <Icon className="h-3.5 w-3.5 text-[hsl(var(--tone))]" />
              </span>
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
          );
        })}
      </div>
    </div>
  );
};
