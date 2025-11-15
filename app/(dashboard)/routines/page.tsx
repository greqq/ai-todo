'use client';

import { useState, useEffect } from 'react';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { RoutineTracker } from '@/components/routines/RoutineTracker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Plus, Sunrise, Moon, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RoutineTask {
  id: string;
  title: string;
  description?: string;
  estimated_duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  routine_type: 'morning' | 'evening';
  is_optional?: boolean;
  completed_today?: boolean;
  order_index?: number;
  status: string;
  recurrence_pattern: string;
}

interface RoutineStats {
  currentStreak: number;
  longestStreak: number;
  completionRateWeek: number;
  completionRateMonth: number;
  totalCompleted: number;
  completedToday: number;
  totalToday: number;
}

export default function RoutinesPage() {
  const [loading, setLoading] = useState(true);
  const [morningRoutines, setMorningRoutines] = useState<RoutineTask[]>([]);
  const [eveningRoutines, setEveningRoutines] = useState<RoutineTask[]>([]);
  const [morningStats, setMorningStats] = useState<RoutineStats>({
    currentStreak: 0,
    longestStreak: 0,
    completionRateWeek: 0,
    completionRateMonth: 0,
    totalCompleted: 0,
    completedToday: 0,
    totalToday: 0,
  });
  const [eveningStats, setEveningStats] = useState<RoutineStats>({
    currentStreak: 0,
    longestStreak: 0,
    completionRateWeek: 0,
    completionRateMonth: 0,
    totalCompleted: 0,
    completedToday: 0,
    totalToday: 0,
  });

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks?is_routine=true');
      if (response.ok) {
        const tasks = await response.json();

        // Separate morning and evening routines
        const morning = tasks.filter((t: RoutineTask) => t.routine_type === 'morning');
        const evening = tasks.filter((t: RoutineTask) => t.routine_type === 'evening');

        setMorningRoutines(morning.sort((a: RoutineTask, b: RoutineTask) =>
          (a.order_index || 0) - (b.order_index || 0)
        ));
        setEveningRoutines(evening.sort((a: RoutineTask, b: RoutineTask) =>
          (a.order_index || 0) - (b.order_index || 0)
        ));

        // Calculate stats (simplified - would normally come from API)
        calculateStats(morning, 'morning');
        calculateStats(evening, 'evening');
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      toast.error('Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (routines: RoutineTask[], type: 'morning' | 'evening') => {
    const total = routines.length;
    const completed = routines.filter(r => r.status === 'completed').length;

    const stats: RoutineStats = {
      currentStreak: 0, // Would calculate from completion history
      longestStreak: 0, // Would calculate from completion history
      completionRateWeek: total > 0 ? Math.round((completed / total) * 100) : 0,
      completionRateMonth: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalCompleted: completed,
      completedToday: completed,
      totalToday: total,
    };

    if (type === 'morning') {
      setMorningStats(stats);
    } else {
      setEveningStats(stats);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: completed ? 'completed' : 'todo',
        }),
      });

      if (response.ok) {
        // Refresh routines to update stats
        fetchRoutines();
        toast.success(completed ? 'Task completed!' : 'Task marked as incomplete');
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this routine task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRoutines();
        toast.success('Routine task deleted');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Routines</h1>
          <p className="text-muted-foreground">
            Build consistent morning and evening habits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRoutines}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Routine
          </Button>
        </div>
      </div>

      {/* Tabs for Morning/Evening */}
      <Tabs defaultValue="morning" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="morning" className="gap-2">
            <Sunrise className="h-4 w-4" />
            Morning Routine
          </TabsTrigger>
          <TabsTrigger value="evening" className="gap-2">
            <Moon className="h-4 w-4" />
            Evening Routine
          </TabsTrigger>
        </TabsList>

        {/* Morning Routines */}
        <TabsContent value="morning" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Routine Tasks (2 cols) */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Morning Tasks ({morningRoutines.length})
                </h2>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-3 w-3" />
                  Add Task
                </Button>
              </div>

              {morningRoutines.length === 0 ? (
                <Card className="border-dashed p-12 text-center">
                  <Sunrise className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No Morning Routine Yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your morning routine to start your day with purpose.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Morning Routine
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {morningRoutines.map((task) => (
                    <RoutineCard
                      key={task.id}
                      task={{
                        ...task,
                        completed_today: task.status === 'completed',
                      }}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDelete}
                      dragHandle
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stats (1 col) */}
            <div>
              <RoutineTracker routineType="morning" stats={morningStats} />
            </div>
          </div>
        </TabsContent>

        {/* Evening Routines */}
        <TabsContent value="evening" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Routine Tasks (2 cols) */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Evening Tasks ({eveningRoutines.length})
                </h2>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-3 w-3" />
                  Add Task
                </Button>
              </div>

              {eveningRoutines.length === 0 ? (
                <Card className="border-dashed p-12 text-center">
                  <Moon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No Evening Routine Yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your evening routine to wind down effectively.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Evening Routine
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {eveningRoutines.map((task) => (
                    <RoutineCard
                      key={task.id}
                      task={{
                        ...task,
                        completed_today: task.status === 'completed',
                      }}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDelete}
                      dragHandle
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stats (1 col) */}
            <div>
              <RoutineTracker routineType="evening" stats={eveningStats} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
