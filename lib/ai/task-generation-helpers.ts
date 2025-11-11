/**
 * Helper functions for AI task generation
 * Gathers user context and processes AI responses
 */

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Get user's daily context for AI task generation
 */
export async function getUserDailyContext(userId: string) {
  const supabase = createAdminClient();

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Get active goals with their progress
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', (user as any).id)
    .in('status', ['active', 'in_progress'])
    .order('priority', { ascending: false })
    .limit(10);

  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', (user as any).id)
    .single();

  // Get today's date info
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get tasks completed yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

  const { data: yesterdayTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', (user as any).id)
    .eq('status', 'completed')
    .gte('completed_at', yesterdayStart)
    .lte('completed_at', yesterdayEnd);

  // Get completion rate for last 7 days
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const { data: recentCompletedTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', (user as any).id)
    .eq('status', 'completed')
    .gte('completed_at', sevenDaysAgoStr);

  const { data: recentAllTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', (user as any).id)
    .gte('created_at', sevenDaysAgoStr);

  const completionRate =
    recentAllTasks && recentAllTasks.length > 0
      ? Math.round(
          ((recentCompletedTasks?.length || 0) / recentAllTasks.length) * 100
        )
      : 0;

  // Get overdue tasks
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      goal_id,
      estimated_duration_minutes,
      energy_required,
      task_type,
      eisenhower_quadrant,
      due_date,
      goal:goals!tasks_goal_id_fkey (
        id,
        title,
        priority
      )
    `)
    .eq('user_id', (user as any).id)
    .in('status', ['todo', 'in_progress'])
    .lt('due_date', today.toISOString())
    .order('due_date', { ascending: true })
    .limit(10);

  // Get high-priority incomplete tasks
  const { data: priorityTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      goal_id,
      estimated_duration_minutes,
      energy_required,
      task_type,
      eisenhower_quadrant,
      due_date,
      goal:goals!tasks_goal_id_fkey (
        id,
        title,
        priority
      )
    `)
    .eq('user_id', (user as any).id)
    .in('status', ['todo', 'in_progress'])
    .gte('priority_score', 70)
    .order('priority_score', { ascending: false })
    .limit(10);

  // Format energy levels
  const energyLevels = {
    morning: (preferences as any)?.morning_energy_level || 'medium',
    afternoon: (preferences as any)?.afternoon_energy_level || 'medium',
    evening: (preferences as any)?.evening_energy_level || 'low',
  };

  // Determine peak time based on energy levels
  const energyMap = { high: 3, medium: 2, low: 1 };
  const morningScore = energyMap[energyLevels.morning as keyof typeof energyMap];
  const afternoonScore = energyMap[energyLevels.afternoon as keyof typeof energyMap];
  const eveningScore = energyMap[energyLevels.evening as keyof typeof energyMap];

  let energyPeakTime = 'Morning';
  if (afternoonScore >= morningScore && afternoonScore >= eveningScore) {
    energyPeakTime = 'Afternoon';
  } else if (eveningScore >= morningScore && eveningScore >= afternoonScore) {
    energyPeakTime = 'Evening';
  }

  // Format goals for prompt
  const goalsForPrompt = (goals || []).map((goal) => ({
    id: (goal as any).id,
    title: (goal as any).title,
    priority: (goal as any).priority,
    progress_percentage: (goal as any).progress_percentage || 0,
  }));

  // Format available tasks pool
  const availableTasksPool = {
    overdue: overdueTasks || [],
    priority: priorityTasks || [],
  };

  return {
    user,
    goals: goalsForPrompt,
    preferences,
    date: dateStr,
    dayOfWeek,
    workHoursStart: (preferences as any)?.work_hours_start || '09:00',
    workHoursEnd: (preferences as any)?.work_hours_end || '17:00',
    energyPeakTime,
    energyLevels,
    tasksCompletedYesterday: yesterdayTasks?.length || 0,
    last7DaysCompletionRate: completionRate,
    availableTasksPool,
  };
}

/**
 * Format available tasks pool for AI prompt
 */
export function formatAvailableTasksForPrompt(tasksPool: any) {
  const sections = [];

  if (tasksPool.overdue && tasksPool.overdue.length > 0) {
    sections.push('Overdue Tasks:');
    tasksPool.overdue.forEach((task: any, index: number) => {
      sections.push(
        `${index + 1}. [${task.id}] ${task.title} (Due: ${task.due_date}, Energy: ${task.energy_required}, Quadrant: ${task.eisenhower_quadrant || 'unknown'})`
      );
    });
  }

  if (tasksPool.priority && tasksPool.priority.length > 0) {
    sections.push('\nHigh-Priority Tasks:');
    tasksPool.priority.forEach((task: any, index: number) => {
      sections.push(
        `${index + 1}. [${task.id}] ${task.title} (Energy: ${task.energy_required}, Type: ${task.task_type}, Goal: ${task.goal?.title || 'No goal'})`
      );
    });
  }

  return sections.join('\n');
}
