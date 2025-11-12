'use client';

import { format } from 'date-fns';
import { CalendarEvent, formatEventTime, getEventDuration } from '@/lib/calendar/calendar-helpers';
import { Clock, Flag } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function EventCard({ event, onClick, style }: EventCardProps) {
  const duration = getEventDuration(event);
  const isShort = duration < 30;

  return (
    <div
      className={`${event.color} text-white p-2 rounded cursor-pointer hover:opacity-90 transition-opacity overflow-hidden ${
        isShort ? 'text-xs' : 'text-sm'
      }`}
      onClick={onClick}
      style={style}
    >
      <div className="font-semibold truncate">{event.title}</div>
      {!isShort && (
        <div className="flex items-center gap-1 text-white/90 mt-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs">{formatEventTime(event)}</span>
        </div>
      )}
      {event.type === 'task' && 'priority_score' in event.data && !isShort && (
        <div className="flex items-center gap-1 text-white/90 mt-1">
          <Flag className="h-3 w-3" />
          <span className="text-xs">Priority: {event.data.priority_score}</span>
        </div>
      )}
    </div>
  );
}
