// ─── GiftMilestoneModal — Full Celebration Takeover + Skip Button ─────────────
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';
import PinPad from './PinPad';

const BALLOON_EMOJIS  = ['🎈','🎈','🎉','🎈','🎈','🎊','🎈','💛','🎈','🎉'];
const SPARKLE_POS = [
  { top:'8%',  left:'6%',   delay:'0s'   },
  { top:'6%',  right:'6%',  delay:'0.4s' },
  { top:'38%', left:'3%',   delay:'0.8s' },
  { top:'38%', right:'3%',  delay:'0.2s' },
  { top:'70%', left:'8%',   delay:'0.6s' },
  { top:'70%', right:'8%',  delay:'1.0s' },
  { top:'86%', left:'30%',  delay:'0.3s' },
  { top:'86%', right:'30%', delay:'0.7s' },
];

type Step = 'main' | 'pin' | 'note';

const GiftMilestoneModal: React.FC<{ childId: string }> = ({ childId }) => {
  const { children, choreSettings, claimGift, snoozeGift } = useAppStore();
  const { playFanfare } = useSound();

  const [step,     setStep]     = useState<Step>('main');
  const [giftNote, setGiftNote] = useState('');
  const [lidGone,  setLidGone]  = useState(false);

  const child = children.find((c) => c.id === childId);

  useEffect(() => {
    if (!child) return;
    if (choreSettings.soundCelebrations) playFanfare();
    // Pop the lid after 1.2s
    const t = setTimeout(() => setLidGone(true), 1200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  if (!child) return null;

  const handleClaim = () => {
    if (choreSettings.parentPin) setStep('pin');
    else setStep('note');
  };

  const handlePinConfirm = () => setStep('note');

  const handleConfirmGift = () => {
    playFanfare();
    claimGift(childId, giftNote);
  };


  return (
    <div className="gift-overlay" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.75)' }}>

      {/* ── Floating balloons (full-screen) ── */}
      {BALLOON_EMOJIS.map((emoji, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute',
          left: `${4 + i * 9.5}%`,
          bottom: 0,
          fontSize: '2.5rem',
          animation: `balloonFloat ${5 + i * 0.4}s ease-in ${i * 0.3}s infinite`,
          '--b-rot': `${-12 + i * 3}deg`,
          pointerEvents: 'none',
        } as React.CSSProperties}>
          {emoji}
        </div>
      ))}

      {/* ── Main panel ── */}
      <div className="gift-panel" style={{ position: 'relative', overflow: 'hidden', zIndex: 2 }}>

        {/* Sparkles */}
        {SPARKLE_POS.map((pos, i) => (
          <div key={i} className="gift-sparkle"
            style={{ ...pos, animationDelay: pos.delay, position: 'absolute' }}>✨</div>
        ))}

        {step === 'main' && (
          <>
            {/* Gift box with lid pop */}
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: 8 }}>
              {/* Lid (pops off) */}
              <div style={{
                fontSize: '3rem', position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                animation: lidGone ? 'lidPop 0.6s ease both' : undefined,
                pointerEvents: 'none',
              }}>🎁</div>

              {/* Main gift box */}
              <div className="gift-emoji" style={{ fontSize: '5rem' }}>
                {lidGone ? '✨' : '🎁'}
              </div>

              {/* Sparkles burst from inside */}
              {lidGone && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
                  {['⭐','💛','✨','🌟','💫'].map((s, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      animation: `sparkleBurst 1.2s ease ${i * 0.1}s both`,
                      '--sf': 0.6 + i * 0.2,
                      fontSize: '1.4rem',
                      top: `${Math.sin(i * 72 * Math.PI / 180) * 40}px`,
                      left: `${Math.cos(i * 72 * Math.PI / 180) * 40}px`,
                    } as React.CSSProperties}>{s}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Child avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: child.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', margin: '12px auto 8px',
              boxShadow: '0 0 0 4px rgba(252,211,77,0.5), 0 0 0 8px rgba(245,158,11,0.3)',
              animation: 'heartExpand 0.7s var(--ease-spring) both',
            }}>
              {child.avatarEmoji}
            </div>

            {/* Hero name */}
            <h2 style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.9rem',
              color: '#92400E', marginBottom: 4, lineHeight: 1.2,
              textAlign: 'center',
              animation: 'heroNameReveal 0.8s 0.4s var(--ease-spring) both',
            }}>
              🎁 {child.name}
            </h2>
            <h3 style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.3rem',
              color: '#D97706', marginBottom: 12, textAlign: 'center',
              animation: 'heroNameReveal 0.8s 0.6s var(--ease-spring) both',
            }}>
              earned a GIFT!
            </h3>

            <p style={{ color: '#78350F', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', marginBottom: 4, textAlign: 'center' }}>
              5 stars collected — incredible achievement!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16, textAlign: 'center' }}>
              Parent acknowledgement required to dismiss.
            </p>

            {/* Stars row */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: '1.8rem', animation: `starRate 0.5s var(--ease-spring) ${0.8 + i * 0.12}s both`, display: 'inline-block' }}>⭐</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg,#F59E0B,#D97706)', fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}
                onClick={handleClaim} id="btn-claim-gift">
                Claim Gift 🎁
              </button>
              <button className="btn btn-secondary" onClick={snoozeGift} id="btn-snooze-gift">
                Later
              </button>
            </div>

            {/* Skip for parents in a hurry */}
            <button onClick={snoozeGift}
              style={{
                marginTop: 10, width: '100%', background: 'none', border: 'none',
                fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600,
              }}
              id="btn-skip-gift">
              Skip celebration (snooze 1 hour)
            </button>
          </>
        )}

        {step === 'pin' && (
          <>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
              🔒 Parent Confirmation
            </h2>
            <PinPad
              label="Enter Parent PIN"
              subtitle="Confirm you're giving the gift"
              expectedPin={choreSettings.parentPin}
              onConfirm={handlePinConfirm}
              onCancel={() => setStep('main')}
            />
          </>
        )}

        {step === 'note' && (
          <>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 12 }}>🎁</div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, textAlign: 'center', marginBottom: 8, color: '#92400E' }}>
              What's the gift?
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              Add a note so {child.name} knows what they earned! (optional)
            </p>
            <textarea
              className="textarea"
              placeholder='e.g. "Trip to the movies! 🎬"'
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              rows={3}
              id="gift-note-input"
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep('main')} style={{ flex: 1 }}>Back</button>
              <button className="btn btn-primary" onClick={handleConfirmGift} style={{ flex: 2 }} id="btn-confirm-gift">
                ✅ Confirm Gift Claimed!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftMilestoneModal;
