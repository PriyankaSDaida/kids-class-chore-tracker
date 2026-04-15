// ─── QuestBoard — Adventure Quest Board (replaces ChoreBoard) ─────────────────
import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, Sword, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { todayStr } from '../../utils/dateUtils';
import { CHORE_CAT_CONFIG } from '../../store/types';
import type { Chore, ChoreCategory } from '../../store/types';
import ChoreCard from './ChoreCard';
import ChoreForm from './ChoreForm';

const ALL_CATS = Object.keys(CHORE_CAT_CONFIG) as ChoreCategory[];

const showsToday = (chore: Chore): boolean => {
  const dow        = new Date().getDay();
  const createdDow = new Date(chore.createdAt).getDay();
  switch (chore.recurrence) {
    case 'daily':    return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekly':   return dow === createdDow;
    case 'once':     return true;
  }
};

const isNight = () => new Date().getHours() >= 19;

/** Returns game tokens badge display for active child */
const TokenBadge: React.FC<{ tokens: number }> = ({ tokens }) => (
  <div title="Game tokens earned today" style={{
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
    padding: '5px 12px', borderRadius: 999,
    fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: '#fff',
    boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
    animation: tokens > 0 ? 'pulseGlow 2s ease-in-out infinite' : undefined,
  }}>
    🎮 {tokens} token{tokens !== 1 ? 's' : ''}
  </div>
);

const QuestBoard: React.FC = () => {
  const {
    chores, choreCompletions, children,
    activeChildFilter, setActiveChildFilter,
    resetTodayChores, choreSettings, setScreen,
  } = useAppStore();

  const today = todayStr();
  const night  = isNight();

  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [catFilter,    setCatFilter]    = useState<ChoreCategory | ''>('');
  const [showReset,    setShowReset]    = useState(false);

  const selectedChildId = activeChildFilter || children[0]?.id || '';
  const selectedChild   = children.find((c) => c.id === selectedChildId);

  const { pointsPerHeart } = choreSettings;
  const pts        = selectedChild?.points ?? 0;
  const pctToHeart = Math.min(1, Math.max(0, pts) / pointsPerHeart);
  const ptsToNext  = Math.max(0, pointsPerHeart - Math.max(0, pts));

  // Today's completions for game token count
  const doneToday = choreCompletions.filter(
    (cc) => cc.childId === selectedChildId && cc.date === today,
  ).length;

  const visibleChores = useMemo(() => chores.filter((c) => {
    if (!c.isActive) return false;
    if (c.assignedChildId !== 'all' && c.assignedChildId !== selectedChildId) return false;
    if (catFilter && c.category !== catFilter) return false;
    if (!showsToday(c)) return false;
    if (c.recurrence === 'once') {
      const done = choreCompletions.some((cc) => cc.choreId === c.id && cc.childId === selectedChildId);
      if (done) return false;
    }
    return true;
  }), [chores, selectedChildId, catFilter, choreCompletions]);

  // Separate pending vs completed for this session
  const { pending, done } = useMemo(() => {
    const p: Chore[] = [];
    const d: Chore[] = [];
    chores.filter((c) => {
      if (!c.isActive) return false;
      if (c.assignedChildId !== 'all' && c.assignedChildId !== selectedChildId) return false;
      if (!showsToday(c)) return false;
      return true;
    }).forEach((c) => {
      const completed = choreCompletions.some(
        (cc) => cc.choreId === c.id && cc.childId === selectedChildId && cc.date === today,
      );
      if (completed) d.push(c);
    });
    visibleChores.forEach((c) => p.push(c));
    return { pending: p, done: d };
  }, [visibleChores, chores, choreCompletions, selectedChildId, today]);

  const positiveQuests = pending.filter((c) => c.points > 0);
  const watchOutCards  = pending.filter((c) => c.points <= 0);

  const handleReset = () => { resetTodayChores(selectedChildId, today); setShowReset(false); };

  return (
    <main className="page-content" id="screen-chores" style={{ position: 'relative', overflow: 'visible' }}>

      {/* ── Fantasy sky header ── */}
      <div style={{
        borderRadius: 'var(--r-xl)', marginBottom: 20, overflow: 'hidden',
        background: night
          ? 'linear-gradient(135deg,#0F172A,#1E1B4B,#312E81)'
          : 'linear-gradient(135deg,#FFF7ED,#FEF3C7,#FDE68A,#FCD34D)',
        padding: '20px 20px 18px', position: 'relative',
        boxShadow: night ? '0 4px 24px rgba(15,23,42,0.4)' : '0 4px 24px rgba(252,211,77,0.3)',
      }}>
        {/* Drifting clouds (day) or twinkling stars (night) */}
        {!night && choreSettings.backgroundAnimations && (
          <>
            {[0,1,2].map((i) => (
              <div key={i} style={{
                position: 'absolute', top: `${8 + i * 14}%`, left: 0, fontSize: '1.8rem', opacity: 0.7,
                animation: `cloudDrift ${22 + i * 7}s linear ${i * 8}s infinite`,
                pointerEvents: 'none',
              }}>☁️</div>
            ))}
          </>
        )}
        {night && choreSettings.backgroundAnimations && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: `${10 + Math.sin(i * 2.3) * 30}%`,
                left: `${5 + i * 12}%`,
                fontSize: '0.5rem', opacity: 0.6,
                animation: `nightTwinkle ${1.5 + (i % 4) * 0.6}s ease-in-out ${(i % 5) * 0.3}s infinite`,
                pointerEvents: 'none',
              }}>⭐</div>
            ))}
          </>
        )}

        {/* Sun / Moon */}
        {choreSettings.backgroundAnimations && (
          <div style={{
            position: 'absolute', top: 12, right: 16, fontSize: '2rem',
            animation: night ? 'moonGlow 3s ease-in-out infinite' : 'sunRays 12s linear infinite',
            transformOrigin: 'center',
          }}>
            {night ? '🌙' : '☀️'}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: '2rem' }}>⚔️</div>
            <h1 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.6rem', lineHeight: 1, color: night ? '#F3F4F6' : '#92400E', margin: 0 }}>
              Quest Board
            </h1>
          </div>
          <p style={{ color: night ? 'rgba(243,244,246,0.7)' : '#78350F', fontSize: '0.8rem', fontWeight: 700, marginBottom: 10 }}>
            {format(new Date(), 'EEEE, MMMM d')} · {night ? 'Evening adventures' : 'Daily quests await!'}
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Game tokens counter */}
            {selectedChild && (
              <TokenBadge tokens={selectedChild.gameTokens ?? 0}/>
            )}
            <button
              className="btn btn-sm"
              style={{ background: night ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)', color: night ? '#fff' : '#92400E', border: 'none', backdropFilter: 'blur(4px)', fontWeight: 800, fontSize: '0.8rem' }}
              onClick={() => setScreen('games')} id="btn-play-games"
            >
              <Trophy size={13}/> Play Games
            </button>
          </div>
        </div>
      </div>

      {/* ── Header actions row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          {doneToday} completed · {visibleChores.length} remaining
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(true)} id="btn-reset-today">
            <RotateCcw size={13}/> Reset
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} id="btn-add-chore">
            <Plus size={14}/> Add Quest
          </button>
        </div>
      </div>

      {/* ── Child pills ── */}
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
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

      {/* ── Points progress bar ── */}
      {selectedChild && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: selectedChild.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              {selectedChild.avatarEmoji}
            </div>
            <div style={{ fontWeight: 800, fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem' }}>{selectedChild.name}</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem' }}>
              <span>🎯 <strong style={{ color: 'var(--accent)' }}>{selectedChild.points}</strong></span>
              <span>❤️ <strong style={{ color: '#EC4899' }}>{selectedChild.hearts}</strong></span>
              <span>⭐ <strong style={{ color: 'var(--amber)' }}>{selectedChild.stars}</strong></span>
            </div>
          </div>
          <div className="points-bar-track">
            <div className="points-bar-fill" style={{ width: `${pctToHeart * 100}%` }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
            <span>{Math.max(0, pts)} pts</span>
            <span>{ptsToNext > 0 ? `${ptsToNext} more to ❤️` : '❤️ Heart ready!'}</span>
            <span>{pointsPerHeart} pts</span>
          </div>
        </div>
      )}

      {/* ── Category filter pills ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        <button className={`child-pill ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')} id="cat-all">
          ⚔️ All
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

      {/* ── Empty state ── */}
      {pending.length === 0 && done.length === 0 ? (
        <div className="empty-state card" style={{ padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 10 }}>⚔️</div>
          <div className="empty-title">No quests today!</div>
          <div className="empty-desc">Add some quests to start tracking {selectedChild?.name ?? 'your hero'}'s adventure!</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)} id="btn-add-chore-empty">
            <Plus size={16}/> Add First Quest
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Golden Quests section ── */}
          {positiveQuests.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Sword size={16} style={{ color: '#F59E0B' }}/>
                <h2 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', color: '#D97706', margin: 0 }}>
                  Golden Quests
                </h2>
                <div style={{ marginLeft: 'auto', background: '#FEF3C7', borderRadius: 999, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800, color: '#92400E' }}>
                  {positiveQuests.length} quest{positiveQuests.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {positiveQuests.map((c, i) => (
                  <ChoreCard key={c.id} chore={c} childId={selectedChildId} date={today}
                    onEdit={(ch) => setEditingChore(ch)}
                    style={{ animation: `questReveal 0.4s var(--ease-spring) ${i * 60}ms both` }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Watch Out section ── */}
          {watchOutCards.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <h2 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', color: 'var(--red)', margin: 0 }}>
                  Watch Out!
                </h2>
                <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', borderRadius: 999, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--red)' }}>
                  {watchOutCards.length} to avoid
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {watchOutCards.map((c, i) => (
                  <ChoreCard key={c.id} chore={c} childId={selectedChildId} date={today}
                    onEdit={(ch) => setEditingChore(ch)}
                    style={{ animation: `questReveal 0.4s var(--ease-spring) ${i * 60}ms both` }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Done Today row ── */}
          {done.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '0.9rem' }}>✅</span>
                <h2 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Done Today
                </h2>
                <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {done.length} completed
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {done.map((c) => {
                  const cfg = CHORE_CAT_CONFIG[c.category];
                  return (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-lg)', padding: '6px 12px',
                      opacity: 0.65, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)',
                    }}>
                      <span style={{ fontSize: '1rem' }}>{c.icon}</span>
                      <span style={{ textDecoration: 'line-through' }}>{c.name}</span>
                      <span style={{ background: cfg.bg, color: cfg.color, padding: '1px 6px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 800 }}>
                        +{c.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Reset confirmation ── */}
      {showReset && (
        <div className="modal-backdrop">
          <div className="confirm-panel">
            <div className="confirm-icon">🔄</div>
            <div className="confirm-title">Reset today's quests?</div>
            <div className="confirm-desc">
              This will unmark all quests completed today for {selectedChild?.name}. Points already earned are kept.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReset} id="btn-confirm-reset">Reset</button>
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

export default QuestBoard;
