-- Add flags for House and Parents expenses
ALTER TABLE expenses 
ADD COLUMN is_house BOOLEAN DEFAULT FALSE,
ADD COLUMN is_parents BOOLEAN DEFAULT FALSE;

-- Update existing rows to default false (handled by DEFAULT, but good to be explicit if needed, though Postgres handles it)
