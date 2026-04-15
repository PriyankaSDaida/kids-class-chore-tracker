// ─── Web Notifications ─────────────────────────────────────────────────────────
import type { ClassSession } from '../store/types';
import { formatTime, formatDate } from '../utils/dateUtils';

/** Request browser notification permission */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const reminderMs: Record<string, number> = {
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '1day':  24 * 60 * 60 * 1000,
};

/**
 * Schedule a browser notification for an upcoming class.
 * Uses setTimeout for short-lived reminders (within current session).
 */
export const scheduleReminder = (cls: ClassSession, childName: string): void => {
  if (cls.remindBefore === 'none') return;
  const offset = reminderMs[cls.remindBefore] ?? 0;
  if (offset === 0) return;

  const [h, m] = cls.time.split(':').map(Number);
  const classTime = new Date(cls.date);
  classTime.setHours(h, m, 0, 0);
  const fireAt = classTime.getTime() - offset;
  const delay = fireAt - Date.now();

  if (delay <= 0) return; // already past

  setTimeout(async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      new Notification(`🎒 Class Reminder — ${cls.name}`, {
        body: `${childName}'s ${cls.name} starts at ${formatTime(cls.time)} on ${formatDate(cls.date)}`,
        icon: '/favicon.ico',
      });
    }
  }, delay);
};
