import { createAdminClient } from '@/lib/supabase/admin';

export interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
  context: string | null;
  task_id: string | null;
  task_was_energizing: boolean | null;
}

export interface EnergyCurve {
  hour: number;
  average_energy: number;
  sample_count: number;
}

export interface TimeOfDayEnergy {
  early_morning: number;
  morning: number;
  midday: number;
  afternoon: number;
  evening: number;
  night: number;
}

/**
 * Get time of day from timestamp
 */
export function getTimeOfDay(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const hour = date.getHours();

  if (hour >= 4 && hour < 7) return 'early_morning';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Calculate energy curve by hour of day
 */
export function calculateEnergyCurve(logs: EnergyLog[]): EnergyCurve[] {
  const hourlyData = new Map<number, { total: number; count: number }>();

  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours();
    const data = hourlyData.get(hour) || { total: 0, count: 0 };
    data.total += log.energy_level;
    data.count += 1;
    hourlyData.set(hour, data);
  });

  const curve: EnergyCurve[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData.get(hour);
    if (data) {
      curve.push({
        hour,
        average_energy: data.total / data.count,
        sample_count: data.count,
      });
    } else {
      curve.push({
        hour,
        average_energy: 0,
        sample_count: 0,
      });
    }
  }

  return curve;
}

/**
 * Calculate average energy by time of day
 */
export function calculateTimeOfDayEnergy(logs: EnergyLog[]): TimeOfDayEnergy {
  const timeData: Record<string, { total: number; count: number }> = {
    early_morning: { total: 0, count: 0 },
    morning: { total: 0, count: 0 },
    midday: { total: 0, count: 0 },
    afternoon: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
    night: { total: 0, count: 0 },
  };

  logs.forEach((log) => {
    const time = log.time_of_day;
    if (timeData[time]) {
      timeData[time].total += log.energy_level;
      timeData[time].count += 1;
    }
  });

  return {
    early_morning: timeData.early_morning.count > 0 ? timeData.early_morning.total / timeData.early_morning.count : 0,
    morning: timeData.morning.count > 0 ? timeData.morning.total / timeData.morning.count : 0,
    midday: timeData.midday.count > 0 ? timeData.midday.total / timeData.midday.count : 0,
    afternoon: timeData.afternoon.count > 0 ? timeData.afternoon.total / timeData.afternoon.count : 0,
    evening: timeData.evening.count > 0 ? timeData.evening.total / timeData.evening.count : 0,
    night: timeData.night.count > 0 ? timeData.night.total / timeData.night.count : 0,
  };
}

/**
 * Get energy heatmap data (day x hour grid)
 */
export function getEnergyHeatmap(logs: EnergyLog[], days: number = 30): Array<{
  date: string;
  hour: number;
  energy_level: number;
}> {
  const heatmapData: Array<{ date: string; hour: number; energy_level: number }> = [];
  const dataMap = new Map<string, Map<number, { total: number; count: number }>>();

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const hour = date.getHours();

    if (!dataMap.has(dateStr)) {
      dataMap.set(dateStr, new Map());
    }

    const dayMap = dataMap.get(dateStr)!;
    const hourData = dayMap.get(hour) || { total: 0, count: 0 };
    hourData.total += log.energy_level;
    hourData.count += 1;
    dayMap.set(hour, hourData);
  });

  // Convert to array format
  dataMap.forEach((dayMap, date) => {
    dayMap.forEach((data, hour) => {
      heatmapData.push({
        date,
        hour,
        energy_level: data.total / data.count,
      });
    });
  });

  return heatmapData;
}

/**
 * Fetch user's energy logs from database
 */
export async function fetchEnergyLogs(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<EnergyLog[]> {
  const supabase = createAdminClient();

  const { startDate, endDate, limit = 100 } = options;

  let query = supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true });

  if (startDate) {
    query = query.gte('timestamp', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('timestamp', endDate.toISOString());
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching energy logs:', error);
    throw new Error('Failed to fetch energy logs');
  }

  return (data || []) as EnergyLog[];
}

/**
 * Get peak energy time of day
 */
export function getPeakEnergyTime(logs: EnergyLog[]): string | null {
  if (logs.length === 0) return null;

  const timeEnergy = calculateTimeOfDayEnergy(logs);
  let maxEnergy = 0;
  let peakTime = 'morning';

  Object.entries(timeEnergy).forEach(([time, energy]) => {
    if (energy > maxEnergy) {
      maxEnergy = energy;
      peakTime = time;
    }
  });

  return peakTime.replace('_', ' ');
}

/**
 * Calculate energy trend (last 7 days vs previous 7 days)
 */
export function calculateEnergyTrend(logs: EnergyLog[]): {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
} {
  if (logs.length < 7) {
    return { trend: 'stable', change: 0 };
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const recentLogs = sortedLogs.slice(-7);
  const olderLogs = sortedLogs.slice(
    Math.max(0, sortedLogs.length - 14),
    sortedLogs.length - 7
  );

  if (olderLogs.length === 0) {
    return { trend: 'stable', change: 0 };
  }

  const recentAvg =
    recentLogs.reduce((sum, log) => sum + log.energy_level, 0) / recentLogs.length;
  const olderAvg = olderLogs.reduce((sum, log) => sum + log.energy_level, 0) / olderLogs.length;

  const change = recentAvg - olderAvg;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (change > 0.5) trend = 'improving';
  else if (change < -0.5) trend = 'declining';

  return { trend, change: parseFloat(change.toFixed(2)) };
}

/**
 * Get optimal task scheduling time based on energy patterns
 */
export function getOptimalTaskTime(
  energyRequired: 'high' | 'medium' | 'low',
  energyCurve: EnergyCurve[]
): { hour: number; timeOfDay: string } | null {
  if (energyCurve.length === 0) return null;

  // Filter hours with enough sample data
  const validHours = energyCurve.filter((h) => h.sample_count >= 2);

  if (validHours.length === 0) return null;

  // Sort by energy level
  const sortedHours = [...validHours].sort((a, b) => b.average_energy - a.average_energy);

  let selectedHour: EnergyCurve;

  if (energyRequired === 'high') {
    // Pick highest energy hour
    selectedHour = sortedHours[0];
  } else if (energyRequired === 'medium') {
    // Pick middle energy hour
    selectedHour = sortedHours[Math.floor(sortedHours.length / 2)];
  } else {
    // Pick lowest energy hour
    selectedHour = sortedHours[sortedHours.length - 1];
  }

  const date = new Date();
  date.setHours(selectedHour.hour, 0, 0, 0);
  const timeOfDay = getTimeOfDay(date);

  return {
    hour: selectedHour.hour,
    timeOfDay,
  };
}
