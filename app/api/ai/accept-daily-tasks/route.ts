import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Normalize Eisenhower quadrant values from AI output to database enum
 */
function normalizeEisenhowerQuadrant(quadrant: string | null | undefined): string | null {
  if (!quadrant) return null;

  const normalized = quadrant.toLowerCase().trim();

  // Map various formats to the database enum values
  if (normalized.includes('q1') || (normalized.includes('urgent') && normalized.includes('important') && !normalized.includes('not urgent'))) {
    return 'q1_urgent_important';
  }
  if (normalized.includes('q2') || (normalized.includes('important') && normalized.includes('not urgent'))) {
    return 'q2_not_urgent_important';
  }
  if (normalized.includes('q3') || (normalized.includes('urgent') && normalized.includes('not important'))) {
    return 'q3_urgent_not_important';
  }
  if (normalized.includes('q4') || (normalized.includes('not urgent') && normalized.includes('not important'))) {
    return 'q4_not_urgent_not_important';
  }

  // If it's already in the correct format, return it
  if (['q1_urgent_important', 'q2_not_urgent_important', 'q3_urgent_not_important', 'q4_not_urgent_not_important'].includes(normalized)) {
    return normalized;
  }

  return null;
}

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
 * POST /api/ai/accept-daily-tasks
 * Accept and save AI-generated task suggestions to database
 *
 * Request body:
 * {
 *   tasks: Array<{
 *     task_id?: string; // If existing task, use this ID
 *     title: string;
 *     description: string;
 *     estimated_duration_minutes: number;
 *     energy_required: 'high' | 'medium' | 'low';
 *     task_type: string;
 *     eisenhower_quadrant: string;
 *     suggested_time_block?: string;
 *     linked_goal_id?: string;
 *     is_eat_the_frog?: boolean;
 *   }>
 * }
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      );
    }

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

    const createdTasks: any[] = [];
    const errors: Array<{ task: string; error: string }> = [];

    // Process each task
    for (const task of tasks) {
      try {
        // If task_id is 'new' or not provided, create a new task
        if (!task.task_id || task.task_id === 'new') {
          // Parse suggested time block if provided
          let scheduledStart = null;
          let scheduledEnd = null;
          if (task.suggested_time_block) {
            try {
              const [startTime, endTime] = task.suggested_time_block.split(' - ');
              const today = new Date();
              const startDate = new Date(
                `${today.toISOString().split('T')[0]}T${startTime}:00`
              );
              const endDate = new Date(
                `${today.toISOString().split('T')[0]}T${endTime}:00`
              );
              scheduledStart = startDate.toISOString();
              scheduledEnd = endDate.toISOString();
            } catch (e) {
              console.error('Failed to parse time block:', task.suggested_time_block);
            }
          }

          // Create new task
          const { data: newTask, error: createError } = await supabase
            .from('tasks')
            // @ts-expect-error - Insert type inference issue
            .insert({
              user_id: (user as any).id,
              title: task.title.trim(),
              description: task.description?.trim() || null,
              goal_id: task.linked_goal_id || null,
              estimated_duration_minutes: task.estimated_duration_minutes || null,
              status: 'todo',
              energy_required: task.energy_required || 'medium',
              task_type: normalizeTaskType(task.task_type),
              eisenhower_quadrant: normalizeEisenhowerQuadrant(task.eisenhower_quadrant),
              scheduled_start: scheduledStart,
              scheduled_end: scheduledEnd,
              source: 'ai_generated',
              priority_score: task.is_eat_the_frog ? 90 : 50,
              context_tags: task.is_eat_the_frog ? ['eat_the_frog'] : null,
            })
            .select(`
              *,
              goal:goals!tasks_goal_id_fkey (
                id,
                title,
                type,
                status
              )
            `)
            .single();

          if (createError) {
            console.error('Error creating task:', createError);
            errors.push({
              task: task.title,
              error: createError.message,
            });
          } else {
            createdTasks.push(newTask);
          }
        } else {
          // If task_id is provided, this is an existing task that was suggested
          // Update its status or just return it
          const { data: existingTask, error: fetchError } = await supabase
            .from('tasks')
            .select(`
              *,
              goal:goals!tasks_goal_id_fkey (
                id,
                title,
                type,
                status
              )
            `)
            .eq('id', task.task_id)
            .eq('user_id', (user as any).id)
            .single();

          if (fetchError) {
            console.error('Error fetching existing task:', fetchError);
            errors.push({
              task: task.title,
              error: 'Task not found or access denied',
            });
          } else {
            createdTasks.push(existingTask);
          }
        }
      } catch (taskError: any) {
        console.error('Error processing task:', taskError);
        errors.push({
          task: task.title,
          error: taskError.message,
        });
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      tasks: createdTasks,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${createdTasks.length} tasks${
        errors.length > 0 ? ` with ${errors.length} errors` : ''
      }`,
    });
  } catch (error: any) {
    console.error('Error accepting daily tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to accept daily tasks',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
