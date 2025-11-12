import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  startOfDay,
  endOfDay,
  parseISO,
  isWithinInterval,
  areIntervalsOverlapping
} from 'date-fns';

export interface CalendarTask {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  goal_id?: string;
  priority_score: number;
  energy_required: string;
  task_type: string;
  eisenhower_quadrant?: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  block_type: 'work' | 'personal' | 'focus' | 'buffer' | 'meeting' | 'break';
  is_protected: boolean;
  task_id?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'time_block';
  data: CalendarTask | TimeBlock;
  color?: string;
}

// Get week range for a given date
export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

// Get month range for a given date
export function getMonthRange(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return { start, end };
}

// Get all days in a week
export function getWeekDays(date: Date) {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end });
}

// Get all days in a month (including padding for calendar grid)
export function getMonthDays(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  // Get first day of month's day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = start.getDay();
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start

  // Calculate padding days from previous month
  const calendarStart = addDays(start, -daysFromPrevMonth);

  // Calculate how many days we need to show (always show complete weeks)
  const daysInMonth = end.getDate();
  const totalDays = daysFromPrevMonth + daysInMonth;
  const weeksNeeded = Math.ceil(totalDays / 7);
  const totalCells = weeksNeeded * 7;

  const calendarEnd = addDays(calendarStart, totalCells - 1);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

// Convert tasks to calendar events
export function tasksToEvents(tasks: CalendarTask[]): CalendarEvent[] {
  return tasks
    .filter(task => task.scheduled_start && task.scheduled_end)
    .map(task => ({
      id: task.id,
      title: task.title,
      start: parseISO(task.scheduled_start),
      end: parseISO(task.scheduled_end),
      type: 'task' as const,
      data: task,
      color: getTaskColor(task)
    }));
}

// Convert time blocks to calendar events
export function timeBlocksToEvents(blocks: TimeBlock[]): CalendarEvent[] {
  return blocks.map(block => ({
    id: block.id,
    title: block.title,
    start: parseISO(block.start_time),
    end: parseISO(block.end_time),
    type: 'time_block' as const,
    data: block,
    color: getBlockColor(block)
  }));
}

// Get color for task based on priority and type
function getTaskColor(task: CalendarTask): string {
  // Priority-based colors
  if (task.priority_score >= 80) return 'bg-red-500';
  if (task.priority_score >= 60) return 'bg-orange-500';
  if (task.priority_score >= 40) return 'bg-yellow-500';
  return 'bg-blue-500';
}

// Get color for time block based on type
function getBlockColor(block: TimeBlock): string {
  const colors: Record<TimeBlock['block_type'], string> = {
    work: 'bg-blue-500',
    personal: 'bg-green-500',
    focus: 'bg-purple-500',
    buffer: 'bg-gray-400',
    meeting: 'bg-indigo-500',
    break: 'bg-teal-500'
  };
  return colors[block.block_type] || 'bg-gray-500';
}

// Check if two events overlap
export function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return areIntervalsOverlapping(
    { start: event1.start, end: event1.end },
    { start: event2.start, end: event2.end },
    { inclusive: false }
  );
}

// Get events for a specific day
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return events.filter(event =>
    isWithinInterval(event.start, { start: dayStart, end: dayEnd }) ||
    isWithinInterval(event.end, { start: dayStart, end: dayEnd }) ||
    (event.start < dayStart && event.end > dayEnd)
  );
}

// Generate hour slots for day view (e.g., 00:00, 01:00, ... 23:00)
export function generateHourSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );
}

// Calculate event position in day view (percentage from top)
export function calculateEventPosition(event: CalendarEvent, day: Date): {
  top: number;
  height: number;
  left: number;
  width: number;
} {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  // Clamp event times to day boundaries
  const eventStart = event.start < dayStart ? dayStart : event.start;
  const eventEnd = event.end > dayEnd ? dayEnd : event.end;

  // Calculate minutes from start of day
  const startMinutes = (eventStart.getTime() - dayStart.getTime()) / (1000 * 60);
  const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);

  // Convert to percentage (24 hours = 100%)
  const top = (startMinutes / (24 * 60)) * 100;
  const height = (durationMinutes / (24 * 60)) * 100;

  return {
    top,
    height,
    left: 0,
    width: 100
  };
}

// Group overlapping events for layout
export function layoutOverlappingEvents(events: CalendarEvent[]): Array<CalendarEvent & { column: number; columnCount: number }> {
  if (events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Group overlapping events
  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [sortedEvents[0]];

  for (let i = 1; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const lastInGroup = currentGroup[currentGroup.length - 1];

    if (eventsOverlap(event, lastInGroup)) {
      currentGroup.push(event);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
    }
  }
  groups.push(currentGroup);

  // Assign columns to events
  return sortedEvents.map(event => {
    const group = groups.find(g => g.includes(event))!;
    const column = group.indexOf(event);
    return {
      ...event,
      column,
      columnCount: group.length
    };
  });
}

// Format time for display
export function formatEventTime(event: CalendarEvent): string {
  return `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`;
}

// Calculate duration in minutes
export function getEventDuration(event: CalendarEvent): number {
  return (event.end.getTime() - event.start.getTime()) / (1000 * 60);
}

// Check if a time slot is available
export function isTimeSlotAvailable(
  start: Date,
  end: Date,
  existingEvents: CalendarEvent[],
  excludeEventId?: string
): boolean {
  const newEvent = { start, end };
  return !existingEvents
    .filter(e => e.id !== excludeEventId)
    .some(e => areIntervalsOverlapping(
      { start: e.start, end: e.end },
      newEvent,
      { inclusive: false }
    ));
}
