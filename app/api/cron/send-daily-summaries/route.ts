import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDailySummaryEmail } from '@/lib/email/send-email';
import { format, startOfDay, subDays } from 'date-fns';

// This should be called by a cron job (e.g., Vercel Cron or external scheduler)
// Runs every morning at 6 AM

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

    // Send email to each user
    for (const user of users || []) {
      const preferences = user.preferences as any;

      // Skip if email notifications are disabled
      if (preferences?.enable_email_notifications === false) {
        results.skipped++;
        continue;
      }

      try {
        // Get yesterday's completed tasks
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const { data: yesterdayTasks } = await supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', yesterdayStart.toISOString())
          .eq('status', 'completed');

        // Get yesterday's planned tasks
        const { data: yesterdayPlannedTasks } = await supabaseAdmin
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .gte('due_date', yesterdayStart.toISOString())
          .lt('due_date', startOfDay(new Date()).toISOString());

        // Get today's tasks
        const todayStart = startOfDay(new Date());
        const { data: todayTasks } = await supabaseAdmin
          .from('tasks')
          .select(`
            *,
            goals (
              title
            )
          `)
          .eq('user_id', user.id)
          .gte('due_date', todayStart.toISOString())
          .eq('status', 'todo')
          .order('priority_score', { ascending: false })
          .limit(5);

        const tasksCompleted = yesterdayTasks?.length || 0;
        const tasksPlanned = yesterdayPlannedTasks?.length || 0;
        const completionRate =
          tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Send email
        const result = await sendDailySummaryEmail(user.email, {
          userName: user.full_name || 'there',
          date: format(new Date(), 'EEEE, MMMM d'),
          tasksCompleted,
          tasksPlanned,
          completionRate,
          todayTasks: (todayTasks || []).map((task: any) => ({
            title: task.title,
            goalTitle: task.goals?.title,
            energyRequired: task.energy_required || 'medium',
          })),
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
      message: 'Daily summaries sent',
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
