import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/tasks/[id]/complete - Complete a task with actual duration
export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const taskId = params.id;

    // Parse body if present (optional for quick completion from dashboard)
    let actual_duration_minutes = null;
    let energy_impact = null;

    try {
      const body = await request.json();
      actual_duration_minutes = body.actual_duration_minutes || null;
      energy_impact = body.energy_impact || null;
    } catch (e) {
      // No body sent - this is fine for quick completion
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

    if ((existingTask as any).status === 'completed') {
      return NextResponse.json({ error: 'Task is already completed' }, { status: 400 });
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      // @ts-expect-error - Update type inference issue
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actual_duration_minutes || null,
        energy_impact: energy_impact || null,
      })
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
      console.error('Error completing task:', error);
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    // Update user's total tasks completed counter
    await supabase
      .from('users')
      // @ts-expect-error - Update type inference issue
      .update({
        total_tasks_completed: (user as any).total_tasks_completed + 1,
      })
      .eq('id', (user as any).id);

    return NextResponse.json(task);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
