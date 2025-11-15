'use client';

import { useEffect, useState } from 'react';
import { TimelineNode, type NodeStatus, type PeriodType } from './TimelineNode';
import { BreakdownMilestoneCard } from './BreakdownMilestoneCard';
import { Loader2, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  period_type: PeriodType;
  title: string;
  description: string;
  target_date: string;
  completion_percentage_target: number;
  key_deliverables: string[];
  order_index: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MilestoneWithStatus extends Milestone {
  status: NodeStatus;
}

interface GoalTimelineProps {
  goalId: string;
  goalStartDate: string;
  goalTargetDate: string;
  onRegenerate?: () => void;
}

export function GoalTimeline({
  goalId,
  goalStartDate,
  goalTargetDate,
  onRegenerate,
}: GoalTimelineProps) {
  const [milestones, setMilestones] = useState<MilestoneWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithStatus | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch milestones
  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/goals/${goalId}/breakdown`);
      if (response.ok) {
        const data = await response.json();
        const milestonesWithStatus = calculateMilestoneStatuses(data.milestones || []);
        setMilestones(milestonesWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [goalId]);

  // Calculate milestone status based on dates and completion
  const calculateMilestoneStatuses = (rawMilestones: Milestone[]): MilestoneWithStatus[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rawMilestones.map((milestone) => {
      const targetDate = new Date(milestone.target_date);
      targetDate.setHours(0, 0, 0, 0);

      let status: NodeStatus;

      if (milestone.completed) {
        status = 'completed';
      } else if (targetDate < today) {
        // Past due but not completed - treat as current to encourage completion
        status = 'current';
      } else {
        // Check if this is the current milestone (closest upcoming one)
        const upcomingMilestones = rawMilestones.filter((m) => {
          const mDate = new Date(m.target_date);
          mDate.setHours(0, 0, 0, 0);
          return !m.completed && mDate >= today;
        });

        if (upcomingMilestones.length > 0) {
          // Sort by target_date
          upcomingMilestones.sort((a, b) =>
            new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
          );

          const currentMilestone = upcomingMilestones[0];
          status = milestone.id === currentMilestone.id ? 'current' : 'future';
        } else {
          status = 'future';
        }
      }

      return {
        ...milestone,
        status,
      };
    });
  };

  // Group milestones by period type
  const groupedMilestones: Record<PeriodType, MilestoneWithStatus[]> = {
    '12_month': [],
    '6_month': [],
    '3_month': [],
    '1_month': [],
    'weekly': [],
  };

  milestones.forEach((milestone) => {
    groupedMilestones[milestone.period_type].push(milestone);
  });

  // Get current week's milestone for focus section
  const currentWeekMilestone = milestones.find(
    (m) => m.period_type === 'weekly' && m.status === 'current'
  );

  // Handle regenerate
  const handleRegenerate = async () => {
    if (!onRegenerate) return;

    setRegenerating(true);
    try {
      const response = await fetch(`/api/goals/${goalId}/breakdown`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchMilestones();
        onRegenerate();
      }
    } catch (error) {
      console.error('Failed to regenerate breakdown:', error);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No Breakdown Generated Yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Generate an AI-powered breakdown to see your goal timeline with milestones.
        </p>
        <Button onClick={handleRegenerate} disabled={regenerating}>
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Breakdown
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Regenerate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goal Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Your journey from {new Date(goalStartDate).toLocaleDateString()} to{' '}
            {new Date(goalTargetDate).toLocaleDateString()}
          </p>
        </div>
        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        )}
      </div>

      {/* Current Week Focus (if available) */}
      {currentWeekMilestone && (
        <Card className="border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-500 p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-blue-600">This Week</Badge>
                <h3 className="text-lg font-semibold text-blue-900">
                  Current Focus
                </h3>
              </div>
              <p className="text-sm font-medium text-blue-800">
                {currentWeekMilestone.title}
              </p>
              {currentWeekMilestone.description && (
                <p className="mt-2 text-sm text-blue-700">
                  {currentWeekMilestone.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Sections */}
      <div className="space-y-12">
        {/* Major Milestones (12mo, 6mo, 3mo, 1mo) */}
        {(['12_month', '6_month', '3_month', '1_month'] as PeriodType[]).map((periodType) => {
          const periodMilestones = groupedMilestones[periodType];
          if (periodMilestones.length === 0) return null;

          const labels: Record<string, string> = {
            '12_month': 'Year Milestone',
            '6_month': '6-Month Checkpoints',
            '3_month': 'Quarter Milestones',
            '1_month': 'Monthly Goals',
          };

          return (
            <div key={periodType} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {labels[periodType]}
              </h3>
              <div className="space-y-3 border-l-2 border-muted pl-6">
                {periodMilestones.map((milestone, index) => (
                  <TimelineNode
                    key={milestone.id}
                    title={milestone.title}
                    periodType={milestone.period_type}
                    targetDate={milestone.target_date}
                    completionPercentage={milestone.completion_percentage_target}
                    status={milestone.status}
                    isLast={index === periodMilestones.length - 1}
                    onClick={() => setSelectedMilestone(milestone)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Weekly Focus Section */}
        {groupedMilestones.weekly.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              First Month - Weekly Focus
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groupedMilestones.weekly.map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => setSelectedMilestone(milestone)}
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
                    milestone.status === 'completed' &&
                      'border-green-500 bg-green-50',
                    milestone.status === 'current' &&
                      'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20',
                    milestone.status === 'future' &&
                      'border-gray-300 bg-gray-50'
                  )}
                >
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        milestone.status === 'completed' && 'bg-green-100 text-green-700',
                        milestone.status === 'current' && 'bg-blue-100 text-blue-700',
                        milestone.status === 'future' && 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {milestone.status === 'current' ? '→ Active' : milestone.title.includes('Week') ? milestone.title.split(' - ')[0] || milestone.title : 'Week'}
                    </Badge>
                  </div>
                  <p className={cn(
                    'text-sm font-medium',
                    milestone.status === 'completed' && 'text-green-900',
                    milestone.status === 'current' && 'text-blue-900',
                    milestone.status === 'future' && 'text-gray-700'
                  )}>
                    {milestone.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(milestone.target_date).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Milestone Detail Modal */}
      <BreakdownMilestoneCard
        milestone={selectedMilestone}
        open={!!selectedMilestone}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
      />
    </div>
  );
}
