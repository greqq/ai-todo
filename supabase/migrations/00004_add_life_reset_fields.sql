-- Migration: Add Life Reset Guide fields to support enhanced onboarding
-- Date: 2025-11-14
-- Description: Adds fields for Life Reset Guide interview data including vision statement,
--              anti-patterns, energy preferences, and routine support

-- Add Life Reset fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS vision_statement TEXT,
ADD COLUMN IF NOT EXISTS anti_patterns JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS energy_preferences JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN users.vision_statement IS 'User''s life vision statement generated from Life Reset interview';
COMMENT ON COLUMN users.anti_patterns IS 'Array of patterns/situations user wants to avoid (work, lifestyle, relationships, etc.)';
COMMENT ON COLUMN users.energy_preferences IS 'User''s energy patterns and preferences (peak times, draining activities, etc.)';

-- Add routine support fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_routine BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS routine_type TEXT CHECK (routine_type IN ('morning', 'evening', NULL)),
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', NULL));

-- Add comments
COMMENT ON COLUMN tasks.is_routine IS 'Whether this task is part of a morning/evening routine';
COMMENT ON COLUMN tasks.routine_type IS 'Type of routine: morning or evening';
COMMENT ON COLUMN tasks.recurrence_pattern IS 'How often the routine recurs: daily, weekly, monthly';

-- Create index for routine tasks
CREATE INDEX IF NOT EXISTS idx_tasks_routine ON tasks(user_id, is_routine, routine_type) WHERE is_routine = TRUE;

-- Add goal category field to support primary vs secondary goals
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS goal_category TEXT DEFAULT 'primary' CHECK (goal_category IN ('primary', 'secondary', 'lifestyle'));

COMMENT ON COLUMN goals.goal_category IS 'Goal category: primary (main focus), secondary (supporting), lifestyle (habits)';

-- Create index for goal category
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(user_id, goal_category);
