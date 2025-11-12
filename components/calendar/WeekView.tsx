'use client';

import { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import {
  CalendarEvent,
  getWeekDays,
  generateHourSlots,
  getEventsForDay,
  calculateEventPosition,
  layoutOverlappingEvents
} from '@/lib/calendar/calendar-helpers';
import { EventCard } from './EventCard';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekView({ date, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const weekDays = getWeekDays(date);
  const hourSlots = generateHourSlots();

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b bg-muted">
        <div className="p-2 border-r"></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-2 text-center border-r last:border-r-0 ${
              isToday(day) ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <div className="text-sm font-semibold">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="relative overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div style={{ height: '1440px' }}> {/* 24 hours * 60px */}
          {/* Hour labels and grid */}
          {hourSlots.map((hour, hourIndex) => (
            <div
              key={hour}
              className="absolute w-full border-b border-gray-200"
              style={{
                top: `${hourIndex * 60}px`,
                height: '60px'
              }}
            >
              <div className="grid grid-cols-8 h-full">
                <div className="p-2 text-sm text-muted-foreground border-r">
                  {hour}
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border-r last:border-r-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTimeSlotClick?.(day, hourIndex)}
                  ></div>
                ))}
              </div>
            </div>
          ))}

          {/* Events for each day */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(events, day);
            const layoutedEvents = layoutOverlappingEvents(dayEvents);

            return (
              <div
                key={day.toISOString()}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${((dayIndex + 1) / 8) * 100}%`,
                  width: `${(1 / 8) * 100}%`
                }}
              >
                {layoutedEvents.map((event) => {
                  const position = calculateEventPosition(event, day);
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
