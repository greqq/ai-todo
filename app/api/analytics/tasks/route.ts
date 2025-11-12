import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateTaskAnalytics } from '@/lib/ai/analytics-helpers';

/**
 * GET /api/analytics/tasks
 * Returns comprehensive task analytics including completion metrics,
 * time metrics, and pattern recognition data
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

    const analytics = await calculateTaskAnalytics(supabase, (user as any).id);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task analytics' },
      { status: 500 }
    );
  }
}
