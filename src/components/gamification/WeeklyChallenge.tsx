// ─── Weekly Challenge Card ─────────────────────────────────────────────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const WeeklyChallenge: React.FC = () => {
  const { classes, attendanceRecords, activeChildFilter } = useAppStore();
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd   = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const weekClasses = classes.filter((c) => {
    const inWeek = c.date >= weekStart && c.date <= weekEnd && c.status !== 'cancelled';
    return activeChildFilter ? (inWeek && c.childId === activeChildFilter) : inWeek;
  });

  const GOAL = Math.max(3, weekClasses.length);
  const attended = weekClasses.filter((c) =>
    attendanceRecords.some((r) => r.classId === c.id && r.status === 'attended')
  ).length;

  const progress  = Math.min(attended / GOAL, 1);
  const completed = attended >= GOAL;

  if (weekClasses.length === 0) return null;

  return (
    <div className="challenge-card anim-slideUp" style={{ marginBottom:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <div>
          <div style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', color:'var(--accent)' }}>
            ⚔️ Weekly Quest
          </div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'2px' }}>
            {completed ? '🏆 Quest complete! Amazing work!' : `Attend ${GOAL} classes this week for a gold star ⭐`}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'1.6rem', fontWeight:900, fontFamily:'Nunito, sans-serif', color: completed ? '#F59E0B' : 'var(--accent)' }}>
            {completed ? '⭐' : `${attended}/${GOAL}`}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background:'rgba(255,255,255,0.5)', borderRadius:'999px', height:'10px', overflow:'hidden' }}>
        <div style={{
          width:`${progress * 100}%`,
          height:'100%',
          borderRadius:'999px',
          background: completed
            ? 'linear-gradient(90deg, #F59E0B, #F97316)'
            : 'linear-gradient(90deg, var(--accent), #EC4899)',
          transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: completed ? '0 0 8px rgba(245,158,11,0.5)' : '0 0 8px var(--accent-glow)',
        }} />
      </div>

      {/* Check marks for each class */}
      <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
        {weekClasses.map((cls, i) => {
          const done = attendanceRecords.some((r) => r.classId === cls.id && r.status === 'attended');
          return (
            <div key={cls.id} style={{
              width:'28px', height:'28px', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              background: done ? '#10B981' : 'rgba(255,255,255,0.5)',
              border: done ? '2px solid #059669' : '2px dashed rgba(124,58,237,0.3)',
              fontSize:'0.9rem',
              transition:'all 0.3s',
            }}>
              {done ? '✓' : i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChallenge;
