'use client';

import { useMemo } from 'react';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import {
  CalendarEvent,
  getMonthDays,
  getEventsForDay
} from '@/lib/calendar/calendar-helpers';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthView({ date, events, onDateClick, onEventClick }: MonthViewProps) {
  const monthDays = getMonthDays(date);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header with day names */}
      <div className="grid grid-cols-7 bg-muted border-b">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-semibold border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          const dayEvents = getEventsForDay(events, day);
          const isCurrentMonth = isSameMonth(day, date);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50/50 text-muted-foreground' : ''
              }`}
              onClick={() => onDateClick?.(day)}
            >
              <div
                className={`text-sm font-semibold mb-1 ${
                  isTodayDate
                    ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                    : ''
                }`}
              >
                {format(day, 'd')}
              </div>

              {/* Event dots/indicators */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`${event.color} text-white text-xs p-1 rounded truncate hover:opacity-90`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
