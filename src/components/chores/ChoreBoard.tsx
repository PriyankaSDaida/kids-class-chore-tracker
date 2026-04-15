// ─── ChoreBoard — Main Chore Screen ───────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { todayStr } from '../../utils/dateUtils';
import { CHORE_CAT_CONFIG } from '../../store/types';
import type { Chore, ChoreCategory } from '../../store/types';
import ChoreCard from './ChoreCard';
import ChoreForm from './ChoreForm';

const ALL_CATS = Object.keys(CHORE_CAT_CONFIG) as ChoreCategory[];

// Utility: should a chore show today based on its recurrence?
const showsToday = (chore: Chore): boolean => {
  const dow = new Date().getDay();          // 0=Sun,6=Sat
  const createdDow = new Date(chore.createdAt).getDay();
  switch (chore.recurrence) {
    case 'daily':    return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekly':   return dow === createdDow;
    case 'once':     return true;           // shown until completed (permanently)
  }
};

const ChoreBoard: React.FC = () => {
  const {
    chores, choreCompletions, children,
    activeChildFilter, setActiveChildFilter,
    resetTodayChores, choreSettings,
  } = useAppStore();

  const today = todayStr();

  // Local state
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [catFilter,    setCatFilter]    = useState<ChoreCategory | ''>('');
  const [showReset,    setShowReset]    = useState(false);

  // Selected child (default to first)
  const selectedChildId = activeChildFilter || children[0]?.id || '';
  const selectedChild   = children.find((c) => c.id === selectedChildId);

  // Points progress
  const { pointsPerHeart } = choreSettings;
  const pts         = selectedChild?.points ?? 0;
  const pctToHeart  = Math.min(1, Math.max(0, pts) / pointsPerHeart);
  const ptsToNext   = Math.max(0, pointsPerHeart - Math.max(0, pts));

  // Filter chores for today
  const visibleChores = useMemo(() => chores.filter((c) => {
    if (!c.isActive) return false;
    if (c.assignedChildId !== 'all' && c.assignedChildId !== selectedChildId) return false;
    if (catFilter && c.category !== catFilter) return false;
    if (!showsToday(c)) return false;
    // Hide one-time chores already done by this child
    if (c.recurrence === 'once') {
      const done = choreCompletions.some((cc) => cc.choreId === c.id && cc.childId === selectedChildId);
      if (done) return false;
    }
    return true;
  }), [chores, selectedChildId, catFilter, choreCompletions]);

  const positiveChores = visibleChores.filter((c) => c.points > 0);
  const negativeChores = visibleChores.filter((c) => c.points <= 0);

  // Today's completions count
  const doneToday = choreCompletions.filter(
    (cc) => cc.childId === selectedChildId && cc.date === today,
  ).length;

  const handleReset = () => {
    resetTodayChores(selectedChildId, today);
    setShowReset(false);
  };

  return (
    <main className="page-content" id="screen-chores">
      {/* ── Page header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', marginBottom:4 }}>🗂 Chore Board</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(true)} id="btn-reset-today">
            <RotateCcw size={13}/> Reset Today
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} id="btn-add-chore">
            <Plus size={14}/> Add Chore
          </button>
        </div>
      </div>

      {/* ── Child selector ── */}
      {children.length > 1 && (
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {children.map((c) => (
            <button key={c.id}
              className={`child-pill ${selectedChildId === c.id ? 'active' : ''}`}
              onClick={() => setActiveChildFilter(c.id)}
              style={{ '--pill-color': c.color } as React.CSSProperties}
              id={`chore-child-${c.id}`}
            >
              {c.avatarEmoji} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Points summary banner ── */}
      {selectedChild && (
        <div className="card" style={{ padding:'14px 18px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:selectedChild.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
              {selectedChild.avatarEmoji}
            </div>
            <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif' }}>{selectedChild.name}</div>
            <div style={{ marginLeft:'auto', display:'flex', gap:12, alignItems:'center', fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.9rem' }}>
              <span title="Points">🎯 <strong style={{ color:'var(--accent)' }}>{selectedChild.points}</strong></span>
              <span title="Hearts">❤️ <strong style={{ color:'#EC4899' }}>{selectedChild.hearts}</strong></span>
              <span title="Stars">⭐ <strong style={{ color:'var(--amber)' }}>{selectedChild.stars}</strong></span>
            </div>
          </div>
          <div className="points-bar-track">
            <div className="points-bar-fill" style={{ width:`${pctToHeart * 100}%` }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4, fontWeight:600 }}>
            <span>{pts >= 0 ? pts : 0} pts</span>
            <span>{ptsToNext > 0 ? `${ptsToNext} more to ❤️` : '❤️ Heart ready!'}</span>
            <span>{pointsPerHeart} pts</span>
          </div>
          {doneToday > 0 && (
            <div style={{ fontSize:'0.72rem', color:'var(--green)', fontWeight:700, marginTop:6 }}>
              ✓ {doneToday} chore{doneToday !== 1 ? 's' : ''} done today
            </div>
          )}
        </div>
      )}

      {/* ── Category filter pills ── */}
      <div style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
        <button
          className={`child-pill ${catFilter === '' ? 'active' : ''}`}
          onClick={() => setCatFilter('')} id="cat-all">
          All
        </button>
        {ALL_CATS.map((cat) => {
          const cfg = CHORE_CAT_CONFIG[cat];
          return (
            <button key={cat}
              className={`child-pill ${catFilter === cat ? 'active' : ''}`}
              onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
              style={catFilter === cat ? { '--pill-color': cfg.color } as React.CSSProperties : {}}
              id={`chore-cat-${cat}`}
            >
              {cfg.emoji} {cat}
            </button>
          );
        })}
      </div>

      {/* ── Two-column board ── */}
      {visibleChores.length === 0 ? (
        <div className="empty-state card" style={{ padding:40 }}>
          <div style={{ fontSize:'3rem', marginBottom:10 }}>🗂</div>
          <div className="empty-title">No chores for today</div>
          <div className="empty-desc">Add some chores to start tracking {selectedChild?.name ?? 'your kid'}'s progress!</div>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setShowAdd(true)} id="btn-add-chore-empty">
            <Plus size={16}/> Add First Chore
          </button>
        </div>
      ) : (
        <div className="chore-board-grid">
          {/* Positive column */}
          <div className="chore-column chore-column-positive">
            <div className="chore-column-header">
              <span style={{ color:'var(--green)', fontSize:'1.2rem' }}>✅</span>
              Positive Chores
              <span style={{ marginLeft:'auto', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', fontFamily:'Inter, sans-serif' }}>
                {positiveChores.length}
              </span>
            </div>
            {positiveChores.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 12px', color:'var(--text-muted)', fontSize:'0.82rem' }}>
                No positive chores today
              </div>
            ) : (
              positiveChores.map((c) => (
                <ChoreCard key={c.id} chore={c} childId={selectedChildId} date={today}
                  onEdit={(ch) => setEditingChore(ch)}/>
              ))
            )}
          </div>

          {/* Negative column */}
          <div className="chore-column chore-column-negative">
            <div className="chore-column-header">
              <span style={{ color:'var(--red)', fontSize:'1.2rem' }}>⚠️</span>
              Behaviours
              <span style={{ marginLeft:'auto', fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', fontFamily:'Inter, sans-serif' }}>
                {negativeChores.length}
              </span>
            </div>
            {negativeChores.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 12px', color:'var(--text-muted)', fontSize:'0.82rem' }}>
                No negative behaviours today
              </div>
            ) : (
              negativeChores.map((c) => (
                <ChoreCard key={c.id} chore={c} childId={selectedChildId} date={today}
                  onEdit={(ch) => setEditingChore(ch)}/>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      {showReset && (
        <div className="modal-backdrop">
          <div className="confirm-panel">
            <div className="confirm-icon">🔄</div>
            <div className="confirm-title">Reset today's chores?</div>
            <div className="confirm-desc">
              This will unmark all chores completed today for {selectedChild?.name}. Points already earned are kept.
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={handleReset} id="btn-confirm-reset">Reset</button>
            </div>
          </div>
        </div>
      )}

      {(showAdd || editingChore) && (
        <ChoreForm
          chore={editingChore ?? undefined}
          onClose={() => { setShowAdd(false); setEditingChore(null); }}
        />
      )}
    </main>
  );
};

export default ChoreBoard;
