// ─── Attendance Log + Progress Notes ──────────────────────────────────────────
// Per-class view: attendance history, streak, % and progress note timeline
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStreak, getAttendancePercent } from '../../hooks/useAttendance';
import { formatDate } from '../../utils/dateUtils';
import type { ClassSession } from '../../store/types';

interface AttendanceLogProps {
  cls: ClassSession;
  onClose: () => void;
}

const AttendanceLog: React.FC<AttendanceLogProps> = ({ cls, onClose }) => {
  const { attendanceRecords, updateAttendanceNote } = useAppStore();
  const [editNote, setEditNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const records = useMemo(() =>
    attendanceRecords
      .filter((r) => r.classId === cls.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [attendanceRecords, cls.id]
  );

  const streak = getStreak(records);
  const pct = getAttendancePercent(records);

  const statusColor: Record<string, string> = {
    attended: 'var(--green)',
    missed:   'var(--red)',
    cancelled:'var(--slate)',
  };
  const statusEmoji: Record<string, string> = {
    attended: '✅',
    missed:   '❌',
    cancelled:'🚫',
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'var(--bg-primary)', overflowY:'auto', padding:'16px', maxWidth:'480px', margin:'0 auto' }} id="attendance-log">
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
        <button className="btn btn-ghost btn-icon" onClick={onClose} id="btn-log-back" aria-label="Back">←</button>
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.1rem' }}>{cls.name}</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Attendance History</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
        <div className="card" style={{ padding:'16px', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--amber)' }}>{streak} 🔥</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>Current Streak</div>
        </div>
        <div className="card" style={{ padding:'16px', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--accent)' }}>{pct}%</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>Last 30 Days</div>
        </div>
      </div>

      {/* Timeline */}
      {records.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>
          <div style={{ fontSize:'2.5rem' }}>📭</div>
          <p style={{ marginTop:'8px', fontSize:'0.875rem' }}>No attendance recorded yet.</p>
        </div>
      ) : (
        <div className="attendance-timeline">
          {records.map((rec) => (
            <div key={rec.id} className="attendance-item">
              <div className="attendance-dot" style={{ background: statusColor[rec.status] }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:600, fontSize:'0.875rem' }}>
                    {statusEmoji[rec.status]} {formatDate(rec.date)}
                  </span>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'capitalize' }}>{rec.status}</span>
                </div>
                {/* Progress note */}
                {rec.progressNote ? (
                  <div className="note-bubble" style={{ marginTop:'8px' }}>
                    "{rec.progressNote}"
                    <button className="btn btn-ghost btn-sm" style={{ fontSize:'0.7rem', padding:'2px 6px', marginLeft:'8px' }}
                      onClick={() => { setEditNote(rec.id); setNoteText(rec.progressNote); }}
                      id={`btn-edit-note-${rec.id}`}>Edit</button>
                  </div>
                ) : rec.status === 'attended' && (
                  editNote === rec.id ? (
                    <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                      <input className="input" style={{ fontSize:'0.8rem', padding:'6px 10px' }}
                        placeholder="Add a note..." value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        autoFocus id={`input-note-${rec.id}`} />
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { updateAttendanceNote(rec.id, noteText); setEditNote(null); }}
                        id={`btn-save-note-${rec.id}`}>Save</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" style={{ fontSize:'0.75rem', marginTop:'4px', color:'var(--accent)' }}
                      onClick={() => { setEditNote(rec.id); setNoteText(''); }}
                      id={`btn-add-note-${rec.id}`}>+ Add progress note</button>
                  )
                )}
                {editNote === rec.id && rec.progressNote && (
                  <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                    <input className="input" style={{ fontSize:'0.8rem', padding:'6px 10px' }}
                      value={noteText} onChange={(e) => setNoteText(e.target.value)} autoFocus id={`input-note-edit-${rec.id}`} />
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { updateAttendanceNote(rec.id, noteText); setEditNote(null); }}
                      id={`btn-save-note-edit-${rec.id}`}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditNote(null)}>✕</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;
