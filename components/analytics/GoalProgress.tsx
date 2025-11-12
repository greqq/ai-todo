'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { GoalProgressCard } from './GoalProgressCard';
import { Loader2, Target, AlertCircle } from 'lucide-react';

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

export function GoalProgress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [goals, setGoals] = useState<GoalProgressMetrics[]>([]);

  useEffect(() => {
    loadGoalProgress();
  }, []);

  const loadGoalProgress = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analytics/goals');

      if (!response.ok) {
        throw new Error('Failed to load goal progress');
      }

      const data = await response.json();
      setGoals(data);
    } catch (err: any) {
      console.error('Error loading goal progress:', err);
      setError(err.message || 'Failed to load goal progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading goal progress...</p>
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

  if (goals.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-3">
          <Target className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-700">No Active Goals</h3>
          <p className="text-gray-500">
            Create your first goal to start tracking your progress!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-600" />
          Goal Progress Tracking
        </h2>
        <p className="text-sm text-gray-500">{goals.length} active goals</p>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <GoalProgressCard key={goal.goalId} goal={goal} />
        ))}
      </div>
    </div>
  );
}
