'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnergyData {
  current: number | null;
  average: number | null;
  peakTime: string;
}

interface EnergyIndicatorProps {
  energy: EnergyData;
}

export function EnergyIndicator({ energy }: EnergyIndicatorProps) {
  const router = useRouter();

  const getEnergyLevel = (value: number | null) => {
    if (value === null) return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-500' };
    if (value >= 8) return { label: 'High', color: 'text-green-500', bg: 'bg-green-500' };
    if (value >= 6) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (value >= 4) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (value >= 2) return { label: 'Low', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Very Low', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const getPeakTimeIcon = (peakTime: string) => {
    switch (peakTime) {
      case 'morning':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'afternoon':
        return <Sunset className="h-5 w-5 text-orange-500" />;
      case 'evening':
        return <Moon className="h-5 w-5 text-indigo-500" />;
      case 'night':
        return <Moon className="h-5 w-5 text-purple-500" />;
      default:
        return <Sun className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPeakTimeLabel = (peakTime: string) => {
    return peakTime.charAt(0).toUpperCase() + peakTime.slice(1);
  };

  const currentLevel = getEnergyLevel(energy.current);
  const averageLevel = getEnergyLevel(energy.average);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Energy Level
        </CardTitle>
        <Button
          onClick={() => router.push('/analytics')}
          variant="ghost"
          size="sm"
        >
          View Patterns
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Energy */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${currentLevel.bg}/10`}>
                <Activity className={`h-6 w-6 ${currentLevel.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Energy</p>
                <p className={`text-2xl font-bold ${currentLevel.color}`}>
                  {energy.current !== null ? energy.current : '--'}/10
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${currentLevel.color} ${currentLevel.bg}/10 border-current`}
            >
              {currentLevel.label}
            </Badge>
          </div>

          {/* Average Energy (Last 7 Days) */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${averageLevel.bg}/10`}>
                <TrendingUp className={`h-6 w-6 ${averageLevel.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">7-Day Average</p>
                <p className={`text-2xl font-bold ${averageLevel.color}`}>
                  {energy.average !== null ? energy.average.toFixed(1) : '--'}/10
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${averageLevel.color} ${averageLevel.bg}/10 border-current`}
            >
              {averageLevel.label}
            </Badge>
          </div>

          {/* Peak Time */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                {getPeakTimeIcon(energy.peakTime)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Peak Time</p>
                <p className="text-lg font-semibold">
                  {getPeakTimeLabel(energy.peakTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Energy Tip */}
          {energy.current !== null && energy.current < 5 && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Your energy is low. Consider taking a break or working on low-energy tasks.
              </p>
            </div>
          )}

          {energy.current !== null && energy.current >= 8 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">
                🚀 <strong>Great!</strong> Your energy is high. Perfect time for challenging tasks!
              </p>
            </div>
          )}

          {energy.current === null && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                📊 <strong>Track your energy:</strong> Log your energy level to get personalized insights.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
