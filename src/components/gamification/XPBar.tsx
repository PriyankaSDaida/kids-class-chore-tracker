// ─── XP Progress Bar ──────────────────────────────────────────────────────────
import React from 'react';
import { getLevelProgress, getLevel, getXPInLevel, XP_PER_LEVEL } from '../../store/types';
import type { Child } from '../../store/types';

interface XPBarProps { child: Child; compact?: boolean; }

const XPBar: React.FC<XPBarProps> = ({ child, compact = false }) => {
  const level    = getLevel(child.xp);
  const xpIn     = getXPInLevel(child.xp);
  const progress = getLevelProgress(child.xp);

  return (
    <div>
      {!compact && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
          <span style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.85rem' }}>
            ⚡ Level {level}
          </span>
          <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>
            {xpIn} / {XP_PER_LEVEL} XP to next level
          </span>
        </div>
      )}
      <div className="xp-track">
        <div
          className="xp-fill"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${child.color}, ${child.color}CC)`,
          }}
        />
      </div>
      {compact && (
        <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'4px', fontWeight:600 }}>
          Lv.{level} · {child.xp} XP
        </div>
      )}
    </div>
  );
};

export default XPBar;
