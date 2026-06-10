-- Fix get_expense_stats to correctly handle gym/parents/house as
-- category flags that are independent of is_recurring.
--
-- Root cause of the bug:
--   1. The old function from 20260122000000 had no is_gym exclusion,
--      so gym expenses leaked into regular_total.
--   2. The function from 20260606000000 added is_gym support but the
--      gym/parents/house filters all require is_recurring = false,
--      meaning any recurring expense tagged as gym/parents goes into
--      recurring_total and is invisible to the gym/parents chips.
--
-- Fix: gym/parents/house are pure CATEGORY tags. They should be counted
-- based solely on their flag, regardless of is_recurring. The dashboard
-- chips show "how much you spent on gym/parents/house" not "how much
-- non-recurring gym spending". recurring_total still captures ALL
-- recurring expenses (including gym/parents ones) for the recurring chip.

DROP FUNCTION IF EXISTS get_expense_stats(UUID, DATE, DATE);

CREATE OR REPLACE FUNCTION get_expense_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_amount NUMERIC,
  recurring_total NUMERIC,
  recurring_count BIGINT,
  house_total NUMERIC,
  house_count BIGINT,
  parents_total NUMERIC,
  parents_count BIGINT,
  gym_total NUMERIC,
  gym_count BIGINT,
  regular_total NUMERIC,
  regular_count BIGINT,
  non_recurring_total NUMERIC,
  non_recurring_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_expenses AS (
    SELECT 
      amount,
      is_recurring,
      COALESCE(is_house, FALSE)   AS is_house,
      COALESCE(is_parents, FALSE) AS is_parents,
      COALESCE(is_gym, FALSE)     AS is_gym
    FROM expenses
    WHERE user_id = p_user_id
      AND (p_start_date IS NULL OR date >= p_start_date)
      AND (p_end_date IS NULL OR date <= p_end_date)
  )
  SELECT
    -- Total (all expenses regardless of any tag)
    COALESCE(SUM(amount), 0) as total_amount,

    -- Recurring: all expenses marked recurring (any category tag)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = true), 0) as recurring_total,
    COUNT(*)                 FILTER (WHERE is_recurring = true)  as recurring_count,

    -- House: ALL expenses tagged house (recurring or not)
    COALESCE(SUM(amount) FILTER (WHERE is_house = true), 0) as house_total,
    COUNT(*)                 FILTER (WHERE is_house = true)  as house_count,

    -- Parents: ALL expenses tagged parents (recurring or not)
    COALESCE(SUM(amount) FILTER (WHERE is_parents = true), 0) as parents_total,
    COUNT(*)                 FILTER (WHERE is_parents = true)  as parents_count,

    -- Gym: ALL expenses tagged gym (recurring or not)
    COALESCE(SUM(amount) FILTER (WHERE is_gym = true), 0) as gym_total,
    COUNT(*)                 FILTER (WHERE is_gym = true)  as gym_count,

    -- Regular: non-recurring AND none of the special category tags
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false AND is_gym = false), 0) as regular_total,
    COUNT(*)                 FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false AND is_gym = false)  as regular_count,

    -- Non-recurring total
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false), 0) as non_recurring_total,
    COUNT(*)                 FILTER (WHERE is_recurring = false)  as non_recurring_count

  FROM filtered_expenses;
END;
$$;
