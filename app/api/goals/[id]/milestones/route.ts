import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/goals/[id]/milestones - Create a milestone for a goal
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
    const body = await request.json();
    const { title, description, target_date, order_index } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
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

    // Verify goal ownership
    const { data: goal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', (user as any).id)
      .single();

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // If order_index not provided, get the next index
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined) {
      const { data: milestones } = await supabase
        .from('milestones')
        .select('order_index')
        .eq('goal_id', goalId)
        .order('order_index', { ascending: false })
        .limit(1);

      finalOrderIndex = milestones && milestones.length > 0 ? (milestones[0] as any).order_index + 1 : 0;
    }

    // Create milestone
    const { data: milestone, error } = await supabase
      .from('milestones')
      // @ts-expect-error - Insert type inference issue
      .insert({
        goal_id: goalId,
        title: title.trim(),
        description: description?.trim() || null,
        target_date: target_date || null,
        order_index: finalOrderIndex,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating milestone:', error);
      return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
    }

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/goals/[id]/milestones - Get all milestones for a goal
export async function GET(
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

    // Verify goal ownership
    const { data: goal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', (user as any).id)
      .single();

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    // Get milestones
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
