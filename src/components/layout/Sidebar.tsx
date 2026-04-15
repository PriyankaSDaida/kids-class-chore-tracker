// ─── Sidebar — Desktop/Tablet Left Navigation ─────────────────────────────────
import React from 'react';
import {
  Home, Calendar, List, Users, DollarSign,
  Settings as SettingsIcon, Volume2, VolumeX, Moon, Sun, Plus, Swords, Gamepad2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getLevel } from '../../store/types';
import type { Screen } from '../../store/types';

const NAV_ITEMS: { id: Screen; icon: React.ElementType; label: string; badge?: string }[] = [
  { id: 'dashboard', icon: Home,          label: 'Dashboard'    },
  { id: 'calendar',  icon: Calendar,      label: 'Calendar'     },
  { id: 'classes',   icon: List,          label: 'Classes'      },
  { id: 'children',  icon: Users,         label: 'Kids'         },
  { id: 'chores',    icon: Swords,        label: 'Quest Board'  },
  { id: 'games',     icon: Gamepad2,      label: 'Games'        },
  { id: 'costs',     icon: DollarSign,    label: 'Costs'        },
  { id: 'settings',  icon: SettingsIcon,  label: 'Settings'     },
];

const Sidebar: React.FC = () => {
  const {
    children, activeScreen, setScreen,
    activeChildFilter, setActiveChildFilter,
    theme, toggleTheme, soundEnabled, setSoundEnabled,
  } = useAppStore();

  // Game token count for active child
  const activeChild = children.find((c) => c.id === activeChildFilter) || children[0];
  const tokens = activeChild?.gameTokens ?? 0;

  const handleNav = (id: Screen) => setScreen(id);

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚔️</span>
        <span className="sidebar-label">Class Quest</span>
      </div>

      {/* ── Kids section ── */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Kids</div>

        <button
          className={`sidebar-child-btn ${!activeChildFilter ? 'active' : ''}`}
          onClick={() => setActiveChildFilter('')}
          id="sidebar-all-kids"
        >
          <div style={{
            width:26, height:26, borderRadius:'50%',
            background:'var(--bg-tertiary)', border:'1.5px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'0.78rem', fontWeight:800, color:'var(--text-muted)', flexShrink:0,
          }}>★</div>
          <span className="sidebar-label">All Kids</span>
        </button>

        {children.map((child) => (
          <button
            key={child.id}
            className={`sidebar-child-btn ${activeChildFilter === child.id ? 'active' : ''}`}
            onClick={() => setActiveChildFilter(activeChildFilter === child.id ? '' : child.id)}
            id={`sidebar-child-${child.id}`}
          >
            <div style={{
              width:26, height:26, borderRadius:'50%',
              background:child.color, display:'flex',
              alignItems:'center', justifyContent:'center',
              fontSize:'0.82rem', flexShrink:0,
            }}>
              {child.avatarEmoji}
            </div>
            <div className="sidebar-label" style={{ minWidth:0, flex:1, textAlign:'left' }}>
              <div style={{ fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {child.name} {child.favoriteEmoji}
              </div>
              <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:600 }}>
                Lv.{getLevel(child.xp)} · {child.xp} XP
                {(child.gameTokens ?? 0) > 0 && ` · 🎮 ${child.gameTokens}`}
              </div>
            </div>
          </button>
        ))}

        <button
          className="sidebar-child-btn"
          onClick={() => setScreen('children')}
          id="sidebar-add-kid"
          style={{ color:'var(--text-muted)' }}
        >
          <div style={{
            width:26, height:26, borderRadius:'50%',
            border:'1.5px dashed var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <Plus size={12}/>
          </div>
          <span className="sidebar-label" style={{ fontSize:'0.82rem' }}>Add Kid</span>
        </button>
      </div>

      <div style={{ height:'1px', background:'var(--border)', margin:'4px 0' }}/>

      {/* ── Navigation ── */}
      <div className="sidebar-section" style={{ paddingTop:8 }}>
        <div className="sidebar-section-label">Navigate</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeScreen === id ||
              (id === 'children' && activeScreen === 'profile');
            // Show token badge on Games nav item
            const showBadge = id === 'games' && tokens > 0;
            return (
              <button
                key={id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(id)}
                id={`sidebar-nav-${id}`}
                aria-current={isActive ? 'page' : undefined}
                style={{ position: 'relative' }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8}/>
                <span className="sidebar-label">{label}</span>
                {showBadge && (
                  <span style={{
                    marginLeft: 'auto', background: '#7C3AED', color: '#fff',
                    borderRadius: 999, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 900,
                  }}>
                    {tokens}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ flex:1 }}/>

      {/* ── Footer: sound + theme ── */}
      <div className="sidebar-footer">
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute' : 'Enable sounds'}
          id="sidebar-sound-toggle"
        >
          {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={toggleTheme}
          title="Toggle theme"
          id="sidebar-theme-toggle"
        >
          {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        <span className="sidebar-label" style={{
          fontSize:'0.6rem', color:'var(--text-muted)', marginLeft:'auto', fontWeight:600,
        }}>v2.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
