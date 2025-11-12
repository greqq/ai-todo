import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getAllGoalsProgressMetrics,
  calculateGoalProgressMetrics,
} from '@/lib/ai/analytics-helpers';

/**
 * GET /api/analytics/goals
 * Returns progress metrics for all active goals or a specific goal
 * Query params:
 *   - goalId: Optional. Get metrics for a specific goal
 */
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

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    let metrics;

    if (goalId) {
      // Get metrics for specific goal
      metrics = await calculateGoalProgressMetrics(supabase, (user as any).id, goalId);
    } else {
      // Get metrics for all goals
      metrics = await getAllGoalsProgressMetrics(supabase, (user as any).id);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching goal analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal analytics' },
      { status: 500 }
    );
  }
}
