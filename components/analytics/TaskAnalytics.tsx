'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Flame,
  Calendar,
  Target,
  AlertCircle,
  BarChart3,
  Zap,
} from 'lucide-react';

interface TaskAnalytics {
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
    estimationAccuracy: number;
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

export function TaskAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);

  useEffect(() => {
    loadTaskAnalytics();
  }, []);

  const loadTaskAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analytics/tasks');

      if (!response.ok) {
        throw new Error('Failed to load task analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error loading task analytics:', err);
      setError(err.message || 'Failed to load task analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading task analytics...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTaskType = (type: string) => {
    const typeMap: Record<string, string> = {
      urgent_important: 'Urgent & Important',
      not_urgent_important: 'Important',
      urgent_not_important: 'Urgent',
      not_urgent_not_important: 'Low Priority',
      uncategorized: 'Uncategorized',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Task Analytics</h2>
      </div>

      <Tabs defaultValue="completion" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Completion Metrics Tab */}
        <TabsContent value="completion" className="space-y-4">
          {/* Streak Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Flame className="h-4 w-4 text-orange-600" />
                    <span>Current Streak</span>
                  </div>
                  <p className="text-4xl font-bold text-orange-600">
                    {analytics.completionMetrics.currentStreak}
                  </p>
                  <p className="text-sm text-gray-600">days in a row</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span>Longest Streak</span>
                  </div>
                  <p className="text-4xl font-bold text-purple-600">
                    {analytics.completionMetrics.longestStreak}
                  </p>
                  <p className="text-sm text-gray-600">days</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Completion Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completion Statistics
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Today */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today</span>
                  <Badge
                    variant="secondary"
                    className={getCompletionRateColor(
                      analytics.completionMetrics.completionRateToday
                    )}
                  >
                    {analytics.completionMetrics.completionRateToday}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{analytics.completionMetrics.today}</p>
                <p className="text-sm text-gray-500">tasks completed</p>
              </div>

              {/* This Week */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <Badge
                    variant="secondary"
                    className={getCompletionRateColor(
                      analytics.completionMetrics.completionRateWeek
                    )}
                  >
                    {analytics.completionMetrics.completionRateWeek}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{analytics.completionMetrics.week}</p>
                <p className="text-sm text-gray-500">tasks completed</p>
              </div>

              {/* This Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <Badge
                    variant="secondary"
                    className={getCompletionRateColor(
                      analytics.completionMetrics.completionRateMonth
                    )}
                  >
                    {analytics.completionMetrics.completionRateMonth}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{analytics.completionMetrics.month}</p>
                <p className="text-sm text-gray-500">tasks completed</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average tasks per day</span>
                <span className="text-xl font-semibold">
                  {analytics.completionMetrics.averageTasksPerDay}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Time Metrics Tab */}
        <TabsContent value="time" className="space-y-4">
          {/* Time Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Today</span>
                </div>
                <p className="text-3xl font-bold">{analytics.timeMetrics.totalTimeToday}h</p>
                <p className="text-sm text-gray-500">time invested</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>This Week</span>
                </div>
                <p className="text-3xl font-bold">{analytics.timeMetrics.totalTimeWeek}h</p>
                <p className="text-sm text-gray-500">time invested</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>This Month</span>
                </div>
                <p className="text-3xl font-bold">{analytics.timeMetrics.totalTimeMonth}h</p>
                <p className="text-sm text-gray-500">time invested</p>
              </div>
            </Card>
          </div>

          {/* Time by Goal */}
          {analytics.timeMetrics.byGoal.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Time by Goal (This Month)
              </h3>
              <div className="space-y-3">
                {analytics.timeMetrics.byGoal.map((goal) => (
                  <div key={goal.goalId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{goal.goalTitle}</span>
                    <Badge variant="secondary">{goal.hours}h</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Time by Type & Estimation Accuracy */}
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.timeMetrics.byType.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Time by Task Type</h3>
                <div className="space-y-3">
                  {analytics.timeMetrics.byType.map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{formatTaskType(type.type)}</span>
                      <Badge variant="secondary">{type.hours}h</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Estimation Accuracy</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accuracy Rate</span>
                    <span className="text-2xl font-bold">
                      {analytics.timeMetrics.estimationAccuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(analytics.timeMetrics.estimationAccuracy, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {analytics.timeMetrics.estimationAccuracy >= 80
                    ? 'Excellent! Your time estimates are very accurate.'
                    : analytics.timeMetrics.estimationAccuracy >= 60
                      ? 'Good! Your estimates are reasonably accurate.'
                      : 'Keep tracking to improve your time estimation skills.'}
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Pattern Recognition Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {/* Productivity Patterns */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Most Productive Days
              </h3>
              <div className="space-y-2">
                {analytics.patternRecognition.mostProductiveDays.map((day, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Most Productive Times
              </h3>
              <div className="space-y-2">
                {analytics.patternRecognition.mostProductiveTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium capitalize">{time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Task Speed */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Completed Fastest
              </h3>
              <div className="space-y-2">
                {analytics.patternRecognition.taskTypesCompletedFastest.map((type, index) => (
                  <div key={index} className="text-sm font-medium">
                    {index + 1}. {formatTaskType(type)}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Take Longest
              </h3>
              <div className="space-y-2">
                {analytics.patternRecognition.taskTypesCompletedSlowest.map((type, index) => (
                  <div key={index} className="text-sm font-medium">
                    {index + 1}. {formatTaskType(type)}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Procrastination & Energy */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Procrastination Patterns
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {analytics.patternRecognition.procrastinationPatterns.totalPostponed}
                    </p>
                    <p className="text-sm text-gray-500">tasks postponed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {analytics.patternRecognition.procrastinationPatterns.averagePostponements}
                    </p>
                    <p className="text-sm text-gray-500">avg postponements</p>
                  </div>
                </div>
                {analytics.patternRecognition.procrastinationPatterns.commonReasons.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Common blockers:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analytics.patternRecognition.procrastinationPatterns.commonReasons
                        .slice(0, 3)
                        .map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Energy Correlation
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.patternRecognition.energyCorrelation.highEnergyCompletionRate}%
                    </p>
                    <p className="text-sm text-gray-500">high energy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.patternRecognition.energyCorrelation.lowEnergyCompletionRate}%
                    </p>
                    <p className="text-sm text-gray-500">low energy</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {analytics.patternRecognition.energyCorrelation.optimalEnergyRange}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
