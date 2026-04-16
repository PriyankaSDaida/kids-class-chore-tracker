// ─── Badge Earned Celebration Modal ───────────────────────────────────────────
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BADGE_DEFS } from '../../store/types';
import ConfettiEffect from './ConfettiEffect';
import { useSound } from '../../hooks/useSound';

const BadgeCelebration: React.FC = () => {
  const { newlyEarnedBadge, clearNewBadge } = useAppStore();
  const { playFanfare } = useSound();

  useEffect(() => {
    if (newlyEarnedBadge) playFanfare();
  }, [newlyEarnedBadge, playFanfare]);

  if (!newlyEarnedBadge) return null;
  const badge = BADGE_DEFS[newlyEarnedBadge];

  return (
    <>
      <ConfettiEffect />
      <div
        className="modal-backdrop"
        style={{ alignItems:'center', zIndex: 10000 }}
        onClick={clearNewBadge}
      >
        <div
          className="confirm-panel anim-scaleIn"
          style={{ textAlign:'center', borderTop:`4px solid ${badge.color}`, zIndex: 10001 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="anim-badgePop" style={{ fontSize:'5rem', marginBottom:'8px' }}>
            {badge.emoji}
          </div>
          <div style={{
            display:'inline-block', padding:'4px 16px',
            background: badge.color + '22', borderRadius:'999px',
            color: badge.color, fontWeight:800, fontSize:'0.75rem',
            marginBottom:'12px', fontFamily:'Nunito, sans-serif', letterSpacing:'0.06em',
          }}>
            NEW BADGE UNLOCKED!
          </div>
          <div style={{ fontSize:'1.5rem', fontWeight:900, fontFamily:'Nunito, sans-serif', marginBottom:'6px' }}>
            {badge.name}
          </div>
          <div style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:'24px' }}>
            {badge.description}
          </div>
          <button className="btn btn-primary w-full" onClick={clearNewBadge} id="btn-badge-ok">
            Awesome! 🎉
          </button>
        </div>
      </div>
    </>
  );
};

export default BadgeCelebration;
