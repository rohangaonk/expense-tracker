-- ============================================================
-- Script B: Drop deprecated flag columns + rewrite RPC functions
-- Run this AFTER Script A (backfill) has been verified.
-- ============================================================


-- ── Step 1: Drop deprecated boolean columns ───────────────────
ALTER TABLE expenses
  DROP COLUMN IF EXISTS is_recurring,
  DROP COLUMN IF EXISTS recurrence_period,
  DROP COLUMN IF EXISTS is_gym,
  DROP COLUMN IF EXISTS is_house,
  DROP COLUMN IF EXISTS is_parents;


-- ── Step 2: Drop old RPC functions (both old signatures) ──────
DROP FUNCTION IF EXISTS get_expense_stats(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_chart_data(UUID, DATE, DATE);


-- ── Step 3: New get_expense_stats ─────────────────────────────
-- Returns per-category totals + counts, plus a grand total row.
-- The app reads this as an array of rows keyed by category.
CREATE OR REPLACE FUNCTION get_expense_stats(
  p_user_id   UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date   DATE DEFAULT NULL
)
RETURNS TABLE (
  category      TEXT,
  total_amount  NUMERIC,
  expense_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.category,
    COALESCE(SUM(e.amount), 0)  AS total_amount,
    COUNT(*)                     AS expense_count
  FROM expenses e
  WHERE e.user_id = p_user_id
    AND (p_start_date IS NULL OR e.date >= p_start_date)
    AND (p_end_date   IS NULL OR e.date <= p_end_date)
  GROUP BY e.category
  ORDER BY total_amount DESC;
END;
$$;


-- ── Step 4: New get_chart_data ────────────────────────────────
-- Unchanged in behaviour — no flag columns were referenced.
-- Recreated cleanly after the DROP above.
CREATE OR REPLACE FUNCTION get_chart_data(
  p_user_id    UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date   DATE DEFAULT NULL
)
RETURNS TABLE (
  date   DATE,
  amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.date,
    e.amount
  FROM expenses e
  WHERE e.user_id = p_user_id
    AND (p_start_date IS NULL OR e.date >= p_start_date)
    AND (p_end_date   IS NULL OR e.date <= p_end_date)
  ORDER BY e.date DESC;
END;
$$;


-- ── Verification queries ──────────────────────────────────────
-- Run these after applying the script to confirm all is well.

-- 1. Confirm flag columns are gone:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'expenses'
-- ORDER BY ordinal_position;

-- 2. Confirm new RPC returns correct shape:
-- SELECT * FROM get_expense_stats('<your-user-id>');
