# AI-Powered Goal-Based TODO App - Product Requirements Document

## 1. Product Overview

### 1.1 Vision
An AI-powered productivity application that helps users achieve their long-term goals through intelligent daily task generation, energy management, and continuous adaptive coaching. Unlike traditional TODO apps that focus on task completion, this app prioritizes goal achievement through personalized, context-aware task planning based on Time Wealth principles.

### 1.2 Core Value Proposition
- **Personalized AI Coaching**: Understands your unique life context, energy patterns, and constraints
- **Goal-First Approach**: Every task connects to a larger goal, providing clarity and motivation
- **Adaptive Intelligence**: Learns from your behavior and improves recommendations over time
- **Energy Management**: Matches tasks to your energy levels, not just your time
- **Time Wealth Focus**: Built on proven productivity methodologies from "The 5 Types of Wealth"

### 1.3 Target User
Ambitious individuals juggling multiple goals (career growth, side projects, personal development, family) who need intelligent task prioritization rather than just another task list. Users who value their time and want to work smarter, not just harder.

---

## 2. User Personas

### Primary Persona: "The Ambitious Achiever"
- **Demographics**: 28-45 years old, working professional with side projects
- **Goals**: Career advancement, building side income, personal growth
- **Pain Points**: 
  - Overwhelmed by competing priorities
  - Struggles to maintain focus on long-term goals
  - Procrastinates on important but not urgent tasks
  - Energy crashes from poor task scheduling
- **Needs**: 
  - Clear daily priorities aligned with big-picture goals
  - Energy-aware scheduling
  - Accountability without micromanagement
  - Progress visibility

### Secondary Persona: "The Entrepreneur"
- **Demographics**: 30-50 years old, running own business or multiple projects
- **Goals**: Scale business, maintain work-life balance, strategic growth
- **Pain Points**:
  - Drowning in operational tasks
  - Can't focus on strategic work
  - Poor delegation habits
  - Burnout from poor energy management
- **Needs**:
  - High-value task identification
  - Delegation suggestions
  - Strategic thinking time protection
  - Energy optimization

---

## 3. Core Features (MVP)

### 3.1 AI-Powered Onboarding Interview

#### 3.1.1 Interview Modes
**Quick Start Mode (5 minutes)**
- 5 essential questions
- Basic goal setup
- Immediate task generation
- Refine over first week

**Deep Dive Mode (15 minutes)**
- 10 comprehensive questions
- Detailed goal hierarchy
- Energy pattern analysis
- Comprehensive initial plan

#### 3.1.2 Interview Questions (Quick Start)
1. **Main Goal**: "What's the one big goal you want to achieve in the next 3-6 months?"
2. **Why It Matters**: "Why is this important to you right now?"
3. **Timeline**: "What's your target completion date?"
4. **Daily Schedule**: "Describe your typical weekday. When do you work? What are your fixed commitments?"
5. **Energy Patterns**: "When during the day do you feel most focused and energized?"

#### 3.1.3 Interview Questions (Deep Dive - Additional)
6. **Obstacles**: "What usually prevents you from making progress on important goals?"
7. **Energy Creators**: "What activities or types of work energize you?"
8. **Energy Drainers**: "What activities consistently drain your energy?"
9. **Current Commitments**: "What recurring weekly commitments do you have? (meetings, family time, etc.)"
10. **Work Style**: "Do you prefer long focus blocks or shorter, varied work sessions?"

#### 3.1.4 AI Interview Behavior
- Conversational tone, not form-like
- SMART goal validation (Specific, Measurable, Achievable, Relevant, Time-bound)
- Gentle probing for clarity: "Can you be more specific about X?"
- Saves partial progress (user can resume later)
- Progressive profiling: Continues gathering context over first 7 days through casual check-ins

#### 3.1.5 Interview Output
AI generates:
- Primary goal with SMART breakdown
- Initial goal hierarchy (if applicable)
- User's energy profile (Morning/Afternoon/Evening person)
- Identified constraints (time blocks that are protected)
- Initial task suggestions for first week

---

### 3.2 Goal Management System

#### 3.2.1 Goal Hierarchy Structure
```
Vision (Optional)
  └── Long-term Goal (3-12 months)
      └── Quarterly Milestone (3 months)
          └── Monthly Objective (1 month)
              └── Weekly Target (1 week)
                  └── Daily Tasks
```

#### 3.2.2 Goal Properties
- **Title**: Clear, concise goal statement
- **Description**: Detailed context and why it matters
- **Type**: Career, Health, Financial, Relationships, Personal Growth, Creative, Other
- **Timeline**: Start date, target completion date
- **Priority Level**: High, Medium, Low (affects daily task generation)
- **Status**: Active, On Hold, Completed, Archived
- **Parent Goal**: Links to parent in hierarchy (if applicable)
- **Success Criteria**: How you'll know you've achieved it
- **Milestones**: Key checkpoints along the way

#### 3.2.3 Goal Operations
- **Create Goal**: Guided by AI with SMART validation
- **Edit Goal**: Update any properties, AI suggests related task updates
- **Archive Goal**: Remove from active planning but preserve history
- **Link Goals**: Create dependencies between goals
- **Goal Progress View**: Visual representation of completion %

#### 3.2.4 Multiple Concurrent Goals
- Support 1-5 active goals simultaneously
- Priority weighting affects daily task allocation
- AI balances task generation across all active goals
- Visual dashboard shows progress on all goals

---

### 3.3 Intelligent Task Management

#### 3.3.1 Task Properties
**Core Properties**
- **Title**: Clear action statement (starts with verb)
- **Description**: Context and details (optional)
- **Due Date**: Target completion date/time
- **Estimated Duration**: AI-generated, user-adjustable (15min, 30min, 1hr, 2hr, 4hr, Full Day)
- **Actual Duration**: Tracked when task completed
- **Linked Goal**: Which goal this task serves
- **Status**: Todo, In Progress, Completed, Cancelled

**Energy & Context Properties**
- **Energy Level Required**: High, Medium, Low
  - High: Deep work, complex problem-solving, creative work
  - Medium: Steady work, meetings, routine tasks
  - Low: Admin, emails, light research
- **Task Type**: Deep Work, Admin, Communication, Learning, Creative, Physical, Planning
- **Context Tags**: Location, tools needed, people involved (for batching)

**Priority Properties**
- **Eisenhower Quadrant**: 
  - Q1: Urgent & Important (Do First)
  - Q2: Not Urgent but Important (Schedule)
  - Q3: Urgent but Not Important (Delegate/Minimize)
  - Q4: Not Urgent & Not Important (Eliminate)
- **AI Priority Score**: 0-100 (calculated daily based on multiple factors)

**Advanced Properties**
- **Recurrence**: None, Daily, Weekly, Custom
- **Subtasks**: Breakdown of larger tasks
- **Dependencies**: Must be completed before/after other tasks
- **Deadline Type**: Hard deadline vs Flexible target
- **Procrastination Flag**: AI detects if repeatedly postponed

#### 3.3.2 Task Sources
1. **AI-Generated**: Daily suggestions from AI based on goals
2. **User-Created**: Manually added tasks
3. **Backlog-Promoted**: User or AI promotes from backlog
4. **Recurring Tasks**: Auto-generated from templates

#### 3.3.3 AI Task Generation Logic
**Daily Task Generation (runs each morning or when user opens app)**

AI considers:
1. **Active Goals**: Priority level and current progress
2. **Goal Hierarchy**: What's needed at each level
3. **Time Available**: User's typical schedule and commitments
4. **Energy Pattern**: User's peak focus times
5. **Recent Completion History**: Velocity and patterns
6. **Blockers**: Tasks waiting on dependencies
7. **Upcoming Deadlines**: Time-sensitive items
8. **Task Diversity**: Mix of task types for variety
9. **Eisenhower Matrix**: Balance across quadrants
10. **Parkinson's Law**: Appropriate time constraints

**Generation Rules**
- Maximum 3-5 high-priority tasks per day (prevent overwhelm)
- Match task energy to user's energy curve
- Batch similar tasks (all emails, all calls, etc.)
- Include mix of quick wins (dopamine) and progress on big tasks
- Q2 tasks (Important/Not Urgent) get priority to prevent urgency trap
- One "Eat the Frog" task (hardest first, when energy is high)

**Task Breakdown**
- If goal requires >2 hours work, AI suggests breaking into subtasks
- Subtasks have own duration estimates
- Progressive disclosure: show top-level task, expand to see subtasks

#### 3.3.4 Task Operations
- **Create Task**: Quick add or detailed form
- **Edit Task**: Modify any property
- **Complete Task**: Mark done, record actual duration
- **Postpone Task**: Reschedule with reason (AI learns from patterns)
- **Cancel Task**: Remove with reason (AI learns what's not valuable)
- **Split Task**: Break into multiple tasks
- **Merge Tasks**: Combine related tasks
- **Convert to Project**: Upgrade to goal if it's bigger than thought

---

### 3.4 Backlog Management

#### 3.4.1 Backlog Purpose
A holding area for:
- Ideas that aren't ready to schedule
- Tasks without clear deadlines
- "Someday/Maybe" items
- Tasks demoted from active TODO list

#### 3.4.2 Backlog Properties
Each backlog item has:
- **Title**: Brief description
- **Category**: Idea, Task, Project, Research, Learn
- **Related Goal**: Optional link to goal
- **Added Date**: When it entered backlog
- **Priority**: Nice to have, Important, Critical
- **Status**: New, Reviewing, Ready, Parked

#### 3.4.3 Backlog Operations
- **Quick Capture**: Voice or text input for rapid idea dump
- **Categorize**: AI suggests category and related goal
- **Promote to TODO**: Move to active task list with scheduling
- **Bulk Review**: AI-assisted weekly backlog review
- **Archive**: Remove from active view but preserve

#### 3.4.4 AI Backlog Intelligence
**Weekly Backlog Review (automated)**
- AI reviews all backlog items
- Suggests items ready to schedule based on:
  - Goal relevance
  - Time since added
  - Current goal progress gaps
  - User's available capacity
- Identifies stale items: "This has been in backlog for 90 days. Still relevant?"

**Smart Prioritization**
- Eisenhower Matrix categorization
- Effort vs Impact scoring
- Alignment with active goals
- Optimal timing suggestions

#### 3.4.5 Backlog Views
- **All Items**: Complete list
- **By Category**: Grouped by type
- **By Goal**: Grouped by related goal
- **AI Suggested**: Items AI recommends scheduling soon
- **Stale Items**: Items older than 60 days

---

### 3.5 Daily Planning & Execution

#### 3.5.1 Morning Planning Session
**Auto-triggered when user opens app in morning (before 11 AM)**

**Flow:**
1. **Greeting**: "Good morning! Ready to make today count?"
2. **AI-Generated Plan**: Shows 3-5 prioritized tasks for today
   - Includes duration estimates
   - Energy level indicators
   - Optimal scheduling suggestions
3. **User Review**: 
   - Accept plan as-is
   - Adjust priorities
   - Add/remove tasks
   - Modify schedule
4. **Day Commitment**: "Here's your plan. You've got this!"

**AI Plan Generation considers:**
- Available time today (excluding known commitments)
- User's energy curve
- Goal priorities
- Upcoming deadlines
- Task dependencies
- Previous day's completion rate (adjust volume if needed)

#### 3.5.2 During the Day
**Quick Actions**
- **Complete Task**: Check off, log completion time
- **Start Task**: Begin timer, enter focus mode
- **Postpone Task**: Snooze to later today or reschedule
- **Add New Task**: Quick capture for unexpected tasks
- **Chat with AI**: Ask questions, get suggestions

**Focus Mode**
- Full-screen task view
- Pomodoro timer (25 min work, 5 min break)
- Distraction blockers (optional browser extension idea for v2)
- Background ambient sound (optional)
- Progress indicator

**Real-time Adjustments**
- If task takes longer than estimated, AI adjusts rest of day
- If unexpected tasks appear, AI suggests what to defer
- Energy check-ins: "Feeling focused or drained right now?"

#### 3.5.3 Evening Reflection
**Auto-triggered when user opens app after 6 PM or when they complete last task**

**Flow:**
1. **Completion Summary**: "You completed X of Y tasks today. Nice work!"
2. **Reflection Questions** (2-3 quick questions):
   - "What went well today?"
   - "What blocked you?" (if tasks weren't completed)
   - "How's your energy level right now?" (scale 1-10)
3. **Tomorrow Preview**: AI shows draft plan for tomorrow
4. **Encouragement**: Personalized message based on day's progress

**AI Learning**
- Tracks completion patterns
- Notes energy levels at different times
- Identifies recurring blockers
- Adjusts future task estimates

---

### 3.6 Weekly Review & Summary

#### 3.6.1 Weekly Summary (Auto-generated Sunday evening or Monday morning)

**Summary Includes:**

**Accomplishments Section**
- Total tasks completed
- Total time invested
- Progress on each active goal (%)
- Key wins (most impactful completions)
- Streak info (days with >80% completion rate)

**Insights Section**
- "You're most productive on [days]"
- "You complete [task type] tasks X% faster than estimated"
- "Your energy peaks around [time]"
- "You're making strong progress on [goal], but [other goal] needs attention"

**Challenges Section**
- Tasks repeatedly postponed (procrastination patterns)
- Blockers that appeared multiple times
- Energy dips noted

**Looking Ahead**
- "Next week, focus on [goal/task type]"
- Suggested adjustments to improve
- Backlog items ready to schedule
- Milestones approaching

**Celebration**
- Visual progress indicators
- Encouragement and motivation
- Streak achievements
- Personal best metrics

#### 3.6.2 Weekly Planning
**User can trigger or AI prompts on Sunday/Monday**

**Flow:**
1. Review last week's summary
2. Adjust goal priorities if needed
3. AI suggests weekly objectives for each goal
4. Review and accept/modify
5. AI generates draft Monday tasks

---

### 3.7 Energy Management System

#### 3.7.1 Energy Calendar
**Purpose**: Visualize and optimize energy allocation across time

**Features:**
- **Energy Tracking**: Log energy levels throughout day
- **Energy Pattern Recognition**: AI identifies when you're most/least energized
- **Energy-Task Matching**: AI schedules high-energy tasks during peak hours
- **Energy Creators/Drainers**: Visual indicators on tasks

**Data Collection:**
- Daily energy check-ins (morning, midday, evening)
- Post-task energy ratings ("Did this energize or drain you?")
- Weekly energy summary scores

**Visualizations:**
- Heatmap: Energy levels across days/hours
- Task breakdown: % time on energy creators vs drainers
- Goal energy profile: Which goals energize you most?

#### 3.7.2 Two-List Exercise Integration
During onboarding or weekly review, user can update:
- **Energy Creators List**: Activities that energize you
- **Energy Drainers List**: Activities that exhaust you

AI uses these lists to:
- Prioritize energy creator tasks
- Batch or minimize energy drainer tasks
- Suggest delegation for drainers (future feature)
- Warn when day is too drainer-heavy

---

### 3.8 Time Wealth Productivity Systems

#### 3.8.1 Eisenhower Matrix (Built-in Feature)
**Implementation:**
- Every task auto-categorized by AI into one of 4 quadrants
- User can override AI categorization
- Dashboard view showing task distribution across quadrants
- AI coaching: "You're spending too much time in Q3 (Urgent/Not Important). Let's move these to Q2."

**Task Distribution Goals:**
- Q1 (Urgent & Important): <20% of tasks (crisis mode)
- Q2 (Not Urgent but Important): >50% of tasks (ideal zone)
- Q3 (Urgent but Not Important): <20% of tasks (minimize)
- Q4 (Not Urgent & Not Important): <10% of tasks (eliminate)

**Visual Dashboard:**
- 2x2 grid showing task counts in each quadrant
- Weekly comparison: "You moved 5 more tasks to Q2 this week!"
- Goal-specific matrix: See Eisenhower breakdown per goal

#### 3.8.2 Parkinson's Law Enforcement
**Implementation:**
- AI sets appropriate time constraints on tasks
- Shorter deadlines for tasks that don't need full allotted time
- Progress warnings: "This task is taking longer than estimated. Time to wrap up?"
- Time boxing: Hard stop reminders

**Rules:**
- If task repeatedly takes longer than estimated, AI adjusts future estimates
- Encourages focus: "You have 45 minutes for this. Go!"

#### 3.8.3 Anti-Procrastination System
**Detection:**
- AI flags tasks postponed 3+ times
- Identifies patterns: "You always postpone [task type] tasks"

**Interventions:**
- Task breakdown: "This feels big. Let's break it into smaller steps."
- 2-minute rule: "This takes <2 min. Do it now?"
- Accountability: "You've postponed this 3 times. What's blocking you?"
- Eat the Frog: "Do this hard task first, while your energy is high"
- Progress motivation: "Just 15 minutes on this today. Start is the hardest part."

**Gamification (optional for v2):**
- Procrastination streaks (to break)
- "Face your fear" challenges
- Reward for completing dreaded tasks

#### 3.8.4 Flow State Boot-Up Sequence
**Focus Mode Features:**
- Pre-work ritual reminder: "Take 2 deep breaths. Clear your space. Let's focus."
- Pomodoro timer (25 min work / 5 min break)
- Do Not Disturb mode suggestion (OS level)
- Single task view (hide all other tasks)
- Ambient music/sounds (optional)
- Progress indicator during work session

**Flow State Analytics:**
- Track which tasks/times lead to flow
- Suggest optimal focus blocks based on history
- "You achieve flow most often on [day] at [time]"

---

### 3.9 Calendar Integration (MVP: Basic View)

#### 3.9.1 Internal Calendar View
**Purpose**: Visualize tasks in time context

**Views:**
- **Daily**: Hour-by-hour view with tasks
- **Weekly**: 7-day grid view
- **Monthly**: Month overview with task density

**Features:**
- Drag-and-drop task scheduling
- Time block creation for focus work
- Conflict detection (overlapping tasks)
- Duration visualization (task length shown)

**Note for MVP**: This is an internal calendar for visualizing TODO tasks only. Google Calendar integration is Phase 2.

#### 3.9.2 Time Blocking
- AI suggests optimal time blocks for deep work
- User can create protected time blocks (e.g., "Family dinner 6-7 PM daily")
- Visual indicators: Work time, Personal time, Focus time, Buffer time

---

### 3.10 AI Chat Interface

#### 3.10.1 Purpose
Natural language interface for:
- Asking questions about goals/tasks
- Getting explanations for AI suggestions
- Quick task creation
- Progress check-ins
- Seeking advice on productivity challenges

#### 3.10.2 Chat Capabilities
**Information Queries:**
- "What should I focus on today?"
- "Why did you suggest [task]?"
- "How am I progressing on [goal]?"
- "When am I most productive?"

**Task Management:**
- "Add task: Call dentist tomorrow at 2 PM"
- "Reschedule [task] to Friday"
- "Break down [task] into steps"

**Coaching:**
- "I'm feeling overwhelmed. Help?"
- "I keep procrastinating on [task]. Why?"
- "How can I be more productive?"

**Analysis:**
- "What are my energy patterns?"
- "Am I spending too much time on urgent tasks?"
- "Which goal needs more attention?"

#### 3.10.3 AI Personality
- Supportive but not coddling
- Direct and actionable
- Celebrates wins genuinely
- Asks probing questions when needed
- Uses user's language style (formal vs casual)
- Remembers context from previous conversations (within session)

---

### 3.11 Progress Tracking & Analytics

#### 3.11.1 Goal Progress
**Per Goal:**
- Completion percentage (based on milestones and tasks)
- Time invested (total hours spent on goal tasks)
- Velocity: Tasks completed per week
- Trend: Accelerating, steady, or slowing?
- Projected completion date (based on current velocity)

**Visual Indicators:**
- Progress bars
- Trend arrows (↑↗→↘↓)
- Milestone completion checklist
- Time remaining to deadline

#### 3.11.2 Task Analytics
**Completion Metrics:**
- Tasks completed today/week/month
- Completion rate (% of planned tasks actually done)
- Average tasks per day
- Longest streak of >80% daily completion

**Time Metrics:**
- Total time invested (by goal, by task type, by day)
- Estimated vs Actual duration accuracy
- Time saved through efficiency gains

**Pattern Recognition:**
- Most productive days/times
- Task types completed fastest/slowest
- Procrastination patterns
- Energy correlation with productivity

#### 3.11.3 Dashboard Views
**Today View:**
- Tasks for today with progress
- Energy level indicator
- Focus time scheduled
- Quick actions

**Goals View:**
- All active goals with progress bars
- Key milestones approaching
- Goals needing attention

**Insights View:**
- Weekly/monthly analytics
- AI insights and patterns
- Productivity score
- Energy management effectiveness

**Calendar View:**
- Tasks visualized in time
- Color-coded by goal or priority
- Time blocks and focus sessions

---

## 4. User Flows

### 4.1 New User Onboarding Flow

```
1. Landing Page
   ↓
2. Sign Up (Clerk)
   - Email/password
   - Google OAuth
   - GitHub OAuth
   ↓
3. Welcome Screen
   - "Let's build your personalized productivity system"
   - Choose: Quick Start (5 min) or Deep Dive (15 min)
   ↓
4. AI Interview
   - Conversational Q&A
   - SMART goal validation
   - Energy pattern capture
   - Schedule understanding
   ↓
5. Goal Setup
   - AI presents goal structure
   - User confirms or adjusts
   - Set priorities
   ↓
6. First Task Generation
   - AI generates initial tasks
   - Explains logic
   - User reviews and approves
   ↓
7. Dashboard Tour
   - Quick tutorial (skippable)
   - Highlight key features
   - Show where everything is
   ↓
8. Ready to Go!
   - "Your first day is planned. Let's do this!"
```

### 4.2 Daily User Flow (Typical Day)

```
Morning (8-11 AM):
1. Open app → Morning greeting
2. Review AI-generated daily plan (3-5 tasks)
3. Adjust if needed (add/remove/reschedule)
4. Start first task → Enter focus mode

During Day:
5. Complete task → Check off
6. Move to next task
7. Add unexpected tasks as they arise
8. Check in: "How's your energy?" (optional)

Evening (6-9 PM):
9. Review day summary
10. Answer 2-3 reflection questions
11. Preview tomorrow's plan
12. Done!

Weekly (Sunday/Monday):
13. Weekly review notification
14. Read summary and insights
15. Adjust goal priorities
16. Accept next week's focus areas
```

### 4.3 Task Creation Flow

```
User-Initiated Task Creation:
1. Click "Add Task" button or use keyboard shortcut
2. Choose:
   a) Quick Add: Title only, AI fills rest
   b) Detailed: Full form
   ↓
3. Enter task title (required)
4. (Optional) Add details:
   - Description
   - Due date
   - Duration estimate
   - Linked goal
   - Energy level
   ↓
5. AI suggests:
   - Best time to schedule
   - Eisenhower quadrant
   - Related tasks (batching opportunity)
   ↓
6. Save → Task added to appropriate list
```

### 4.4 Goal Management Flow

```
Creating a Goal:
1. Navigate to Goals section
2. Click "New Goal"
3. AI Interview Mode:
   - "What's your goal?"
   - "Why does this matter?"
   - "What's your timeline?"
   - "How will you know you've achieved it?"
   ↓
4. AI generates:
   - SMART goal statement
   - Suggested milestones
   - Initial task ideas
   ↓
5. User reviews and confirms
6. Goal added to active goals
7. AI generates first week's tasks

Editing a Goal:
1. Select goal from list
2. View goal details and progress
3. Options:
   - Edit properties
   - Adjust timeline
   - Change priority
   - Add/edit milestones
   - Archive goal
   ↓
4. AI analyzes impact of changes
5. Suggests task updates if needed
6. Save changes
```

---

## 5. Data Models

### 5.1 User Model
```typescript
User {
  id: uuid (PK)
  clerk_user_id: string (unique)
  email: string
  full_name: string
  created_at: timestamp
  updated_at: timestamp
  
  // Profile
  timezone: string
  language: string (default: 'en')
  
  // Preferences
  preferences: {
    work_hours_start: time (e.g., "09:00")
    work_hours_end: time (e.g., "17:00")
    energy_peak_time: enum ('morning', 'afternoon', 'evening', 'night')
    default_task_duration: integer (minutes, default: 60)
    pomodoro_duration: integer (minutes, default: 25)
    daily_task_limit: integer (default: 5)
    enable_notifications: boolean
    enable_email_reminders: boolean
  }
  
  // Onboarding
  onboarding_completed: boolean
  onboarding_mode: enum ('quick', 'deep', null)
  onboarding_data: jsonb (stores interview answers)
  
  // Analytics
  total_tasks_completed: integer
  total_goals_completed: integer
  current_streak_days: integer
  longest_streak_days: integer
  
  // Relationships
  goals: Goal[]
  tasks: Task[]
  backlog_items: BacklogItem[]
  daily_reflections: DailyReflection[]
  energy_logs: EnergyLog[]
}
```

### 5.2 Goal Model
```typescript
Goal {
  id: uuid (PK)
  user_id: uuid (FK → User)
  created_at: timestamp
  updated_at: timestamp
  
  // Goal Details
  title: string (max 200 chars)
  description: text
  type: enum ('career', 'health', 'financial', 'relationships', 'personal_growth', 'creative', 'other')
  
  // Hierarchy
  parent_goal_id: uuid (FK → Goal, nullable) // for goal hierarchies
  level: enum ('vision', 'long_term', 'quarterly', 'monthly', 'weekly')
  
  // Timeline
  start_date: date
  target_date: date
  completed_at: timestamp (nullable)
  
  // Priority & Status
  priority: enum ('high', 'medium', 'low')
  status: enum ('active', 'on_hold', 'completed', 'archived')
  
  // Success Criteria
  success_criteria: text[]
  milestones: Milestone[]
  
  // AI-Generated
  smart_analysis: jsonb {
    specific: boolean
    measurable: boolean
    achievable: boolean
    relevant: boolean
    time_bound: boolean
    ai_suggestions: string
  }
  
  // Progress
  completion_percentage: integer (0-100, calculated)
  total_tasks: integer (calculated)
  completed_tasks: integer (calculated)
  total_time_invested: integer (minutes, calculated)
  
  // Relationships
  child_goals: Goal[]
  tasks: Task[]
  milestones: Milestone[]
}
```

### 5.3 Milestone Model
```typescript
Milestone {
  id: uuid (PK)
  goal_id: uuid (FK → Goal)
  created_at: timestamp
  
  title: string
  description: text (optional)
  target_date: date
  completed: boolean
  completed_at: timestamp (nullable)
  
  order_index: integer // for sorting
}
```

### 5.4 Task Model
```typescript
Task {
  id: uuid (PK)
  user_id: uuid (FK → User)
  goal_id: uuid (FK → Goal, nullable)
  parent_task_id: uuid (FK → Task, nullable) // for subtasks
  created_at: timestamp
  updated_at: timestamp
  
  // Task Details
  title: string (max 200 chars)
  description: text (nullable)
  
  // Scheduling
  due_date: timestamp (nullable)
  scheduled_start: timestamp (nullable)
  scheduled_end: timestamp (nullable)
  deadline_type: enum ('hard', 'flexible', 'none')
  
  // Duration
  estimated_duration_minutes: integer
  actual_duration_minutes: integer (nullable)
  
  // Status
  status: enum ('todo', 'in_progress', 'completed', 'cancelled')
  completed_at: timestamp (nullable)
  cancelled_at: timestamp (nullable)
  cancellation_reason: text (nullable)
  
  // Priority & Energy
  priority_score: integer (0-100, AI-calculated daily)
  energy_required: enum ('high', 'medium', 'low')
  task_type: enum ('deep_work', 'admin', 'communication', 'learning', 'creative', 'physical', 'planning')
  
  // Eisenhower Matrix
  eisenhower_quadrant: enum ('q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important')
  ai_quadrant_reasoning: text
  
  // Context
  context_tags: string[] // for batching: ['email', 'phone', 'computer', 'office', etc.]
  location: string (nullable)
  
  // Recurrence
  is_recurring: boolean
  recurrence_rule: jsonb (nullable) {
    frequency: enum ('daily', 'weekly', 'biweekly', 'monthly', 'custom')
    interval: integer
    end_date: date
    days_of_week: integer[] // 0-6 for Sun-Sat
  }
  parent_recurring_task_id: uuid (nullable)
  
  // Source & Dependencies
  source: enum ('ai_generated', 'user_created', 'backlog_promoted', 'recurring')
  depends_on_task_ids: uuid[] // tasks that must be completed first
  blocking_task_ids: uuid[] // tasks waiting on this one
  
  // Procrastination Tracking
  times_postponed: integer (default: 0)
  first_postponed_at: timestamp (nullable)
  postponement_reasons: text[] (nullable)
  is_procrastination_flagged: boolean
  
  // Energy Impact
  energy_impact: enum ('energizing', 'neutral', 'draining', null) // user-reported after completion
  
  // Relationships
  subtasks: Task[]
  parent_task: Task
  goal: Goal
}
```

### 5.5 Backlog Item Model
```typescript
BacklogItem {
  id: uuid (PK)
  user_id: uuid (FK → User)
  goal_id: uuid (FK → Goal, nullable)
  created_at: timestamp
  updated_at: timestamp
  
  title: string
  description: text (nullable)
  category: enum ('idea', 'task', 'project', 'research', 'learn')
  priority: enum ('nice_to_have', 'important', 'critical')
  status: enum ('new', 'reviewing', 'ready', 'parked')
  
  // AI Analysis
  ai_suggested_schedule_date: date (nullable)
  ai_eisenhower_quadrant: enum (nullable)
  ai_effort_estimate: enum ('small', 'medium', 'large', null)
  ai_impact_score: integer (0-10, nullable)
  
  // Lifecycle
  promoted_to_task_id: uuid (nullable)
  promoted_at: timestamp (nullable)
  archived_at: timestamp (nullable)
  archive_reason: text (nullable)
}
```

### 5.6 Daily Reflection Model
```typescript
DailyReflection {
  id: uuid (PK)
  user_id: uuid (FK → User)
  date: date
  created_at: timestamp
  
  // Completion Stats
  tasks_completed: integer
  tasks_planned: integer
  completion_rate: decimal (0-1)
  
  // User Reflections
  what_went_well: text (nullable)
  what_blocked_me: text (nullable)
  energy_level_end_of_day: integer (1-10)
  
  // AI Analysis
  ai_insights: text
  ai_suggestions: text[]
  
  // Mood/Energy
  mood: enum ('great', 'good', 'okay', 'struggling', 'bad', null)
  focus_quality: integer (1-10, nullable)
}
```

### 5.7 Energy Log Model
```typescript
EnergyLog {
  id: uuid (PK)
  user_id: uuid (FK → User)
  timestamp: timestamp
  
  energy_level: integer (1-10)
  time_of_day: enum ('early_morning', 'morning', 'midday', 'afternoon', 'evening', 'night')
  context: text (optional, what user was doing)
  
  // Task association
  task_id: uuid (nullable) // if logging after completing a task
  task_was_energizing: boolean (nullable)
}
```

### 5.8 Weekly Summary Model
```typescript
WeeklySummary {
  id: uuid (PK)
  user_id: uuid (FK → User)
  week_start_date: date
  week_end_date: date
  created_at: timestamp
  
  // Stats
  total_tasks_completed: integer
  total_tasks_planned: integer
  completion_rate: decimal
  total_time_invested_minutes: integer
  average_daily_tasks: decimal
  days_with_80_percent_completion: integer
  
  // Per Goal Stats
  goal_progress: jsonb[] {
    goal_id: uuid
    goal_title: string
    tasks_completed: integer
    time_invested_minutes: integer
    progress_percentage: decimal
  }
  
  // Energy Stats
  average_energy_level: decimal
  most_energizing_task_types: string[]
  most_draining_task_types: string[]
  
  // Patterns
  most_productive_days: string[] // ['Monday', 'Wednesday']
  most_productive_times: string[] // ['morning', 'afternoon']
  
  // AI Insights
  key_wins: string[]
  challenges: string[]
  patterns_detected: string[]
  suggestions_for_next_week: string[]
  goals_needing_attention: uuid[]
  
  // Backlog Review
  backlog_items_suggested: uuid[]
  
  // Streaks
  current_streak: integer
  new_personal_bests: string[] (nullable)
}
```

### 5.9 AI Conversation Model (Optional for v2)
```typescript
AIConversation {
  id: uuid (PK)
  user_id: uuid (FK → User)
  created_at: timestamp
  updated_at: timestamp
  
  messages: Message[] {
    role: enum ('user', 'assistant')
    content: text
    timestamp: timestamp
  }
  
  context: jsonb // any relevant context for the conversation
  conversation_type: enum ('chat', 'interview', 'reflection', 'coaching')
}
```

---

## 6. AI Integration Points

### 6.1 AI Provider Setup

**Models to Use:**
- **Claude Sonnet (claude-sonnet-4-20250514)**: Complex reasoning, goal analysis, coaching, weekly summaries
- **Claude Haiku (claude-haiku-3-5-20250101)**: Quick tasks, simple classifications, routine generations

**API Integration via Vercel AI SDK:**
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

// For complex tasks (goal analysis, coaching)
const sonnet = anthropic('claude-sonnet-4-20250514');

// For simple tasks (task categorization, quick responses)
const haiku = anthropic('claude-haiku-3-5-20250101');
```

### 6.2 AI Use Cases & Prompts

#### 6.2.1 Onboarding Interview (Sonnet)
**Purpose**: Guide user through goal setup with empathy and SMART validation

**Prompt Template:**
```
You are an AI productivity coach conducting an onboarding interview. Your goal is to understand the user's primary goal, their context, and their constraints to build a personalized productivity system.

Interview Mode: {quick | deep}
Current Question: {question_number} of {total_questions}

User's Previous Answers:
{previous_answers}

Ask the next question in a conversational, empathetic tone. If the user's answer is vague, ask a follow-up clarifying question. Validate answers against SMART criteria when relevant.

Current Question to Ask: {current_question}
```

**Expected Output**: JSON
```json
{
  "ai_message": "Conversational question or follow-up",
  "needs_clarification": boolean,
  "smart_validation": {
    "is_specific": boolean,
    "is_measurable": boolean,
    "feedback": "string"
  },
  "proceed_to_next": boolean
}
```

#### 6.2.2 Daily Task Generation (Sonnet)
**Purpose**: Generate 3-5 prioritized tasks for the day

**Prompt Template:**
```
You are an AI productivity assistant. Generate a daily task plan for the user.

User Context:
- Active Goals: {goals_with_priorities}
- Current Day: {day_of_week}, {date}
- Available Time: {work_hours_start} to {work_hours_end}
- Energy Peak: {energy_peak_time}
- Recent Completion Rate: {last_7_days_completion_rate}
- Tasks Completed Yesterday: {tasks_completed_yesterday}

User's Energy Pattern:
- Morning energy: {morning_energy_level}
- Afternoon energy: {afternoon_energy_level}
- Evening energy: {evening_energy_level}

Existing Commitments Today:
{existing_calendar_blocks}

Available Tasks Pool:
- Goal tasks that need progress: {goal_tasks}
- Overdue tasks: {overdue_tasks}
- High-priority backlog items: {backlog_priorities}
- Recurring tasks due today: {recurring_tasks}

Instructions:
1. Select 3-5 tasks maximum (don't overwhelm the user)
2. Match task energy levels to user's energy curve
3. Include one "Eat the Frog" task (hardest/most important)
4. Batch similar task types when possible
5. Prioritize Q2 tasks (Important but Not Urgent)
6. Consider task dependencies
7. Apply Parkinson's Law (set appropriate time constraints)
8. Balance across active goals based on their priorities

Output Format: Return JSON with task list and reasoning.
```

**Expected Output**: JSON
```json
{
  "daily_tasks": [
    {
      "task_id": "uuid | 'new'",
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": integer,
      "energy_required": "high | medium | low",
      "task_type": "string",
      "eisenhower_quadrant": "string",
      "suggested_time_block": "HH:MM - HH:MM",
      "linked_goal_id": "uuid",
      "is_eat_the_frog": boolean,
      "reasoning": "Why this task today"
    }
  ],
  "daily_message": "Encouraging message for the day",
  "focus_suggestion": "Primary goal or theme for today"
}
```

#### 6.2.3 Task Breakdown (Sonnet)
**Purpose**: Break large task into manageable subtasks

**Prompt Template:**
```
Break down this task into actionable subtasks:

Task Title: {task_title}
Task Description: {task_description}
Estimated Duration: {estimated_duration}
Goal Context: {related_goal}

Create 3-7 subtasks that:
1. Are specific and actionable (start with verbs)
2. Can be completed independently
3. Have clear completion criteria
4. Take 15-90 minutes each
5. Follow a logical sequence

Return JSON format.
```

**Expected Output**: JSON
```json
{
  "subtasks": [
    {
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": integer,
      "order": integer
    }
  ],
  "breakdown_reasoning": "Why this breakdown makes sense"
}
```

#### 6.2.4 Eisenhower Categorization (Haiku)
**Purpose**: Quickly categorize tasks into Eisenhower Matrix

**Prompt Template:**
```
Categorize this task into the Eisenhower Matrix:

Task: {task_title}
Description: {task_description}
Related Goal: {goal_context}
Due Date: {due_date}
User's Goal Priorities: {user_goal_priorities}

Return:
- Quadrant: q1_urgent_important | q2_not_urgent_important | q3_urgent_not_important | q4_not_urgent_not_important
- Brief reasoning (1 sentence)

JSON format only.
```

**Expected Output**: JSON
```json
{
  "quadrant": "q2_not_urgent_important",
  "reasoning": "Directly advances primary goal with no immediate deadline"
}
```

#### 6.2.5 Procrastination Analysis (Sonnet)
**Purpose**: Analyze why user is avoiding a task and suggest interventions

**Prompt Template:**
```
The user has postponed this task {times_postponed} times:

Task: {task_title}
Description: {task_description}
Reasons Given: {postponement_reasons}
Task Type: {task_type}
Energy Required: {energy_required}
Estimated Duration: {estimated_duration}

Analyze why the user might be avoiding this and suggest 3 interventions:
1. Break it down (if too big)
2. Reduce scope (if too ambitious)
3. Identify blocker (if unclear next step)
4. Energy mismatch (if wrong time of day)
5. Lack of motivation (if not connected to meaningful goal)

Return JSON.
```

**Expected Output**: JSON
```json
{
  "likely_reason": "string",
  "suggested_interventions": [
    {
      "type": "breakdown | reduce_scope | clarify | reschedule | reconnect_to_goal",
      "description": "string",
      "action_items": ["string"]
    }
  ],
  "encouraging_message": "string"
}
```

#### 6.2.6 Evening Reflection Analysis (Sonnet)
**Purpose**: Analyze user's day and provide insights

**Prompt Template:**
```
Analyze the user's day and provide insights:

Tasks Completed Today: {completed_tasks}
Tasks Incomplete: {incomplete_tasks}
Completion Rate: {completion_rate}%
Energy Level (End of Day): {energy_level}/10

User's Reflection:
- What went well: {what_went_well}
- What blocked me: {what_blocked_me}
- Mood: {mood}

Recent Patterns (Last 7 Days):
- Average completion rate: {avg_completion_rate}%
- Common blockers: {common_blockers}
- Energy trends: {energy_trends}

Provide:
1. Acknowledgment of today's progress
2. 1-2 key insights from today
3. 1 actionable suggestion for tomorrow
4. Encouraging message

Keep tone supportive but honest. Don't sugarcoat if there's a pattern of low completion.
```

**Expected Output**: JSON
```json
{
  "acknowledgment": "string",
  "insights": ["string", "string"],
  "suggestion_for_tomorrow": "string",
  "encouraging_message": "string"
}
```

#### 6.2.7 Weekly Summary Generation (Sonnet)
**Purpose**: Create comprehensive weekly review with insights

**Prompt Template:**
```
Generate a weekly summary for the user:

Week: {week_start_date} to {week_end_date}

Stats:
- Tasks completed: {tasks_completed} / {tasks_planned}
- Completion rate: {completion_rate}%
- Time invested: {time_invested_hours} hours
- Days with >80% completion: {high_completion_days}
- Goals worked on: {goals_list}

Per-Goal Progress:
{goal_progress_details}

Daily Reflections:
{daily_reflections_summary}

Energy Data:
- Average energy: {avg_energy}/10
- Most energizing tasks: {energizing_tasks}
- Most draining tasks: {draining_tasks}
- Best time of day: {best_time}

Patterns Detected:
- Most productive days: {productive_days}
- Common blockers: {common_blockers}
- Procrastination patterns: {procrastination_data}

Generate:
1. Accomplishments summary (celebratory)
2. Key wins (3-5 specific achievements)
3. Insights (3-5 patterns noticed)
4. Challenges (2-3 areas for improvement)
5. Suggestions for next week (3 actionable recommendations)
6. Goals needing attention (which goals fell behind)
7. Backlog items ready to promote (if any)

Tone: Encouraging but realistic. Celebrate wins genuinely. Be direct about challenges.
```

**Expected Output**: JSON
```json
{
  "accomplishments_summary": "string",
  "key_wins": ["string"],
  "insights": ["string"],
  "challenges": ["string"],
  "suggestions_for_next_week": ["string"],
  "goals_needing_attention": [
    {
      "goal_id": "uuid",
      "goal_title": "string",
      "reason": "string"
    }
  ],
  "backlog_suggestions": ["uuid"],
  "motivational_message": "string"
}
```

#### 6.2.8 Backlog Review & Prioritization (Sonnet)
**Purpose**: Review backlog items and suggest which to schedule

**Prompt Template:**
```
Review the user's backlog and suggest items to schedule:

Active Goals: {goals_with_priorities}
Current Week Focus: {current_week_focus}
Available Capacity: {estimated_available_hours} hours this week

Backlog Items:
{backlog_items_with_metadata}

For each backlog item, analyze:
1. Relevance to active goals
2. Effort vs Impact
3. Optimal timing
4. Dependencies

Suggest 3-5 items ready to move to active tasks.
Identify 3-5 stale items (>60 days old) to review/archive.
```

**Expected Output**: JSON
```json
{
  "suggested_to_schedule": [
    {
      "backlog_item_id": "uuid",
      "title": "string",
      "reasoning": "string",
      "suggested_week": "string",
      "estimated_effort": "small | medium | large"
    }
  ],
  "stale_items_to_review": [
    {
      "backlog_item_id": "uuid",
      "title": "string",
      "days_in_backlog": integer,
      "suggestion": "archive | rescope | schedule"
    }
  ]
}
```

#### 6.2.9 Chat Assistant (Sonnet)
**Purpose**: Answer user questions about their productivity system

**Prompt Template:**
```
You are the user's AI productivity coach. Answer their question based on their data.

User Question: {user_message}

Available Context:
- Active Goals: {goals}
- Today's Tasks: {todays_tasks}
- Recent Completion Rate: {completion_rate}
- Energy Patterns: {energy_patterns}
- Recent Reflections: {recent_reflections}

Provide a helpful, actionable response. If the question requires data you don't have, say so clearly.

Tone: Supportive, direct, conversational. No corporate jargon.
```

### 6.3 AI Cost Optimization Strategy

**Use Haiku for:**
- Simple categorizations (Eisenhower Matrix)
- Quick yes/no decisions
- Task duration estimates
- Context tag suggestions
- Simple formatting

**Use Sonnet for:**
- Goal interviews and SMART validation
- Daily plan generation (complex reasoning)
- Procrastination analysis (psychological insight needed)
- Weekly summaries (comprehensive analysis)
- Coaching conversations
- Breaking down complex tasks

**Caching Strategy:**
- Cache user profile/goals context for 5-minute sessions
- Cache system prompts (interview templates, etc.)
- Don't send full task history, only relevant recent data

**Estimated Costs (rough):**
- Onboarding interview: ~$0.10-0.20 per user (one-time)
- Daily task generation: ~$0.02 per day
- Evening reflection: ~$0.01 per day
- Weekly summary: ~$0.05 per week
- Chat messages: ~$0.01-0.03 per message

**Monthly cost per active user: ~$1-2**

---

## 7. Technical Implementation

### 7.1 Tech Stack Summary

**Frontend:**
- Next.js 14+ (App Router, React Server Components)
- TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI or shadcn/ui for components

**Backend:**
- Next.js API Routes (serverless functions)
- Supabase (PostgreSQL database, real-time subscriptions)
- Supabase Edge Functions (optional for heavy background jobs)

**Authentication:**
- Clerk (auth provider)
- Middleware for protecting routes

**AI:**
- Vercel AI SDK (@ai-sdk/anthropic)
- Claude Sonnet 4 for complex reasoning
- Claude Haiku for simple tasks

**State Management:**
- Zustand or Jotai (lightweight)
- React Query for server state

**Date/Time:**
- date-fns for manipulation
- User's timezone handling

**Emails:**
- Resend for transactional emails

**Deployment:**
- Vercel (frontend + API routes)
- Supabase Cloud (database)

**Analytics (Optional for MVP):**
- Plausible or PostHog (privacy-focused)

### 7.2 Folder Structure

```
/app
  /(auth)
    /sign-in
    /sign-up
  /(dashboard)
    /dashboard          # Main dashboard
    /goals             # Goal management
    /tasks             # Task list views
    /backlog           # Backlog management
    /calendar          # Calendar view
    /analytics         # Progress & analytics
    /chat              # AI chat interface
    /settings          # User settings
  /api
    /ai
      /interview       # AI interview endpoints
      /generate-tasks  # Daily task generation
      /analyze-day     # Evening reflection analysis
      /chat           # Chat with AI
    /tasks
      /create
      /update
      /delete
    /goals
      /create
      /update
    /backlog
      /review
  /onboarding          # New user onboarding flow
  
/components
  /ui                  # Reusable UI components (buttons, modals, etc.)
  /tasks               # Task-specific components
  /goals               # Goal-specific components
  /dashboard           # Dashboard widgets
  /calendar            # Calendar components
  
/lib
  /ai                  # AI integration utilities
  /supabase            # Supabase client setup
  /utils               # Helper functions
  /hooks               # Custom React hooks
  /stores              # Zustand stores
  
/types                 # TypeScript type definitions

/supabase
  /migrations          # Database migrations
  /seed.sql           # Seed data for development
```

### 7.3 Database Setup (Supabase)

**Key Considerations:**

1. **Row Level Security (RLS)**
   - Enable RLS on all tables
   - Users can only access their own data
   ```sql
   -- Example RLS policy for tasks table
   CREATE POLICY "Users can view their own tasks"
   ON tasks FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Indexes for Performance**
   ```sql
   -- Common query indexes
   CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);
   CREATE INDEX idx_tasks_due_date ON tasks(due_date);
   CREATE INDEX idx_goals_user_id_status ON goals(user_id, status);
   ```

3. **Real-time Subscriptions**
   - Enable real-time for tasks table (for live updates)
   - Use sparingly to avoid performance issues

4. **Database Functions**
   ```sql
   -- Function to calculate goal completion percentage
   CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
   RETURNS INTEGER AS $$
   DECLARE
     total_tasks INTEGER;
     completed_tasks INTEGER;
   BEGIN
     SELECT COUNT(*) INTO total_tasks
     FROM tasks WHERE goal_id = goal_uuid;
     
     SELECT COUNT(*) INTO completed_tasks
     FROM tasks WHERE goal_id = goal_uuid AND status = 'completed';
     
     IF total_tasks = 0 THEN
       RETURN 0;
     ELSE
       RETURN ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
     END IF;
   END;
   $$ LANGUAGE plpgsql;
   ```

### 7.4 API Routes Architecture

**Key API Endpoints:**

**AI Routes:**
- `POST /api/ai/interview` - Process interview responses
- `POST /api/ai/generate-tasks` - Generate daily tasks
- `POST /api/ai/analyze-day` - Evening reflection analysis
- `POST /api/ai/weekly-summary` - Generate weekly summary
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/breakdown-task` - Break task into subtasks
- `POST /api/ai/analyze-procrastination` - Procrastination help

**Task Routes:**
- `GET /api/tasks` - List user's tasks (with filters)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/complete` - Mark complete
- `POST /api/tasks/[id]/postpone` - Postpone task

**Goal Routes:**
- `GET /api/goals` - List user's goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Archive goal

**Backlog Routes:**
- `GET /api/backlog` - List backlog items
- `POST /api/backlog` - Add to backlog
- `POST /api/backlog/[id]/promote` - Promote to task

**Reflection Routes:**
- `POST /api/reflections/daily` - Save daily reflection
- `GET /api/reflections/weekly` - Get weekly summary

**Energy Routes:**
- `POST /api/energy/log` - Log energy level
- `GET /api/energy/patterns` - Get energy patterns

### 7.5 State Management Strategy

**Zustand Stores:**

```typescript
// /lib/stores/taskStore.ts
import create from 'zustand';

interface TaskStore {
  todayTasks: Task[];
  allTasks: Task[];
  isLoading: boolean;
  fetchTodayTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  // ... more actions
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // ... implementation
}));
```

**React Query for Server State:**
```typescript
// /lib/hooks/useTasks.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useTodayTasks() {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => fetch('/api/tasks?filter=today').then(r => r.json()),
  });
}

export function useCompleteTask() {
  return useMutation({
    mutationFn: (taskId: string) => 
      fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['tasks']);
    },
  });
}
```

### 7.6 Authentication & Authorization

**Clerk Setup:**
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhooks"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Get User in API Route:**
```typescript
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Fetch user's data from Supabase
  // ...
}
```

**Sync Clerk User to Supabase:**
- Use Clerk webhooks to sync user creation/updates
- Store Clerk user ID in Supabase User table

### 7.7 Real-time Updates

**Supabase Real-time for Task Updates:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to task changes
useEffect(() => {
  const subscription = supabase
    .channel('tasks-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // Update local state
        console.log('Task changed:', payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

### 7.8 Background Jobs (Optional for MVP)

**Use Cases:**
- Daily task generation (runs at 6 AM user's timezone)
- Weekly summary generation (runs Sunday evening)
- Backlog review reminders
- Email notifications

**Implementation Options:**
1. **Vercel Cron Jobs** (simplest for MVP)
2. **Supabase Edge Functions** with pg_cron
3. **Trigger.dev** (dedicated background job platform)

**Example Vercel Cron:**
```typescript
// /app/api/cron/generate-daily-tasks/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all active users
  // For each user, generate daily tasks
  // ...

  return NextResponse.json({ success: true });
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-daily-tasks",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## 8. Security & Privacy

### 8.1 Data Security

**Encryption:**
- Supabase provides encryption at rest (default)
- Use Supabase's built-in auth (via Clerk integration)
- For sensitive fields (goal descriptions, reflections), consider client-side encryption before storage

**Row Level Security:**
- All tables have RLS policies
- Users can only access their own data
- API routes validate user ownership before operations

**API Security:**
- All API routes check authentication via Clerk
- Rate limiting on AI endpoints (prevent abuse)
- Input validation and sanitization
- CORS policies properly configured

### 8.2 Privacy Policy

**Key Points to Include:**
1. **Data We Collect:**
   - Account info (email, name)
   - Goals, tasks, reflections
   - Energy logs and analytics
   - Usage patterns

2. **How We Use Data:**
   - Provide AI-powered task generation
   - Improve recommendations over time
   - Generate insights and summaries
   - **We never sell data**

3. **AI Processing:**
   - Data sent to Anthropic API for AI features
   - Anthropic doesn't train on user data
   - Minimal data sent (only necessary context)

4. **User Rights:**
   - Export all data (JSON format)
   - Delete all data permanently
   - Opt out of analytics
   - Control email notifications

5. **Data Retention:**
   - Active accounts: Data retained indefinitely
   - Deleted accounts: Data purged within 30 days
   - Backup retention: 90 days

### 8.3 GDPR Compliance

**User Rights Implementation:**
- **Right to Access**: Export feature in settings
- **Right to Deletion**: Account deletion in settings
- **Right to Rectification**: Edit any data
- **Data Portability**: JSON export of all data

**Consent:**
- Clear opt-in for email notifications
- Separate consent for analytics
- Consent recorded in database

### 8.4 Terms of Service

**Key Sections:**
- User responsibilities
- Acceptable use policy
- AI limitations and disclaimers
- Data ownership (user owns their data)
- Service availability (no guarantees)
- Termination conditions

---

## 9. MVP Scope & Phases

### 9.1 MVP (Version 1.0) - Core Features Only

**Timeline: 6-8 weeks for full-stack solo developer**

**Must-Have Features:**
✅ User authentication (Clerk)
✅ Onboarding AI interview (Quick Start mode)
✅ Goal creation and management (1 level hierarchy)
✅ AI daily task generation
✅ Manual task CRUD
✅ Task completion tracking
✅ Basic backlog (add, promote, view)
✅ Daily check-in (morning plan review)
✅ Evening reflection (3 questions)
✅ Weekly summary (auto-generated)
✅ Eisenhower Matrix categorization
✅ Energy level tracking (basic)
✅ Internal calendar view (week view)
✅ Simple dashboard (today's tasks + goal progress)
✅ Basic AI chat (Q&A)
✅ Privacy policy & terms

**Simplified for MVP:**
- Single goal hierarchy level (no vision → long-term → quarterly nesting)
- Basic energy tracking (1-10 scale, no complex patterns)
- Pre-built Eisenhower Matrix (no custom frameworks)
- Text-only AI chat (no voice)
- Email notifications only for critical events
- Basic analytics (completion rate, time spent)

**Deferred to Phase 2:**
- Deep Dive interview mode
- Multi-level goal hierarchies
- Advanced energy analytics
- Google Calendar integration
- Task dependencies
- Recurring tasks
- Subtask breakdown
- Advanced AI coaching
- Mobile app

### 9.2 Phase 2 (Version 1.5) - Enhanced Intelligence

**Timeline: 4-6 weeks**

**Features:**
✅ Google Calendar two-way sync
✅ Advanced energy management (Energy Calendar view)
✅ Task dependencies and blocking
✅ Recurring task templates
✅ Automatic subtask breakdown
✅ Advanced procrastination interventions
✅ Goal hierarchy (3 levels)
✅ Deep Dive interview mode
✅ Focus mode with Pomodoro timer
✅ Enhanced AI coaching conversations
✅ Monthly goal reviews
✅ Advanced analytics dashboard
✅ Backlog AI prioritization
✅ Email digest options

### 9.3 Phase 3 (Version 2.0) - Scale & Collaboration

**Timeline: 6-8 weeks**

**Features:**
✅ Native mobile app (React Native)
✅ Voice input for tasks
✅ Team/accountability features
✅ Goal sharing and collaboration
✅ Integrations (Notion, Todoist, etc.)
✅ API for third-party apps
✅ Advanced visualizations
✅ Habit tracking
✅ AI learning improvements (personal model fine-tuning)
✅ Slack/Discord bot
✅ Browser extension
✅ Offline mode

---

## 10. Success Metrics

### 10.1 User Engagement Metrics

**Daily Active Users (DAU):**
- Target: 60% of registered users active daily
- Definition: Opens app and views dashboard

**Weekly Active Users (WAU):**
- Target: 80% of registered users active weekly

**Task Completion Rate:**
- Target: Average 70%+ daily completion rate per user
- Indicates task generation is well-calibrated

**Retention:**
- Day 1: 90%
- Day 7: 70%
- Day 30: 50%
- Day 90: 30%

**Session Duration:**
- Morning session: 2-5 minutes (quick planning)
- Evening session: 3-7 minutes (reflection)
- Mid-day check-ins: 30-60 seconds

### 10.2 Product Success Metrics

**Goal Achievement:**
- % of goals marked completed within target date
- Target: 40%+ (realistic for 3-6 month goals)

**AI Quality:**
- Task generation acceptance rate: 80%+ (tasks accepted as-is)
- AI suggestion usefulness: 4+ out of 5 rating
- Chat helpfulness: 4+ out of 5 rating

**User Satisfaction:**
- NPS (Net Promoter Score): 50+
- Weekly review read rate: 70%+
- Settings customization rate: 60%+ (indicates ownership)

**Productivity Improvement:**
- Self-reported productivity increase: 30%+
- Time-to-goal-completion vs baseline: -20%

### 10.3 Business Metrics (for future monetization)

**Conversion Rate (Free to Paid):**
- Target: 5-10% after 2-week trial

**Churn Rate:**
- Target: <5% monthly for paid users

**LTV (Lifetime Value):**
- Target: $200+ per paid user

**CAC (Customer Acquisition Cost):**
- Target: <$50 per user

---

## 11. User Feedback & Iteration

### 11.1 Feedback Collection

**In-App Feedback:**
- Thumbs up/down on AI suggestions
- Rating prompts after completing tasks
- Weekly "How was this week?" survey
- Bug report button (accessible everywhere)

**User Interviews:**
- Schedule calls with 5-10 beta users weekly
- Focus on: What's working? What's frustrating? What's missing?

**Analytics:**
- Track feature usage (which features are unused?)
- A/B test AI prompts and task generation logic
- Monitor drop-off points in onboarding

### 11.2 Continuous Improvement

**Weekly Iteration Cycle:**
1. Review metrics and user feedback
2. Identify top 3 pain points
3. Ship small improvements
4. Monitor impact

**Monthly Major Updates:**
- New feature releases
- AI prompt refinements
- UI/UX improvements

---

## 12. Risks & Mitigation

### 12.1 Technical Risks

**AI API Costs Spiral:**
- **Risk**: Users spam AI chat, costs become unsustainable
- **Mitigation**: Rate limiting, daily usage caps, optimize prompts

**Supabase Performance:**
- **Risk**: Database queries slow down as users grow
- **Mitigation**: Proper indexing, pagination, caching

**Timezone Handling:**
- **Risk**: Tasks generated at wrong time for users in different timezones
- **Mitigation**: Store timezone in user profile, use timezone-aware queries

### 12.2 Product Risks

**AI Generates Bad Tasks:**
- **Risk**: Users lose trust if AI suggestions are irrelevant
- **Mitigation**: Continuous prompt refinement, user feedback loop, override ability

**Overwhelming Users:**
- **Risk**: Too many tasks generated, users feel pressured
- **Mitigation**: Cap daily tasks at 5, tune AI based on completion rates

**Privacy Concerns:**
- **Risk**: Users don't trust sharing personal goals with AI
- **Mitigation**: Clear privacy policy, data encryption, no data selling promise

### 12.3 Business Risks

**Low Retention:**
- **Risk**: Users sign up but don't stick around
- **Mitigation**: Excellent onboarding, early wins (quick value), habit formation

**Competitive Pressure:**
- **Risk**: Larger players (Notion, Todoist) add similar AI features
- **Mitigation**: Focus on personalization edge, community, niche positioning

---

## 13. Go-to-Market Strategy

### 13.1 Beta Launch

**Target Beta Users:**
- Ambitious professionals (your persona)
- Productivity enthusiasts
- People with multiple goals (career + side projects)
- Early adopters who love AI tools

**Beta Launch Channels:**
- Product Hunt launch
- Reddit (r/productivity, r/getdisciplined)
- Twitter (productivity Twitter)
- Indie Hackers community
- Personal network

**Beta Pricing:**
- Free for first 100 users (lifetime)
- Collect feedback actively

### 13.2 Positioning

**Tagline Ideas:**
- "AI that helps you achieve your goals, not just check off tasks"
- "Your personal productivity coach, powered by AI"
- "Goal-first task management"

**Key Differentiators:**
- Goal-focused (not just task-focused like Todoist)
- Energy management (not just time management)
- Personalized AI coach (not generic templates)
- Privacy-first (no data selling)

### 13.3 Content Marketing

**Launch Content:**
- Blog post: "Why traditional TODO apps don't work"
- Blog post: "The Time Wealth framework explained"
- Demo video: 3-minute walkthrough
- Case study: "How I achieved X using this system"

**SEO Strategy:**
- Target keywords: "goal tracking app", "AI productivity assistant", "time management system"
- Content cluster around Time Wealth concepts

---

## 14. Development Roadmap

### 14.1 Week-by-Week Plan (MVP - 8 weeks)

**Week 1-2: Foundation**
- Setup Next.js project, Tailwind, TypeScript
- Setup Supabase project, create database schema
- Implement Clerk authentication
- Build basic layout and navigation
- Deploy to Vercel

**Week 3: Onboarding & Goals**
- Build onboarding flow UI
- Implement AI interview (Quick Start mode)
- Goal creation and management pages
- Goal data persistence

**Week 4: Tasks Core**
- Task CRUD operations
- Task list views (today, all, by goal)
- Task completion tracking
- Basic task properties (title, description, due date)

**Week 5: AI Integration**
- Setup Vercel AI SDK
- Implement daily task generation API
- Eisenhower Matrix categorization
- Connect AI to task creation flow

**Week 6: Daily Rituals**
- Morning planning session UI
- Evening reflection form
- Daily reflection analysis (AI)
- Weekly summary generation (AI)

**Week 7: Backlog & Calendar**
- Backlog management UI
- Internal calendar view (week view)
- Energy tracking basic implementation
- Dashboard with goal progress

**Week 8: Polish & Launch**
- AI chat interface
- Settings page
- Privacy policy & terms
- Bug fixes and polish
- Beta launch preparation

### 14.2 Post-MVP Backlog (Prioritized)

**High Priority (Phase 2):**
1. Google Calendar integration
2. Recurring tasks
3. Task dependencies
4. Pomodoro focus mode
5. Advanced energy analytics

**Medium Priority (Phase 2-3):**
6. Subtask breakdown
7. Multi-level goal hierarchies
8. Enhanced AI coaching
9. Mobile responsive improvements
10. Email notifications

**Low Priority (Phase 3+):**
11. Native mobile app
12. Voice input
13. Team features
14. Third-party integrations
15. API access

---

## 15. Appendix

### 15.1 Glossary

**Terms:**
- **Q1/Q2/Q3/Q4**: Eisenhower Matrix quadrants (Urgent/Important combinations)
- **Eat the Frog**: Doing hardest task first when energy is highest
- **Parkinson's Law**: Work expands to fill time allotted
- **Energy Creator**: Activity that gives you energy
- **Energy Drainer**: Activity that depletes your energy
- **SMART Goal**: Specific, Measurable, Achievable, Relevant, Time-bound
- **Time Wealth**: Having control over how you spend your time

### 15.2 References

**Time Wealth Framework:**
- "The 5 Types of Wealth" book (12 productivity systems)

**Productivity Methodologies:**
- GTD (Getting Things Done) - David Allen
- Deep Work - Cal Newport
- The One Thing - Gary Keller
- Atomic Habits - James Clear

**AI & Product:**
- Anthropic Claude documentation
- Vercel AI SDK documentation
- Supabase documentation

### 15.3 Competitive Analysis

**Direct Competitors:**
- Motion (AI calendar assistant)
- Reclaim AI (smart scheduling)
- Sunsama (daily planning)

**Indirect Competitors:**
- Todoist (task management)
- Notion (all-in-one workspace)
- ClickUp (project management)

**Competitive Advantages:**
1. Goal-first approach (vs task-first)
2. Energy management (vs just time management)
3. Personal AI coach (vs generic automation)
4. Privacy-focused (vs data mining)
5. Time Wealth principles (vs generic productivity)

---

## 16. Final Notes for Implementation

### 16.1 Development Philosophy

**Principles:**
- Ship fast, iterate faster
- User feedback > assumptions
- Simple > complex (for MVP)
- Privacy by default
- Mobile-first responsive design

### 16.2 Testing Strategy

**Unit Tests:**
- AI prompt parsing and response validation
- Date/time utility functions
- Task/goal business logic

**Integration Tests:**
- API routes
- Database operations
- AI integration flows

**E2E Tests (Optional for MVP):**
- Onboarding flow
- Task creation and completion
- Daily planning session

**Manual Testing:**
- Use the app yourself daily (dogfooding)
- Beta users provide feedback
- Track bugs in GitHub Issues

### 16.3 Monitoring & Observability

**Tools:**
- Vercel Analytics (free tier)
- Sentry (error tracking)
- PostHog or Plausible (product analytics)

**Key Metrics to Monitor:**
- API response times
- AI API error rates
- Database query performance
- User signup/retention funnels
- Feature usage rates

### 16.4 Documentation

**For Developers:**
- Setup instructions (README.md)
- API documentation
- Database schema docs
- Deployment guide

**For Users:**
- Onboarding tutorials (in-app)
- Help center (FAQ)
- Video walkthrough
- Blog posts explaining features

---

## 17. Contact & Support Plan

### 17.1 User Support Channels

**For MVP:**
- Email support (reply within 24 hours)
- In-app chat widget (optional)
- FAQ page
- Bug reporting form

**Community (Post-MVP):**
- Discord server
- Reddit community
- Twitter for updates

### 17.2 Feedback Loop

**Continuous Improvement:**
- Weekly user interviews (5 users)
- Monthly feature voting (what to build next)
- Quarterly roadmap sharing
- Transparent development (build in public)

---

**End of Product Requirements Document**

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Prepared For:** AI TODO App Development  
**Prepared By:** Claude (AI Assistant)

---

## Ready for Development!

This specification is comprehensive and ready to be handed to Claude Code or any developer. It includes:

✅ Detailed feature descriptions  
✅ User flows  
✅ Complete data models  
✅ AI integration points with prompts  
✅ Tech stack implementation notes  
✅ Security & privacy considerations  
✅ MVP scope clearly defined  
✅ Week-by-week development roadmap  
✅ Success metrics  
✅ Risk mitigation strategies  

**Next Steps:**
1. Review this document
2. Make any adjustments based on your preferences
3. Hand it to Claude Code with: "Implement the MVP as described in this PRD"
4. Start building! 🚀

---

**Questions or Changes Needed?** Let me know and I'll update the document!
