import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper to get user ID
async function getUserId() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  return (user as any)?.id || null;
}

// PATCH /api/calendar/tasks/[id]/schedule
// Update task scheduling (scheduled_start, scheduled_end)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { scheduled_start, scheduled_end } = body;

    if (!scheduled_start || !scheduled_end) {
      return NextResponse.json(
        { error: 'scheduled_start and scheduled_end are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if task exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check for conflicts with other tasks
    const { data: taskConflicts } = await (supabase as any).rpc('detect_task_conflicts', {
      p_user_id: userId,
      p_start_time: scheduled_start,
      p_end_time: scheduled_end,
      p_exclude_task_id: id
    });

    // Check for conflicts with time blocks
    const { data: blockConflicts } = await (supabase as any).rpc('detect_time_block_conflicts', {
      p_user_id: userId,
      p_start_time: scheduled_start,
      p_end_time: scheduled_end
    });

    const conflicts = [];
    if (taskConflicts && taskConflicts.length > 0) {
      conflicts.push(...taskConflicts.map((c: any) => ({ ...c, type: 'task' })));
    }
    if (blockConflicts && blockConflicts.length > 0) {
      conflicts.push(...blockConflicts.map((c: any) => ({ ...c, type: 'time_block' })));
    }

    // Update task scheduling
    const { data: updated, error: updateError } = await (supabase as any)
      .from('tasks')
      .update({
        scheduled_start,
        scheduled_end
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task schedule:', updateError);
      return NextResponse.json(
        { error: 'Failed to update task schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      task: updated,
      conflicts: conflicts.length > 0 ? conflicts : null
    });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/tasks/[id]/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/tasks/[id]/schedule
// Remove task scheduling
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const supabase = createAdminClient();

    const { data: updated, error } = await (supabase as any)
      .from('tasks')
      .update({
        scheduled_start: null,
        scheduled_end: null
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing task schedule:', error);
      return NextResponse.json(
        { error: 'Failed to remove task schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in DELETE /api/calendar/tasks/[id]/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
