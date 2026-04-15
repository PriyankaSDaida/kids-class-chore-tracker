// ─── Animated Streak Flame ─────────────────────────────────────────────────────
import React from 'react';

interface StreakFlameProps { streak: number; size?: 'sm' | 'md' | 'lg'; }

const StreakFlame: React.FC<StreakFlameProps> = ({ streak, size = 'md' }) => {
  if (streak < 2) return null;

  const fontSize = size === 'sm' ? '1rem' : size === 'lg' ? '2rem' : '1.5rem';

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
      <span className="streak-flame" style={{ fontSize }}>🔥</span>
      <span style={{
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        fontWeight:900, fontFamily:'Nunito, sans-serif',
        color:'var(--red)',
      }}>
        {streak}
      </span>
    </div>
  );
};

export default StreakFlame;
