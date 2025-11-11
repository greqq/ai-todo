-- Add morning plan confirmation tracking to daily_reflections table
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS morning_plan_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS morning_plan_confirmed_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_reflections_morning_plan
ON daily_reflections(user_id, date, morning_plan_confirmed);
