'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnergyLogEntryProps {
  onLogCreated?: () => void;
  taskId?: string;
  taskTitle?: string;
}

const ENERGY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function EnergyLogEntry({ onLogCreated, taskId, taskTitle }: EnergyLogEntryProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [context, setContext] = useState('');
  const [taskWasEnergizing, setTaskWasEnergizing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedEnergy) {
      toast({
        title: 'Energy level required',
        description: 'Please select your current energy level',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energy_level: selectedEnergy,
          context: context.trim() || undefined,
          task_id: taskId || undefined,
          task_was_energizing: taskWasEnergizing,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log energy');
      }

      toast({
        title: 'Energy logged!',
        description: 'Your energy level has been recorded.',
      });

      // Reset form
      setSelectedEnergy(null);
      setContext('');
      setTaskWasEnergizing(null);

      onLogCreated?.();
    } catch (error) {
      console.error('Error logging energy:', error);
      toast({
        title: 'Error',
        description: 'Failed to log energy. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'bg-green-500 hover:bg-green-600 border-green-600';
    if (level >= 6) return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
    if (level >= 4) return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
    if (level >= 2) return 'bg-orange-500 hover:bg-orange-600 border-orange-600';
    return 'bg-red-500 hover:bg-red-600 border-red-600';
  };

  const getEnergyLabel = (level: number) => {
    if (level >= 9) return 'Peak';
    if (level >= 7) return 'High';
    if (level >= 5) return 'Good';
    if (level >= 3) return 'Low';
    return 'Very Low';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Log Your Energy
        </CardTitle>
        <CardDescription>
          How are you feeling right now? Track your energy to identify patterns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Context (if provided) */}
        {taskTitle && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-1">Logging energy for task:</p>
            <p className="font-medium">{taskTitle}</p>
          </div>
        )}

        {/* Energy Level Selector */}
        <div className="space-y-2">
          <Label>Energy Level (1-10)</Label>
          <div className="grid grid-cols-5 gap-2">
            {ENERGY_LEVELS.map((level) => (
              <Button
                key={level}
                type="button"
                variant={selectedEnergy === level ? 'default' : 'outline'}
                className={
                  selectedEnergy === level
                    ? `${getEnergyColor(level)} text-white`
                    : 'hover:border-primary'
                }
                onClick={() => setSelectedEnergy(level)}
                disabled={isLoading}
              >
                {level}
              </Button>
            ))}
          </div>
          {selectedEnergy && (
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`${getEnergyColor(selectedEnergy)} text-white border-transparent`}
              >
                {getEnergyLabel(selectedEnergy)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {selectedEnergy >= 8 && 'Perfect for challenging tasks!'}
                {selectedEnergy >= 6 && selectedEnergy < 8 && 'Good for steady work'}
                {selectedEnergy >= 4 && selectedEnergy < 6 && 'Best for routine tasks'}
                {selectedEnergy >= 2 && selectedEnergy < 4 && 'Take it easy'}
                {selectedEnergy < 2 && 'Consider taking a break'}
              </span>
            </div>
          )}
        </div>

        {/* Task Energy Impact (if task provided) */}
        {taskId && (
          <div className="space-y-2">
            <Label>Did this task energize or drain you?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={taskWasEnergizing === true ? 'default' : 'outline'}
                className={
                  taskWasEnergizing === true
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : ''
                }
                onClick={() => setTaskWasEnergizing(true)}
                disabled={isLoading}
              >
                ⚡ Energized Me
              </Button>
              <Button
                type="button"
                variant={taskWasEnergizing === false ? 'default' : 'outline'}
                className={
                  taskWasEnergizing === false
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : ''
                }
                onClick={() => setTaskWasEnergizing(false)}
                disabled={isLoading}
              >
                😴 Drained Me
              </Button>
            </div>
          </div>
        )}

        {/* Optional Context */}
        <div className="space-y-2">
          <Label htmlFor="context">What&apos;s happening? (Optional)</Label>
          <Textarea
            id="context"
            placeholder="e.g., Just finished a meeting, feeling focused..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedEnergy || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Log Energy
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
