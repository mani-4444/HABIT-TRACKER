import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, Link2, RotateCcw } from "lucide-react";
import { EvidenceList } from "./EvidenceList";
import type { Insight } from "@/lib/ai-types";

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getTypeBadge = (type: Insight["type"]) => {
    switch (type) {
      case "STRENGTH":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30">
            <TrendingUp className="mr-1 h-3 w-3" /> Strength
          </Badge>
        );
      case "RISK":
        return (
          <Badge variant="destructive" className="bg-amber-500/15 text-amber-600 border-amber-500/30">
            <AlertTriangle className="mr-1 h-3 w-3" /> Risk Flag
          </Badge>
        );
      case "OPPORTUNITY":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/30">
            <Lightbulb className="mr-1 h-3 w-3" /> Opportunity
          </Badge>
        );
      case "CORRELATION":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-600 hover:bg-indigo-500/25 border-indigo-500/30">
            <Link2 className="mr-1 h-3 w-3" /> Pairing
          </Badge>
        );
      case "RECOVERY":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-purple-500/30">
            <RotateCcw className="mr-1 h-3 w-3" /> Recovery
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Sparkles className="mr-1 h-3 w-3 text-primary" /> Pattern
          </Badge>
        );
    }
  };

  const getConfidenceBadge = (confidence: Insight["confidence"]) => {
    const colorClass =
      confidence === "HIGH"
        ? "text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30"
        : confidence === "MEDIUM"
        ? "text-blue-600 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/30"
        : "text-muted-foreground border-border";

    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
        {confidence} Confidence
      </span>
    );
  };

  return (
    <Card variant="feature" className="rounded-2xl border-border/70 bg-card/80 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getTypeBadge(insight.type)}
            {getConfidenceBadge(insight.confidence)}
          </div>
        </div>
        <CardTitle className="mt-2 text-lg font-bold text-foreground">
          {insight.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <p className="leading-relaxed text-muted-foreground">
          {insight.explanation}
        </p>

        {/* Evidence List */}
        <EvidenceList evidence={insight.evidence} />

        {/* Recommendation / Action Step */}
        {insight.recommendation && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-inner-soft">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Recommended Micro-Action
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90 font-medium">
              {insight.recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
