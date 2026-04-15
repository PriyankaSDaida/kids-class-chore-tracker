// ─── SVG Weekly Progress Ring ──────────────────────────────────────────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const WeeklyRing: React.FC = () => {
  const { classes, attendanceRecords, activeChildFilter } = useAppStore();
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd   = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const weekClasses = classes.filter((c) => {
    const inWeek = c.date >= weekStart && c.date <= weekEnd && c.status !== 'cancelled';
    return activeChildFilter ? (inWeek && c.childId === activeChildFilter) : inWeek;
  });

  const attended = weekClasses.filter((c) =>
    attendanceRecords.some((r) => r.classId === c.id && r.status === 'attended')
  ).length;

  const total     = weekClasses.length;
  const progress  = total > 0 ? attended / total : 0;

  const R = 40;
  const circumference = 2 * Math.PI * R;
  const dashoffset    = circumference * (1 - progress);

  return (
    <div className="card" style={{ padding:'16px', display:'flex', alignItems:'center', gap:'16px' }}>
      {/* Ring */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width="100" height="100" className="weekly-ring-svg">
          {/* Background track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="9"/>
          {/* Filled progress */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition:'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)', animation:'ringFill 1.2s ease both' }}
          />
        </svg>
        <div style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ fontSize:'1.4rem', fontWeight:900, fontFamily:'Nunito, sans-serif', color:'var(--accent)' }}>
            {attended}
          </div>
          <div style={{ fontSize:'0.6rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            of {total}
          </div>
        </div>
      </div>

      {/* Text info */}
      <div>
        <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:'4px' }}>
          This Week
        </div>
        <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>
          {attended === total && total > 0
            ? '🌟 Perfect week!'
            : `${total - attended} class${total - attended !== 1 ? 'es' : ''} to go`}
        </div>
        <div style={{
          display:'flex', gap:'6px', marginTop:'8px', flexWrap:'wrap',
        }}>
          {weekClasses.map((cls_) => {
            const done = attendanceRecords.some((r) => r.classId === cls_.id && r.status === 'attended');
            return (
              <div key={cls_.id} style={{
                width:'8px', height:'8px', borderRadius:'50%',
                background: done ? 'var(--accent)' : 'var(--border)',
                transition:'background 0.3s',
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyRing;
