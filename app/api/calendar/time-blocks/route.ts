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

// POST /api/calendar/time-blocks
// Create a new time block
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const {
      title,
      description,
      start_time,
      end_time,
      block_type,
      is_protected,
      task_id,
      is_recurring,
      recurrence_rule
    } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Title, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const { data: conflicts } = await (supabase as any).rpc('detect_time_block_conflicts', {
      p_user_id: userId,
      p_start_time: start_time,
      p_end_time: end_time
    });

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Time block conflicts with existing blocks',
          conflicts
        },
        { status: 409 }
      );
    }

    // Create time block
    const { data: timeBlock, error } = await (supabase as any)
      .from('time_blocks')
      .insert({
        user_id: userId,
        title,
        description,
        start_time,
        end_time,
        block_type: block_type || 'work',
        is_protected: is_protected || false,
        task_id,
        is_recurring: is_recurring || false,
        recurrence_rule
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating time block:', error);
      return NextResponse.json(
        { error: 'Failed to create time block' },
        { status: 500 }
      );
    }

    return NextResponse.json(timeBlock, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/time-blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/calendar/time-blocks?start=2025-01-01&end=2025-01-31
// Fetch time blocks for a date range
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let query = supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (start) {
      query = query.gte('start_time', start);
    }
    if (end) {
      query = query.lte('end_time', end);
    }

    const { data: timeBlocks, error } = await query;

    if (error) {
      console.error('Error fetching time blocks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch time blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json(timeBlocks || []);
  } catch (error) {
    console.error('Error in GET /api/calendar/time-blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
