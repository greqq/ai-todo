'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Target, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GoalTimeline } from '@/components/goals/GoalTimeline';
import { Loader2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: string;
  start_date?: string;
  target_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  success_criteria?: string[];
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  goal_category?: 'primary' | 'secondary' | 'lifestyle';
  created_at: string;
  updated_at: string;
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const goalId = resolvedParams.id;
  const router = useRouter();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/goals/${goalId}`);
      if (response.ok) {
        const data = await response.json();
        setGoal(data);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Target className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Goal Not Found</h2>
        <p className="mb-4 text-muted-foreground">
          The goal you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/goals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-600',
  };

  const categoryColors = {
    primary: 'bg-purple-100 text-purple-800 border-purple-300',
    secondary: 'bg-blue-100 text-blue-800 border-blue-300',
    lifestyle: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/goals')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={priorityColors[goal.priority]}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
              </Badge>
              <Badge className={statusColors[goal.status]}>
                {goal.status.replace('_', ' ').charAt(0).toUpperCase() +
                  goal.status.replace('_', ' ').slice(1)}
              </Badge>
              {goal.goal_category && (
                <Badge variant="outline" className={categoryColors[goal.goal_category]}>
                  {goal.goal_category.charAt(0).toUpperCase() + goal.goal_category.slice(1)} Goal
                </Badge>
              )}
              <Badge variant="outline">
                {goal.type.replace('_', ' ').charAt(0).toUpperCase() +
                  goal.type.replace('_', ' ').slice(1)}
              </Badge>
            </div>

            <h1 className="mb-2 text-3xl font-bold">{goal.title}</h1>

            {goal.description && (
              <p className="text-muted-foreground">{goal.description}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {goal.start_date && goal.target_date ? (
                <span>
                  {new Date(goal.start_date).toLocaleDateString()} →{' '}
                  {new Date(goal.target_date).toLocaleDateString()}
                </span>
              ) : goal.target_date ? (
                <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
              ) : (
                <span>No deadline set</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold">{goal.completion_percentage}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {goal.completed_tasks}/{goal.total_tasks}
              </p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{goal.completion_percentage}%</p>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">
                {goal.target_date
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(goal.target_date).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Days Remaining</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Success Criteria */}
            {goal.success_criteria && goal.success_criteria.length > 0 && (
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  Success Criteria
                </h3>
                <ul className="space-y-2">
                  {goal.success_criteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-semibold">{index + 1}</span>
                      </div>
                      <span className="text-sm">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Progress Bar */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="font-semibold">{goal.completion_percentage}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{ width: `${goal.completion_percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {goal.start_date && goal.target_date ? (
            <GoalTimeline
              goalId={goal.id}
              goalStartDate={goal.start_date}
              goalTargetDate={goal.target_date}
              onRegenerate={fetchGoal}
            />
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Timeline Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                This goal needs start and target dates to generate a timeline.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Tasks view coming soon. For now, manage tasks from the Tasks page.
            </p>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Milestones view coming soon. See the Timeline tab for breakdown milestones.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
