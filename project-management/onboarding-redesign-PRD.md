# Product Requirements Document: Improved Onboarding Flow

## 1. Problem Statement

The current onboarding flow has significant limitations:
- **Too simplistic**: Quick Setup only captures surface-level goal info (title, date, energy time)
- **Too rigid**: AI Interview asks fixed 5 questions with no flexibility or depth
- **Misses key context**: Doesn't capture what users DON'T want, their daily habits, or routine preferences
- **Single-goal focused**: Users often have a primary goal + supporting habits (reading, walking, routines) but can only enter one goal
- **No routine support**: Doesn't help users build morning/evening routines aligned with their goals

Users abandon onboarding or end up with poorly-defined goals that don't reflect their actual needs.

## 2. User Needs

Users need to:
- **Express complexity**: Define a primary goal + supporting habits and routines
- **Provide context efficiently**: Share relevant information without a 30-minute interrogation
- **Skip irrelevant questions**: Not everyone needs deep introspection - some just want to start
- **Learn from past failures**: Identify what they DON'T want based on previous attempts
- **Build sustainable routines**: Get help creating morning/evening routines that support their goal
- **Control the pace**: Finish in 3 minutes if rushed, or take 10+ minutes for thorough setup

## 3. Feature Specifications

### 3.1 Scope

**In Scope:**
- Redesigned onboarding with two modes: **Quick Mode** (2-3 min) and **Deep Dive Mode** (10-15 min)
- Conversational AI flow with smart follow-ups (Deep Dive only)
- Multi-goal support: primary goal + habits/routines
- Morning and evening routine builder
- Anti-vision capture (what user wants to avoid)
- New `routines` database table
- Updated onboarding UI with skip functionality

**Out of Scope:**
- Life coaching features (Phase 1-5 from inspiration prompt too extensive)
- Long-term vision planning (5-10 year goals)
- Detailed obstacle assessment
- Weekly/monthly check-ins (separate feature)

### 3.2 Onboarding Modes

#### Mode 1: Quick Mode (2-3 minutes)
**Target User**: Busy, knows what they want, just wants to start

**Flow**:
1. Single form with essential fields:
   - Primary goal (text input)
   - Why this matters (textarea)
   - Target completion date (date picker)
   - Typical day structure (time inputs: wake up, work start, work end, sleep)
   - "Anything you want to avoid?" (optional textarea)
   - "Any daily habits you want to build?" (optional multi-select: exercise, reading, meditation, journaling, other)

2. Submit → AI processes in background:
   - Creates primary goal with AI-generated breakdown (if long-term)
   - Creates habit goals for selected daily habits
   - Generates suggested morning/evening routines
   - Creates initial tasks

3. Review screen:
   - Shows primary goal + breakdown
   - Shows suggested routines (can accept/edit/skip)
   - "Start using the app" button → Dashboard

#### Mode 2: Deep Dive Mode (10-15 minutes)
**Target User**: Wants guidance, uncertain about specifics, willing to invest time

**Conversational Flow**:

**Phase 1: Current State (2-3 questions)**
1. "What's the one big goal you want to achieve in the next 3-12 months?"
   - AI acknowledges, asks clarifying question if vague

2. "Walk me through a typical day - when do you wake up, when do you work, when's your free time?"
   - AI extracts: work hours, energy patterns, available time blocks

3. "How do you feel about your current routine?" (optional - can skip)
   - AI listens for satisfaction/frustration signals

**Phase 2: Anti-Vision (1-2 questions, skippable)**
4. "Have you tried to achieve something similar before? What didn't work?"
   - Captures what to avoid
   - If user skips: AI continues without this data

5. "Any specific work styles, environments, or approaches you want to avoid this time?" (optional)

**Phase 3: Vision & Habits (2-3 questions)**
6. "What does success look like for this goal? How will you know you've achieved it?"
   - Extracts success criteria

7. "Besides this main goal, are there any daily habits you want to build?"
   - Examples: "Maybe reading, exercise, journaling?"
   - Multi-part answer supported: "I want to read 30min daily and go for walks"

8. "Do you have any morning or evening routines right now?" (optional)
   - If yes: "What are they?"
   - If no: "Would you like help creating some?"

**Phase 4: AI Processing & Review**
- Shows summary of what was captured
- AI generates:
  - Primary goal with hierarchical breakdown (if applicable)
  - Separate goals for each habit (type: 'personal_growth')
  - Morning routine (recurring time blocks + tasks)
  - Evening routine (recurring time blocks + tasks)
  - Initial tasks for the first week
- User can edit/accept/regenerate before finalizing

**Smart Follow-ups**:
- AI only asks clarifying questions when answers are vague or incomplete
- If user gives detailed answer, AI moves on quickly
- User can type "skip" or click skip button at any question

### 3.3 Technical Specifications

#### New Database Table: `routines`

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  title TEXT NOT NULL, -- e.g., "Morning Routine"
  description TEXT,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening', 'custom')),

  -- Timing
  start_time TIME NOT NULL, -- e.g., '06:00:00'
  end_time TIME NOT NULL,   -- e.g., '07:30:00'

  -- Components (ordered list of activities)
  steps JSONB NOT NULL, -- [{ "title": "Meditation", "duration_minutes": 10, "order": 1 }, ...]

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  total_completions INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2), -- percentage
  last_completed_at TIMESTAMPTZ,

  -- AI-generated or user-created
  source TEXT DEFAULT 'user_created' CHECK (source IN ('ai_generated', 'user_created'))
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_type ON routines(routine_type);

-- RLS Policies
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON routines FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own routines"
  ON routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own routines"
  ON routines FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own routines"
  ON routines FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);
```

#### Updated `onboarding_data` JSONB Structure

```typescript
interface OnboardingData {
  mode: 'quick' | 'deep_dive'
  primary_goal: {
    title: string
    why: string
    target_date: string
    success_criteria: string[]
  }
  anti_vision?: {
    past_failures: string
    things_to_avoid: string[]
  }
  daily_structure: {
    wake_time: string
    work_start: string
    work_end: string
    sleep_time: string
    energy_peak_time: 'morning' | 'afternoon' | 'evening' | 'night'
  }
  habits: Array<{
    type: 'exercise' | 'reading' | 'meditation' | 'journaling' | 'custom'
    frequency: 'daily' | 'weekly'
    custom_name?: string
  }>
  routines: {
    has_existing_morning?: boolean
    has_existing_evening?: boolean
    wants_ai_suggestions: boolean
  }
  conversation_transcript?: Array<{
    question: string
    answer: string
    timestamp: string
  }>
}
```

#### API Endpoints

**POST /api/ai/onboarding/quick**
- Accepts Quick Mode form data
- Generates goals, habits, routines
- Returns structured onboarding result

**POST /api/ai/onboarding/deep-dive/next**
- Stateful conversational endpoint
- Accepts: current_phase, user_answer, conversation_history
- Returns: next_question, can_skip, progress_percentage

**POST /api/ai/onboarding/deep-dive/complete**
- Processes full conversation transcript
- Generates all goals, habits, routines, tasks
- Returns complete onboarding result

**GET/POST/PUT/DELETE /api/routines**
- CRUD operations for routines table
- GET includes completion stats

#### AI Prompts

**Quick Mode Processing**:
```
Analyze this user's goal and preferences:
- Primary goal: {goal}
- Why it matters: {why}
- Target date: {date}
- Daily structure: {wake/work/sleep times}
- Anti-vision: {things_to_avoid}
- Desired habits: {habits}

Generate:
1. Breakdown of primary goal (if 3+ months)
2. Individual goals for each habit
3. Morning routine suggestion (5-7 steps, {wake_time} to work start)
4. Evening routine suggestion (4-6 steps, after work to {sleep_time})
5. 3-5 initial tasks for this week
```

**Deep Dive Conversation**:
```
You are a supportive goal-setting coach conducting onboarding.

Current phase: {phase}
Conversation so far: {history}
User's last answer: {answer}

Your job:
- Ask clear, focused questions (one at a time)
- If answer is detailed and clear, move to next phase
- If answer is vague, ask ONE clarifying follow-up
- Allow skips - don't force answers
- Be conversational but efficient
- Show empathy and encouragement

Generate:
- next_question: The question to ask
- needs_clarification: true/false
- can_skip: true/false
- progress: percentage complete
```

### 3.4 User Experience Requirements

#### Onboarding Entry Point
- Landing page after sign-up
- Clear choice: "Quick Setup (2 min)" vs "Deep Dive (10 min)"
- Visual indicators of what each includes
- Can switch modes mid-flow

#### Visual Design
- **Progress indicator**: Show steps/percentage complete
- **Skip buttons**: Clearly visible on optional questions
- **Conversational UI**: Chat-like interface for Deep Dive mode
- **Form UI**: Clean, spacious form for Quick Mode
- **Preview/edit**: Review screen before finalizing

#### Interaction Patterns
- **Quick Mode**: Standard form submission, optimistic UI
- **Deep Dive**: Message bubbles (user/AI), typing indicators, smooth scrolling
- **Routines Review**: Drag-to-reorder steps, click to edit duration, toggle active/inactive
- **Skip functionality**: "Skip this question" button + ability to type "skip" in chat

#### Mobile Experience
- Fully responsive
- Deep Dive optimized for mobile chat UX
- Quick Mode uses mobile-friendly form inputs (time pickers, etc.)
- Can pause and resume later

### 3.5 Success Criteria

**Must Have (v1):**
- [ ] Two onboarding modes: Quick and Deep Dive
- [ ] Quick Mode collects all essential data in single form
- [ ] Deep Dive has conversational flow with skip functionality
- [ ] Captures primary goal + multiple habits
- [ ] Captures anti-vision (things to avoid)
- [ ] AI generates morning and evening routine suggestions
- [ ] New `routines` table created and integrated
- [ ] Users can review/edit generated routines before finalizing
- [ ] All modes create proper goal hierarchy and initial tasks

**Should Have (v2):**
- [ ] Ability to regenerate AI suggestions
- [ ] Routine templates library (common routines)
- [ ] Voice input for Deep Dive mode
- [ ] Save progress and resume later

**Could Have (Future):**
- [ ] Video/visual guide for each mode
- [ ] Personality-based question adaptation
- [ ] Integration with calendar for routine scheduling
- [ ] Social proof (show example routines from successful users)

## 4. Success Metrics

### Primary Metrics:
- **Onboarding completion rate**: % of users who complete onboarding
- **Mode selection**: % choosing Quick vs Deep Dive
- **Data quality**: % of goals with clear success criteria and breakdown
- **Routine adoption**: % of users who activate AI-generated routines

### Secondary Metrics:
- Average time spent in each mode
- Question skip rate (Deep Dive)
- Routine completion rate in first week
- User retention 7 days post-onboarding
- Support tickets related to onboarding confusion

### Target Goals:
- 80%+ onboarding completion rate (up from current ~65%)
- 90%+ of completed onboardings have high-quality goal data
- 60%+ of users adopt at least one AI-generated routine
- 50/50 split between Quick and Deep Dive modes

## 5. Routine Builder Details

### AI Routine Generation Logic

**Morning Routine**:
- Input: wake_time, work_start, energy_peak, primary_goal
- Duration: (work_start - wake_time)
- Typical steps:
  1. Wake up activity (5-10 min): meditation, stretching, journaling
  2. Hygiene/prep (15-30 min)
  3. Breakfast (15-20 min)
  4. Goal-related activity (20-45 min): if goal is learning → study time, if health → exercise
  5. Planning (5-10 min): review day's tasks
  6. Buffer time before work (5-10 min)

**Evening Routine**:
- Input: work_end, sleep_time, habits, primary_goal
- Duration: (sleep_time - work_end) minus dinner/flex time
- Typical steps:
  1. Wind down from work (15-30 min): walk, change clothes, decompress
  2. Dinner/personal time (60-90 min)
  3. Habit time (20-45 min): reading, exercise, hobbies
  4. Reflection (5-10 min): daily review, journaling
  5. Prep for tomorrow (5-10 min): layout clothes, pack bag
  6. Wind down (15-30 min): no screens, relaxation, hygiene
  7. Sleep prep (5-10 min): meditation, reading

**Customization**:
- AI adapts based on:
  - Goal type (career goals → morning study, health goals → morning exercise)
  - Available time (short windows → fewer steps)
  - Energy patterns (low morning energy → gentler wake-up)
  - Declared habits (reading habit → evening reading block)

### Routine Execution

- Routines create recurring time_blocks in database
- Each routine step can link to a recurring task
- Daily check-in asks "Did you complete your morning routine?"
- Track completion rate over time
- AI adjusts suggestions based on completion patterns

## 6. Technical Considerations

### State Management
- **Quick Mode**: Single form state, React Hook Form for validation
- **Deep Dive**: Conversation state with Zustand, persisted to localStorage
- **Routine Builder**: Drag-and-drop state with react-beautiful-dnd or dnd-kit

### AI Conversation Flow
```typescript
type ConversationPhase =
  | 'current_state'
  | 'anti_vision'
  | 'vision_habits'
  | 'routines'
  | 'review'

type ConversationState = {
  phase: ConversationPhase
  currentQuestion: string
  canSkip: boolean
  answers: Record<string, string>
  transcript: Message[]
  progress: number // 0-100
}
```

### Performance Considerations
- Quick Mode: Single API call, <2s response time
- Deep Dive: Streaming AI responses for conversational feel
- Routine generation: Parallel processing (goals + routines generated simultaneously)
- Optimistic UI updates while AI processes in background

### Error Handling
- If AI fails to generate breakdown: Fall back to manual milestone creation
- If routine generation fails: Offer template library as backup
- Network interruptions: Save progress to localStorage, resume on reconnect
- Validation errors: Clear inline messaging, prevent submission

### Migration Strategy
- Existing users: Prompt to "Improve your profile" with Deep Dive
- New table `routines`: Deploy with migration, won't affect existing users
- Updated onboarding: Feature flag rollout (10% → 50% → 100%)

## 7. User Stories

### Story 1: Busy Professional (Quick Mode)
**As a** busy professional who knows exactly what they want
**I want to** set up my goal and routines in under 3 minutes
**So that** I can start taking action immediately without a long questionnaire

**Acceptance Criteria:**
- Can complete entire onboarding in <3 minutes
- All essential data captured (goal, timeline, daily structure)
- Receives actionable morning/evening routine suggestions
- Can skip to dashboard and start working immediately

### Story 2: Uncertain Beginner (Deep Dive)
**As a** person who's not sure exactly how to define their goal
**I want to** have a conversation that helps me clarify my thinking
**So that** I end up with a well-defined goal and realistic plan

**Acceptance Criteria:**
- Guided through structured questions one at a time
- Can express uncertainty and get clarifying questions
- Can skip questions that don't apply
- Receives comprehensive breakdown with routines and initial tasks
- Feels supported and understood throughout

### Story 3: Multi-Goal User
**As a** user with a career goal plus personal habits I want to build
**I want to** define my main goal AND my daily habits (reading, exercise)
**So that** the app helps me balance both without treating everything as equal priority

**Acceptance Criteria:**
- Can specify one primary goal clearly marked as primary
- Can add multiple supporting habits
- Habits appear as separate goals with appropriate recurrence
- Routines incorporate both goal work and habit time
- Dashboard shows clear hierarchy (primary goal + supporting habits)

### Story 4: Routine Optimization
**As a** user who struggles with inconsistent mornings/evenings
**I want** AI-generated routine suggestions based on my schedule and goals
**So that** I have a structured start and end to each day

**Acceptance Criteria:**
- Morning routine fits between wake time and work start
- Evening routine fits between work end and sleep time
- Routines include goal-aligned activities (e.g., study time for learning goals)
- Can edit routine steps (duration, order, remove items)
- Routines create trackable recurring tasks
- See completion stats over time

## 8. Open Questions

1. **Routine editing during onboarding**: Should users be able to fully customize routines during onboarding, or just accept/reject and edit later?
   - **Recommendation**: Accept/reject during onboarding, full editing post-onboarding

2. **Skip limits**: Should we require certain questions to be answered (e.g., primary goal)?
   - **Recommendation**: Only primary goal + target date are required, everything else skippable

3. **Habit frequency**: Should habits be daily-only, or support custom frequencies?
   - **Recommendation**: v1 = daily only, v2 = custom frequencies

4. **Routine library**: Should we offer pre-built routine templates as alternatives to AI generation?
   - **Recommendation**: v2 feature, start with AI-only

5. **Onboarding re-do**: Can users re-run onboarding later to update their profile?
   - **Recommendation**: Yes, add "Update your goals & routines" option in settings

## 9. Dependencies

### Technical:
- Anthropic Claude API (streaming support for conversational feel)
- Existing `goals`, `tasks`, `time_blocks` tables
- New `routines` table (migration required)

### Design:
- Conversational UI mockups for Deep Dive
- Routine builder drag-and-drop interface
- Mode selection landing page

### Content:
- AI prompt engineering for each conversation phase
- Routine generation prompts (morning/evening templates)
- Example routines for common goal types

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Create `routines` table and API endpoints
- Build Quick Mode form UI
- Update onboarding completion API to handle multiple goals

### Phase 2: Quick Mode (Week 2-3)
- Implement Quick Mode processing logic
- AI routine generation
- Review/edit screen for generated routines
- Testing and refinement

### Phase 3: Deep Dive (Week 3-5)
- Build conversational UI
- Implement stateful conversation API
- AI conversation prompt engineering
- Skip functionality and progress tracking

### Phase 4: Integration & Polish (Week 5-6)
- Mode selection landing page
- Routine execution integration (time blocks + tasks)
- Analytics and tracking
- User testing and iteration

### Phase 5: Launch (Week 6-7)
- Feature flag rollout
- Monitor metrics
- Gather user feedback
- Quick iteration on pain points

## 11. Next Steps

1. Review and approve PRD
2. Create technical design doc for `routines` table
3. Design mockups for both onboarding modes
4. Write AI prompts for routine generation and conversation
5. Set up feature flag infrastructure
6. Begin Phase 1 implementation

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Status**: Draft - Awaiting Review
