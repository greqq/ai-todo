'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { TimeBlockDialog, TimeBlockFormData } from '@/components/calendar/TimeBlockDialog';
import { CalendarEvent, tasksToEvents, timeBlocksToEvents, CalendarTask, TimeBlock } from '@/lib/calendar/calendar-helpers';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const { toast } = useToast();

  // Fetch events when date or view changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Calculate date range based on view
      let start: string;
      let end: string;

      if (view === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        start = format(monthStart, 'yyyy-MM-dd');
        end = format(monthEnd, 'yyyy-MM-dd');
      } else if (view === 'week') {
        // Get full month to cover week view
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        start = format(monthStart, 'yyyy-MM-dd');
        end = format(monthEnd, 'yyyy-MM-dd');
      } else {
        // Day view - fetch ±7 days
        start = format(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        end = format(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      }

      const response = await fetch(`/api/calendar/events?start=${start}&end=${end}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const tasks: CalendarTask[] = data.tasks || [];
      const timeBlocks: TimeBlock[] = data.timeBlocks || [];

      // Convert to calendar events
      const taskEvents = tasksToEvents(tasks);
      const blockEvents = timeBlocksToEvents(timeBlocks);

      setEvents([...taskEvents, ...blockEvents]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setShowTimeBlockDialog(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleEventClick = (event: CalendarEvent) => {
    // TODO: Show event details dialog
    toast({
      title: event.title,
      description: `${event.type === 'task' ? 'Task' : 'Time Block'}`
    });
  };

  const handleCreateTimeBlock = async (data: TimeBlockFormData) => {
    try {
      const response = await fetch('/api/calendar/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create time block');
      }

      toast({
        title: 'Success',
        description: 'Time block created successfully'
      });

      // Refresh events
      await fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
      />

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowTimeBlockDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Time Block
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading calendar...</div>
        </div>
      ) : (
        <>
          {view === 'day' && (
            <DayView
              date={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}

          {view === 'week' && (
            <WeekView
              date={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}

          {view === 'month' && (
            <MonthView
              date={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      <TimeBlockDialog
        open={showTimeBlockDialog}
        onClose={() => setShowTimeBlockDialog(false)}
        onSave={handleCreateTimeBlock}
        initialDate={selectedDate}
        initialHour={selectedHour}
      />
    </div>
  );
}
