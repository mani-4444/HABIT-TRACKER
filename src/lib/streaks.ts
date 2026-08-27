import { format, subDays, parseISO, differenceInDays } from "date-fns";

/**
 * Standardize any date input (YYYY-MM-DD string or TIMESTAMPTZ ISO string or Date)
 * into a YYYY-MM-DD formatted calendar date string.
 */
export function normalizeDateString(input: string | Date | null | undefined): string {
  if (!input) return "";
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return "";
    return format(input, "yyyy-MM-dd");
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  return "";
}

export interface PerHabitStreakResult {
  current: number;
  best: number;
  isAtRisk: boolean;
}

/**
 * Calculate per-habit current and best streak stats.
 *
 * - current: consecutive completed days ending today (or yesterday, which marks isAtRisk = true).
 * - best: maximum consecutive completed days across the entire completion history.
 * - isAtRisk: true if completed yesterday but not yet today.
 */
export function calculatePerHabitStreak(
  completionDates: (string | Date | null | undefined)[],
  referenceDate: Date = new Date(),
): PerHabitStreakResult {
  if (!completionDates || completionDates.length === 0) {
    return { current: 0, best: 0, isAtRisk: false };
  }

  // Convert all valid completion dates to unique YYYY-MM-DD set
  const dateSet = new Set<string>();
  for (const dateVal of completionDates) {
    if (!dateVal) continue;
    const s = normalizeDateString(dateVal);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      dateSet.add(s);
    }
  }

  const todayStr = format(referenceDate, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(referenceDate, 1), "yyyy-MM-dd");

  const completedToday = dateSet.has(todayStr);
  const completedYesterday = dateSet.has(yesterdayStr);

  let current = 0;
  let isAtRisk = false;

  if (completedToday) {
    current = 1;
    let checkDate = subDays(referenceDate, 1);
    while (dateSet.has(format(checkDate, "yyyy-MM-dd"))) {
      current++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (completedYesterday) {
    isAtRisk = true;
    current = 1;
    let checkDate = subDays(referenceDate, 2);
    while (dateSet.has(format(checkDate, "yyyy-MM-dd"))) {
      current++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Calculate best streak across sorted dates
  const sortedDates = Array.from(dateSet).sort();
  let best = sortedDates.length > 0 ? 1 : 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i - 1]);
    const currDate = parseISO(sortedDates[i]);
    const diff = differenceInDays(currDate, prevDate);

    if (diff === 1) {
      tempStreak++;
      best = Math.max(best, tempStreak);
    } else if (diff > 1) {
      tempStreak = 1;
    }
  }

  return { current, best, isAtRisk };
}

export interface PerfectDayStreakResult {
  current: number;
  best: number;
}

/**
 * Calculate streak of "perfect days" (days where ALL habits were completed).
 */
export function calculatePerfectDayStreak(
  completionsByDate: Map<string, Set<string>>,
  totalHabitCount: number,
  referenceDate: Date = new Date(),
): PerfectDayStreakResult {
  if (totalHabitCount <= 0 || completionsByDate.size === 0) {
    return { current: 0, best: 0 };
  }

  const todayStr = format(referenceDate, "yyyy-MM-dd");
  const isPerfectDay = (dateStr: string) => {
    const set = completionsByDate.get(dateStr);
    return set ? set.size >= totalHabitCount : false;
  };

  // Calculate current streak
  let current = 0;
  let startIndex = 0;

  // If today is not perfect, start checking from yesterday without breaking
  if (!isPerfectDay(todayStr)) {
    startIndex = 1;
  }

  let checkDate = subDays(referenceDate, startIndex);
  while (isPerfectDay(format(checkDate, "yyyy-MM-dd"))) {
    current++;
    checkDate = subDays(checkDate, 1);
  }

  // Calculate best streak over history
  const sortedDates = Array.from(completionsByDate.keys()).sort();
  let best = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    if (isPerfectDay(dateStr)) {
      if (i > 0) {
        const prevDate = parseISO(sortedDates[i - 1]);
        const currDate = parseISO(dateStr);
        const diff = differenceInDays(currDate, prevDate);
        if (diff === 1 && isPerfectDay(sortedDates[i - 1])) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      best = Math.max(best, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current, best };
}

export interface HabitConsistencyResult {
  stdDev: number; // Standard deviation of daily completion rate (0 - 0.5)
  variance: number;
  consistencyScore: number; // 0 to 100 consistency index (100 = perfectly consistent)
}

/**
 * Calculate consistency metric (standard deviation / variance) for a single habit over trailing days.
 */
export function calculateHabitConsistency(
  completionDates: (string | Date)[],
  trailingDays: number = 30,
  referenceDate: Date = new Date(),
): HabitConsistencyResult {
  if (trailingDays <= 0) {
    return { stdDev: 0, variance: 0, consistencyScore: 100 };
  }

  const dateSet = new Set<string>();
  for (const dateVal of completionDates) {
    dateSet.add(normalizeDateString(dateVal));
  }

  const values: number[] = [];
  for (let i = 0; i < trailingDays; i++) {
    const checkDate = subDays(referenceDate, i);
    const dateStr = format(checkDate, "yyyy-MM-dd");
    values.push(dateSet.has(dateStr) ? 1 : 0);
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / trailingDays;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    trailingDays;
  const stdDev = Math.sqrt(variance);

  const consistencyScore = Math.round(Math.max(0, (1 - stdDev / 0.5) * 100));

  return { stdDev, variance, consistencyScore };
}

export interface HabitCorrelation {
  habitAId: string;
  habitBId: string;
  habitAName: string;
  habitBName: string;
  coOccurrenceCount: number;
  lift: number;
  togetherRate: number; // % of days when habit A was completed that B was also completed
}

/**
 * Calculate cross-habit same-day co-occurrence and lift for pairs of habits over trailing days.
 */
export function calculateHabitCorrelations(
  habits: { id: string; name: string }[],
  completions: { habit_id: string; dateStr: string }[],
  trailingDays: number = 30,
  referenceDate: Date = new Date(),
): HabitCorrelation[] {
  if (habits.length < 2) return [];

  const cutoffDateStr = format(subDays(referenceDate, trailingDays), "yyyy-MM-dd");
  const completionsByDate = new Map<string, Set<string>>();

  for (const c of completions) {
    if (c.dateStr >= cutoffDateStr) {
      if (!completionsByDate.has(c.dateStr)) {
        completionsByDate.set(c.dateStr, new Set());
      }
      completionsByDate.get(c.dateStr)!.add(c.habit_id);
    }
  }

  const N = trailingDays;
  if (N <= 0) return [];

  const correlations: HabitCorrelation[] = [];

  for (let i = 0; i < habits.length; i++) {
    for (let j = i + 1; j < habits.length; j++) {
      const hA = habits[i];
      const hB = habits[j];

      let countA = 0;
      let countB = 0;
      let countBoth = 0;

      for (let d = 0; d < N; d++) {
        const dateStr = format(subDays(referenceDate, d), "yyyy-MM-dd");
        const daySet = completionsByDate.get(dateStr);
        const hasA = daySet?.has(hA.id) ?? false;
        const hasB = daySet?.has(hB.id) ?? false;

        if (hasA) countA++;
        if (hasB) countB++;
        if (hasA && hasB) countBoth++;
      }

      if (countA >= 3 && countB >= 3 && countBoth >= 2) {
        const pA = countA / N;
        const pB = countB / N;
        const pBoth = countBoth / N;
        const lift = pA * pB > 0 ? pBoth / (pA * pB) : 0;
        const togetherRate = countA > 0 ? Math.round((countBoth / countA) * 100) : 0;

        if (lift > 1.05) {
          correlations.push({
            habitAId: hA.id,
            habitBId: hB.id,
            habitAName: hA.name,
            habitBName: hB.name,
            coOccurrenceCount: countBoth,
            lift: Math.round(lift * 100) / 100,
            togetherRate,
          });
        }
      }
    }
  }

  return correlations.sort((a, b) => b.lift - a.lift);
}
