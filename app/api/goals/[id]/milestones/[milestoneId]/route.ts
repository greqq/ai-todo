import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PATCH /api/goals/[id]/milestones/[milestoneId] - Update a milestone
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, milestoneId } = await params;
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

    const userId_internal = (user as any).id;

    // Verify goal ownership through milestone
    const { data: milestone } = await supabase
      .from('milestones')
      .select('id, goal_id')
      .eq('id', milestoneId)
      .eq('goal_id', goalId)
      .single();

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Verify the goal belongs to the user
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId_internal)
      .single();

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length === 0) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.target_date !== undefined) updateData.target_date = body.target_date;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      // If marking as completed, set completed_at
      if (body.completed && !body.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (!body.completed) {
        updateData.completed_at = null;
      }
    }
    if (body.completed_at !== undefined) updateData.completed_at = body.completed_at;

    // Update milestone
    const { data: updatedMilestone, error } = await supabase
      .from('milestones')
      // @ts-expect-error - Dynamic update object
      .update(updateData)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) {
      console.error('Error updating milestone:', error);
      return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
    }

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/goals/[id]/milestones/[milestoneId] - Delete a milestone
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, milestoneId } = await params;

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

    const userId_internal = (user as any).id;

    // Verify goal ownership
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', userId_internal)
      .single();

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // Delete milestone
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)
      .eq('goal_id', goalId);

    if (error) {
      console.error('Error deleting milestone:', error);
      return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
