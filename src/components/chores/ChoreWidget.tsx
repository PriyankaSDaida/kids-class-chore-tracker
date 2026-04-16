// ─── ChoreWidget — Dashboard Mini Chore Summary ───────────────────────────────
import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { todayStr } from '../../utils/dateUtils';
import type { Chore } from '../../store/types';

const showsToday = (chore: Chore): boolean => {
  const dow = new Date().getDay();
  const createdDow = new Date(chore.createdAt).getDay();
  switch (chore.recurrence) {
    case 'daily':    return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekly':   return dow === createdDow;
    case 'once':     return true;
  }
};

const MOTIVATIONAL: (pct: number) => string = (pct) => {
  if (pct >= 0.9) return "You're almost there! 🔥";
  if (pct >= 0.6) return 'Keep going! 💪';
  if (pct >= 0.3) return 'Great start! ⭐';
  return 'Start your chores! 🎯';
};

const ChoreWidget: React.FC = () => {
  const { chores, choreCompletions, children, activeChildFilter,
          choreSettings, setScreen, completeChore } = useAppStore();

  const child = activeChildFilter
    ? children.find((c) => c.id === activeChildFilter)
    : children[0];

  if (!child || chores.length === 0) return null;

  const today   = todayStr();
  const { pointsPerHeart } = choreSettings;
  const pts     = child.points ?? 0;
  const pct     = Math.min(1, Math.max(0, pts) / pointsPerHeart);
  const ptsLeft = Math.max(0, pointsPerHeart - Math.max(0, pts));

  const todayChores = chores
    .filter((c) =>
      c.isActive && showsToday(c) &&
      (c.assignedChildId === 'all' || c.assignedChildId === child.id)
    )
    .slice(0, 6);

  const pendingChores = todayChores.filter((c) => {
    if (c.recurrence === 'once') {
      return !choreCompletions.some((cc) => cc.choreId === c.id && cc.childId === child.id);
    }
    return !choreCompletions.some((cc) => cc.choreId === c.id && cc.childId === child.id && cc.date === today);
  }).slice(0, 4);

  const doneCount   = todayChores.length - pendingChores.length;
  const totalToday  = todayChores.length;

  return (
    <div className="card" style={{ padding:16, marginBottom:16 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom:10 }}>
        <h2 className="section-title">
          <CheckSquare size={16} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }}/>
          Chores Today
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setScreen('chores')} id="widget-view-all">
          View all
        </button>
      </div>

      {/* Points/Hearts/Stars row */}
      <div className="chore-pts-row" style={{ marginBottom:10 }}>
        <span title="Points" style={{ color:'var(--accent)' }}>🎯 {pts}</span>
        <span style={{ color:'var(--text-muted)', fontSize:'0.7rem' }}>·</span>
        <span title="Hearts" style={{ color:'#EC4899' }}>❤️ {child.hearts}</span>
        <span style={{ color:'var(--text-muted)', fontSize:'0.7rem' }}>·</span>
        <span title="Stars" style={{ color:'var(--amber)' }}>⭐ {child.stars}</span>
        {totalToday > 0 && (
          <>
            <span style={{ color:'var(--text-muted)', fontSize:'0.7rem', marginLeft:'auto' }}>·</span>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>
              {doneCount}/{totalToday} done
            </span>
          </>
        )}
      </div>

      {/* Progress bar to next heart */}
      <div className="points-bar-track" style={{ marginBottom:4, position: 'relative', overflow: 'hidden' }}>
        <div className="points-bar-fill widget-shimmer" style={{ width:`${pct * 100}%`, transition: 'width 0.9s var(--ease-spring)' }}/>
      </div>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:12, fontWeight:600 }}>
        {ptsLeft > 0
          ? `${MOTIVATIONAL(pct)} ${ptsLeft} pts to next ❤️`
          : '❤️ Heart milestone reached!'}
      </div>

      {/* Pending chore list */}
      {pendingChores.length === 0 ? (
        <div style={{ textAlign:'center', padding:'12px 0', color:'var(--green)', fontWeight:800, fontSize:'0.85rem', fontFamily:'Nunito, sans-serif' }}>
          ✓ All chores done! Amazing job! 🎉
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {pendingChores.map((c) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', background:'var(--bg-tertiary)', borderRadius:'var(--r-md)' }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{c.icon}</span>
              <span style={{ flex:1, fontSize:'0.82rem', fontWeight:700, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {c.name}
              </span>
              <span style={{
                fontSize:'0.72rem', fontWeight:900, fontFamily:'Nunito, sans-serif',
                color: c.points > 0 ? 'var(--green)' : 'var(--red)',
                flexShrink:0,
              }}>
                {c.points > 0 ? '+' : ''}{c.points}
              </span>
              <button
                className="btn btn-sm btn-primary"
                style={{ height:26, padding:'0 8px', fontSize:'0.68rem', flexShrink:0 }}
                onClick={() => completeChore(c.id, child.id, today)}
                id={`widget-done-${c.id}`}
              >
                ✓
              </button>
            </div>
          ))}
          {totalToday > 4 && (
            <button className="btn btn-ghost btn-sm w-full" onClick={() => setScreen('chores')} id="widget-see-more">
              +{totalToday - 4} more chores →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChoreWidget;
