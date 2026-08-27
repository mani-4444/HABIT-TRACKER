import { useState, useMemo, useEffect } from "react";
import { format, parseISO, differenceInCalendarDays, subMonths, startOfMonth } from "date-fns";
import { Flame, TrendingUp, Target, CalendarDays, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { useHabitHistory, Habit } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

interface HabitActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHabitId: string | null;
  habits: { id: string; name: string; emoji: string; created_at?: string }[];
}

export function HabitActivityModal({
  isOpen,
  onClose,
  initialHabitId,
  habits,
}: HabitActivityModalProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(initialHabitId);
  const [timeRangeMonths, setTimeRangeMonths] = useState<number>(12);

  // Sync selected habit when initialHabitId changes or dialog opens
  useEffect(() => {
    if (initialHabitId) {
      setSelectedHabitId(initialHabitId);
    } else if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [initialHabitId, habits]);

  const currentHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || habits[0];
  }, [habits, selectedHabitId]);

  const { data: history, isLoading } = useHabitHistory(
    currentHabit?.id,
    timeRangeMonths,
  );

  const completionDates = useMemo(() => {
    return history?.completionDates || new Set<string>();
  }, [history]);

  const completionsByDate = useMemo(() => {
    return history?.completionsByDate || {};
  }, [history]);

  // Calculate consistency rate for selected time window
  const stats = useMemo(() => {
    const today = new Date();
    const startDate = subMonths(startOfMonth(today), timeRangeMonths - 1);
    const daysInWindow = Math.max(1, differenceInCalendarDays(today, startDate) + 1);

    const completedInWindow = history?.totalCompletions || 0;
    const rate = Math.min(100, Math.round((completedInWindow / daysInWindow) * 100));

    // Find strongest day of week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dowCounts = history?.dayOfWeekCounts || [0, 0, 0, 0, 0, 0, 0];
    let maxIdx = 0;
    let maxVal = 0;
    dowCounts.forEach((count, idx) => {
      if (count > maxVal) {
        maxVal = count;
        maxIdx = idx;
      }
    });

    const strongestDay = maxVal > 0 ? daysOfWeek[maxIdx] : "N/A";

    return {
      rate,
      daysInWindow,
      completedInWindow,
      strongestDay,
      dowCounts,
    };
  }, [history, timeRangeMonths]);

  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxDowCount = Math.max(...(history?.dayOfWeekCounts || [1]), 1);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 rounded-3xl border-border/60 bg-card/95 backdrop-blur-md">
        {/* Header with Habit Selector */}
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl border border-primary/20 shadow-inner">
                {currentHabit?.emoji || "⭐"}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {currentHabit?.name || "Habit Activity"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  LeetCode-style daily consistency tracker & historical streak analysis
                </DialogDescription>
              </div>
            </div>

            {/* Habit Quick Switcher */}
            {habits.length > 1 && (
              <div className="w-full sm:w-56">
                <Select
                  value={currentHabit?.id}
                  onValueChange={(val) => setSelectedHabitId(val)}
                >
                  <SelectTrigger className="rounded-xl h-9 text-xs bg-muted/40 border-border/50">
                    <SelectValue placeholder="Switch habit..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {habits.map((h) => (
                      <SelectItem key={h.id} value={h.id} className="text-xs">
                        <span className="mr-2">{h.emoji}</span>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading activity history...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border/50 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span>Current Streak</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    {history?.currentStreak || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                {history?.isAtRisk && (
                  <span className="text-[10px] text-amber-500 font-medium block">
                    ⚠️ Needs check-in today
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                  <span>Best Streak</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    {history?.bestStreak || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  All-time record
                </span>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Completions</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    {history?.totalCompletions || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  In selected period
                </span>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Period Rate</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    {stats.rate}%
                  </span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.rate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Time Range Filter Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>Daily Contribution Heatmap</span>
              </div>
              <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRangeMonths(12)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] rounded-lg font-medium",
                    timeRangeMonths === 12
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  12 Months
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRangeMonths(6)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] rounded-lg font-medium",
                    timeRangeMonths === 6
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  6 Months
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRangeMonths(3)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] rounded-lg font-medium",
                    timeRangeMonths === 3
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  3 Months
                </Button>
              </div>
            </div>

            {/* LeetCode Activity Heatmap */}
            <HabitHeatmap
              completionDates={completionDates}
              completionsByDate={completionsByDate}
              habitName={currentHabit?.name}
              habitEmoji={currentHabit?.emoji}
              monthsBack={timeRangeMonths}
            />

            {/* Day of Week & Monthly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day of Week Breakdown */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Day of Week Activity
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Best: <strong className="text-emerald-500">{stats.strongestDay}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-2">
                  {daysShort.map((dayName, idx) => {
                    const count = stats.dowCounts[idx] || 0;
                    const heightPercent = maxDowCount > 0 ? Math.round((count / maxDowCount) * 100) : 0;
                    return (
                      <div key={dayName} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {count}
                        </div>
                        <div className="w-full bg-muted/60 rounded-t-md h-12 flex items-end overflow-hidden">
                          <div
                            className={cn(
                              "w-full rounded-t-md transition-all duration-300",
                              count > 0 ? "bg-emerald-500" : "bg-transparent",
                            )}
                            style={{ height: `${Math.max(heightPercent, count > 0 ? 15 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Breakdown List */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Monthly Completions Summary
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {timeRangeMonths} Months Trailing
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-24 overflow-y-auto pr-1">
                  {(history?.monthlyCounts || []).map((m) => (
                    <div
                      key={m.monthKey}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs border border-border/40",
                        m.count > 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30",
                      )}
                    >
                      <span className="font-medium text-foreground">{m.monthLabel}</span>
                      <span
                        className={cn(
                          "font-bold",
                          m.count > 0 ? "text-emerald-500" : "text-muted-foreground",
                        )}
                      >
                        {m.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
