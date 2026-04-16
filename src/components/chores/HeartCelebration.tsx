// ─── HeartCelebration — Full-Screen Heart Celebration Upgrade ─────────────────
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';


const NUM_HEARTS   = 22;
const NUM_PARTICLES = 16;

const HeartCelebration: React.FC<{ childName: string }> = ({ childName }) => {
  const { clearHeartCelebration, choreSettings } = useAppStore();
  const { playChime } = useSound();

  // Compute particle positions once on mount (stable random values)
  const [risingHearts] = useState(() => Array.from({ length: NUM_HEARTS }, (_, i) => ({
    id: i,
    left:     `${3 + Math.random() * 94}%`,
    delay:    Math.random() * 1.2,
    dur:      2.4 + Math.random() * 1.4,
    size:     1.2 + Math.random() * 1.8,
    startRot: `${-25 + Math.random() * 50}deg`,
    endRot:   `${-50 + Math.random() * 100}deg`,
    endScale: 0.3 + Math.random() * 0.5,
  })));

  const [burstParticles] = useState(() => Array.from({ length: NUM_PARTICLES }, (_, i) => {
    const angle = (i / NUM_PARTICLES) * 360;
    const dist  = 80 + Math.random() * 120;
    const rad   = (angle * Math.PI) / 180;
    return {
      id: i,
      sx: `${Math.cos(rad) * dist}px`,
      sy: `${Math.sin(rad) * dist}px`,
      delay: 0.3 + Math.random() * 0.4,
      dur: 1.2 + Math.random() * 0.8,
    };
  }));

  useEffect(() => {
    if (choreSettings.soundCelebrations) playChime();
    const t = setTimeout(clearHeartCelebration, 4500);
    return () => clearTimeout(t);
  // choreSettings.soundCelebrations intentionally read once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearHeartCelebration, playChime]);

  if (!choreSettings.showAnimations) { clearHeartCelebration(); return null; }

  return (
    <div
      className="heart-cel-overlay"
      onClick={clearHeartCelebration}
      role="dialog" aria-modal="true" aria-label="Heart earned celebration"
      style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.65)' }}
    >
      {/* Rising heart particles */}
      {risingHearts.map((p) => (
        <div key={p.id} className="heart-particle" style={{
          left: p.left, fontSize: `${p.size}rem`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          '--start-rot': p.startRot,
          '--end-rot': p.endRot,
          '--end-scale': p.endScale,
        } as React.CSSProperties}>❤️</div>
      ))}

      {/* Burst particles from center */}
      {burstParticles.map((p) => (
        <div key={p.id} className="star-particle" style={{
          top: '50%', left: '50%', marginTop: '-0.6rem', marginLeft: '-0.6rem',
          fontSize: '1.2rem',
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          '--sx': p.sx, '--sy': p.sy,
        } as React.CSSProperties}>💕</div>
      ))}

      {/* Central content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* Giant heart expansion */}
        <div style={{
          fontSize: '7rem', lineHeight: 1, marginBottom: 8,
          animation: 'heartExpand 0.8s var(--ease-spring) both',
          display: 'inline-block',
        }}>❤️</div>

        {/* Mascot holding heart */}
        <div style={{ marginBottom: 12, animation: 'mascotDance 1.5s ease-in-out infinite' }}>
          <div style={{ fontSize: '3rem' }}>🦁</div>
        </div>

        <h2 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '2.4rem',
          color: '#FFF', marginBottom: 8,
          textShadow: '0 0 30px rgba(236,72,153,0.8), 0 2px 8px rgba(0,0,0,0.5)',
          animation: 'starburstPop 0.6s 0.3s var(--ease-spring) both',
        }}>
          +1 Heart! ❤️
        </h2>
        <p style={{
          color: '#FCE7F3', fontWeight: 800, fontSize: '1.2rem',
          fontFamily: 'Nunito, sans-serif', marginBottom: 6,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          {childName} earned a heart! 🎉
        </p>
        <p style={{ color: 'rgba(252,231,243,0.7)', fontSize: '0.82rem', marginTop: 6 }}>
          Tap anywhere to continue
        </p>

        {/* Skip button */}
        <button
          onClick={(e) => { e.stopPropagation(); clearHeartCelebration(); }}
          style={{
            marginTop: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '6px 18px', color: '#fff', fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
          id="btn-skip-heart"
        >
          Skip ✕
        </button>
      </div>
    </div>
  );
};

export default HeartCelebration;
