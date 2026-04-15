// ─── GiftMilestoneModal — Undismissable Gift Popup with PIN ──────────────────
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSound } from '../../hooks/useSound';
import PinPad from './PinPad';

const SPARKLE_POSITIONS = [
  { top:'10%', left:'8%',  delay:'0s'    },
  { top:'8%',  right:'8%', delay:'0.4s'  },
  { top:'40%', left:'3%',  delay:'0.8s'  },
  { top:'40%', right:'3%', delay:'0.2s'  },
  { top:'72%', left:'10%', delay:'0.6s'  },
  { top:'72%', right:'10%',delay:'1.0s'  },
  { top:'88%', left:'35%', delay:'0.3s'  },
  { top:'88%', right:'35%',delay:'0.7s'  },
];

type Step = 'main' | 'pin' | 'note';

const GiftMilestoneModal: React.FC<{ childId: string }> = ({ childId }) => {
  const { children, choreSettings, claimGift, snoozeGift } = useAppStore();
  const { playFanfare } = useSound();

  const child = children.find((c) => c.id === childId);
  if (!child) return null;

  const [step,     setStep]     = useState<Step>('main');
  const [giftNote, setGiftNote] = useState('');

  const handleClaim = () => {
    if (choreSettings.parentPin) {
      setStep('pin');
    } else {
      setStep('note');
    }
  };

  const handlePinConfirm = () => setStep('note');

  const handleConfirmGift = () => {
    playFanfare();
    claimGift(childId, giftNote);
  };

  return (
    <div className="gift-overlay">
      <div className="gift-panel">
        {/* Sparkle decorations */}
        {SPARKLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="gift-sparkle"
            style={{ ...pos, animationDelay: pos.delay, position:'absolute' }}
          >
            ✨
          </div>
        ))}

        {step === 'main' && (
          <>
            {/* Bouncing gift */}
            <div className="gift-emoji">🎁</div>

            {/* Child avatar */}
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background: child.color, display:'flex',
              alignItems:'center', justifyContent:'center',
              fontSize:'2.2rem', margin:'16px auto',
              boxShadow:'0 0 0 4px var(--amber-light), 0 0 0 8px var(--amber)',
            }}>
              {child.avatarEmoji}
            </div>

            <h2 style={{
              fontFamily:'Nunito, sans-serif', fontWeight:900, fontSize:'1.6rem',
              color:'#92400E', marginBottom:8, lineHeight:1.2,
            }}>
              🎁 {child.name} has earned a gift!
            </h2>

            <p style={{ color:'#78350F', fontWeight:700, fontSize:'1rem', fontFamily:'Nunito, sans-serif', marginBottom:4 }}>
              5 stars collected — what an incredible achievement!
            </p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:24 }}>
              This popup requires parent acknowledgement before it can be closed.
            </p>

            {/* Stars row */}
            <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:24 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize:'1.8rem', animationDelay:`${i*0.1}s` }} className="anim-rewardGlow">⭐</span>
              ))}
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn-primary" style={{ flex:1, background:'linear-gradient(135deg,var(--amber),#D97706)' }}
                onClick={handleClaim} id="btn-claim-gift">
                Claim Gift 🎁
              </button>
              <button className="btn btn-secondary" onClick={snoozeGift} id="btn-snooze-gift">
                Remind me later
              </button>
            </div>
          </>
        )}

        {step === 'pin' && (
          <>
            <h2 style={{ fontFamily:'Nunito, sans-serif', fontWeight:900, textAlign:'center', marginBottom:8 }}>
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
            <div style={{ fontSize:'3rem', textAlign:'center', marginBottom:12 }}>🎁</div>
            <h2 style={{ fontFamily:'Nunito, sans-serif', fontWeight:900, textAlign:'center', marginBottom:8, color:'#92400E' }}>
              What's the gift?
            </h2>
            <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:16 }}>
              Add a note so {child.name} knows what they earned! (optional)
            </p>
            <textarea
              className="textarea"
              placeholder='e.g. "Trip to the movies! 🎬"'
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              rows={3}
              id="gift-note-input"
              style={{ marginBottom:16 }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-secondary" onClick={() => setStep('main')} style={{ flex:1 }}>Back</button>
              <button className="btn btn-primary" onClick={handleConfirmGift} style={{ flex:2 }} id="btn-confirm-gift">
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
