// ─── Mood Check-In Modal ──────────────────────────────────────────────────────
// Shown before marking a class as attended — stores emoji mood
import React, { useState } from 'react';
import { MOOD_EMOJIS, MOOD_LABELS } from '../../store/types';
import type { ClassSession, Mood } from '../../store/types';


interface MoodCheckInProps {
  cls: ClassSession;
  onConfirm: (mood: Mood) => void;
  onSkip: () => void;
}

const MoodCheckIn: React.FC<MoodCheckInProps> = ({ cls, onConfirm, onSkip }) => {
  const [selected, setSelected] = useState<Mood | null>(null);

  const moods = ([1, 2, 3, 4, 5] as Mood[]);

  return (
    <div className="modal-backdrop" style={{ alignItems:'center' }}>
      <div className="confirm-panel anim-scaleIn" style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'8px' }}>😊</div>
        <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1.1rem', marginBottom:'6px' }}>
          How are you feeling?
        </h3>
        <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'20px' }}>
          Before <strong>{cls.name}</strong> today...
        </p>

        {/* Emoji mood buttons */}
        <div style={{ display:'flex', justifyContent:'center', gap:'10px', marginBottom:'20px' }}>
          {moods.map((mood) => (
            <button
              key={mood}
              className={`mood-btn ${selected === mood ? 'selected' : ''}`}
              onClick={() => setSelected(mood)}
              title={MOOD_LABELS[mood]}
              id={`btn-mood-${mood}`}
            >
              {MOOD_EMOJIS[mood]}
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--accent)', marginBottom:'16px', fontFamily:'Nunito, sans-serif' }}>
            {MOOD_LABELS[selected]}! 
          </div>
        )}

        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onSkip} id="btn-mood-skip">
            Skip
          </button>
          <button
            className="btn btn-primary"
            style={{ flex:1 }}
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            id="btn-mood-confirm"
          >
            Mark Done ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckIn;
