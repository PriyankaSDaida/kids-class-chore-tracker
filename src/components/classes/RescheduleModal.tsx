// ─── Reschedule Modal ──────────────────────────────────────────────────────────
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import type { ClassSession } from '../../store/types';

interface RescheduleModalProps {
  cls: ClassSession;
  onClose: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ cls, onClose }) => {
  const { rescheduleClass } = useAppStore();
  const { showToast } = useToast();
  const [newDate, setNewDate] = useState(cls.date);
  const [newTime, setNewTime] = useState(cls.time);
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (!newDate || !newTime) { showToast('Please pick a date and time', 'error'); return; }
    rescheduleClass(cls.id, newDate, newTime, reason);
    showToast('Class rescheduled!', 'success');
    onClose();
  };

  return (
    <Modal
      title="🔄 Reschedule Class"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="btn-reschedule-save">Reschedule</button>
        </>
      }
    >
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <p style={{ fontSize:'0.875rem' }}>Rescheduling: <strong>{cls.name}</strong></p>
        {cls.isRescheduled && (
          <div style={{ background:'var(--amber-light)', color:'var(--amber)', borderRadius:'8px', padding:'10px 12px', fontSize:'0.8rem', fontWeight:600 }}>
            ⚠️ Original date: {cls.originalDate}
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">New Date *</label>
            <input className="input" type="date" value={newDate}
              onChange={(e) => setNewDate(e.target.value)} id="input-reschedule-date" />
          </div>
          <div className="form-group">
            <label className="form-label">New Time *</label>
            <input className="input" type="time" value={newTime}
              onChange={(e) => setNewTime(e.target.value)} id="input-reschedule-time" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Reason (optional)</label>
          <textarea className="textarea" placeholder="e.g. Instructor is travelling"
            value={reason} onChange={(e) => setReason(e.target.value)} id="input-reschedule-reason" />
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleModal;
