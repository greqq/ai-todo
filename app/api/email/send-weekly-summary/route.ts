import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWeeklySummaryEmail } from '@/lib/email/send-email';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has email notifications enabled
    const preferences = (user as any).preferences as any;
    if (preferences?.enable_email_notifications === false) {
      return NextResponse.json(
        { message: 'Email notifications disabled' },
        { status: 200 }
      );
    }

    // Get last week's date range
    const lastWeek = subWeeks(new Date(), 1);
    const weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 }); // Sunday

    // Try to get existing weekly summary from database
    const { data: existingSummary } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', (user as any).id)
      .eq('week_start_date', format(weekStart, 'yyyy-MM-dd'))
      .single();

    let summaryData;

    if (existingSummary) {
      // Use existing summary
      const summary = existingSummary as any;
      summaryData = {
        tasksCompleted: summary.total_tasks_completed,
        tasksPlanned: summary.total_tasks_planned,
        completionRate: Math.round(summary.completion_rate * 100),
        timeInvested: Math.round(
          summary.total_time_invested_minutes / 60
        ),
        keyWins: summary.key_wins || [],
        challenges: summary.challenges || [],
        suggestionsForNextWeek: summary.suggestions_for_next_week || [],
      };
    } else {
      // Calculate summary from tasks
      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', (user as any).id)
        .gte('completed_at', weekStart.toISOString())
        .lte('completed_at', weekEnd.toISOString())
        .eq('status', 'completed');

      const { data: plannedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', (user as any).id)
        .gte('due_date', weekStart.toISOString())
        .lte('due_date', weekEnd.toISOString());

      const tasksCompleted = completedTasks?.length || 0;
      const tasksPlanned = plannedTasks?.length || 0;
      const completionRate =
        tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

      const timeInvested = Math.round(
        (completedTasks?.reduce(
          (sum, task: any) => sum + (task.actual_duration_minutes || 0),
          0
        ) || 0) / 60
      );

      summaryData = {
        tasksCompleted,
        tasksPlanned,
        completionRate,
        timeInvested,
        keyWins: [
          `Completed ${tasksCompleted} tasks this week`,
          tasksCompleted > 0 ? `Invested ${timeInvested} hours in your goals` : '',
        ].filter(Boolean),
        challenges: completionRate < 70 ? ['Consider adjusting daily task load'] : [],
        suggestionsForNextWeek: [
          'Continue building momentum',
          'Focus on high-priority tasks',
        ],
      };
    }

    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Send email
    const result = await sendWeeklySummaryEmail((user as any).email, {
      userName: (user as any).full_name || 'there',
      weekStart: format(weekStart, 'MMM d, yyyy'),
      weekEnd: format(weekEnd, 'MMM d, yyyy'),
      ...summaryData,
      dashboardUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
