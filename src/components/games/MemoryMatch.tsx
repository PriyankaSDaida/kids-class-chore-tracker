// ─── MemoryMatch — 3D Card Flip Memory Game ───────────────────────────────────
// Pairs: chore icon ↔ chore name. Age-adaptive grid (3×2 or 4×4).
// 3D flip, matched pair glow, hint button (costs 1 token).
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';


const CARD_PAIRS: { icon: string; name: string }[] = [
  { icon:'🛏', name:'Make Bed'    }, { icon:'🧹', name:'Sweep'       },
  { icon:'🍽', name:'Dishes'     }, { icon:'🧼', name:'Wash Hands'  },
  { icon:'📚', name:'Study'      }, { icon:'🐕', name:'Walk Dog'    },
  { icon:'🌱', name:'Water Plants'},{ icon:'🍳', name:'Cook'        },
];

interface Card {
  id:      number;
  pairId:  number;
  content: string;
  type:    'icon' | 'name';
  flipped: boolean;
  matched: boolean;
}

function buildDeck(age: number): Card[] {
  const count = age <= 7 ? 3 : 4;   // 3×2=6 cards or 4×4=16 cards
  const pairs = CARD_PAIRS.slice(0, count * (age <= 7 ? 1 : 2));
  const cards: Card[] = [];
  pairs.slice(0, count * (age <= 7 ? 1 : 1)).forEach((pair, i) => {
    cards.push(
      { id: i * 2,     pairId: i, content: pair.icon, type: 'icon', flipped: false, matched: false },
      { id: i * 2 + 1, pairId: i, content: pair.name, type: 'name', flipped: false, matched: false },
    );
  });
  return cards.sort(() => Math.random() - 0.5);
}

interface Props { onBack: () => void; childId: string; }

const MemoryMatch: React.FC<Props> = ({ onBack, childId }) => {
  const { children, awardXP } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const age   = child?.age ?? 7;
  const tokens = child?.gameTokens ?? 0;

  const [cards,      setCards]   = useState<Card[]>(() => buildDeck(age));
  const [flippedIds, setFlipped] = useState<number[]>([]);
  const [moves,      setMoves]   = useState(0);
  const [elapsed,    setElapsed] = useState(0);
  const [done,       setDone]    = useState(false);
  const [bestTime,   setBest]    = useState<number | null>(null);
  const [showHint,   setShowHint]= useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const lockRef  = useRef<boolean>(false);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleFlip = useCallback((card: Card) => {
    if (lockRef.current || card.flipped || card.matched || flippedIds.length === 2) return;
    lockRef.current = true;

    const newFlipped = [...flippedIds, card.id];
    setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [idA, idB] = newFlipped;
      const cardA = cards.find((c) => c.id === idA)!;
      const cardB = cards.find((c) => c.id === idB)!;
      const match = cardA.pairId === cardB.pairId && cardA.type !== cardB.type;

      setTimeout(() => {
        if (match) {
          setCards((prev) => prev.map((c) =>
            c.id === idA || c.id === idB ? { ...c, matched: true } : c,
          ));
        } else {
          setCards((prev) => prev.map((c) =>
            c.id === idA || c.id === idB ? { ...c, flipped: false } : c,
          ));
        }
        setFlipped([]);
        lockRef.current = false;
      }, match ? 600 : 1000);
    } else {
      setTimeout(() => { lockRef.current = false; }, 100);
    }
  }, [cards, flippedIds]);

  // Check for completion
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      clearInterval(timerRef.current);
      setDone(true);
      awardXP(childId, 10);
      if (bestTime === null || elapsed < bestTime) setBest(elapsed);
    }
  }, [cards, elapsed, bestTime, childId, awardXP]);

  const handleHint = () => {
    if (tokens < 1 || showHint) return;
    // Deduct token
    useAppStore.setState((s) => ({
      children: s.children.map((c) =>
        c.id === childId ? { ...c, gameTokens: Math.max(0, (c.gameTokens ?? 0) - 1) } : c,
      ),
    }));
    setShowHint(true);
    // Flip all unmatched cards for 1s
    setCards((prev) => prev.map((c) => c.matched ? c : { ...c, flipped: true }));
    setTimeout(() => {
      setCards((prev) => prev.map((c) =>
        c.matched || flippedIds.includes(c.id) ? c : { ...c, flipped: false },
      ));
      setShowHint(false);
    }, 1000);
  };

  const restart = () => {
    setCards(buildDeck(age));
    setFlipped([]); setMoves(0); setElapsed(0); setDone(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const cols = age <= 7 ? 3 : 4;
  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const totalPairs   = cards.length / 2;

  return (
    <main className="page-content" id="screen-memory"
      style={{ background: 'linear-gradient(180deg,#064E3B,#059669,#34D399)', minHeight: '100vh', color: '#fff', borderRadius: 'var(--r-xl)', padding: '20px 20px 40px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={onBack} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'rgba(255,255,255,0.8)' }} id="btn-memory-back">
          <ArrowLeft size={18}/>
        </button>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem' }}>🃏 Memory Match</div>
        <div style={{ display: 'flex', gap: 10, fontSize: '0.82rem', fontWeight: 800 }}>
          <span>🎯 {moves}</span>
          <span>⏱ {elapsed}s</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
          {matchedCount}/{totalPairs} pairs matched
        </div>
        <button
          onClick={handleHint}
          disabled={tokens < 1 || showHint}
          style={{
            background: tokens >= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff', borderRadius: 999, padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 800, cursor: tokens >= 1 ? 'pointer' : 'not-allowed',
            opacity: tokens < 1 ? 0.5 : 1,
          }}
          id="btn-hint"
        >
          💡 Hint (1 token)
        </button>
        {bestTime !== null && (
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            Best: {bestTime}s
          </div>
        )}
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
        {cards.map((card) => (
          <button key={card.id}
            onClick={() => handleFlip(card)}
            id={`mem-card-${card.id}`}
            style={{
              height: 72, borderRadius: 'var(--r-lg)', border: 'none',
              cursor: card.flipped || card.matched ? 'default' : 'pointer',
              background: card.matched
                ? 'linear-gradient(135deg,#10B981,#059669)'
                : card.flipped
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.15)',
              color: card.matched || card.flipped ? '#065F46' : 'transparent',
              fontWeight: 900, fontFamily: 'Nunito, sans-serif',
              fontSize: card.type === 'icon' ? '1.8rem' : '0.75rem',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              animation: card.matched ? 'matchedPulse 1.5s ease-in-out infinite' : undefined,
              boxShadow: card.matched ? '0 0 0 2px rgba(255,255,255,0.5)' : undefined,
            }}
          >
            {(card.flipped || card.matched) ? card.content : ''}
          </button>
        ))}
      </div>

      {/* Completion overlay */}
      {done && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.4s ease both',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#064E3B,#065F46)',
            borderRadius: 'var(--r-xl)', padding: '32px 28px',
            textAlign: 'center', maxWidth: 320, width: '90%',
            animation: 'scaleIn 0.5s var(--ease-spring) both',
          }}>
            <div style={{ fontSize: '4rem', animation: 'trophySpin 1s var(--ease-spring) both' }}>🏆</div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#fff', margin: '8px 0' }}>
              You matched them all!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 4 }}>
              {moves} moves · {elapsed} seconds · +10 XP!
            </p>
            {bestTime !== null && (
              <p style={{ color: '#6EE7B7', fontWeight: 800, fontSize: '0.85rem' }}>
                🏅 Personal best: {bestTime}s
              </p>
            )}
            <button className="btn btn-primary" onClick={restart} style={{ marginTop: 16, fontFamily: 'Nunito, sans-serif', fontWeight: 900 }} id="btn-play-again">
              Play Again! 🃏
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MemoryMatch;
