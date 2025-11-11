import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWeekRange } from '@/lib/ai/weekly-summary-helpers';

// GET /api/summaries/weekly - Get weekly summaries
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Optional: specific week to fetch
    const limit = searchParams.get('limit'); // Optional: number of recent summaries to fetch

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

    if (date) {
      // Fetch specific week
      const targetDate = new Date(date);
      const { weekStartDate } = getWeekRange(targetDate);

      const { data: summary, error: summaryError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', (user as any).id)
        .eq('week_start_date', weekStartDate)
        .single();

      if (summaryError) {
        if (summaryError.code === 'PGRST116') {
          // No summary found
          return NextResponse.json(
            { error: 'No summary found for this week' },
            { status: 404 }
          );
        }
        console.error('Error fetching weekly summary:', summaryError);
        return NextResponse.json(
          { error: 'Failed to fetch weekly summary' },
          { status: 500 }
        );
      }

      // Fetch related goal details for goals needing attention
      const goalIds = (summary as any).goals_needing_attention || [];
      let goalsData: any[] = [];

      if (goalIds.length > 0) {
        const { data: goals } = await supabase
          .from('goals')
          .select('id, title, description, completion_percentage, status')
          .in('id', goalIds);

        goalsData = goals || [];
      }

      // Fetch backlog item details
      const backlogIds = (summary as any).backlog_items_suggested || [];
      let backlogData: any[] = [];

      if (backlogIds.length > 0) {
        const { data: backlog } = await supabase
          .from('backlog_items')
          .select('id, title, description, category, priority')
          .in('id', backlogIds);

        backlogData = backlog || [];
      }

      return NextResponse.json({
        summary,
        goals_needing_attention: goalsData,
        backlog_suggestions: backlogData,
      });
    } else {
      // Fetch recent summaries
      const summaryLimit = limit ? parseInt(limit, 10) : 10;

      const { data: summaries, error: summariesError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', (user as any).id)
        .order('week_start_date', { ascending: false })
        .limit(summaryLimit);

      if (summariesError) {
        console.error('Error fetching weekly summaries:', summariesError);
        return NextResponse.json(
          { error: 'Failed to fetch weekly summaries' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        summaries: summaries || [],
        count: summaries?.length || 0,
      });
    }
  } catch (error) {
    console.error('Unexpected error fetching weekly summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
