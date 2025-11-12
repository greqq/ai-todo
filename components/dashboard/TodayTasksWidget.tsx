'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Battery,
  BatteryLow,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  status: string;
  energy_required: string;
  estimated_duration_minutes: number;
  eisenhower_quadrant: string;
  goal_id: string | null;
}

interface TodayTasksWidgetProps {
  tasks: Task[];
  completionRate: number;
  onTaskComplete: (taskId: string) => void;
}

export function TodayTasksWidget({
  tasks,
  completionRate,
  onTaskComplete
}: TodayTasksWidgetProps) {
  const router = useRouter();

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'medium':
        return <Battery className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <BatteryLow className="h-4 w-4 text-green-500" />;
      default:
        return <Battery className="h-4 w-4 text-gray-400" />;
    }
  };

  const getQuadrantBadge = (quadrant: string) => {
    switch (quadrant) {
      case 'q1_urgent_important':
        return <Badge variant="destructive" className="text-xs">Q1: Urgent</Badge>;
      case 'q2_not_urgent_important':
        return <Badge variant="default" className="text-xs">Q2: Important</Badge>;
      case 'q3_urgent_not_important':
        return <Badge variant="secondary" className="text-xs">Q3: Delegate</Badge>;
      case 'q4_not_urgent_not_important':
        return <Badge variant="outline" className="text-xs">Q4: Eliminate</Badge>;
      default:
        return null;
    }
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      // Don't allow uncompleting from dashboard
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      toast.success('Task completed!');
      onTaskComplete(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const incompleteTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-bold">Today&apos;s Tasks</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {completedTasks.length} / {tasks.length} completed
          </div>
          <div className="flex items-center gap-1">
            <div className="w-24 bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs font-medium">{completionRate}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">No tasks for today</p>
            <Button onClick={() => router.push('/tasks')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Incomplete Tasks First */}
            {incompleteTasks.length > 0 && (
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => handleTaskToggle(task.id, task.status)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        {getQuadrantBadge(task.eisenhower_quadrant)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration_minutes}min
                        </span>
                        <span className="flex items-center gap-1">
                          {getEnergyIcon(task.energy_required)}
                          {task.energy_required} energy
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 opacity-60"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate line-through">{task.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Tasks Button */}
            <Button
              onClick={() => router.push('/tasks')}
              variant="ghost"
              className="w-full mt-2"
            >
              View All Tasks
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
