-- ============================================
-- MIGRATION 004: AI Cache Evolution & DELETE RLS Policy
-- ============================================
-- Adds DELETE RLS policy to public.ai_insights_cache so users can clear/invalidate
-- their cached insights upon explicit trigger or schema migration.
-- Adds source_fingerprint column to track activity invalidation.

ALTER TABLE public.ai_insights_cache
  ADD COLUMN IF NOT EXISTS source_fingerprint TEXT;

-- Policy: Users can delete their own cached insights
DROP POLICY IF EXISTS "Users can delete their own AI insights cache" ON public.ai_insights_cache;
CREATE POLICY "Users can delete their own AI insights cache"
  ON public.ai_insights_cache
  FOR DELETE
  USING (auth.uid() = user_id);
