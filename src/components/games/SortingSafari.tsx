// ─── SortingSafari — 60-Second Recycling Sort Game ────────────────────────────
// Items fall from the top. Drag/click to sort into the correct bin.
// Speed increases every 30s. 1-3 star rating. Teaches sustainability.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface FallingItem {
  id: number;
  emoji: string;
  label: string;
  bin: BinType;
  x: number;  // left %
  speed: number;
  sorted: boolean;
  wrong: boolean;
  fact: string;
}

type BinType = 'organic' | 'paper' | 'plastic' | 'general';

const ITEMS: { emoji: string; label: string; bin: BinType; fact: string }[] = [
  { emoji:'🍌', label:'Banana',    bin:'organic',  fact:'Banana peels make great compost!' },
  { emoji:'📰', label:'Newspaper', bin:'paper',    fact:'Recycling 1 ton of paper saves 17 trees!' },
  { emoji:'🧴', label:'Bottle',    bin:'plastic',  fact:'Plastic bottles take 450 years to decompose.' },
  { emoji:'🥕', label:'Carrot',    bin:'organic',  fact:'Vegetable scraps enrich garden soil!' },
  { emoji:'📦', label:'Cardboard', bin:'paper',    fact:'Cardboard is 100% recyclable!' },
  { emoji:'🧃', label:'Juice Box', bin:'plastic',  fact:'Rinse cartons before recycling!' },
  { emoji:'🍎', label:'Apple',     bin:'organic',  fact:'Fruit cores take 2 months to decompose.' },
  { emoji:'🥤', label:'Cup',       bin:'plastic',  fact:'Most plastic cups are recyclable.' },
  { emoji:'🗑', label:'Wrapper',   bin:'general',  fact:'Foil wrappers go in general waste.' },
  { emoji:'☕', label:'Coffee Cup',bin:'general',  fact:'Most coffee cups are not recyclable.' },
  { emoji:'📒', label:'Notebook',  bin:'paper',    fact:'Shredded paper can be composted!' },
  { emoji:'🧋', label:'Straw',     bin:'plastic',  fact:'Metal straws are reusable alternatives!' },
];

const BINS: { type: BinType; label: string; emoji: string; color: string }[] = [
  { type:'organic', label:'Organic',  emoji:'🌿', color:'#10B981' },
  { type:'paper',   label:'Paper',    emoji:'📄', color:'#3B82F6' },
  { type:'plastic', label:'Plastic',  emoji:'♻️', color:'#F59E0B' },
  { type:'general', label:'General',  emoji:'🗑', color:'#6B7280' },
];

interface Props { onBack: () => void; childId: string; }

const SortingSafari: React.FC<Props> = ({ onBack, childId }) => {
  const { awardXP } = useAppStore();

  const [items,     setItems]    = useState<FallingItem[]>([]);
  const [timeLeft,  setTime]     = useState(60);
  const [score,     setScore]    = useState(0);
  const [wrong,     setWrong]    = useState(0);
  const [fact,      setFact]     = useState('');
  const [binAnim,   setBinAnim]  = useState<BinType | null>(null);
  const [phase,     setPhase]    = useState<'playing'|'done'>('playing');
  const [bestScore, setBest]     = useState<number | null>(null);
  const itemIdRef   = useRef(0);
  const speedRef    = useRef(1);

  // Spawn items
  useEffect(() => {
    if (phase !== 'playing') return;
    let idx = 0;
    const spawn = () => {
      if (phase !== 'playing') return;
      const template = ITEMS[idx % ITEMS.length];
      idx++;
      const id = itemIdRef.current++;
      setItems((prev) => [
        ...prev.filter((i) => !i.sorted && !i.wrong).slice(-6),
        {
          id,
          ...template,
          x: 5 + Math.random() * 80,
          speed: (12 - speedRef.current * 2) + Math.random() * 3,
          sorted: false, wrong: false,
        },
      ]);
      // Auto-remove if not sorted within animation time
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 14_000);
    };
    spawn();
    const interval = setInterval(spawn, 3200);
    return () => clearInterval(interval);
  }, [phase]);

  // Speed ramp every 30s
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setTimeout(() => { speedRef.current = 2; }, 30_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          setPhase('done');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Award XP on done
  useEffect(() => {
    if (phase === 'done') {
      const xp = score * 2;
      if (xp > 0) awardXP(childId, xp);
      if (bestScore === null || score > bestScore) setBest(score);
    }
  }, [phase, awardXP, bestScore, childId, score]);

  const handleSort = useCallback((item: FallingItem, bin: BinType) => {
    if (item.sorted || item.wrong) return;
    const correct = bin === item.bin;
    setItems((prev) => prev.map((i) =>
      i.id === item.id ? { ...i, sorted: correct, wrong: !correct } : i,
    ));
    if (correct) {
      setScore((s) => s + 2);
      setFact(item.fact);
      setBinAnim(bin);
      setTimeout(() => setBinAnim(null), 600);
    } else {
      setWrong((w) => w + 1);
    }
    // Remove after a moment
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), 700);
  }, []);

  const accuracy = score + wrong > 0 ? Math.round((score / (score + wrong)) * 100) : 100;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

  return (
    <main className="page-content" id="screen-sorting"
      style={{ background: 'linear-gradient(180deg,#78350F,#D97706,#FDE68A)', minHeight: '100vh', color: '#fff', borderRadius: 'var(--r-xl)', padding: '20px 20px 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Safari scene — jeep at bottom */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, fontSize: '2.5rem', animation: 'animalWalk 20s linear infinite', pointerEvents: 'none' }}>🚙</div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative', zIndex: 10 }}>
        <button onClick={onBack} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'rgba(255,255,255,0.8)' }} id="btn-sort-back">
          <ArrowLeft size={18}/>
        </button>
        <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem' }}>♻️ Sorting Safari</div>
        <div style={{ display: 'flex', gap: 10, fontSize: '0.85rem', fontWeight: 800 }}>
          <span>✅ {score}</span>
          <span>⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* Falling items zone */}
      <div style={{ position: 'relative', height: 260, overflow: 'visible', marginBottom: 16 }}>
        {items.filter((i) => !i.sorted && !i.wrong).map((item) => (
          <div key={item.id} style={{
            position: 'absolute', left: `${item.x}%`,
            animation: `itemFall ${item.speed}s linear both`,
            '--fall-distance': '300px',
            zIndex: 5, cursor: 'default',
          } as React.CSSProperties}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem' }}>{item.emoji}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.3)', borderRadius: 4, padding: '1px 4px' }}>
                {item.label}
              </div>
            </div>
            {/* Quick-tap bin buttons under each item */}
            <div style={{ display: 'flex', gap: 3, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {BINS.map((bin) => (
                <button key={bin.type}
                  onClick={() => handleSort(item, bin.type)}
                  id={`sort-${item.id}-${bin.type}`}
                  style={{
                    background: bin.color, border: 'none', borderRadius: 4,
                    padding: '2px 5px', fontSize: '0.55rem', fontWeight: 800,
                    color: '#fff', cursor: 'pointer',
                  }}
                >
                  {bin.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fact strip */}
      {fact && (
        <div style={{
          background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--r-md)', padding: '8px 12px',
          fontSize: '0.75rem', fontWeight: 700, color: '#FEF3C7', marginBottom: 12,
          animation: 'slideDown 0.3s ease both',
        }}>
          🌍 {fact}
        </div>
      )}

      {/* Bins row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
        {BINS.map((bin) => (
          <div key={bin.type} style={{
            textAlign: 'center', padding: '10px 4px',
            background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-lg)',
            border: `2px solid ${binAnim === bin.type ? bin.color : 'rgba(255,255,255,0.2)'}`,
            animation: binAnim === bin.type ? 'binWiggle 0.5s ease both' : undefined,
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: '1.6rem' }}>{bin.emoji}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              {bin.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress & speed indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
        <span>⚡ {speedRef.current === 2 ? 'FAST!' : 'Normal'}</span>
        <span>{accuracy}% accuracy</span>
      </div>

      {/* Done overlay */}
      {phase === 'done' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.4s ease both',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#78350F,#92400E)',
            borderRadius: 'var(--r-xl)', padding: '32px 28px',
            textAlign: 'center', maxWidth: 320, width: '90%',
            animation: 'scaleIn 0.5s var(--ease-spring) both',
            border: '2px solid rgba(252,211,77,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{
                  fontSize: '2.2rem',
                  opacity: i < stars ? 1 : 0.25,
                  animation: i < stars ? `starRate 0.5s var(--ease-spring) ${i * 0.15}s both` : undefined,
                  display: 'inline-block',
                }}>⭐</div>
              ))}
            </div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#FEF3C7', margin: '0 0 6px' }}>
              Safari Complete!
            </h2>
            <div style={{ color: '#FDE68A', fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
              Score: {score} 🌍 {accuracy}% accurate
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(252,231,163,0.7)', marginBottom: 4 }}>
              +{score * 2} XP earned!
            </div>
            {bestScore !== null && (
              <div style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700, marginBottom: 16 }}>
                🏆 Best: {bestScore} pts
              </div>
            )}
            <button className="btn btn-primary" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, width: '100%' }}
              onClick={() => { setPhase('playing'); setScore(0); setWrong(0); setTime(60); setItems([]); speedRef.current = 1; }}
              id="btn-sort-again">
              Play Again! ♻️
            </button>
            <button onClick={onBack} style={{ marginTop: 8, width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}>
              Back to Games
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SortingSafari;
