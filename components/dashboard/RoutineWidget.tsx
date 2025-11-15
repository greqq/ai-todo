'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sunrise, Moon, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutineTask {
  id: string;
  title: string;
  routine_type: 'morning' | 'evening';
  status: string;
}

export function RoutineWidget() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<RoutineTask[]>([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks?is_routine=true');
      if (response.ok) {
        const tasks = await response.json();
        setRoutines(tasks);
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const morningRoutines = routines.filter(r => r.routine_type === 'morning');
  const eveningRoutines = routines.filter(r => r.routine_type === 'evening');

  const morningCompleted = morningRoutines.filter(r => r.status === 'completed').length;
  const eveningCompleted = eveningRoutines.filter(r => r.status === 'completed').length;

  const morningProgress = morningRoutines.length > 0
    ? Math.round((morningCompleted / morningRoutines.length) * 100)
    : 0;

  const eveningProgress = eveningRoutines.length > 0
    ? Math.round((eveningCompleted / eveningRoutines.length) * 100)
    : 0;

  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 18;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Don't show if no routines
  if (morningRoutines.length === 0 && eveningRoutines.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Today&apos;s Routines</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/routines')}
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Morning Routine */}
        {morningRoutines.length > 0 && (
          <div className={cn(
            'rounded-lg border p-4 transition-all',
            isMorning && 'border-orange-200 bg-orange-50'
          )}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunrise className={cn(
                  'h-5 w-5',
                  isMorning ? 'text-orange-600' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Morning Routine</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {morningCompleted}/{morningRoutines.length}
              </span>
            </div>
            <Progress
              value={morningProgress}
              className={cn('h-2', morningProgress === 100 && 'bg-green-200')}
            />
            {morningProgress === 100 && (
              <p className="mt-2 text-xs text-green-600">
                ✓ Morning routine complete!
              </p>
            )}
          </div>
        )}

        {/* Evening Routine */}
        {eveningRoutines.length > 0 && (
          <div className={cn(
            'rounded-lg border p-4 transition-all',
            isEvening && 'border-indigo-200 bg-indigo-50'
          )}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className={cn(
                  'h-5 w-5',
                  isEvening ? 'text-indigo-600' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Evening Routine</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {eveningCompleted}/{eveningRoutines.length}
              </span>
            </div>
            <Progress
              value={eveningProgress}
              className={cn('h-2', eveningProgress === 100 && 'bg-green-200')}
            />
            {eveningProgress === 100 && (
              <p className="mt-2 text-xs text-green-600">
                ✓ Evening routine complete!
              </p>
            )}
          </div>
        )}

        {/* Quick Action */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/routines')}
        >
          Manage Routines
        </Button>
      </CardContent>
    </Card>
  );
}
