'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GoalProgressMetrics {
  goalId: string;
  goalTitle: string;
  completionPercentage: number;
  timeInvestedHours: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  velocity: number;
  trend: 'accelerating' | 'steady' | 'slowing' | 'stalled';
  trendIndicator: string;
  projectedCompletionDate: string | null;
  targetDate: string | null;
  daysRemaining: number | null;
  milestonesCompleted: number;
  milestonesTotal: number;
}

interface GoalProgressCardProps {
  goal: GoalProgressMetrics;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'accelerating':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'steady':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'slowing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'stalled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isOnTrack =
    goal.daysRemaining &&
    goal.projectedCompletionDate &&
    goal.targetDate &&
    parseISO(goal.projectedCompletionDate) <= parseISO(goal.targetDate);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">{goal.goalTitle}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{goal.completionPercentage}% complete</span>
              <span>•</span>
              <span className={getTrendColor(goal.trend)}>
                {goal.trendIndicator} {goal.trend}
              </span>
            </div>
          </div>
          {goal.daysRemaining !== null && (
            <Badge
              variant={goal.daysRemaining < 7 ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {goal.daysRemaining > 0
                ? `${goal.daysRemaining} days left`
                : goal.daysRemaining === 0
                  ? 'Due today'
                  : `${Math.abs(goal.daysRemaining)} days overdue`}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(goal.completionPercentage)} transition-all duration-500`}
              style={{ width: `${Math.min(goal.completionPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {/* Velocity */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
              <span>Velocity</span>
            </div>
            <p className="text-lg font-semibold">{goal.velocity} tasks/week</p>
            <p className="text-xs text-gray-500">
              This week: {goal.tasksCompletedThisWeek} • Last: {goal.tasksCompletedLastWeek}
            </p>
          </div>

          {/* Time Invested */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Time Invested</span>
            </div>
            <p className="text-lg font-semibold">{goal.timeInvestedHours}h</p>
            <p className="text-xs text-gray-500">Total time spent</p>
          </div>

          {/* Milestones */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3" />
              <span>Milestones</span>
            </div>
            <p className="text-lg font-semibold">
              {goal.milestonesCompleted}/{goal.milestonesTotal}
            </p>
            <p className="text-xs text-gray-500">
              {goal.milestonesTotal > 0
                ? `${Math.round((goal.milestonesCompleted / goal.milestonesTotal) * 100)}% done`
                : 'No milestones'}
            </p>
          </div>

          {/* Projected Completion */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Projected</span>
            </div>
            {goal.projectedCompletionDate ? (
              <>
                <p className="text-lg font-semibold">
                  {format(parseISO(goal.projectedCompletionDate), 'MMM d')}
                </p>
                {goal.targetDate && (
                  <p className={`text-xs ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnTrack ? 'On track' : 'Behind schedule'}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-400">—</p>
                <p className="text-xs text-gray-500">No data</p>
              </>
            )}
          </div>
        </div>

        {/* Target Date (if exists) */}
        {goal.targetDate && (
          <div className="pt-2 border-t text-sm text-gray-600">
            <span className="font-medium">Target date:</span>{' '}
            {format(parseISO(goal.targetDate), 'MMMM d, yyyy')}
          </div>
        )}
      </div>
    </Card>
  );
}
