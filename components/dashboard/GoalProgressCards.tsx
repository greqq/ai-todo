'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  type: string;
  priority: string;
  target_date: string;
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  completed_milestones: number;
  total_milestones: number;
}

interface GoalProgressCardsProps {
  goals: Goal[];
}

export function GoalProgressCards({ goals }: GoalProgressCardsProps) {
  const router = useRouter();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 25) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getDaysUntilDeadline = (targetDate: string) => {
    const today = new Date();
    const deadline = new Date(targetDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDeadline = (targetDate: string) => {
    const days = getDaysUntilDeadline(targetDate);
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-red-500' };
    if (days === 0) return { text: 'Due today', color: 'text-red-500' };
    if (days === 1) return { text: '1 day left', color: 'text-orange-500' };
    if (days <= 7) return { text: `${days} days left`, color: 'text-yellow-500' };
    if (days <= 30) return { text: `${days} days left`, color: 'text-blue-500' };
    return { text: `${days} days left`, color: 'text-muted-foreground' };
  };

  const goalsNeedingAttention = goals.filter(
    goal => goal.completion_percentage < 25 && getDaysUntilDeadline(goal.target_date) <= 30
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl font-bold">Active Goals</CardTitle>
          <Button onClick={() => router.push('/goals')} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">No active goals yet</p>
              <Button onClick={() => router.push('/goals')} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Goals Needing Attention Alert */}
              {goalsNeedingAttention.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      {goalsNeedingAttention.length} {goalsNeedingAttention.length === 1 ? 'goal needs' : 'goals need'} attention
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      These goals have low progress and approaching deadlines
                    </p>
                  </div>
                </div>
              )}

              {/* Goal Cards */}
              {goals.map((goal) => {
                const deadline = formatDeadline(goal.target_date);
                const progressColor = getProgressColor(goal.completion_percentage);

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/goals?id=${goal.id}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{goal.title}</h3>
                          {getTrendIcon(goal.completion_percentage)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(goal.priority)}`}
                          >
                            {goal.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-2xl font-bold ${progressColor.replace('bg-', 'text-')}`}>
                          {goal.completion_percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <Progress
                        value={goal.completion_percentage}
                        className="h-2"
                        indicatorClassName={progressColor}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                          {goal.completed_tasks}/{goal.total_tasks} tasks
                        </span>
                        {goal.total_milestones > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            {goal.completed_milestones}/{goal.total_milestones} milestones
                          </span>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 text-xs ${deadline.color}`}>
                        <Clock className="h-3 w-3" />
                        {deadline.text}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* View All Goals Button */}
              <Button
                onClick={() => router.push('/goals')}
                variant="ghost"
                className="w-full"
              >
                View All Goals
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
