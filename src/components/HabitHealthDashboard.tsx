import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HabitHealthCategory,
  HealthDashboardSummary,
  HabitHealthDetail,
} from "@/lib/health";
import { cn } from "@/lib/utils";

export type HealthFilterType = "all" | HabitHealthCategory;

interface HabitHealthDashboardProps {
  summary: HealthDashboardSummary;
  healthMap: Record<string, HabitHealthDetail>;
  activeFilter: HealthFilterType;
  onFilterChange: (filter: HealthFilterType) => void;
  totalHabitsCount: number;
}

export function HabitHealthDashboard({
  summary,
  healthMap,
  activeFilter,
  onFilterChange,
  totalHabitsCount,
}: HabitHealthDashboardProps) {
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);

  const {
    strongCount,
    onTrackCount,
    atRiskCount,
    ignoredCount,
    newCount = 0,
    attentionCount,
    doingWellHabits = [],
    needsAttentionHabits = [],
    decliningHabits = [],
    improvingHabits = [],
    bannerMessage,
  } = summary;

  const hasAnyInsights =
    doingWellHabits.length > 0 ||
    needsAttentionHabits.length > 0 ||
    decliningHabits.length > 0 ||
    improvingHabits.length > 0;

  return (
    <div className="space-y-4">
      {/* Top Health Summary Card */}
      <Card className="rounded-[1.7rem] border-border/55 bg-card/85 shadow-soft overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Habit Health
                </h2>
                <p className="text-xs text-muted-foreground">
                  Behavior intelligence & consistency tracking
                </p>
              </div>
            </div>

            {/* Quick Status Pills / Counts - strictly computed */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => onFilterChange(activeFilter === "strong" ? "all" : "strong")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-150 text-xs font-semibold select-none cursor-pointer",
                  activeFilter === "strong"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/40"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
                )}
                title="Filter by Strong habits"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{strongCount} Strong</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterChange(activeFilter === "on_track" ? "all" : "on_track")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-150 text-xs font-semibold select-none cursor-pointer",
                  activeFilter === "on_track"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/40"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
                )}
                title="Filter by On Track habits"
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{onTrackCount} On Track</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterChange(activeFilter === "at_risk" ? "all" : "at_risk")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-150 text-xs font-semibold select-none cursor-pointer",
                  activeFilter === "at_risk"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/40 ring-1 ring-orange-500/40"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/15",
                )}
                title="Filter by At Risk habits"
              >
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>{atRiskCount} At Risk</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterChange(activeFilter === "ignored" ? "all" : "ignored")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-150 text-xs font-semibold select-none cursor-pointer",
                  activeFilter === "ignored"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/40"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/15",
                )}
                title="Filter by Ignored habits"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>{ignoredCount} Ignored</span>
              </button>

              {newCount > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange(activeFilter === "new" ? "all" : "new")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-150 text-xs font-semibold select-none cursor-pointer",
                    activeFilter === "new"
                      ? "bg-zinc-500/20 text-zinc-300 border-zinc-500/40 ring-1 ring-zinc-500/40"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/15",
                  )}
                  title="Filter by New habits"
                >
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  <span>{newCount} New</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Attention Banner */}
          <div
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3 text-xs border transition-all",
              bannerMessage.type === "warning"
                ? "bg-orange-500/10 border-orange-500/30 text-orange-300 dark:text-orange-200"
                : bannerMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 dark:text-emerald-200"
                : "bg-muted/40 border-border/40 text-muted-foreground",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5 font-medium">
              <span className="font-semibold">{bannerMessage.headline}</span>
              {bannerMessage.subtext && (
                <span className="text-muted-foreground">
                  · {bannerMessage.subtext}
                </span>
              )}
            </div>

            {hasAnyInsights && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInsightsDrawer(!showInsightsDrawer)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground shrink-0 rounded-lg self-start sm:self-auto"
              >
                <span>{showInsightsDrawer ? "Hide insights" : "View insights"}</span>
                {showInsightsDrawer ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            )}
          </div>

          {/* Contextual Insights Section (Showing only non-empty categories) */}
          {showInsightsDrawer && hasAnyInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/40 animate-in fade-in-50 duration-200">
              {/* Category 1: You're doing well */}
              {doingWellHabits.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>You&apos;re doing well</span>
                  </div>
                  <div className="space-y-1.5">
                    {doingWellHabits.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-card/60 border border-border/30"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate font-medium">
                            {item.emoji} {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold shrink-0 ml-2">
                          {item.completed14Count}/{item.totalDays} days · {item.consistencyRate14}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Needs attention (Prioritized by urgency) */}
              {needsAttentionHabits.length > 0 && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Needs attention</span>
                  </div>
                  <div className="space-y-1.5">
                    {needsAttentionHabits.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border transition-colors",
                          item.health === "ignored"
                            ? "bg-rose-500/10 border-rose-500/25"
                            : item.trend === "declining"
                            ? "bg-orange-500/10 border-orange-500/25"
                            : item.trend === "improving"
                            ? "bg-card/60 border-border/30 opacity-85"
                            : "bg-card/60 border-border/30",
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              item.health === "ignored"
                                ? "bg-rose-500"
                                : item.trend === "improving"
                                ? "bg-blue-400"
                                : "bg-orange-500",
                            )}
                          />
                          <span className="truncate font-medium">
                            {item.emoji} {item.name}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 font-medium",
                              item.health === "ignored"
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                : item.trend === "declining"
                                ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                                : item.trend === "improving"
                                ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                : "bg-muted/40 text-muted-foreground border-border/40",
                            )}
                          >
                            {item.urgencyLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                          {item.completed14Count}/{item.totalDays} days · {item.lastCompletedText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Recent decline */}
              {decliningHabits.length > 0 && (
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Recent decline</span>
                  </div>
                  <div className="space-y-1.5">
                    {decliningHabits.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-card/60 border border-border/30"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                          <span className="truncate font-medium">
                            {item.emoji} {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-orange-300/90 shrink-0 ml-2">
                          {item.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Improving */}
              {improvingHabits.length > 0 && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Improving</span>
                  </div>
                  <div className="space-y-1.5">
                    {improvingHabits.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-card/60 border border-border/30"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate font-medium">
                            {item.emoji} {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-300 font-medium shrink-0 ml-2">
                          {item.completed14Count}/{item.totalDays} days · {item.consistencyRate14}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter / Navigation Tab Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card/70 border border-border/50">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 select-none cursor-pointer",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            All ({totalHabitsCount})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("strong")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 inline-flex items-center gap-1.5 select-none cursor-pointer",
              activeFilter === "strong"
                ? "bg-emerald-500 text-white font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Strong ({strongCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("on_track")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 inline-flex items-center gap-1.5 select-none cursor-pointer",
              activeFilter === "on_track"
                ? "bg-blue-500 text-white font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>On Track ({onTrackCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("at_risk")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 inline-flex items-center gap-1.5 select-none cursor-pointer",
              activeFilter === "at_risk"
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            <span>At Risk ({atRiskCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("ignored")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 inline-flex items-center gap-1.5 select-none cursor-pointer",
              activeFilter === "ignored"
                ? "bg-rose-500 text-white font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Ignored ({ignoredCount})</span>
          </button>

          {newCount > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange("new")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 inline-flex items-center gap-1.5 select-none cursor-pointer",
                activeFilter === "new"
                  ? "bg-zinc-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <span>New ({newCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
