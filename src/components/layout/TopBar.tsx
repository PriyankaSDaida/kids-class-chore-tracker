// ─── TopBar — Desktop-Only Header with Search + Notifications ─────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, LogOut, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

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
  const [showAccount, setShowAccount] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const { user, signOut } = useAuthStore();

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
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccount(false);
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
            className="btn btn-ghost btn-icon topbar-bell"
            onClick={handleBellClick}
            id="btn-topbar-bell"
            title="Notifications"
          >
            <Bell size={20} className={unreadCount > 0 ? "bell-shake" : ""} />
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

        {/* Account Avatar Dropdown */}
        <div ref={accountRef} style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowAccount(!showAccount)}
            style={{ 
              borderRadius: '50%', width: 36, height: 36, padding: 0, 
              background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {activeChild ? activeChild.avatarEmoji : (user?.email?.[0].toUpperCase() || '👤')}
          </button>

          {showAccount && (
            <div className="notif-dropdown" style={{ width: 260, padding: 16 }}>
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>
                  {activeChild ? activeChild.avatarEmoji : (user?.email?.[0].toUpperCase() || '👤')}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }}>
                  {activeChild ? activeChild.name : 'Parent'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.email || 'Authenticated User'}
                </div>
              </div>

              <div style={{ height: 1.5, background: 'var(--border)', margin: '12px -16px' }} />

              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-primary)', padding: '10px 12px' }}
                onClick={() => {
                  navigator.clipboard.writeText(user?.id || '');
                }}
              >
                <Copy size={16} /> <span style={{ marginLeft: 10, fontSize: '0.85rem' }}>Copy Device/User ID</span>
              </button>
              
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--red)', padding: '10px 12px' }}
                onClick={() => signOut()}
              >
                <LogOut size={16} /> <span style={{ marginLeft: 10, fontSize: '0.85rem' }}>Switch User</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
