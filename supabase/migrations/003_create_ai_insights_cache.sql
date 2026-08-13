-- ============================================
-- AI INSIGHTS CACHE TABLE
-- ============================================
-- Stores the most recent AI insights result per user to prevent repeated
-- Groq API calls. Cached results are considered fresh for 6 hours.
-- Run this SQL in the Supabase SQL Editor.

-- Create the cache table (one row per user, upserted on each fresh generation)
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  insights     JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own cached insights
DROP POLICY IF EXISTS "Users can view their own AI insights cache" ON public.ai_insights_cache;
CREATE POLICY "Users can view their own AI insights cache"
  ON public.ai_insights_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own cached insights
DROP POLICY IF EXISTS "Users can insert their own AI insights cache" ON public.ai_insights_cache;
CREATE POLICY "Users can insert their own AI insights cache"
  ON public.ai_insights_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cached insights
DROP POLICY IF EXISTS "Users can update their own AI insights cache" ON public.ai_insights_cache;
CREATE POLICY "Users can update their own AI insights cache"
  ON public.ai_insights_cache
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
