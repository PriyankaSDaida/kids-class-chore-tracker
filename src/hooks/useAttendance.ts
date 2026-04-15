// ─── Attendance Analytics ──────────────────────────────────────────────────────
import { subDays } from 'date-fns';
import { parseISO } from '../utils/dateUtils';
import type { AttendanceRecord } from '../store/types';

/**
 * Returns the current attendance streak (consecutive attended sessions)
 * for a given class, ordered chronologically.
 */
export const getStreak = (records: AttendanceRecord[]): number => {
  const sorted = [...records]
    .filter((r) => r.status !== 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  let streak = 0;
  for (const r of sorted) {
    if (r.status === 'attended') streak++;
    else break;
  }
  return streak;
};

/**
 * Returns attendance percentage over last 30 days (excludes cancelled).
 */
export const getAttendancePercent = (records: AttendanceRecord[]): number => {
  const cutoff = subDays(new Date(), 30);
  const recent = records.filter(
    (r) => r.status !== 'cancelled' && parseISO(r.date) >= cutoff
  );
  if (recent.length === 0) return 0;
  const attended = recent.filter((r) => r.status === 'attended').length;
  return Math.round((attended / recent.length) * 100);
};
