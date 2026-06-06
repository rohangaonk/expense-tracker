-- Add gym flag to expenses table
ALTER TABLE expenses
ADD COLUMN is_gym BOOLEAN DEFAULT FALSE;

-- Update existing rows to false (DEFAULT handles new rows, but explicit for clarity)
UPDATE expenses SET is_gym = FALSE WHERE is_gym IS NULL;

-- Drop and recreate get_expense_stats (return type changed — new gym_total/gym_count columns)
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
      COALESCE(is_house, FALSE) AS is_house,
      COALESCE(is_parents, FALSE) AS is_parents,
      COALESCE(is_gym, FALSE) AS is_gym
    FROM expenses
    WHERE user_id = p_user_id
      AND (p_start_date IS NULL OR date >= p_start_date)
      AND (p_end_date IS NULL OR date <= p_end_date)
  )
  SELECT
    -- Total amount
    COALESCE(SUM(amount), 0) as total_amount,
    
    -- Recurring stats
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = true), 0) as recurring_total,
    COUNT(*) FILTER (WHERE is_recurring = true) as recurring_count,
    
    -- House stats (non-recurring)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_house = true), 0) as house_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_house = true) as house_count,
    
    -- Parents stats (non-recurring)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_parents = true), 0) as parents_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_parents = true) as parents_count,
    
    -- Gym stats (non-recurring)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_gym = true), 0) as gym_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_gym = true) as gym_count,
    
    -- Regular stats (non-recurring, not house, not parents, not gym)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false AND is_gym = false), 0) as regular_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false AND is_gym = false) as regular_count,
    
    -- Non-recurring total
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false), 0) as non_recurring_total,
    COUNT(*) FILTER (WHERE is_recurring = false) as non_recurring_count
  FROM filtered_expenses;
END;
$$;
