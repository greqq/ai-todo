'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutineStats {
  currentStreak: number;
  longestStreak: number;
  completionRateWeek: number;
  completionRateMonth: number;
  totalCompleted: number;
  completedToday: number;
  totalToday: number;
}

interface RoutineTrackerProps {
  routineType: 'morning' | 'evening';
  stats: RoutineStats;
}

export function RoutineTracker({ routineType, stats }: RoutineTrackerProps) {
  const config = {
    morning: {
      title: 'Morning Routine Progress',
      icon: '🌅',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    evening: {
      title: 'Evening Routine Progress',
      icon: '🌙',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  };

  const typeConfig = config[routineType];
  const todayProgress = stats.totalToday > 0
    ? Math.round((stats.completedToday / stats.totalToday) * 100)
    : 0;

  return (
    <Card className={cn('border-2', typeConfig.borderColor)}>
      <CardHeader className={cn('pb-4', typeConfig.bgColor)}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{typeConfig.icon}</span>
          {typeConfig.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Today's Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className={cn('h-4 w-4', typeConfig.color)} />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {stats.completedToday}/{stats.totalToday} completed
              </span>
              <Badge variant={todayProgress === 100 ? 'default' : 'outline'}>
                {todayProgress}%
              </Badge>
            </div>
          </div>
          <Progress
            value={todayProgress}
            className={cn('h-3', todayProgress === 100 && 'bg-green-200')}
          />
          {todayProgress === 100 && (
            <p className="text-xs text-green-600">
              🎉 All {routineType} tasks completed today!
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Streak */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Best Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stats.longestStreak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Week Completion */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stats.completionRateWeek}</span>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>

          {/* Month Completion */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">This Month</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stats.completionRateMonth}</span>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total {routineType} tasks completed
            </span>
            <span className="text-lg font-semibold">{stats.totalCompleted}</span>
          </div>
        </div>

        {/* Motivational Message */}
        {stats.currentStreak > 0 && (
          <div className={cn('rounded-lg border-l-4 p-3', typeConfig.bgColor, typeConfig.borderColor)}>
            <p className={cn('text-sm font-medium', typeConfig.color)}>
              {stats.currentStreak >= 7
                ? `🔥 ${stats.currentStreak} day streak! You're on fire!`
                : stats.currentStreak >= 3
                ? `💪 ${stats.currentStreak} days strong! Keep it up!`
                : `✨ Great start! ${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''} in a row!`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
