import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/goals/[id] - Get a specific goal
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

    // Fetch goal with milestones
    const { data: goal, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones (
          id,
          title,
          description,
          target_date,
          completed,
          completed_at,
          order_index
        )
      `)
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .single();

    if (error || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/goals/[id] - Update a goal
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

    // Verify goal ownership
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .single();

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length === 0) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      if (body.title.length > 200) {
        return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.parent_goal_id !== undefined) {
      if (body.parent_goal_id === id) {
        return NextResponse.json({ error: 'A goal cannot be its own parent' }, { status: 400 });
      }
      updateData.parent_goal_id = body.parent_goal_id;
    }
    if (body.level !== undefined) updateData.level = body.level;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.target_date !== undefined) updateData.target_date = body.target_date;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // If marking as completed, set completed_at
      if (body.status === 'completed' && !body.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (body.success_criteria !== undefined) updateData.success_criteria = body.success_criteria;
    if (body.smart_analysis !== undefined) updateData.smart_analysis = body.smart_analysis;
    if (body.completed_at !== undefined) updateData.completed_at = body.completed_at;

    // Update goal
    const { data: goal, error } = await supabase
      .from('goals')
      // @ts-expect-error - Dynamic update object
      .update(updateData)
      .eq('id', id)
      .eq('user_id', (user as any).id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - Delete or archive a goal
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
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

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

    if (hardDelete) {
      // Permanent deletion
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', (user as any).id);

      if (error) {
        console.error('Error deleting goal:', error);
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Goal deleted successfully' });
    } else {
      // Soft delete (archive)
      const { data: goal, error } = await supabase
        .from('goals')
        // @ts-expect-error - Update type inference issue
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('user_id', (user as any).id)
        .select()
        .single();

      if (error) {
        console.error('Error archiving goal:', error);
        return NextResponse.json({ error: 'Failed to archive goal' }, { status: 500 });
      }

      return NextResponse.json(goal);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
