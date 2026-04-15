// ─── Onboarding Flow ──────────────────────────────────────────────────────────
// 3-step wizard: Welcome → Add Child → Add First Class
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CHILD_COLOR_OPTIONS, CHILD_AVATAR_OPTIONS } from '../../utils/colorUtils';
import type { Child, ClassSession } from '../../store/types';

type Step = 0 | 1 | 2;

const Onboarding: React.FC = () => {
  const { addChild, addClass, completeOnboarding } = useAppStore();
  const [step, setStep] = useState<Step>(0);

  // Child form state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childColor, setChildColor] = useState(CHILD_COLOR_OPTIONS[0]);
  const [childEmoji, setChildEmoji] = useState(CHILD_AVATAR_OPTIONS[0]);

  // Class form state
  const [className, setClassName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('');

  const savedChildId = React.useRef('');

  const handleAddChild = () => {
    if (!childName.trim()) return;
    const id = crypto.randomUUID();
    savedChildId.current = id;
    const child: Child = {
      id, name: childName.trim(),
      age: parseInt(childAge) || 0,
      color: childColor,
      avatarEmoji: childEmoji,
      favoriteEmoji: '⭐',
      xp: 0, level: 1, badges: [], moodLog: [],
      points: 0, hearts: 0, stars: 0, lifetimeHearts: 0, lifetimeStars: 0,
      createdAt: new Date().toISOString(),
    };
    addChild(child);
    setStep(2);
  };

  const handleAddClass = () => {
    if (!className.trim() || !classDate || !classTime) return;
    const cls: ClassSession = {
      id: crypto.randomUUID(),
      childId: savedChildId.current,
      name: className.trim(),
      category: 'Other',
      instructorName: '',
      location: '',
      date: classDate,
      time: classTime,
      duration: 60,
      recurringFrequency: 'one-time',
      recurringGroupId: null,
      status: 'upcoming',
      notes: '',
      monthlyCost: 0,
      remindBefore: 'none',
      isRescheduled: false,
      rescheduleReason: '',
      originalDate: null,
      reaction: null,
      createdAt: new Date().toISOString(),
    };
    addClass(cls);
    completeOnboarding();
  };

  const stepContent = [
    // ── Step 0: Welcome
    <div key="welcome" className="anim-scaleIn" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'4rem', marginBottom:'16px' }}>🎒</div>
      <h1 style={{ fontSize:'1.6rem', marginBottom:'8px', color:'var(--text-primary)' }}>Welcome to<br/>KidTracker!</h1>
      <p style={{ marginBottom:'32px', color:'var(--text-secondary)' }}>
        Manage your children's classes, track progress, and stay organized — all in one place.
      </p>
      <button className="btn btn-primary w-full" onClick={() => setStep(1)} id="btn-onboarding-start">
        Get Started →
      </button>
    </div>,

    // ── Step 1: Add Child
    <div key="child" className="anim-slideUp">
      <h2 style={{ marginBottom:'6px' }}>Add Your First Child</h2>
      <p style={{ marginBottom:'24px', fontSize:'0.875rem' }}>You can add more children later.</p>
      <div className="form-group" style={{ marginBottom:'16px' }}>
        <label className="form-label">Child's Name *</label>
        <input className="input" placeholder="e.g. Emma" value={childName}
          onChange={(e) => setChildName(e.target.value)} id="input-child-name" />
      </div>
      <div className="form-group" style={{ marginBottom:'16px' }}>
        <label className="form-label">Age</label>
        <input className="input" type="number" placeholder="7" value={childAge}
          onChange={(e) => setChildAge(e.target.value)} min="1" max="18" id="input-child-age" />
      </div>
      <div className="form-group" style={{ marginBottom:'16px' }}>
        <label className="form-label">Avatar</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
          {CHILD_AVATAR_OPTIONS.map((em) => (
            <button key={em} onClick={() => setChildEmoji(em)}
              style={{ fontSize:'1.5rem', padding:'6px 10px', borderRadius:'8px', border:`2px solid ${em === childEmoji ? childColor : 'var(--border)'}`, background:'var(--bg-tertiary)', cursor:'pointer' }}>
              {em}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom:'24px' }}>
        <label className="form-label">Color</label>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {CHILD_COLOR_OPTIONS.map((c) => (
            <button key={c} onClick={() => setChildColor(c)}
              style={{ width:'32px', height:'32px', borderRadius:'50%', background:c, border:`3px solid ${c === childColor ? 'var(--text-primary)' : 'transparent'}`, cursor:'pointer' }} />
          ))}
        </div>
      </div>
      <button className="btn btn-primary w-full" onClick={handleAddChild} disabled={!childName.trim()} id="btn-save-child">
        Continue →
      </button>
    </div>,

    // ── Step 2: Add First Class
    <div key="class" className="anim-slideUp">
      <h2 style={{ marginBottom:'6px' }}>Add Your First Class 🎓</h2>
      <p style={{ marginBottom:'24px', fontSize:'0.875rem' }}>Or skip this — you can add classes anytime.</p>
      <div className="form-group" style={{ marginBottom:'16px' }}>
        <label className="form-label">Class Name *</label>
        <input className="input" placeholder="e.g. Swimming" value={className}
          onChange={(e) => setClassName(e.target.value)} id="input-class-name" />
      </div>
      <div className="form-row" style={{ marginBottom:'16px' }}>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input className="input" type="date" value={classDate}
            onChange={(e) => setClassDate(e.target.value)} id="input-class-date" />
        </div>
        <div className="form-group">
          <label className="form-label">Time *</label>
          <input className="input" type="time" value={classTime}
            onChange={(e) => setClassTime(e.target.value)} id="input-class-time" />
        </div>
      </div>
      <button className="btn btn-primary w-full" onClick={handleAddClass}
        disabled={!className.trim() || !classDate || !classTime} id="btn-save-class">
        Start Tracking! 🚀
      </button>
      <button className="btn btn-ghost w-full" style={{ marginTop:'10px' }}
        onClick={completeOnboarding} id="btn-skip-class">
        Skip for now
      </button>
    </div>,
  ];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        {/* Step dots */}
        <div className="onboarding-step-dots">
          {[0,1,2].map((i) => (
            <div key={i} className={`step-dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>
        {stepContent[step]}
      </div>
    </div>
  );
};

export default Onboarding;
