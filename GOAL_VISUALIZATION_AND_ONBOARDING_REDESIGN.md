# Goal Visualization & Enhanced Onboarding - Implementation Plan

## Overview
This document outlines the implementation plan for two major features:
1. **Goal Visualization & Breakdown System** - Visual timeline breakdown of goals (12mo → 6mo → 3mo → 1mo → weekly)
2. **Life Reset Guide Onboarding** - Comprehensive 10+ minute onboarding based on the "Life Reset Guide" prompt

---

## PART 1: Goal Visualization & Breakdown System

### 1.1 Goal Breakdown Algorithm & Data Model

**File to Create:** `lib/goal-breakdown/breakdown-algorithm.ts`

**Purpose:** Calculate milestone breakdown for any goal based on timeline

**Features:**
- Accept a goal with start_date and target_date
- Automatically generate breakdown milestones at:
  - 50% point (halfway)
  - 25% and 75% points (quarters)
  - Monthly checkpoints
  - Weekly checkpoints (for goals < 3 months)
- Return structured milestone data with suggested completion percentages

**Functions to implement:**
```typescript
interface BreakdownMilestone {
  title: string;
  description: string;
  target_date: string;
  completion_percentage_target: number;
  period_type: '12_month' | '6_month' | '3_month' | '1_month' | 'weekly';
  order_index: number;
}

function generateGoalBreakdown(
  goalTitle: string,
  startDate: Date,
  targetDate: Date,
  goalDescription?: string
): BreakdownMilestone[]

function generateAIAssistedBreakdown(
  goal: Goal,
  existingMilestones?: Milestone[]
): Promise<BreakdownMilestone[]>
```

**AI Integration:**
- Use Claude Sonnet to suggest meaningful milestone titles/descriptions
- Ask AI: "Given this goal, what should be achieved at the 6-month mark?"
- Provide context about the goal type and success criteria

---

### 1.2 Goal Breakdown Prompt for AI

**File to Update:** `lib/ai/prompts.ts`

**New Function:** `getGoalBreakdownPrompt()`

**Prompt Template:**
```typescript
export function getGoalBreakdownPrompt(params: {
  goalTitle: string;
  goalDescription: string;
  goalType: string;
  startDate: string;
  targetDate: string;
  successCriteria: string[];
  timelineMonths: number;
}) {
  return `You are a goal-setting expert. Break down this goal into meaningful milestones.

Goal: ${params.goalTitle}
Description: ${params.goalDescription}
Type: ${params.goalType}
Timeline: ${params.startDate} to ${params.targetDate} (${params.timelineMonths} months)
Success Criteria: ${params.successCriteria.join(', ')}

Create a hierarchical breakdown showing what should be accomplished at each checkpoint:

For ${params.timelineMonths}-month goals, provide:
1. **12-Month Vision** (if applicable): What final state looks like
2. **6-Month Milestone**: Halfway point - what's achievable
3. **3-Month Milestones**: Quarterly checkpoints
4. **Monthly Milestones**: Key monthly targets
5. **Weekly Focus Areas**: What to focus on week-by-week (first month only)

Each milestone should:
- Be SPECIFIC and MEASURABLE
- Build upon previous milestones
- Show clear progress toward the goal
- Have realistic completion percentage targets

Return JSON:
{
  "breakdown": [
    {
      "period_type": "6_month",
      "title": "string",
      "description": "string",
      "target_date": "YYYY-MM-DD",
      "completion_percentage_target": number,
      "key_deliverables": ["string"],
      "order_index": number
    }
  ],
  "recommended_weekly_themes": [
    {
      "week_number": number,
      "theme": "string",
      "focus_areas": ["string"]
    }
  ],
  "reasoning": "Why this breakdown makes sense"
}`
}
```

---

### 1.3 Visual Timeline Component

**File to Create:** `components/goals/GoalTimeline.tsx`

**Purpose:** Beautiful visual timeline showing the goal breakdown

**Design:**
```
┌─────────────────────────────────────────────────────────┐
│  Goal: Become a Senior DevOps Engineer                 │
│  Timeline: Jan 2025 → Dec 2025                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  START ●━━━━━●━━━━━●━━━━━●━━━━━━━━━━━━●━━━━● END       │
│       Jan   Mar   Jun   Sep          Dec                │
│             ↓     ↓     ↓            ↓                  │
│        Q1   Q2   6mo   Q3           12mo                │
│                                                          │
│  ┌────── 3 Month ──────┐                                │
│  │ • Complete K8s cert │                                │
│  │ • Deploy 3 projects │                                │
│  │ • Target: 25%       │                                │
│  └─────────────────────┘                                │
│                                                          │
│         ┌────── 6 Month ──────┐                         │
│         │ • Lead team project │                         │
│         │ • Master Terraform  │                         │
│         │ • Target: 50%       │                         │
│         └─────────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Interactive timeline visualization
- Click milestones to see details
- Progress bar showing current position
- Color coding (past milestones, current, future)
- Responsive design

**Component Structure:**
```tsx
interface GoalTimelineProps {
  goal: Goal;
  milestones: BreakdownMilestone[];
  currentDate?: Date;
}

export function GoalTimeline({ goal, milestones, currentDate }: GoalTimelineProps)
```

**UI Library:** Use shadcn/ui components (Card, Progress, Badge, Popover)

---

### 1.4 Goal Breakdown Generation API

**File to Create:** `app/api/goals/[id]/breakdown/route.ts`

**Endpoints:**
- `GET /api/goals/[id]/breakdown` - Get existing breakdown
- `POST /api/goals/[id]/breakdown/generate` - Generate new AI breakdown
- `PUT /api/goals/[id]/breakdown` - Update breakdown milestones

**POST Logic:**
1. Fetch goal details
2. Calculate timeline duration
3. Call AI with goal breakdown prompt
4. Parse AI response
5. Create milestone records in database
6. Return breakdown data

**Response Format:**
```json
{
  "goal_id": "uuid",
  "breakdown": [...],
  "weekly_themes": [...],
  "created_at": "timestamp"
}
```

---

### 1.5 Goal Detail Page Enhancement

**File to Update:** `app/(dashboard)/goals/[id]/page.tsx`

**Add:**
- "View Timeline" tab/section
- "Generate Breakdown" button
- Timeline visualization component
- Weekly focus section

**Layout:**
```
┌─────────────────────────────────────────┐
│  Goal Details  │  Timeline  │  Tasks    │
└─────────────────────────────────────────┘
          ↓
  [GoalTimeline Component]
          ↓
  [Current Focus: Week 12]
  This week's focus:
  • Master Kubernetes networking
  • Complete cert module 5
```

---

### 1.6 Database Migration

**File to Create:** Migration script for new table

**New Table:** `goal_breakdown_milestones`

```sql
CREATE TABLE goal_breakdown_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- '12_month', '6_month', '3_month', '1_month', 'weekly'
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_percentage_target INTEGER DEFAULT 0,
  key_deliverables JSONB,
  order_index INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_breakdown_milestones_goal ON goal_breakdown_milestones(goal_id);
CREATE INDEX idx_breakdown_milestones_user ON goal_breakdown_milestones(user_id);
CREATE INDEX idx_breakdown_milestones_period ON goal_breakdown_milestones(period_type);
```

---

## PART 2: Life Reset Guide Onboarding

### 2.1 Enhanced Onboarding Data Model

**Current Model:** 5 simple questions stored in `onboarding_data` JSON field

**New Model:** Comprehensive life assessment

**Structure for `onboarding_data`:**
```typescript
interface LifeResetOnboardingData {
  // Phase 1: Current Life Assessment
  current_life: {
    typical_day: string;
    work_situation: string;
    living_situation: string;
    relationships: string;
    financial_status: string;
    energy_levels: string;
    stress_factors: string;
    satisfaction_areas: {
      work: number; // 1-10
      health: number;
      relationships: number;
      finances: number;
      personal_growth: number;
    };
  };

  // Phase 2: Anti-Vision (What they DON'T want)
  anti_vision: {
    work_to_avoid: string[];
    living_to_avoid: string[];
    relationships_to_avoid: string[];
    energy_states_to_avoid: string[];
    activities_to_avoid: string[];
    financial_situations_to_avoid: string[];
  };

  // Phase 3: Vision (What they DO want)
  vision: {
    financial_goals: string;
    meaningful_work: string;
    ideal_living: string;
    desired_relationships: string;
    health_appearance_goals: string;
    ideal_daily_schedule: string;
  };

  // Phase 4: Time Horizons
  time_horizons: {
    long_term_5_to_10_years: string[];
    medium_term_1_to_3_years: string[];
    short_term_1_to_12_months: string[];
    immediate_1_to_4_weeks: string[];
  };

  // Phase 5: Obstacles
  obstacles: {
    distractions: string[];
    limiting_habits: string[];
    limiting_beliefs: string[];
    external_constraints: string[];
  };

  // Additional: Routines
  routines: {
    morning: {
      desired: string;
      current: string;
      non_negotiables: string[];
    };
    evening: {
      desired: string;
      current: string;
      non_negotiables: string[];
    };
  };

  // Multiple Goals Support
  multiple_goals: {
    primary_goal: string;
    secondary_goals: string[]; // "Read 12 books", "Walk daily", etc.
    lifestyle_habits: string[]; // "Morning meditation", "Evening journaling"
  };
}
```

---

### 2.2 Life Reset Guide AI Prompts

**File to Update:** `lib/ai/prompts.ts`

**New Function:** `getLifeResetInterviewPrompt()`

**Phases:**

**Phase 1 - Current Life Assessment:**
```typescript
export function getLifeResetPhase1Prompt(previousAnswers: any) {
  return `You are a Life Reset Guide, a compassionate yet analytical coach specializing in helping users completely reimagine and restructure their lives.

IMPORTANT REMINDERS FOR USER:
- Your answers don't need to be comprehensive
- You can say "I don't know" as a perfectly reasonable answer
- There are no wrong answers
- This is just to understand your current position

Current Phase: CURRENT LIFE ASSESSMENT

Previous Context:
${JSON.stringify(previousAnswers, null, 2)}

Ask ONE question at a time from this phase:
1. Describe your typical day from morning to night in as much detail as possible
2. Tell me about your current work situation
3. What's your living situation like?
4. How would you describe your key relationships?
5. What's your current financial status and how do you feel about it?
6. On a scale of 1-10, rate your energy levels throughout the day
7. What are your main stress factors right now?
8. Rate your satisfaction (1-10) in: work, health, relationships, finances, personal growth

Ask the next relevant question based on what they've already answered. Be conversational and empathetic.

Return JSON:
{
  "ai_message": "Conversational question",
  "phase": "current_life_assessment",
  "question_number": number,
  "needs_clarification": boolean,
  "proceed_to_next_phase": boolean
}`
}
```

**Phase 2 - Anti-Vision:**
```typescript
export function getLifeResetPhase2Prompt(previousAnswers: any) {
  return `Now we're moving to ANTI-VISION - understanding what you definitely DON'T want based on past experiences.

This is just as important as knowing what you want. Often it's easier to identify what drains us than what energizes us.

Previous Context:
${JSON.stringify(previousAnswers, null, 2)}

Ask about what they want to AVOID:
1. What work environments, responsibilities, or sectors do you want to avoid?
2. What living arrangements or locations do you find unsuitable?
3. What relationship patterns or social dynamics do you find draining?
4. How do you NOT want to feel about your health and appearance?
5. What daily activities or responsibilities do you find unfulfilling?
6. What financial situations do you find insufficient or stressful?

Return JSON:
{
  "ai_message": "Conversational question about what to avoid",
  "phase": "anti_vision",
  "question_number": number,
  "needs_clarification": boolean,
  "proceed_to_next_phase": boolean
}`
}
```

**Phase 3 - Vision:**
```typescript
export function getLifeResetPhase3Prompt(previousAnswers: any) {
  return `Now let's focus on VISION - what you DO want in your future life.

Paint a picture of your ideal future. Be as specific or as vague as feels right.

Previous Context:
${JSON.stringify(previousAnswers, null, 2)}

Ask about what they WANT:
1. What are your financial goals and what would that money enable for you?
2. What kind of work would be meaningful and engaging for you?
3. Describe your ideal living situation and location
4. What types of relationships and social connections do you want?
5. How do you want to look, feel, and perceive yourself?
6. How would you ideally spend your time and energy daily?

Also ask about:
7. Besides your main goal, what other activities matter to you? (e.g., reading, walking, hobbies)
8. What morning and evening routines would support your ideal life?

Return JSON:
{
  "ai_message": "Conversational question about desires",
  "phase": "vision",
  "question_number": number,
  "needs_clarification": boolean,
  "proceed_to_next_phase": boolean
}`
}
```

**Phase 4 - Time Horizons:**
```typescript
export function getLifeResetPhase4Prompt(previousAnswers: any) {
  return `Let's map out TIME HORIZONS - your goals across different timeframes.

Previous Context:
${JSON.stringify(previousAnswers, null, 2)}

Ask about different time horizons:
1. What are your long-term goals (5-10 years from now)?
2. What about medium-term (1-3 years)?
3. What are your short-term goals (next 1-12 months)?
4. What are your immediate priorities (next 1-4 weeks)?

Return JSON:
{
  "ai_message": "Conversational question about time horizons",
  "phase": "time_horizons",
  "question_number": number,
  "needs_clarification": boolean,
  "proceed_to_next_phase": boolean
}`
}
```

**Phase 5 - Obstacles:**
```typescript
export function getLifeResetPhase5Prompt(previousAnswers: any) {
  return `Final phase: OBSTACLES ASSESSMENT - understanding what might get in your way.

Previous Context:
${JSON.stringify(previousAnswers, null, 2)}

Ask about obstacles:
1. What current distractions tend to derail your focus?
2. What habits do you think might be holding you back?
3. What limiting beliefs or fears do you struggle with?
4. What external constraints do you face? (financial, geographical, relational)

Return JSON:
{
  "ai_message": "Conversational question about obstacles",
  "phase": "obstacles_assessment",
  "question_number": number,
  "needs_clarification": boolean,
  "all_phases_complete": boolean
}`
}
```

---

### 2.3 Life Reset Map Generation Prompt

**Function:** `getLifeResetMapPrompt()`

**Purpose:** After all phases complete, generate comprehensive "Life Reset Map"

```typescript
export function getLifeResetMapPrompt(allAnswers: LifeResetOnboardingData) {
  return `Based on this comprehensive life reset interview, create a Life Reset Map.

Complete Interview Data:
${JSON.stringify(allAnswers, null, 2)}

Generate a comprehensive Life Reset Map with these sections:

1. **Vision Statement**: A compelling 1-2 paragraph description of their ideal life that respects both what they want and don't want.

2. **Goals Hierarchy**:
   - Long-term (5-10 year) goals broken down by life area
   - Medium-term (1-3 year) goals that support the long-term vision
   - Short-term (1-12 month) goals that build toward medium-term goals
   - Immediate (1-4 week) priorities that initiate momentum

3. **Primary Goal + Supporting Activities**:
   - Identify THE primary goal (most important/urgent)
   - Create supporting goals for: reading habits, exercise/walks, other mentioned activities
   - Ensure routines support all goals

4. **Morning Routine**:
   - Optimized for their goals and energy patterns
   - Include non-negotiables
   - Time-blocked suggestions

5. **Evening Routine**:
   - Reflection and preparation
   - Wind-down activities
   - Non-negotiables

6. **Skills & Knowledge Development Plan**:
   - Core skills needed to achieve their goals
   - Knowledge areas to develop
   - For each item, provide 2-3 specific resources (books, courses, YouTube channels)
   - Sequence in order of priority

7. **Daily Structure**:
   - Morning routine block
   - Work/productivity blocks
   - Learning time allocations
   - Self-care blocks
   - Relationship maintenance
   - Evening routine block

8. **Implementation Strategy**:
   - Week 1 detailed plan to build momentum
   - Monthly milestones for first 3 months
   - Accountability suggestions
   - Progress tracking methods

Return JSON:
{
  "vision_statement": "string",
  "goals_hierarchy": {
    "primary_goal": {
      "title": "string",
      "description": "string",
      "type": "career | health | financial | relationships | personal_growth | creative | other",
      "target_date": "YYYY-MM-DD",
      "priority": "high",
      "success_criteria": ["string"]
    },
    "secondary_goals": [
      {
        "title": "string (e.g., Read 12 books this year)",
        "description": "string",
        "type": "string",
        "target_date": "YYYY-MM-DD",
        "priority": "medium | low",
        "success_criteria": ["string"]
      }
    ],
    "long_term": ["string"],
    "medium_term": ["string"],
    "short_term": ["string"],
    "immediate": ["string"]
  },
  "morning_routine": {
    "description": "string",
    "time_blocks": [
      {
        "time": "06:00",
        "duration_minutes": 30,
        "activity": "string",
        "purpose": "string"
      }
    ],
    "non_negotiables": ["string"]
  },
  "evening_routine": {
    "description": "string",
    "time_blocks": [
      {
        "time": "21:00",
        "duration_minutes": 30,
        "activity": "string",
        "purpose": "string"
      }
    ],
    "non_negotiables": ["string"]
  },
  "skills_development": [
    {
      "skill": "string",
      "priority": number,
      "resources": [
        {
          "title": "string",
          "type": "book | course | youtube | article | other",
          "url": "string (if applicable)"
        }
      ]
    }
  ],
  "daily_structure": {
    "work_hours_start": "HH:MM",
    "work_hours_end": "HH:MM",
    "energy_peak_time": "morning | afternoon | evening | night",
    "time_blocks": [
      {
        "name": "string",
        "start_time": "HH:MM",
        "end_time": "HH:MM",
        "purpose": "string",
        "task_types": ["deep_work | learning | admin | etc"]
      }
    ]
  },
  "implementation": {
    "week_1_plan": {
      "focus": "string",
      "daily_tasks": ["string"]
    },
    "month_1_milestones": ["string"],
    "month_2_milestones": ["string"],
    "month_3_milestones": ["string"],
    "accountability_methods": ["string"],
    "tracking_methods": ["string"]
  },
  "initial_tasks": [
    {
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": number,
      "energy_required": "high | medium | low",
      "task_type": "deep_work | admin | learning | etc",
      "eisenhower_quadrant": "q1_urgent_important | q2_not_urgent_important | etc"
    }
  ]
}`
}
```

---

### 2.4 Enhanced Onboarding Component

**File to Replace:** `components/onboarding/AIInterview.tsx`

**New Component:** `components/onboarding/LifeResetInterview.tsx`

**Features:**
- Multi-phase interview (5 phases)
- Phase progress indicator
- "Skip Phase" option for each phase
- "I don't know" quick response button
- Beautiful phase transitions
- Estimated time remaining
- Save progress (resume later capability)

**UI Structure:**
```tsx
interface LifeResetInterviewProps {
  onComplete: (data: LifeResetOnboardingData) => void;
}

const PHASES = [
  { id: 1, name: 'Current Life', icon: '📊', estimatedMinutes: 3 },
  { id: 2, name: 'Anti-Vision', icon: '🚫', estimatedMinutes: 2 },
  { id: 3, name: 'Vision', icon: '✨', estimatedMinutes: 3 },
  { id: 4, name: 'Time Horizons', icon: '🎯', estimatedMinutes: 2 },
  { id: 5, name: 'Obstacles', icon: '🧗', estimatedMinutes: 2 },
];

export function LifeResetInterview({ onComplete }: LifeResetInterviewProps)
```

**Phase Progress UI:**
```
┌────────────────────────────────────────────────┐
│  Phase 2 of 5: Anti-Vision 🚫                  │
│  ●━━━●━━━●○○○○○○○○○○○○○○○○○○○○○○○○○○○○○○○○○  │
│  ~5 minutes remaining                          │
└────────────────────────────────────────────────┘
```

**Quick Actions:**
- "I don't know" button
- "Skip this question" button
- "Save and resume later" button

---

### 2.5 Onboarding Completion with Multiple Goals

**File to Update:** `app/api/ai/complete-onboarding/route.ts`

**Changes:**
1. Parse Life Reset Map from AI
2. Create PRIMARY goal in `goals` table
3. Create SECONDARY goals (reading, walking, etc.) in `goals` table
4. Create morning/evening routine tasks as recurring tasks
5. Create initial tasks from implementation strategy
6. Store complete Life Reset Map in `onboarding_data`

**Goal Creation Logic:**
```typescript
// Create primary goal
const primaryGoal = await createGoal({
  title: map.goals_hierarchy.primary_goal.title,
  description: map.goals_hierarchy.primary_goal.description,
  type: map.goals_hierarchy.primary_goal.type,
  priority: 'high',
  // ...
});

// Generate breakdown for primary goal
await generateGoalBreakdown(primaryGoal.id);

// Create secondary goals
for (const secondaryGoal of map.goals_hierarchy.secondary_goals) {
  await createGoal({
    title: secondaryGoal.title,
    description: secondaryGoal.description,
    type: secondaryGoal.type,
    priority: secondaryGoal.priority,
    parent_goal_id: primaryGoal.id, // Link to primary
    // ...
  });
}

// Create morning routine tasks (recurring)
for (const block of map.morning_routine.time_blocks) {
  await createRecurringTask({
    title: block.activity,
    description: block.purpose,
    scheduled_start: block.time,
    estimated_duration_minutes: block.duration_minutes,
    recurrence_pattern: 'daily',
    task_type: 'planning',
    is_routine: true,
    routine_type: 'morning',
  });
}

// Same for evening routine
```

---

### 2.6 Life Reset Map Display Page

**File to Create:** `app/(dashboard)/life-reset-map/page.tsx`

**Purpose:** Display the complete Life Reset Map generated during onboarding

**Sections:**
1. Vision Statement (hero section)
2. Goals Hierarchy (visual tree)
3. Routines (morning/evening cards)
4. Skills Development (with resources)
5. Daily Structure (time-blocked calendar view)
6. Implementation Plan (accordion)

**Access:** Link from dashboard and settings

---

### 2.7 Routine Management

**File to Create:** `app/(dashboard)/routines/page.tsx`

**Purpose:** Manage morning and evening routines

**Features:**
- Edit routine time blocks
- Mark routines as complete daily
- Track routine streak
- Routine suggestions from AI

**Database:** Add `is_routine` and `routine_type` fields to `tasks` table

---

### 2.8 Database Migrations

**Migration 1: Add routine fields to tasks**
```sql
ALTER TABLE tasks
ADD COLUMN is_routine BOOLEAN DEFAULT FALSE,
ADD COLUMN routine_type TEXT, -- 'morning' | 'evening'
ADD COLUMN recurrence_pattern TEXT; -- 'daily' | 'weekly' | 'monthly'

CREATE INDEX idx_tasks_routine ON tasks(is_routine, routine_type);
```

**Migration 2: Add life_reset_map to users**
```sql
ALTER TABLE users
ADD COLUMN life_reset_map JSONB;
```

---

## IMPLEMENTATION SEQUENCE

### Phase A: Goal Breakdown System (Estimated: 8-12 hours)
1. ✅ Create breakdown algorithm (`lib/goal-breakdown/breakdown-algorithm.ts`)
2. ✅ Add goal breakdown prompt (`lib/ai/prompts.ts`)
3. ✅ Create breakdown API routes (`app/api/goals/[id]/breakdown/route.ts`)
4. ✅ Build GoalTimeline component (`components/goals/GoalTimeline.tsx`)
5. ✅ Update goal detail page to show timeline
6. ✅ Create database migration for `goal_breakdown_milestones`
7. ✅ Test with existing goals

### Phase B: Enhanced Onboarding - Backend (Estimated: 6-8 hours)
1. ✅ Create all 5 phase prompts in `lib/ai/prompts.ts`
2. ✅ Create Life Reset Map generation prompt
3. ✅ Update complete-onboarding API to handle new data structure
4. ✅ Add logic for creating multiple goals
5. ✅ Add routine creation logic
6. ✅ Database migrations

### Phase C: Enhanced Onboarding - Frontend (Estimated: 10-12 hours)
1. ✅ Build LifeResetInterview component
2. ✅ Implement phase-by-phase flow
3. ✅ Add progress tracking UI
4. ✅ Add quick response buttons
5. ✅ Add save/resume functionality
6. ✅ Replace old AIInterview with new one
7. ✅ Test complete flow

### Phase D: Life Reset Map & Routines (Estimated: 6-8 hours)
1. ✅ Build Life Reset Map display page
2. ✅ Build Routines management page
3. ✅ Add routine tracking to dashboard
4. ✅ Link from dashboard and settings

### Phase E: Integration & Polish (Estimated: 4-6 hours)
1. ✅ Ensure goal breakdowns auto-generate for new goals
2. ✅ Add "View Timeline" to all goal views
3. ✅ Update dashboard to show routines
4. ✅ Add "Re-run Life Reset" option in settings
5. ✅ Testing and bug fixes

---

## TOTAL ESTIMATED TIME: 34-46 hours of development

---

## NOTES

### Multi-Goal Support
- Primary goal gets highest priority and most focus
- Secondary goals (reading, walking, etc.) are tracked separately
- All goals can have their own breakdown timelines
- Dashboard shows progress on all goals

### Morning/Evening Routines
- Stored as recurring tasks with special `is_routine` flag
- Displayed in a dedicated Routines section
- Can be checked off daily
- Streak tracking for routine consistency

### AI Model Usage
- Use **Claude Sonnet 4.5** for:
  - Life Reset interview (conversational)
  - Life Reset Map generation (complex reasoning)
  - Goal breakdown generation
- Use **Claude Haiku 3.5** for:
  - Simple validation
  - Quick follow-ups

### Backward Compatibility
- Keep Quick Setup option
- Keep old AIInterview as fallback
- New Life Reset mode is opt-in (RECOMMENDED)

---

## QUESTIONS TO CONSIDER

1. **Should we allow users to re-run the Life Reset interview later?**
   - My recommendation: YES, add "Life Reset" button in settings
   - Could be useful for major life changes

2. **Should secondary goals get their own breakdown timelines?**
   - My recommendation: YES, but simplified (monthly checkpoints only)
   - Primary goal gets full 12mo → 6mo → 3mo → weekly breakdown
   - Secondary goals get monthly checkpoints only

3. **How to handle routine vs. task conflicts in daily view?**
   - My recommendation: Separate section for routines
   - Show "Morning Routine (3/4 complete)" as a card
   - Click to expand individual routine items

4. **Should we visualize all goals on one timeline?**
   - My recommendation: Individual timelines per goal
   - Dashboard has a "Master Timeline" view showing all goals

5. **How to handle when user wants to modify the Life Reset Map?**
   - My recommendation: Add "Edit Map" button
   - Can modify goals, routines, daily structure
   - Re-runs AI to regenerate implementation strategy

---

## FILES TO CREATE

### New Files (16 total)
1. `lib/goal-breakdown/breakdown-algorithm.ts`
2. `app/api/goals/[id]/breakdown/route.ts`
3. `components/goals/GoalTimeline.tsx`
4. `components/goals/TimelineNode.tsx`
5. `components/goals/BreakdownMilestoneCard.tsx`
6. `components/onboarding/LifeResetInterview.tsx`
7. `components/onboarding/PhaseProgress.tsx`
8. `components/onboarding/QuickResponseButtons.tsx`
9. `app/(dashboard)/life-reset-map/page.tsx`
10. `components/life-reset/VisionStatement.tsx`
11. `components/life-reset/GoalsHierarchy.tsx`
12. `components/life-reset/SkillsDevelopment.tsx`
13. `app/(dashboard)/routines/page.tsx`
14. `components/routines/RoutineCard.tsx`
15. `components/routines/RoutineTracker.tsx`
16. `types/life-reset.types.ts`

### Files to Update (5 total)
1. `lib/ai/prompts.ts` (add 6 new prompt functions)
2. `app/api/ai/complete-onboarding/route.ts` (handle new data model)
3. `app/(dashboard)/goals/[id]/page.tsx` (add timeline view)
4. `app/onboarding/page.tsx` (add Life Reset option)
5. `types/database.types.ts` (update after migrations)

### Database Migrations (2 total)
1. Create `goal_breakdown_milestones` table
2. Add routine fields to `tasks` table, add `life_reset_map` to `users`

---

## SUCCESS CRITERIA

✅ User can set a 12-month goal and see visual breakdown of 6mo, 3mo, 1mo, weekly milestones

✅ User goes through comprehensive Life Reset onboarding (can take 10+ minutes)

✅ User can specify multiple goals (primary + secondary like "read books", "take walks")

✅ Morning and evening routines are captured and trackable

✅ Life Reset Map is generated and accessible

✅ Timeline visualization is beautiful and interactive

✅ All existing functionality still works

✅ New onboarding is opt-in, old Quick Setup still available

---

## NEXT STEPS

1. **Review this document** - Does this capture everything you want?
2. **Commit this plan** - Save as project documentation
3. **Start with Phase A** - Goal Breakdown System (most isolated)
4. **Then Phase B & C** - Enhanced Onboarding
5. **Then Phase D** - Life Reset Map & Routines
6. **Finally Phase E** - Polish and integration

Let me know if you want to proceed or if anything needs adjustment!
