// ─── Class Quest Mascot — Leo the Lion Cub ────────────────────────────────────
// Used in empty states, onboarding, and celebrations
import React from 'react';

interface MascotProps {
  size?: number;
  mood?: 'happy' | 'celebrate' | 'thinking';
  animate?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ size = 100, mood = 'happy', animate = true }) => (
  <div style={{ display: 'inline-block' }} className={animate ? 'anim-wiggle' : ''}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mane (soft outer glow ring) */}
      <circle cx="50" cy="54" r="34" fill="#FDE68A" opacity="0.55"/>
      {/* Ears */}
      <circle cx="27" cy="27" r="11" fill="#F59E0B"/>
      <circle cx="73" cy="27" r="11" fill="#F59E0B"/>
      <circle cx="27" cy="27" r="6.5" fill="#FDE68A"/>
      <circle cx="73" cy="27" r="6.5" fill="#FDE68A"/>
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#FCD34D"/>
      {/* Eyes */}
      <circle cx="39" cy="46" r="8" fill="white"/>
      <circle cx="61" cy="46" r="8" fill="white"/>
      <circle cx="40.5" cy="46.5" r="5.5" fill="#1C1917"/>
      <circle cx="62.5" cy="46.5" r="5.5" fill="#1C1917"/>
      {/* Eye shines */}
      <circle cx="42.5" cy="44" r="2" fill="white"/>
      <circle cx="64.5" cy="44" r="2" fill="white"/>
      {/* Nose */}
      <ellipse cx="50" cy="56" rx="4.5" ry="3.5" fill="#F87171"/>
      {/* Mouth — changes by mood */}
      {mood === 'happy' && (
        <path d="M43 62 Q50 69 57 62" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      )}
      {mood === 'celebrate' && (
        <>
          <path d="M41 61 Q50 71 59 61" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M46 66 L46 70 M50 67 L50 72 M54 66 L54 70" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}
      {mood === 'thinking' && (
        <path d="M44 64 Q50 61 56 64" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      )}
      {/* Whiskers */}
      <line x1="16" y1="55" x2="36" y2="57" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="61" x2="36" y2="60" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="64" y1="57" x2="84" y2="55" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="64" y1="60" x2="84" y2="61" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Crown for celebrate mood */}
      {mood === 'celebrate' && (
        <path d="M30 28 L35 18 L42 25 L50 14 L58 25 L65 18 L70 28 Z"
          fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
      )}
      {/* Sparkles */}
      {mood === 'celebrate' && (
        <>
          <text x="82" y="20" fontSize="12" style={{ animation: 'wave 2s infinite' }}>✨</text>
          <text x="6"  y="25" fontSize="10" style={{ animation: 'wave 2.5s infinite' }}>⭐</text>
        </>
      )}
    </svg>
  </div>
);

export default Mascot;
