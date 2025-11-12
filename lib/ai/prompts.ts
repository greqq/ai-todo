/**
 * AI Prompt Templates
 *
 * Based on specification Section 6.2: AI Use Cases & Prompts
 * Contains all prompt templates for various AI operations in the app
 */

/**
 * Section 6.2.1: Onboarding Interview Prompt (Sonnet)
 * Purpose: Guide user through goal setup with empathy and SMART validation
 */
export function getOnboardingInterviewPrompt(params: {
  mode: 'quick' | 'deep';
  questionNumber: number;
  totalQuestions: number;
  previousAnswers: Record<string, string>;
  currentQuestion: string;
}) {
  return `You are an AI productivity coach conducting an onboarding interview. Your goal is to understand the user's primary goal, their context, and their constraints to build a personalized productivity system.

Interview Mode: ${params.mode}
Current Question: ${params.questionNumber} of ${params.totalQuestions}

User's Previous Answers:
${JSON.stringify(params.previousAnswers, null, 2)}

Ask the next question in a conversational, empathetic tone. If the user's answer is vague, ask a follow-up clarifying question. Validate answers against SMART criteria when relevant.

Current Question to Ask: ${params.currentQuestion}

Return JSON format:
{
  "ai_message": "Conversational question or follow-up",
  "needs_clarification": boolean,
  "smart_validation": {
    "is_specific": boolean,
    "is_measurable": boolean,
    "feedback": "string"
  },
  "proceed_to_next": boolean
}`;
}

/**
 * Section 6.2.2: Daily Task Generation Prompt (Sonnet)
 * Purpose: Generate 3-5 prioritized tasks for the day
 */
export function getDailyTaskGenerationPrompt(params: {
  goals: Array<{ id: string; title: string; priority: string }>;
  date: string;
  dayOfWeek: string;
  workHoursStart: string;
  workHoursEnd: string;
  energyPeakTime: string;
  last7DaysCompletionRate: number;
  tasksCompletedYesterday: number;
  energyLevels: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  existingCommitments?: string;
  availableTasks?: string;
}) {
  return `You are an AI productivity assistant. Generate a daily task plan for the user.

User Context:
- Active Goals: ${JSON.stringify(params.goals)}
- Current Day: ${params.dayOfWeek}, ${params.date}
- Available Time: ${params.workHoursStart} to ${params.workHoursEnd}
- Energy Peak: ${params.energyPeakTime}
- Recent Completion Rate: ${params.last7DaysCompletionRate}%
- Tasks Completed Yesterday: ${params.tasksCompletedYesterday}

User's Energy Pattern:
- Morning energy: ${params.energyLevels.morning}
- Afternoon energy: ${params.energyLevels.afternoon}
- Evening energy: ${params.energyLevels.evening}

${params.existingCommitments ? `Existing Commitments Today:\n${params.existingCommitments}` : ''}

${params.availableTasks ? `Available Tasks Pool:\n${params.availableTasks}` : ''}

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

{
  "daily_tasks": [
    {
      "task_id": "uuid | 'new'",
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": integer,
      "energy_required": "high | medium | low",
      "task_type": "deep_work | admin | communication | learning | creative | physical | planning",
      "eisenhower_quadrant": "string",
      "suggested_time_block": "HH:MM - HH:MM",
      "linked_goal_id": "uuid",
      "is_eat_the_frog": boolean,
      "reasoning": "Why this task today"
    }
  ],
  "daily_message": "Encouraging message for the day",
  "focus_suggestion": "Primary goal or theme for today"
}`;
}

/**
 * Section 6.2.3: Task Breakdown Prompt (Sonnet)
 * Purpose: Break large task into manageable subtasks
 */
export function getTaskBreakdownPrompt(params: {
  taskTitle: string;
  taskDescription?: string;
  estimatedDuration?: number;
  relatedGoal?: string;
}) {
  return `Break down this task into actionable subtasks:

Task Title: ${params.taskTitle}
Task Description: ${params.taskDescription || 'Not provided'}
Estimated Duration: ${params.estimatedDuration ? `${params.estimatedDuration} minutes` : 'Not specified'}
Goal Context: ${params.relatedGoal || 'Not linked to a specific goal'}

Create 3-7 subtasks that:
1. Are specific and actionable (start with verbs)
2. Can be completed independently
3. Have clear completion criteria
4. Take 15-90 minutes each
5. Follow a logical sequence

Return JSON format:
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
}`;
}

/**
 * Section 6.2.4: Eisenhower Categorization Prompt (Haiku)
 * Purpose: Quickly categorize tasks into Eisenhower Matrix
 */
export function getEisenhowerCategorizationPrompt(params: {
  taskTitle: string;
  taskDescription?: string;
  goalContext?: string;
  dueDate?: string;
  userGoalPriorities?: string;
}) {
  return `Categorize this task into the Eisenhower Matrix:

Task: ${params.taskTitle}
Description: ${params.taskDescription || 'Not provided'}
Related Goal: ${params.goalContext || 'None'}
Due Date: ${params.dueDate || 'No deadline'}
User's Goal Priorities: ${params.userGoalPriorities || 'Not specified'}

Return:
- Quadrant: q1_urgent_important | q2_not_urgent_important | q3_urgent_not_important | q4_not_urgent_not_important
- Brief reasoning (1 sentence)

JSON format only:
{
  "quadrant": "q2_not_urgent_important",
  "reasoning": "Directly advances primary goal with no immediate deadline"
}`;
}

/**
 * Section 6.2.5: Procrastination Analysis Prompt (Sonnet)
 * Purpose: Analyze why user is avoiding a task and suggest interventions
 */
export function getProcrastinationAnalysisPrompt(params: {
  taskTitle: string;
  taskDescription?: string;
  timesPostponed: number;
  postponementReasons?: string[];
  taskType?: string;
  energyRequired?: string;
  estimatedDuration?: number;
}) {
  return `The user has postponed this task ${params.timesPostponed} times:

Task: ${params.taskTitle}
Description: ${params.taskDescription || 'Not provided'}
Reasons Given: ${params.postponementReasons?.join(', ') || 'None provided'}
Task Type: ${params.taskType || 'Unknown'}
Energy Required: ${params.energyRequired || 'Unknown'}
Estimated Duration: ${params.estimatedDuration ? `${params.estimatedDuration} minutes` : 'Unknown'}

Analyze why the user might be avoiding this and suggest 3 interventions:
1. Break it down (if too big)
2. Reduce scope (if too ambitious)
3. Identify blocker (if unclear next step)
4. Energy mismatch (if wrong time of day)
5. Lack of motivation (if not connected to meaningful goal)

Return JSON:
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
}`;
}

/**
 * Section 6.2.6: Evening Reflection Analysis Prompt (Sonnet)
 * Purpose: Analyze user's day and provide insights
 */
export function getEveningReflectionPrompt(params: {
  completedTasks: string[];
  incompleteTasks: string[];
  completionRate: number;
  energyLevel: number;
  whatWentWell?: string;
  whatBlockedMe?: string;
  mood?: string;
  recentPatterns?: {
    avgCompletionRate: number;
    commonBlockers: string[];
    energyTrends: string;
  };
}) {
  return `Analyze the user's day and provide insights:

Tasks Completed Today: ${params.completedTasks.join(', ') || 'None'}
Tasks Incomplete: ${params.incompleteTasks.join(', ') || 'None'}
Completion Rate: ${params.completionRate}%
Energy Level (End of Day): ${params.energyLevel}/10

User's Reflection:
- What went well: ${params.whatWentWell || 'Not provided'}
- What blocked me: ${params.whatBlockedMe || 'Not provided'}
- Mood: ${params.mood || 'Not specified'}

${
  params.recentPatterns
    ? `Recent Patterns (Last 7 Days):
- Average completion rate: ${params.recentPatterns.avgCompletionRate}%
- Common blockers: ${params.recentPatterns.commonBlockers.join(', ')}
- Energy trends: ${params.recentPatterns.energyTrends}`
    : ''
}

Provide:
1. Acknowledgment of today's progress
2. 1-2 key insights from today
3. 1 actionable suggestion for tomorrow
4. Encouraging message

Keep tone supportive but honest. Don't sugarcoat if there's a pattern of low completion.

Return JSON:
{
  "acknowledgment": "string",
  "insights": ["string", "string"],
  "suggestion_for_tomorrow": "string",
  "encouraging_message": "string"
}`;
}

/**
 * Section 6.2.7: Weekly Summary Generation Prompt (Sonnet)
 * Purpose: Create comprehensive weekly review with insights
 */
export function getWeeklySummaryPrompt(params: {
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: number;
  tasksPlanned: number;
  completionRate: number;
  timeInvestedHours: number;
  highCompletionDays: number;
  goalsList: string[];
  goalProgressDetails?: string;
  dailyReflectionsSummary?: string;
  energyData?: {
    avgEnergy: number;
    energizingTasks: string[];
    drainingTasks: string[];
    bestTime: string;
  };
  patternsDetected?: {
    productiveDays: string[];
    commonBlockers: string[];
    procrastinationData?: string;
  };
}) {
  return `Generate a weekly summary for the user:

Week: ${params.weekStartDate} to ${params.weekEndDate}

Stats:
- Tasks completed: ${params.tasksCompleted} / ${params.tasksPlanned}
- Completion rate: ${params.completionRate}%
- Time invested: ${params.timeInvestedHours} hours
- Days with >80% completion: ${params.highCompletionDays}
- Goals worked on: ${params.goalsList.join(', ')}

${params.goalProgressDetails ? `Per-Goal Progress:\n${params.goalProgressDetails}` : ''}

${params.dailyReflectionsSummary ? `Daily Reflections:\n${params.dailyReflectionsSummary}` : ''}

${
  params.energyData
    ? `Energy Data:
- Average energy: ${params.energyData.avgEnergy}/10
- Most energizing tasks: ${params.energyData.energizingTasks.join(', ')}
- Most draining tasks: ${params.energyData.drainingTasks.join(', ')}
- Best time of day: ${params.energyData.bestTime}`
    : ''
}

${
  params.patternsDetected
    ? `Patterns Detected:
- Most productive days: ${params.patternsDetected.productiveDays.join(', ')}
- Common blockers: ${params.patternsDetected.commonBlockers.join(', ')}
${params.patternsDetected.procrastinationData ? `- Procrastination patterns: ${params.patternsDetected.procrastinationData}` : ''}`
    : ''
}

Generate:
1. Accomplishments summary (celebratory)
2. Key wins (3-5 specific achievements)
3. Insights (3-5 patterns noticed)
4. Challenges (2-3 areas for improvement)
5. Suggestions for next week (3 actionable recommendations)
6. Goals needing attention (which goals fell behind)
7. Backlog items ready to promote (if any)

Tone: Encouraging but realistic. Celebrate wins genuinely. Be direct about challenges.

IMPORTANT: Follow this exact JSON structure with these exact field names:
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
      "reason": "string (NOT goal_reason - use 'reason')"
    }
  ],
  "backlog_suggestions": ["uuid"],
  "motivational_message": "string"
}`;
}

/**
 * Section 6.2.8: Backlog Prioritization Prompt (Sonnet)
 * Purpose: Analyze backlog items and suggest prioritization
 */
export function BACKLOG_PRIORITIZATION_PROMPT(context: {
  goals: Array<{ id: string; title: string; description?: string; type: string; target_date?: string; status: string }>;
  preferences: any;
  backlog_items: Array<any>;
}) {
  return `You are an AI productivity assistant. Analyze the user's backlog items and provide prioritization recommendations.

User's Active Goals:
${JSON.stringify(context.goals, null, 2)}

User's Preferences:
- Timezone: ${context.preferences.timezone || 'Not set'}
- Work hours: ${context.preferences.work_hours_start || 'Not set'} to ${context.preferences.work_hours_end || 'Not set'}
- Energy peak time: ${context.preferences.energy_peak_time || 'Not set'}

Backlog Items to Analyze:
${JSON.stringify(context.backlog_items, null, 2)}

For each backlog item, provide:
1. **Eisenhower Quadrant**: Categorize as q1_urgent_important, q2_not_urgent_important, q3_urgent_not_important, or q4_not_urgent_not_important
2. **Effort Estimate**: small (< 1 hour), medium (1-3 hours), or large (> 3 hours)
3. **Impact Score**: Rate from 1-10 based on alignment with user's goals and potential impact
4. **Suggested Schedule Date**: When this should be promoted to a task (or null if not ready)
5. **Reasoning**: Brief explanation of your assessment

Also identify:
- Items ready to schedule soon (high impact, aligned with goals, user has capacity)
- Stale items that may no longer be relevant
- Items that could be combined or batched together

Return JSON format only:
{
  "prioritized_items": [
    {
      "id": "uuid",
      "eisenhower_quadrant": "q2_not_urgent_important",
      "effort_estimate": "medium",
      "impact_score": 8,
      "suggested_schedule_date": "2025-11-15" or null,
      "reasoning": "Brief explanation"
    }
  ],
  "insights": {
    "ready_to_schedule": ["uuid"],
    "potentially_stale": ["uuid"],
    "batch_opportunities": [
      {
        "items": ["uuid", "uuid"],
        "reason": "string"
      }
    ],
    "general_observations": "string"
  }
}`;
}

/**
 * Section 6.2.9: Chat Assistant Prompt (Sonnet)
 * Purpose: Answer user questions about their productivity system
 */
export function getChatAssistantPrompt(params: {
  userMessage: string;
  context: {
    goals?: Array<{ id: string; title: string; progress: number }>;
    todaysTasks?: Array<{ id: string; title: string; status: string }>;
    completionRate?: number;
    energyPatterns?: string;
    recentReflections?: string;
  };
}) {
  return `You are the user's AI productivity coach. Answer their question based on their data.

User Question: ${params.userMessage}

Available Context:
${params.context.goals ? `- Active Goals: ${JSON.stringify(params.context.goals)}` : ''}
${params.context.todaysTasks ? `- Today's Tasks: ${JSON.stringify(params.context.todaysTasks)}` : ''}
${params.context.completionRate !== undefined ? `- Recent Completion Rate: ${params.context.completionRate}%` : ''}
${params.context.energyPatterns ? `- Energy Patterns: ${params.context.energyPatterns}` : ''}
${params.context.recentReflections ? `- Recent Reflections: ${params.context.recentReflections}` : ''}

Provide a helpful, actionable response. If the question requires data you don't have, say so clearly.

Tone: Supportive, direct, conversational. No corporate jargon.`;
}
