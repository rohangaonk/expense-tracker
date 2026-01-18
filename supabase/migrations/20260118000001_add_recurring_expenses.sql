-- Add recurring expense support
-- Migration: 20260118000001_add_recurring_expenses

-- Add columns for recurring expense tracking
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_period TEXT CHECK (recurrence_period IN ('daily', 'weekly', 'monthly', 'yearly'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_is_recurring ON expenses(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);

-- Add comment for documentation
COMMENT ON COLUMN expenses.is_recurring IS 'Whether this expense is a recurring expense (e.g., subscriptions)';
COMMENT ON COLUMN expenses.recurrence_period IS 'How often the expense recurs: daily, weekly, monthly, or yearly';
