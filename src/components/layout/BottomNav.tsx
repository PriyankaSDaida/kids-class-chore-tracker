// ─── BottomNav — Mobile-Only Tab Bar ──────────────────────────────────────────
import React from 'react';
import { Home, Calendar, List, Users, CheckSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';
import type { Screen } from '../../store/types';

const TABS: { id: Screen; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: Home,         label: 'Home'   },
  { id: 'calendar',  icon: Calendar,     label: 'Cal'    },
  { id: 'classes',   icon: List,         label: 'Classes'},
  { id: 'children',  icon: Users,        label: 'Kids'   },
  { id: 'chores',    icon: CheckSquare,  label: 'Chores' },
];

const BottomNav: React.FC = () => {
  const { activeScreen, setScreen } = useAppStore();
  const { playTick } = useSound();

  // Profile and settings are full-page — hide bottom bar there
  if (activeScreen === 'profile' || activeScreen === 'settings') return null;

  const handleNav = (id: Screen) => { playTick(); setScreen(id); };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = activeScreen === id;
        return (
          <button
            key={id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(id)}
            id={`nav-${id}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8}/>
            <span className="nav-label">{label}</span>
            {isActive && <div className="nav-active-dot"/>}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
