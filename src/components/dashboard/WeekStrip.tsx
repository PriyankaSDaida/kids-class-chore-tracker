// ─── WeekStrip — Horizontally Scrollable 7-Day Strip ─────────────────────────
import React from 'react';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

const CAT_COLORS: Record<string, string> = {
  Sport:'#3B82F6', Music:'#A855F7', Art:'#F97316',
  Academic:'#10B981', Dance:'#EC4899', Other:'#64748B',
};

const WeekStrip: React.FC = () => {
  const { classes, setScreen, activeChildFilter } = useAppStore();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div style={{ marginBottom:24 }}>
      <div className="section-header">
        <h2 className="section-title">📅 This Week</h2>
      </div>
      <div className="week-strip">
        {days.map((day) => {
          const dateStr     = format(day, 'yyyy-MM-dd');
          const dayIsToday  = isToday(day);
          const dayClasses  = classes.filter((c) =>
            c.date === dateStr && c.status !== 'cancelled' &&
            (activeChildFilter ? c.childId === activeChildFilter : true)
          );
          const attended    = dayClasses.filter((c) => c.status === 'attended').length;
          const upcoming    = dayClasses.filter((c) => c.status === 'upcoming' || c.status === 'rescheduled').length;

          return (
            <button
              key={dateStr}
              className={`week-day-btn ${dayIsToday ? 'today' : ''}`}
              onClick={() => setScreen('calendar')}
              id={`week-day-${dateStr}`}
              title={`${dayClasses.length} class${dayClasses.length !== 1 ? 'es' : ''}`}
              style={{ position:'relative' }}
            >
              <span className="week-day-name">{format(day, 'EEE')}</span>
              <span className="week-day-num">{format(day, 'd')}</span>

              {/* Category dots */}
              <div className="week-day-dots">
                {dayClasses.slice(0, 3).map((c) => (
                  <div key={c.id} className="week-day-dot"
                    style={{
                      background: CAT_COLORS[c.category] ?? '#64748B',
                      opacity: c.status === 'attended' ? 0.5 : 1,
                    }}/>
                ))}
                {dayClasses.length > 3 && (
                  <div className="week-day-dot" style={{ background:'var(--text-muted)' }}/>
                )}
                {dayClasses.length === 0 && (
                  <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:600 }}>–</div>
                )}
              </div>

              {/* Mini completion progress */}
              {dayClasses.length > 0 && (
                <div style={{ fontSize:'0.58rem', fontWeight:800, color:'var(--text-muted)', fontFamily:'Nunito, sans-serif' }}>
                  {attended}/{dayClasses.length}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
