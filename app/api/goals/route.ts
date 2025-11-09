import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/goals - List all goals for the authenticated user
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
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Build query
    let query = supabase
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
      .eq('user_id', (user as any).id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    } else if (!includeArchived) {
      query = query.neq('status', 'archived');
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error('Error fetching goals:', error);
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals - Create a new goal
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
      type,
      parent_goal_id,
      level,
      start_date,
      target_date,
      priority,
      success_criteria,
      smart_analysis,
    } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 });
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

    // Validate parent_goal_id if provided
    if (parent_goal_id) {
      const { data: parentGoal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', parent_goal_id)
        .eq('user_id', (user as any).id)
        .single();

      if (!parentGoal) {
        return NextResponse.json({ error: 'Parent goal not found or access denied' }, { status: 404 });
      }
    }

    // Create goal
    const { data: goal, error } = await supabase
      .from('goals')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: (user as any).id,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || 'other',
        parent_goal_id: parent_goal_id || null,
        level: level || 'long_term',
        start_date: start_date || null,
        target_date: target_date || null,
        priority: priority || 'medium',
        status: 'active',
        success_criteria: success_criteria || [],
        smart_analysis: smart_analysis || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
