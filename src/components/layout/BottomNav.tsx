// ─── BottomNav — Mobile-Only Tab Bar ──────────────────────────────────────────
import React from 'react';
import { Home, List, Swords, Gamepad2, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';
import type { Screen } from '../../store/types';

const TABS: { id: Screen; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: Home,     label: 'Home'   },
  { id: 'classes',   icon: List,     label: 'Classes'},
  { id: 'chores',    icon: Swords,   label: 'Quests' },
  { id: 'shop',      icon: ShoppingBag, label: 'Shop'},
  { id: 'games',     icon: Gamepad2, label: 'Games'  },
];

const BottomNav: React.FC = () => {
  const { activeScreen, setScreen, children, activeChildFilter } = useAppStore();
  const { playTick } = useSound();

  // Token badge for Games tab
  const activeChild = children.find((c) => c.id === activeChildFilter) || children[0];
  const tokens = activeChild?.gameTokens ?? 0;

  if (activeScreen === 'profile' || activeScreen === 'settings') return null;

  const handleNav = (id: Screen) => { playTick(); setScreen(id); };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = activeScreen === id;
        const showBadge = id === 'games' && tokens > 0;
        return (
          <button
            key={id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(id)}
            id={`nav-${id}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            style={{ position: 'relative' }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8}/>
            <span className="nav-label">{label}</span>
            {isActive && <div className="nav-active-dot"/>}
            {/* Token badge */}
            {showBadge && (
              <div style={{
                position: 'absolute', top: 2, right: 8,
                background: '#7C3AED', color: '#fff', borderRadius: 999,
                padding: '0 5px', fontSize: '0.55rem', fontWeight: 900,
                minWidth: 16, textAlign: 'center', lineHeight: '16px', height: 16,
              }}>
                {tokens}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
