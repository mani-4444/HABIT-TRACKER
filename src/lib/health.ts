import { format, subDays, differenceInCalendarDays } from "date-fns";
import { normalizeDateString } from "./streaks";

export type HabitHealthCategory = "strong" | "on_track" | "at_risk" | "ignored";
export type HabitTrend = "improving" | "stable" | "declining" | "no_activity";

export interface DayHistoryItem {
  dateStr: string; // YYYY-MM-DD
  completed: boolean;
  isToday: boolean;
  dayShort: string; // e.g. "M", "T"
}

export interface HabitHealthDetail {
  habitId: string;
  health: HabitHealthCategory;
  healthLabel: string;
  healthColor: string;
  trend: HabitTrend;
  trendLabel: string;
  trendIcon: string;
  completed14Count: number;
  total14Days: number;
  totalDays: number;
  consistencyRate14: number; // 0 - 100
  history14Days: DayHistoryItem[];
  daysSinceLastCompletion: number; // 0 if today, 1 if yesterday, Infinity if never
  lastCompletedText: string; // "Completed today", "Yesterday", "5 days ago", "Never completed"
  earlier7Count: number;
  recent7Count: number;
  recent4Count: number;
  isNewHabit: boolean;
  explanation: string;
  comparisonText: string;
}

export interface HealthDashboardSummary {
  strongCount: number;
  onTrackCount: number;
  atRiskCount: number;
  ignoredCount: number;
  totalHabitsCount: number;
  attentionCount: number; // At Risk + Ignored
  doingWellHabits: {
    id: string;
    name: string;
    emoji: string;
    completed14Count: number;
    totalDays: number;
    consistencyRate14: number;
    trendLabel: string;
  }[];
  needsAttentionHabits: {
    id: string;
    name: string;
    emoji: string;
    health: HabitHealthCategory;
    trend: HabitTrend;
    trendLabel: string;
    completed14Count: number;
    totalDays: number;
    consistencyRate14: number;
    daysSinceLast: number;
    lastCompletedText: string;
    priorityScore: number;
    urgencyLabel: string;
  }[];
  decliningHabits: {
    id: string;
    name: string;
    emoji: string;
    completed14Count: number;
    totalDays: number;
    daysSinceLast: number;
    explanation: string;
  }[];
  improvingHabits: {
    id: string;
    name: string;
    emoji: string;
    completed14Count: number;
    totalDays: number;
    recent4Count: number;
    consistencyRate14: number;
  }[];
  bannerMessage: {
    type: "warning" | "success" | "neutral";
    headline: string;
    subtext?: string;
  };
}

/**
 * Calculates a 14-day history array from (referenceDate - 13 days) through referenceDate.
 */
export function get14DayHistory(
  completionDates: Set<string>,
  referenceDate: Date = new Date(),
): DayHistoryItem[] {
  const days: DayHistoryItem[] = [];
  const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];
  const todayStr = format(referenceDate, "yyyy-MM-dd");

  for (let i = 13; i >= 0; i--) {
    const d = subDays(referenceDate, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const completed = completionDates.has(dateStr);
    const isToday = dateStr === todayStr;
    const dayShort = dayLetters[d.getDay()];

    days.push({
      dateStr,
      completed,
      isToday,
      dayShort,
    });
  }

  return days;
}

/**
 * Computes health status, trend, and explainable behavioral metrics for a habit.
 */
export function calculateHabitHealth(
  habitId: string,
  completionDatesRaw: (string | Date)[],
  createdAtStr?: string,
  referenceDate: Date = new Date(),
): HabitHealthDetail {
  // Normalize all completion dates to unique sorted YYYY-MM-DD
  const dateSet = new Set<string>();
  const sortedDates: string[] = [];

  for (const dateVal of completionDatesRaw) {
    const s = normalizeDateString(dateVal);
    if (!dateSet.has(s)) {
      dateSet.add(s);
      sortedDates.push(s);
    }
  }
  sortedDates.sort();

  const fullHistory14 = get14DayHistory(dateSet, referenceDate);

  // Days available since creation
  let daysSinceCreated = 30;
  if (createdAtStr) {
    const createdDate = new Date(createdAtStr);
    daysSinceCreated = Math.max(
      1,
      differenceInCalendarDays(referenceDate, createdDate) + 1,
    );
  }

  const isNewHabit = daysSinceCreated <= 3;
  const effectiveWindow = Math.min(14, Math.max(1, daysSinceCreated));
  const totalDays = effectiveWindow;

  // For habits newer than 14 days, return only the days that actually exist
  const historyDays = isNewHabit
    ? fullHistory14.slice(14 - effectiveWindow)
    : fullHistory14;

  const completedCount = historyDays.filter((d) => d.completed).length;
  const consistencyRate = Math.min(
    100,
    Math.round((completedCount / effectiveWindow) * 100),
  );

  // 14-day history comparisons (using full 14 days)
  const completed14Count = fullHistory14.filter((d) => d.completed).length;
  const earlier7 = fullHistory14.slice(0, 7);
  const recent7 = fullHistory14.slice(7, 14);
  const earlier7Count = earlier7.filter((d) => d.completed).length;
  const recent7Count = recent7.filter((d) => d.completed).length;
  const recent4Count = fullHistory14.slice(10, 14).filter((d) => d.completed).length;

  // Calculate days since last completion
  const todayStr = format(referenceDate, "yyyy-MM-dd");
  let daysSinceLast = Infinity;
  let lastCompletedText = "Never completed";

  if (sortedDates.length > 0) {
    const latestDateStr = sortedDates[sortedDates.length - 1];
    const latestDate = new Date(`${latestDateStr}T12:00:00Z`);
    const refDateOnly = new Date(`${todayStr}T12:00:00Z`);
    daysSinceLast = Math.max(0, differenceInCalendarDays(refDateOnly, latestDate));

    if (daysSinceLast === 0) {
      lastCompletedText = "Completed today";
    } else if (daysSinceLast === 1) {
      lastCompletedText = "Yesterday";
    } else {
      lastCompletedText = `${daysSinceLast} days ago`;
    }
  }

  // Determine Trend (Direction of behavior)
  // Allowed primary UI labels: ↗ Improving, → Stable, ↘ Declining, — No activity, New habit
  let trend: HabitTrend = "stable";
  let trendLabel = "→ Stable";
  let trendIcon = "→";

  if (isNewHabit) {
    if (sortedDates.length === 0) {
      trend = "no_activity";
      trendLabel = "No data yet";
      trendIcon = "○";
    } else {
      trend = "improving";
      trendLabel = "New habit";
      trendIcon = "↗";
    }
  } else if (completed14Count === 0) {
    trend = "no_activity";
    trendLabel = "— No activity";
    trendIcon = "—";
  } else if (recent4Count >= 3 && (earlier7Count <= 2 || recent7Count > earlier7Count)) {
    // Recent burst / recovery
    trend = "improving";
    trendLabel = "↗ Improving";
    trendIcon = "↗";
  } else if (recent7Count > earlier7Count) {
    // More activity recently than in earlier period
    trend = "improving";
    trendLabel = "↗ Improving";
    trendIcon = "↗";
  } else if (earlier7Count >= 3 && (daysSinceLast >= 4 || recent7Count === 0)) {
    // Previously consistent but missed recent days
    trend = "declining";
    trendLabel = "↘ Declining";
    trendIcon = "↘";
  } else if (earlier7Count > recent7Count + 1 && daysSinceLast >= 3) {
    trend = "declining";
    trendLabel = "↘ Declining";
    trendIcon = "↘";
  } else {
    trend = "stable";
    trendLabel = "→ Stable";
    trendIcon = "→";
  }

  // Behavioral comparison text for explainable popover
  let comparisonText = "";
  if (earlier7Count > 0 || recent7Count > 0) {
    comparisonText = `You completed this habit ${recent7Count} ${
      recent7Count === 1 ? "time" : "times"
    } in the last 7 days compared with ${earlier7Count} ${
      earlier7Count === 1 ? "time" : "times"
    } in the previous 7 days.`;
  }

  // Health Classification (Current condition of habit)
  let health: HabitHealthCategory = "on_track";
  let explanation = "";

  // 1. Edge Case: New Habits (<= 3 days old)
  if (isNewHabit) {
    if (sortedDates.length === 0) {
      health = "on_track";
      explanation = "Newly added habit. Complete it today to begin building momentum.";
    } else {
      health = "strong";
      explanation = `Great start! You've completed ${completedCount}/${totalDays} days on your new habit.`;
    }
  }
  // 2. Recovery Override: Low overall baseline (< 60%), but clear recent recovery
  else if (
    (completed14Count <= 5 || consistencyRate < 60) &&
    (recent4Count >= 3 || (recent7Count >= 4 && recent7Count > earlier7Count))
  ) {
    health = "at_risk";
    trend = "improving";
    trendLabel = "↗ Improving";
    trendIcon = "↗";
    explanation = "Your overall consistency is still low, but your recent activity is improving.";
  }
  // 3. Decline Override: Historically strong (earlier7Count >= 4), but recent activity collapsed
  else if (earlier7Count >= 4 && (daysSinceLast >= 4 || recent7Count === 0)) {
    health = "at_risk";
    trend = "declining";
    trendLabel = "↘ Declining";
    trendIcon = "↘";
    explanation = `Your historical consistency is strong, but you've missed this habit for the last ${daysSinceLast} days.`;
  }
  // 4. Ignored:
  // STRICT RULE: Ignored is ONLY for habits with genuine lack of meaningful recent activity:
  // - 0 completions in the tracked 14-day period
  // - OR no activity for 7+ days (unless historically strong habit experiencing recent decline)
  // Any habit with completions within the last 6 days (daysSinceLast < 7) is an ACTIVE habit and NEVER Ignored!
  else if (
    completed14Count === 0 ||
    (daysSinceLast >= 7 && earlier7Count < 4) ||
    daysSinceLast >= 14
  ) {
    health = "ignored";
    trend = "no_activity";
    trendLabel = "— No activity";
    trendIcon = "—";
    if (completed14Count === 0) {
      explanation = "No completions during the tracked 14-day period.";
    } else {
      explanation = `No recent activity in the last ${daysSinceLast} days. Overall consistency is low.`;
    }
  }
  // 5. Strong: >= 80% consistency, good recent activity (within 2 days), no meaningful decline
  else if (consistencyRate >= 80 && daysSinceLast <= 2 && trend !== "declining") {
    health = "strong";
    explanation = `High consistency with ${completed14Count}/14 days completed (${consistencyRate}%). Outstanding discipline!`;
  }
  // 6. On Track: 60-79% consistency, reasonably consistent recent activity, stable or improving
  else if (consistencyRate >= 60 && consistencyRate < 80 && daysSinceLast <= 3 && trend !== "declining") {
    health = "on_track";
    explanation = `Steady consistency with ${completed14Count}/14 days completed (${consistencyRate}%). Maintaining a solid routine.`;
  }
  // 7. At Risk:
  // - < 60% consistency with recent activity (daysSinceLast < 7)
  // - OR declining trend
  // - OR missed 3-6 days consecutively
  // - OR active improving trend with low baseline
  else if (
    consistencyRate < 60 ||
    trend === "declining" ||
    (daysSinceLast >= 3 && daysSinceLast < 7) ||
    trend === "improving"
  ) {
    health = "at_risk";
    if (trend === "improving") {
      explanation = "Your overall consistency is still low, but your recent activity is improving.";
    } else if (trend === "declining") {
      explanation = `Your consistency has dropped recently. ${comparisonText}`;
    } else if (daysSinceLast >= 3) {
      explanation = `Missed for ${daysSinceLast} consecutive days. Check in today to preserve your momentum.`;
    } else if (daysSinceLast === 0) {
      explanation = `Completed today. Consistency is at ${consistencyRate}%. Keep up today's momentum to build consistency.`;
    } else if (daysSinceLast === 1) {
      explanation = `Completed yesterday. Consistency is at ${consistencyRate}%. Keep going to stay on track.`;
    } else {
      explanation = `Consistency is at ${consistencyRate}%. Needs attention to stay on track.`;
    }
  }
  // 8. Fallback
  else {
    health = "at_risk";
    explanation = `Consistency is at ${consistencyRate}%. Needs attention to stay on track.`;
  }

  const categoryMeta = {
    strong: {
      label: "Strong",
      color: "text-emerald-500",
    },
    on_track: {
      label: "On Track",
      color: "text-blue-500",
    },
    at_risk: {
      label: "At Risk",
      color: "text-orange-500",
    },
    ignored: {
      label: "Ignored",
      color: "text-rose-500",
    },
  };

  return {
    habitId,
    health,
    healthLabel: categoryMeta[health].label,
    healthColor: categoryMeta[health].color,
    trend,
    trendLabel,
    trendIcon,
    completed14Count: completedCount,
    total14Days: 14,
    totalDays,
    consistencyRate14: consistencyRate,
    history14Days: historyDays,
    daysSinceLastCompletion: daysSinceLast,
    lastCompletedText,
    earlier7Count,
    recent7Count,
    recent4Count,
    isNewHabit,
    explanation,
    comparisonText,
  };
}

/**
 * Aggregates dashboard health metrics and builds strictly computed summary counts.
 */
export function buildHealthDashboardSummary(
  habits: { id: string; name: string; emoji: string }[],
  healthMap: Record<string, HabitHealthDetail>,
): HealthDashboardSummary {
  let strongCount = 0;
  let onTrackCount = 0;
  let atRiskCount = 0;
  let ignoredCount = 0;

  let atRiskDecliningCount = 0;
  let atRiskStableCount = 0;
  let atRiskImprovingCount = 0;

  const doingWellHabits: HealthDashboardSummary["doingWellHabits"] = [];
  const needsAttentionHabits: HealthDashboardSummary["needsAttentionHabits"] = [];
  const decliningHabits: HealthDashboardSummary["decliningHabits"] = [];
  const improvingHabits: HealthDashboardSummary["improvingHabits"] = [];

  for (const habit of habits) {
    const detail = healthMap[habit.id];
    if (!detail) continue;

    // Strict category count
    if (detail.health === "strong") {
      strongCount++;
    } else if (detail.health === "on_track") {
      onTrackCount++;
    } else if (detail.health === "at_risk") {
      atRiskCount++;
      if (detail.trend === "declining") {
        atRiskDecliningCount++;
      } else if (detail.trend === "improving") {
        atRiskImprovingCount++;
      } else {
        atRiskStableCount++;
      }
    } else if (detail.health === "ignored") {
      ignoredCount++;
    }

    // 1. Doing Well: Strong habits or high consistency (>= 10/14 or >= 75%)
    if (detail.health === "strong" || detail.consistencyRate14 >= 75) {
      doingWellHabits.push({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        completed14Count: detail.completed14Count,
        totalDays: detail.totalDays,
        consistencyRate14: detail.consistencyRate14,
        trendLabel: detail.trendLabel,
      });
    }

    // 2. Needs Attention: Prioritized according to urgency:
    // 1. Ignored + no recent activity (priorityScore: 500)
    // 2. At Risk + declining (priorityScore: 400)
    // 3. Low consistency (< 30%) (priorityScore: 300)
    // 4. At Risk + stable (priorityScore: 200)
    // 5. At Risk + improving (priorityScore: 100)
    if (detail.health === "ignored" || detail.health === "at_risk") {
      let priorityScore = 150;
      let urgencyLabel = "At Risk";

      if (detail.health === "ignored") {
        priorityScore = 500;
        urgencyLabel = "No recent activity";
      } else if (detail.health === "at_risk" && detail.trend === "declining") {
        priorityScore = 400;
        urgencyLabel = "↘ Declining";
      } else if (detail.consistencyRate14 < 30) {
        priorityScore = 300;
        urgencyLabel = "Low consistency";
      } else if (detail.health === "at_risk" && detail.trend === "stable") {
        priorityScore = 200;
        urgencyLabel = "→ Stable";
      } else if (detail.health === "at_risk" && detail.trend === "improving") {
        priorityScore = 100;
        urgencyLabel = "↗ Improving";
      }

      needsAttentionHabits.push({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        health: detail.health,
        trend: detail.trend,
        trendLabel: detail.trendLabel,
        completed14Count: detail.completed14Count,
        totalDays: detail.totalDays,
        consistencyRate14: detail.consistencyRate14,
        daysSinceLast: detail.daysSinceLastCompletion,
        lastCompletedText: detail.lastCompletedText,
        priorityScore,
        urgencyLabel,
      });
    }

    // 3. Recent Decline: Declining trend with previous activity
    if (detail.trend === "declining") {
      decliningHabits.push({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        completed14Count: detail.completed14Count,
        totalDays: detail.totalDays,
        daysSinceLast: detail.daysSinceLastCompletion,
        explanation:
          detail.daysSinceLastCompletion >= 3
            ? `completed ${detail.completed14Count}/${detail.totalDays} days but missed the last ${detail.daysSinceLastCompletion} days`
            : `completed ${detail.recent7Count} in last 7 days vs ${detail.earlier7Count} earlier`,
      });
    }

    // 4. Improving: Habits on an upward trend
    if (detail.trend === "improving") {
      improvingHabits.push({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        completed14Count: detail.completed14Count,
        totalDays: detail.totalDays,
        recent4Count: detail.recent4Count,
        consistencyRate14: detail.consistencyRate14,
      });
    }
  }

  // Sort lists for presentation
  doingWellHabits.sort((a, b) => b.consistencyRate14 - a.consistencyRate14);

  // Sort Needs Attention by priority score descending (most urgent first), then daysSinceLast descending
  needsAttentionHabits.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return b.daysSinceLast - a.daysSinceLast;
  });

  decliningHabits.sort((a, b) => b.daysSinceLast - a.daysSinceLast);
  improvingHabits.sort((a, b) => b.recent4Count - a.recent4Count);

  // Dynamic Headline Banner (Requiring Attention = At Risk + Ignored)
  const totalHabitsCount = habits.length;
  const attentionCount = atRiskCount + ignoredCount;

  let bannerMessage: HealthDashboardSummary["bannerMessage"] = {
    type: "neutral",
    headline: "Track habits to build behavioral insights.",
  };

  if (totalHabitsCount === 0) {
    bannerMessage = {
      type: "neutral",
      headline: "No habits tracked yet. Create your first habit to begin!",
    };
  } else if (attentionCount === 0) {
    bannerMessage = {
      type: "success",
      headline: "✨ Your habits are looking strong today.",
      subtext: "All your active habits are healthy and consistent.",
    };
  } else {
    // Summarize the actual risk composition:
    // e.g. "4 declining · 4 ignored" or "2 declining · 2 stable · 4 ignored" or "2 improving · 4 ignored"
    const parts: string[] = [];
    if (atRiskDecliningCount > 0) {
      parts.push(`${atRiskDecliningCount} declining`);
    }
    if (atRiskStableCount > 0) {
      parts.push(`${atRiskStableCount} stable`);
    }
    if (atRiskImprovingCount > 0) {
      parts.push(`${atRiskImprovingCount} improving`);
    }
    if (ignoredCount > 0) {
      parts.push(`${ignoredCount} ignored`);
    }

    const subtext =
      parts.length > 0
        ? parts.join(" · ")
        : `${attentionCount} requiring attention`;

    bannerMessage = {
      type: "warning",
      headline: `⚠️ ${attentionCount} habit${
        attentionCount === 1 ? " needs" : "s need"
      } attention.`,
      subtext,
    };
  }

  return {
    strongCount,
    onTrackCount,
    atRiskCount,
    ignoredCount,
    totalHabitsCount,
    attentionCount,
    doingWellHabits,
    needsAttentionHabits,
    decliningHabits,
    improvingHabits,
    bannerMessage,
  };
}

