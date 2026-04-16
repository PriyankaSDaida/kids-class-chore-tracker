// ─── PinPad — 4-Digit Parent PIN Entry ────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';

interface PinPadProps {
  onConfirm:    (pin: string) => void;
  onCancel?:    () => void;
  expectedPin?: string;   // if set, validates locally before calling onConfirm
  label?:       string;
  subtitle?:    string;
}

const BUTTONS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

const PinPad: React.FC<PinPadProps> = ({ onConfirm, onCancel, expectedPin, label, subtitle }) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [error,  setError]  = useState('');
  const [shake,  setShake]  = useState(false);

  const handleDigit = useCallback((d: string) => {
    setDigits((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, d];
      if (next.length === 4) {
        const pin = next.join('');
        if (expectedPin && pin !== expectedPin) {
          setError('Incorrect PIN. Try again.');
          setShake(true);
          setTimeout(() => { setDigits([]); setShake(false); }, 700);
        } else {
          setTimeout(() => onConfirm(pin), 100);
        }
      }
      return next;
    });
  }, [expectedPin, onConfirm]);

  const handleBack = () => { setDigits((d) => d.slice(0, -1)); setError(''); };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      if (e.key === 'Backspace') handleBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit]);

  return (
    <div className="pin-pad">
      {label && (
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1.1rem' }}>{label}</div>
          {subtitle && <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{subtitle}</div>}
        </div>
      )}

      {/* 4 dots */}
      <div className={`pin-dots ${shake ? 'anim-rewardGlow' : ''}`} style={shake ? { filter:'drop-shadow(0 0 8px red)' } : {}}>
        {[0,1,2,3].map((i) => (
          <div key={i} className={`pin-dot ${digits.length > i ? 'filled' : ''}`}/>
        ))}
      </div>

      {error && <div className="pin-error">{error}</div>}

      {/* Number grid */}
      <div className="pin-grid">
        {BUTTONS.map((btn, i) =>
          btn === '' ? (
            <div key={i}/>
          ) : (
            <button
              key={i}
              className="pin-btn"
              onClick={() => btn === '⌫' ? handleBack() : handleDigit(btn)}
              aria-label={btn === '⌫' ? 'Backspace' : btn}
            >
              {btn}
            </button>
          )
        )}
      </div>

      {onCancel && (
        <button className="btn btn-ghost w-full" onClick={onCancel} id="btn-pin-cancel">
          Cancel
        </button>
      )}
    </div>
  );
};

export default PinPad;
