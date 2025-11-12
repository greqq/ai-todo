/**
 * Weekly Summary Helper Functions
 * Gathers and calculates weekly stats for AI summary generation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export interface WeeklyStats {
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: number;
  tasksPlanned: number;
  completionRate: number;
  timeInvestedHours: number;
  highCompletionDays: number;
  goalsList: string[];
  goalProgressDetails: string;
  dailyReflectionsSummary: string;
  energyData?: {
    avgEnergy: number;
    energizingTasks: string[];
    drainingTasks: string[];
    bestTime: string;
  };
  patternsDetected?: {
    productiveDays: string[];
    commonBlockers: string[];
    procrastinationData?: string;
  };
}

/**
 * Get week date range for a given date
 */
export function getWeekRange(date: Date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  return {
    weekStartDate: format(weekStart, 'yyyy-MM-dd'),
    weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
    weekStart,
    weekEnd,
  };
}

/**
 * Calculate weekly statistics from database
 */
export async function calculateWeeklyStats(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string,
  weekEndDate: string
): Promise<WeeklyStats> {
  // 1. Get all tasks for the week
  const { data: weekTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .or(`due_date.gte.${weekStartDate}T00:00:00,due_date.lte.${weekEndDate}T23:59:59,completed_at.gte.${weekStartDate}T00:00:00,completed_at.lte.${weekEndDate}T23:59:59`);

  const tasks = (weekTasks as any[]) || [];
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalTasksPlanned = tasks.filter((t) => t.status !== 'cancelled').length;

  // Calculate completion rate
  const completionRate =
    totalTasksPlanned > 0
      ? Math.round((completedTasks.length / totalTasksPlanned) * 100)
      : 0;

  // Calculate time invested (sum of actual duration)
  const totalTimeMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.actual_duration_minutes || 0),
    0
  );
  const timeInvestedHours = Math.round(totalTimeMinutes / 60);

  // 2. Get daily reflections for the week
  const { data: reflections } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekStartDate)
    .lte('date', weekEndDate)
    .order('date', { ascending: true });

  const weekReflections = (reflections as any[]) || [];

  // Count days with >80% completion
  const highCompletionDays = weekReflections.filter(
    (r) => (r.completion_rate || 0) > 0.8
  ).length;

  // 3. Get goals worked on during the week
  const goalIdSet = new Set(tasks.map((t) => t.goal_id).filter(Boolean));
  const goalIds = Array.from(goalIdSet);

  const { data: goals } = await supabase
    .from('goals')
    .select('id, title, completion_percentage')
    .in('id', goalIds.length > 0 ? goalIds : ['00000000-0000-0000-0000-000000000000']); // Dummy ID if no goals

  const goalsData = (goals as any[]) || [];
  const goalsList = goalsData.map((g) => g.title);

  // Create goal progress details
  const goalProgressDetails = goalsData
    .map((g) => {
      const goalTasks = tasks.filter((t) => t.goal_id === g.id);
      const goalCompleted = goalTasks.filter((t) => t.status === 'completed').length;
      return `- ${g.title}: ${goalCompleted} tasks completed (${g.completion_percentage}% overall progress)`;
    })
    .join('\n');

  // 4. Daily reflections summary
  const dailyReflectionsSummary = weekReflections
    .map((r) => {
      return `${r.date}: ${r.completion_rate ? Math.round(r.completion_rate * 100) : 0}% completion, mood: ${r.mood || 'not recorded'}`;
    })
    .join('\n');

  // 5. Energy data
  const { data: energyLogs } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', `${weekStartDate}T00:00:00`)
    .lte('timestamp', `${weekEndDate}T23:59:59`);

  const logs = (energyLogs as any[]) || [];

  let energyData = undefined;
  if (logs.length > 0 || weekReflections.length > 0) {
    // Calculate average energy
    const reflectionEnergies = weekReflections
      .map((r) => r.energy_level_end_of_day)
      .filter((e) => e !== null && e !== undefined);
    const avgEnergy =
      reflectionEnergies.length > 0
        ? reflectionEnergies.reduce((sum, e) => sum + e, 0) / reflectionEnergies.length
        : 5;

    // Get energizing and draining tasks
    const tasksWithEnergy = tasks.filter((t) => t.energy_impact);
    const energizingTasks = tasksWithEnergy
      .filter((t) => t.energy_impact === 'energizing')
      .map((t) => t.title)
      .slice(0, 5);
    const drainingTasks = tasksWithEnergy
      .filter((t) => t.energy_impact === 'draining')
      .map((t) => t.title)
      .slice(0, 5);

    // Determine best time of day from energy logs
    const timeOfDayCounts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.time_of_day && log.energy_level >= 7) {
        timeOfDayCounts[log.time_of_day] = (timeOfDayCounts[log.time_of_day] || 0) + 1;
      }
    });

    const bestTime =
      Object.keys(timeOfDayCounts).length > 0
        ? Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'morning';

    energyData = {
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      energizingTasks: energizingTasks.length > 0 ? energizingTasks : ['None recorded'],
      drainingTasks: drainingTasks.length > 0 ? drainingTasks : ['None recorded'],
      bestTime,
    };
  }

  // 6. Patterns detected
  let patternsDetected = undefined;
  if (weekReflections.length > 0) {
    // Most productive days (by completion rate)
    const productiveDays = weekReflections
      .filter((r) => (r.completion_rate || 0) > 0.7)
      .map((r) => format(new Date(r.date), 'EEEE'))
      .slice(0, 3);

    // Common blockers
    const blockers = weekReflections
      .map((r) => r.what_blocked_me)
      .filter((b) => b && b.trim() !== '');

    // Procrastination patterns
    const procrastinatedTasks = tasks.filter((t) => t.times_postponed >= 3);
    const procrastinationData =
      procrastinatedTasks.length > 0
        ? `${procrastinatedTasks.length} tasks postponed 3+ times`
        : undefined;

    patternsDetected = {
      productiveDays: productiveDays.length > 0 ? productiveDays : ['Not enough data'],
      commonBlockers: blockers.length > 0 ? blockers : ['No blockers reported'],
      procrastinationData,
    };
  }

  return {
    weekStartDate,
    weekEndDate,
    tasksCompleted: completedTasks.length,
    tasksPlanned: totalTasksPlanned,
    completionRate,
    timeInvestedHours,
    highCompletionDays,
    goalsList,
    goalProgressDetails,
    dailyReflectionsSummary,
    energyData,
    patternsDetected,
  };
}

/**
 * Get all goal IDs for goals needing attention
 * (goals with low progress relative to time spent)
 */
export async function getGoalsNeedingAttention(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string,
  weekEndDate: string
): Promise<Array<{ id: string; title: string; reason: string }>> {
  const { data: activeGoals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  const goals = (activeGoals as any[]) || [];
  const goalsNeedingAttention: Array<{ id: string; title: string; reason: string }> = [];

  for (const goal of goals) {
    // Get tasks for this goal in the week
    const { data: goalTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('goal_id', goal.id)
      .gte('due_date', `${weekStartDate}T00:00:00`)
      .lte('due_date', `${weekEndDate}T23:59:59`);

    const tasks = (goalTasks as any[]) || [];
    const completedCount = tasks.filter((t) => t.status === 'completed').length;

    // Flag goals with:
    // 1. Low completion percentage and approaching target date
    // 2. No tasks completed this week
    if (goal.target_date) {
      const daysUntilTarget = Math.ceil(
        (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (goal.completion_percentage < 50 && daysUntilTarget < 30 && daysUntilTarget > 0) {
        goalsNeedingAttention.push({
          id: goal.id,
          title: goal.title,
          reason: `Only ${goal.completion_percentage}% complete with ${daysUntilTarget} days until target date`,
        });
      }
    }

    if (tasks.length > 0 && completedCount === 0) {
      goalsNeedingAttention.push({
        id: goal.id,
        title: goal.title,
        reason: 'No tasks completed this week',
      });
    }
  }

  return goalsNeedingAttention;
}

/**
 * Get backlog items suggested for scheduling
 * (items aligned with active goals and reasonable effort)
 */
export async function getBacklogSuggestions(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data: backlogItems } = await supabase
    .from('backlog_items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ready')
    .not('archived_at', 'is', null);

  const items = (backlogItems as any[]) || [];

  // Filter items that are:
  // 1. Important or critical priority
  // 2. Small to medium effort
  // 3. Have a related goal
  const suggested = items
    .filter(
      (item) =>
        (item.priority === 'important' || item.priority === 'critical') &&
        (item.ai_effort_estimate === 'small' || item.ai_effort_estimate === 'medium') &&
        item.goal_id
    )
    .map((item) => item.id)
    .slice(0, 5); // Max 5 suggestions

  return suggested;
}
