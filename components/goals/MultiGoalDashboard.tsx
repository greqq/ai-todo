'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp, Calendar, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: string;
  start_date?: string;
  target_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  goal_category?: 'primary' | 'secondary' | 'lifestyle';
  created_at: string;
}

interface MultiGoalDashboardProps {
  maxDisplay?: number;
  showCreateButton?: boolean;
}

export function MultiGoalDashboard({
  maxDisplay = 10,
  showCreateButton = true
}: MultiGoalDashboardProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(false);
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        // Filter for active goals only and sort by category and priority
        const activeGoals = data
          .filter((g: Goal) => g.status === 'active')
          .sort((a: Goal, b: Goal) => {
            // Primary goals first, then secondary, then lifestyle
            const categoryOrder = { primary: 0, secondary: 1, lifestyle: 2 };
            const aCat = categoryOrder[a.goal_category || 'lifestyle'];
            const bCat = categoryOrder[b.goal_category || 'lifestyle'];

            if (aCat !== bCat) return aCat - bCat;

            // Within same category, sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, maxDisplay);

        setGoals(activeGoals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryConfig = {
    primary: {
      label: 'Primary Goal',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '🎯',
      description: 'Your main focus',
    },
    secondary: {
      label: 'Secondary Goal',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '📊',
      description: 'Supporting objectives',
    },
    lifestyle: {
      label: 'Lifestyle Goal',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '🌱',
      description: 'Habits & wellness',
    },
  };

  const priorityConfig = {
    high: { color: 'text-red-600', label: 'High' },
    medium: { color: 'text-yellow-600', label: 'Medium' },
    low: { color: 'text-green-600', label: 'Low' },
  };

  const getDaysRemaining = (targetDate?: string): number | null => {
    if (!targetDate) return null;
    const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Active Goals Yet</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Create your first goal to start tracking your progress and stay focused on what matters.
          </p>
          {showCreateButton && (
            <Button onClick={() => router.push('/goals')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Group goals by category
  const primaryGoals = goals.filter((g) => g.goal_category === 'primary');
  const secondaryGoals = goals.filter((g) => g.goal_category === 'secondary');
  const lifestyleGoals = goals.filter((g) => g.goal_category === 'lifestyle' || !g.goal_category);

  return (
    <div className="space-y-6">
      {/* Primary Goals */}
      {primaryGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h3 className="text-lg font-semibold">Primary Goal</h3>
            <Badge variant="outline" className="bg-purple-50">
              Your Main Focus
            </Badge>
          </div>
          <div className="space-y-3">
            {primaryGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                categoryConfig={categoryConfig}
                priorityConfig={priorityConfig}
                getDaysRemaining={getDaysRemaining}
                onClick={() => router.push(`/goals/${goal.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Secondary Goals */}
      {secondaryGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold">Secondary Goals</h3>
            <Badge variant="outline" className="bg-blue-50">
              {secondaryGoals.length} Active
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {secondaryGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                categoryConfig={categoryConfig}
                priorityConfig={priorityConfig}
                getDaysRemaining={getDaysRemaining}
                onClick={() => router.push(`/goals/${goal.id}`)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Goals */}
      {lifestyleGoals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h3 className="text-lg font-semibold">Lifestyle & Habits</h3>
            <Badge variant="outline" className="bg-green-50">
              {lifestyleGoals.length} Active
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lifestyleGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                categoryConfig={categoryConfig}
                priorityConfig={priorityConfig}
                getDaysRemaining={getDaysRemaining}
                onClick={() => router.push(`/goals/${goal.id}`)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* View All Button */}
      {showCreateButton && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push('/goals')}>
            View All Goals
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => router.push('/goals')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>
      )}
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  categoryConfig: any;
  priorityConfig: any;
  getDaysRemaining: (date?: string) => number | null;
  onClick: () => void;
  compact?: boolean;
}

function GoalCard({
  goal,
  categoryConfig,
  priorityConfig,
  getDaysRemaining,
  onClick,
  compact = false,
}: GoalCardProps) {
  const daysRemaining = getDaysRemaining(goal.target_date);
  const category = goal.goal_category || 'lifestyle';
  const categoryInfo = categoryConfig[category];
  const priorityInfo = priorityConfig[goal.priority];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        goal.goal_category === 'primary' && 'border-purple-200 bg-purple-50/50'
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {!compact && (
                <Badge variant="outline" className={categoryInfo.color}>
                  {categoryInfo.icon} {categoryInfo.label}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn('text-xs', priorityInfo.color)}
              >
                {priorityInfo.label}
              </Badge>
            </div>
            <CardTitle className={cn('text-base', !compact && 'text-lg')}>
              {goal.title}
            </CardTitle>
            {!compact && goal.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {goal.description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{goal.completion_percentage}%</span>
          </div>
          <Progress value={goal.completion_percentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>
                {goal.completed_tasks}/{goal.total_tasks} tasks
              </span>
            </div>
            {daysRemaining !== null && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {daysRemaining} days
                </span>
              </div>
            )}
          </div>
          {goal.goal_category === 'primary' && (
            <div className="flex items-center gap-1 text-purple-600">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">Main Focus</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
