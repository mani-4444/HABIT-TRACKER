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
    },
  });
}
