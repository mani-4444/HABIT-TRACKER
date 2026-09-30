import React, { useMemo } from "react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  isAfter,
  isSameDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HabitHeatmapProps {
  completionDates: Set<string>;
  completionsByDate?: Record<string, number>;
  habitName?: string;
  habitEmoji?: string;
  monthsBack?: number;
  className?: string;
}

interface DayCell {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isFuture: boolean;
  isToday: boolean;
  completed: boolean;
  count: number;
}

interface MonthData {
  monthKey: string;
  monthLabel: string;
  year: number;
  weeks: (DayCell | null)[][]; // 7 rows per week column
}

export function HabitHeatmap({
  completionDates,
  completionsByDate = {},
  habitName = "Habit",
  habitEmoji = "⭐",
  monthsBack = 12,
  className,
}: HabitHeatmapProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const monthBlocks = useMemo<MonthData[]>(() => {
    const blocks: MonthData[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      const daysCount = getDaysInMonth(monthDate);
      const startDayOfWeek = mStart.getDay(); // 0 = Sun, 6 = Sat
      const monthLabel = format(monthDate, "MMM");
      const monthKey = format(monthDate, "yyyy-MM");
      const year = monthDate.getFullYear();

      const weeks: (DayCell | null)[][] = [];
      let currentWeek: (DayCell | null)[] = [];

      // Fill leading placeholders before the 1st day of month
      for (let d = 0; d < startDayOfWeek; d++) {
        currentWeek.push(null);
      }

      // Fill the days of the month
      for (let day = 1; day <= daysCount; day++) {
        const d = new Date(year, monthDate.getMonth(), day);
        const dateStr = format(d, "yyyy-MM-dd");
        const isFuture = isAfter(d, today) && !isSameDay(d, today);
        const isToday = dateStr === todayStr;
        const count = completionsByDate[dateStr] || (completionDates.has(dateStr) ? 1 : 0);
        const completed = count > 0;

        currentWeek.push({
          date: d,
          dateStr,
          dayOfMonth: day,
          isCurrentMonth: true,
          isFuture,
          isToday,
          completed,
          count,
        });

        // When week reaches 7 days (Saturday), push and start new week
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Fill trailing placeholders to complete the last week column
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      blocks.push({
        monthKey,
        monthLabel,
        year,
        weeks,
      });
    }

    return blocks;
  }, [monthsBack, today, todayStr, completionDates, completionsByDate]);

  // Compute total active days in this view
  const totalActiveInView = useMemo(() => {
    let count = 0;
    for (const block of monthBlocks) {
      for (const week of block.weeks) {
        for (const day of week) {
          if (day && day.completed && !day.isFuture) {
            count++;
          }
        }
      }
    }
    return count;
  }, [monthBlocks]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "page-enter w-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 text-foreground shadow-soft md:p-6",
          className,
        )}
      >
        {/* Top Info Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{habitEmoji}</span>
            <span className="font-semibold text-foreground">{habitName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              <strong className="font-semibold text-success">{totalActiveInView}</strong> days active in this period
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Inactive</span>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-success/45" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-success/75" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-success" />
            </div>
            <span>Completed</span>
          </div>
        </div>

        {/* Scrollable Heatmap Container */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex items-start gap-4 min-w-max pr-4">
            {/* Weekday indicators (Mon, Wed, Fri) */}
            <div className="flex h-[108px] select-none flex-col justify-between pt-[2px] text-[10px] font-medium text-muted-foreground">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Month blocks */}
            <div className="flex items-start gap-3 md:gap-4">
              {monthBlocks.map((block) => (
                <div key={block.monthKey} className="flex flex-col items-center gap-2">
                  {/* Grid for this month (columns of 7 rows) */}
                  <div className="flex items-center gap-[3px] md:gap-1">
                    {block.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px] md:gap-1">
                        {week.map((day, dIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${dIdx}`}
                                className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-0 pointer-events-none"
                              />
                            );
                          }

                          const formattedDate = format(day.date, "EEEE, MMMM d, yyyy");

                          // Color classes
                          let cellBg = "bg-muted hover:bg-muted-foreground/25";
                          if (day.isFuture) {
                            cellBg = "bg-muted/50 opacity-50 cursor-default";
                          } else if (day.completed) {
                            cellBg =
                              day.count > 1
                                ? "bg-success shadow-[0_0_6px_hsl(var(--success)/0.5)] hover:brightness-110"
                                : "bg-success/75 hover:bg-success";
                          }

                          return (
                            <Tooltip key={day.dateStr}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-3 h-3 md:w-3.5 md:h-3.5 rounded-[3px] transition-all duration-150 cursor-pointer select-none",
                                    cellBg,
                                    day.isToday &&
                                      "ring-2 ring-primary ring-offset-1 ring-offset-card",
                                    !day.isFuture && "hover:scale-125 hover:z-20",
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="z-50 rounded-xl px-3 py-2 text-xs shadow-soft-lg"
                              >
                                <p className="font-semibold text-foreground">
                                  {formattedDate} {day.isToday && "(Today)"}
                                </p>
                                <p className="text-[11px] mt-0.5 flex items-center gap-1.5">
                                  {day.isFuture ? (
                                    <span className="text-muted-foreground">Future date</span>
                                  ) : day.completed ? (
                                    <>
                                      <span className="inline-block h-2 w-2 rounded-full bg-success" />
                                      <span className="font-medium text-success">
                                        Completed ({day.count} {day.count === 1 ? "time" : "times"})
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
                                      <span className="text-muted-foreground">No activity recorded</span>
                                    </>
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Month Label Centered Under Month Columns */}
                  <span className="mt-1 select-none text-[11px] font-medium text-muted-foreground">
                    {block.monthLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
