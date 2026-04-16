// ─── WordBuilder — Falling Letter Tile Game ────────────────────────────────────
// Age-adaptive words. Tap falling letters in order to spell the target word.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GAME_WORD_LISTS, CHORE_CAT_CONFIG } from '../../store/types';
import type { ChoreCategory } from '../../store/types';

const ALL_CATS = Object.keys(GAME_WORD_LISTS) as ChoreCategory[];

interface FallingLetter {
  id: number;
  char: string;
  x: number;    // left %
  targetIdx: number | null; // index in target word (-1 = decoy)
  speed: number;
  caught: boolean;
}

function pickWord(age: number): { word: string; category: ChoreCategory } {
  const cat  = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)];
  const list = age <= 7 ? GAME_WORD_LISTS[cat].easy : GAME_WORD_LISTS[cat].hard;
  const word = list[Math.floor(Math.random() * list.length)].toUpperCase();
  return { word, category: cat };
}

function shuffleLetters(word: string): string[] {
  // All letters of the word + some decoy letters
  const decoys = 'AEIOURSTLNMPBDGHCF'.split('');
  const extras: string[] = [];
  for (let i = 0; i < Math.max(2, Math.ceil(word.length * 0.5)); i++) {
    extras.push(decoys[Math.floor(Math.random() * decoys.length)]);
  }
  return [...word.split(''), ...extras].sort(() => Math.random() - 0.5);
}

interface Props { onBack: () => void; childId: string; }

const WordBuilder: React.FC<Props> = ({ onBack, childId }) => {
  const { children, awardXP, addToWordCollection } = useAppStore();
  const child = children.find((c) => c.id === childId);
  const age   = child?.age ?? 7;

  const [{ word, category }, setWordData] = useState(() => pickWord(age));
  const [letters,   setLetters]   = useState<FallingLetter[]>([]);
  const [typed,     setTyped]     = useState<string[]>([]);   // letters caught in order
  const [score,     setScore]     = useState(0);
  const [round,     setRound]     = useState(1);
  const [phase,     setPhase]     = useState<'playing'|'success'|'fail'>('playing');
  const [timeLeft,  setTimeLeft]  = useState(18);
  const letterIdRef = useRef(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Spawn falling letters for the current word
  const spawnLetters = useCallback((w: string) => {
    const allChars = shuffleLetters(w);
    const spawned: FallingLetter[] = allChars.map((char, i) => ({
      id: letterIdRef.current++,
      char,
      x: 5 + (i / allChars.length) * 85 + (Math.random() * 8 - 4),
      targetIdx: w.includes(char) && !spawned?.find((l) => l.char === char && l.targetIdx !== null) ? w.indexOf(char) : null,
      speed: 12 + Math.random() * 6,
      caught: false,
    }));
    setLetters(spawned);
    setTyped([]);
    setTimeLeft(18 + w.length * 2);
  }, []);

  useEffect(() => { spawnLetters(word); }, [word, spawnLetters]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setPhase('fail'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, word]);

  const handleTapLetter = useCallback((letter: FallingLetter) => {
    if (letter.caught || phase !== 'playing') return;
    const nextIdx = typed.length;
    if (letter.char === word[nextIdx]) {
      // Correct letter
      setLetters((prev) => prev.map((l) => l.id === letter.id ? { ...l, caught: true } : l));
      const newTyped = [...typed, letter.char];
      setTyped(newTyped);
      if (newTyped.length === word.length) {
        // Word complete!
        clearInterval(timerRef.current);
        setPhase('success');
        setScore((s) => s + 1);
        awardXP(childId, 5);
        addToWordCollection(childId, word.toLowerCase());
        // Next round after delay
        setTimeout(() => {
          const next = pickWord(age);
          setWordData(next);
          setPhase('playing');
          setRound((r) => r + 1);
          spawnLetters(next.word);
        }, 2200);
      }
    }
    // Wrong letter — no penalty, just nothing happens
  }, [typed, word, phase, childId, age, awardXP, addToWordCollection, spawnLetters]);

  const catCfg = CHORE_CAT_CONFIG[category];

  return (
    <main className="page-content" id="screen-word-builder"
      style={{ background: 'linear-gradient(180deg,#164E63,#0891B2,#22D3EE)', minHeight: '100vh', color: '#fff', borderRadius: 'var(--r-xl)', padding: '20px 20px 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={onBack} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'rgba(255,255,255,0.8)' }} id="btn-word-back">
          <ArrowLeft size={18}/>
        </button>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem' }}>🔤 Word Builder</div>
        <div style={{ display: 'flex', gap: 10, fontSize: '0.85rem', fontWeight: 800 }}>
          <span>📖 {score}</span>
          <span>⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* Category + target word */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 800, marginBottom: 4 }}>
          ROUND {round} · {catCfg.emoji} {category.toUpperCase()} THEME
        </div>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
          Spell this word:
        </div>
        {/* Target word slots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {word.split('').map((_char, i) => {
            const filled = i < typed.length;
            return (
              <div key={i} style={{
                width: 44, height: 52,
                borderRadius: 'var(--r-md)',
                background: filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                border: `2px solid ${filled ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', fontWeight: 900, color: '#0891B2',
                transition: 'all 0.2s ease',
                animation: filled ? 'letterSnap 0.3s var(--ease-spring) both' : undefined,
              }}>
                {filled ? typed[i] : '_'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Falling letters zone */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: 'var(--r-lg)', background: 'rgba(0,0,0,0.2)' }}>
        {letters.map((letter) => (
          <button key={letter.id}
            onClick={() => handleTapLetter(letter)}
            id={`letter-${letter.id}`}
            style={{
              position: 'absolute',
              left: `${letter.x}%`,
              top: letter.caught ? '110%' : undefined,
              width: 44, height: 44,
              borderRadius: 'var(--r-md)',
              background: letter.caught ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.2)',
              border: `2px solid ${letter.caught ? '#10B981' : 'rgba(255,255,255,0.5)'}`,
              color: '#fff', fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.3rem',
              cursor: letter.caught ? 'default' : 'pointer',
              backdropFilter: 'blur(4px)',
              animation: letter.caught
                ? 'letterSnap 0.3s var(--ease-spring) both'
                : `itemFall ${letter.speed}s linear both`,
              '--fall-distance': '350px',
              transition: 'background 0.2s',
            } as React.CSSProperties}
            disabled={letter.caught}
          >
            {letter.char}
          </button>
        ))}

        {/* Phase overlays */}
        {phase === 'success' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(16,185,129,0.85)', borderRadius: 'var(--r-lg)',
            animation: 'scaleIn 0.4s var(--ease-spring) both',
          }}>
            <div style={{ fontSize: '3rem', animation: 'trophySpin 0.8s var(--ease-spring) both' }}>🎉</div>
            <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.4rem', color: '#fff' }}>
              {word}! +5 XP!
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Added to your word collection!</div>
          </div>
        )}
        {phase === 'fail' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239,68,68,0.85)', borderRadius: 'var(--r-lg)',
            animation: 'scaleIn 0.4s var(--ease-spring) both',
          }}>
            <div style={{ fontSize: '2.5rem' }}>⏰</div>
            <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.2rem', color: '#fff' }}>
              Time's up! The word was: {word}
            </div>
            <button className="btn" style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
              onClick={() => { const next = pickWord(age); setWordData(next); setPhase('playing'); spawnLetters(next.word); setRound((r) => r + 1); }}>
              Try Again!
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
        Tap the letters in the correct order: {typed.join('') || '?'}
      </div>
    </main>
  );
};

export default WordBuilder;
