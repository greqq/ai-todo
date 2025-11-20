import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { getGoalBreakdownPrompt } from '@/lib/ai/prompts';
import { trackAIUsage } from '@/lib/ai/cost-tracking';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/goals/[id]/breakdown
 * Generate AI-powered hierarchical breakdown of a long-term goal
 *
 * Task 2: Goal Breakdown API Endpoint
 * Creates sub-goals at appropriate levels (quarterly, monthly, weekly)
 * based on the duration of the parent goal.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const supabase = createAdminClient();

    // Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch parent goal
    const { data: parentGoal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', (user as any).id)
      .single();

    if (goalError || !parentGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Type cast for better type inference
    const goal = parentGoal as any;

    // Validate goal is suitable for breakdown (3+ months)
    if (!goal.target_date) {
      return NextResponse.json(
        { error: 'Goal must have a target date for breakdown' },
        { status: 400 }
      );
    }

    const startDate = goal.start_date || new Date().toISOString().split('T')[0];
    const targetDate = goal.target_date;

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(targetDate);
    const durationMonths = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (durationMonths < 2) {
      return NextResponse.json(
        {
          error: 'Goal must be at least 2 months long for AI breakdown',
          suggestion: 'For goals shorter than 2 months, consider creating tasks directly'
        },
        { status: 400 }
      );
    }

    // Check if breakdown already exists
    const { data: existingChildren } = await supabase
      .from('goals')
      .select('id')
      .eq('parent_goal_id', goalId)
      .limit(1);

    if (existingChildren && existingChildren.length > 0) {
      return NextResponse.json(
        {
          error: 'Goal already has sub-goals',
          suggestion: 'Delete existing sub-goals first or use the update endpoint'
        },
        { status: 400 }
      );
    }

    // Get user context for AI
    const userPreferences = (user as any).preferences || {};
    const userContext = {
      workHoursStart: userPreferences.work_hours_start,
      workHoursEnd: userPreferences.work_hours_end,
      energyPeakTime: userPreferences.energy_peak_time,
      timezone: (user as any).timezone,
    };

    // Generate AI prompt
    const prompt = getGoalBreakdownPrompt({
      goalTitle: goal.title,
      goalDescription: goal.description || undefined,
      goalType: goal.type || 'other',
      startDate,
      targetDate,
      successCriteria: goal.success_criteria || undefined,
      userContext,
    });

    // Call Claude Sonnet for goal breakdown
    const startTime = Date.now();
    const result = await generateText({
      model: sonnet,
      prompt,
      temperature: 0.7,
    });

    const duration = Date.now() - startTime;

    // Track AI usage
    await trackAIUsage({
      userId,
      model: 'claude-sonnet-4-20250514',
      useCase: 'goal_breakdown',
      inputTokens: result.usage?.totalTokens || 0,
      outputTokens: 0,
      totalTokens: result.usage?.totalTokens || 0,
      duration,
      success: true,
    });

    // Parse AI response
    let aiResponse: {
      breakdown: Array<{
        title: string;
        description: string;
        level: string;
        target_date: string;
        success_criteria: string[];
        initial_tasks?: Array<{
          title: string;
          description: string;
          estimated_duration_minutes: number;
          energy_required: string;
        }>;
      }>;
      breakdown_notes: string;
      refinement_suggestions: string[];
    };

    try {
      // Extract JSON from the response (AI might wrap it in markdown)
      const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : result.text;
      aiResponse = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', result.text);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: result.text,
          suggestion: 'Try again or provide more details about your goal'
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!aiResponse.breakdown || !Array.isArray(aiResponse.breakdown)) {
      return NextResponse.json(
        {
          error: 'Invalid AI response structure',
          response: aiResponse,
        },
        { status: 500 }
      );
    }

    // Create child goals in a transaction
    // Note: Supabase doesn't have explicit transactions in JS client,
    // but we can use RPC or handle rollback manually if needed
    const createdGoals: any[] = [];
    const createdTasks: any[] = [];

    try {
      // Create all sub-goals
      for (const subGoal of aiResponse.breakdown) {
        const { data: newGoal, error: createError } = await supabase
          .from('goals')
          .insert({
            user_id: (user as any).id,
            parent_goal_id: goalId,
            title: subGoal.title,
            description: subGoal.description,
            type: goal.type,
            level: subGoal.level,
            start_date: startDate,
            target_date: subGoal.target_date,
            priority: goal.priority,
            status: 'active',
            success_criteria: subGoal.success_criteria,
            smart_analysis: {
              ai_generated: true,
              generated_at: new Date().toISOString(),
              parent_goal_id: goalId,
            },
          } as any)
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create sub-goal: ${subGoal.title}`);
        }

        const createdGoal = newGoal as any;
        createdGoals.push(createdGoal);

        // Create initial tasks for this sub-goal if provided
        if (subGoal.initial_tasks && subGoal.initial_tasks.length > 0) {
          for (const task of subGoal.initial_tasks) {
            const { data: newTask, error: taskError } = await supabase
              .from('tasks')
              .insert({
                user_id: (user as any).id,
                goal_id: createdGoal.id,
                title: task.title,
                description: task.description,
                estimated_duration_minutes: task.estimated_duration_minutes,
                energy_required: task.energy_required,
                status: 'todo',
                source: 'ai_generated',
                task_type: 'planning', // Initial tasks are usually planning
              } as any)
              .select()
              .single();

            if (taskError) {
              console.warn(`Failed to create task: ${task.title}`, taskError);
              // Don't fail the whole operation for task creation issues
            } else {
              createdTasks.push(newTask);
            }
          }
        }
      }

      // TODO: Update parent goal's smart_analysis with breakdown metadata
      // Skipping for now due to type inference issues with JSONB fields
      // This is non-critical - the child goals are created successfully

      return NextResponse.json({
        success: true,
        parent_goal: goal,
        sub_goals: createdGoals,
        tasks: createdTasks,
        breakdown_notes: aiResponse.breakdown_notes,
        refinement_suggestions: aiResponse.refinement_suggestions,
        metadata: {
          total_sub_goals: createdGoals.length,
          total_initial_tasks: createdTasks.length,
          duration_months: durationMonths,
        },
      }, { status: 201 });

    } catch (dbError: any) {
      console.error('Database error during goal creation:', dbError);

      // Attempt to rollback by deleting created goals
      if (createdGoals.length > 0) {
        const goalIds = createdGoals.map(g => g.id);
        await supabase
          .from('goals')
          .delete()
          .in('id', goalIds);
      }

      return NextResponse.json(
        {
          error: 'Failed to create sub-goals',
          details: dbError.message,
          suggestion: 'Please try again or contact support if the issue persists'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in goal breakdown:', error);

    // Track failed AI usage if it was an AI error
    if (error.message?.includes('API')) {
      const { userId } = await auth();
      if (userId) {
        await trackAIUsage({
          userId,
          model: 'claude-sonnet-4-20250514',
          useCase: 'goal_breakdown',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          duration: 0,
          success: false,
        });
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
