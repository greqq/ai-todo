'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Sparkles,
  Coffee,
  Sun,
  Sunrise,
} from 'lucide-react';

interface DailyTask {
  task_id: string;
  title: string;
  description: string;
  estimated_duration_minutes: number;
  energy_required: 'high' | 'medium' | 'low';
  task_type: string;
  eisenhower_quadrant: string;
  suggested_time_block?: string;
  linked_goal_id?: string;
  is_eat_the_frog?: boolean;
  reasoning: string;
}

interface MorningPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanConfirmed: () => void;
}

const energyColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const quadrantColors: Record<string, string> = {
  q1_urgent_important: 'bg-red-100 text-red-700',
  q2_not_urgent_important: 'bg-blue-100 text-blue-700',
  q3_urgent_not_important: 'bg-yellow-100 text-yellow-700',
  q4_not_urgent_not_important: 'bg-gray-100 text-gray-700',
};

const quadrantLabels: Record<string, string> = {
  q1_urgent_important: 'Urgent & Important',
  q2_not_urgent_important: 'Important',
  q3_urgent_not_important: 'Urgent',
  q4_not_urgent_not_important: 'Neither',
};

export function MorningPlanningDialog({
  open,
  onOpenChange,
  onPlanConfirmed,
}: MorningPlanningDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [dailyMessage, setDailyMessage] = useState<string>('');
  const [focusSuggestion, setFocusSuggestion] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [stage, setStage] = useState<'generating' | 'reviewing' | 'confirming'>(
    'generating'
  );

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        text: 'Good morning',
        icon: <Sunrise className="h-8 w-8 text-amber-500" />,
      };
    }
    if (hour < 18) {
      return {
        text: 'Good afternoon',
        icon: <Sun className="h-8 w-8 text-amber-500" />,
      };
    }
    return {
      text: 'Good evening',
      icon: <Coffee className="h-8 w-8 text-amber-500" />,
    };
  };

  const greeting = getGreeting();

  const generateDailyTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-daily-tasks', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate daily tasks');
      }

      const data = await response.json();
      setTasks(data.suggestions || []);
      setDailyMessage(data.daily_message || '');
      setFocusSuggestion(data.focus_suggestion || '');
      setStage('reviewing');
    } catch (err: any) {
      console.error('Error generating tasks:', err);
      setError(err.message || 'Failed to generate your daily plan');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-generate tasks when dialog opens
  useEffect(() => {
    if (open && stage === 'generating' && tasks.length === 0) {
      generateDailyTasks();
    }
  }, [open, stage, tasks.length, generateDailyTasks]);

  const handleConfirmPlan = async () => {
    setConfirming(true);
    setError('');

    try {
      // Accept all suggested tasks
      const acceptResponse = await fetch('/api/ai/accept-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });

      if (!acceptResponse.ok) {
        throw new Error('Failed to save tasks');
      }

      // Mark morning plan as confirmed
      const confirmResponse = await fetch('/api/daily-plan/confirm', {
        method: 'POST',
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm plan');
      }

      setStage('confirming');

      // Wait a moment to show confirmation message
      setTimeout(() => {
        onPlanConfirmed();
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error confirming plan:', err);
      setError(err.message || 'Failed to confirm your plan');
    } finally {
      setConfirming(false);
    }
  };

  const handleSkip = async () => {
    // Mark as confirmed even if skipped (so it doesn't show again today)
    try {
      await fetch('/api/daily-plan/confirm', { method: 'POST' });
    } catch (err) {
      console.error('Error marking plan as confirmed:', err);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {stage === 'confirming' ? (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                You&apos;ve got this!
              </h2>
              <p className="text-lg text-muted-foreground">
                Your day is planned and ready. Let&apos;s make it count!
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl flex items-center gap-3">
                {greeting.icon}
                {greeting.text}! Ready to make today count?
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {stage === 'generating'
                  ? 'Creating your personalized daily plan...'
                  : 'Here&apos;s your AI-powered plan for today. Review and confirm to get started.'}
              </DialogDescription>
            </DialogHeader>

            {loading && (
              <div className="py-12 flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                <p className="text-muted-foreground">
                  Analyzing your goals and energy patterns...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            {!loading && tasks.length > 0 && (
              <div className="space-y-6">
                {dailyMessage && (
                  <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <div className="space-y-4">
                      {dailyMessage && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            Today&apos;s Message
                          </h3>
                          <p className="text-foreground">{dailyMessage}</p>
                        </div>
                      )}
                      {focusSuggestion && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Star className="h-5 w-5 text-amber-500" />
                            Today&apos;s Focus
                          </h3>
                          <p className="text-foreground">{focusSuggestion}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Your Tasks for Today ({tasks.length})
                  </h3>
                  <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <Card
                        key={index}
                        className="p-4 border-l-4 border-l-purple-400"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-base flex items-center gap-2">
                              {task.is_eat_the_frog && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                              {task.title}
                            </h4>
                            {task.is_eat_the_frog && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                Eat the Frog
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className={energyColors[task.energy_required]}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {task.energy_required} energy
                            </Badge>
                            <Badge variant="outline" className="border-gray-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimated_duration_minutes} min
                            </Badge>
                            {task.eisenhower_quadrant && (
                              <Badge
                                variant="outline"
                                className={
                                  quadrantColors[task.eisenhower_quadrant] ||
                                  ''
                                }
                              >
                                {quadrantLabels[task.eisenhower_quadrant] ||
                                  task.eisenhower_quadrant}
                              </Badge>
                            )}
                            {task.suggested_time_block && (
                              <Badge
                                variant="outline"
                                className="border-blue-300"
                              >
                                {task.suggested_time_block}
                              </Badge>
                            )}
                          </div>

                          {task.reasoning && (
                            <p className="text-xs text-muted-foreground italic">
                              {task.reasoning}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleSkip} disabled={confirming}>
                Skip for Today
              </Button>
              <Button
                onClick={handleConfirmPlan}
                disabled={confirming || loading || tasks.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm & Start My Day
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
