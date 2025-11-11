import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/backlog/[id]/promote - Promote a backlog item to a task
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      due_date,
      scheduled_start,
      scheduled_end,
      estimated_duration_minutes,
      energy_required,
      task_type,
    } = body;

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

    // Get the backlog item
    const { data: backlogItem, error: backlogError } = await supabase
      .from('backlog_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .single();

    if (backlogError || !backlogItem) {
      return NextResponse.json({ error: 'Backlog item not found' }, { status: 404 });
    }

    // Check if already promoted
    if ((backlogItem as any).promoted_to_task_id) {
      return NextResponse.json({
        error: 'Backlog item already promoted',
        task_id: (backlogItem as any).promoted_to_task_id
      }, { status: 400 });
    }

    // Create a new task from the backlog item
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: (user as any).id,
        title: (backlogItem as any).title,
        description: (backlogItem as any).description,
        goal_id: (backlogItem as any).goal_id,
        due_date: due_date || null,
        scheduled_start: scheduled_start || null,
        scheduled_end: scheduled_end || null,
        estimated_duration_minutes: estimated_duration_minutes || null,
        status: 'todo',
        energy_required: energy_required || 'medium',
        task_type: task_type || 'deep_work',
        eisenhower_quadrant: (backlogItem as any).ai_eisenhower_quadrant || null,
        source: 'backlog_promoted',
        priority_score: 50,
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

    if (taskError || !task) {
      console.error('Error creating task:', taskError);
      return NextResponse.json({ error: 'Failed to create task from backlog item' }, { status: 500 });
    }

    // Update backlog item to mark as promoted
    const { error: updateError } = await supabase
      .from('backlog_items')
      // @ts-expect-error - Update type inference issue
      .update({
        promoted_to_task_id: (task as any).id,
        promoted_at: new Date().toISOString(),
        status: 'ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', (user as any).id);

    if (updateError) {
      console.error('Error updating backlog item:', updateError);
      // Don't fail the request, task was created successfully
    }

    return NextResponse.json({
      success: true,
      task,
      message: 'Backlog item promoted to task successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
