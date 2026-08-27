import * as React from "react";
import { Check, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitHealthDetail } from "@/lib/health";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HabitCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  emoji?: string;
  disabled?: boolean;
  streak?: number;
  isAtRisk?: boolean;
  healthDetail?: HabitHealthDetail;
}

export function HabitCheckbox({
  checked,
  onCheckedChange,
  label,
  emoji,
  disabled = false,
  streak,
  isAtRisk = false,
  healthDetail,
}: HabitCheckboxProps) {
  // If healthDetail is provided, use its metrics, otherwise defaults
  const completedCount = healthDetail?.completed14Count ?? (checked ? 1 : 0);
  const totalDays = healthDetail?.totalDays ?? 14;
  const consistencyRate = healthDetail?.consistencyRate14 ?? 0;
  const history14 = healthDetail?.history14Days || [];
  const health = healthDetail?.health || "on_track";
  const trendLabel = healthDetail?.trendLabel || "→ Stable";

  const healthBadgeConfig = {
    strong: {
      label: "Strong",
      dotColor: "bg-emerald-500",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:border-emerald-500/40",
    },
    on_track: {
      label: "On Track",
      dotColor: "bg-blue-500",
      badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/25 hover:border-blue-500/40",
    },
    at_risk: {
      label: "At Risk",
      dotColor: "bg-orange-500",
      badgeStyle: "bg-orange-500/10 text-orange-400 border-orange-500/25 hover:border-orange-500/40",
    },
    ignored: {
      label: "Ignored",
      dotColor: "bg-rose-500",
      badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/25 hover:border-rose-500/40",
    },
  };

  const badgeInfo = healthBadgeConfig[health];

  return (
    <div
      className={cn(
        "group flex w-full items-start sm:items-center gap-3.5 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 transition-all duration-150 text-left select-none",
        "hover:border-primary/40 hover:bg-accent/30",
        checked
          ? "border-success/35 bg-success-muted/80 shadow-sm"
          : "border-border/50 bg-card shadow-sm",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {/* Checkbox button */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Mark ${label} as ${checked ? "incomplete" : "complete"}`}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onCheckedChange(!checked);
        }}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 mt-0.5 sm:mt-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked
            ? "border-success bg-success shadow-inner"
            : "border-border bg-background shadow-inner group-hover:border-primary/50 group-hover:bg-primary/5",
        )}
      >
        {checked && <Check className="h-4 w-4 text-success-foreground stroke-[2.5]" />}
      </button>

      {/* Main content: Emoji, Title, Health Badge & History */}
      <div
        className="flex flex-1 flex-col min-w-0 gap-1.5 cursor-pointer"
        onClick={() => onCheckedChange(!checked)}
      >
        {/* Top row: Emoji, Name, and Health Badge with Popover */}
        <div className="flex flex-wrap items-center gap-2">
          {emoji && <span className="text-xl leading-none shrink-0">{emoji}</span>}
          <span
            className={cn(
              "text-sm font-medium transition-colors truncate max-w-[200px] sm:max-w-md",
              checked ? "text-muted-foreground line-through" : "text-foreground font-semibold",
            )}
          >
            {label}
          </span>

          {/* Health status badge with explainability Popover */}
          {healthDetail && (
            <div onClick={(e) => e.stopPropagation()}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Health status: ${badgeInfo.label}, Trend: ${trendLabel}. Click for details.`}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all cursor-pointer",
                      badgeInfo.badgeStyle,
                    )}
                    title="Click to view health status breakdown"
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", badgeInfo.dotColor)} />
                    <span className="truncate">
                      {badgeInfo.label} · {trendLabel}
                    </span>
                    <Info className="h-2.5 w-2.5 opacity-60 ml-0.5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  sideOffset={6}
                  className="w-80 rounded-2xl border border-border/80 bg-neutral-900/95 dark:bg-neutral-950/95 backdrop-blur-md p-4 text-xs shadow-2xl z-50 text-neutral-100"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", badgeInfo.dotColor)} />
                        <span className="font-bold text-sm text-neutral-100">
                          {badgeInfo.label} · {trendLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>History & Consistency:</span>
                      <span className="font-semibold text-neutral-200">
                        {completedCount}/{totalDays} days · {consistencyRate}% consistency
                      </span>
                    </div>

                    {totalDays >= 7 && (
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Recent behavior:</span>
                        <span className="font-medium text-neutral-200">
                          {healthDetail.recent7Count} {healthDetail.recent7Count === 1 ? "completion" : "completions"} in last 7 days
                        </span>
                      </div>
                    )}

                    {totalDays >= 14 && (
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Previous period:</span>
                        <span className="font-medium text-neutral-200">
                          {healthDetail.earlier7Count} {healthDetail.earlier7Count === 1 ? "completion" : "completions"} in previous 7 days
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Last completed:</span>
                      <span className="font-medium text-neutral-200">
                        {healthDetail.lastCompletedText}
                      </span>
                    </div>

                    <div className="rounded-xl bg-neutral-800/60 p-2.5 border border-neutral-700/50 text-neutral-300 text-[11px] leading-relaxed">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                        Why this status?
                      </p>
                      <p>{healthDetail.explanation}</p>
                    </div>

                    {healthDetail.comparisonText && (
                      <p className="text-[10px] text-neutral-400 italic">
                        {healthDetail.comparisonText}
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* History row: Mini history dots & consistency score */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {/* Circular indicators for available history */}
          {history14.length > 0 && (
            <div
              className="flex items-center gap-1 shrink-0"
              title={`Last ${totalDays} days history`}
            >
              {history14.map((day, idx) => (
                <div
                  key={day.dateStr || idx}
                  className={cn(
                    "rounded-full transition-all",
                    day.isToday ? "h-2.5 w-2.5" : "h-2 w-2",
                    day.completed
                      ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                      : "bg-neutral-800/80 border border-neutral-700/50 dark:bg-neutral-800",
                    day.isToday && "ring-1 ring-white/60 ring-offset-1 ring-offset-background",
                  )}
                  title={`${day.dateStr}${day.isToday ? " (Today)" : ""}: ${
                    day.completed ? "Completed" : "Not completed"
                  }`}
                />
              ))}
            </div>
          )}

          {/* e.g. 7/14 days · 50% consistency (or 2/2 days for new habit) */}
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            {completedCount}/{totalDays} days · {consistencyRate}% consistency
          </span>
        </div>

        {/* Mobile-only streak row (Reflows vertically on < sm viewports) */}
        {streak !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-semibold sm:hidden pt-0.5">
            <div
              className={cn(
                "flex items-center gap-1",
                streak === 0
                  ? "text-muted-foreground/60"
                  : isAtRisk
                    ? "text-amber-500"
                    : "text-orange-500",
              )}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>
                {streak} {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              · Current streak
            </span>
          </div>
        )}
      </div>

      {/* Desktop-only right side: Streak only */}
      {streak !== undefined && (
        <div
          className="hidden sm:flex flex-col items-end shrink-0 text-right pl-2 cursor-pointer"
          onClick={() => onCheckedChange(!checked)}
          title={
            isAtRisk && streak > 0
              ? `${streak} day streak (needs check-in today)`
              : `${streak} day streak`
          }
        >
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              streak === 0
                ? "text-muted-foreground/50"
                : isAtRisk
                  ? "text-amber-500"
                  : "text-orange-500",
            )}
          >
            <Flame className="h-4 w-4" />
            <span>
              {streak} {streak === 1 ? "day" : "days"}
            </span>
          </div>

          <span className="text-[10px] text-muted-foreground font-medium">
            Current streak
          </span>
        </div>
      )}
    </div>
  );
}
