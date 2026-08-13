-- ============================================
-- HABITS AND HABIT COMPLETIONS TABLES
-- ============================================
-- This migration creates or updates the habits and habit_completions tables.
-- Run this SQL in the Supabase SQL Editor.

-- Create habits table if not existing
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '⭐',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create habit_completions table using completed_at (TIMESTAMPTZ) if not existing
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If habit_completions already existed with legacy completed_date column, add completed_at and backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'habit_completions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'habit_completions' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.habit_completions ADD COLUMN completed_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Always backfill completed_at from completed_date if completed_date column exists and drop NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'habit_completions' AND column_name = 'completed_date'
  ) THEN
    EXECUTE 'UPDATE public.habit_completions SET completed_at = (completed_date::text || '' 12:00:00+00'')::timestamptz WHERE completed_date IS NOT NULL';
    EXECUTE 'ALTER TABLE public.habit_completions ALTER COLUMN completed_date DROP NOT NULL';
  END IF;
END $$;

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id 
  ON public.habits (user_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_completed_at 
  ON public.habit_completions (habit_id, completed_at);

-- Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits (drop if exists to allow re-running safely)
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits"
  ON public.habits
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
CREATE POLICY "Users can insert their own habits"
  ON public.habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
CREATE POLICY "Users can update their own habits"
  ON public.habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can delete their own habits"
  ON public.habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_completions (scoped via join to habits table)
DROP POLICY IF EXISTS "Users can view completions for their habits" ON public.habit_completions;
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

DROP POLICY IF EXISTS "Users can insert completions for their habits" ON public.habit_completions;
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

DROP POLICY IF EXISTS "Users can update completions for their habits" ON public.habit_completions;
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

DROP POLICY IF EXISTS "Users can delete completions for their habits" ON public.habit_completions;
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
