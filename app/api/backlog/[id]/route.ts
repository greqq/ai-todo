import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/backlog/[id] - Get a single backlog item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
    const { data: item, error } = await supabase
      .from('backlog_items')
      .select(`
        *,
        goal:goals!backlog_items_goal_id_fkey (
          id,
          title,
          type,
          status
        )
      `)
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Backlog item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/backlog/[id] - Update a backlog item
export async function PATCH(
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
      title,
      description,
      category,
      priority,
      status,
      goal_id,
      ai_suggested_schedule_date,
      ai_eisenhower_quadrant,
      ai_effort_estimate,
      ai_impact_score,
    } = body;

    // Validation
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      if (title.length > 500) {
        return NextResponse.json({ error: 'Title must be 500 characters or less' }, { status: 400 });
      }
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
    if (goal_id !== undefined && goal_id !== null) {
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

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (goal_id !== undefined) updateData.goal_id = goal_id;
    if (ai_suggested_schedule_date !== undefined) updateData.ai_suggested_schedule_date = ai_suggested_schedule_date;
    if (ai_eisenhower_quadrant !== undefined) updateData.ai_eisenhower_quadrant = ai_eisenhower_quadrant;
    if (ai_effort_estimate !== undefined) updateData.ai_effort_estimate = ai_effort_estimate;
    if (ai_impact_score !== undefined) updateData.ai_impact_score = ai_impact_score;

    // Update the backlog item
    const { data: item, error } = await supabase
      .from('backlog_items')
      // @ts-expect-error - Update type inference issue
      .update(updateData)
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .select(`
        *,
        goal:goals!backlog_items_goal_id_fkey (
          id,
          title,
          type,
          status
        )
      `)
      .single();

    if (error || !item) {
      console.error('Error updating backlog item:', error);
      return NextResponse.json({ error: 'Failed to update backlog item' }, { status: 500 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/backlog/[id] - Archive a backlog item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    // Check if permanent delete is requested
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanently delete the backlog item
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id)
        .eq('user_id', (user as any).id);

      if (error) {
        console.error('Error deleting backlog item:', error);
        return NextResponse.json({ error: 'Failed to delete backlog item' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Backlog item permanently deleted' });
    } else {
      // Archive the backlog item (soft delete)
      const { data: item, error } = await supabase
        .from('backlog_items')
        // @ts-expect-error - Update type inference issue
        .update({
          archived_at: new Date().toISOString(),
          archive_reason: 'user_deleted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', (user as any).id)
        .select()
        .single();

      if (error || !item) {
        console.error('Error archiving backlog item:', error);
        return NextResponse.json({ error: 'Failed to archive backlog item' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Backlog item archived', data: item });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
