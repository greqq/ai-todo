# Life Reset Enhancement - Task Breakdown

## Overview

This document breaks down the Life Reset Guide enhancements into **5 implementable tasks** that build on the existing MVP structure.

---

## 🎯 Task 9A: Enhanced Life Reset Onboarding Interview

### Objective
Replace the simple 5-question onboarding with a comprehensive Life Reset Guide interview (5 phases, 10-20 minutes).

### What Changes

**Database Changes:**
```sql
-- Update users table to store more onboarding data
ALTER TABLE users 
ADD COLUMN vision_statement TEXT,
ADD COLUMN anti_patterns JSONB DEFAULT '[]'::jsonb,
ADD COLUMN energy_preferences JSONB DEFAULT '{}'::jsonb;

-- Enhance onboarding_data structure
-- Store in users.onboarding_data as JSONB:
{
  "phase_1_current_life": {
    "daily_routine": "...",
    "work_situation": "...",
    "energy_patterns": "...",
    "commitments": [],
    "satisfaction_scores": {}
  },
  "phase_2_anti_vision": {
    "work_antipatterns": [],
    "lifestyle_antipatterns": [],
    "relationship_antipatterns": [],
    "health_antipatterns": [],
    "financial_antipatterns": []
  },
  "phase_3_vision": {
    "financial_goals": "...",
    "career_vision": "...",
    "lifestyle_vision": "...",
    "relationship_vision": "...",
    "health_vision": "...",
    "time_vision": "..."
  },
  "phase_4_time_horizons": {
    "long_term_5_10y": [],
    "medium_term_1_3y": [],
    "short_term_3_12m": [],
    "immediate_1m": [],
    "daily_habits": []
  },
  "phase_5_obstacles": {
    "distractions": [],
    "habits_to_break": [],
    "limiting_beliefs": [],
    "external_constraints": [],
    "support_needs": []
  },
  "completed_at": "timestamp",
  "interview_duration_minutes": 15
}
```

**Files to Create:**
1. `app/onboarding/interview/page.tsx` - Main interview UI
2. `components/onboarding/interview-phase.tsx` - Phase component
3. `components/onboarding/interview-progress.tsx` - Progress indicator
4. `app/api/ai/onboarding-interview/route.ts` - AI interview endpoint
5. `lib/ai/prompts/onboarding-interview.ts` - Interview prompts

**Implementation Steps:**

1. **Create Interview UI**
```typescript
// app/onboarding/interview/page.tsx
'use client';

import { useState } from 'react';
import { InterviewPhase } from '@/components/onboarding/interview-phase';
import { InterviewProgress } from '@/components/onboarding/interview-progress';

const PHASES = [
  { id: 1, name: 'Current Life', questions: 5 },
  { id: 2, name: 'Anti-Vision', questions: 5 },
  { id: 3, name: 'Vision', questions: 6 },
  { id: 4, name: 'Time Horizons', questions: 5 },
  { id: 5, name: 'Obstacles', questions: 5 }
];

export default function OnboardingInterview() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [responses, setResponses] = useState({});
  const [conversation, setConversation] = useState([]);

  // Interview logic here...
}
```

2. **Create AI Interview Endpoint**
```typescript
// app/api/ai/onboarding-interview/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { phase, questionNumber, userResponse, conversationHistory } = await req.json();
  
  // Load appropriate prompt for current phase
  const systemPrompt = getPhasePrompt(phase, questionNumber);
  
  // Generate next question
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages: conversationHistory,
  });
  
  return Response.json({ nextQuestion: text });
}
```

3. **Implement Phase-by-Phase Flow**
- Phase 1: Current Life (5-7 questions)
- Phase 2: Anti-Vision (5 questions)
- Phase 3: Vision (6 questions)
- Phase 4: Time Horizons (5 questions)
- Phase 5: Obstacles (5 questions)

4. **AI Synthesis After Interview**
```typescript
// After all phases complete:
POST /api/ai/synthesize-onboarding
{
  "responses": {...}
}

// Returns:
{
  "vision_statement": "...",
  "primary_goals": [...],
  "anti_patterns": [...],
  "energy_preferences": {...},
  "constraints": [...]
}
```

### Acceptance Criteria
- ✅ 5 phases flow conversationally
- ✅ AI asks one question at a time
- ✅ Users can go back and edit responses
- ✅ Progress indicator shows current phase
- ✅ All responses saved to database
- ✅ Vision statement generated
- ✅ Takes 10-20 minutes to complete

### Estimated Time
8-10 hours

---

## 🎯 Task 9B: Goal Hierarchy & Auto-Breakdown System

### Objective
Automatically break down long-term goals into 6-month, 3-month, monthly, and weekly milestones using AI.

### What Changes

**Database Changes:**
```sql
-- Add goal breakdown fields
ALTER TABLE goals
ADD COLUMN parent_milestone_id UUID REFERENCES milestones(id),
ADD COLUMN timeframe TEXT CHECK (timeframe IN ('12_month', '6_month', '3_month', '1_month', 'weekly', 'daily')),
ADD COLUMN breakdown_generated BOOLEAN DEFAULT false,
ADD COLUMN breakdown_data JSONB DEFAULT '{}'::jsonb;

-- Update milestones table
ALTER TABLE milestones
ADD COLUMN timeframe TEXT,
ADD COLUMN parent_milestone_id UUID REFERENCES milestones(id),
ADD COLUMN ai_generated BOOLEAN DEFAULT false;

-- Add goal_category
ALTER TABLE goals
ADD COLUMN category TEXT CHECK (category IN ('career', 'health', 'financial', 'relationships', 'personal_growth', 'creative', 'other'));
```

**Files to Create:**
1. `app/api/ai/breakdown-goal/route.ts` - Goal breakdown endpoint
2. `lib/ai/goal-breakdown.ts` - Breakdown logic
3. `components/goals/goal-timeline.tsx` - Timeline visualization

**Implementation Steps:**

1. **AI Goal Breakdown Endpoint**
```typescript
// app/api/ai/breakdown-goal/route.ts
export async function POST(req: Request) {
  const { goalTitle, goalDescription, timeline, userContext } = await req.json();
  
  const prompt = `
    Break down this ${timeline} goal into achievable milestones:
    
    Goal: ${goalTitle}
    Description: ${goalDescription}
    
    User Context:
    - Energy patterns: ${userContext.energyPatterns}
    - Current commitments: ${userContext.commitments}
    - Constraints: ${userContext.constraints}
    
    Generate:
    1. 6-month milestone (what needs to be true at 6 months)
    2. 3-month milestone (what's achievable in 3 months)
    3. Month 1 objectives (first month focus areas)
    4. Month 2 objectives
    5. Month 3 objectives
    6. Weekly targets for Month 1 (4 weeks)
    
    Format as JSON with SMART criteria for each milestone.
  `;
  
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt,
  });
  
  const breakdown = JSON.parse(text);
  
  // Save to database
  await saveGoalBreakdown(goalId, breakdown);
  
  return Response.json(breakdown);
}
```

2. **Breakdown Structure**
```typescript
interface GoalBreakdown {
  goal_id: string;
  timeline: '12_month' | '6_month' | '3_month';
  milestones: {
    '6_month': {
      title: string;
      description: string;
      success_criteria: string[];
      estimated_completion_date: string;
    };
    '3_month': {
      title: string;
      description: string;
      success_criteria: string[];
      estimated_completion_date: string;
    };
    monthly: Array<{
      month: number;
      title: string;
      objectives: string[];
      key_tasks: string[];
    }>;
    weekly: Array<{
      week: number;
      focus_area: string;
      tasks: string[];
    }>;
  };
  dependencies: string[]; // e.g., "Learn Docker before deploying"
  risk_factors: string[];
}
```

3. **Auto-Generate on Goal Creation**
```typescript
// When user creates a goal, trigger breakdown
async function createGoalWithBreakdown(goalData) {
  // 1. Create goal
  const goal = await createGoal(goalData);
  
  // 2. Generate breakdown
  const breakdown = await generateGoalBreakdown(goal.id);
  
  // 3. Create milestone records
  await createMilestonesFromBreakdown(goal.id, breakdown);
  
  // 4. Generate initial tasks for first week
  await generateWeek1Tasks(goal.id, breakdown.milestones.weekly[0]);
  
  return goal;
}
```

### Acceptance Criteria
- ✅ AI generates 6-month milestone
- ✅ AI generates 3-month milestone
- ✅ AI generates monthly objectives (Month 1-3)
- ✅ AI generates weekly targets (Week 1-4 for Month 1)
- ✅ Milestones saved to database
- ✅ Breakdown respects user's constraints
- ✅ Dependencies identified

### Estimated Time
6-8 hours

---

## 🎯 Task 9C: Goal Visualization Component

### Objective
Create interactive visual timeline showing goal breakdown from 12 months → daily tasks.

### What to Build

**Files to Create:**
1. `components/goals/goal-roadmap.tsx` - Main visualization
2. `components/goals/timeline-view.tsx` - Timeline component
3. `components/goals/milestone-card.tsx` - Milestone display
4. `app/(dashboard)/goals/[id]/roadmap/page.tsx` - Roadmap page

**Implementation Steps:**

1. **Timeline Visualization**
```typescript
// components/goals/goal-roadmap.tsx
'use client';

import { useState } from 'react';

interface RoadmapProps {
  goal: Goal;
  breakdown: GoalBreakdown;
  progress: GoalProgress;
}

export function GoalRoadmap({ goal, breakdown, progress }: RoadmapProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'year' | 'month' | 'week'>('year');
  
  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{goal.title} - Roadmap</h2>
        <TimeframeToggle value={selectedTimeframe} onChange={setSelectedTimeframe} />
      </div>
      
      {/* Progress Overview */}
      <ProgressOverview 
        current={progress.completion_percentage}
        milestones={breakdown.milestones}
      />
      
      {/* Visual Timeline */}
      {selectedTimeframe === 'year' && <YearView breakdown={breakdown} />}
      {selectedTimeframe === 'month' && <MonthView breakdown={breakdown} />}
      {selectedTimeframe === 'week' && <WeekView breakdown={breakdown} />}
      
      {/* Milestone Cards */}
      <MilestoneGrid milestones={breakdown.milestones} />
    </div>
  );
}
```

2. **Year View (High-Level)**
```
┌──────────────────────────────────────────┐
│  12-Month Goal: Become DevOps Engineer   │
│  ████████░░░░░░░░░░░░░░░░░░░░ 35%        │
└──────────────────────────────────────────┘

Month 1-3  Month 4-6  Month 7-9  Month 10-12
   ✅         🔄         ⏳          ⏳
Foundation  Practice   Advanced   Mastery
```

3. **Month View (Detailed)**
```
Month 1: Foundation Building
├─ Week 1: Linux fundamentals    ✅
├─ Week 2: Docker basics         ✅
├─ Week 3: Git workflows         🔄 (in progress)
└─ Week 4: First deployment      ⏳

Current Focus: Git workflows
Progress: 18 of 24 tasks completed (75%)
```

4. **Week View (Task Level)**
```
Week 3: Git Workflows
├─ Mon: Complete Git branching tutorial     ✅
├─ Tue: Practice merge conflict resolution  ✅
├─ Wed: Set up GitHub Actions workflow      🔄
├─ Thu: Deploy test app with CI/CD         ⏳
└─ Fri: Code review practice               ⏳

Today: Wednesday (3/5 tasks done)
```

### UI Components Needed

**Timeline Component:**
- Horizontal progress bar
- Milestone markers
- Current position indicator
- Clickable milestones

**Milestone Card:**
- Title & description
- Success criteria checklist
- Completion percentage
- Tasks associated
- Edit/adjust button

**Interactive Features:**
- Zoom in/out (Year → Month → Week)
- Click milestone to see details
- Drag to adjust dates (if needed)
- Mark milestones as complete

### Acceptance Criteria
- ✅ Timeline displays 12-month view
- ✅ Can zoom to month/week view
- ✅ Milestones shown as markers
- ✅ Progress percentage accurate
- ✅ Click milestone to see details
- ✅ Responsive on mobile
- ✅ Visual indication of current focus

### Estimated Time
8-10 hours

---

## 🎯 Task 9D: Multiple Goals & Prioritization

### Objective
Support 3-5 concurrent goals with priority weighting and balanced task generation.

### What Changes

**Database Changes:**
```sql
-- Add priority_weight to goals
ALTER TABLE goals
ADD COLUMN priority_weight INTEGER DEFAULT 50 CHECK (priority_weight >= 0 AND priority_weight <= 100);

-- Add goal relationship table for dependencies
CREATE TABLE goal_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  related_goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('supports', 'blocks', 'prerequisite')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to Create:**
1. `components/goals/goal-priority-slider.tsx` - Priority adjustment
2. `components/goals/multi-goal-dashboard.tsx` - Overview of all goals
3. `lib/ai/balanced-task-generation.ts` - Multi-goal task gen logic

**Implementation Steps:**

1. **Goal Priority System**
```typescript
// Users allocate 100% across their goals
interface GoalPriority {
  goal_id: string;
  goal_title: string;
  priority_weight: number; // 0-100
  category: string;
}

// Example:
goals = [
  { id: '1', title: 'DevOps Career', priority_weight: 50 },     // 50%
  { id: '2', title: 'Health & Fitness', priority_weight: 25 },  // 25%
  { id: '3', title: 'Reading Habit', priority_weight: 15 },     // 15%
  { id: '4', title: 'Side Project', priority_weight: 10 }       // 10%
];
```

2. **Balanced Task Generation**
```typescript
// lib/ai/balanced-task-generation.ts

export async function generateBalancedDailyTasks(
  userId: string,
  availableHours: number = 8
) {
  const goals = await getUserGoals(userId);
  const priorities = goals.map(g => ({
    goal_id: g.id,
    weight: g.priority_weight / 100
  }));
  
  // Allocate time based on priority
  const taskAllocation = priorities.map(p => ({
    goal_id: p.goal_id,
    allocated_hours: availableHours * p.weight,
    allocated_tasks: Math.round(5 * p.weight) // 5 tasks total
  }));
  
  // Generate tasks for each goal
  const tasks = await Promise.all(
    taskAllocation.map(async (alloc) => {
      return generateTasksForGoal(
        alloc.goal_id,
        alloc.allocated_tasks,
        alloc.allocated_hours
      );
    })
  );
  
  return tasks.flat();
}
```

3. **Multi-Goal Dashboard**
```typescript
// Shows all goals with progress
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {goals.map(goal => (
    <GoalCard
      key={goal.id}
      goal={goal}
      priority={goal.priority_weight}
      progress={goal.completion_percentage}
      thisWeekTasks={goal.tasks_this_week}
      onAdjustPriority={(newWeight) => updatePriority(goal.id, newWeight)}
    />
  ))}
</div>
```

4. **Priority Adjustment UI**
```typescript
// Slider that keeps total at 100%
<GoalPrioritySliders
  goals={goals}
  onUpdate={(updated) => {
    // Ensure total = 100%
    const total = updated.reduce((sum, g) => sum + g.priority, 0);
    if (total === 100) {
      saveGoalPriorities(updated);
    }
  }}
/>
```

### Acceptance Criteria
- ✅ Can create 3-5 active goals
- ✅ Each goal has category and priority
- ✅ Priority weights total 100%
- ✅ Task generation respects priorities
- ✅ Dashboard shows all goals
- ✅ Can adjust priorities with sliders
- ✅ Related goals can be linked

### Estimated Time
6-8 hours

---

## 🎯 Task 9E: Morning & Evening Routines

### Objective
Create dedicated routine builder for morning and evening habits separate from goal tasks.

### What Changes

**Database Changes:**
```sql
-- Create routines table
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('morning', 'evening')) NOT NULL,
  name TEXT NOT NULL,
  time_of_day TIME,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create routine_items table
CREATE TABLE routine_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track routine completion
CREATE TABLE routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  items_completed UUID[], -- Array of routine_item IDs
  completion_time TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(routine_id, user_id, completed_date)
);
```

**Files to Create:**
1. `app/(dashboard)/routines/page.tsx` - Routine management
2. `components/routines/routine-builder.tsx` - Create/edit routines
3. `components/routines/routine-checklist.tsx` - Daily checklist
4. `components/dashboard/morning-routine-widget.tsx` - Dashboard widget

**Implementation Steps:**

1. **Routine Builder**
```typescript
// components/routines/routine-builder.tsx
export function RoutineBuilder({ type }: { type: 'morning' | 'evening' }) {
  const [items, setItems] = useState<RoutineItem[]>([]);
  
  return (
    <div>
      <h2>Build Your {type === 'morning' ? 'Morning' : 'Evening'} Routine</h2>
      
      {/* Suggested items based on goals */}
      <SuggestedRoutineItems goals={userGoals} />
      
      {/* Custom items */}
      <div>
        {items.map((item, i) => (
          <RoutineItemRow
            key={item.id}
            item={item}
            onUpdate={(updated) => updateItem(i, updated)}
            onRemove={() => removeItem(i)}
          />
        ))}
      </div>
      
      <Button onClick={addItem}>+ Add Item</Button>
      
      {/* Total duration */}
      <div>Total: {totalDuration} minutes</div>
      
      <Button onClick={saveRoutine}>Save Routine</Button>
    </div>
  );
}
```

2. **AI-Suggested Routine**
```typescript
// Based on onboarding data, suggest routine
export async function generateRoutineSuggestions(userId: string) {
  const user = await getUser(userId);
  const goals = await getUserGoals(userId);
  
  const prompt = `
    Based on this user's goals and energy patterns, suggest a morning and evening routine:
    
    Goals: ${goals.map(g => g.title).join(', ')}
    Energy Peak: ${user.preferences.energy_peak_time}
    Work Hours: ${user.preferences.work_hours_start} - ${user.preferences.work_hours_end}
    
    Morning routine should:
    - Prime them for their most important goal
    - Match their energy patterns
    - Be realistic (30-60 minutes max)
    
    Evening routine should:
    - Help them reflect and plan
    - Wind down effectively
    - Be sustainable (20-30 minutes)
    
    Return JSON format.
  `;
  
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt
  });
  
  return JSON.parse(text);
}
```

3. **Morning Routine Example**
```typescript
morning_routine = {
  name: "Morning Power Routine",
  time_of_day: "07:00",
  duration_minutes: 45,
  items: [
    { title: "Wake up (no snooze)", duration: 0, order: 1 },
    { title: "15-min walk or stretch", duration: 15, order: 2 },
    { title: "Cold shower", duration: 10, order: 3 },
    { title: "Review today's top 3 goals", duration: 5, order: 4 },
    { title: "Read DevOps article", duration: 15, order: 5, optional: true }
  ]
};
```

4. **Dashboard Integration**
```typescript
// Show routine checklist on dashboard
<MorningRoutineWidget>
  <h3>Good morning! ☀️</h3>
  <RoutineChecklist
    routine={morningRoutine}
    onComplete={(itemId) => markItemComplete(itemId)}
  />
  <Button>Start Focus Time →</Button>
</MorningRoutineWidget>
```

5. **Routine Analytics**
- Completion streak tracking
- Time of completion trends
- Most/least completed items
- Routine effectiveness score

### Acceptance Criteria
- ✅ Can create morning routine
- ✅ Can create evening routine
- ✅ AI suggests initial routines based on goals
- ✅ Items have duration and order
- ✅ Daily checklist on dashboard
- ✅ Track completion per day
- ✅ Optional vs required items
- ✅ Streak tracking

### Estimated Time
6-8 hours

---

## 📊 Implementation Priority

**Recommended Order:**

1. **Task 9A: Enhanced Onboarding** (FIRST)
   - Foundation for everything else
   - Collects data needed for other features
   - ~8-10 hours

2. **Task 9B: Goal Breakdown** (SECOND)
   - Enables visualization
   - Core feature for goal management
   - ~6-8 hours

3. **Task 9C: Goal Visualization** (THIRD)
   - Makes breakdown visible
   - User-facing value
   - ~8-10 hours

4. **Task 9D: Multiple Goals** (FOURTH)
   - Expands system capability
   - ~6-8 hours

5. **Task 9E: Routines** (FIFTH)
   - Nice-to-have enhancement
   - ~6-8 hours

**Total Estimated Time:** 34-44 hours (~5-6 days of focused work)

---

## 🔄 Progress Tracking

Add to progress-tracker.json:

```json
{
  "id": "9A",
  "name": "Enhanced Life Reset Onboarding",
  "status": "not_started",
  "estimated_hours": 10
},
{
  "id": "9B",
  "name": "Goal Hierarchy & Auto-Breakdown",
  "status": "not_started",
  "estimated_hours": 8
},
{
  "id": "9C",
  "name": "Goal Visualization Component",
  "status": "not_started",
  "estimated_hours": 10
},
{
  "id": "9D",
  "name": "Multiple Goals & Prioritization",
  "status": "not_started",
  "estimated_hours": 8
},
{
  "id": "9E",
  "name": "Morning/Evening Routines",
  "status": "not_started",
  "estimated_hours": 8
}
```

---

## 🎯 Next Steps

1. **Review this task breakdown** - Does it make sense?
2. **Commit to progress tracker** - Add these 5 tasks
3. **Start with Task 9A** - Enhanced onboarding is the foundation
4. **Test after each task** - Don't move forward until current task works

Would you like me to:
- Create detailed code examples for any specific task?
- Adjust the breakdown further?
- Start implementing Task 9A immediately?
