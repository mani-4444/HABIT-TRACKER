/**
 * api/_lib/ai-context.ts
 *
 * Canonical AI Context Builder.
 * Prepares a structured, sanitized payload (`HabitAIContext`) containing all
 * computed facts and evidence for LLM prompt ingestion.
 *
 * Security & Integrity Invariants:
 *  - Strips user email, password, and sensitive identity details.
 *  - Sanitizes user-provided habit names and todo titles (guards against prompt injection).
 *  - Includes exact evidence items for each computed metric.
 */

import {
  type BehavioralSummary,
  getBehavioralSummary,
} from "./analytics";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Evidence } from "./schemas";

export interface SanitizedHabitContext {
  id: string;
  name: string;
  emoji: string;
  currentStreak: number;
  bestStreak: number;
  isAtRisk: boolean;
  consistencyScore: number;
  currentPeriodRate: number;
  priorPeriodRate: number;
  rateChangePct: number;
  dominantLogTime?: string;
  logTimeInsufficientData: boolean;
}

export interface HabitAIContext {
  generatedAt: string;
  periodDays: number;
  activeHabitCount: number;
  habits: SanitizedHabitContext[];
  overall: {
    currentCompletionRate: number;
    priorCompletionRate: number;
    rateChangePct: number;
    bestOverallStreak: number;
    currentOverallStreak: number;
    perfectDayStreakCurrent: number;
    perfectDayStreakBest: number;
    insufficientTrendData: boolean;
  };
  weekdayVsWeekend: {
    weekdayRate: number;
    weekendRate: number;
    difference: number;
    insufficientData: boolean;
  };
  topCorrelations: {
    habitA: string;
    habitB: string;
    togetherRate: number;
    lift: number;
  }[];
  todosSummary: {
    total: number;
    completed: number;
    completionRate: number;
  };
  evidenceList: Evidence[];
}

/**
 * Sanitize user input strings (habit names, todo titles) to prevent prompt injection attacks.
 * Wraps or strips special prompt control tokens.
 */

export function sanitizeText(input: string): string {
  if (!input) return "";
  // Strip control characters, excessive backticks, and prompt injection marker tokens
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/[`"'<>{}]/g, "")
    .slice(0, 100)
    .trim();
}

/**
 * Build canonical HabitAIContext from a BehavioralSummary object.
 */
export function buildHabitAIContext(summary: BehavioralSummary): HabitAIContext {
  const evidenceList: Evidence[] = [];

  // Map habits
  const habits: SanitizedHabitContext[] = summary.streaks.map((s) => {
    const consistency = summary.consistencies.find((c) => c.habitId === s.habitId);
    const trend = summary.trends.perHabit.find((t) => t.habitId === s.habitId);
    const timeDist = summary.timeDistributions.find((td) => td.habitId === s.habitId);

    const habitName = sanitizeText(s.habitName);

    // Build evidence for streaks
    if (s.current > 0) {
      evidenceList.push({
        type: "STREAK_CHANGE",
        metric: "Current Streak",
        value: s.current,
        comparisonValue: s.best,
        period: `${summary.periodDays}d`,
        habitName,
        details: s.isAtRisk ? "Streak is at risk today" : `Active streak of ${s.current} days`,
      });
    }

    // Build evidence for consistency
    if (consistency) {
      evidenceList.push({
        type: "CONSISTENCY_SCORE",
        metric: "Consistency Index",
        value: consistency.consistencyScore,
        period: `${summary.periodDays}d`,
        habitName,
      });
    }

    // Build evidence for period trend
    if (trend) {
      evidenceList.push({
        type: "PERIOD_TREND",
        metric: "Completion Rate",
        value: `${trend.currentRate}%`,
        comparisonValue: `${trend.priorRate}%`,
        period: `${summary.periodDays}d`,
        habitName,
        details: `Change: ${trend.changePct > 0 ? "+" : ""}${trend.changePct}%`,
      });
    }

    // Build evidence for logging time pattern
    if (timeDist && !timeDist.insufficientData && timeDist.dominantBucket) {
      evidenceList.push({
        type: "LOGGING_TIME_PATTERN",
        metric: "Logging Time Pattern",
        value: timeDist.dominantBucket,
        habitName,
        details: `Logged predominantly during ${timeDist.dominantBucket} (${timeDist.buckets.find(b => b.bucket === timeDist.dominantBucket)?.percentage}%)`,
      });
    }

    return {
      id: s.habitId,
      name: habitName,
      emoji: s.emoji,
      currentStreak: s.current,
      bestStreak: s.best,
      isAtRisk: s.isAtRisk,
      consistencyScore: consistency?.consistencyScore ?? 0,
      currentPeriodRate: trend?.currentRate ?? 0,
      priorPeriodRate: trend?.priorRate ?? 0,
      rateChangePct: trend?.changePct ?? 0,
      dominantLogTime: timeDist?.dominantBucket,
      logTimeInsufficientData: timeDist?.insufficientData ?? true,
    };
  });

  // Weekday vs Weekend evidence
  if (!summary.weekdayPatterns.insufficientData) {
    evidenceList.push({
      type: "WEEKDAY_PARITY",
      metric: "Weekday vs Weekend Rate",
      value: `${summary.weekdayPatterns.weekdayVsWeekend.weekdayRate}% (Weekday)`,
      comparisonValue: `${summary.weekdayPatterns.weekdayVsWeekend.weekendRate}% (Weekend)`,
      details: `Diff: ${summary.weekdayPatterns.weekdayVsWeekend.difference}%`,
    });
  }

  // Correlation evidence
  const topCorrelations = summary.correlations.map((c) => {
    const hAName = sanitizeText(c.habitAName);
    const hBName = sanitizeText(c.habitBName);
    evidenceList.push({
      type: "CROSS_HABIT_CORRELATION",
      metric: "Habit Pairing",
      value: `${c.togetherRate}% together`,
      habitName: `${hAName} + ${hBName}`,
      details: `Lift factor ${c.lift}x over independent probability`,
    });
    return {
      habitA: hAName,
      habitB: hBName,
      togetherRate: c.togetherRate,
      lift: c.lift,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    periodDays: summary.periodDays,
    activeHabitCount: summary.totalActiveHabits,
    habits,
    overall: {
      currentCompletionRate: summary.trends.overall.currentRate,
      priorCompletionRate: summary.trends.overall.priorRate,
      rateChangePct: summary.trends.overall.changePct,
      bestOverallStreak: summary.overallBestStreak,
      currentOverallStreak: summary.overallCurrentStreak,
      perfectDayStreakCurrent: summary.perfectDayStreak.current,
      perfectDayStreakBest: summary.perfectDayStreak.best,
      insufficientTrendData: summary.trends.overall.insufficientData,
    },
    weekdayVsWeekend: {
      weekdayRate: summary.weekdayPatterns.weekdayVsWeekend.weekdayRate,
      weekendRate: summary.weekdayPatterns.weekdayVsWeekend.weekendRate,
      difference: summary.weekdayPatterns.weekdayVsWeekend.difference,
      insufficientData: summary.weekdayPatterns.insufficientData,
    },
    topCorrelations,
    todosSummary: summary.todos,
    evidenceList,
  };
}

/**
 * Convenience function to fetch data and return canonical HabitAIContext for a user.
 */
export async function getCanonicalAIContext(
  supabase: SupabaseClient,
  userId: string,
  periodDays: number = 30,
  referenceDate: Date = new Date(),
  tzOffsetMinutes: number = 0
): Promise<HabitAIContext> {
  const summary = await getBehavioralSummary(supabase, userId, periodDays, referenceDate, tzOffsetMinutes);
  return buildHabitAIContext(summary);
}
