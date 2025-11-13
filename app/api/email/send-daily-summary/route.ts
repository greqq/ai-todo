import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDailySummaryEmail } from '@/lib/email/send-email';
import { format, startOfDay, subDays } from 'date-fns';

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
      .select('id, email, full_name, preferences')
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

    // Get yesterday's completed tasks
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const { data: yesterdayTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', (user as any).id)
      .gte('completed_at', yesterdayStart.toISOString())
      .eq('status', 'completed');

    // Get yesterday's planned tasks (tasks that were due yesterday)
    const { data: yesterdayPlannedTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', (user as any).id)
      .gte('due_date', yesterdayStart.toISOString())
      .lt('due_date', startOfDay(new Date()).toISOString());

    // Get today's tasks
    const todayStart = startOfDay(new Date());
    const { data: todayTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        goals (
          title
        )
      `)
      .eq('user_id', (user as any).id)
      .gte('due_date', todayStart.toISOString())
      .eq('status', 'todo')
      .order('priority_score', { ascending: false })
      .limit(5);

    if (tasksError) {
      return NextResponse.json(
        { error: 'Error fetching tasks' },
        { status: 500 }
      );
    }

    const tasksCompleted = yesterdayTasks?.length || 0;
    const tasksPlanned = yesterdayPlannedTasks?.length || 0;
    const completionRate =
      tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Send email
    const result = await sendDailySummaryEmail((user as any).email, {
      userName: (user as any).full_name || 'there',
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

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending daily summary email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
