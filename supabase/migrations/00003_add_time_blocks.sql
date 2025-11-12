-- ============================================
-- TIME BLOCKS TABLE
-- ============================================
-- Time blocks represent protected/scheduled time periods
-- Examples: "Deep work 9-11 AM", "Family dinner 6-7 PM", "Meeting 2-3 PM"

CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Block Details
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT,

  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Type of block
  block_type TEXT CHECK (block_type IN ('work', 'personal', 'focus', 'buffer', 'meeting', 'break')) DEFAULT 'work',

  -- Is this a protected/fixed block?
  is_protected BOOLEAN DEFAULT false,

  -- Associated task (if any)
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  parent_recurring_block_id UUID,

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_time_blocks_user_id ON time_blocks(user_id);
CREATE INDEX idx_time_blocks_user_time ON time_blocks(user_id, start_time, end_time);
CREATE INDEX idx_time_blocks_task_id ON time_blocks(task_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_time_blocks_updated_at
BEFORE UPDATE ON time_blocks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time blocks" ON time_blocks
FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can insert own time blocks" ON time_blocks
FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can update own time blocks" ON time_blocks
FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can delete own time blocks" ON time_blocks
FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to detect overlapping time blocks
CREATE OR REPLACE FUNCTION detect_time_block_conflicts(
  p_user_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_block_id UUID DEFAULT NULL
)
RETURNS TABLE(
  block_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  block_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tb.id,
    tb.title,
    tb.start_time,
    tb.end_time,
    tb.block_type
  FROM time_blocks tb
  WHERE
    tb.user_id = p_user_id
    AND (p_exclude_block_id IS NULL OR tb.id != p_exclude_block_id)
    AND (
      -- New block starts during existing block
      (p_start_time >= tb.start_time AND p_start_time < tb.end_time)
      OR
      -- New block ends during existing block
      (p_end_time > tb.start_time AND p_end_time <= tb.end_time)
      OR
      -- New block completely contains existing block
      (p_start_time <= tb.start_time AND p_end_time >= tb.end_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to detect overlapping tasks
CREATE OR REPLACE FUNCTION detect_task_conflicts(
  p_user_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_task_id UUID DEFAULT NULL
)
RETURNS TABLE(
  task_id UUID,
  title TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  goal_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.scheduled_start,
    t.scheduled_end,
    t.goal_id
  FROM tasks t
  WHERE
    t.user_id = p_user_id
    AND t.status NOT IN ('completed', 'cancelled')
    AND t.scheduled_start IS NOT NULL
    AND t.scheduled_end IS NOT NULL
    AND (p_exclude_task_id IS NULL OR t.id != p_exclude_task_id)
    AND (
      -- New time starts during existing task
      (p_start_time >= t.scheduled_start AND p_start_time < t.scheduled_end)
      OR
      -- New time ends during existing task
      (p_end_time > t.scheduled_start AND p_end_time <= t.scheduled_end)
      OR
      -- New time completely contains existing task
      (p_start_time <= t.scheduled_start AND p_end_time >= t.scheduled_end)
    );
END;
$$ LANGUAGE plpgsql;
