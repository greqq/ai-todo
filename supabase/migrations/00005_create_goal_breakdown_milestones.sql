-- Migration: Create goal_breakdown_milestones table
-- Purpose: Store AI-generated breakdown of goals into time-based milestones
-- Date: 2025-11-15

-- Create goal_breakdown_milestones table
CREATE TABLE IF NOT EXISTS goal_breakdown_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Milestone period type
  period_type TEXT NOT NULL CHECK (period_type IN ('12_month', '6_month', '3_month', '1_month', 'weekly')),

  -- Milestone details
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_percentage_target INTEGER DEFAULT 0 CHECK (completion_percentage_target >= 0 AND completion_percentage_target <= 100),

  -- Key deliverables for this milestone
  key_deliverables JSONB DEFAULT '[]'::jsonb,

  -- Ordering and status
  order_index INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_breakdown_milestones_goal_id ON goal_breakdown_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_milestones_user_id ON goal_breakdown_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_milestones_period_type ON goal_breakdown_milestones(period_type);
CREATE INDEX IF NOT EXISTS idx_breakdown_milestones_target_date ON goal_breakdown_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_breakdown_milestones_completed ON goal_breakdown_milestones(completed);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_breakdown_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_breakdown_milestones_updated_at
  BEFORE UPDATE ON goal_breakdown_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_breakdown_milestones_updated_at();

-- Enable Row Level Security
ALTER TABLE goal_breakdown_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own breakdown milestones
CREATE POLICY "Users can view their own breakdown milestones"
  ON goal_breakdown_milestones
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own breakdown milestones"
  ON goal_breakdown_milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own breakdown milestones"
  ON goal_breakdown_milestones
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own breakdown milestones"
  ON goal_breakdown_milestones
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE goal_breakdown_milestones IS 'Stores AI-generated time-based breakdown of goals (12mo, 6mo, 3mo, 1mo, weekly milestones)';
