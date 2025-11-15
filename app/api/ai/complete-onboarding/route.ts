import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLifeResetMapPrompt } from '@/lib/ai/prompts';
import type { LifeResetOnboardingData, LifeResetMap } from '@/types/life-reset.types';

/**
 * Normalize task type values from AI output to database enum
 */
function normalizeTaskType(taskType: string | null | undefined): string {
  if (!taskType) return 'admin';

  const normalized = taskType.toLowerCase().trim();

  // Map various AI outputs to valid task types
  const mapping: { [key: string]: string } = {
    'deep_work': 'deep_work',
    'deep work': 'deep_work',
    'focus': 'deep_work',
    'focused work': 'deep_work',
    'admin': 'admin',
    'administrative': 'admin',
    'communication': 'communication',
    'meeting': 'communication',
    'email': 'communication',
    'learning': 'learning',
    'study': 'learning',
    'research': 'learning',
    'reading': 'learning',
    'hands-on practice': 'learning',
    'creative': 'creative',
    'design': 'creative',
    'writing': 'creative',
    'physical': 'physical',
    'exercise': 'physical',
    'planning': 'planning',
    'organization': 'planning',
  };

  // Check if normalized value exists in mapping
  if (mapping[normalized]) {
    return mapping[normalized];
  }

  // Check if it's already a valid task type
  const validTypes = ['deep_work', 'admin', 'communication', 'learning', 'creative', 'physical', 'planning'];
  if (validTypes.includes(normalized)) {
    return normalized;
  }

  // Default to admin for unknown types
  return 'admin';
}

/**
 * Detect if this is a Life Reset onboarding based on data structure
 */
function isLifeResetOnboarding(interviewAnswers: any): boolean {
  // Life Reset onboarding has phase-based structure
  return !!(
    interviewAnswers.phase_1_current_life ||
    interviewAnswers.phase_2_anti_vision ||
    interviewAnswers.phase_3_vision ||
    interviewAnswers.phase_4_time_horizons ||
    interviewAnswers.phase_5_obstacles ||
    interviewAnswers.completed_at
  );
}

/**
 * Process Life Reset onboarding and generate comprehensive Life Reset Map
 */
async function processLifeResetOnboarding(
  typedUser: any,
  onboardingData: LifeResetOnboardingData,
  adminClient: any
) {
  console.log('Generating Life Reset Map with AI...');

  // Generate Life Reset Map using AI
  const lifeResetMapPrompt = getLifeResetMapPrompt({ onboardingData });

  let lifeResetMap: LifeResetMap;
  try {
    const { text } = await generateText({
      model: sonnet,
      prompt: lifeResetMapPrompt,
      temperature: 0.7,
    });

    console.log('AI Life Reset Map received, length:', text.length);

    // Parse AI response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lifeResetMap = JSON.parse(jsonMatch[0]);
      } else {
        lifeResetMap = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse Life Reset Map:', text);
      return NextResponse.json(
        { error: 'AI response was not in expected format', details: 'JSON parsing failed' },
        { status: 500 }
      );
    }
  } catch (aiError) {
    console.error('AI generation failed:', aiError);
    return NextResponse.json(
      {
        error: 'Failed to generate Life Reset Map with AI',
        details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
      },
      { status: 500 }
    );
  }

  // Extract anti-patterns from Phase 2
  const antiPatterns = [
    ...(onboardingData.phase_2_anti_vision?.work_antipatterns || []),
    ...(onboardingData.phase_2_anti_vision?.lifestyle_antipatterns || []),
    ...(onboardingData.phase_2_anti_vision?.relationship_antipatterns || []),
    ...(onboardingData.phase_2_anti_vision?.health_antipatterns || []),
    ...(onboardingData.phase_2_anti_vision?.financial_antipatterns || []),
  ];

  // Extract energy preferences from Phase 1
  const energyPreferences = {
    peak_energy_time: onboardingData.phase_1_current_life?.energy_patterns || 'morning',
    work_hours_start: '09:00',
    work_hours_end: '17:00',
  };

  console.log('Creating primary goal from Life Reset Map...');

  // Create primary goal
  const { data: primaryGoal, error: primaryGoalError } = await adminClient
    .from('goals')
    .insert({
      user_id: typedUser.id,
      title: lifeResetMap.goals_hierarchy.primary_goal.title,
      description: lifeResetMap.goals_hierarchy.primary_goal.description,
      type: lifeResetMap.goals_hierarchy.primary_goal.type,
      start_date: lifeResetMap.goals_hierarchy.primary_goal.start_date,
      target_date: lifeResetMap.goals_hierarchy.primary_goal.target_date,
      priority: lifeResetMap.goals_hierarchy.primary_goal.priority,
      status: 'active',
      success_criteria: lifeResetMap.goals_hierarchy.primary_goal.success_criteria,
      goal_category: 'primary',
    })
    .select()
    .single();

  if (primaryGoalError) {
    console.error('Failed to create primary goal:', primaryGoalError);
    return NextResponse.json(
      { error: 'Failed to create primary goal', details: primaryGoalError.message },
      { status: 500 }
    );
  }

  const typedPrimaryGoal = primaryGoal as any;

  // Create milestones for primary goal
  if (lifeResetMap.goals_hierarchy.primary_goal.milestones && lifeResetMap.goals_hierarchy.primary_goal.milestones.length > 0) {
    const milestonesToInsert = lifeResetMap.goals_hierarchy.primary_goal.milestones.map((milestone: any, index: number) => ({
      goal_id: typedPrimaryGoal.id,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date,
      completed: false,
      order_index: index,
    }));

    const { error: milestonesError } = await adminClient
      .from('milestones')
      .insert(milestonesToInsert);

    if (milestonesError) {
      console.error('Failed to create primary goal milestones:', milestonesError);
    }
  }

  console.log('Creating secondary goals...');

  // Create secondary goals
  if (lifeResetMap.goals_hierarchy.secondary_goals && lifeResetMap.goals_hierarchy.secondary_goals.length > 0) {
    const secondaryGoalsToInsert = lifeResetMap.goals_hierarchy.secondary_goals.map((goal: any) => ({
      user_id: typedUser.id,
      title: goal.title,
      description: goal.description,
      type: goal.type,
      start_date: goal.start_date,
      target_date: goal.target_date,
      priority: goal.priority,
      status: 'active',
      success_criteria: goal.success_criteria || [],
      goal_category: 'secondary',
    }));

    const { error: secondaryGoalsError } = await adminClient
      .from('goals')
      .insert(secondaryGoalsToInsert);

    if (secondaryGoalsError) {
      console.error('Failed to create secondary goals:', secondaryGoalsError);
      // Don't fail the request
    }
  }

  console.log('Creating routine tasks (morning/evening)...');

  // Create morning routine tasks
  if (lifeResetMap.morning_routine && lifeResetMap.morning_routine.tasks && lifeResetMap.morning_routine.tasks.length > 0) {
    const morningRoutineTasks = lifeResetMap.morning_routine.tasks.map((task: any, index: number) => ({
      user_id: typedUser.id,
      goal_id: null, // Routines are not tied to specific goals
      title: task.title,
      description: task.description || '',
      estimated_duration_minutes: task.duration_minutes,
      energy_required: task.energy_required || 'medium',
      task_type: normalizeTaskType(task.task_type),
      status: 'todo',
      source: 'ai_generated',
      priority_score: 80,
      is_routine: true,
      routine_type: 'morning',
      recurrence_pattern: 'daily',
    }));

    const { error: morningRoutineError } = await adminClient
      .from('tasks')
      .insert(morningRoutineTasks);

    if (morningRoutineError) {
      console.error('Failed to create morning routine tasks:', morningRoutineError);
    }
  }

  // Create evening routine tasks
  if (lifeResetMap.evening_routine && lifeResetMap.evening_routine.tasks && lifeResetMap.evening_routine.tasks.length > 0) {
    const eveningRoutineTasks = lifeResetMap.evening_routine.tasks.map((task: any, index: number) => ({
      user_id: typedUser.id,
      goal_id: null,
      title: task.title,
      description: task.description || '',
      estimated_duration_minutes: task.duration_minutes,
      energy_required: task.energy_required || 'low',
      task_type: normalizeTaskType(task.task_type),
      status: 'todo',
      source: 'ai_generated',
      priority_score: 70,
      is_routine: true,
      routine_type: 'evening',
      recurrence_pattern: 'daily',
    }));

    const { error: eveningRoutineError } = await adminClient
      .from('tasks')
      .insert(eveningRoutineTasks);

    if (eveningRoutineError) {
      console.error('Failed to create evening routine tasks:', eveningRoutineError);
    }
  }

  console.log('Creating initial implementation tasks...');

  // Create initial implementation tasks
  if (lifeResetMap.initial_tasks && lifeResetMap.initial_tasks.length > 0) {
    const initialTasksToInsert = lifeResetMap.initial_tasks.map((task: any) => ({
      user_id: typedUser.id,
      goal_id: typedPrimaryGoal.id, // Link to primary goal
      title: task.title,
      description: task.description,
      estimated_duration_minutes: task.estimated_duration_minutes,
      energy_required: task.energy_required,
      task_type: normalizeTaskType(task.task_type),
      eisenhower_quadrant: task.eisenhower_quadrant,
      status: 'todo',
      source: 'ai_generated',
      priority_score: 85, // High priority for initial tasks
    }));

    const { error: initialTasksError } = await adminClient
      .from('tasks')
      .insert(initialTasksToInsert);

    if (initialTasksError) {
      console.error('Failed to create initial tasks:', initialTasksError);
    }
  }

  console.log('Updating user with vision statement and preferences...');

  // Update user with vision statement, anti-patterns, energy preferences, and onboarding data
  const { error: updateUserError } = await adminClient
    .from('users')
    .update({
      onboarding_completed: true,
      onboarding_data: onboardingData,
      vision_statement: lifeResetMap.vision_statement,
      anti_patterns: antiPatterns,
      energy_preferences: energyPreferences,
      preferences: {
        ...typedUser.preferences,
        energy_peak_time: energyPreferences.peak_energy_time,
        work_hours_start: energyPreferences.work_hours_start,
        work_hours_end: energyPreferences.work_hours_end,
      },
    })
    .eq('id', typedUser.id);

  if (updateUserError) {
    console.error('Failed to update user:', updateUserError);
    // Don't fail the request, goals are already created
  }

  console.log('Life Reset onboarding completed successfully!');

  return NextResponse.json({
    success: true,
    goal: typedPrimaryGoal,
    message: 'Life Reset onboarding completed! Your personalized roadmap has been created.',
    lifeResetMap: {
      vision: lifeResetMap.vision_statement,
      primaryGoal: lifeResetMap.goals_hierarchy.primary_goal.title,
      secondaryGoalsCount: lifeResetMap.goals_hierarchy.secondary_goals?.length || 0,
      morningRoutineTasksCount: lifeResetMap.morning_routine?.tasks?.length || 0,
      eveningRoutineTasksCount: lifeResetMap.evening_routine?.tasks?.length || 0,
    },
  });
}

/**
 * POST /api/ai/complete-onboarding
 * Complete the onboarding process and create initial goal from interview data
 *
 * Supports two modes:
 * 1. Regular onboarding (simple 5-question interview)
 * 2. Life Reset onboarding (comprehensive 5-phase interview)
 *
 * Based on specification Section 3.1.5: Interview Output
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interviewAnswers } = body;

    if (!interviewAnswers) {
      return NextResponse.json(
        { error: 'Missing interview answers' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get or create user in database
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    // If user doesn't exist yet (race condition with Clerk webhook), create them
    if (userError || !user) {
      console.log('User not found in database, creating new user...');

      // Get user info from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'Could not get user information from Clerk' },
          { status: 401 }
        );
      }

      // Create user in Supabase using ADMIN client (bypasses RLS)
      const adminClient = createAdminClient();
      const { data: newUser, error: createError } = await adminClient
        .from('users')
        // @ts-expect-error - Insert type inference issue
        .insert({
          clerk_user_id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          full_name: clerkUser.fullName || clerkUser.username || '',
          onboarding_completed: false,
        })
        .select()
        .single();

      if (createError) {
        // Check if it's a duplicate key error (user exists but initial query failed)
        if (createError.code === '23505') {
          console.log('User already exists (duplicate key), retrying fetch with admin client...');

          // Retry fetching user with admin client
          const { data: existingUser, error: retryError } = await adminClient
            .from('users')
            .select('*')
            .eq('clerk_user_id', userId)
            .single();

          if (retryError || !existingUser) {
            console.error('Failed to fetch existing user after duplicate key error:', retryError);
            return NextResponse.json(
              { error: 'User exists but could not be retrieved', details: retryError?.message },
              { status: 500 }
            );
          }

          user = existingUser;
          console.log('Existing user retrieved successfully:', user);
        } else {
          // Different error, fail the request
          console.error('Failed to create user:', createError);
          return NextResponse.json(
            { error: 'Failed to create user in database', details: createError?.message },
            { status: 500 }
          );
        }
      } else if (newUser) {
        user = newUser;
        console.log('User created successfully:', user);
      }
    }

    // Type assertion needed due to Supabase type inference issues
    const typedUser = user as any;
    const adminClient = createAdminClient();

    // Check if this is Life Reset onboarding
    if (isLifeResetOnboarding(interviewAnswers)) {
      console.log('Processing Life Reset onboarding...');
      return await processLifeResetOnboarding(typedUser, interviewAnswers as LifeResetOnboardingData, adminClient);
    }

    // Otherwise, process regular onboarding
    console.log('Processing regular onboarding...');

    // Generate SMART goal analysis from interview answers
    const goalAnalysisPrompt = `Based on this onboarding interview, create a structured goal for the user:

Interview Answers:
${JSON.stringify(interviewAnswers, null, 2)}

Analyze and create:
1. A SMART goal statement (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Goal type classification
3. Key milestones (2-4 milestones)
4. Success criteria
5. Initial task suggestions (3-5 tasks to get started)

Return JSON format:
{
  "goal": {
    "title": "string (concise goal statement)",
    "description": "string (detailed context and why it matters)",
    "type": "career | health | financial | relationships | personal_growth | creative | other",
    "start_date": "YYYY-MM-DD",
    "target_date": "YYYY-MM-DD",
    "priority": "high | medium | low",
    "success_criteria": ["string", "string"]
  },
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "target_date": "YYYY-MM-DD"
    }
  ],
  "initial_tasks": [
    {
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": integer,
      "energy_required": "high | medium | low",
      "task_type": "deep_work | admin | communication | learning | creative | physical | planning",
      "eisenhower_quadrant": "q1_urgent_important | q2_not_urgent_important | q3_urgent_not_important | q4_not_urgent_not_important"
    }
  ],
  "smart_analysis": {
    "specific": boolean,
    "measurable": boolean,
    "achievable": boolean,
    "relevant": boolean,
    "time_bound": boolean,
    "ai_suggestions": "string (any suggestions for improvement)"
  },
  "user_profile": {
    "energy_peak_time": "morning | afternoon | evening | night",
    "work_hours_start": "HH:MM",
    "work_hours_end": "HH:MM"
  }
}`;

    let goalData;
    try {
      const { text } = await generateText({
        model: sonnet,
        prompt: goalAnalysisPrompt,
        temperature: 0.7,
      });

      console.log('AI Response received, length:', text.length);

      // Parse AI response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          goalData = JSON.parse(jsonMatch[0]);
        } else {
          goalData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse goal data:', text);
        return NextResponse.json(
          { error: 'AI response was not in expected format', details: 'JSON parsing failed' },
          { status: 500 }
        );
      }
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      return NextResponse.json(
        {
          error: 'Failed to generate goal analysis with AI',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
        },
        { status: 500 }
      );
    }

    // Create the goal in the database using ADMIN client (bypasses RLS during onboarding)
    const { data: createdGoal, error: goalError } = await adminClient
      .from('goals')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: typedUser.id,
        title: goalData.goal.title,
        description: goalData.goal.description,
        type: goalData.goal.type,
        start_date: goalData.goal.start_date,
        target_date: goalData.goal.target_date,
        priority: goalData.goal.priority,
        status: 'active',
        success_criteria: goalData.goal.success_criteria,
        smart_analysis: goalData.smart_analysis,
      })
      .select()
      .single();

    if (goalError) {
      console.error('Failed to create goal:', goalError);
      return NextResponse.json(
        { error: 'Failed to create goal', details: goalError.message },
        { status: 500 }
      );
    }

    // Type assertion for createdGoal
    const typedGoal = createdGoal as any;

    // Create milestones using admin client
    if (goalData.milestones && goalData.milestones.length > 0) {
      const milestonesToInsert = goalData.milestones.map((milestone: any, index: number) => ({
        goal_id: typedGoal.id,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        completed: false,
        order_index: index,
      }));

      const { error: milestonesError } = await adminClient
        .from('milestones')
        .insert(milestonesToInsert);

      if (milestonesError) {
        console.error('Failed to create milestones:', milestonesError);
        // Don't fail the whole request, milestones are optional
      }
    }

    // Create initial tasks using admin client
    if (goalData.initial_tasks && goalData.initial_tasks.length > 0) {
      const tasksToInsert = goalData.initial_tasks.map((task: any) => ({
        user_id: typedUser.id,
        goal_id: typedGoal.id,
        title: task.title,
        description: task.description,
        estimated_duration_minutes: task.estimated_duration_minutes,
        energy_required: task.energy_required,
        task_type: normalizeTaskType(task.task_type),
        eisenhower_quadrant: task.eisenhower_quadrant,
        status: 'todo',
        source: 'ai_generated',
        priority_score: 75, // Default high priority for initial tasks
      }));

      const { error: tasksError } = await adminClient
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Failed to create initial tasks:', tasksError);
        // Don't fail the whole request
      }
    }

    // Update user preferences and mark onboarding as complete using admin client
    const { error: updateUserError } = await adminClient
      .from('users')
      // @ts-expect-error - Update type inference issue
      .update({
        onboarding_completed: true,
        onboarding_data: interviewAnswers,
        preferences: {
          ...typedUser.preferences,
          energy_peak_time: goalData.user_profile?.energy_peak_time || 'morning',
          work_hours_start: goalData.user_profile?.work_hours_start || '09:00',
          work_hours_end: goalData.user_profile?.work_hours_end || '17:00',
        },
      })
      .eq('id', typedUser.id);

    if (updateUserError) {
      console.error('Failed to update user:', updateUserError);
      // Don't fail the request, goal is already created
    }

    return NextResponse.json({
      success: true,
      goal: typedGoal,
      message: 'Onboarding completed successfully!',
    });
  } catch (error) {
    console.error('Complete onboarding API error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
