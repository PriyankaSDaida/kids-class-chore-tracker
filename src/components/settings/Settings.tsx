// ─── Settings Screen (with Chore Controls) ────────────────────────────────────
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';
import PinPad from '../chores/PinPad';

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id: string }> = ({ checked, onChange, id }) => (
  <label className="toggle" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}/>
    <div className="toggle-track"/>
    <div className="toggle-thumb"/>
  </label>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{
    fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.78rem',
    color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em',
    marginBottom:10, marginTop:8,
  }}>{children}</h3>
);

type PinStep = 'idle' | 'set-new' | 'confirm-new' | 'done';

const Settings: React.FC = () => {
  const {
    soundEnabled, setSoundEnabled,
    theme, toggleTheme,
    clearNotifications, setScreen,
    choreSettings, updateChoreSettings,
    children, choreCompletions,
  } = useAppStore();
  const { showToast } = useToast();
  const [showReset,  setShowReset]  = useState(false);
  const [pinStep,    setPinStep]    = useState<PinStep>('idle');
  const [newPinTemp, setNewPinTemp] = useState('');

  const handleExport = () => {
    try {
      const raw   = localStorage.getItem('kids-class-tracker-store') ?? '{}';
      const blob  = new Blob([raw], { type:'application/json' });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement('a');
      a.href      = url;
      a.download  = `class-quest-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported! 📁', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleResetAll = () => {
    localStorage.removeItem('kids-class-tracker-store');
    window.location.reload();
  };

  // Family chore report
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().slice(0,10);

  const familyReport = children.map((c) => {
    const thisWeek = choreCompletions.filter((cc) => cc.childId === c.id && cc.date >= weekStartStr);
    const total    = thisWeek.reduce((s, cc) => s + cc.points, 0);
    return { child:c, count:thisWeek.length, total };
  });

  const [showReport, setShowReport] = useState(false);

  return (
    <main className="page-content" id="screen-settings" style={{ maxWidth:680 }}>
      <button className="btn btn-ghost btn-sm"
        onClick={() => setScreen('dashboard')} id="btn-settings-back"
        style={{ marginBottom:16, gap:6 }}>
        <ArrowLeft size={15}/> Back
      </button>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', marginBottom:4 }}>⚙️ Settings</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
          Preferences, chore controls, data management, and app info
        </p>
      </div>

      {/* ── Appearance ── */}
      <SectionTitle>Appearance</SectionTitle>
      <div className="settings-group" style={{ marginBottom:20 }}>
        <div className="settings-row">
          <div>
            <div className="settings-label">Theme</div>
            <div className="settings-desc">Currently: {theme === 'dark' ? '🌙 Dark Mode (Night Quest)' : '☀️ Light Mode'}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme} id="settings-theme-btn">
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* ── Sound ── */}
      <SectionTitle>Sound & Haptics</SectionTitle>
      <div className="settings-group" style={{ marginBottom:20 }}>
        <div className="settings-row">
          <div>
            <div className="settings-label">Sound Effects</div>
            <div className="settings-desc">Web Audio chimes, fanfares, and ticks on key actions</div>
          </div>
          <Toggle checked={soundEnabled} onChange={setSoundEnabled} id="settings-sound"/>
        </div>
      </div>

      {/* ── Chore Controls ── */}
      <SectionTitle>🗂 Chore Controls</SectionTitle>
      <div className="settings-group" style={{ marginBottom:20 }}>

        {/* Kids can mark their own chores */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Kids can mark their own chores</div>
            <div className="settings-desc">
              {choreSettings.kidsCanMarkChores
                ? 'Anyone can tap Done — no PIN required'
                : 'Parent PIN required to mark a chore complete'}
            </div>
          </div>
          <Toggle
            checked={choreSettings.kidsCanMarkChores}
            onChange={(v) => updateChoreSettings({ kidsCanMarkChores:v })}
            id="settings-kids-mark"/>
        </div>

        {/* Celebration animations */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Celebration animations</div>
            <div className="settings-desc">Heart ❤️, Star ⭐, and Gift 🎁 full-screen animations</div>
          </div>
          <Toggle
            checked={choreSettings.showAnimations}
            onChange={(v) => updateChoreSettings({ showAnimations:v })}
            id="settings-animations"/>
        </div>

        {/* Points per heart */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Points per ❤️ Heart</div>
            <div className="settings-desc">Current: {choreSettings.pointsPerHeart} pts → 1 heart</div>
          </div>
          <input type="number" min={5} max={200} step={5}
            className="input" style={{ width:72 }}
            value={choreSettings.pointsPerHeart}
            onChange={(e) => updateChoreSettings({ pointsPerHeart: Math.max(5, parseInt(e.target.value)||25) })}
            id="settings-pts-heart"/>
        </div>

        {/* Hearts per star */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Hearts per ⭐ Star</div>
            <div className="settings-desc">Current: {choreSettings.heartsPerStar} ❤️ → 1 star</div>
          </div>
          <input type="number" min={2} max={20} step={1}
            className="input" style={{ width:72 }}
            value={choreSettings.heartsPerStar}
            onChange={(e) => updateChoreSettings({ heartsPerStar: Math.max(2, parseInt(e.target.value)||5) })}
            id="settings-hearts-star"/>
        </div>

        {/* Stars per gift */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Stars per 🎁 Gift</div>
            <div className="settings-desc">Current: {choreSettings.starsPerGift} ⭐ → gift milestone</div>
          </div>
          <input type="number" min={2} max={20} step={1}
            className="input" style={{ width:72 }}
            value={choreSettings.starsPerGift}
            onChange={(e) => updateChoreSettings({ starsPerGift: Math.max(2, parseInt(e.target.value)||5) })}
            id="settings-stars-gift"/>
        </div>

        {/* Parent PIN */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Parent PIN</div>
            <div className="settings-desc">
              {choreSettings.parentPin
                ? `PIN set: ${'●'.repeat(choreSettings.parentPin.length)}`
                : 'No PIN set — confirmations are open to all'}
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="btn btn-secondary btn-sm"
              onClick={() => setPinStep('set-new')} id="settings-set-pin">
              {choreSettings.parentPin ? 'Change' : 'Set PIN'}
            </button>
            {choreSettings.parentPin && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { updateChoreSettings({ parentPin:'' }); showToast('PIN cleared', 'info'); }}
                id="settings-clear-pin">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Family report */}
        <div className="settings-row">
          <div>
            <div className="settings-label">Family Chore Report</div>
            <div className="settings-desc">Points earned per child this week</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReport(!showReport)} id="settings-family-report">
            📊 View
          </button>
        </div>

        {/* Family report inline */}
        {showReport && (
          <div style={{ padding:'12px 20px 16px', borderTop:'1.5px solid var(--border)' }}>
            {familyReport.length === 0 ? (
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>No chore data this week</div>
            ) : familyReport.map(({ child, count, total }) => (
              <div key={child.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:child.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>
                  {child.avatarEmoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.85rem' }}>{child.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{count} chore{count !== 1 ? 's' : ''} this week</div>
                </div>
                <div style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', color: total >= 0 ? 'var(--green)' : 'var(--red)', fontSize:'1rem' }}>
                  {total >= 0 ? '+' : ''}{total} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Data ── */}
      <SectionTitle>Data & Privacy</SectionTitle>
      <div className="settings-group" style={{ marginBottom:20 }}>
        <div className="settings-row">
          <div>
            <div className="settings-label">Export Data</div>
            <div className="settings-desc">Download all your class and chore data as a JSON backup</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} id="settings-export">
            📥 Export
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Clear Notifications</div>
            <div className="settings-desc">Remove all notification history</div>
          </div>
          <button className="btn btn-secondary btn-sm"
            onClick={() => { clearNotifications(); showToast('Cleared!', 'info'); }}
            id="settings-clear-notifs">
            Clear
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label" style={{ color:'var(--red)' }}>Reset All Data</div>
            <div className="settings-desc">⚠️ Permanently deletes all kids, classes, XP, chores, and rewards</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowReset(true)} id="settings-reset">
            Reset
          </button>
        </div>
      </div>

      {/* ── About ── */}
      <SectionTitle>About</SectionTitle>
      <div className="settings-group">
        <div className="settings-row">
          <div>
            <div className="settings-label">🦁 Class Quest</div>
            <div className="settings-desc">Version 1.1 · Class Tracker + Chore Rewards · React + Zustand + Vite</div>
          </div>
          <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', background:'var(--bg-tertiary)', padding:'4px 10px', borderRadius:999 }}>v1.1</span>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Data Storage</div>
            <div className="settings-desc">All data stays in your browser — nothing leaves your device</div>
          </div>
          <span style={{ fontSize:'1.3rem' }}>🔒</span>
        </div>
      </div>

      {/* Reset confirmation */}
      {showReset && (
        <ConfirmDialog
          title="Reset everything?"
          description="This permanently deletes all children, classes, XP, badges, chores, and reward history. There is no undo."
          confirmLabel="Reset All Data"
          destructive
          onConfirm={handleResetAll}
          onCancel={() => setShowReset(false)}
        />
      )}

      {/* PIN setup flow */}
      {(pinStep === 'set-new' || pinStep === 'confirm-new') && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth:340 }}>
            <div className="modal-handle"/>
            {pinStep === 'set-new' ? (
              <PinPad
                label="Set new Parent PIN"
                subtitle="Choose a 4-digit PIN"
                onConfirm={(pin) => { setNewPinTemp(pin); setPinStep('confirm-new'); }}
                onCancel={() => setPinStep('idle')}
              />
            ) : (
              <PinPad
                label="Confirm PIN"
                subtitle="Enter the same PIN again"
                expectedPin={newPinTemp}
                onConfirm={() => {
                  updateChoreSettings({ parentPin: newPinTemp });
                  showToast('PIN set! 🔒', 'success');
                  setPinStep('idle');
                }}
                onCancel={() => setPinStep('idle')}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
