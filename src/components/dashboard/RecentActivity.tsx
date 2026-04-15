// ─── RecentActivity — Last 5 Actions Feed ─────────────────────────────────────
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

const CAT_EMOJIS: Record<string, string> = {
  Sport:'⚽', Music:'🎵', Art:'🎨', Academic:'📚', Dance:'💃', Other:'⭐',
};

const RecentActivity: React.FC = () => {
  const { attendanceRecords, classes, children, notifications } = useAppStore();

  // Attendance events
  const attendEvents = [...attendanceRecords]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
    .map((r) => {
      const cls   = classes.find((c) => c.id === r.classId);
      const child = children.find((c) => c.id === cls?.childId);
      const emoji = r.status === 'attended'
        ? (cls ? CAT_EMOJIS[cls.category] ?? '✅' : '✅')
        : r.status === 'missed' ? '❌' : '⛔';
      const verb  = r.status === 'attended' ? 'attended' : r.status === 'missed' ? 'missed' : 'cancelled';
      return {
        id: `att-${r.id}`,
        emoji,
        bg: r.status === 'attended' ? '#D1FAE5' : r.status === 'missed' ? '#FFE4E6' : '#F1F5F9',
        text: `${child?.name ?? 'Someone'} ${verb} ${cls?.name ?? 'a class'}`,
        createdAt: r.createdAt,
      };
    });

  // Badge notifications
  const badgeEvents = notifications
    .filter((n) => n.type === 'badge')
    .slice(0, 5)
    .map((n) => ({
      id: `notif-${n.id}`,
      emoji: '🏆',
      bg: '#EDE9FE',
      text: n.message,
      createdAt: n.createdAt,
    }));

  const allItems = [...attendEvents, ...badgeEvents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  if (allItems.length === 0) return null;

  return (
    <div style={{ marginBottom:24 }}>
      <div className="section-header">
        <h2 className="section-title">⚡ Recent Activity</h2>
      </div>
      <div className="card">
        <div className="activity-feed">
          {allItems.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-icon" style={{ background:item.bg }}>
                {item.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:'0.85rem', fontFamily:'Nunito, sans-serif' }}>
                  {item.text}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix:true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
