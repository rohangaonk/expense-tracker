-- Create function to get expense statistics without fetching all records
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
      is_house,
      is_parents
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
    
    -- House stats
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_house = true), 0) as house_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_house = true) as house_count,
    
    -- Parents stats
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_parents = true), 0) as parents_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_parents = true) as parents_count,
    
    -- Regular stats (non-recurring, not house, not parents)
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false), 0) as regular_total,
    COUNT(*) FILTER (WHERE is_recurring = false AND is_house = false AND is_parents = false) as regular_count,
    
    -- Non-recurring total
    COALESCE(SUM(amount) FILTER (WHERE is_recurring = false), 0) as non_recurring_total,
    COUNT(*) FILTER (WHERE is_recurring = false) as non_recurring_count
  FROM filtered_expenses;
END;
$$;

-- Create function to get minimal chart data
CREATE OR REPLACE FUNCTION get_chart_data(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
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
    AND (p_end_date IS NULL OR e.date <= p_end_date)
  ORDER BY e.date DESC;
END;
$$;
