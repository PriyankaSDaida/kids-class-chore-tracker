// ─── Stats Bar ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) return;

    let totalDuration = 600;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / totalDuration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + (end - start) * easeProgress));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{display}</>;
};

const StatsBar: React.FC = () => {
  const { classes, activeChildFilter } = useAppStore();

  const visible = activeChildFilter
    ? classes.filter((c) => c.childId === activeChildFilter)
    : classes;

  const total    = visible.length;
  const attended = visible.filter((c) => c.status === 'attended').length;
  const upcoming = visible.filter((c) => c.status === 'upcoming' || c.status === 'rescheduled').length;
  const missed   = visible.filter((c) => c.status === 'missed').length;

  const stats = [
    { label: 'Total',    value: total,    color: 'var(--accent)' },
    { label: 'Done',     value: attended, color: 'var(--green)'  },
    { label: 'Upcoming', value: upcoming, color: 'var(--blue)'   },
    { label: 'Missed',   value: missed,   color: 'var(--red)'    },
  ];

  return (
    <div className="stats-bar stagger" style={{ marginBottom: '16px' }}>
      {stats.map(({ label, value, color }) => (
        <div key={label} className="stat-chip anim-slideUp">
          <div className="stat-value" style={{ color }}><AnimatedNumber value={value} /></div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
