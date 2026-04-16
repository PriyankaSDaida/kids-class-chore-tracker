// ─── Live Countdown Timer ─────────────────────────────────────────────────────
// Returns a formatted string like "Starts in 2h 30m" updated every minute
import { useState, useEffect, useMemo } from 'react';

interface CountdownResult {
  label: string;
  isToday: boolean;
  isUrgent: boolean;  // < 30 min away
  isStarted: boolean;
}

// nowMs is kept in state, updated by setInterval — never called during render
export const useCountdown = (date: string, time: string): CountdownResult => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [date, time]);

  return useMemo((): CountdownResult => {
    // Derive today's date string from nowMs (pure given nowMs)
    const today = new Date(nowMs).toISOString().slice(0, 10);
    const [h, m] = time.split(':').map(Number);
    const target = new Date(`${date}T00:00:00`);
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - nowMs;
    const isToday = date === today;

    if (diff <= 0) return { label: 'Started ✅', isToday, isUrgent: false, isStarted: true };

    const totalMins = Math.floor(diff / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins  = totalMins % 60;

    if (!isToday) return { label: '', isToday: false, isUrgent: false, isStarted: false };

    let label = '';
    if (hours > 0)     label = `Starts in ${hours}h ${mins}m`;
    else if (mins > 0) label = `Starts in ${mins}m`;
    else               label = 'Starting soon! 🎉';

    return { label, isToday, isUrgent: totalMins < 30, isStarted: false };
  }, [date, time, nowMs]);
};
