import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import {
  format,
  subDays,
  parseISO,
  differenceInDays,
  isEqual,
  addDays,
} from "date-fns";

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
  completed_date: string;
  created_at: string;
}

// Get today's date in YYYY-MM-DD format (for database queries)
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Fetch today's completions for the current user's habits
export function useTodayCompletions() {
  const { user } = useAuth();
  const today = getTodayDateString();

  return useQuery({
    queryKey: ["completions", today, user?.id],
    queryFn: async () => {
      // First get user's habit IDs, then get completions for those habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id")
        .eq("is_archived", false);

      if (habitsError) throw habitsError;

      const habitIds = habits?.map((h) => h.id) || [];
      if (habitIds.length === 0) return [];

      const { data, error } = await supabase
        .from("habit_completions")
        .select("*")
        .in("habit_id", habitIds)
        .eq("completed_date", today);

      if (error) throw error;
      return data as HabitCompletion[];
    },
    enabled: !!user,
  });
}

// Toggle a habit completion for today
export function useToggleCompletion() {
  const queryClient = useQueryClient();
  const today = getTodayDateString();

  return useMutation({
    mutationFn: async ({
      habitId,
      isCurrentlyCompleted,
    }: {
      habitId: string;
      isCurrentlyCompleted: boolean;
    }) => {
      if (isCurrentlyCompleted) {
        // Delete the completion
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("completed_date", today);

        if (error) throw error;
      } else {
        // Insert a new completion
        const { error } = await supabase.from("habit_completions").insert({
          habit_id: habitId,
          completed_date: today,
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
// STREAK STATISTICS (Per-Habit)
// ============================================

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  isAtRisk: boolean; // true if streak is from yesterday (not completed today)
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
 * Calculate streak stats for all habits.
 *
 * Streak Algorithm:
 * - currentStreak: Count consecutive completed days ending TODAY.
 *   If habit is NOT completed today, currentStreak = 0.
 * - bestStreak: Maximum consecutive days ever achieved.
 *
 * Uses date-fns for safe date handling to avoid timezone issues.
 */
export function useHabitStreakStats() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["streakStats", user?.id],
    queryFn: async () => {
      // Get user's active habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, name")
        .eq("is_archived", false);

      if (habitsError) throw habitsError;
      if (!habits || habits.length === 0) {
        return { streakMap: {} as HabitStreakMap, habits: [] };
      }

      const habitIds = habits.map((h) => h.id);

      // Fetch completions for last 365 days (sufficient for streak calculation)
      const oneYearAgo = format(subDays(new Date(), 365), "yyyy-MM-dd");

      const { data: completions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_date")
        .in("habit_id", habitIds)
        .gte("completed_date", oneYearAgo)
        .order("completed_date", { ascending: false });

      if (completionsError) throw completionsError;

      return { completions: completions || [], habits };
    },
    enabled: !!user,
  });

  // Memoize streak calculations to avoid recomputing on every render
  const streakData = useMemo(() => {
    if (!query.data) {
      return {
        streakMap: {} as HabitStreakMap,
        overall: {
          bestStreak: { days: 0, habitName: "-", habitId: "" },
          currentStreak: { days: 0, habitName: "-", habitId: "" },
        } as OverallStreakStats,
      };
    }

    const { completions, habits } = query.data;
    if (!completions || !habits) {
      return {
        streakMap: {} as HabitStreakMap,
        overall: {
          bestStreak: { days: 0, habitName: "-", habitId: "" },
          currentStreak: { days: 0, habitName: "-", habitId: "" },
        } as OverallStreakStats,
      };
    }

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const streakMap: HabitStreakMap = {};

    let overallBest = { days: 0, habitName: "-", habitId: "" };
    let overallCurrent = { days: 0, habitName: "-", habitId: "" };

    for (const habit of habits) {
      // Get this habit's completion dates as a Set for O(1) lookup
      const habitCompletionDates = new Set(
        completions
          .filter((c) => c.habit_id === habit.id)
          .map((c) => c.completed_date),
      );

      const completedToday = habitCompletionDates.has(todayStr);
      const completedYesterday = habitCompletionDates.has(yesterdayStr);

      // Calculate current streak with new algorithm:
      // - If completed today: compute streak ending today
      // - Else if completed yesterday: compute streak ending yesterday (at risk)
      // - Else: streak = 0
      let currentStreak = 0;
      let isAtRisk = false;

      if (completedToday) {
        // Streak is active, count from today backwards
        currentStreak = 1;
        let checkDate = subDays(new Date(), 1);

        while (habitCompletionDates.has(format(checkDate, "yyyy-MM-dd"))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }
      } else if (completedYesterday) {
        // Streak is at risk, count from yesterday backwards
        isAtRisk = true;
        currentStreak = 1;
        let checkDate = subDays(new Date(), 2); // Start from day before yesterday

        while (habitCompletionDates.has(format(checkDate, "yyyy-MM-dd"))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }
      }
      // else: currentStreak remains 0

      // Calculate best streak by iterating through sorted dates
      const sortedDates = Array.from(habitCompletionDates).sort();
      let bestStreak = sortedDates.length > 0 ? 1 : 0;
      let tempStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = parseISO(sortedDates[i - 1]);
        const currDate = parseISO(sortedDates[i]);
        const diff = differenceInDays(currDate, prevDate);

        if (diff === 1) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else if (diff > 1) {
          tempStreak = 1;
        }
        // diff === 0 means duplicate date, ignore
      }

      streakMap[habit.id] = {
        currentStreak,
        bestStreak,
        isAtRisk,
        completedToday,
      };

      // Update overall stats
      if (bestStreak > overallBest.days) {
        overallBest = {
          days: bestStreak,
          habitName: habit.name,
          habitId: habit.id,
        };
      }
      if (currentStreak > overallCurrent.days) {
        overallCurrent = {
          days: currentStreak,
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
// STATISTICS
// ============================================

// Get date string for a specific date
function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get the start of the current week (Monday)
function getWeekStartDate(): Date {
  const today = new Date();
  const day = today.getDay();
  // Adjust so Monday = 0, Sunday = 6
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get number of days elapsed this week (1 = Monday only, 7 = full week)
function getDaysElapsedThisWeek(): number {
  const today = new Date();
  const day = today.getDay();
  // Monday = 1, Tuesday = 2, ..., Sunday = 7
  return day === 0 ? 7 : day;
}

// Fetch statistics: streak and weekly completion rate
export function useHabitStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      // Get user's active habits
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

      // Fetch all completions for the last 30 days (for streak calculation)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: allCompletions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_date")
        .in("habit_id", habitIds)
        .gte("completed_date", getDateString(thirtyDaysAgo))
        .order("completed_date", { ascending: false });

      if (completionsError) throw completionsError;

      // Group completions by date
      const completionsByDate = new Map<string, Set<string>>();
      for (const c of allCompletions || []) {
        if (!completionsByDate.has(c.completed_date)) {
          completionsByDate.set(c.completed_date, new Set());
        }
        completionsByDate.get(c.completed_date)!.add(c.habit_id);
      }

      // Calculate streak: consecutive days where ALL habits were completed
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = getDateString(checkDate);

        const completedHabits = completionsByDate.get(dateStr);
        const completedCount = completedHabits?.size || 0;

        if (completedCount === habitCount) {
          streak++;
        } else {
          // Streak breaks - but don't count today if it's incomplete
          // (user might still complete habits today)
          if (i === 0) {
            continue; // Skip today, check yesterday
          }
          break;
        }
      }

      // Calculate weekly completion percentage
      const weekStart = getWeekStartDate();
      const daysElapsed = getDaysElapsedThisWeek();

      let weeklyCompletions = 0;
      for (let i = 0; i < daysElapsed; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);
        const dateStr = getDateString(checkDate);

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

export interface MonthlyDataPoint {
  week: string;
  rate: number;
}

export interface HabitStatData {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  completions: number;
}

export interface AnalyticsData {
  weeklyData: WeeklyDataPoint[];
  monthlyData: MonthlyDataPoint[];
  habitStats: HabitStatData[];
  totalDaysTracked: number;
  totalCompletions: number;
  bestStreak: { days: number; habitName: string };
  overallRate: number;
}

// Fetch comprehensive analytics data
export function useAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get user's active habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, name, emoji, created_at")
        .eq("is_archived", false)
        .order("created_at", { ascending: true });

      if (habitsError) throw habitsError;

      if (!habits || habits.length === 0) {
        return {
          weeklyData: [],
          monthlyData: [],
          habitStats: [],
          totalDaysTracked: 0,
          totalCompletions: 0,
          bestStreak: { days: 0, habitName: "-" },
          overallRate: 0,
        };
      }

      const habitIds = habits.map((h) => h.id);
      const habitCount = habits.length;

      // Fetch all completions for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: allCompletions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_date")
        .in("habit_id", habitIds)
        .gte("completed_date", getDateString(thirtyDaysAgo))
        .order("completed_date", { ascending: true });

      if (completionsError) throw completionsError;

      const completions = allCompletions || [];

      // ---- WEEKLY DATA (Last 7 days) ----
      const weeklyData: WeeklyDataPoint[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const dayName = dayNames[date.getDay()];

        const dayCompletions = completions.filter(
          (c) => c.completed_date === dateStr,
        ).length;

        weeklyData.push({
          day: dayName,
          completed: dayCompletions,
          total: habitCount,
        });
      }

      // ---- MONTHLY DATA (4 weeks) ----
      const monthlyData: MonthlyDataPoint[] = [];

      for (let week = 3; week >= 0; week--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (week * 7 + 6));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - week * 7);

        let weekCompletions = 0;
        let daysInWeek = 0;

        for (let d = 0; d < 7; d++) {
          const checkDate = new Date(weekStart);
          checkDate.setDate(weekStart.getDate() + d);

          // Don't count future days
          if (checkDate > new Date()) break;

          daysInWeek++;
          const dateStr = getDateString(checkDate);
          weekCompletions += completions.filter(
            (c) => c.completed_date === dateStr,
          ).length;
        }

        const maxPossible = habitCount * daysInWeek;
        const rate =
          maxPossible > 0
            ? Math.round((weekCompletions / maxPossible) * 100)
            : 0;

        monthlyData.push({
          week: `Week ${4 - week}`,
          rate: Math.min(100, rate),
        });
      }

      // ---- PER-HABIT STATS ----
      const habitStats: HabitStatData[] = habits.map((habit) => {
        const habitCompletions = completions.filter(
          (c) => c.habit_id === habit.id,
        ).length;

        // Calculate rate based on days since habit was created (max 30)
        const createdDate = new Date(habit.created_at);
        const today = new Date();
        const daysSinceCreated = Math.min(
          30,
          Math.ceil(
            (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        const rate =
          daysSinceCreated > 0
            ? Math.round((habitCompletions / daysSinceCreated) * 100)
            : 0;

        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          rate: Math.min(100, rate),
          completions: habitCompletions,
        };
      });

      // ---- AGGREGATE STATS ----
      const totalCompletions = completions.length;

      // Count unique days with at least one completion
      const uniqueDays = new Set(completions.map((c) => c.completed_date));
      const totalDaysTracked = uniqueDays.size;

      // Find best individual habit streak
      let bestStreak = { days: 0, habitName: "-" };

      for (const habit of habits) {
        const habitCompletionDates = new Set(
          completions
            .filter((c) => c.habit_id === habit.id)
            .map((c) => c.completed_date),
        );

        let currentStreak = 0;
        let maxStreak = 0;

        for (let i = 0; i < 30; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = getDateString(checkDate);

          if (habitCompletionDates.has(dateStr)) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }

        if (maxStreak > bestStreak.days) {
          bestStreak = { days: maxStreak, habitName: habit.name };
        }
      }

      // Overall completion rate
      const overallRate =
        habitStats.length > 0
          ? Math.round(
              habitStats.reduce((sum, h) => sum + h.rate, 0) /
                habitStats.length,
            )
          : 0;

      return {
        weeklyData,
        monthlyData,
        habitStats,
        totalDaysTracked,
        totalCompletions,
        bestStreak,
        overallRate,
      };
    },
    enabled: !!user,
  });
}
