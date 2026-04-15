// ─── Time-aware Greeting Header ────────────────────────────────────────────────
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatTime } from '../../utils/dateUtils';
import { todayStr } from '../../utils/dateUtils';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '⛅' };
  return { text: 'Good evening', emoji: '🌙' };
};

const GreetingHeader: React.FC = () => {
  const { children, classes, activeChildFilter } = useAppStore();
  const { text, emoji } = getGreeting();

  const activeChild = activeChildFilter
    ? children.find((c) => c.id === activeChildFilter)
    : children[0];

  // Find the next upcoming class today
  const today = todayStr();
  const todayClasses = classes
    .filter((c) => c.date === today && c.status === 'upcoming' &&
      (activeChildFilter ? c.childId === activeChildFilter : true))
    .sort((a, b) => a.time.localeCompare(b.time));

  const nextClass = todayClasses[0];

  return (
    <div style={{ marginBottom:'16px' }} className="anim-fadeIn">
      <div style={{
        fontFamily:'Nunito, sans-serif',
        fontSize:'1.4rem',
        fontWeight:900,
        color:'var(--text-primary)',
        lineHeight:1.25,
      }}>
        {text} {activeChild ? activeChild.name : 'there'}!{' '}
        <span style={{ animation:'wave 2s ease-in-out infinite', display:'inline-block' }}>{emoji}</span>
      </div>

      {nextClass ? (
        <div style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginTop:'4px', fontWeight:600 }}>
          You have <strong style={{ color:'var(--accent)' }}>{nextClass.name}</strong> at {formatTime(nextClass.time)} today 🎉
        </div>
      ) : (
        <div style={{ fontSize:'0.875rem', color:'var(--text-muted)', marginTop:'4px' }}>
          {todayClasses.length === 0 ? 'No classes today — enjoy your free day! 😄' : 'All classes done for today! ✅'}
        </div>
      )}
    </div>
  );
};

export default GreetingHeader;
