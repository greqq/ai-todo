'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, Battery, BatteryLow } from 'lucide-react';

interface TaskEnergyData {
  task_id: string;
  task_title: string;
  avg_energy: number;
}

interface EnergyPattern {
  most_energizing_tasks: TaskEnergyData[];
  most_draining_tasks: TaskEnergyData[];
  insights: string[];
}

interface EnergyCreatorsDrainersProps {
  days?: number;
}

export function EnergyCreatorsDrainers({ days = 30 }: EnergyCreatorsDrainersProps) {
  const [patterns, setPatterns] = useState<EnergyPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatterns();
  }, [days]);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/energy/patterns?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch patterns');

      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error('Error fetching energy patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!patterns) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load energy patterns</p>
        </CardContent>
      </Card>
    );
  }

  const hasEnergizingTasks = patterns.most_energizing_tasks.length > 0;
  const hasDrainingTasks = patterns.most_draining_tasks.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Energy Creators & Drainers
        </CardTitle>
        <CardDescription>
          Identify which tasks energize you and which ones drain your energy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Energy Creators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-lg">Energy Creators</h3>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {patterns.most_energizing_tasks.length}
            </Badge>
          </div>

          {hasEnergizingTasks ? (
            <div className="space-y-2">
              {patterns.most_energizing_tasks.map((task) => (
                <div
                  key={task.task_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Zap className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium truncate">{task.task_title}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 bg-white dark:bg-green-950"
                  >
                    +{task.avg_energy.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                No energizing tasks identified yet. Keep logging your energy after completing
                tasks!
              </p>
            </div>
          )}

          {hasEnergizingTasks && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">
                💡 <strong>Tip:</strong> Schedule more of these tasks when you need an energy
                boost!
              </p>
            </div>
          )}
        </div>

        {/* Energy Drainers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BatteryLow className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-lg">Energy Drainers</h3>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {patterns.most_draining_tasks.length}
            </Badge>
          </div>

          {hasDrainingTasks ? (
            <div className="space-y-2">
              {patterns.most_draining_tasks.map((task) => (
                <div
                  key={task.task_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <BatteryLow className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium truncate">{task.task_title}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600 bg-white dark:bg-orange-950"
                  >
                    {task.avg_energy.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                No draining tasks identified yet. Keep logging your energy after completing tasks!
              </p>
            </div>
          )}

          {hasDrainingTasks && (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                💡 <strong>Tip:</strong> Schedule these tasks during your peak energy times, or
                consider delegating them.
              </p>
            </div>
          )}
        </div>

        {/* Insights */}
        {patterns.insights.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-lg">Insights</h3>
            <div className="space-y-2">
              {patterns.insights.map((insight, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border">
                  <p className="text-sm text-blue-700 dark:text-blue-400">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasEnergizingTasks && !hasDrainingTasks && (
          <div className="p-6 rounded-lg bg-muted/50 text-center">
            <p className="text-muted-foreground">
              Start tracking your energy after completing tasks to identify patterns!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
