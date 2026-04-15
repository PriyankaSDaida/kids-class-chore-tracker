// ─── ChoreForm — Add / Edit Chore Modal ───────────────────────────────────────
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CHORE_CAT_CONFIG, CHORE_ICONS } from '../../store/types';
import type { Chore, ChoreCategory, ChoreRecurrence } from '../../store/types';

interface Props {
  chore?:   Chore;
  onClose:  () => void;
}

const CATEGORIES = Object.keys(CHORE_CAT_CONFIG) as ChoreCategory[];
const RECURRENCES: { id: ChoreRecurrence; label: string }[] = [
  { id:'daily',    label:'Daily'         },
  { id:'weekdays', label:'Weekdays only' },
  { id:'weekly',   label:'Weekly'        },
  { id:'once',     label:'One-time'      },
];

const ChoreForm: React.FC<Props> = ({ chore, onClose }) => {
  const { children, addChore, updateChore } = useAppStore();
  const isEdit = Boolean(chore);

  const [name,           setName]           = useState(chore?.name           ?? '');
  const [description,    setDescription]    = useState(chore?.description    ?? '');
  const [icon,           setIcon]           = useState(chore?.icon           ?? '⭐');
  const [category,       setCategory]       = useState<ChoreCategory>(chore?.category    ?? 'Helping');
  const [isPositive,     setIsPositive]     = useState((chore?.points ?? 5) > 0);
  const [absPoints,      setAbsPoints]      = useState(Math.abs(chore?.points ?? 5));
  const [assignedChild,  setAssignedChild]  = useState(chore?.assignedChildId ?? (children[0]?.id ?? 'all'));
  const [recurrence,     setRecurrence]     = useState<ChoreRecurrence>(chore?.recurrence ?? 'daily');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [error,          setError]          = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Chore name is required'); return; }
    if (absPoints <= 0) { setError('Points must be greater than 0'); return; }

    const points = isPositive ? absPoints : -absPoints;
    const payload: Chore = {
      id:              chore?.id ?? crypto.randomUUID(),
      assignedChildId: assignedChild,
      name:            name.trim(),
      description:     description.trim(),
      icon,
      points,
      category,
      recurrence,
      isActive:        true,
      createdAt:       chore?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) updateChore(payload.id, payload);
    else        addChore(payload);
    onClose();
  };

  const catCfg = CHORE_CAT_CONFIG[category];

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth:560 }}>
        <div className="modal-handle"/>
        <h2 className="modal-title">{isEdit ? '✏️ Edit Chore' : '➕ New Chore'}</h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background:'var(--red-light)', color:'var(--red)', padding:'10px 14px', borderRadius:'var(--r-md)', marginBottom:16, fontSize:'0.85rem', fontWeight:700 }}>
              {error}
            </div>
          )}

          {/* Name + icon row */}
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16 }}>
            {/* Icon picker */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button type="button"
                className="btn btn-secondary"
                style={{ width:56, height:56, fontSize:'1.6rem', padding:0, borderRadius:'var(--r-md)' }}
                onClick={() => setIconPickerOpen(!iconPickerOpen)}
                id="btn-icon-picker"
              >
                {icon}
              </button>
              {iconPickerOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', left:0,
                  background:'var(--bg-card)', border:'1.5px solid var(--border)',
                  borderRadius:'var(--r-lg)', padding:10, zIndex:50,
                  display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:4, width:260,
                  boxShadow:'var(--shadow-lg)',
                }}>
                  {CHORE_ICONS.map((em) => (
                    <button key={em} type="button"
                      style={{
                        fontSize:'1.3rem', padding:4, border:'none', background:'none',
                        cursor:'pointer', borderRadius:'var(--r-sm)',
                        background: icon === em ? 'var(--accent-light)' : 'transparent',
                      }}
                      onClick={() => { setIcon(em); setIconPickerOpen(false); }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Chore Name *</label>
              <input
                className="input"
                placeholder='e.g. "Made the bed"'
                value={name} onChange={(e) => setName(e.target.value)}
                autoFocus id="chore-name"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <label className="form-label">Description</label>
            <input className="input" placeholder="Optional details…"
              value={description} onChange={(e) => setDescription(e.target.value)} id="chore-desc"/>
          </div>

          {/* Points — +/- toggle + number */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <label className="form-label">Points Value</label>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button type="button"
                className={`btn btn-sm ${isPositive ? 'btn-primary' : ''}`}
                style={{ minWidth:52, background: isPositive ? 'var(--green)' : undefined }}
                onClick={() => setIsPositive(true)} id="btn-pts-pos">
                + Reward
              </button>
              <button type="button"
                className={`btn btn-sm ${!isPositive ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setIsPositive(false)} id="btn-pts-neg">
                – Deduct
              </button>
              <input
                type="number" className="input" min={1} max={100}
                value={absPoints}
                onChange={(e) => setAbsPoints(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width:80 }} id="chore-points"
              />
              <span style={{
                fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1.1rem',
                color: isPositive ? 'var(--green)' : 'var(--red)',
              }}>
                {isPositive ? '+' : '-'}{absPoints}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <label className="form-label">Category</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {CATEGORIES.map((cat) => {
                const cfg = CHORE_CAT_CONFIG[cat];
                const active = category === cat;
                return (
                  <button key={cat} type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding:'6px 12px', borderRadius:999, border:`2px solid ${active ? cfg.color : 'var(--border)'}`,
                      background: active ? cfg.bg : 'var(--bg-tertiary)', cursor:'pointer',
                      fontFamily:'Nunito, sans-serif', fontWeight:700, fontSize:'0.8rem',
                      color: active ? cfg.color : 'var(--text-secondary)',
                      transition:'all 0.15s',
                    }}
                    id={`cat-${cat}`}
                  >
                    {cfg.emoji} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom:16 }}>
            {/* Assign to */}
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="select" value={assignedChild} onChange={(e) => setAssignedChild(e.target.value)} id="chore-child">
                <option value="all">All Kids</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.avatarEmoji} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Recurrence */}
            <div className="form-group">
              <label className="form-label">Repeats</label>
              <select className="select" value={recurrence} onChange={(e) => setRecurrence(e.target.value as ChoreRecurrence)} id="chore-recurrence">
                {RECURRENCES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
            background: catCfg.bg, borderRadius:'var(--r-md)', marginBottom:20,
            border:`1.5px solid ${catCfg.color}33`,
          }}>
            <span style={{ fontSize:'1.5rem' }}>{icon}</span>
            <div>
              <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif' }}>{name || 'Chore name'}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{description || 'No description'}</div>
            </div>
            <div style={{ marginLeft:'auto', fontWeight:900, fontFamily:'Nunito, sans-serif', color: isPositive ? 'var(--green)' : 'var(--red)', fontSize:'1.1rem' }}>
              {isPositive ? '+' : ''}{isPositive ? absPoints : -absPoints}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} id="btn-chore-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" id="btn-chore-save">
              {isEdit ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChoreForm;
