'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PeriodType, NodeStatus } from './TimelineNode';

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  period_type: PeriodType;
  target_date: string;
  completion_percentage_target: number;
  key_deliverables: string[];
  completed: boolean;
  status: NodeStatus;
}

interface BreakdownMilestoneCardProps {
  milestone: MilestoneData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const periodTypeLabels: Record<PeriodType, string> = {
  '12_month': '12-Month Milestone',
  '6_month': '6-Month Milestone',
  '3_month': '3-Month Milestone',
  '1_month': '1-Month Milestone',
  'weekly': 'Weekly Focus',
};

const periodTypeColors: Record<PeriodType, string> = {
  '12_month': 'bg-purple-100 text-purple-800 border-purple-300',
  '6_month': 'bg-blue-100 text-blue-800 border-blue-300',
  '3_month': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  '1_month': 'bg-green-100 text-green-800 border-green-300',
  'weekly': 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export function BreakdownMilestoneCard({
  milestone,
  open,
  onOpenChange,
}: BreakdownMilestoneCardProps) {
  if (!milestone) return null;

  const periodLabel = periodTypeLabels[milestone.period_type];
  const periodColorClass = periodTypeColors[milestone.period_type];

  const formattedDate = new Date(milestone.target_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statusInfo = {
    completed: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Completed',
      icon: CheckCircle2,
    },
    current: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'In Progress',
      icon: Target,
    },
    future: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Upcoming',
      icon: Circle,
    },
  };

  const info = statusInfo[milestone.status];
  const StatusIcon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('border', periodColorClass)}
                >
                  {periodLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('border', info.bgColor, info.color)}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {info.label}
                </Badge>
              </div>
              <DialogTitle className="text-2xl">{milestone.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {milestone.description && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Description
              </h4>
              <p className="text-sm text-muted-foreground">
                {milestone.description}
              </p>
            </div>
          )}

          {/* Target Date */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Target Date
              </p>
              <p className="text-sm font-semibold">{formattedDate}</p>
            </div>
          </div>

          {/* Completion Target */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                Completion Target
              </p>
              <p className="text-sm font-semibold">
                {milestone.completion_percentage_target}% of total goal
              </p>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  milestone.status === 'completed'
                    ? 'bg-green-500'
                    : milestone.status === 'current'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                )}
                style={{
                  width: `${milestone.completion_percentage_target}%`,
                }}
              />
            </div>
          </div>

          {/* Key Deliverables */}
          {milestone.key_deliverables && milestone.key_deliverables.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Key Deliverables
              </h4>
              <ul className="space-y-2">
                {milestone.key_deliverables.map((deliverable, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm"
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                        milestone.completed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="flex-1 leading-relaxed">
                      {deliverable}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status Message */}
          <div
            className={cn(
              'rounded-lg border-l-4 p-4',
              milestone.status === 'completed'
                ? 'border-green-500 bg-green-50'
                : milestone.status === 'current'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-400 bg-gray-50'
            )}
          >
            <p className="text-sm font-medium">
              {milestone.status === 'completed' && (
                <span className="text-green-700">
                  🎉 Milestone completed! Great progress toward your goal.
                </span>
              )}
              {milestone.status === 'current' && (
                <span className="text-blue-700">
                  💪 You&apos;re currently working on this milestone. Keep going!
                </span>
              )}
              {milestone.status === 'future' && (
                <span className="text-gray-700">
                  🔮 This milestone is coming up. Focus on your current objectives first.
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
