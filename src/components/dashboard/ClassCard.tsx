// ─── Class Card — Class Quest Edition ─────────────────────────────────────────
import React, { useState } from 'react';
import { Clock, MapPin, User, Edit, Trash2, X, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import { useSound } from '../../hooks/useSound';
import { useCountdown } from '../../hooks/useCountdown';
import { StatusBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import ConfirmDialog from '../ui/ConfirmDialog';
import RescheduleModal from '../classes/RescheduleModal';
import ClassForm from '../classes/ClassForm';
import CategoryIllustration from '../ui/CategoryIllustration';
import ConfettiEffect from '../gamification/ConfettiEffect';
import MoodCheckIn from './MoodCheckIn';
import { formatTime, formatDuration } from '../../utils/dateUtils';
import type { ClassSession, Mood } from '../../store/types';

interface ClassCardProps { cls: ClassSession; }

const ClassCard: React.FC<ClassCardProps> = ({ cls }) => {
  const { children, markAttended, markMissed, cancelClass, deleteClass,
          setClassReaction, addMoodEntry } = useAppStore();
  const { showToast } = useToast();
  const { playChime, playTick } = useSound();
  const child   = children.find((c) => c.id === cls.childId);
  const countdown = useCountdown(cls.date, cls.time);

  const [showReschedule, setShowReschedule]     = useState(false);
  const [showEdit, setShowEdit]                 = useState(false);
  const [showDelete, setShowDelete]             = useState(false);
  const [showCancel, setShowCancel]             = useState(false);
  const [showMoodCheck, setShowMoodCheck]       = useState(false);
  const [showConfetti, setShowConfetti]         = useState(false);
  const [bouncing, setBouncing]                 = useState(false);

  const isDone   = cls.status === 'attended' || cls.status === 'cancelled';
  const isActive = cls.status === 'upcoming' || cls.status === 'rescheduled';

  const triggerBounce = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);
    playTick();
  };

  const handleAttend = () => {
    triggerBounce();
    // Show mood check-in first
    setShowMoodCheck(true);
  };

  const finishAttend = (mood?: Mood) => {
    setShowMoodCheck(false);
    if (mood && cls.childId) {
      addMoodEntry(cls.childId, {
        id: crypto.randomUUID(), classId: cls.id,
        date: cls.date, mood,
      });
    }
    markAttended(cls.id);
    setShowConfetti(true);
    playChime();
    showToast(`+50 XP earned! Great job! ⭐`, 'success');
  };

  const categoryColors: Record<string, string> = {
    Sport:    '#3B82F6', Music: '#A855F7', Art: '#F97316',
    Academic: '#10B981', Dance: '#EC4899', Other: '#64748B',
  };
  const borderColor = categoryColors[cls.category] || 'var(--accent)';

  return (
    <>
      <div
        className={`class-card cat-${cls.category} status-${cls.status} ${bouncing ? 'card-bounce' : ''}`}
        style={{ borderLeft:`4px solid ${borderColor}` }}
      >
        {/* Header row */}
        <div className="class-card-header">
          <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', flex:1, minWidth:0 }}>
            <CategoryIllustration category={cls.category} size={42} />
            <div style={{ flex:1, minWidth:0 }}>
              <div className="class-name">{cls.name}</div>
              {/* Status + countdown */}
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px', flexWrap:'wrap' }}>
                <StatusBadge status={cls.status} />
                {cls.isRescheduled && (
                  <span className="badge badge-rescheduled">📅 Rescheduled</span>
                )}
                {/* Live countdown for today */}
                {isActive && countdown.isToday && countdown.label && (
                  <span className={`countdown-chip ${countdown.isUrgent ? 'urgent' : ''} ${countdown.isStarted ? 'done' : ''}`}>
                    ⏰ {countdown.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Child avatar */}
          {child && <Avatar emoji={child.avatarEmoji} color={child.color} size="sm" />}
        </div>

        {/* Meta */}
        <div className="class-meta" style={{ fontSize:'0.8rem' }}>
          <span className="meta-item"><Clock size={13} /> {formatTime(cls.time)} · {formatDuration(cls.duration)}</span>
          {cls.location && <span className="meta-item"><MapPin size={13} /> {cls.location}</span>}
          {cls.instructorName && <span className="meta-item"><User size={13} /> {cls.instructorName}</span>}
        </div>

        {/* Pre-class reactions (for upcoming) */}
        {isActive && (
          <div style={{ display:'flex', gap:'6px' }}>
            <button
              className={`reaction-btn ${cls.reaction === 'cant-wait' ? 'active-cant-wait' : ''}`}
              onClick={() => setClassReaction(cls.id, cls.reaction === 'cant-wait' ? null : 'cant-wait')}
              id={`btn-react-yes-${cls.id}`}
            >🙌 Can't wait!</button>
            <button
              className={`reaction-btn ${cls.reaction === 'not-feeling-it' ? 'active-not-feeling-it' : ''}`}
              onClick={() => setClassReaction(cls.id, cls.reaction === 'not-feeling-it' ? null : 'not-feeling-it')}
              id={`btn-react-no-${cls.id}`}
            >😴 Not feeling it</button>
          </div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="class-card-actions">
            <button className="btn btn-primary btn-sm"
              onClick={handleAttend} id={`btn-attend-${cls.id}`} style={{ flex:1 }}>
              ✅ Mark Done
            </button>
            <button className="btn btn-secondary btn-sm"
              onClick={() => markMissed(cls.id)} id={`btn-miss-${cls.id}`}>
              ❌
            </button>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowReschedule(true)} title="Reschedule" id={`btn-reschedule-${cls.id}`}>
              <RefreshCw size={14}/>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowEdit(true)} title="Edit" id={`btn-edit-${cls.id}`}>
              <Edit size={14}/>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowCancel(true)} title="Cancel class" id={`btn-cancel-${cls.id}`}>
              <X size={14}/>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }}
              onClick={() => setShowDelete(true)} title="Delete" id={`btn-delete-${cls.id}`}>
              <Trash2 size={14}/>
            </button>
          </div>
        )}

        {/* If already attended — show mood and edit */}
        {cls.status === 'attended' && (
          <div style={{ display:'flex' , gap:'6px' }}>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowEdit(true)} id={`btn-edit-done-${cls.id}`}>
              <Edit size={14}/>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }}
              onClick={() => setShowDelete(true)} id={`btn-del-done-${cls.id}`}>
              <Trash2 size={14}/>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMoodCheck && (
        <MoodCheckIn cls={cls} onConfirm={finishAttend} onSkip={() => finishAttend()} />
      )}
      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
      {showReschedule && <RescheduleModal cls={cls} onClose={() => setShowReschedule(false)} />}
      {showEdit && <ClassForm existing={cls} onClose={() => setShowEdit(false)} />}
      {showCancel && (
        <ConfirmDialog
          title="Cancel this class?"
          description="The class will be kept as cancelled in your history."
          confirmLabel="Cancel Class"
          onConfirm={() => { cancelClass(cls.id); showToast('Class cancelled', 'info'); setShowCancel(false); }}
          onCancel={() => setShowCancel(false)}
        />
      )}
      {showDelete && (
        <ConfirmDialog
          title="Delete this class?"
          description="This permanently removes the class and all attendance records."
          confirmLabel="Delete"
          destructive
          onConfirm={() => { deleteClass(cls.id); showToast('Class deleted', 'info'); setShowDelete(false); }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
};

export default ClassCard;
