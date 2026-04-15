// ─── Sibling Leaderboard ──────────────────────────────────────────────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getLevel } from '../../store/types';
import Avatar from '../ui/Avatar';

const Leaderboard: React.FC = () => {
  const { children } = useAppStore();
  if (children.length < 2) return null;

  const ranked = [...children].sort((a, b) => b.xp - a.xp);

  const rankClass = (i: number) =>
    i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : '';

  const rankEmoji = (i: number) =>
    i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;

  return (
    <div style={{ marginBottom:'20px' }}>
      <h3 className="section-title" style={{ marginBottom:'10px' }}>🏆 Leaderboard</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {ranked.map((child, i) => (
          <div key={child.id} className={`leaderboard-item ${i === 0 ? 'first-place' : ''}`}>
            <div className={`rank-badge ${rankClass(i)}`}>{rankEmoji(i)}</div>
            <Avatar emoji={child.avatarEmoji} color={child.color} size="sm" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.9rem' }}>
                {child.name} {child.favoriteEmoji}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>
                Level {getLevel(child.xp)} · {child.badges.length} badges
              </div>
            </div>
            <div style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', color: i === 0 ? '#92400E' : 'var(--accent)', fontSize:'1rem' }}>
              {child.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
