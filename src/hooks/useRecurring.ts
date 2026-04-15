// ─── Recurring Class Generator ────────────────────────────────────────────────
import { generateRecurringDates } from '../utils/dateUtils';
import type { ClassSession, RecurringFrequency } from '../store/types';

/**
 * Given a base class definition, generate N recurring instances.
 * All share a recurringGroupId for bulk edit/delete.
 */
export const buildRecurringInstances = (
  base: ClassSession,
  frequency: Exclude<RecurringFrequency, 'one-time'>,
  count = 12
): ClassSession[] => {
  const dates = generateRecurringDates(base.date, frequency, count);
  return dates.map((date) => ({
    ...base,
    id: crypto.randomUUID(),
    date,
    status: 'upcoming' as const,
    isRescheduled: false,
    originalDate: null,
    rescheduleReason: '',
    createdAt: new Date().toISOString(),
  }));
};
