// ─── StarCelebration — Full-Screen Starburst + Mascot Dance ──────────────────
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';
import Mascot from '../ui/Mascot';

const NUM_STARS = 20;

const StarCelebration: React.FC<{ childName: string }> = ({ childName }) => {
  const { clearStarCelebration, choreSettings } = useAppStore();
  const { playFanfare } = useSound();

  useEffect(() => {
    playFanfare();
    const t = setTimeout(clearStarCelebration, 4800);
    return () => clearTimeout(t);
  }, []);

  if (!choreSettings.showAnimations) {
    clearStarCelebration();
    return null;
  }

  const particles = Array.from({ length: NUM_STARS }, (_, i) => {
    const angle = (i / NUM_STARS) * 360;
    const dist  = 120 + Math.random() * 180;
    const rad   = (angle * Math.PI) / 180;
    return {
      id:    i,
      sx:    `${Math.cos(rad) * dist}px`,
      sy:    `${Math.sin(rad) * dist}px`,
      delay: Math.random() * 0.5,
      dur:   1.4 + Math.random() * 1.0,
      size:  1.2 + Math.random() * 1.4,
    };
  });

  return (
    <div
      className="star-cel-overlay"
      onClick={clearStarCelebration}
      role="dialog" aria-modal="true" aria-label="Star earned celebration"
    >
      {/* SVG starburst ring */}
      <svg
        width="500" height="500"
        style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}
      >
        <circle
          cx="250" cy="250" r="0" fill="none"
          stroke="#FCD34D" strokeWidth="6"
          style={{ animation:'starBurst 1.5s ease-out both', animationFillMode:'both' }}
        />
        {/* Second ring */}
        <circle
          cx="250" cy="250" r="0" fill="none"
          stroke="#F59E0B" strokeWidth="3" opacity="0.6"
          style={{ animation:'starBurst 1.5s 0.2s ease-out both' }}
        />
      </svg>

      {/* Burst particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="star-particle"
          style={{
            top:'50%', left:'50%', marginTop:'-0.75rem', marginLeft:'-0.75rem',
            fontSize:`${p.size}rem`,
            animationDelay:`${p.delay}s`,
            animationDuration:`${p.dur}s`,
            '--sx': p.sx, '--sy': p.sy,
          } as React.CSSProperties}
        >
          ⭐
        </div>
      ))}

      {/* Central content */}
      <div style={{ textAlign:'center', position:'relative', zIndex:2 }}>
        {/* Dancing mascot */}
        <div className="star-cel-mascot">
          <Mascot size={100} mood="happy" animate/>
        </div>

        <div style={{ fontSize:'4rem', margin:'8px 0' }}>⭐</div>
        <h2 style={{
          fontFamily:'Nunito, sans-serif', fontWeight:900, fontSize:'2.2rem',
          color:'#92400E', marginBottom:8, textShadow:'0 2px 8px rgba(245,158,11,0.4)',
        }}>
          +1 Star!
        </h2>
        <p style={{ color:'#78350F', fontWeight:700, fontSize:'1.1rem', fontFamily:'Nunito, sans-serif' }}>
          {childName} earned a star! ✨ Amazing!
        </p>
        <p style={{ color:'#92400E', fontSize:'0.82rem', marginTop:8, opacity:0.75 }}>
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
};

export default StarCelebration;
