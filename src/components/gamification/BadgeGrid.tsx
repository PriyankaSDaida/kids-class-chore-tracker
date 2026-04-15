// ─── Badge Trophy Shelf ────────────────────────────────────────────────────────
import React from 'react';
import { BADGE_DEFS } from '../../store/types';
import type { Child, BadgeId } from '../../store/types';

interface BadgeGridProps { child: Child; }

const ALL_BADGES = Object.values(BADGE_DEFS) as typeof BADGE_DEFS[BadgeId][];

const BadgeGrid: React.FC<BadgeGridProps> = ({ child }) => {
  const earned = new Set(child.badges);

  return (
    <div>
      <h3 style={{ fontWeight:800, fontSize:'0.95rem', fontFamily:'Nunito, sans-serif', marginBottom:'12px' }}>
        🏆 Trophy Shelf
      </h3>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
        {ALL_BADGES.map((badge) => {
          const isUnlocked = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`badge-trophy ${isUnlocked ? 'unlocked' : 'locked'}`}
              title={isUnlocked ? badge.description : '???'}
            >
              <div className="badge-emoji" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {isUnlocked ? badge.emoji : '🔒'}
              </div>
              <div className="badge-name">{isUnlocked ? badge.name : '???'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGrid;
