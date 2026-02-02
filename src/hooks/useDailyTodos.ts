import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

// ============================================
// TYPES
// ============================================

export interface DailyTodo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  task_date: string;
  created_at: string;
}

export type DailyTodoInsert = {
  title: string;
  task_date: string;
};

// ============================================
// HELPERS
// ============================================

/**
 * Get today's date in YYYY-MM-DD format for database queries
 */
export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// ============================================
// HOOKS
// ============================================

/**
 * Fetch all todos for a specific date (defaults to today)
 */
export function useDailyTodos(date?: string) {
  const { user } = useAuth();
  const targetDate = date || getTodayDateString();

  return useQuery({
    queryKey: ["daily-todos", targetDate, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_todos")
        .select("*")
        .eq("task_date", targetDate)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as DailyTodo[];
    },
    enabled: !!user,
  });
}

/**
 * Add a new daily todo
 */
export function useAddDailyTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (todo: DailyTodoInsert) => {
      const { data, error } = await supabase
        .from("daily_todos")
        .insert({
          user_id: user?.id,
          title: todo.title,
          task_date: todo.task_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DailyTodo;
    },
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["daily-todos", newTodo.task_date],
      });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<DailyTodo[]>([
        "daily-todos",
        newTodo.task_date,
        user?.id,
      ]);

      // Optimistically add the new todo
      const optimisticTodo: DailyTodo = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || "",
        title: newTodo.title,
        completed: false,
        task_date: newTodo.task_date,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<DailyTodo[]>(
        ["daily-todos", newTodo.task_date, user?.id],
        (old) => [...(old || []), optimisticTodo],
      );

      return { previousTodos };
    },
    onError: (_err, newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["daily-todos", newTodo.task_date, user?.id],
          context.previousTodos,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-todos", variables.task_date],
      });
    },
  });
}

/**
 * Toggle the completed state of a todo
 */
export function useToggleDailyTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      completed,
      task_date,
    }: {
      id: string;
      completed: boolean;
      task_date: string;
    }) => {
      const { data, error } = await supabase
        .from("daily_todos")
        .update({ completed })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DailyTodo;
    },
    onMutate: async ({ id, completed, task_date }) => {
      await queryClient.cancelQueries({
        queryKey: ["daily-todos", task_date],
      });

      const previousTodos = queryClient.getQueryData<DailyTodo[]>([
        "daily-todos",
        task_date,
        user?.id,
      ]);

      // Optimistically update
      queryClient.setQueryData<DailyTodo[]>(
        ["daily-todos", task_date, user?.id],
        (old) =>
          old?.map((todo) =>
            todo.id === id ? { ...todo, completed } : todo,
          ) || [],
      );

      return { previousTodos };
    },
    onError: (_err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["daily-todos", variables.task_date, user?.id],
          context.previousTodos,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-todos", variables.task_date],
      });
    },
  });
}

/**
 * Delete a daily todo
 */
export function useDeleteDailyTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      task_date,
    }: {
      id: string;
      task_date: string;
    }) => {
      const { error } = await supabase
        .from("daily_todos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async ({ id, task_date }) => {
      await queryClient.cancelQueries({
        queryKey: ["daily-todos", task_date],
      });

      const previousTodos = queryClient.getQueryData<DailyTodo[]>([
        "daily-todos",
        task_date,
        user?.id,
      ]);

      // Optimistically remove
      queryClient.setQueryData<DailyTodo[]>(
        ["daily-todos", task_date, user?.id],
        (old) => old?.filter((todo) => todo.id !== id) || [],
      );

      return { previousTodos };
    },
    onError: (_err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["daily-todos", variables.task_date, user?.id],
          context.previousTodos,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-todos", variables.task_date],
      });
    },
  });
}
