import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/energy - Get energy logs for the authenticated user
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const timeOfDay = searchParams.get('time_of_day');
    const taskId = searchParams.get('task_id');
    const limit = searchParams.get('limit') || '100';

    // Build query
    let query = supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', (user as any).id)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    if (timeOfDay) {
      query = query.eq('time_of_day', timeOfDay);
    }
    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    // Apply limit
    query = query.limit(parseInt(limit, 10));

    const { data: energyLogs, error } = await query;

    if (error) {
      console.error('Error fetching energy logs:', error);
      return NextResponse.json({ error: 'Failed to fetch energy logs' }, { status: 500 });
    }

    return NextResponse.json(energyLogs);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/energy - Create a new energy log entry
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { energy_level, time_of_day, context, task_id, task_was_energizing } = body;

    // Validation
    if (!energy_level || energy_level < 1 || energy_level > 10) {
      return NextResponse.json(
        { error: 'Energy level is required and must be between 1 and 10' },
        { status: 400 }
      );
    }

    const validTimesOfDay = [
      'early_morning',
      'morning',
      'midday',
      'afternoon',
      'evening',
      'night',
    ];
    if (time_of_day && !validTimesOfDay.includes(time_of_day)) {
      return NextResponse.json(
        { error: `Time of day must be one of: ${validTimesOfDay.join(', ')}` },
        { status: 400 }
      );
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

    // Auto-detect time of day if not provided
    let finalTimeOfDay = time_of_day;
    if (!finalTimeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 7) finalTimeOfDay = 'early_morning';
      else if (hour >= 7 && hour < 12) finalTimeOfDay = 'morning';
      else if (hour >= 12 && hour < 15) finalTimeOfDay = 'midday';
      else if (hour >= 15 && hour < 18) finalTimeOfDay = 'afternoon';
      else if (hour >= 18 && hour < 22) finalTimeOfDay = 'evening';
      else finalTimeOfDay = 'night';
    }

    // Insert energy log
    const { data: energyLog, error } = await supabase
      .from('energy_logs')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        user_id: (user as any).id,
        energy_level,
        time_of_day: finalTimeOfDay,
        context: context?.trim() || null,
        task_id: task_id || null,
        task_was_energizing: task_was_energizing !== undefined ? task_was_energizing : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating energy log:', error);
      return NextResponse.json({ error: 'Failed to create energy log' }, { status: 500 });
    }

    return NextResponse.json(energyLog, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
