// ─── Date Utilities ────────────────────────────────────────────────────────────
import { format, parseISO, addWeeks, addDays, addMonths, isToday, isTomorrow, isThisWeek } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE, MMM d');
};

export const formatDateFull = (dateStr: string): string =>
  format(parseISO(dateStr), 'MMMM d, yyyy');

export const formatTime = (timeStr: string): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const isUpcoming = (dateStr: string): boolean =>
  parseISO(dateStr) >= new Date(new Date().toDateString());

export const isThisWeekDate = (dateStr: string): boolean =>
  isThisWeek(parseISO(dateStr), { weekStartsOn: 0 });

export const todayStr = (): string => format(new Date(), 'yyyy-MM-dd');

// Generate future recurring dates from a start date
export const generateRecurringDates = (
  startDate: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  count = 12
): string[] => {
  const dates: string[] = [];
  let current = parseISO(startDate);
  for (let i = 1; i <= count; i++) {
    if (frequency === 'weekly') current = addWeeks(current, 1);
    else if (frequency === 'biweekly') current = addWeeks(current, 2);
    else current = addMonths(current, 1);
    dates.push(format(current, 'yyyy-MM-dd'));
  }
  return dates;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  // fill leading blanks
  for (let i = 0; i < first.getDay(); i++) {
    days.push(addDays(first, -first.getDay() + i));
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
};

export { format, parseISO };
