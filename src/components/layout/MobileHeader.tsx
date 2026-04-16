// ─── MobileHeader — Mobile-Only App Bar (replaces old Header.tsx) ─────────────
import React from 'react';
import { Moon, Sun, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const MobileHeader: React.FC = () => {
  const {
    theme, toggleTheme, soundEnabled, setSoundEnabled,
    children, activeChildFilter, setActiveChildFilter,
  } = useAppStore();

  return (
    <header className="mobile-header">
      <div className="mobile-header-inner">
        {/* Logo */}
        <div className="mobile-header-logo">
          <span>🦁</span>
          <span>Class Quest</span>
        </div>
        {/* Controls */}
        <div style={{ display:'flex', gap:4 }}>
          <button className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setSoundEnabled(!soundEnabled)} id="mobile-sound">
            {soundEnabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm"
            onClick={toggleTheme} id="mobile-theme">
            {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm"
            onClick={() => useAuthStore.getState().signOut()} id="mobile-logout">
            <LogOut size={17}/>
          </button>
        </div>
      </div>

      {/* Child filter pills — only when multiple kids */}
      {children.length > 1 && (
        <div style={{ padding:'0 16px 10px', display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none' }}>
          <button
            className={`child-pill ${!activeChildFilter ? 'active' : ''}`}
            onClick={() => setActiveChildFilter('')} id="mobile-pill-all">
            All
          </button>
          {children.map((c) => (
            <button
              key={c.id}
              className={`child-pill ${activeChildFilter === c.id ? 'active' : ''}`}
              onClick={() => setActiveChildFilter(activeChildFilter === c.id ? '' : c.id)}
              style={{ '--pill-color': c.color } as React.CSSProperties}
              id={`mobile-pill-${c.id}`}
            >
              {c.avatarEmoji} {c.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
