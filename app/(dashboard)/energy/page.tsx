'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { EnergyLogEntry } from '@/components/energy/EnergyLogEntry';
import { EnergyHeatmap } from '@/components/energy/EnergyHeatmap';
import { EnergyCreatorsDrainers } from '@/components/energy/EnergyCreatorsDrainers';
import { Loader2, Zap } from 'lucide-react';

interface EnergyLog {
  id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
  context: string | null;
  task_id: string | null;
  task_was_energizing: boolean | null;
}

export default function EnergyPage() {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnergyLogs();
  }, []);

  const fetchEnergyLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch last 30 days of logs
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch(
        `/api/energy?start_date=${startDate.toISOString()}&limit=1000`
      );

      if (!response.ok) throw new Error('Failed to fetch energy logs');

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching energy logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogCreated = () => {
    fetchEnergyLogs();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Energy Tracking
        </h1>
        <p className="text-muted-foreground mt-2">
          Track and analyze your energy levels to optimize your productivity
        </p>
      </div>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="log">Log Energy</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="creators-drainers">Creators & Drainers</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Log Entry Form */}
            <EnergyLogEntry onLogCreated={handleLogCreated} />

            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Total Logs</span>
                  <span className="text-2xl font-bold">{logs.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Average Energy</span>
                  <span className="text-2xl font-bold">
                    {logs.length > 0
                      ? (
                          logs.reduce((sum, log) => sum + log.energy_level, 0) / logs.length
                        ).toFixed(1)
                      : '--'}
                    /10
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Last 7 Days</span>
                  <span className="text-2xl font-bold">
                    {logs.filter((log) => {
                      const logDate = new Date(log.timestamp);
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return logDate >= sevenDaysAgo;
                    }).length}{' '}
                    logs
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <EnergyHeatmap logs={logs} days={30} />

          {/* Time of Day Analysis */}
          {logs.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Energy by Time of Day</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['early_morning', 'morning', 'midday', 'afternoon', 'evening', 'night'].map(
                  (timeOfDay) => {
                    const timeLogsFilter = logs.filter((log) => log.time_of_day === timeOfDay);
                    const avg =
                      timeLogsFilter.length > 0
                        ? (
                            timeLogsFilter.reduce((sum, log) => sum + log.energy_level, 0) /
                            timeLogsFilter.length
                          ).toFixed(1)
                        : '--';

                    const getColor = (avg: string) => {
                      const num = parseFloat(avg);
                      if (isNaN(num)) return 'bg-gray-500';
                      if (num >= 8) return 'bg-green-500';
                      if (num >= 6) return 'bg-blue-500';
                      if (num >= 4) return 'bg-yellow-500';
                      if (num >= 2) return 'bg-orange-500';
                      return 'bg-red-500';
                    };

                    return (
                      <div
                        key={timeOfDay}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getColor(avg)}`} />
                          <span className="text-sm font-medium capitalize">
                            {timeOfDay.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold">{avg}/10</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {timeLogsFilter.length} logs
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="creators-drainers">
          <EnergyCreatorsDrainers days={30} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
