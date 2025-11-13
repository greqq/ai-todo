import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklySummaryEmail } from '@/lib/email/send-email';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

// This should be called by a cron job (e.g., Vercel Cron or external scheduler)
// Runs every Monday morning to send last week's summary

export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (using a secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all users with email notifications enabled
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    // Get last week's date range
    const lastWeek = subWeeks(new Date(), 1);
    const weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 }); // Sunday

    // Send email to each user
    for (const user of users || []) {
      const preferences = user.preferences as any;

      // Skip if email notifications are disabled
      if (preferences?.enable_email_notifications === false) {
        results.skipped++;
        continue;
      }

      try {
        // Try to get existing weekly summary from database
        const { data: existingSummary } = await supabaseAdmin
          .from('weekly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_start_date', format(weekStart, 'yyyy-MM-dd'))
          .single();

        let summaryData;

        if (existingSummary) {
          // Use existing summary
          summaryData = {
            tasksCompleted: existingSummary.total_tasks_completed,
            tasksPlanned: existingSummary.total_tasks_planned,
            completionRate: Math.round(existingSummary.completion_rate * 100),
            timeInvested: Math.round(
              existingSummary.total_time_invested_minutes / 60
            ),
            keyWins: existingSummary.key_wins || [],
            challenges: existingSummary.challenges || [],
            suggestionsForNextWeek: existingSummary.suggestions_for_next_week || [],
          };
        } else {
          // Calculate summary from tasks
          const { data: completedTasks } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .gte('completed_at', weekStart.toISOString())
            .lte('completed_at', weekEnd.toISOString())
            .eq('status', 'completed');

          const { data: plannedTasks } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .gte('due_date', weekStart.toISOString())
            .lte('due_date', weekEnd.toISOString());

          const tasksCompleted = completedTasks?.length || 0;
          const tasksPlanned = plannedTasks?.length || 0;
          const completionRate =
            tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

          const timeInvested = Math.round(
            (completedTasks?.reduce(
              (sum, task) => sum + (task.actual_duration_minutes || 0),
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
        const result = await sendWeeklySummaryEmail(user.email, {
          userName: user.full_name || 'there',
          weekStart: format(weekStart, 'MMM d, yyyy'),
          weekEnd: format(weekEnd, 'MMM d, yyyy'),
          ...summaryData,
          dashboardUrl,
        });

        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          console.error(`Failed to send email to ${user.email}:`, result.error);
        }
      } catch (error) {
        results.failed++;
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Weekly summaries sent',
      results,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
