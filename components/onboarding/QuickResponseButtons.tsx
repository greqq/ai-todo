/**
 * QuickResponseButtons Component
 *
 * Provides quick action buttons for the Life Reset interview
 * - "I don't know" button
 * - "Skip this question" button
 * - "Save and resume later" button (future)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, SkipForward, Save } from 'lucide-react';

interface QuickResponseButtonsProps {
  onIDontKnow: () => void;
  onSkip: () => void;
  onSaveForLater?: () => void;
  disabled?: boolean;
  showSaveForLater?: boolean;
}

export function QuickResponseButtons({
  onIDontKnow,
  onSkip,
  onSaveForLater,
  disabled = false,
  showSaveForLater = false,
}: QuickResponseButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-muted-foreground">Quick actions:</p>

      {/* I don't know button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onIDontKnow}
        disabled={disabled}
        className="gap-1.5"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>I don't know</span>
      </Button>

      {/* Skip button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSkip}
        disabled={disabled}
        className="gap-1.5"
      >
        <SkipForward className="h-3.5 w-3.5" />
        <span>Skip this question</span>
      </Button>

      {/* Save for later button (optional, future enhancement) */}
      {showSaveForLater && onSaveForLater && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveForLater}
          disabled={disabled}
          className="gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save & resume later</span>
        </Button>
      )}
    </div>
  );
}
