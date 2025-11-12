'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  ArrowRight,
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  due_date: string;
  estimated_duration_minutes: number;
  eisenhower_quadrant: string;
  goal_id: string | null;
}

interface UpcomingTasksWidgetProps {
  tasks: Task[];
}

export function UpcomingTasksWidget({ tasks }: UpcomingTasksWidgetProps) {
  const router = useRouter();

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', color: 'text-red-500', urgent: true };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-orange-500', urgent: true };
    if (diffDays <= 3) return { text: `In ${diffDays} days`, color: 'text-yellow-500', urgent: false };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, color: 'text-blue-500', urgent: false };

    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return { text: `${month} ${day}`, color: 'text-muted-foreground', urgent: false };
  };

  const getQuadrantBadge = (quadrant: string) => {
    switch (quadrant) {
      case 'q1_urgent_important':
        return <Badge variant="destructive" className="text-xs">Q1</Badge>;
      case 'q2_not_urgent_important':
        return <Badge variant="default" className="text-xs">Q2</Badge>;
      case 'q3_urgent_not_important':
        return <Badge variant="secondary" className="text-xs">Q3</Badge>;
      case 'q4_not_urgent_not_important':
        return <Badge variant="outline" className="text-xs">Q4</Badge>;
      default:
        return null;
    }
  };

  const urgentTasks = tasks.filter(task => {
    const { urgent } = formatDueDate(task.due_date);
    return urgent;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Upcoming Tasks
        </CardTitle>
        <Button
          onClick={() => router.push('/calendar')}
          variant="ghost"
          size="sm"
        >
          View Calendar
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No upcoming tasks in the next 7 days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Urgent Tasks Alert */}
            {urgentTasks.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    {urgentTasks.length} {urgentTasks.length === 1 ? 'task is' : 'tasks are'} due soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider scheduling these today or tomorrow
                  </p>
                </div>
              </div>
            )}

            {/* Task List */}
            {tasks.map((task) => {
              const dueDate = formatDueDate(task.due_date);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/tasks?id=${task.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      {getQuadrantBadge(task.eisenhower_quadrant)}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 font-medium ${dueDate.color}`}>
                        <Calendar className="h-3 w-3" />
                        {dueDate.text}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {task.estimated_duration_minutes}min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {tasks.length > 5 && (
              <Button
                onClick={() => router.push('/tasks')}
                variant="ghost"
                className="w-full"
              >
                View All Tasks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
