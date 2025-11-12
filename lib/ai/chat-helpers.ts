/**
 * Helper functions for AI chat
 * Gathers user context for chat conversations
 */

import { createAdminClient } from '@/lib/supabase/admin';

export interface UserChatContext {
  goals: Array<{ id: string; title: string; progress: number; status: string }>;
  todaysTasks: Array<{ id: string; title: string; status: string; due_date?: string }>;
  completionRate: number;
  energyPatterns: string;
  recentReflections: string;
}

/**
 * Get user's context for AI chat
 * Gathers recent data to provide context-aware responses
 */
export async function getUserChatContext(userId: string): Promise<UserChatContext> {
  const supabase = createAdminClient();

  // Get user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, clerk_user_id')
    .eq('clerk_user_id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const dbUserId = (user as any).id;

  // Get active goals with their progress
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      completion_percentage,
      status,
      priority
    `)
    .eq('user_id', dbUserId)
    .in('status', ['active', 'in_progress'])
    .order('priority', { ascending: false })
    .limit(10);

  // Format goals for context
  const formattedGoals =
    goals?.map((goal: any) => ({
      id: goal.id,
      title: goal.title,
      progress: goal.completion_percentage || 0,
      status: goal.status,
    })) || [];

  // Get today's tasks
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: todaysTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      due_date
    `)
    .eq('user_id', dbUserId)
    .gte('due_date', todayStart)
    .lte('due_date', todayEnd)
    .order('priority_score', { ascending: false });

  // Format today's tasks
  const formattedTodaysTasks =
    todaysTasks?.map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      due_date: task.due_date,
    })) || [];

  // Get completion rate for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const { data: recentCompletedTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', dbUserId)
    .eq('status', 'completed')
    .gte('completed_at', sevenDaysAgoStr);

  const { data: recentAllTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', dbUserId)
    .gte('created_at', sevenDaysAgoStr);

  const completionRate =
    recentAllTasks && recentAllTasks.length > 0
      ? Math.round(
          ((recentCompletedTasks?.length || 0) / recentAllTasks.length) * 100
        )
      : 0;

  // Get energy patterns (from user preferences and recent energy logs)
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('energy_peak_time')
    .eq('user_id', dbUserId)
    .single();

  const { data: recentEnergyLogs } = await supabase
    .from('energy_logs')
    .select('energy_level, time_of_day')
    .eq('user_id', dbUserId)
    .gte('timestamp', sevenDaysAgoStr)
    .order('timestamp', { ascending: false })
    .limit(10);

  // Calculate average energy by time of day
  const energyByTimeOfDay: Record<string, number[]> = {};
  recentEnergyLogs?.forEach((log: any) => {
    if (!energyByTimeOfDay[log.time_of_day]) {
      energyByTimeOfDay[log.time_of_day] = [];
    }
    energyByTimeOfDay[log.time_of_day].push(log.energy_level);
  });

  const avgEnergyByTime: Record<string, number> = {};
  Object.keys(energyByTimeOfDay).forEach((timeOfDay) => {
    const levels = energyByTimeOfDay[timeOfDay];
    avgEnergyByTime[timeOfDay] =
      levels.reduce((sum, level) => sum + level, 0) / levels.length;
  });

  const energyPatterns = `Peak energy time: ${(preferences as any)?.energy_peak_time || 'Not set'}. ${
    Object.keys(avgEnergyByTime).length > 0
      ? `Recent average energy: ${Object.entries(avgEnergyByTime)
          .map(([time, avg]) => `${time}: ${avg.toFixed(1)}/10`)
          .join(', ')}`
      : 'No recent energy data'
  }`;

  // Get recent reflections
  const { data: recentReflections } = await supabase
    .from('daily_reflections')
    .select('date, what_went_well, what_blocked_me, mood, energy_level_end_of_day')
    .eq('user_id', dbUserId)
    .gte('date', sevenDaysAgoStr)
    .order('date', { ascending: false })
    .limit(3);

  const reflectionsSummary =
    recentReflections && recentReflections.length > 0
      ? recentReflections
          .map(
            (r: any) =>
              `${r.date}: ${r.what_went_well ? `Went well: ${r.what_went_well}.` : ''} ${r.what_blocked_me ? `Blocked by: ${r.what_blocked_me}.` : ''} Mood: ${r.mood || 'N/A'}, Energy: ${r.energy_level_end_of_day || 'N/A'}/10`
          )
          .join(' | ')
      : 'No recent reflections';

  return {
    goals: formattedGoals,
    todaysTasks: formattedTodaysTasks,
    completionRate,
    energyPatterns,
    recentReflections: reflectionsSummary,
  };
}
