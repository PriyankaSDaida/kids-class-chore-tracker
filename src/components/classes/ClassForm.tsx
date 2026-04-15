// ─── Add / Edit Class Form ─────────────────────────────────────────────────────
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { buildRecurringInstances } from '../../hooks/useRecurring';
import { scheduleReminder } from '../../hooks/useNotifications';
import { useToast } from '../ui/Toast';
import type { ClassSession, Category, RecurringFrequency, ReminderBefore } from '../../store/types';
import { CATEGORY_EMOJIS } from '../../utils/colorUtils';

const CATEGORIES: Category[] = ['Sport','Music','Art','Academic','Dance','Other'];
const DURATIONS = [30,45,60,75,90,120];
const REMINDER_OPTIONS: { value: ReminderBefore; label: string }[] = [
  { value:'none',   label:'No reminder' },
  { value:'15min',  label:'15 minutes before' },
  { value:'30min',  label:'30 minutes before' },
  { value:'1hour',  label:'1 hour before' },
  { value:'1day',   label:'1 day before' },
];

interface ClassFormProps {
  existing?: ClassSession;
  defaultChildId?: string;
  onClose: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ existing, defaultChildId, onClose }) => {
  const { children, addClass, addClasses, updateClass } = useAppStore();
  const { showToast } = useToast();
  const isEdit = !!existing;

  const [form, setForm] = useState<Omit<ClassSession, 'id'|'status'|'isRescheduled'|'rescheduleReason'|'originalDate'|'createdAt'|'recurringGroupId'>>({
    childId:            existing?.childId   || defaultChildId || children[0]?.id || '',
    name:               existing?.name      || '',
    category:           existing?.category  || 'Other',
    instructorName:     existing?.instructorName || '',
    location:           existing?.location  || '',
    date:               existing?.date      || '',
    time:               existing?.time      || '',
    duration:           existing?.duration  || 60,
    recurringFrequency: existing?.recurringFrequency || 'one-time',
    notes:              existing?.notes     || '',
    monthlyCost:        existing?.monthlyCost ?? 0,
    remindBefore:       existing?.remindBefore || 'none',
  });

  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.date || !form.time || !form.childId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const child = children.find((c) => c.id === form.childId);
    const now = new Date().toISOString();
    const groupId = existing?.recurringGroupId || crypto.randomUUID();

    const base: ClassSession = {
      ...form,
      id: existing?.id || crypto.randomUUID(),
      status: existing?.status || 'upcoming',
      isRescheduled: existing?.isRescheduled || false,
      rescheduleReason: existing?.rescheduleReason || '',
      originalDate: existing?.originalDate || null,
      recurringGroupId: form.recurringFrequency !== 'one-time' ? groupId : null,
      createdAt: existing?.createdAt || now,
    };

    if (isEdit) {
      updateClass(existing!.id, { ...form });
      showToast('Class updated!', 'success');
    } else {
      addClass(base);
      // Auto-generate recurring instances
      if (form.recurringFrequency !== 'one-time') {
        const instances = buildRecurringInstances(base, form.recurringFrequency as Exclude<RecurringFrequency,'one-time'>);
        addClasses(instances);
        showToast(`Class added with ${instances.length} recurring sessions!`, 'success');
      } else {
        showToast('Class added!', 'success');
      }
    }

    // Schedule browser reminder
    if (child) scheduleReminder(base, child.name);
    onClose();
  };

  return (
    <Modal
      title={isEdit ? '✏️ Edit Class' : '➕ Add New Class'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} id="btn-class-cancel">Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="btn-class-save">
            {isEdit ? 'Save Changes' : 'Add Class'}
          </button>
        </>
      }
    >
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {/* Child selector */}
        <div className="form-group">
          <label className="form-label">Child *</label>
          <select className="select" value={form.childId} onChange={(e) => set('childId', e.target.value)} id="select-child">
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.avatarEmoji} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Class name */}
        <div className="form-group">
          <label className="form-label">Class Name *</label>
          <input className="input" placeholder="e.g. Swimming, Piano, Soccer"
            value={form.name} onChange={(e) => set('name', e.target.value)} id="input-name" />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => set('category', cat)}
                style={{
                  padding:'8px 4px',
                  borderRadius:'10px',
                  border:`2px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.category === cat ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                  cursor:'pointer', fontSize:'0.8rem', fontWeight:'600', display:'flex',
                  flexDirection:'column', alignItems:'center', gap:'4px',
                  fontFamily:'inherit', color: form.category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  transition:'all 0.15s',
                }}
                id={`cat-${cat}`}
              >
                <span style={{ fontSize:'1.2rem' }}>{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="input" type="date" value={form.date}
              onChange={(e) => set('date', e.target.value)} id="input-date" />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input className="input" type="time" value={form.time}
              onChange={(e) => set('time', e.target.value)} id="input-time" />
          </div>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">Duration</label>
          <select className="select" value={form.duration} onChange={(e) => set('duration', parseInt(e.target.value))} id="select-duration">
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d < 60 ? `${d} min` : `${d/60}h${d%60 ? ` ${d%60}m` : ''}`}</option>
            ))}
          </select>
        </div>

        {/* Instructor & Location */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Instructor</label>
            <input className="input" placeholder="Coach Mike" value={form.instructorName}
              onChange={(e) => set('instructorName', e.target.value)} id="input-instructor" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="input" placeholder="City Pool" value={form.location}
              onChange={(e) => set('location', e.target.value)} id="input-location" />
          </div>
        </div>

        {/* Recurring frequency */}
        <div className="form-group">
          <label className="form-label">Repeat</label>
          <select className="select" value={form.recurringFrequency}
            onChange={(e) => set('recurringFrequency', e.target.value)} id="select-recurring">
            <option value="one-time">One-time</option>
            <option value="weekly">Weekly (12 sessions)</option>
            <option value="biweekly">Biweekly (12 sessions)</option>
            <option value="monthly">Monthly (12 sessions)</option>
          </select>
        </div>

        {/* Reminder */}
        <div className="form-group">
          <label className="form-label">Reminder</label>
          <select className="select" value={form.remindBefore}
            onChange={(e) => set('remindBefore', e.target.value as ReminderBefore)} id="select-reminder">
            {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Monthly cost */}
        <div className="form-group">
          <label className="form-label">Monthly Cost ($)</label>
          <input className="input" type="number" placeholder="0" min="0" step="5"
            value={form.monthlyCost || ''} onChange={(e) => set('monthlyCost', parseFloat(e.target.value) || 0)} id="input-cost" />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="textarea" placeholder="Any additional details..."
            value={form.notes} onChange={(e) => set('notes', e.target.value)} id="input-notes" />
        </div>
      </div>
    </Modal>
  );
};

export default ClassForm;
