# Task 2: Supabase Database Setup

## Objective
Create and configure the Supabase project with complete database schema, Row Level Security policies, indexes, and helper functions.

## Prerequisites
- Task 1 completed (Project Setup)
- Supabase account created

## What to Build
1. Create Supabase project
2. Set up database schema (all tables)
3. Configure Row Level Security (RLS) policies
4. Create database indexes for performance
5. Add helper functions
6. Setup Supabase clients in Next.js
7. Create TypeScript types from database

## Technical Implementation

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Save these credentials to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Database Schema

Go to Supabase SQL Editor and run this complete schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Profile
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  
  -- Preferences (stored as JSONB)
  preferences JSONB DEFAULT '{
    "work_hours_start": "09:00",
    "work_hours_end": "17:00",
    "energy_peak_time": "morning",
    "default_task_duration": 60,
    "pomodoro_duration": 25,
    "daily_task_limit": 5,
    "enable_notifications": true,
    "enable_email_reminders": true
  }'::jsonb,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_mode TEXT CHECK (onboarding_mode IN ('quick', 'deep')) DEFAULT NULL,
  onboarding_data JSONB DEFAULT '{}'::jsonb,
  
  -- Analytics
  total_tasks_completed INTEGER DEFAULT 0,
  total_goals_completed INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0
);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Goal Details
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT,
  type TEXT CHECK (type IN ('career', 'health', 'financial', 'relationships', 'personal_growth', 'creative', 'other')) DEFAULT 'other',
  
  -- Hierarchy
  parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('vision', 'long_term', 'quarterly', 'monthly', 'weekly')) DEFAULT 'long_term',
  
  -- Timeline
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Priority & Status
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'on_hold', 'completed', 'archived')) DEFAULT 'active',
  
  -- Success Criteria
  success_criteria TEXT[],
  
  -- AI-Generated
  smart_analysis JSONB,
  
  -- Progress (calculated fields)
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_time_invested INTEGER DEFAULT 0
);

-- ============================================
-- MILESTONES TABLE
-- ============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  order_index INTEGER DEFAULT 0
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Task Details
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT,
  
  -- Scheduling
  due_date TIMESTAMPTZ,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  deadline_type TEXT CHECK (deadline_type IN ('hard', 'flexible', 'none')) DEFAULT 'flexible',
  
  -- Duration
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')) DEFAULT 'todo',
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Priority & Energy
  priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')) DEFAULT 'medium',
  task_type TEXT CHECK (task_type IN ('deep_work', 'admin', 'communication', 'learning', 'creative', 'physical', 'planning')) DEFAULT 'admin',
  
  -- Eisenhower Matrix
  eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important')),
  ai_quadrant_reasoning TEXT,
  
  -- Context
  context_tags TEXT[],
  location TEXT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  parent_recurring_task_id UUID,
  
  -- Source & Dependencies
  source TEXT CHECK (source IN ('ai_generated', 'user_created', 'backlog_promoted', 'recurring')) DEFAULT 'user_created',
  depends_on_task_ids UUID[],
  blocking_task_ids UUID[],
  
  -- Procrastination Tracking
  times_postponed INTEGER DEFAULT 0,
  first_postponed_at TIMESTAMPTZ,
  postponement_reasons TEXT[],
  is_procrastination_flagged BOOLEAN DEFAULT false,
  
  -- Energy Impact
  energy_impact TEXT CHECK (energy_impact IN ('energizing', 'neutral', 'draining'))
);

-- ============================================
-- BACKLOG TABLE
-- ============================================
CREATE TABLE backlog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('idea', 'task', 'project', 'research', 'learn')) DEFAULT 'idea',
  priority TEXT CHECK (priority IN ('nice_to_have', 'important', 'critical')) DEFAULT 'nice_to_have',
  status TEXT CHECK (status IN ('new', 'reviewing', 'ready', 'parked')) DEFAULT 'new',
  
  -- AI Analysis
  ai_suggested_schedule_date DATE,
  ai_eisenhower_quadrant TEXT,
  ai_effort_estimate TEXT CHECK (ai_effort_estimate IN ('small', 'medium', 'large')),
  ai_impact_score INTEGER CHECK (ai_impact_score >= 0 AND ai_impact_score <= 10),
  
  -- Lifecycle
  promoted_to_task_id UUID REFERENCES tasks(id),
  promoted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  archive_reason TEXT
);

-- ============================================
-- DAILY REFLECTIONS TABLE
-- ============================================
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Completion Stats
  tasks_completed INTEGER DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  completion_rate DECIMAL(3,2),
  
  -- User Reflections
  what_went_well TEXT,
  what_blocked_me TEXT,
  energy_level_end_of_day INTEGER CHECK (energy_level_end_of_day >= 1 AND energy_level_end_of_day <= 10),
  
  -- AI Analysis
  ai_insights TEXT,
  ai_suggestions TEXT[],
  
  -- Mood/Energy
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'struggling', 'bad')),
  focus_quality INTEGER CHECK (focus_quality >= 1 AND focus_quality <= 10),
  
  UNIQUE(user_id, date)
);

-- ============================================
-- ENERGY LOGS TABLE
-- ============================================
CREATE TABLE energy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  time_of_day TEXT CHECK (time_of_day IN ('early_morning', 'morning', 'midday', 'afternoon', 'evening', 'night')),
  context TEXT,
  
  -- Task association
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  task_was_energizing BOOLEAN
);

-- ============================================
-- WEEKLY SUMMARIES TABLE
-- ============================================
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Stats
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_planned INTEGER DEFAULT 0,
  completion_rate DECIMAL(3,2),
  total_time_invested_minutes INTEGER DEFAULT 0,
  average_daily_tasks DECIMAL(4,2),
  days_with_80_percent_completion INTEGER DEFAULT 0,
  
  -- Per Goal Stats
  goal_progress JSONB,
  
  -- Energy Stats
  average_energy_level DECIMAL(3,2),
  most_energizing_task_types TEXT[],
  most_draining_task_types TEXT[],
  
  -- Patterns
  most_productive_days TEXT[],
  most_productive_times TEXT[],
  
  -- AI Insights
  key_wins TEXT[],
  challenges TEXT[],
  patterns_detected TEXT[],
  suggestions_for_next_week TEXT[],
  goals_needing_attention UUID[],
  
  -- Backlog Review
  backlog_items_suggested UUID[],
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  new_personal_bests TEXT[],
  
  UNIQUE(user_id, week_start_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

-- Goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);

-- Tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);

-- Backlog
CREATE INDEX idx_backlog_user_id ON backlog_items(user_id);
CREATE INDEX idx_backlog_status ON backlog_items(user_id, status);

-- Daily Reflections
CREATE INDEX idx_reflections_user_date ON daily_reflections(user_id, date);

-- Energy Logs
CREATE INDEX idx_energy_user_timestamp ON energy_logs(user_id, timestamp);

-- Weekly Summaries
CREATE INDEX idx_summaries_user_week ON weekly_summaries(user_id, week_start_date);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate goal completion percentage
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
  completed INTEGER;
BEGIN
  SELECT COUNT(*) INTO total
  FROM tasks WHERE goal_id = goal_uuid AND status != 'cancelled';
  
  SELECT COUNT(*) INTO completed
  FROM tasks WHERE goal_id = goal_uuid AND status = 'completed';
  
  IF total = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed::DECIMAL / total) * 100);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update goal progress (trigger)
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE goals
    SET 
      completion_percentage = calculate_goal_progress(NEW.goal_id),
      total_tasks = (SELECT COUNT(*) FROM tasks WHERE goal_id = NEW.goal_id AND status != 'cancelled'),
      completed_tasks = (SELECT COUNT(*) FROM tasks WHERE goal_id = NEW.goal_id AND status = 'completed'),
      updated_at = NOW()
    WHERE id = NEW.goal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE goals
    SET 
      completion_percentage = calculate_goal_progress(OLD.goal_id),
      total_tasks = (SELECT COUNT(*) FROM tasks WHERE goal_id = OLD.goal_id AND status != 'cancelled'),
      completed_tasks = (SELECT COUNT(*) FROM tasks WHERE goal_id = OLD.goal_id AND status = 'completed'),
      updated_at = NOW()
    WHERE id = OLD.goal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal progress when tasks change
CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backlog_updated_at BEFORE UPDATE ON backlog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (clerk_user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (clerk_user_id = current_setting('app.current_user_id', true));

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- Milestones policies
CREATE POLICY "Users can view own milestones" ON milestones FOR SELECT USING (goal_id IN (SELECT id FROM goals WHERE user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true))));
CREATE POLICY "Users can insert own milestones" ON milestones FOR INSERT WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true))));
CREATE POLICY "Users can update own milestones" ON milestones FOR UPDATE USING (goal_id IN (SELECT id FROM goals WHERE user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true))));
CREATE POLICY "Users can delete own milestones" ON milestones FOR DELETE USING (goal_id IN (SELECT id FROM goals WHERE user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true))));

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- Backlog policies
CREATE POLICY "Users can view own backlog" ON backlog_items FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own backlog" ON backlog_items FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can update own backlog" ON backlog_items FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can delete own backlog" ON backlog_items FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- Daily reflections policies
CREATE POLICY "Users can view own reflections" ON daily_reflections FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own reflections" ON daily_reflections FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can update own reflections" ON daily_reflections FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- Energy logs policies
CREATE POLICY "Users can view own energy logs" ON energy_logs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own energy logs" ON energy_logs FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));

-- Weekly summaries policies
CREATE POLICY "Users can view own summaries" ON weekly_summaries FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
CREATE POLICY "Users can insert own summaries" ON weekly_summaries FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)));
```

### Step 3: Setup Supabase Clients

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### Step 4: Generate TypeScript Types

In Supabase dashboard:
1. Go to API section
2. Copy the TypeScript types
3. Create `types/supabase.ts` and paste the types

Or use Supabase CLI:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Create `types/database.types.ts`:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Types will be auto-generated
      // This is a placeholder
    }
  }
}
```

Create `types/index.ts`:
```typescript
import { Database } from './supabase'

export type User = Database['public']['Tables']['users']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type BacklogItem = Database['public']['Tables']['backlog_items']['Row']
export type DailyReflection = Database['public']['Tables']['daily_reflections']['Row']
export type EnergyLog = Database['public']['Tables']['energy_logs']['Row']
export type WeeklySummary = Database['public']['Tables']['weekly_summaries']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type BacklogItemInsert = Database['public']['Tables']['backlog_items']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Enums
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type GoalStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type Priority = 'high' | 'medium' | 'low'
export type EnergyLevel = 'high' | 'medium' | 'low'
export type EisenhowerQuadrant = 'q1_urgent_important' | 'q2_not_urgent_important' | 'q3_urgent_not_important' | 'q4_not_urgent_not_important'
```

## Files to Create/Modify

**New Files:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `types/supabase.ts` (generated from Supabase)
- `types/database.types.ts`
- `types/index.ts`

**Modified Files:**
- `.env.local` (add Supabase credentials)

**Database:**
- Run all SQL in Supabase SQL Editor

## Testing

1. **Test Database Connection:**

Create a test API route `app/api/test-db/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, data })
}
```

Visit `http://localhost:3000/api/test-db` and verify:
- ✅ Returns success (even if data is empty)
- ✅ No connection errors

2. **Test RLS:**
Try querying without auth - should return empty results (RLS blocks it).

## Acceptance Criteria

- ✅ Supabase project created
- ✅ All database tables created
- ✅ Indexes added for performance
- ✅ Helper functions created
- ✅ Triggers set up for auto-updates
- ✅ Row Level Security enabled on all tables
- ✅ RLS policies created for all tables
- ✅ Supabase clients configured in Next.js
- ✅ TypeScript types generated
- ✅ Database connection test passes

## Notes for AI Agent

- Run the entire SQL script in one go in Supabase SQL Editor
- Make sure to enable RLS on ALL tables
- Verify the auto-generated types match the database schema
- The RLS policies use `current_setting('app.current_user_id')` which will be set in middleware (next task)

## Next Task
Task 3: Clerk Authentication Setup
