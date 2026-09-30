import { useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import {
  HabitHealthCategory,
  HealthDashboardSummary,
  HabitHealthDetail,
} from "@/lib/health";
import { HEALTH_TONES, toneStyle } from "@/lib/tones";
import { cn } from "@/lib/utils";

export type HealthFilterType = "all" | HabitHealthCategory;

interface HabitHealthDashboardProps {
  summary: HealthDashboardSummary;
  healthMap: Record<string, HabitHealthDetail>;
  activeFilter: HealthFilterType;
  onFilterChange: (filter: HealthFilterType) => void;
  totalHabitsCount: number;
}

type AttentionItem = HealthDashboardSummary["needsAttentionHabits"][number];

function InsightGroup<T extends { id: string; name: string; emoji: string }>({
  title,
  tone,
  icon,
  items,
  renderMeta,
  renderTag,
}: {
  title: string;
  tone: string;
  icon: ReactNode;
  items: T[];
  renderMeta: (item: T) => ReactNode;
  renderTag?: (item: T) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div style={toneStyle(tone)} className="tone-panel space-y-2.5 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[hsl(var(--tone)/0.18)] text-[hsl(var(--tone))]">
          {icon}
        </span>
        {title}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/70 px-2.5 py-1.5 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="tone-dot h-2 w-2 shrink-0 rounded-full" />
              <span className="truncate font-medium">
                {item.emoji} {item.name}
              </span>
              {renderTag?.(item)}
            </div>
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{renderMeta(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitHealthDashboard({
  summary,
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
    doingWellHabits = [],
    needsAttentionHabits = [],
    decliningHabits = [],
    improvingHabits = [],
    bannerMessage,
  } = summary;

  const categories: { key: HabitHealthCategory; count: number }[] = [
    { key: "strong", count: strongCount },
    { key: "on_track", count: onTrackCount },
    { key: "at_risk", count: atRiskCount },
    { key: "ignored", count: ignoredCount },
    ...(newCount > 0 ? [{ key: "new" as const, count: newCount }] : []),
  ];
  const countedTotal = categories.reduce((sum, c) => sum + c.count, 0);

  const hasAnyInsights =
    doingWellHabits.length > 0 ||
    needsAttentionHabits.length > 0 ||
    decliningHabits.length > 0 ||
    improvingHabits.length > 0;

  const bannerTone =
    bannerMessage.type === "warning"
      ? "--tone-amber"
      : bannerMessage.type === "success"
        ? "--tone-mint"
        : "--tone-slate";
  // The banner already gets an icon here, so drop the emoji the health summary adds.
  const bannerHeadline = bannerMessage.headline.replace(/^[\p{Extended_Pictographic}️\s]+/u, "");
  const BannerIcon =
    bannerMessage.type === "warning"
      ? AlertTriangle
      : bannerMessage.type === "success"
        ? CheckCircle2
        : Sparkles;

  const needsAttentionTone = (item: AttentionItem) =>
    item.health === "ignored"
      ? "--tone-rose"
      : item.trend === "declining"
        ? "--tone-amber"
        : item.trend === "improving"
          ? "--tone-sky"
          : "--tone-slate";

  return (
    <div className="space-y-4">
      {/* Top Health Summary Card */}
      <section className="ambient-panel overflow-hidden rounded-[1.7rem]">
        <div className="p-5 sm:p-6">
          {/* Header Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner-soft">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Habit Health</h2>
                <p className="text-xs text-muted-foreground">Behavior intelligence & consistency tracking</p>
              </div>
            </div>

            {/* Distribution of habits across health states */}
            {countedTotal > 0 && (
              <div className="w-full space-y-2 sm:w-72">
                <div
                  className="flex h-2.5 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={categories.map((c) => `${c.count} ${HEALTH_TONES[c.key].label}`).join(", ")}
                >
                  {categories.map(({ key, count }) =>
                    count > 0 ? (
                      <span
                        key={key}
                        style={{ ...toneStyle(HEALTH_TONES[key].tone), width: `${(count / countedTotal) * 100}%` }}
                        className="tone-dot h-full origin-left animate-in slide-in-from-left-4 fade-in-0 duration-700 [&:not(:first-child)]:border-l-2 [&:not(:first-child)]:border-card"
                      />
                    ) : null,
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                  {categories.map(({ key, count }) => (
                    <span key={key} style={toneStyle(HEALTH_TONES[key].tone)} className="inline-flex items-center gap-1.5">
                      <span className="tone-dot h-2 w-2 rounded-full" />
                      <span className="font-bold text-foreground">{count}</span> {HEALTH_TONES[key].label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Attention Banner */}
          <div
            style={toneStyle(bannerTone)}
            className="tone-panel mt-5 flex flex-col justify-between gap-3 rounded-2xl p-3 text-xs sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-2.5 sm:items-center">
              <BannerIcon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--tone))] sm:mt-0" />
              <p className="font-medium text-foreground">
                <span className="font-bold">{bannerHeadline}</span>
                {bannerMessage.subtext && (
                  <span className="text-muted-foreground"> · {bannerMessage.subtext}</span>
                )}
              </p>
            </div>

            {hasAnyInsights && (
              <button
                type="button"
                onClick={() => setShowInsightsDrawer(!showInsightsDrawer)}
                aria-expanded={showInsightsDrawer}
                className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
              >
                {showInsightsDrawer ? "Hide insights" : "View insights"}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform duration-300", showInsightsDrawer && "rotate-180")}
                />
              </button>
            )}
          </div>

          {/* Contextual Insights Section (only non-empty categories), animated open/close */}
          {hasAnyInsights && (
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showInsightsDrawer ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-5 grid grid-cols-1 items-start gap-4 border-t border-border/40 pt-4 md:grid-cols-2">
                  <InsightGroup
                    title="You're doing well"
                    tone="--tone-mint"
                    icon={<ShieldCheck className="h-3.5 w-3.5" />}
                    items={doingWellHabits}
                    renderMeta={(item) => `${item.completed14Count}/${item.totalDays} days · ${item.consistencyRate14}%`}
                  />
                  <InsightGroup
                    title="Needs attention"
                    tone="--tone-rose"
                    icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    items={needsAttentionHabits}
                    renderMeta={(item) => `${item.completed14Count}/${item.totalDays} days · ${item.lastCompletedText}`}
                    renderTag={(item) =>
                      item.urgencyLabel ? (
                        <span
                          style={toneStyle(needsAttentionTone(item))}
                          className="tone-chip shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        >
                          {item.urgencyLabel}
                        </span>
                      ) : null
                    }
                  />
                  <InsightGroup
                    title="Recent decline"
                    tone="--tone-amber"
                    icon={<TrendingDown className="h-3.5 w-3.5" />}
                    items={decliningHabits}
                    renderMeta={(item) => item.explanation}
                  />
                  <InsightGroup
                    title="Improving"
                    tone="--tone-sky"
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                    items={improvingHabits}
                    renderMeta={(item) => `${item.completed14Count}/${item.totalDays} days · ${item.consistencyRate14}%`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          role="group"
          aria-label="Filter habits by health"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border/50 bg-card/70 p-1 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-pressed={activeFilter === "all"}
            onClick={() => onFilterChange("all")}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            All ({totalHabitsCount})
          </button>

          {categories.map(({ key, count }) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(active ? "all" : key)}
                style={toneStyle(HEALTH_TONES[key].tone)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "tone-chip tone-chip-active font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span className="tone-dot h-2 w-2 rounded-full" />
                {HEALTH_TONES[key].label} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
