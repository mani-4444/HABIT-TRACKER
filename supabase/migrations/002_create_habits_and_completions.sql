-- ============================================
-- HABITS AND HABIT COMPLETIONS TABLES
-- ============================================
-- This migration creates the habits and habit_completions tables.
-- Run this SQL in the Supabase SQL Editor.

-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '⭐',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create habit_completions table using completed_at (TIMESTAMPTZ)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id 
  ON public.habits (user_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_completed_at 
  ON public.habit_completions (habit_id, completed_at);

-- Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON public.habits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON public.habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_completions (scoped via join to habits table)
CREATE POLICY "Users can view completions for their habits"
  ON public.habit_completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_completions.habit_id
        AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert completions for their habits"
  ON public.habit_completions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_completions.habit_id
        AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update completions for their habits"
  ON public.habit_completions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_completions.habit_id
        AND habits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_completions.habit_id
        AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete completions for their habits"
  ON public.habit_completions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE habits.id = habit_completions.habit_id
        AND habits.user_id = auth.uid()
    )
  );
