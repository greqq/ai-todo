import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/tasks - List all tasks for the authenticated user
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const goalId = searchParams.get('goal_id');
    const parentTaskId = searchParams.get('parent_task_id');
    const dueDate = searchParams.get('due_date');
    const energyRequired = searchParams.get('energy_required');
    const taskType = searchParams.get('task_type');
    const eisenhowerQuadrant = searchParams.get('eisenhower_quadrant');
    const includeSubtasks = searchParams.get('includeSubtasks') !== 'false'; // default true

    // Build query - only get top-level tasks by default
    let query = supabase
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
      .eq('user_id', (user as any).id);

    // By default, only show top-level tasks (no parent)
    if (parentTaskId === null || parentTaskId === undefined) {
      query = query.is('parent_task_id', null);
    } else if (parentTaskId) {
      query = query.eq('parent_task_id', parentTaskId);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    if (dueDate) {
      query = query.eq('due_date', dueDate);
    }

    if (energyRequired) {
      query = query.eq('energy_required', energyRequired);
    }

    if (taskType) {
      query = query.eq('task_type', taskType);
    }

    if (eisenhowerQuadrant) {
      query = query.eq('eisenhower_quadrant', eisenhowerQuadrant);
    }

    // Order by priority score (highest first), then by due date
    query = query.order('priority_score', { ascending: false });
    query = query.order('due_date', { ascending: true, nullsFirst: false });

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // If includeSubtasks is true, fetch subtasks for each task
    if (includeSubtasks && tasks && tasks.length > 0) {
      const taskIds = (tasks as any[]).map((task) => task.id);
      const { data: subtasks } = await supabase
        .from('tasks')
        .select('*')
        .in('parent_task_id', taskIds)
        .order('created_at', { ascending: true });

      // Attach subtasks to their parent tasks
      const tasksWithSubtasks = (tasks as any[]).map((task) => ({
        ...task,
        subtasks: (subtasks as any[] || []).filter((subtask) => subtask.parent_task_id === task.id),
      }));

      return NextResponse.json(tasksWithSubtasks);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      goal_id,
      parent_task_id,
      due_date,
      scheduled_start,
      scheduled_end,
      deadline_type,
      estimated_duration_minutes,
      status,
      energy_required,
      task_type,
      eisenhower_quadrant,
      context_tags,
      location,
      is_recurring,
      recurrence_rule,
      source,
      depends_on_task_ids,
    } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 500) {
      return NextResponse.json({ error: 'Title must be 500 characters or less' }, { status: 400 });
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

    // Validate goal_id if provided
    if (goal_id) {
      const { data: goal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', goal_id)
        .eq('user_id', (user as any).id)
        .single();

      if (!goal) {
        return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
      }
    }

    // Validate parent_task_id if provided
    if (parent_task_id) {
      const { data: parentTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', parent_task_id)
        .eq('user_id', (user as any).id)
        .single();

      if (!parentTask) {
        return NextResponse.json({ error: 'Parent task not found or access denied' }, { status: 404 });
      }
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: (user as any).id,
        title: title.trim(),
        description: description?.trim() || null,
        goal_id: goal_id || null,
        parent_task_id: parent_task_id || null,
        due_date: due_date || null,
        scheduled_start: scheduled_start || null,
        scheduled_end: scheduled_end || null,
        deadline_type: deadline_type || 'flexible',
        estimated_duration_minutes: estimated_duration_minutes || null,
        status: status || 'todo',
        energy_required: energy_required || 'medium',
        task_type: task_type || 'deep_work',
        eisenhower_quadrant: eisenhower_quadrant || null,
        context_tags: context_tags || null,
        location: location || null,
        is_recurring: is_recurring || false,
        recurrence_rule: recurrence_rule || null,
        source: source || 'user_created',
        depends_on_task_ids: depends_on_task_ids || null,
        priority_score: 50, // Default priority score
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

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
