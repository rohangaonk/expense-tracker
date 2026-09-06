-- ============================================================
-- Migration: Optimize Indexes & Remove Offline Remnants
-- Run manually in Supabase SQL Editor
-- ============================================================

-- 1. Drop redundant older index (superseded by composite index below)
DROP INDEX IF EXISTS idx_expenses_user_date;

-- 2. Index for fast date-range filtering and descending sort (used on Dashboard & pagination)
CREATE INDEX IF NOT EXISTS idx_expenses_user_date_created 
  ON expenses(user_id, date DESC, created_at DESC);

-- 3. Index for category-filtered date-range queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_cat_date 
  ON expenses(user_id, category, date DESC);

-- 4. Drop unused sync_queue table from earlier offline attempts
DROP TABLE IF EXISTS sync_queue;

-- 5. Drop is_synced column from expenses table (no longer used)
ALTER TABLE expenses 
  DROP COLUMN IF EXISTS is_synced;
