import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/backlog - List all backlog items for the authenticated user
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
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const goalId = searchParams.get('goal_id');
    const view = searchParams.get('view'); // all, suggested, stale

    // Build query - exclude archived items by default
    let query = supabase
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
      .eq('user_id', (user as any).id)
      .is('archived_at', null);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    // Apply view filters
    if (view === 'suggested') {
      // Items that AI suggests scheduling
      query = query.not('ai_suggested_schedule_date', 'is', null);
    } else if (view === 'stale') {
      // Items older than 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      query = query.lt('created_at', sixtyDaysAgo.toISOString());
    }

    // Order by: AI suggestions first, then priority, then newest
    query = query
      .order('ai_suggested_schedule_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching backlog items:', error);
      return NextResponse.json({ error: 'Failed to fetch backlog items' }, { status: 500 });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/backlog - Create a new backlog item
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
      category,
      priority,
      status,
      goal_id,
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

    // Create backlog item
    const { data: item, error } = await supabase
      .from('backlog_items')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: (user as any).id,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'idea',
        priority: priority || 'nice_to_have',
        status: status || 'new',
        goal_id: goal_id || null,
      })
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

    if (error) {
      console.error('Error creating backlog item:', error);
      return NextResponse.json({ error: 'Failed to create backlog item' }, { status: 500 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
