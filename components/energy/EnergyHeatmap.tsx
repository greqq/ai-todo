'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnergyLog {
  id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
}

interface EnergyHeatmapProps {
  logs: EnergyLog[];
  days?: number;
}

export function EnergyHeatmap({ logs, days = 7 }: EnergyHeatmapProps) {
  // Group logs by date
  const groupByDate = () => {
    const dateMap = new Map<string, number[]>();

    logs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(log.energy_level);
    });

    return dateMap;
  };

  const dateMap = groupByDate();

  // Generate last N days
  const generateDays = () => {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();

      const energyLevels = dateMap.get(dateStr) || [];
      const avgEnergy =
        energyLevels.length > 0
          ? energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length
          : null;

      result.push({
        date: dateStr,
        dayName,
        dayNum,
        avgEnergy,
        count: energyLevels.length,
      });
    }

    return result;
  };

  const daysData = generateDays();

  const getEnergyColor = (energy: number | null) => {
    if (energy === null) return 'bg-gray-200 dark:bg-gray-800';
    if (energy >= 8) return 'bg-green-500';
    if (energy >= 6) return 'bg-blue-500';
    if (energy >= 4) return 'bg-yellow-500';
    if (energy >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEnergyLabel = (energy: number | null) => {
    if (energy === null) return 'No data';
    if (energy >= 8) return 'High';
    if (energy >= 6) return 'Good';
    if (energy >= 4) return 'Moderate';
    if (energy >= 2) return 'Low';
    return 'Very Low';
  };

  // Calculate trend
  const calculateTrend = () => {
    if (daysData.length < 2) return null;

    const firstHalf = daysData
      .slice(0, Math.floor(daysData.length / 2))
      .filter((d) => d.avgEnergy !== null);
    const secondHalf = daysData
      .slice(Math.floor(daysData.length / 2))
      .filter((d) => d.avgEnergy !== null);

    if (firstHalf.length === 0 || secondHalf.length === 0) return null;

    const firstAvg =
      firstHalf.reduce((sum, d) => sum + (d.avgEnergy || 0), 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + (d.avgEnergy || 0), 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const trend = calculateTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Energy Calendar
            </CardTitle>
            <CardDescription>Your energy levels over the last {days} days</CardDescription>
          </div>
          {trend && (
            <Badge
              variant="outline"
              className={
                trend === 'improving'
                  ? 'text-green-600 border-green-600 bg-green-50 dark:bg-green-950'
                  : trend === 'declining'
                  ? 'text-red-600 border-red-600 bg-red-50 dark:bg-red-950'
                  : 'text-gray-600 border-gray-600 bg-gray-50 dark:bg-gray-950'
              }
            >
              {trend === 'improving' && (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Improving
                </>
              )}
              {trend === 'declining' && (
                <>
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Declining
                </>
              )}
              {trend === 'stable' && (
                <>
                  <Minus className="h-3 w-3 mr-1" />
                  Stable
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysData.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">{day.dayName}</span>
                <div
                  className={`w-full aspect-square rounded-md ${getEnergyColor(day.avgEnergy)} ${
                    day.avgEnergy === null ? '' : 'cursor-pointer hover:opacity-80'
                  } transition-opacity flex items-center justify-center`}
                  title={
                    day.avgEnergy !== null
                      ? `${day.dayName}, ${day.dayNum}: ${day.avgEnergy.toFixed(1)}/10 (${day.count} logs)`
                      : `${day.dayName}, ${day.dayNum}: No data`
                  }
                >
                  <span className="text-xs font-bold text-white">
                    {day.avgEnergy !== null ? day.avgEnergy.toFixed(1) : '--'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{day.dayNum}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">Energy Level:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs">1-2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-xs">3-4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs">5-6</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs">7-8</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs">9-10</span>
            </div>
          </div>

          {/* Stats Summary */}
          {logs.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">
                  {(logs.reduce((sum, log) => sum + log.energy_level, 0) / logs.length).toFixed(
                    1
                  )}
                  /10
                </p>
                <p className="text-xs text-muted-foreground mt-1">Average Energy</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Logs</p>
              </div>
            </div>
          )}

          {logs.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              <p>No energy logs yet. Start logging your energy to see patterns!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
