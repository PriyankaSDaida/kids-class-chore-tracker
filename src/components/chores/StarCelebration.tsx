// ─── StarCelebration — Shooting Star + Golden Confetti Upgrade ────────────────
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';


const NUM_STARS    = 24;
const NUM_CONFETTI = 40;

const CONFETTI_COLORS = ['#FFD700','#FFA500','#FFB347','#FFFACD','#F0E130','#FFC200'];

const StarCelebration: React.FC<{ childName: string }> = ({ childName }) => {
  const { clearStarCelebration, choreSettings } = useAppStore();
  const { playFanfare } = useSound();

  // Compute particle positions once on mount (stable random values)
  const [burstStars] = useState(() => Array.from({ length: NUM_STARS }, (_, i) => {
    const angle = (i / NUM_STARS) * 360;
    const dist  = 130 + Math.random() * 200;
    const rad   = (angle * Math.PI) / 180;
    return {
      id: i,
      sx: `${Math.cos(rad) * dist}px`,
      sy: `${Math.sin(rad) * dist}px`,
      delay: Math.random() * 0.6,
      dur: 1.5 + Math.random() * 1.1,
      size: 1.2 + Math.random() * 1.6,
    };
  }));

  const [confetti] = useState(() => Array.from({ length: NUM_CONFETTI }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 1.5,
    dur: 2.8 + Math.random() * 1.8,
    size: `${0.5 + Math.random() * 0.8}rem`,
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '4px' : '0',  // circle / rect / diamond
  })));

  useEffect(() => {
    if (choreSettings.soundCelebrations) playFanfare();
    const t = setTimeout(clearStarCelebration, 5500);
    return () => clearTimeout(t);
  // choreSettings.soundCelebrations intentionally read once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearStarCelebration, playFanfare]);

  if (!choreSettings.showAnimations) { clearStarCelebration(); return null; }

  return (
    <div
      className="star-cel-overlay"
      onClick={clearStarCelebration}
      role="dialog" aria-modal="true" aria-label="Star earned celebration"
      style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.72)' }}
    >
      {/* Golden confetti rain */}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', top: 0, left: c.left,
          width: c.size, height: c.size,
          background: c.color,
          borderRadius: c.shape,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.dur}s`,
          animation: `goldenConfetti ${c.dur}s linear ${c.delay}s both`,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* Shooting star streak */}
      <div style={{
        position: 'absolute', top: '22%', left: '10%',
        fontSize: '2rem', opacity: 0.9,
        animation: 'shootingStar 1.2s ease 0.2s both',
        pointerEvents: 'none',
      }}>✨</div>
      <div style={{
        position: 'absolute', top: '35%', right: '12%',
        fontSize: '1.4rem', opacity: 0.75,
        animation: 'shootingStar 1.4s ease 0.5s both',
        pointerEvents: 'none',
      }}>⭐</div>

      {/* SVG starburst ring */}
      <svg width="500" height="500" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }}>
        <circle cx="250" cy="250" r="0" fill="none" stroke="#FCD34D" strokeWidth="7"
          style={{ animation: 'starBurst 2s ease-out both' }}/>
        <circle cx="250" cy="250" r="0" fill="none" stroke="#F59E0B" strokeWidth="4" opacity="0.5"
          style={{ animation: 'starBurst 2s 0.25s ease-out both' }}/>
      </svg>

      {/* Burst star particles */}
      {burstStars.map((p) => (
        <div key={p.id} className="star-particle" style={{
          top: '50%', left: '50%',
          marginTop: '-0.75rem', marginLeft: '-0.75rem',
          fontSize: `${p.size}rem`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          '--sx': p.sx, '--sy': p.sy,
        } as React.CSSProperties}>⭐</div>
      ))}

      {/* Central content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* Mascot backflip (simulated with dance animation) */}
        <div style={{
          fontSize: '3.5rem', marginBottom: 6,
          animation: 'heroVictory 1.2s var(--ease-spring) both',
          display: 'inline-block',
        }}>🦁</div>

        <div style={{
          fontSize: '6rem', lineHeight: 1, marginBottom: 8,
          animation: 'starburstPop 0.8s var(--ease-spring) both',
          display: 'inline-block',
        }}>⭐</div>

        <h2 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '2.6rem',
          color: '#FFF', marginBottom: 8,
          textShadow: '0 0 40px rgba(245,158,11,0.9), 0 2px 8px rgba(0,0,0,0.5)',
          animation: 'starburstPop 0.6s 0.4s var(--ease-spring) both',
        }}>
          +1 Star! ⭐
        </h2>
        <p style={{
          color: '#FEF3C7', fontWeight: 800, fontSize: '1.2rem',
          fontFamily: 'Nunito, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          {childName} is amazing! ✨
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); clearStarCelebration(); }}
          style={{
            marginTop: 20, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '6px 18px', color: '#fff', fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
          id="btn-skip-star"
        >
          Skip ✕
        </button>
      </div>
    </div>
  );
};

export default StarCelebration;
