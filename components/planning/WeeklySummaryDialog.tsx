'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Calendar,
  Trophy,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Target,
  Sparkles,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

interface WeeklySummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStartDate?: string; // Optional: specific week to display
}

interface WeeklySummary {
  id: string;
  week_start_date: string;
  week_end_date: string;
  total_tasks_completed: number;
  total_tasks_planned: number;
  completion_rate: number;
  total_time_invested_minutes: number;
  days_with_80_percent_completion: number;
  average_energy_level: number;
  most_productive_days: string[];
  key_wins: string[];
  challenges: string[];
  patterns_detected: string[];
  suggestions_for_next_week: string[];
  motivational_message?: string;
}

export function WeeklySummaryDialog({
  open,
  onOpenChange,
  weekStartDate,
}: WeeklySummaryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [goalsNeedingAttention, setGoalsNeedingAttention] = useState<any[]>([]);
  const [backlogSuggestions, setBacklogSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadSummary();
    }
  }, [open, weekStartDate]);

  const loadSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (weekStartDate) {
        params.append('date', weekStartDate);
      }

      const response = await fetch(`/api/summaries/weekly?${params.toString()}`);

      if (response.status === 404) {
        // No summary exists, offer to generate one
        setSummary(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load weekly summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setGoalsNeedingAttention(data.goals_needing_attention || []);
      setBacklogSuggestions(data.backlog_suggestions || []);
    } catch (err: any) {
      console.error('Error loading weekly summary:', err);
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/summaries/weekly/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: weekStartDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setGoalsNeedingAttention(data.goals_needing_attention || []);
      setBacklogSuggestions(data.backlog_suggestions || []);
    } catch (err: any) {
      console.error('Error generating weekly summary:', err);
      setError(err.message || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!summary) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Calendar className="h-7 w-7 text-indigo-500" />
              Weekly Summary
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              No summary found for this week. Generate one to see your progress, insights, and
              suggestions.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={generateSummary} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const completionPercentage = Math.round(summary.completion_rate * 100);
  const timeInvestedHours = Math.round(summary.total_time_invested_minutes / 60);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Weekly Summary
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {format(new Date(summary.week_start_date), 'MMM d')} -{' '}
            {format(new Date(summary.week_end_date), 'MMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wins">Wins & Insights</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="next-week">Next Week</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Tasks Completed</p>
                    <p className="text-3xl font-bold text-green-900">
                      {summary.total_tasks_completed}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold text-blue-900">{completionPercentage}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Time Invested</p>
                    <p className="text-3xl font-bold text-purple-900">{timeInvestedHours}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">High Days</p>
                    <p className="text-3xl font-bold text-yellow-900">
                      {summary.days_with_80_percent_completion}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>
            </div>

            {/* Energy & Productivity */}
            {summary.average_energy_level && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Energy & Productivity
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Average Energy:</span>{' '}
                    {summary.average_energy_level}/10
                  </p>
                  {summary.most_productive_days.length > 0 && (
                    <p>
                      <span className="font-medium">Most Productive Days:</span>{' '}
                      {summary.most_productive_days.join(', ')}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Wins & Insights Tab */}
          <TabsContent value="wins" className="space-y-4 mt-4">
            {/* Key Wins */}
            {summary.key_wins && summary.key_wins.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Key Wins
                </h3>
                <ul className="space-y-2">
                  {summary.key_wins.map((win: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Patterns & Insights */}
            {summary.patterns_detected && summary.patterns_detected.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Insights & Patterns
                </h3>
                <ul className="space-y-2">
                  {summary.patterns_detected.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4 mt-4">
            {/* Challenges */}
            {summary.challenges && summary.challenges.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {summary.challenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Goals Needing Attention */}
            {goalsNeedingAttention.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  Goals Needing Attention
                </h3>
                <div className="space-y-3">
                  {goalsNeedingAttention.map((goal: any) => (
                    <div
                      key={goal.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.completion_percentage}% complete
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Next Week Tab */}
          <TabsContent value="next-week" className="space-y-4 mt-4">
            {/* Suggestions for Next Week */}
            {summary.suggestions_for_next_week && summary.suggestions_for_next_week.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-indigo-500" />
                  Suggestions for Next Week
                </h3>
                <ul className="space-y-2">
                  {summary.suggestions_for_next_week.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Backlog Suggestions */}
            {backlogSuggestions.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Suggested Backlog Items to Schedule
                </h3>
                <div className="space-y-3">
                  {backlogSuggestions.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.priority}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
