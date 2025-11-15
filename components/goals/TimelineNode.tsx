'use client';

import { cn } from '@/lib/utils';
import { Check, Circle, Lock } from 'lucide-react';

export type NodeStatus = 'completed' | 'current' | 'future';
export type PeriodType = '12_month' | '6_month' | '3_month' | '1_month' | 'weekly';

interface TimelineNodeProps {
  title: string;
  periodType: PeriodType;
  targetDate: string;
  completionPercentage: number;
  status: NodeStatus;
  isLast?: boolean;
  onClick: () => void;
}

const periodTypeLabels: Record<PeriodType, string> = {
  '12_month': '12M',
  '6_month': '6M',
  '3_month': '3M',
  '1_month': '1M',
  'weekly': 'W',
};

const periodTypeColors: Record<PeriodType, string> = {
  '12_month': 'bg-purple-500',
  '6_month': 'bg-blue-500',
  '3_month': 'bg-cyan-500',
  '1_month': 'bg-green-500',
  'weekly': 'bg-yellow-500',
};

export function TimelineNode({
  title,
  periodType,
  targetDate,
  completionPercentage,
  status,
  isLast = false,
  onClick,
}: TimelineNodeProps) {
  const statusStyles = {
    completed: {
      node: 'bg-green-500 border-green-600 shadow-green-500/50',
      connector: 'bg-green-500',
      icon: Check,
      text: 'text-green-700',
    },
    current: {
      node: 'bg-blue-500 border-blue-600 shadow-blue-500/50 ring-4 ring-blue-500/20 animate-pulse',
      connector: 'bg-gradient-to-r from-green-500 to-blue-500',
      icon: Circle,
      text: 'text-blue-700',
    },
    future: {
      node: 'bg-gray-300 border-gray-400',
      connector: 'bg-gray-300',
      icon: Lock,
      text: 'text-gray-500',
    },
  };

  const style = statusStyles[status];
  const Icon = style.icon;
  const periodLabel = periodTypeLabels[periodType];
  const periodColor = periodTypeColors[periodType];

  // Format date for display
  const formattedDate = new Date(targetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative flex items-center gap-4">
      {/* Timeline Node */}
      <button
        onClick={onClick}
        className={cn(
          'relative z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 transition-all hover:scale-110',
          style.node,
          'shadow-lg'
        )}
        aria-label={`View ${title} milestone`}
      >
        <Icon className="h-6 w-6 text-white" />
        {status === 'current' && (
          <span className="mt-0.5 text-[10px] font-bold text-white">
            {completionPercentage}%
          </span>
        )}
      </button>

      {/* Milestone Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {/* Period Type Badge */}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white',
              periodColor
            )}
          >
            {periodLabel}
          </span>

          {/* Title */}
          <h4
            className={cn(
              'text-sm font-semibold',
              style.text,
              'transition-colors'
            )}
          >
            {title}
          </h4>
        </div>

        {/* Target Date */}
        <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>

        {/* Completion Percentage Bar (for current/completed) */}
        {(status === 'current' || status === 'completed') && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Connector Line to Next Node */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-8 top-16 h-12 w-0.5 -translate-x-1/2',
            style.connector
          )}
        />
      )}
    </div>
  );
}
