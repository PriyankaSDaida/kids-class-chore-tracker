// ─── HeroBanner — Dashboard Hero with Category-Matched Gradient ───────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { todayStr, formatTime } from '../../utils/dateUtils';
import Mascot from '../ui/Mascot';
import type { Category } from '../../store/types';

const CAT_GRADIENTS: Record<Category | 'default', string> = {
  Sport:    'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
  Music:    'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
  Art:      'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
  Academic: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  Dance:    'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
  Other:    'linear-gradient(135deg, #475569 0%, #334155 100%)',
  default:  'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
};

const getGreeting = (): { text: string; emoji: string } => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning',   emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '⛅' };
  return           { text: 'Good evening',   emoji: '🌙' };
};

const HeroBanner: React.FC = () => {
  const { classes, children, activeChildFilter } = useAppStore();
  const { text, emoji } = getGreeting();
  const today = todayStr();

  const activeChild = activeChildFilter
    ? children.find((c) => c.id === activeChildFilter)
    : children[0];

  // Next upcoming class today
  const todayClasses = classes
    .filter((c) =>
      c.date === today && c.status === 'upcoming' &&
      (activeChildFilter ? c.childId === activeChildFilter : true)
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const nextClass = todayClasses[0];
  const gradient  = nextClass ? CAT_GRADIENTS[nextClass.category] : CAT_GRADIENTS.default;

  return (
    <div className="hero-banner" style={{ background: gradient }}>
      {/* Left: text content */}
      <div className="hero-banner-text">
        <div style={{
          fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase',
          letterSpacing:'0.1em', opacity:0.8, marginBottom:8,
          fontFamily:'Nunito, sans-serif',
        }}>
          {text} {emoji}
        </div>

        <h1 style={{
          color:'#fff', fontSize:'1.7rem', fontWeight:900, lineHeight:1.2,
          fontFamily:'Nunito, sans-serif', marginBottom:12,
        }}>
          {activeChild ? `${activeChild.name}${activeChild.favoriteEmoji ? ' '+activeChild.favoriteEmoji : ''}` : 'Hey there'}!
        </h1>

        {nextClass ? (
          <div>
            <div style={{ color:'rgba(255,255,255,0.95)', fontWeight:700, fontSize:'1rem', marginBottom:4 }}>
              {nextClass.name} at {formatTime(nextClass.time)}
            </div>
            {(nextClass.location || nextClass.instructorName) && (
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.82rem' }}>
                {nextClass.location && `📍 ${nextClass.location}`}
                {nextClass.location && nextClass.instructorName && ' · '}
                {nextClass.instructorName && `👤 ${nextClass.instructorName}`}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color:'rgba(255,255,255,0.85)', fontWeight:600, fontSize:'0.95rem' }}>
            {todayClasses.length === 0 ? 'No classes today — enjoy! 🎉' : 'All done for today! ✅'}
          </div>
        )}

        {/* Today class count pill */}
        {todayClasses.length > 0 && (
          <div style={{
            marginTop:14, display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)',
            padding:'6px 14px', borderRadius:999,
            fontSize:'0.8rem', fontWeight:800, fontFamily:'Nunito, sans-serif', color:'#fff',
          }}>
            📅 {todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''} today
          </div>
        )}
      </div>

      {/* Right: mascot */}
      <div className="hero-banner-mascot">
        <Mascot size={110} mood={nextClass ? 'happy' : 'thinking'} animate/>
      </div>
    </div>
  );
};

export default HeroBanner;
