import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get today's tasks
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('due_date', `${today}T00:00:00`)
      .lte('due_date', `${today}T23:59:59`)
      .order('priority_score', { ascending: false });

    // Get all active tasks (for upcoming)
    const { data: allActiveTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])
      .order('due_date', { ascending: true });

    // Get active goals with progress
    const { data: activeGoals } = await supabase
      .from('goals')
      .select(`
        *,
        milestones:milestones(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: false });

    // Calculate goal progress
    const goalsWithProgress = await Promise.all(
      (activeGoals || []).map(async (goal) => {
        const { data: goalTasks } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('goal_id', goal.id);

        const totalTasks = goalTasks?.length || 0;
        const completedTasks = goalTasks?.filter(t => t.status === 'completed').length || 0;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const completedMilestones = goal.milestones?.filter((m: any) => m.completed).length || 0;
        const totalMilestones = goal.milestones?.length || 0;

        return {
          ...goal,
          completion_percentage: completionPercentage,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completed_milestones: completedMilestones,
          total_milestones: totalMilestones,
        };
      })
    );

    // Get today's energy logs
    const { data: todayEnergyLogs } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', `${today}T00:00:00`)
      .order('timestamp', { ascending: false })
      .limit(1);

    // Get recent energy pattern (last 7 days average)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentEnergyLogs } = await supabase
      .from('energy_logs')
      .select('energy_level')
      .eq('user_id', user.id)
      .gte('timestamp', sevenDaysAgo.toISOString());

    const averageEnergy = recentEnergyLogs && recentEnergyLogs.length > 0
      ? recentEnergyLogs.reduce((sum, log) => sum + log.energy_level, 0) / recentEnergyLogs.length
      : null;

    // Calculate today's completion stats
    const todayTasksCompleted = todayTasks?.filter(t => t.status === 'completed').length || 0;
    const todayTasksTotal = todayTasks?.length || 0;
    const todayCompletionRate = todayTasksTotal > 0
      ? Math.round((todayTasksCompleted / todayTasksTotal) * 100)
      : 0;

    // Get upcoming tasks (next 7 days, excluding today)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = allActiveTasks?.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate >= tomorrow && taskDate <= nextWeek;
    }).slice(0, 5) || [];

    // Get user's current streak
    const { data: recentReflections } = await supabase
      .from('daily_reflections')
      .select('date, completion_rate')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    let currentStreak = 0;
    if (recentReflections && recentReflections.length > 0) {
      const sortedReflections = [...recentReflections].reverse();
      for (const reflection of sortedReflections) {
        if (reflection.completion_rate >= 0.8) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      todayTasks: todayTasks || [],
      todayStats: {
        completed: todayTasksCompleted,
        total: todayTasksTotal,
        completionRate: todayCompletionRate,
      },
      activeGoals: goalsWithProgress,
      upcomingTasks,
      energy: {
        current: todayEnergyLogs && todayEnergyLogs.length > 0 ? todayEnergyLogs[0].energy_level : null,
        average: averageEnergy ? Math.round(averageEnergy * 10) / 10 : null,
        peakTime: user.preferences?.energy_peak_time || 'morning',
      },
      streak: {
        current: currentStreak,
        longest: user.longest_streak_days || 0,
      },
      user: {
        name: user.full_name,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
