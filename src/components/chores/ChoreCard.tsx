// ─── ChoreCard — Single Chore Tile with Done Button ──────────────────────────
import React, { useState } from 'react';
import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { todayStr } from '../../utils/dateUtils';
import { CHORE_CAT_CONFIG } from '../../store/types';
import { useSound } from '../../hooks/useSound';
import FloatingPoint from './FloatingPoint';
import PinPad from './PinPad';
import type { Chore } from '../../store/types';

interface Props {
  chore:    Chore;
  childId:  string;
  date:     string;
  onEdit?:  (c: Chore) => void;
}

const ChoreCard: React.FC<Props> = ({ chore, childId, date, onEdit }) => {
  const { completeChore, uncompleteChore, deleteChore, choreCompletions, choreSettings } = useAppStore();
  const { playChime, playTick } = useSound();
  const [floating, setFloating] = useState(false);
  const [showPin, setShowPin]   = useState(false);
  const [pulseDone, setPulseDone] = useState(false);

  const isPositive = chore.points > 0;
  const catCfg     = CHORE_CAT_CONFIG[chore.category];

  // Determine completion state
  const isCompletedOnce = chore.recurrence === 'once'
    ? choreCompletions.some((cc) => cc.choreId === chore.id && cc.childId === childId)
    : choreCompletions.some((cc) => cc.choreId === chore.id && cc.childId === childId && cc.date === date);

  const handleDoneClick = () => {
    const pinRequired = !choreSettings.kidsCanMarkChores && choreSettings.parentPin !== '';
    if (pinRequired) {
      setShowPin(true);
    } else {
      doComplete();
    }
  };

  const doComplete = () => {
    completeChore(chore.id, childId, date);
    setFloating(true);
    setPulseDone(true);
    setTimeout(() => setPulseDone(false), 600);
    if (chore.points > 0) playChime(); else playTick();
  };

  const handleUndo = () => {
    uncompleteChore(chore.id, childId, date);
    playTick();
  };

  return (
    <>
      <div
        className={`chore-card ${isCompletedOnce ? 'completed' : ''}`}
        style={{ animation: pulseDone ? 'choreDone 0.6s ease both' : undefined }}
      >
        {/* Category-coloured icon */}
        <div className="chore-icon-wrap" style={{ background: catCfg.bg }}>
          {chore.icon}
        </div>

        {/* Info */}
        <div className="chore-info">
          <div className="chore-name">{chore.name}</div>
          {chore.description && <div className="chore-desc">{chore.description}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <span style={{ fontSize:'0.65rem', color:catCfg.color, fontWeight:800, background:catCfg.bg, padding:'2px 7px', borderRadius:999 }}>
              {catCfg.emoji} {chore.category}
            </span>
            <span style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:600 }}>
              {chore.recurrence === 'once' ? 'One-time' : chore.recurrence}
            </span>
          </div>
        </div>

        {/* Point badge */}
        <div className={`chore-point-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{chore.points}
        </div>

        {/* Action */}
        <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
          {isCompletedOnce ? (
            <>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--green)', display:'flex', alignItems:'center', gap:3 }}>
                ✓ Done
              </div>
              {chore.recurrence !== 'once' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleUndo}
                  style={{ fontSize:'0.65rem', padding:'2px 6px', height:24 }}
                  id={`btn-undo-${chore.id}`}
                >
                  <RotateCcw size={10}/> Undo
                </button>
              )}
            </>
          ) : (
            <button
              className={`btn btn-sm ${isPositive ? 'btn-primary' : 'btn-danger'}`}
              onClick={handleDoneClick}
              id={`btn-done-${chore.id}`}
            >
              {isPositive ? '✓ Done' : '⚠️ Record'}
            </button>
          )}
        </div>

        {/* Edit/Delete actions (small) */}
        {onEdit && (
          <div style={{ display:'flex', gap:2, flexShrink:0 }}>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(chore)} style={{ width:28, height:28 }}
              id={`btn-edit-chore-${chore.id}`}>
              <Pencil size={12}/>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => deleteChore(chore.id)} style={{ width:28, height:28, color:'var(--red)' }}
              id={`btn-del-chore-${chore.id}`}>
              <Trash2 size={12}/>
            </button>
          </div>
        )}

        {/* Floating point */}
        {floating && (
          <FloatingPoint points={chore.points} onDone={() => setFloating(false)}/>
        )}
      </div>

      {/* PIN modal */}
      {showPin && (
        <div className="modal-backdrop" style={{ zIndex:300 }}>
          <div className="modal-panel" style={{ maxWidth:320 }}>
            <PinPad
              label="Parent PIN required"
              subtitle="Enter your 4-digit PIN to confirm"
              expectedPin={choreSettings.parentPin}
              onConfirm={() => { setShowPin(false); doComplete(); }}
              onCancel={() => setShowPin(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChoreCard;
