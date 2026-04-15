// ─── HeartCelebration — Full-Screen Rising Hearts ────────────────────────────
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';

const NUM_HEARTS = 18;

const HeartCelebration: React.FC<{ childName: string }> = ({ childName }) => {
  const { clearHeartCelebration, choreSettings } = useAppStore();
  const { playChime } = useSound();

  useEffect(() => {
    playChime();
    const t = setTimeout(clearHeartCelebration, 3800);
    return () => clearTimeout(t);
  }, []);

  if (!choreSettings.showAnimations) {
    clearHeartCelebration();
    return null;
  }

  const particles = Array.from({ length: NUM_HEARTS }, (_, i) => ({
    id: i,
    left:     `${5 + Math.random() * 90}%`,
    delay:    Math.random() * 0.8,
    dur:      2.2 + Math.random() * 1.2,
    size:     1.4 + Math.random() * 1.6,
    startRot: `${-20 + Math.random() * 40}deg`,
    endRot:   `${-40 + Math.random() * 80}deg`,
    endScale: 0.3 + Math.random() * 0.6,
  }));

  return (
    <div
      className="heart-cel-overlay"
      onClick={clearHeartCelebration}
      role="dialog" aria-modal="true" aria-label="Heart earned celebration"
    >
      {/* Rising hearts */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="heart-particle"
          style={{
            left: p.left,
            fontSize: `${p.size}rem`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--start-rot': p.startRot,
            '--end-rot':   p.endRot,
            '--end-scale': p.endScale,
          } as React.CSSProperties}
        >
          ❤️
        </div>
      ))}

      {/* Central message */}
      <div className="heart-cel-content">
        <div style={{ fontSize:'5rem', marginBottom:12 }}>❤️</div>
        <h2 style={{
          fontFamily:'Nunito, sans-serif', fontWeight:900, fontSize:'2rem',
          color:'#BE185D', marginBottom:8, textShadow:'0 2px 8px rgba(190,24,93,0.3)',
        }}>
          +1 Heart!
        </h2>
        <p style={{ color:'#9D174D', fontWeight:700, fontSize:'1.1rem', fontFamily:'Nunito, sans-serif' }}>
          {childName} earned a heart! 🎉
        </p>
        <p style={{ color:'#BE185D', fontSize:'0.82rem', marginTop:8, opacity:0.75 }}>
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
};

export default HeartCelebration;
