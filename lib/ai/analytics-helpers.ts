/**
 * Analytics Helper Functions
 * Calculate progress tracking metrics, task analytics, and productivity patterns
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  format,
  differenceInDays,
  parseISO,
} from 'date-fns';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GoalProgressMetrics {
  goalId: string;
  goalTitle: string;
  completionPercentage: number;
  timeInvestedHours: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  velocity: number; // tasks per week
  trend: 'accelerating' | 'steady' | 'slowing' | 'stalled';
  trendIndicator: string; // visual arrow
  projectedCompletionDate: string | null;
  targetDate: string | null;
  daysRemaining: number | null;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export interface TaskAnalytics {
  completionMetrics: {
    today: number;
    week: number;
    month: number;
    completionRateToday: number;
    completionRateWeek: number;
    completionRateMonth: number;
    averageTasksPerDay: number;
    longestStreak: number;
    currentStreak: number;
  };
  timeMetrics: {
    totalTimeToday: number;
    totalTimeWeek: number;
    totalTimeMonth: number;
    byGoal: Array<{ goalId: string; goalTitle: string; hours: number }>;
    byType: Array<{ type: string; hours: number }>;
    estimationAccuracy: number; // percentage
  };
  patternRecognition: {
    mostProductiveDays: string[];
    mostProductiveTimes: string[];
    taskTypesCompletedFastest: string[];
    taskTypesCompletedSlowest: string[];
    procrastinationPatterns: {
      totalPostponed: number;
      averagePostponements: number;
      commonReasons: string[];
    };
    energyCorrelation: {
      highEnergyCompletionRate: number;
      lowEnergyCompletionRate: number;
      optimalEnergyRange: string;
    };
  };
}

// ============================================================================
// GOAL PROGRESS CALCULATIONS
// ============================================================================

export async function calculateGoalProgressMetrics(
  supabase: SupabaseClient,
  userId: string,
  goalId: string
): Promise<GoalProgressMetrics> {
  // Get goal details
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();

  if (!goal) {
    throw new Error('Goal not found');
  }

  // Get date ranges
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subWeeks(thisWeekEnd, 1);

  // Get all tasks for this goal
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId);

  const tasks = (allTasks as any[]) || [];
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Calculate time invested
  const totalTimeMinutes = completedTasks.reduce(
    (sum, task) => sum + (task.actual_duration_minutes || 0),
    0
  );
  const timeInvestedHours = Math.round((totalTimeMinutes / 60) * 10) / 10;

  // Calculate velocity (tasks per week)
  const tasksCompletedThisWeek = completedTasks.filter(
    (t) =>
      t.completed_at &&
      parseISO(t.completed_at) >= thisWeekStart &&
      parseISO(t.completed_at) <= thisWeekEnd
  ).length;

  const tasksCompletedLastWeek = completedTasks.filter(
    (t) =>
      t.completed_at &&
      parseISO(t.completed_at) >= lastWeekStart &&
      parseISO(t.completed_at) <= lastWeekEnd
  ).length;

  const velocity = Math.round(((tasksCompletedThisWeek + tasksCompletedLastWeek) / 2) * 10) / 10;

  // Determine trend
  let trend: 'accelerating' | 'steady' | 'slowing' | 'stalled' = 'steady';
  let trendIndicator = '→';

  if (tasksCompletedThisWeek === 0 && tasksCompletedLastWeek === 0) {
    trend = 'stalled';
    trendIndicator = '↓';
  } else if (tasksCompletedThisWeek > tasksCompletedLastWeek * 1.2) {
    trend = 'accelerating';
    trendIndicator = '↑';
  } else if (tasksCompletedThisWeek < tasksCompletedLastWeek * 0.8) {
    trend = 'slowing';
    trendIndicator = '↘';
  } else if (tasksCompletedThisWeek > tasksCompletedLastWeek) {
    trend = 'accelerating';
    trendIndicator = '↗';
  }

  // Calculate projected completion date
  let projectedCompletionDate: string | null = null;
  const remainingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .length;

  if (velocity > 0 && remainingTasks > 0) {
    const weeksToCompletion = Math.ceil(remainingTasks / velocity);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + weeksToCompletion * 7);
    projectedCompletionDate = format(projectedDate, 'yyyy-MM-dd');
  }

  // Calculate days remaining to target
  let daysRemaining: number | null = null;
  if (goal.target_date) {
    daysRemaining = differenceInDays(parseISO(goal.target_date), now);
  }

  // Get milestones
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', goalId);

  const milestonesData = (milestones as any[]) || [];
  const milestonesCompleted = milestonesData.filter((m) => m.status === 'completed').length;
  const milestonesTotal = milestonesData.length;

  return {
    goalId: goal.id,
    goalTitle: goal.title,
    completionPercentage: goal.completion_percentage || 0,
    timeInvestedHours,
    tasksCompletedThisWeek,
    tasksCompletedLastWeek,
    velocity,
    trend,
    trendIndicator,
    projectedCompletionDate,
    targetDate: goal.target_date,
    daysRemaining,
    milestonesCompleted,
    milestonesTotal,
  };
}

export async function getAllGoalsProgressMetrics(
  supabase: SupabaseClient,
  userId: string
): Promise<GoalProgressMetrics[]> {
  // Get all active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!goals || goals.length === 0) {
    return [];
  }

  const progressMetrics = await Promise.all(
    goals.map((goal) => calculateGoalProgressMetrics(supabase, userId, goal.id))
  );

  return progressMetrics;
}

// ============================================================================
// TASK ANALYTICS CALCULATIONS
// ============================================================================

export async function calculateTaskAnalytics(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskAnalytics> {
  const now = new Date();

  // Date ranges
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get all tasks for analysis
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  const tasks = (allTasks as any[]) || [];

  // ========== COMPLETION METRICS ==========
  const completedToday = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      parseISO(t.completed_at) >= todayStart &&
      parseISO(t.completed_at) <= todayEnd
  );

  const completedWeek = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      parseISO(t.completed_at) >= weekStart &&
      parseISO(t.completed_at) <= weekEnd
  );

  const completedMonth = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      parseISO(t.completed_at) >= monthStart &&
      parseISO(t.completed_at) <= monthEnd
  );

  const plannedToday = tasks.filter(
    (t) =>
      t.due_date &&
      parseISO(t.due_date) >= todayStart &&
      parseISO(t.due_date) <= todayEnd &&
      t.status !== 'cancelled'
  );

  const plannedWeek = tasks.filter(
    (t) =>
      t.due_date &&
      parseISO(t.due_date) >= weekStart &&
      parseISO(t.due_date) <= weekEnd &&
      t.status !== 'cancelled'
  );

  const plannedMonth = tasks.filter(
    (t) =>
      t.due_date &&
      parseISO(t.due_date) >= monthStart &&
      parseISO(t.due_date) <= monthEnd &&
      t.status !== 'cancelled'
  );

  const completionRateToday =
    plannedToday.length > 0 ? Math.round((completedToday.length / plannedToday.length) * 100) : 0;
  const completionRateWeek =
    plannedWeek.length > 0 ? Math.round((completedWeek.length / plannedWeek.length) * 100) : 0;
  const completionRateMonth =
    plannedMonth.length > 0 ? Math.round((completedMonth.length / plannedMonth.length) * 100) : 0;

  // Calculate average tasks per day (last 30 days)
  const thirtyDaysAgo = subMonths(now, 1);
  const recentCompletedTasks = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      parseISO(t.completed_at) >= thirtyDaysAgo
  );
  const averageTasksPerDay = Math.round((recentCompletedTasks.length / 30) * 10) / 10;

  // Calculate streaks
  const { longestStreak, currentStreak } = calculateCompletionStreaks(tasks);

  const completionMetrics = {
    today: completedToday.length,
    week: completedWeek.length,
    month: completedMonth.length,
    completionRateToday,
    completionRateWeek,
    completionRateMonth,
    averageTasksPerDay,
    longestStreak,
    currentStreak,
  };

  // ========== TIME METRICS ==========
  const totalTimeToday = completedToday.reduce(
    (sum, t) => sum + (t.actual_duration_minutes || 0),
    0
  );
  const totalTimeWeek = completedWeek.reduce(
    (sum, t) => sum + (t.actual_duration_minutes || 0),
    0
  );
  const totalTimeMonth = completedMonth.reduce(
    (sum, t) => sum + (t.actual_duration_minutes || 0),
    0
  );

  // Time by goal
  const timeByGoalMap: Record<string, { title: string; minutes: number }> = {};
  for (const task of completedMonth) {
    if (task.goal_id && task.actual_duration_minutes) {
      if (!timeByGoalMap[task.goal_id]) {
        // Fetch goal title
        const { data: goal } = await supabase
          .from('goals')
          .select('title')
          .eq('id', task.goal_id)
          .single();
        timeByGoalMap[task.goal_id] = {
          title: goal?.title || 'Unknown Goal',
          minutes: 0,
        };
      }
      timeByGoalMap[task.goal_id].minutes += task.actual_duration_minutes;
    }
  }

  const byGoal = Object.entries(timeByGoalMap)
    .map(([goalId, data]) => ({
      goalId,
      goalTitle: data.title,
      hours: Math.round((data.minutes / 60) * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  // Time by type (priority/eisenhower quadrant)
  const timeByTypeMap: Record<string, number> = {};
  for (const task of completedMonth) {
    if (task.actual_duration_minutes) {
      const type = task.eisenhower_quadrant || 'uncategorized';
      timeByTypeMap[type] = (timeByTypeMap[type] || 0) + task.actual_duration_minutes;
    }
  }

  const byType = Object.entries(timeByTypeMap)
    .map(([type, minutes]) => ({
      type,
      hours: Math.round((minutes / 60) * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours);

  // Estimation accuracy
  const tasksWithEstimates = completedMonth.filter(
    (t) => t.estimated_duration_minutes && t.actual_duration_minutes
  );
  let estimationAccuracy = 0;
  if (tasksWithEstimates.length > 0) {
    const accuracySum = tasksWithEstimates.reduce((sum, t) => {
      const estimated = t.estimated_duration_minutes;
      const actual = t.actual_duration_minutes;
      const accuracy = Math.min(estimated, actual) / Math.max(estimated, actual);
      return sum + accuracy;
    }, 0);
    estimationAccuracy = Math.round((accuracySum / tasksWithEstimates.length) * 100);
  }

  const timeMetrics = {
    totalTimeToday: Math.round((totalTimeToday / 60) * 10) / 10,
    totalTimeWeek: Math.round((totalTimeWeek / 60) * 10) / 10,
    totalTimeMonth: Math.round((totalTimeMonth / 60) * 10) / 10,
    byGoal,
    byType,
    estimationAccuracy,
  };

  // ========== PATTERN RECOGNITION ==========
  const patternRecognition = await calculatePatternRecognition(supabase, userId, tasks);

  return {
    completionMetrics,
    timeMetrics,
    patternRecognition,
  };
}

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

async function calculatePatternRecognition(
  supabase: SupabaseClient,
  userId: string,
  tasks: any[]
): Promise<TaskAnalytics['patternRecognition']> {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const completedTasks = tasks.filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      parseISO(t.completed_at) >= monthStart
  );

  // Most productive days of week
  const dayOfWeekCounts: Record<string, { completed: number; total: number }> = {};
  completedTasks.forEach((task) => {
    const day = format(parseISO(task.completed_at), 'EEEE');
    if (!dayOfWeekCounts[day]) {
      dayOfWeekCounts[day] = { completed: 0, total: 0 };
    }
    dayOfWeekCounts[day].completed += 1;
  });

  const mostProductiveDays = Object.entries(dayOfWeekCounts)
    .sort((a, b) => b[1].completed - a[1].completed)
    .slice(0, 3)
    .map(([day]) => day);

  // Most productive times (from energy logs and task completions)
  const { data: energyLogs } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', monthStart.toISOString())
    .gte('energy_level', 7);

  const logs = (energyLogs as any[]) || [];
  const timeOfDayCounts: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.time_of_day) {
      timeOfDayCounts[log.time_of_day] = (timeOfDayCounts[log.time_of_day] || 0) + 1;
    }
  });

  const mostProductiveTimes = Object.entries(timeOfDayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time]) => time);

  // Task types completed fastest/slowest
  const tasksWithDuration = completedTasks.filter((t) => t.actual_duration_minutes);
  const typeSpeedMap: Record<string, { total: number; count: number }> = {};

  tasksWithDuration.forEach((task) => {
    const type = task.eisenhower_quadrant || 'uncategorized';
    if (!typeSpeedMap[type]) {
      typeSpeedMap[type] = { total: 0, count: 0 };
    }
    typeSpeedMap[type].total += task.actual_duration_minutes;
    typeSpeedMap[type].count += 1;
  });

  const typeSpeeds = Object.entries(typeSpeedMap).map(([type, data]) => ({
    type,
    avgDuration: data.total / data.count,
  }));

  const taskTypesCompletedFastest = typeSpeeds
    .sort((a, b) => a.avgDuration - b.avgDuration)
    .slice(0, 3)
    .map((t) => t.type);

  const taskTypesCompletedSlowest = typeSpeeds
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 3)
    .map((t) => t.type);

  // Procrastination patterns
  const postponedTasks = tasks.filter((t) => t.times_postponed > 0);
  const totalPostponed = postponedTasks.length;
  const averagePostponements =
    totalPostponed > 0
      ? Math.round(
          (postponedTasks.reduce((sum, t) => sum + t.times_postponed, 0) / totalPostponed) * 10
        ) / 10
      : 0;

  // Get common postponement reasons from daily reflections
  const { data: reflections } = await supabase
    .from('daily_reflections')
    .select('what_blocked_me')
    .eq('user_id', userId)
    .gte('date', format(monthStart, 'yyyy-MM-dd'))
    .not('what_blocked_me', 'is', null);

  const blockers = (reflections as any[]) || [];
  const commonReasons = blockers
    .map((r) => r.what_blocked_me)
    .filter((b) => b && b.trim() !== '')
    .slice(0, 5);

  // Energy correlation with productivity
  const tasksWithEnergyImpact = completedTasks.filter((t) => t.energy_impact);
  const highEnergyTasks = tasksWithEnergyImpact.filter((t) => t.energy_impact === 'energizing');
  const lowEnergyTasks = tasksWithEnergyImpact.filter((t) => t.energy_impact === 'draining');

  const highEnergyCompletionRate =
    tasksWithEnergyImpact.length > 0
      ? Math.round((highEnergyTasks.length / tasksWithEnergyImpact.length) * 100)
      : 0;
  const lowEnergyCompletionRate =
    tasksWithEnergyImpact.length > 0
      ? Math.round((lowEnergyTasks.length / tasksWithEnergyImpact.length) * 100)
      : 0;

  return {
    mostProductiveDays: mostProductiveDays.length > 0 ? mostProductiveDays : ['Not enough data'],
    mostProductiveTimes:
      mostProductiveTimes.length > 0 ? mostProductiveTimes : ['Not enough data'],
    taskTypesCompletedFastest:
      taskTypesCompletedFastest.length > 0 ? taskTypesCompletedFastest : ['Not enough data'],
    taskTypesCompletedSlowest:
      taskTypesCompletedSlowest.length > 0 ? taskTypesCompletedSlowest : ['Not enough data'],
    procrastinationPatterns: {
      totalPostponed,
      averagePostponements,
      commonReasons: commonReasons.length > 0 ? commonReasons : ['None reported'],
    },
    energyCorrelation: {
      highEnergyCompletionRate,
      lowEnergyCompletionRate,
      optimalEnergyRange:
        highEnergyCompletionRate > lowEnergyCompletionRate
          ? 'High energy tasks complete more frequently'
          : 'Energy impact varies',
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateCompletionStreaks(tasks: any[]): {
  longestStreak: number;
  currentStreak: number;
} {
  // Get all completed tasks sorted by date
  const completed = tasks
    .filter((t) => t.status === 'completed' && t.completed_at)
    .sort((a, b) => parseISO(a.completed_at).getTime() - parseISO(b.completed_at).getTime());

  if (completed.length === 0) {
    return { longestStreak: 0, currentStreak: 0 };
  }

  // Group by date and count days with >80% completion
  const dateCompletionMap: Record<string, number> = {};
  completed.forEach((task) => {
    const date = format(parseISO(task.completed_at), 'yyyy-MM-dd');
    dateCompletionMap[date] = (dateCompletionMap[date] || 0) + 1;
  });

  // Calculate streaks (days with at least 1 task completed)
  const dates = Object.keys(dateCompletionMap).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streakCount = 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  let lastDate: Date | null = null;

  for (const dateStr of dates) {
    const date = parseISO(dateStr);

    if (lastDate) {
      const dayDiff = differenceInDays(date, lastDate);
      if (dayDiff === 1) {
        streakCount++;
      } else {
        longestStreak = Math.max(longestStreak, streakCount);
        streakCount = 1;
      }
    } else {
      streakCount = 1;
    }

    lastDate = date;
  }

  longestStreak = Math.max(longestStreak, streakCount);

  // Calculate current streak
  if (dates.length > 0) {
    const lastCompletionDate = dates[dates.length - 1];
    const daysSinceLastCompletion = differenceInDays(parseISO(today), parseISO(lastCompletionDate));

    if (daysSinceLastCompletion === 0) {
      currentStreak = streakCount;
    } else if (daysSinceLastCompletion === 1) {
      // Yesterday was the last completion, streak might continue
      currentStreak = streakCount;
    } else {
      currentStreak = 0;
    }
  }

  return { longestStreak, currentStreak };
}
