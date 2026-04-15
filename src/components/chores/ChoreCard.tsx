// ─── QuestCard — Immersive Adventure Quest Card ────────────────────────────────
import React, { useState, useRef } from 'react';
import { Pencil, Trash2, RotateCcw, Flame, Star, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CHORE_CAT_CONFIG, getChoreRarity } from '../../store/types';
import { useSound } from '../../hooks/useSound';
import FloatingPoint from './FloatingPoint';
import PinPad from './PinPad';
import type { Chore } from '../../store/types';
import { format, subDays } from 'date-fns';

interface Props {
  chore:    Chore;
  childId:  string;
  date:     string;
  onEdit?:  (c: Chore) => void;
  style?:   React.CSSProperties;
}

// Compute how many consecutive days a chore was completed
const getChoreStreak = (
  choreId: string,
  childId: string,
  completions: { choreId:string; childId:string; date:string }[],
): number => {
  const doneDates = new Set(
    completions
      .filter((cc) => cc.choreId === choreId && cc.childId === childId)
      .map((cc) => cc.date),
  );
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (doneDates.has(d)) streak++;
    else if (i > 0) break; // today not done yet is OK on first pass
  }
  return streak;
};

const QuestCard: React.FC<Props> = ({ chore, childId, date, onEdit, style }) => {
  const { completeChore, uncompleteChore, deleteChore, choreCompletions, choreSettings } = useAppStore();
  const { playChime, playTick } = useSound();

  const [floating,   setFloating]   = useState(false);
  const [showPin,    setShowPin]    = useState(false);
  const [flipped,    setFlipped]    = useState(false);  // showing detail back
  const [completing, setCompleting] = useState(false);  // in-flight animation
  const [pulseDone,  setPulseDone]  = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isPositive = chore.points > 0;
  const catCfg     = CHORE_CAT_CONFIG[chore.category];

  // Completion state
  const isCompletedOnce = chore.recurrence === 'once'
    ? choreCompletions.some((cc) => cc.choreId === chore.id && cc.childId === childId)
    : choreCompletions.some((cc) => cc.choreId === chore.id && cc.childId === childId && cc.date === date);

  // Rarity: count lifetime completions for this chore + child
  const lifetimeCount = choreCompletions.filter(
    (cc) => cc.choreId === chore.id && cc.childId === childId,
  ).length;
  const rarity = getChoreRarity(lifetimeCount);

  // Streak
  const streak = getChoreStreak(chore.id, childId, choreCompletions);

  const handleCardClick = () => {
    if (!isCompletedOnce && !completing) setFlipped((f) => !f);
  };

  const handleDoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pinRequired = !choreSettings.kidsCanMarkChores && choreSettings.parentPin !== '';
    if (pinRequired) {
      setShowPin(true);
    } else {
      doComplete();
    }
  };

  const doComplete = () => {
    setCompleting(true);
    setFlipped(false);
    setPulseDone(true);
    completeChore(chore.id, childId, date);
    setFloating(true);
    if (chore.points > 0) playChime(); else playTick();
    setTimeout(() => { setCompleting(false); setPulseDone(false); }, 900);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    uncompleteChore(chore.id, childId, date);
    playTick();
  };

  // Border style by rarity / type
  const rarityBorder = (): string => {
    if (rarity === 'legendary') return '2.5px solid #FF0080';
    if (rarity === 'gold')      return '2.5px solid #F59E0B';
    if (!isPositive)            return '2.5px solid rgba(239,68,68,0.6)';
    return '2px solid rgba(16,185,129,0.3)';
  };

  const cardBg = isPositive
    ? 'var(--bg-card)'
    : 'linear-gradient(135deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))';

  // Float animation (not shown when completed or animating)
  const idleAnim = (!isCompletedOnce && !completing && choreSettings.showAnimations)
    ? `questFloat ${3 + (chore.id.charCodeAt(0) % 3) * 0.5}s ease-in-out infinite`
    : undefined;

  return (
    <>
      <div
        ref={cardRef}
        className={`quest-card${isCompletedOnce ? ' quest-done' : ''}${completing ? ' quest-completing' : ''}${!isPositive ? ' quest-negative' : ''}`}
        style={{
          position: 'relative',
          background: cardBg,
          border: rarityBorder(),
          borderRadius: 'var(--r-xl)',
          padding: '0',
          cursor: isCompletedOnce ? 'default' : 'pointer',
          animation: idleAnim,
          ...(rarity === 'legendary' && !isCompletedOnce
            ? { animationName: 'questFloat, legendaryShimmer', animationDuration: '4s, 3s', animationIterationCount: 'infinite, infinite', animationTimingFunction: 'ease-in-out, linear' }
            : {}),
          ...(rarity === 'gold' && !isCompletedOnce ? { animation: `questFloat 3.5s ease-in-out infinite, goldPulse 2s ease-in-out infinite` } : {}),
          ...(completing ? { animation: 'questComplete 0.9s ease both' } : {}),
          ...(pulseDone ? { animation: 'questComplete 0.9s ease both' } : {}),
          overflow: 'hidden',
          transition: 'transform 0.18s ease, opacity 0.3s ease',
          ...style,
        }}
        onClick={handleCardClick}
        id={`quest-card-${chore.id}`}
      >
        {/* ── Rarity crown badge ── */}
        {rarity !== 'silver' && (
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2,
            fontSize: '0.7rem', fontWeight: 900, fontFamily: 'Nunito, sans-serif',
            padding: '2px 7px', borderRadius: 999,
            background: rarity === 'legendary' ? 'linear-gradient(90deg,#FF0080,#FFD700,#00BFFF)' : '#F59E0B',
            color: '#fff', letterSpacing: '0.03em',
          }}>
            {rarity === 'legendary' ? '✨ LEGENDARY' : '⭐ GOLD'}
          </div>
        )}

        {/* ── Negative warning banner ── */}
        {!isPositive && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
            padding: '4px 14px', fontSize: '0.65rem', fontWeight: 800,
            color: 'var(--red)', letterSpacing: '0.05em',
          }}>
            ⚠️ WATCH OUT!
          </div>
        )}

        {/* ── Card front (default view) ── */}
        {!flipped && (
          <div style={{ padding: '14px 14px 12px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Category icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r-lg)',
                background: catCfg.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0,
                border: `1.5px solid ${catCfg.color}33`,
              }}>
                {chore.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 900, fontFamily: 'Nunito, sans-serif',
                  fontSize: '1rem', lineHeight: 1.2, marginBottom: 3,
                  color: isCompletedOnce ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isCompletedOnce ? 'line-through' : 'none',
                }}>
                  {isCompletedOnce && '✓ '}{chore.name}
                </div>

                {chore.description && (
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {chore.description}
                  </div>
                )}

                {/* Category + streak row */}
                <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.62rem', color: catCfg.color, fontWeight: 800,
                    background: catCfg.bg, padding: '2px 7px', borderRadius: 999,
                    border: `1px solid ${catCfg.color}33`,
                  }}>
                    {catCfg.emoji} {chore.category}
                  </span>
                  {streak >= 3 && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Flame size={10} style={{ animation: 'flameFlicker 0.9s ease-in-out infinite' }}/> {streak}
                    </span>
                  )}
                  {lifetimeCount > 0 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ×{lifetimeCount}
                    </span>
                  )}
                </div>

                {/* Lifetime mini-bar */}
                {lifetimeCount > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{
                      height: 3, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${Math.min(100, (lifetimeCount / 25) * 100)}%`,
                        background: rarity === 'legendary'
                          ? 'linear-gradient(90deg,#FF0080,#FFD700,#00BFFF)'
                          : rarity === 'gold' ? '#F59E0B' : catCfg.color,
                        transition: 'width 0.5s ease',
                      }}/>
                    </div>
                  </div>
                )}
              </div>

              {/* Point badge */}
              <div style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  minWidth: 40, padding: '4px 8px', borderRadius: 10, textAlign: 'center',
                  fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem',
                  background: isPositive ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#EF4444,#DC2626)',
                  color: '#fff', boxShadow: isPositive ? '0 2px 8px rgba(16,185,129,0.4)' : '0 2px 8px rgba(239,68,68,0.4)',
                }}>
                  {isPositive ? '+' : ''}{chore.points}
                </div>

                {/* Tap hint when not flipped */}
                {!isCompletedOnce && (
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>
                    TAP
                  </div>
                )}
              </div>
            </div>

            {/* Done state actions */}
            {isCompletedOnce && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 800, color: 'var(--green)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Star size={13} fill="currentColor"/> Quest Complete!
                </div>
                {chore.recurrence !== 'once' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleUndo}
                    style={{ fontSize: '0.65rem', padding: '2px 8px', height: 24, marginLeft: 'auto' }}
                    id={`btn-undo-${chore.id}`}
                  >
                    <RotateCcw size={10}/> Undo
                  </button>
                )}
                {onEdit && (
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => { e.stopPropagation(); onEdit(chore); }}
                    style={{ width: 28, height: 28 }} id={`btn-edit-q-${chore.id}`}>
                    <Pencil size={12}/>
                  </button>
                )}
                {onEdit && (
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => { e.stopPropagation(); deleteChore(chore.id); }}
                    style={{ width: 28, height: 28, color: 'var(--red)' }} id={`btn-del-q-${chore.id}`}>
                    <Trash2 size={12}/>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Card back (detail / complete view) ── */}
        {flipped && !isCompletedOnce && (
          <div
            style={{ padding: '14px', animation: 'scaleIn 0.25s var(--ease-spring) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '2rem' }}>{chore.icon}</span>
              <div>
                <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem' }}>{chore.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {chore.category} · {chore.recurrence} · {lifetimeCount} times completed
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setFlipped(false)}
                style={{ marginLeft: 'auto' }} id={`btn-flip-back-${chore.id}`}>
                ×
              </button>
            </div>

            {chore.description && (
              <div style={{
                background: catCfg.bg, border: `1px solid ${catCfg.color}33`,
                borderRadius: 'var(--r-md)', padding: '8px 12px',
                fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600,
                marginBottom: 12,
              }}>
                "{chore.description}"
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              {streak >= 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800, color: '#EF4444' }}>
                  <Flame size={14} style={{ animation: 'flameFlicker 0.9s ease-in-out infinite' }}/>
                  {streak}-day streak!
                </div>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                <Zap size={12}/> {rarity} quest
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {onEdit && (
                <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}
                  onClick={() => onEdit(chore)} id={`btn-edit-detail-${chore.id}`}>
                  <Pencil size={13}/> Edit
                </button>
              )}
              <button
                className={`btn btn-sm ${isPositive ? 'btn-primary' : 'btn-danger'}`}
                style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '0.95rem', padding: '10px' }}
                onClick={handleDoneClick}
                id={`btn-complete-${chore.id}`}
              >
                {isPositive ? '⚔️ Complete Quest!' : '⚠️ Record Behaviour'}
              </button>
            </div>
          </div>
        )}

        {/* Floating point indicator */}
        {floating && <FloatingPoint points={chore.points} onDone={() => setFloating(false)}/>}
      </div>

      {/* PIN modal */}
      {showPin && (
        <div className="modal-backdrop" style={{ zIndex: 300 }}>
          <div className="modal-panel" style={{ maxWidth: 320 }}>
            <PinPad
              label="Parent PIN required"
              subtitle="Enter your 4-digit PIN to confirm"
              expectedPin={choreSettings.parentPin}
              onConfirm={() => { setShowPin(false); doComplete(); }}
              onCancel={() => setShowPin(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default QuestCard;
