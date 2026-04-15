// ─── Live Countdown Timer ─────────────────────────────────────────────────────
// Returns a formatted string like "Starts in 2h 30m" updated every minute
import { useState, useEffect } from 'react';
import { todayStr } from '../utils/dateUtils';

interface CountdownResult {
  label: string;
  isToday: boolean;
  isUrgent: boolean;  // < 30 min away
  isStarted: boolean;
}

export const useCountdown = (date: string, time: string): CountdownResult => {
  const compute = (): CountdownResult => {
    const [h, m] = time.split(':').map(Number);
    const target = new Date(`${date}T00:00:00`);
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - Date.now();
    const isToday = date === todayStr();

    if (diff <= 0) return { label: 'Started ✅', isToday, isUrgent: false, isStarted: true };

    const totalMins = Math.floor(diff / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins  = totalMins % 60;

    let label = '';
    if (!isToday) return { label: '', isToday: false, isUrgent: false, isStarted: false };
    if (hours > 0)    label = `Starts in ${hours}h ${mins}m`;
    else if (mins > 0) label = `Starts in ${mins}m`;
    else label = 'Starting soon! 🎉';

    return { label, isToday, isUrgent: totalMins < 30, isStarted: false };
  };

  const [result, setResult] = useState<CountdownResult>(compute);

  useEffect(() => {
    setResult(compute());
    const interval = setInterval(() => setResult(compute()), 60_000);
    return () => clearInterval(interval);
  }, [date, time]);

  return result;
};
