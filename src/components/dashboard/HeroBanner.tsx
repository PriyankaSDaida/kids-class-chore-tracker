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

const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hr < 18) return { text: 'Good afternoon', emoji: '😎' };
  return { text: 'Good evening', emoji: '🌙' };
};

const MOODS = ['😄', '🙂', '😐', '😔', '😫'];

const HeroBanner: React.FC = () => {
  const { classes, children, activeChildFilter, addMoodEntry, attendanceRecords } = useAppStore();
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

  // Determine streak
  let streak = 0;
  if (activeChild) {
    const childRecords = attendanceRecords.filter((r) => {
      const cls = classes.find((c) => c.id === r.classId);
      return cls?.childId === activeChild.id && r.status === 'attended';
    }).sort((a, b) => a.date.localeCompare(b.date));
    for (let i = childRecords.length - 1; i >= 0; i--) {
      if (childRecords[i].status === 'attended') streak++;
      else break;
    }
  }

  const todayMood = activeChild?.moodLog.find(m => m.date === today)?.emoji;

  const handleMoodClick = (m: string) => {
    if (activeChild) addMoodEntry(activeChild.id, { date: today, emoji: m });
  };

  return (
    <div className="hero-banner" style={{ background: gradient, backgroundSize: '200% 200%', animation: 'bgPan 8s ease-in-out infinite', position: 'relative' }}>
      
      {/* Top right Mood Widget */}
      {activeChild && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 999, padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {todayMood ? (
             <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 8px', color: '#111827' }}>
               Feeling {todayMood} today
             </span>
          ) : (
            <>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, paddingRight: 4, color: '#111827' }}>Mood:</span>
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => handleMoodClick(m)}
                  style={{
                    fontSize: '1.2rem', padding: 2, background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'transform 0.15s', lineHeight: 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >{m}</button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Streak Badge */}
      {streak >= 3 && (
        <div style={{
          position: 'absolute', bottom: 16, left: 32, zIndex: 10,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: 999, color: '#fff',
          fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)'
        }}>
          🔥 {streak} Day Streak!
        </div>
      )}

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
