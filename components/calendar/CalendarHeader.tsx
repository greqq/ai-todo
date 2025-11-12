'use client';

import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentDate: Date;
  view: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(subDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(addDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getTitle = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (view === 'week') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">{getTitle()}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrevious} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={handleToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={handleNext} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onViewChange('day')}
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
        >
          Day
        </Button>
        <Button
          onClick={() => onViewChange('week')}
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
        >
          Week
        </Button>
        <Button
          onClick={() => onViewChange('month')}
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
        >
          Month
        </Button>
      </div>
    </div>
  );
}
