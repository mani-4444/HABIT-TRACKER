import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import {
  format,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfDay,
  addDays as dateFnsAddDays,
} from "date-fns";
import {
  calculatePerHabitStreak,
  calculatePerfectDayStreak,
  calculateHabitConsistency,
  calculateHabitCorrelations,
  normalizeDateString,
  HabitCorrelation,
} from "@/lib/streaks";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at: string;
  is_archived: boolean;
}

export type HabitInsert = {
  name: string;
  emoji?: string;
};

export type HabitUpdate = {
  id: string;
  name?: string;
  emoji?: string;
  is_archived?: boolean;
};

// Fetch all habits for the current user
export function useHabits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });
}

// Add a new habit
export function useAddHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (habit: HabitInsert) => {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user?.id,
          name: habit.name,
          emoji: habit.emoji || "⭐",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

// Update an existing habit
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: HabitUpdate) => {
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

// Delete a habit
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

// ============================================
// HABIT COMPLETIONS
// ============================================

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string;
  created_at: string;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// Fetch today's completions for the current user's habits
export function useTodayCompletions() {
  const { user } = useAuth();
  const todayDateStr = getTodayDateString();

  return useQuery({
    queryKey: ["completions", todayDateStr, user?.id],
    queryFn: async () => {
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id")
        .eq("is_archived", false);

      if (habitsError) throw habitsError;

      const habitIds = habits?.map((h) => h.id) || [];
      if (habitIds.length === 0) return [];

      const startOfToday = startOfDay(new Date());
      const startOfTomorrow = dateFnsAddDays(startOfToday, 1);

      const { data, error } = await supabase
        .from("habit_completions")
        .select("*")
        .in("habit_id", habitIds)
        .gte("completed_at", startOfToday.toISOString())
        .lt("completed_at", startOfTomorrow.toISOString());

      if (error) throw error;
      return data as HabitCompletion[];
    },
    enabled: !!user,
  });
}

// Toggle a habit completion for today
export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      isCurrentlyCompleted,
    }: {
      habitId: string;
      isCurrentlyCompleted: boolean;
    }) => {
      const startOfToday = startOfDay(new Date());
      const startOfTomorrow = dateFnsAddDays(startOfToday, 1);

      if (isCurrentlyCompleted) {
        // Delete today's completion
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .gte("completed_at", startOfToday.toISOString())
          .lt("completed_at", startOfTomorrow.toISOString());

        if (error) throw error;
      } else {
        const now = new Date();
        const todayDateStr = format(now, "yyyy-MM-dd");

        // Insert a new completion with TIMESTAMPTZ and legacy completed_date for database backward compatibility
        const { error } = await supabase.from("habit_completions").insert({
          habit_id: habitId,
          completed_at: now.toISOString(),
          completed_date: todayDateStr,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["completions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["streakStats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ============================================
// STREAK STATISTICS (Per-Habit & Overall)
// ============================================

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  isAtRisk: boolean;
  completedToday: boolean;
}

export interface HabitStreakMap {
  [habitId: string]: StreakStats;
}

export interface OverallStreakStats {
  bestStreak: { days: number; habitName: string; habitId: string };
  currentStreak: { days: number; habitName: string; habitId: string };
}

/**
 * Fetch and compute streak stats for all active habits using the shared streaks utility.
 */
export function useHabitStreakStats() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["streakStats", user?.id],
    queryFn: async () => {
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, name")
        .eq("is_archived", false);

      if (habitsError) throw habitsError;
      if (!habits || habits.length === 0) {
        return { completions: [], habits: [] };
      }

      const habitIds = habits.map((h) => h.id);

      // Fetch completions for last 365 days
      const oneYearAgo = startOfDay(subDays(new Date(), 365));

      const { data: completions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_at")
        .in("habit_id", habitIds)
        .gte("completed_at", oneYearAgo.toISOString())
        .order("completed_at", { ascending: false });

      if (completionsError) throw completionsError;

      return { completions: completions || [], habits };
    },
    enabled: !!user,
  });

  const streakData = useMemo(() => {
    if (!query.data || !query.data.habits) {
      return {
        streakMap: {} as HabitStreakMap,
        overall: {
          bestStreak: { days: 0, habitName: "-", habitId: "" },
          currentStreak: { days: 0, habitName: "-", habitId: "" },
        } as OverallStreakStats,
      };
    }

    const { completions, habits } = query.data;
    const todayStr = getTodayDateString();
    const streakMap: HabitStreakMap = {};

    let overallBest = { days: 0, habitName: "-", habitId: "" };
    let overallCurrent = { days: 0, habitName: "-", habitId: "" };

    for (const habit of habits) {
      const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
      const completionDates = habitCompletions.map((c) => c.completed_at);

      const streak = calculatePerHabitStreak(completionDates);

      const completedToday = habitCompletions.some(
        (c) => normalizeDateString(c.completed_at) === todayStr,
      );

      streakMap[habit.id] = {
        currentStreak: streak.current,
        bestStreak: streak.best,
        isAtRisk: streak.isAtRisk,
        completedToday,
      };

      if (streak.best > overallBest.days) {
        overallBest = {
          days: streak.best,
          habitName: habit.name,
          habitId: habit.id,
        };
      }

      if (streak.current > overallCurrent.days) {
        overallCurrent = {
          days: streak.current,
          habitName: habit.name,
          habitId: habit.id,
        };
      }
    }

    return {
      streakMap,
      overall: { bestStreak: overallBest, currentStreak: overallCurrent },
    };
  }, [query.data]);

  return {
    streakMap: streakData.streakMap,
    overall: streakData.overall,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ============================================
// OVERALL STATISTICS (Perfect Day Streak & Weekly Rate)
// ============================================

function getWeekStartDate(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDaysElapsedThisWeek(): number {
  const today = new Date();
  const day = today.getDay();
  return day === 0 ? 7 : day;
}

export function useHabitStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, created_at")
        .eq("is_archived", false);

      if (habitsError) throw habitsError;
      if (!habits || habits.length === 0) {
        return { streak: 0, weeklyPercentage: 0 };
      }

      const habitIds = habits.map((h) => h.id);
      const habitCount = habits.length;

      const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

      const { data: allCompletions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_at")
        .in("habit_id", habitIds)
        .gte("completed_at", thirtyDaysAgo.toISOString())
        .order("completed_at", { ascending: false });

      if (completionsError) throw completionsError;

      const completionsByDate = new Map<string, Set<string>>();
      for (const c of allCompletions || []) {
        const dateStr = normalizeDateString(c.completed_at);
        if (!completionsByDate.has(dateStr)) {
          completionsByDate.set(dateStr, new Set());
        }
        completionsByDate.get(dateStr)!.add(c.habit_id);
      }

      // Calculate perfect day streak using unified utility
      const { current: streak } = calculatePerfectDayStreak(
        completionsByDate,
        habitCount,
      );

      // Calculate weekly completion percentage
      const weekStart = getWeekStartDate();
      const daysElapsed = getDaysElapsedThisWeek();

      let weeklyCompletions = 0;
      for (let i = 0; i < daysElapsed; i++) {
        const checkDate = addDays(weekStart, i);
        const dateStr = format(checkDate, "yyyy-MM-dd");
        const completedHabits = completionsByDate.get(dateStr);
        weeklyCompletions += completedHabits?.size || 0;
      }

      const maxPossible = habitCount * daysElapsed;
      const weeklyPercentage =
        maxPossible > 0
          ? Math.round((weeklyCompletions / maxPossible) * 100)
          : 0;

      return {
        streak,
        weeklyPercentage: Math.min(100, Math.max(0, weeklyPercentage)),
      };
    },
    enabled: !!user,
  });
}

// ============================================
// ANALYTICS DATA
// ============================================

export interface WeeklyDataPoint {
  day: string;
  completed: number;
  total: number;
}

export interface Last4WeeksDataPoint {
  week: string;
  rate: number;
}

export interface MonthlyTrendDataPoint {
  month: string;
  monthKey: string;
  rate: number;
  completions: number;
  possible: number;
}

export interface HabitStatData {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  completions: number;
  stdDev: number;
  consistencyScore: number;
}

export interface AnalyticsData {
  weeklyData: WeeklyDataPoint[];
  last4WeeksTrend: Last4WeeksDataPoint[];
  monthlyTrend: MonthlyTrendDataPoint[];
  habitStats: HabitStatData[];
  correlations: HabitCorrelation[];
  totalDaysTracked: number;
  totalCompletions: number;
  bestStreak: { days: number; habitName: string };
  overallRate: number;
}

export function useAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, name, emoji, created_at")
        .eq("is_archived", false)
        .order("created_at", { ascending: true });

      if (habitsError) throw habitsError;

      if (!habits || habits.length === 0) {
        return {
          weeklyData: [],
          last4WeeksTrend: [],
          monthlyTrend: [],
          habitStats: [],
          correlations: [],
          totalDaysTracked: 0,
          totalCompletions: 0,
          bestStreak: { days: 0, habitName: "-" },
          overallRate: 0,
        };
      }

      const habitIds = habits.map((h) => h.id);
      const habitCount = habits.length;

      const today = new Date();
      const twelveMonthsAgo = startOfDay(subMonths(startOfMonth(today), 11));

      const { data: allCompletions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_at")
        .in("habit_id", habitIds)
        .gte("completed_at", twelveMonthsAgo.toISOString())
        .order("completed_at", { ascending: true });

      if (completionsError) throw completionsError;

      const completions = (allCompletions || []).map((c) => ({
        habit_id: c.habit_id,
        completed_at: c.completed_at,
        dateStr: normalizeDateString(c.completed_at),
      }));

      // Trailing 30 days completions
      const thirtyDaysAgoStr = format(subDays(today, 30), "yyyy-MM-dd");
      const recentCompletions = completions.filter(
        (c) => c.dateStr >= thirtyDaysAgoStr,
      );

      // ---- WEEKLY DATA (Last 7 days) ----
      const weeklyData: WeeklyDataPoint[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayName = dayNames[date.getDay()];

        const dayCompletions = recentCompletions.filter(
          (c) => c.dateStr === dateStr,
        ).length;

        weeklyData.push({
          day: dayName,
          completed: dayCompletions,
          total: habitCount,
        });
      }

      // ---- LAST 4 WEEKS TREND ----
      const last4WeeksTrend: Last4WeeksDataPoint[] = [];
      const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

      for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
        const weekStart = subWeeks(currentWeekStart, weekOffset);
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

        let weekCompletions = 0;
        let daysInWeek = 0;

        for (let d = 0; d < 7; d++) {
          const checkDate = addDays(weekStart, d);
          if (checkDate > today) break;

          daysInWeek++;
          const dateStr = format(checkDate, "yyyy-MM-dd");
          weekCompletions += completions.filter(
            (c) => c.dateStr === dateStr,
          ).length;
        }

        const maxPossible = habitCount * daysInWeek;
        const rate =
          maxPossible > 0
            ? Math.round((weekCompletions / maxPossible) * 100)
            : 0;

        const startStr = format(weekStart, "MMM d");
        const endStr = format(weekEnd, "MMM d");

        last4WeeksTrend.push({
          week: `${startStr} - ${endStr}`,
          rate: Math.min(100, rate),
        });
      }

      // ---- MONTHLY TREND ----
      const monthlyTrend: MonthlyTrendDataPoint[] = [];
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthKey = format(monthDate, "yyyy-MM");
        const monthLabel = monthNames[monthDate.getMonth()];

        const effectiveEnd = i === 0 ? today : monthEnd;
        let daysInPeriod = 0;
        let periodCompletions = 0;

        let currentDate = new Date(monthStart);
        while (currentDate <= effectiveEnd) {
          daysInPeriod++;
          const dateStr = format(currentDate, "yyyy-MM-dd");
          periodCompletions += completions.filter(
            (c) => c.dateStr === dateStr,
          ).length;
          currentDate = addDays(currentDate, 1);
        }

        const maxPossible = habitCount * daysInPeriod;
        const rate =
          maxPossible > 0
            ? Math.round((periodCompletions / maxPossible) * 100)
            : 0;

        monthlyTrend.push({
          month: monthLabel,
          monthKey,
          rate: Math.min(100, rate),
          completions: periodCompletions,
          possible: maxPossible,
        });
      }

      // ---- PER-HABIT STATS WITH CONSISTENCY METRIC ----
      const habitStats: HabitStatData[] = habits.map((habit) => {
        const habitCompletions = recentCompletions.filter(
          (c) => c.habit_id === habit.id,
        );

        const createdDate = new Date(habit.created_at);
        const daysSinceCreated = Math.min(
          30,
          Math.max(
            1,
            Math.ceil(
              (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          ),
        );

        const rate =
          daysSinceCreated > 0
            ? Math.round((habitCompletions.length / daysSinceCreated) * 100)
            : 0;

        // Calculate consistency stdDev and consistency score
        const { stdDev, consistencyScore } = calculateHabitConsistency(
          habitCompletions.map((c) => c.completed_at),
          30,
        );

        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          rate: Math.min(100, rate),
          completions: habitCompletions.length,
          stdDev: Math.round(stdDev * 100) / 100,
          consistencyScore,
        };
      });

      // ---- CROSS-HABIT CORRELATION ----
      const correlations = calculateHabitCorrelations(
        habits,
        recentCompletions,
        30,
      );

      // ---- AGGREGATE STATS ----
      const totalCompletions = recentCompletions.length;
      const uniqueDays = new Set(recentCompletions.map((c) => c.dateStr));
      const totalDaysTracked = uniqueDays.size;

      // Best individual habit streak using unified streak utility
      let bestStreak = { days: 0, habitName: "-" };
      for (const habit of habits) {
        const hCompletions = recentCompletions
          .filter((c) => c.habit_id === habit.id)
          .map((c) => c.completed_at);

        const { best } = calculatePerHabitStreak(hCompletions);
        if (best > bestStreak.days) {
          bestStreak = { days: best, habitName: habit.name };
        }
      }

      const overallRate =
        habitStats.length > 0
          ? Math.round(
              habitStats.reduce((sum, h) => sum + h.rate, 0) /
                habitStats.length,
            )
          : 0;

      return {
        weeklyData,
        last4WeeksTrend,
        monthlyTrend,
        habitStats,
        correlations,
        totalDaysTracked,
        totalCompletions,
        bestStreak,
        overallRate,
      };
    },
    enabled: !!user,
  });
}
