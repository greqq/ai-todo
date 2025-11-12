'use client';

import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import {
  CalendarEvent,
  generateHourSlots,
  getEventsForDay,
  calculateEventPosition,
  layoutOverlappingEvents
} from '@/lib/calendar/calendar-helpers';
import { EventCard } from './EventCard';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function DayView({ date, events, onEventClick, onTimeSlotClick }: DayViewProps) {
  const hourSlots = generateHourSlots();
  const dayEvents = useMemo(() => getEventsForDay(events, date), [events, date]);
  const layoutedEvents = useMemo(() => layoutOverlappingEvents(dayEvents), [dayEvents]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-muted p-4 border-b">
        <div className="font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</div>
      </div>

      {/* Time slots */}
      <div className="relative" style={{ height: '1440px' }}> {/* 24 hours * 60px */}
        {/* Hour labels and grid lines */}
        {hourSlots.map((hour, index) => (
          <div
            key={hour}
            className="absolute w-full border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            style={{
              top: `${index * 60}px`,
              height: '60px'
            }}
            onClick={() => onTimeSlotClick?.(date, index)}
          >
            <div className="flex">
              <div className="w-20 p-2 text-sm text-muted-foreground">{hour}</div>
              <div className="flex-1 relative"></div>
            </div>
          </div>
        ))}

        {/* Events */}
        <div className="absolute left-20 right-0 top-0 bottom-0">
          {layoutedEvents.map((event) => {
            const position = calculateEventPosition(event, date);
            const width = 100 / event.columnCount;
            const left = event.column * width;

            return (
              <div
                key={event.id}
                className="absolute"
                style={{
                  top: `${position.top}%`,
                  height: `${position.height}%`,
                  left: `${left}%`,
                  width: `${width}%`,
                  padding: '2px'
                }}
              >
                <EventCard
                  event={event}
                  onClick={() => onEventClick?.(event)}
                  style={{ height: '100%' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
