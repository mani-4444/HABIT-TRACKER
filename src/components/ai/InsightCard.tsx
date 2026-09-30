import React from "react";
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, Link2, RotateCcw, type LucideIcon } from "lucide-react";
import { EvidenceList } from "./EvidenceList";
import { toneStyle } from "@/lib/tones";
import type { Insight } from "@/lib/ai-types";

interface InsightCardProps {
  insight: Insight;
}

const TYPE_STYLES: Record<Insight["type"], { label: string; tone: string; icon: LucideIcon }> = {
  STRENGTH: { label: "Strength", tone: "--tone-mint", icon: TrendingUp },
  RISK: { label: "Risk Flag", tone: "--tone-rose", icon: AlertTriangle },
  OPPORTUNITY: { label: "Opportunity", tone: "--tone-sky", icon: Lightbulb },
  CORRELATION: { label: "Pairing", tone: "--tone-orange", icon: Link2 },
  RECOVERY: { label: "Recovery", tone: "--tone-amber", icon: RotateCcw },
  PATTERN: { label: "Pattern", tone: "--tone-orange", icon: Sparkles },
};

const CONFIDENCE_TONES: Record<Insight["confidence"], string> = {
  HIGH: "--tone-mint",
  MEDIUM: "--tone-sky",
  LOW: "--tone-slate",
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const type = TYPE_STYLES[insight.type] ?? TYPE_STYLES.PATTERN;
  const TypeIcon = type.icon;

  return (
    <article
      style={toneStyle(type.tone)}
      className="ambient-panel group relative flex flex-col overflow-hidden rounded-3xl p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <span aria-hidden className="tone-dot absolute inset-x-0 top-0 h-1" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="tone-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
          <TypeIcon className="h-3.5 w-3.5 text-[hsl(var(--tone))]" />
          {type.label}
        </span>
        <span
          style={toneStyle(CONFIDENCE_TONES[insight.confidence] ?? "--tone-slate")}
          className="tone-chip inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
        >
          {insight.confidence} Confidence
        </span>
      </div>

      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-foreground">
        {insight.title}
      </h3>

      <div className="mt-2 flex flex-1 flex-col space-y-4 text-sm">
        <p className="leading-relaxed text-muted-foreground">
          {insight.explanation}
        </p>

        {/* Evidence List */}
        <EvidenceList evidence={insight.evidence} />

        {/* Recommendation / Action Step */}
        {insight.recommendation && (
          <div className="mt-auto rounded-2xl border border-primary/20 bg-primary/5 p-3.5 shadow-inner-soft">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Recommended Micro-Action
            </div>
            <p className="mt-1 text-xs font-medium leading-relaxed text-foreground/90">
              {insight.recommendation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};
