import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
    },
  });
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
