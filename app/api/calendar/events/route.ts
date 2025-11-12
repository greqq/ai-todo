import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/calendar/events?start=2025-01-01&end=2025-01-31
// Fetch all tasks and time blocks for a date range
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = (user as any).id;

    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end date parameters are required' },
        { status: 400 }
      );
    }

    // Fetch tasks with scheduling
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .not('scheduled_start', 'is', null)
      .not('scheduled_end', 'is', null)
      .gte('scheduled_start', start)
      .lte('scheduled_end', end)
      .neq('status', 'cancelled');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    // Fetch time blocks
    const { data: timeBlocks, error: blocksError } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', start)
      .lte('end_time', end);

    if (blocksError) {
      console.error('Error fetching time blocks:', blocksError);
      return NextResponse.json(
        { error: 'Failed to fetch time blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tasks: tasks || [],
      timeBlocks: timeBlocks || []
    });
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
