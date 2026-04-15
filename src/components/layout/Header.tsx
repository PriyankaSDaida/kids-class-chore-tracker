// ─── Header — Class Quest Branding ────────────────────────────────────────────
import React from 'react';
import { Moon, Sun, Bell, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Header: React.FC = () => {
  const { theme, toggleTheme, children, activeChildFilter, setActiveChildFilter,
          soundEnabled, setSoundEnabled } = useAppStore();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="header-logo">
          <span style={{ fontSize:'1.4rem' }}>🦁</span>
          <span>Class Quest</span>
        </div>

        {/* Child filter pills */}
        {children.length > 1 && (
          <div className="child-filter-bar" style={{ flex:1, marginLeft:'12px', marginRight:'8px' }}>
            <button
              className={`child-pill ${!activeChildFilter ? 'active' : ''}`}
              onClick={() => setActiveChildFilter('')}
              id="pill-all"
            >
              All
            </button>
            {children.map((c) => (
              <button
                key={c.id}
                className={`child-pill ${activeChildFilter === c.id ? 'active' : ''}`}
                onClick={() => setActiveChildFilter(activeChildFilter === c.id ? '' : c.id)}
                style={{ '--pill-color': c.color } as React.CSSProperties}
                id={`pill-child-${c.id}`}
              >
                {c.avatarEmoji} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="header-actions">
          <button className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            id="btn-sound-toggle">
            {soundEnabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm"
            onClick={toggleTheme} title="Toggle theme" id="btn-theme-toggle">
            {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
