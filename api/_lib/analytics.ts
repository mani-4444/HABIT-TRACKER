/**
 * api/_lib/analytics.ts
 *
 * Server-side deterministic analytics module for the Habit Coaching Platform.
 * Imports pure calculation logic directly from src/lib/streaks.ts.
 *
 * Principles:
 *  - Factual computation only. Zero LLM calls.
 *  - Includes pure calculation helpers (`compute*FromData`) for easy unit testing.
 *  - Includes Supabase queries (`get*`) scoped to the user's RLS-backed client.
 *  - Enforces strict minimum-data thresholds (e.g. insufficientData flags).
 */

import { format, subDays, parseISO, differenceInDays, getHours } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeDateString,
  calculatePerHabitStreak,
  calculatePerfectDayStreak,
  calculateHabitConsistency,
  calculateHabitCorrelations,
  type PerHabitStreakResult,
  type HabitConsistencyResult,
  type HabitCorrelation,
} from "../../src/lib/streaks";

// ── Shared Types ─────────────────────────────────────────────────────────────

export interface HabitData {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
  is_archived?: boolean;
}

export interface CompletionData {
  id?: string;
  habit_id: string;
  completed_at: string; // ISO string
}

export interface TodoData {
  id?: string;
  title?: string;
  completed: boolean;
  task_date?: string;
}

export interface HabitStreakInfo extends PerHabitStreakResult {
  habitId: string;
  habitName: string;
  emoji: string;
}

export interface HabitConsistencyInfo extends HabitConsistencyResult {
  habitId: string;
  habitName: string;
  emoji: string;
}

export interface PeriodTrend {
  habitId: string;
  habitName: string;
  emoji: string;
  currentRate: number; // 0 - 100 percentage
  priorRate: number;   // 0 - 100 percentage
  changePct: number;   // difference in percentage points (currentRate - priorRate)
  currentCount: number;
  priorCount: number;
}

export interface OverallTrend {
  periodDays: number;
  currentRate: number;
  priorRate: number;
  changePct: number;
  insufficientData: boolean;
}

export interface WeekdayPattern {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;  // "Sun", "Mon", etc.
  completedCount: number;
  totalDays: number;
  rate: number;     // 0 - 100
}

export interface WeekdayVsWeekend {
  weekdayRate: number;
  weekendRate: number;
  difference: number; // weekdayRate - weekendRate
}

export type TimeBucketKey = "before_9am" | "9am_to_5pm" | "5pm_to_9pm" | "after_9pm";

export interface TimeBucketStats {
  bucket: TimeBucketKey;
  label: string;
  count: number;
  percentage: number; // percentage of habit's total completions
}

export interface HabitTimeDistribution {
  habitId: string;
  habitName: string;
  emoji: string;
  totalCompletions: number;
  buckets: TimeBucketStats[];
  dominantBucket?: TimeBucketKey;
  insufficientData: boolean; // true if totalCompletions < 5
}

export interface BehavioralSummary {
  periodDays: number;
  referenceDate: string;
  totalActiveHabits: number;
  streaks: HabitStreakInfo[];
  overallBestStreak: number;
  overallCurrentStreak: number;
  perfectDayStreak: { current: number; best: number };
  consistencies: HabitConsistencyInfo[];
  correlations: HabitCorrelation[];
  trends: {
    overall: OverallTrend;
    perHabit: PeriodTrend[];
  };
  weekdayPatterns: {
    byDay: WeekdayPattern[];
    weekdayVsWeekend: WeekdayVsWeekend;
    insufficientData: boolean;
  };
  timeDistributions: HabitTimeDistribution[];
  todos: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

// ── Pure Calculation Functions (Testable without DB) ─────────────────────────

/**
 * Compute per-habit streak info for all active habits.
 */
export function computeHabitStreaksFromData(
  habits: HabitData[],
  completions: CompletionData[],
  referenceDate: Date = new Date()
): HabitStreakInfo[] {
  const completionsByHabit = new Map<string, string[]>();
  for (const c of completions) {
    if (!completionsByHabit.has(c.habit_id)) {
      completionsByHabit.set(c.habit_id, []);
    }
    completionsByHabit.get(c.habit_id)!.push(c.completed_at);
  }

  return habits.map((h) => {
    const dates = completionsByHabit.get(h.id) || [];
    const stats = calculatePerHabitStreak(dates, referenceDate);
    return {
      habitId: h.id,
      habitName: h.name,
      emoji: h.emoji,
      ...stats,
    };
  });
}

/**
 * Compute consistency scores for all active habits over a trailing period.
 */
export function computeHabitConsistencyFromData(
  habits: HabitData[],
  completions: CompletionData[],
  trailingDays: number = 30,
  referenceDate: Date = new Date()
): HabitConsistencyInfo[] {
  const completionsByHabit = new Map<string, string[]>();
  for (const c of completions) {
    if (!completionsByHabit.has(c.habit_id)) {
      completionsByHabit.set(c.habit_id, []);
    }
    completionsByHabit.get(c.habit_id)!.push(c.completed_at);
  }

  return habits.map((h) => {
    const dates = completionsByHabit.get(h.id) || [];
    const stats = calculateHabitConsistency(dates, trailingDays, referenceDate);
    return {
      habitId: h.id,
      habitName: h.name,
      emoji: h.emoji,
      ...stats,
    };
  });
}

/**
 * Compute period trends (current N days vs prior N days).
 */
export function computeHabitTrendsFromData(
  habits: HabitData[],
  completions: CompletionData[],
  periodDays: number = 30,
  referenceDate: Date = new Date()
): { overall: OverallTrend; perHabit: PeriodTrend[] } {
  const currentCutoff = subDays(referenceDate, periodDays);
  const priorCutoff = subDays(referenceDate, periodDays * 2);

  const currentDateStr = format(currentCutoff, "yyyy-MM-dd");
  const priorDateStr = format(priorCutoff, "yyyy-MM-dd");
  const refDateStr = format(referenceDate, "yyyy-MM-dd");

  const currentDaysCompletions = new Map<string, Set<string>>();
  const priorDaysCompletions = new Map<string, Set<string>>();

  for (const c of completions) {
    const dStr = normalizeDateString(c.completed_at);
    if (dStr > currentDateStr && dStr <= refDateStr) {
      if (!currentDaysCompletions.has(c.habit_id)) {
        currentDaysCompletions.set(c.habit_id, new Set());
      }
      currentDaysCompletions.get(c.habit_id)!.add(dStr);
    } else if (dStr > priorDateStr && dStr <= currentDateStr) {
      if (!priorDaysCompletions.has(c.habit_id)) {
        priorDaysCompletions.set(c.habit_id, new Set());
      }
      priorDaysCompletions.get(c.habit_id)!.add(dStr);
    }
  }

  // Check if oldest habit created date or earliest completion is at least periodDays * 2 old
  let oldestDate = refDateStr;
  for (const h of habits) {
    const dStr = normalizeDateString(h.created_at);
    if (dStr < oldestDate) oldestDate = dStr;
  }
  for (const c of completions) {
    const dStr = normalizeDateString(c.completed_at);
    if (dStr < oldestDate) oldestDate = dStr;
  }

  const historyDaysAvailable = differenceInDays(referenceDate, parseISO(oldestDate));
  const insufficientData = historyDaysAvailable < periodDays * 1.5; // Need at least 1.5x period to compare meaningfully

  let totalCurrentCount = 0;
  let totalPriorCount = 0;

  const perHabit: PeriodTrend[] = habits.map((h) => {
    const currentSet = currentDaysCompletions.get(h.id);
    const priorSet = priorDaysCompletions.get(h.id);

    const currentCount = currentSet ? currentSet.size : 0;
    const priorCount = priorSet ? priorSet.size : 0;

    totalCurrentCount += currentCount;
    totalPriorCount += priorCount;

    const currentRate = Math.round((currentCount / periodDays) * 100);
    const priorRate = Math.round((priorCount / periodDays) * 100);

    return {
      habitId: h.id,
      habitName: h.name,
      emoji: h.emoji,
      currentRate,
      priorRate,
      changePct: currentRate - priorRate,
      currentCount,
      priorCount,
    };
  });

  const totalPossiblePerPeriod = habits.length * periodDays;
  const overallCurrentRate = totalPossiblePerPeriod > 0
    ? Math.round((totalCurrentCount / totalPossiblePerPeriod) * 100)
    : 0;
  const overallPriorRate = totalPossiblePerPeriod > 0
    ? Math.round((totalPriorCount / totalPossiblePerPeriod) * 100)
    : 0;

  const overall: OverallTrend = {
    periodDays,
    currentRate: overallCurrentRate,
    priorRate: overallPriorRate,
    changePct: overallCurrentRate - overallPriorRate,
    insufficientData,
  };

  return { overall, perHabit };
}

/**
 * Compute weekday patterns (completion rate by day of week & weekday vs weekend).
 */
export function computeWeekdayPatternsFromData(
  habits: HabitData[],
  completions: CompletionData[],
  trailingDays: number = 30,
  referenceDate: Date = new Date()
): { byDay: WeekdayPattern[]; weekdayVsWeekend: WeekdayVsWeekend; insufficientData: boolean } {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalByDay = Array(7).fill(0);
  const completedByDay = Array(7).fill(0);

  const cutoff = subDays(referenceDate, trailingDays);
  const cutoffStr = format(cutoff, "yyyy-MM-dd");

  const completionsByDate = new Map<string, Set<string>>();
  for (const c of completions) {
    const dStr = normalizeDateString(c.completed_at);
    if (dStr >= cutoffStr) {
      if (!completionsByDate.has(dStr)) {
        completionsByDate.set(dStr, new Set());
      }
      completionsByDate.get(dStr)!.add(c.habit_id);
    }
  }

  for (let i = 0; i < trailingDays; i++) {
    const d = subDays(referenceDate, i);
    const dStr = format(d, "yyyy-MM-dd");
    const dayIdx = d.getDay(); // 0 = Sun, 6 = Sat

    totalByDay[dayIdx] += habits.length;
    const dayCompletions = completionsByDate.get(dStr);
    if (dayCompletions) {
      completedByDay[dayIdx] += dayCompletions.size;
    }
  }

  const byDay: WeekdayPattern[] = dayNames.map((name, idx) => {
    const total = totalByDay[idx];
    const completed = completedByDay[idx];
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      dayIndex: idx,
      dayName: name,
      completedCount: completed,
      totalDays: total,
      rate,
    };
  });

  // Weekday = Mon(1) - Fri(5), Weekend = Sun(0) & Sat(6)
  const weekdayCompleted = completedByDay[1] + completedByDay[2] + completedByDay[3] + completedByDay[4] + completedByDay[5];
  const weekdayTotal = totalByDay[1] + totalByDay[2] + totalByDay[3] + totalByDay[4] + totalByDay[5];

  const weekendCompleted = completedByDay[0] + completedByDay[6];
  const weekendTotal = totalByDay[0] + totalByDay[6];

  const weekdayRate = weekdayTotal > 0 ? Math.round((weekdayCompleted / weekdayTotal) * 100) : 0;
  const weekendRate = weekendTotal > 0 ? Math.round((weekendCompleted / weekendTotal) * 100) : 0;

  const insufficientData = trailingDays < 14 || completions.length < 5;

  return {
    byDay,
    weekdayVsWeekend: {
      weekdayRate,
      weekendRate,
      difference: weekdayRate - weekendRate,
    },
    insufficientData,
  };
}

/**
 * Capability E: Compute logging-time distribution (hour of day / time buckets from TIMESTAMPTZ completed_at).
 *
 * Buckets:
 *  - before_9am: 00:00 - 08:59
 *  - 9am_to_5pm: 09:00 - 16:59
 *  - 5pm_to_9pm: 17:00 - 20:59
 *  - after_9pm:  21:00 - 23:59
 */
export function computeCompletionTimeDistributionFromData(
  habits: HabitData[],
  completions: CompletionData[],
  tzOffsetMinutes: number = 0 // minutes offset if client passes timezone
): HabitTimeDistribution[] {
  const completionsByHabit = new Map<string, CompletionData[]>();
  for (const c of completions) {
    if (!completionsByHabit.has(c.habit_id)) {
      completionsByHabit.set(c.habit_id, []);
    }
    completionsByHabit.get(c.habit_id)!.push(c);
  }

  const bucketDefinitions: { key: TimeBucketKey; label: string; minHour: number; maxHour: number }[] = [
    { key: "before_9am", label: "Early Morning (Before 9 AM)", minHour: 0, maxHour: 8 },
    { key: "9am_to_5pm", label: "Daytime (9 AM - 5 PM)", minHour: 9, maxHour: 16 },
    { key: "5pm_to_9pm", label: "Evening (5 PM - 9 PM)", minHour: 17, maxHour: 20 },
    { key: "after_9pm", label: "Late Night (After 9 PM)", minHour: 21, maxHour: 23 },
  ];

  return habits.map((h) => {
    const list = completionsByHabit.get(h.id) || [];
    const totalCompletions = list.length;
    const insufficientData = totalCompletions < 5;

    const counts: Record<TimeBucketKey, number> = {
      before_9am: 0,
      "9am_to_5pm": 0,
      "5pm_to_9pm": 0,
      after_9pm: 0,
    };

    for (const item of list) {
      let dateObj = parseISO(item.completed_at);
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date(item.completed_at);
      }
      if (isNaN(dateObj.getTime())) continue;

      // Adjust for timezone offset if provided, and use UTC hour for deterministic calculation
      const adjustedTime = tzOffsetMinutes !== 0
        ? new Date(dateObj.getTime() + tzOffsetMinutes * 60 * 1000)
        : dateObj;

      const hour = adjustedTime.getUTCHours();

      if (hour < 9) counts.before_9am++;
      else if (hour < 17) counts["9am_to_5pm"]++;
      else if (hour < 21) counts["5pm_to_9pm"]++;
      else counts.after_9pm++;
    }

    let dominantBucket: TimeBucketKey | undefined = undefined;
    let maxCount = 0;

    const buckets: TimeBucketStats[] = bucketDefinitions.map((b) => {
      const count = counts[b.key];
      const percentage = totalCompletions > 0 ? Math.round((count / totalCompletions) * 100) : 0;
      if (count > maxCount && percentage >= 40) {
        maxCount = count;
        dominantBucket = b.key;
      }
      return {
        bucket: b.key,
        label: b.label,
        count,
        percentage,
      };
    });

    return {
      habitId: h.id,
      habitName: h.name,
      emoji: h.emoji,
      totalCompletions,
      buckets,
      dominantBucket: insufficientData ? undefined : dominantBucket,
      insufficientData,
    };
  });
}

/**
 * Compose full behavioral summary from raw data arrays.
 */
export function computeBehavioralSummaryFromData(
  habits: HabitData[],
  completions: CompletionData[],
  todos: TodoData[],
  periodDays: number = 30,
  referenceDate: Date = new Date(),
  tzOffsetMinutes: number = 0
): BehavioralSummary {
  const activeHabits = habits.filter((h) => !h.is_archived);
  const streaks = computeHabitStreaksFromData(activeHabits, completions, referenceDate);
  const consistencies = computeHabitConsistencyFromData(activeHabits, completions, periodDays, referenceDate);
  const trends = computeHabitTrendsFromData(activeHabits, completions, periodDays, referenceDate);
  const weekdayPatterns = computeWeekdayPatternsFromData(activeHabits, completions, periodDays, referenceDate);
  const timeDistributions = computeCompletionTimeDistributionFromData(activeHabits, completions, tzOffsetMinutes);

  // Compute correlations
  const completionTuples = completions.map((c) => ({
    habit_id: c.habit_id,
    dateStr: normalizeDateString(c.completed_at),
  }));
  const correlations = calculateHabitCorrelations(
    activeHabits.map((h) => ({ id: h.id, name: h.name })),
    completionTuples,
    periodDays,
    referenceDate
  );

  // Compute perfect day streak
  const completionsByDateMap = new Map<string, Set<string>>();
  for (const c of completions) {
    const dStr = normalizeDateString(c.completed_at);
    if (!completionsByDateMap.has(dStr)) {
      completionsByDateMap.set(dStr, new Set());
    }
    completionsByDateMap.get(dStr)!.add(c.habit_id);
  }
  const perfectDayStreak = calculatePerfectDayStreak(
    completionsByDateMap,
    activeHabits.length,
    referenceDate
  );

  // Overall streaks
  const overallBestStreak = streaks.reduce((max, s) => Math.max(max, s.best), 0);
  const overallCurrentStreak = streaks.reduce((max, s) => Math.max(max, s.current), 0);

  // Todos summary
  const completedTodosCount = todos.filter((t) => t.completed).length;
  const totalTodosCount = todos.length;
  const todoCompletionRate = totalTodosCount > 0 ? Math.round((completedTodosCount / totalTodosCount) * 100) : 0;

  return {
    periodDays,
    referenceDate: format(referenceDate, "yyyy-MM-dd"),
    totalActiveHabits: activeHabits.length,
    streaks,
    overallBestStreak,
    overallCurrentStreak,
    perfectDayStreak,
    consistencies,
    correlations,
    trends,
    weekdayPatterns,
    timeDistributions,
    todos: {
      total: totalTodosCount,
      completed: completedTodosCount,
      completionRate: todoCompletionRate,
    },
  };
}

// ── Database Fetching Functions (Scoped to Authenticated RLS Supabase Client) ─

/**
 * Fetch raw habit, completion, and todo data for the user from Supabase.
 */
export async function fetchUserHabitData(
  supabase: SupabaseClient,
  periodDays: number = 30
): Promise<{ habits: HabitData[]; completions: CompletionData[]; todos: TodoData[] }> {
  const sinceDate = format(subDays(new Date(), periodDays * 2), "yyyy-MM-dd");

  const [habitsRes, completionsRes, todosRes] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name, emoji, created_at, is_archived")
      .eq("is_archived", false),
    supabase
      .from("habit_completions")
      .select("id, habit_id, completed_at")
      .gte("completed_at", sinceDate),
    supabase
      .from("daily_todos")
      .select("id, title, completed, task_date")
      .gte("created_at", sinceDate),
  ]);

  if (habitsRes.error) throw new Error(`Failed to fetch habits: ${habitsRes.error.message}`);
  if (completionsRes.error) throw new Error(`Failed to fetch completions: ${completionsRes.error.message}`);

  // daily_todos is optional/non-fatal if table not yet migrated
  const todos = todosRes.error ? [] : (todosRes.data || []);

  return {
    habits: habitsRes.data || [],
    completions: completionsRes.data || [],
    todos,
  };
}

/**
 * Get full behavioral summary using an RLS-scoped Supabase client.
 */
export async function getBehavioralSummary(
  supabase: SupabaseClient,
  userId: string,
  periodDays: number = 30,
  referenceDate: Date = new Date(),
  tzOffsetMinutes: number = 0
): Promise<BehavioralSummary> {
  const { habits, completions, todos } = await fetchUserHabitData(supabase, periodDays);
  return computeBehavioralSummaryFromData(habits, completions, todos, periodDays, referenceDate, tzOffsetMinutes);
}

/**
 * Get habit streaks using an RLS-scoped Supabase client.
 */
export async function getHabitStreaks(
  supabase: SupabaseClient,
  userId: string,
  referenceDate: Date = new Date()
): Promise<HabitStreakInfo[]> {
  const { habits, completions } = await fetchUserHabitData(supabase, 30);
  return computeHabitStreaksFromData(habits, completions, referenceDate);
}

/**
 * Get habit consistency using an RLS-scoped Supabase client.
 */
export async function getHabitConsistency(
  supabase: SupabaseClient,
  userId: string,
  trailingDays: number = 30,
  referenceDate: Date = new Date()
): Promise<HabitConsistencyInfo[]> {
  const { habits, completions } = await fetchUserHabitData(supabase, trailingDays);
  return computeHabitConsistencyFromData(habits, completions, trailingDays, referenceDate);
}

/**
 * Get habit trends using an RLS-scoped Supabase client.
 */
export async function getHabitTrends(
  supabase: SupabaseClient,
  userId: string,
  periodDays: number = 30,
  referenceDate: Date = new Date()
) {
  const { habits, completions } = await fetchUserHabitData(supabase, periodDays);
  return computeHabitTrendsFromData(habits, completions, periodDays, referenceDate);
}

/**
 * Get weekday patterns using an RLS-scoped Supabase client.
 */
export async function getWeekdayPatterns(
  supabase: SupabaseClient,
  userId: string,
  trailingDays: number = 30,
  referenceDate: Date = new Date()
) {
  const { habits, completions } = await fetchUserHabitData(supabase, trailingDays);
  return computeWeekdayPatternsFromData(habits, completions, trailingDays, referenceDate);
}

/**
 * Get logging time distribution using an RLS-scoped Supabase client.
 */
export async function getCompletionTimeDistribution(
  supabase: SupabaseClient,
  userId: string,
  tzOffsetMinutes: number = 0
) {
  const { habits, completions } = await fetchUserHabitData(supabase, 30);
  return computeCompletionTimeDistributionFromData(habits, completions, tzOffsetMinutes);
}
