// ─── Stats Bar ─────────────────────────────────────────────────────────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

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
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
