// ─── TopBar — Desktop-Only Header with Search + Notifications ─────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

const SCREEN_TITLES: Record<string, string> = {
  dashboard: '🏠 Dashboard',
  calendar:  '📅 Calendar',
  classes:   '📋 All Classes',
  children:  '👧 My Kids',
  costs:     '💰 Cost Tracker',
  settings:  '⚙️ Settings',
  profile:   'Profile',
};

const TopBar: React.FC = () => {
  const {
    activeScreen, activeProfileChildId,
    globalSearch, setGlobalSearch,
    notifications, markAllNotificationsRead, clearNotifications,
    children, activeChildFilter,
  } = useAppStore();

  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeChild = activeChildFilter
    ? children.find((c) => c.id === activeChildFilter)
    : activeProfileChildId
    ? children.find((c) => c.id === activeProfileChildId)
    : null;

  const pageTitle = activeScreen === 'profile' && activeChild
    ? `${activeChild.name} ${activeChild.favoriteEmoji}`
    : SCREEN_TITLES[activeScreen] ?? 'Class Quest';

  const handleBellClick = () => {
    if (!showNotifs) markAllNotificationsRead();
    setShowNotifs((v) => !v);
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="top-bar">
      {/* Page title */}
      <span className="topbar-page-title">{pageTitle}</span>

      {/* Global search */}
      <div className="topbar-search">
        <Search size={14} className="topbar-search-icon" style={{
          position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
          color:'var(--text-muted)', pointerEvents:'none',
        }}/>
        <input
          type="search"
          placeholder="Search classes, kids, locations…"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          id="topbar-search-input"
          style={{ paddingLeft:36 }}
        />
      </div>

      {/* Right actions */}
      <div className="topbar-right">
        {/* Active child chip */}
        {activeChild && (
          <div className="topbar-child-chip">
            <span style={{ fontSize:'1rem' }}>{activeChild.avatarEmoji}</span>
            <span>{activeChild.name}</span>
          </div>
        )}

        {/* Notification bell */}
        <div ref={bellRef} style={{ position:'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleBellClick}
            id="btn-notif-bell"
            title="Notifications"
          >
            <Bell size={18}/>
            {unreadCount > 0 && (
              <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div className="notif-dropdown">
              {/* Header */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 16px 10px', borderBottom:'1.5px solid var(--border)',
                position:'sticky', top:0, background:'var(--bg-card)',
              }}>
                <span style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                <div style={{ display:'flex', gap:4 }}>
                  {notifications.length > 0 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={clearNotifications}
                      style={{ fontSize:'0.72rem' }}
                      id="btn-clear-notifs"
                    >
                      Clear
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setShowNotifs(false)}>
                    <X size={14}/>
                  </button>
                </div>
              </div>

              {/* Items */}
              {notifications.length === 0 ? (
                <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🔔</div>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 20).map((notif) => (
                  <div key={notif.id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                    <span style={{ fontSize:'1.2rem', flexShrink:0 }}>
                      {notif.type === 'badge' ? '🏆' : notif.type === 'attended' ? '✅' : '🔔'}
                    </span>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.82rem', fontFamily:'Nunito, sans-serif' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:2 }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:4 }}>
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
