import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;

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

    // Fetch task with subtasks
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        goal:goals!tasks_goal_id_fkey (
          id,
          title,
          type,
          status
        ),
        subtasks:tasks!tasks_parent_task_id_fkey (
          *
        )
      `)
      .eq('id', taskId)
      .eq('user_id', (user as any).id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;

    const body = await request.json();

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

    // Verify task belongs to user
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', (user as any).id)
      .single();

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    const task = existingTask as any;

    // Validate title if provided
    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length === 0) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      if (body.title.length > 500) {
        return NextResponse.json({ error: 'Title must be 500 characters or less' }, { status: 400 });
      }
    }

    // Validate goal_id if provided
    if (body.goal_id !== undefined && body.goal_id !== null) {
      const { data: goal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', body.goal_id)
        .eq('user_id', (user as any).id)
        .single();

      if (!goal) {
        return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
      }
    }

    // Prepare update data
    const updateData: any = { ...body };

    // Handle status changes
    if (body.status === 'completed' && task.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (body.status !== 'completed' && task.status === 'completed') {
      updateData.completed_at = null;
    }

    if (body.status === 'cancelled' && task.status !== 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    } else if (body.status !== 'cancelled' && task.status === 'cancelled') {
      updateData.cancelled_at = null;
    }

    // Track postponements
    if (body.status === 'todo' && body.due_date && task.due_date && body.due_date > task.due_date) {
      updateData.times_postponed = (task.times_postponed || 0) + 1;
      if (!task.first_postponed_at) {
        updateData.first_postponed_at = new Date().toISOString();
      }
      if (body.postponement_reason) {
        updateData.postponement_reasons = [
          ...(task.postponement_reasons || []),
          body.postponement_reason,
        ];
      }
      // Flag as procrastination if postponed 3+ times
      if (updateData.times_postponed >= 3) {
        updateData.is_procrastination_flagged = true;
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      // @ts-expect-error - Update type inference issue
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', (user as any).id)
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
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;

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

    // Check if task has subtasks
    const { data: subtasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('parent_task_id', taskId)
      .eq('user_id', (user as any).id);

    if (subtasks && subtasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete task with subtasks. Delete subtasks first.' },
        { status: 400 }
      );
    }

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', (user as any).id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
