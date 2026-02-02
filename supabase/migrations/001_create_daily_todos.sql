-- ============================================
-- DAILY TODOS TABLE
-- ============================================
-- This migration creates the daily_todos table for the Daily To-Do List feature.
-- Run this SQL in the Supabase SQL Editor.

-- Create the daily_todos table
CREATE TABLE IF NOT EXISTS public.daily_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create an index for faster queries by user_id and task_date
CREATE INDEX IF NOT EXISTS idx_daily_todos_user_date 
  ON public.daily_todos (user_id, task_date);

-- Enable Row Level Security
ALTER TABLE public.daily_todos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own todos
CREATE POLICY "Users can view their own todos"
  ON public.daily_todos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own todos
CREATE POLICY "Users can insert their own todos"
  ON public.daily_todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own todos
CREATE POLICY "Users can update their own todos"
  ON public.daily_todos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own todos
CREATE POLICY "Users can delete their own todos"
  ON public.daily_todos
  FOR DELETE
  USING (auth.uid() = user_id);
