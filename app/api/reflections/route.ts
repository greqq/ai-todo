import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/reflections - Get reflections for the authenticated user
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
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') || '30';

    // Build query
    let query = supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', (user as any).id)
      .order('date', { ascending: false });

    // Filter by date if provided
    if (date) {
      query = query.eq('date', date);
    }

    // Apply limit
    query = query.limit(parseInt(limit, 10));

    const { data: reflections, error } = await query;

    if (error) {
      console.error('Error fetching reflections:', error);
      return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 });
    }

    return NextResponse.json(reflections);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reflections - Create or update a reflection
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      tasks_completed,
      tasks_planned,
      what_went_well,
      what_blocked_me,
      energy_level_end_of_day,
      mood,
      focus_quality,
      ai_insights,
      ai_suggestions,
    } = body;

    // Validation
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (energy_level_end_of_day !== undefined && (energy_level_end_of_day < 1 || energy_level_end_of_day > 10)) {
      return NextResponse.json({ error: 'Energy level must be between 1 and 10' }, { status: 400 });
    }

    if (focus_quality !== undefined && (focus_quality < 1 || focus_quality > 10)) {
      return NextResponse.json({ error: 'Focus quality must be between 1 and 10' }, { status: 400 });
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

    // Calculate completion rate
    const completion_rate =
      tasks_planned && tasks_planned > 0 ? tasks_completed / tasks_planned : 0;

    // Upsert reflection (insert or update if exists for this date)
    const { data: reflection, error } = await supabase
      .from('daily_reflections')
      // @ts-expect-error - Upsert type inference issue
      .upsert(
        {
          user_id: (user as any).id,
          date,
          tasks_completed: tasks_completed || 0,
          tasks_planned: tasks_planned || 0,
          completion_rate,
          what_went_well: what_went_well?.trim() || null,
          what_blocked_me: what_blocked_me?.trim() || null,
          energy_level_end_of_day: energy_level_end_of_day || null,
          mood: mood || null,
          focus_quality: focus_quality || null,
          ai_insights: ai_insights || null,
          ai_suggestions: ai_suggestions || null,
        },
        {
          onConflict: 'user_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving reflection:', error);
      return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
    }

    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
