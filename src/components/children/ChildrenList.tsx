// ─── Children Management — Class Quest Edition ────────────────────────────────
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import Avatar from '../ui/Avatar';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import Mascot from '../ui/Mascot';
import XPBar from '../gamification/XPBar';
import { CHILD_COLOR_OPTIONS, CHILD_AVATAR_OPTIONS } from '../../utils/colorUtils';
import { getLevel } from '../../store/types';
import type { Child } from '../../store/types';

const FAVORITE_EMOJIS = ['⭐','🌈','🦄','🐉','🦊','🐼','🐸','🦋','🌸','🏆','🎮','🎵','⚽','🎨','🚀'];

const InlineChildForm: React.FC<{ existing?: Child; onClose: () => void }> = ({ existing, onClose }) => {
  const { addChild, updateChild } = useAppStore();
  const { showToast } = useToast();
  const [name,          setName]          = useState(existing?.name || '');
  const [age,           setAge]           = useState(existing?.age?.toString() || '');
  const [color,         setColor]         = useState(existing?.color || CHILD_COLOR_OPTIONS[0]);
  const [emoji,         setEmoji]         = useState(existing?.avatarEmoji || CHILD_AVATAR_OPTIONS[0]);
  const [favEmoji,      setFavEmoji]      = useState(existing?.favoriteEmoji || '⭐');

  const handleSave = () => {
    if (!name.trim()) { showToast('Name is required', 'error'); return; }
    if (existing) {
      updateChild(existing.id, {
        name: name.trim(), age: parseInt(age) || 0,
        color, avatarEmoji: emoji, favoriteEmoji: favEmoji,
      });
      showToast(`${name.trim()} updated! ✅`, 'success');
    } else {
      const child: Child = {
        id: crypto.randomUUID(),
        name: name.trim(), age: parseInt(age) || 0,
        color, avatarEmoji: emoji,
        favoriteEmoji: favEmoji,
        xp: 0, level: 1, badges: [], moodLog: [],
        points: 0, hearts: 0, stars: 0, lifetimeHearts: 0, lifetimeStars: 0,
        gameTokens: 0, wordCollection: [],
        createdAt: new Date().toISOString(),
      };
      addChild(child);
      showToast(`${name.trim()} added! 🦁`, 'success');
    }
    onClose();
  };

  return (
    <div className="anim-slideUp" style={{
      background:'var(--bg-card)',
      border:`2px solid ${color}`,
      borderRadius:'var(--r-xl)',
      padding:'20px',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1rem' }}>
          {existing ? '✏️ Edit Child' : '👶 Add Child'}
        </h3>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} id="btn-child-cancel-edit">
          <X size={16}/>
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="input" placeholder="Child's name" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            autoFocus id="input-child-form-name" />
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label">Age</label>
          <input className="input" type="number" placeholder="7" value={age}
            onChange={(e) => setAge(e.target.value)} min="1" max="18" id="input-child-form-age" />
        </div>

        {/* Avatar */}
        <div className="form-group">
          <label className="form-label">Avatar</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {CHILD_AVATAR_OPTIONS.map((em) => (
              <button key={em} onClick={() => setEmoji(em)} style={{
                fontSize:'1.5rem', padding:'6px 10px', borderRadius:'12px',
                border:`2px solid ${em === emoji ? color : 'var(--border)'}`,
                background: em === emoji ? `${color}22` : 'var(--bg-tertiary)',
                cursor:'pointer', transition:'all 0.15s',
              }}>{em}</button>
            ))}
          </div>
        </div>

        {/* Favorite emoji (kid-chosen) */}
        <div className="form-group">
          <label className="form-label">Favorite Emoji ⭐</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {FAVORITE_EMOJIS.map((em) => (
              <button key={em} onClick={() => setFavEmoji(em)} style={{
                fontSize:'1.3rem', padding:'4px 8px', borderRadius:'10px',
                border:`2px solid ${em === favEmoji ? color : 'transparent'}`,
                background: em === favEmoji ? `${color}22` : 'transparent',
                cursor:'pointer', transition:'all 0.15s',
              }}>{em}</button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {CHILD_COLOR_OPTIONS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{
                width:'32px', height:'32px', borderRadius:'50%', background:c,
                border:`3px solid ${c === color ? 'var(--text-primary)' : 'transparent'}`,
                cursor:'pointer', transition:'border-color 0.15s',
              }} />
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose} id="btn-child-cancel">Cancel</button>
          <button className="btn btn-primary" style={{ flex:1 }} onClick={handleSave} id="btn-child-save">
            <Check size={15}/> {existing ? 'Save Changes' : 'Add Child'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main List ──────────────────────────────────────────────────────────────────
const ChildrenList: React.FC = () => {
  const { children, classes, deleteChild, setActiveProfile } = useAppStore();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);

  const getClassCount = (childId: string) => classes.filter((c) => c.childId === childId).length;

  return (
    <main className="page-content" id="screen-children">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h2 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1.1rem' }}>
          {children.length} {children.length === 1 ? 'Kid' : 'Kids'} 🦁
        </h2>
        <button className="btn btn-primary btn-sm"
          onClick={() => setEditingId('new')} id="btn-add-child" disabled={editingId === 'new'}>
          <Plus size={14}/> Add Kid
        </button>
      </div>

      {/* Add new form */}
      {editingId === 'new' && (
        <div style={{ marginBottom:'16px' }}>
          <InlineChildForm onClose={() => setEditingId(null)} />
        </div>
      )}

      {children.length === 0 && editingId !== 'new' ? (
        <EmptyState
          emoji={<Mascot size={100} mood="thinking" />}
          title="No kids yet!"
          description="Add your first kid to start tracking their Class Quest adventures."
          action={<button className="btn btn-primary" onClick={() => setEditingId('new')} id="btn-empty-child">Add a Kid</button>}
        />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }} className="stagger">
          {children.map((child) =>
            editingId === child.id ? (
              <InlineChildForm key={child.id} existing={child} onClose={() => setEditingId(null)} />
            ) : (
              <div key={child.id} className="child-card anim-slideUp" style={{ borderLeft:`4px solid ${child.color}` }}>
                <Avatar emoji={child.avatarEmoji} color={child.color} size="lg" />

                <div style={{ flex:1, minWidth:0 }}>
                  {/* Tapping the name opens the edit form */}
                  <button onClick={() => setEditingId(child.id)} style={{
                    fontWeight:800, fontSize:'1rem', background:'none', border:'none',
                    cursor:'pointer', padding:0, fontFamily:'Nunito, sans-serif',
                    color:'var(--text-primary)', textAlign:'left',
                    textDecoration:'underline dotted', textUnderlineOffset:'3px',
                  }} id={`btn-name-${child.id}`} title="Tap to edit">
                    {child.name} {child.favoriteEmoji}
                  </button>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px', fontWeight:600 }}>
                    Age {child.age || '?'} · {getClassCount(child.id)} classes · Lv.{getLevel(child.xp)}
                  </div>
                  {/* Mini XP bar */}
                  <div style={{ marginTop:'8px' }}>
                    <XPBar child={child} compact />
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-end' }}>
                  {/* View Profile */}
                  <button className="btn btn-ghost btn-sm" style={{ fontSize:'0.72rem', padding:'4px 10px', gap:'4px' }}
                    onClick={() => setActiveProfile(child.id)} id={`btn-profile-${child.id}`}>
                    Profile <ChevronRight size={12}/>
                  </button>
                  <div style={{ display:'flex', gap:'4px' }}>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setEditingId(child.id)} aria-label="Edit" id={`btn-edit-child-${child.id}`}>
                      <Edit2 size={14}/>
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }}
                      onClick={() => setDeleteId(child.id)} aria-label="Delete" id={`btn-delete-child-${child.id}`}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Remove this child?"
          description="This will delete the child AND all their classes and attendance records. This cannot be undone."
          confirmLabel="Remove"
          destructive
          onConfirm={() => { deleteChild(deleteId); showToast('Child removed', 'info'); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </main>
  );
};

export default ChildrenList;
