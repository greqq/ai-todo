/**
 * PhaseProgress Component
 *
 * Displays progress through the 5-phase Life Reset interview
 * Shows current phase, progress bar, and estimated time remaining
 */

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { PhaseDefinition } from '@/types/life-reset.types';

interface PhaseProgressProps {
  currentPhase: number;
  phases: PhaseDefinition[];
  estimatedTimeRemaining?: number; // in minutes
}

export function PhaseProgress({
  currentPhase,
  phases,
  estimatedTimeRemaining,
}: PhaseProgressProps) {
  const totalPhases = phases.length;
  const progressPercentage = (currentPhase / totalPhases) * 100;
  const currentPhaseData = phases[currentPhase - 1];

  return (
    <div className="w-full space-y-4">
      {/* Header with current phase and time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentPhaseData?.icon}</span>
          <div>
            <h2 className="text-lg font-semibold">
              Phase {currentPhase} of {totalPhases}: {currentPhaseData?.name}
            </h2>
            <p className="text-sm text-muted-foreground">{currentPhaseData?.description}</p>
          </div>
        </div>
        {estimatedTimeRemaining !== undefined && (
          <div className="text-right">
            <p className="text-sm font-medium">{estimatedTimeRemaining} min remaining</p>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const phaseNumber = index + 1;
          const isCompleted = phaseNumber < currentPhase;
          const isCurrent = phaseNumber === currentPhase;
          const isFuture = phaseNumber > currentPhase;

          return (
            <div
              key={phase.id}
              className="flex flex-col items-center gap-1"
            >
              {/* Phase circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{phaseNumber}</span>
                )}
              </div>

              {/* Phase name (show on desktop only) */}
              <div className="hidden flex-col items-center sm:flex">
                <p
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {phase.name}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground">
                    ~{phase.estimatedMinutes} min
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Show current phase name */}
      <div className="block text-center sm:hidden">
        <p className="text-sm font-medium text-primary">
          {currentPhaseData?.name} (~{currentPhaseData?.estimatedMinutes} min)
        </p>
      </div>
    </div>
  );
}
