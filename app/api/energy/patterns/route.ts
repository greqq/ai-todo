import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
  context: string | null;
  task_id: string | null;
  task_was_energizing: boolean | null;
}

interface TimeOfDayStats {
  time_of_day: string;
  average_energy: number;
  count: number;
}

interface EnergyPattern {
  peak_energy_times: string[];
  low_energy_times: string[];
  average_energy_by_time: TimeOfDayStats[];
  overall_average: number;
  most_energizing_tasks: Array<{ task_id: string; task_title: string; avg_energy: number }>;
  most_draining_tasks: Array<{ task_id: string; task_title: string; avg_energy: number }>;
  energy_trend: 'improving' | 'declining' | 'stable';
  insights: string[];
}

// GET /api/energy/patterns - Analyze energy patterns
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch energy logs for the period
    const { data: energyLogs, error: logsError } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', (user as any).id)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (logsError) {
      console.error('Error fetching energy logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch energy logs' }, { status: 500 });
    }

    const logs = (energyLogs || []) as EnergyLog[];

    if (logs.length === 0) {
      return NextResponse.json({
        peak_energy_times: [],
        low_energy_times: [],
        average_energy_by_time: [],
        overall_average: 0,
        most_energizing_tasks: [],
        most_draining_tasks: [],
        energy_trend: 'stable',
        insights: ['No energy logs found. Start logging your energy to see patterns!'],
      } as EnergyPattern);
    }

    // Calculate average energy by time of day
    const timeOfDayMap = new Map<string, { total: number; count: number }>();
    const taskEnergyMap = new Map<string, { total: number; count: number; title?: string }>();
    let totalEnergy = 0;

    logs.forEach((log) => {
      totalEnergy += log.energy_level;

      // Time of day stats
      const timeStats = timeOfDayMap.get(log.time_of_day) || { total: 0, count: 0 };
      timeStats.total += log.energy_level;
      timeStats.count += 1;
      timeOfDayMap.set(log.time_of_day, timeStats);

      // Task energy stats
      if (log.task_id && log.task_was_energizing !== null) {
        const taskStats = taskEnergyMap.get(log.task_id) || { total: 0, count: 0 };
        taskStats.total += log.task_was_energizing ? log.energy_level : -log.energy_level;
        taskStats.count += 1;
        taskEnergyMap.set(log.task_id, taskStats);
      }
    });

    const overallAverage = totalEnergy / logs.length;

    // Calculate average energy by time of day
    const averageEnergyByTime: TimeOfDayStats[] = Array.from(timeOfDayMap.entries())
      .map(([time_of_day, stats]) => ({
        time_of_day,
        average_energy: stats.total / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.average_energy - a.average_energy);

    // Identify peak and low energy times
    const peakEnergyTimes = averageEnergyByTime
      .filter((t) => t.average_energy >= overallAverage)
      .slice(0, 3)
      .map((t) => t.time_of_day);

    const lowEnergyTimes = averageEnergyByTime
      .filter((t) => t.average_energy < overallAverage)
      .slice(-3)
      .map((t) => t.time_of_day);

    // Fetch task details for energizing/draining tasks
    const taskIds = Array.from(taskEnergyMap.keys());
    let taskDetails: Array<{ id: string; title: string }> = [];

    if (taskIds.length > 0) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title')
        .in('id', taskIds);

      taskDetails = (tasks || []) as Array<{ id: string; title: string }>;
    }

    // Calculate most energizing and draining tasks
    const taskEnergyList = Array.from(taskEnergyMap.entries())
      .map(([task_id, stats]) => {
        const task = taskDetails.find((t) => t.id === task_id);
        return {
          task_id,
          task_title: task?.title || 'Unknown Task',
          avg_energy: stats.total / stats.count,
        };
      })
      .filter((t) => t.task_title !== 'Unknown Task');

    const mostEnergizingTasks = taskEnergyList
      .filter((t) => t.avg_energy > 0)
      .sort((a, b) => b.avg_energy - a.avg_energy)
      .slice(0, 5);

    const mostDrainingTasks = taskEnergyList
      .filter((t) => t.avg_energy < 0)
      .sort((a, b) => a.avg_energy - b.avg_energy)
      .slice(0, 5);

    // Determine energy trend
    let energyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (logs.length >= 7) {
      const recentLogs = logs.slice(-7);
      const olderLogs = logs.slice(0, Math.min(7, logs.length - 7));

      if (olderLogs.length > 0) {
        const recentAvg =
          recentLogs.reduce((sum, log) => sum + log.energy_level, 0) / recentLogs.length;
        const olderAvg =
          olderLogs.reduce((sum, log) => sum + log.energy_level, 0) / olderLogs.length;

        if (recentAvg > olderAvg + 0.5) energyTrend = 'improving';
        else if (recentAvg < olderAvg - 0.5) energyTrend = 'declining';
      }
    }

    // Generate insights
    const insights: string[] = [];

    if (peakEnergyTimes.length > 0) {
      insights.push(
        `Your peak energy times are: ${peakEnergyTimes.map((t) => t.replace('_', ' ')).join(', ')}`
      );
    }

    if (lowEnergyTimes.length > 0) {
      insights.push(
        `Your low energy times are: ${lowEnergyTimes.map((t) => t.replace('_', ' ')).join(', ')}`
      );
    }

    if (energyTrend === 'improving') {
      insights.push('Your energy levels are improving! Keep up the good work.');
    } else if (energyTrend === 'declining') {
      insights.push(
        'Your energy levels have been declining. Consider reviewing your tasks and schedule.'
      );
    }

    if (mostEnergizingTasks.length > 0) {
      insights.push(
        `Tasks that energize you: ${mostEnergizingTasks.map((t) => t.task_title).slice(0, 3).join(', ')}`
      );
    }

    if (mostDrainingTasks.length > 0) {
      insights.push(
        `Tasks that drain you: ${mostDrainingTasks.map((t) => t.task_title).slice(0, 3).join(', ')}`
      );
    }

    const pattern: EnergyPattern = {
      peak_energy_times: peakEnergyTimes,
      low_energy_times: lowEnergyTimes,
      average_energy_by_time: averageEnergyByTime,
      overall_average: parseFloat(overallAverage.toFixed(2)),
      most_energizing_tasks: mostEnergizingTasks,
      most_draining_tasks: mostDrainingTasks,
      energy_trend: energyTrend,
      insights,
    };

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
