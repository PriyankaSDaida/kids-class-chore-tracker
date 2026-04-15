// ─── CalendarView — Full-Size Grid + Desktop Right Panel ──────────────────────
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, addMonths, subMonths, isToday,
} from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { formatDate } from '../../utils/dateUtils';
import ClassCard from '../dashboard/ClassCard';
import ClassForm from '../classes/ClassForm';
import type { ClassSession } from '../../store/types';

const CAT_COLORS: Record<string, string> = {
  Sport:'#3B82F6', Music:'#A855F7', Art:'#F97316',
  Academic:'#10B981', Dance:'#EC4899', Other:'#64748B',
};
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ─── Shared Day Detail panel content ──────────────────────────────────────────
const DayDetailContent: React.FC<{
  selectedDate: string;
  dayClasses: ClassSession[];
  onAdd: () => void;
}> = ({ selectedDate, dayClasses, onAdd }) => (
  <>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <div>
        <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1rem', marginBottom:2 }}>
          {formatDate(selectedDate)}
        </h3>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>
          {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''}
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onAdd} id="btn-day-add">
        <Plus size={13}/> Add
      </button>
    </div>

    {dayClasses.length === 0 ? (
      <div style={{ textAlign:'center', padding:'40px 16px', color:'var(--text-muted)' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📭</div>
        <div style={{ fontWeight:700, fontFamily:'Nunito, sans-serif', fontSize:'0.9rem' }}>
          No classes this day
        </div>
        <button className="btn btn-secondary btn-sm" style={{ marginTop:12 }} onClick={onAdd} id="btn-day-add-empty">
          Schedule a class
        </button>
      </div>
    ) : (
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {dayClasses.map((cls: ClassSession) => <ClassCard key={cls.id} cls={cls}/>)}
      </div>
    )}
  </>
);

// ─── Main Calendar View ────────────────────────────────────────────────────────
const CalendarView: React.FC = () => {
  const { classes, activeChildFilter } = useAppStore();
  const isDesktop = useIsDesktop();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [showSheet, setShowSheet]       = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const calStart   = startOfWeek(monthStart, { weekStartsOn:1 });
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn:1 });
  const allDays    = eachDayOfInterval({ start:calStart, end:calEnd });

  const visibleClasses = useMemo(
    () => classes.filter((c) =>
      c.status !== 'cancelled' &&
      (activeChildFilter ? c.childId === activeChildFilter : true)
    ),
    [classes, activeChildFilter]
  );

  const classesOnDay = (dateStr: string) =>
    visibleClasses.filter((c) => c.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
    if (!isDesktop) setShowSheet(true);
  };

  const selectedDayClasses = selectedDate ? classesOnDay(selectedDate) : [];

  // Total classes this month for header
  const monthStr = format(currentMonth, 'yyyy-MM');
  const monthTotal = visibleClasses.filter((c) => c.date.startsWith(monthStr)).length;

  return (
    <main className="page-content" id="screen-calendar">
      {/* Month navigation */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:20, flexWrap:'wrap', gap:12,
      }}>
        <div>
          <h2 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', marginBottom:2 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>
            {monthTotal} class{monthTotal !== 1 ? 'es' : ''} this month
          </div>
        </div>

        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button className="btn btn-secondary btn-icon btn-sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} id="btn-cal-prev">
            <ChevronLeft size={16}/>
          </button>
          <button className="btn btn-secondary btn-sm" style={{ padding:'0 14px' }}
            onClick={() => setCurrentMonth(new Date())} id="btn-cal-today">
            Today
          </button>
          <button className="btn btn-secondary btn-icon btn-sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} id="btn-cal-next">
            <ChevronRight size={16}/>
          </button>
          <button className="btn btn-primary btn-sm"
            onClick={() => setShowAdd(true)} id="btn-cal-add">
            <Plus size={14}/> Add Class
          </button>
        </div>
      </div>

      {/* ─── Desktop: calendar + right panel side by side ─── */}
      <div className="calendar-layout">

        {/* Calendar grid card */}
        <div className="card" style={{ padding:16, flex:1 }}>
          {/* Day name headers */}
          <div className="cal-header-row">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="calendar-grid">
            {allDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayCls  = classesOnDay(dateStr);
              const isCurrentMonth = day >= monthStart && day <= monthEnd;
              const isTodayDay     = isToday(day);
              const isSelected     = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  className={`cal-day ${isTodayDay ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDayClick(dateStr)}
                  id={`cal-day-${dateStr}`}
                  title={dayCls.length > 0 ? dayCls.map((c) => c.name).join(', ') : undefined}
                >
                  <span className="cal-day-num">{format(day, 'd')}</span>
                  {dayCls.length > 0 && (
                    <div className="cal-dots">
                      {dayCls.slice(0, 3).map((c) => (
                        <div key={c.id} className="cal-dot"
                          style={{
                            background: CAT_COLORS[c.category] ?? '#64748B',
                            opacity: c.status === 'attended' ? 0.45 : 1,
                          }}/>
                      ))}
                      {dayCls.length > 3 && (
                        <div className="cal-dot" style={{ background:'var(--text-muted)' }}/>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category legend */}
          <div style={{
            display:'flex', flexWrap:'wrap', gap:'6px 16px',
            marginTop:16, paddingTop:12, borderTop:'1.5px solid var(--border)',
          }}>
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <div key={cat} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>
                {cat}
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--text-muted)', opacity:0.5 }}/>
              Attended
            </div>
          </div>
        </div>

        {/* ─── Desktop right panel ─── */}
        {isDesktop && (
          <div className="day-panel">
            {selectedDate ? (
              <DayDetailContent
                selectedDate={selectedDate}
                dayClasses={selectedDayClasses}
                onAdd={() => setShowAdd(true)}
              />
            ) : (
              <div style={{ textAlign:'center', padding:'52px 16px', color:'var(--text-muted)' }}>
                <div style={{ fontSize:'2.8rem', marginBottom:12 }}>👆</div>
                <div style={{ fontWeight:700, fontFamily:'Nunito, sans-serif', fontSize:'0.9rem', marginBottom:6 }}>
                  Select a day
                </div>
                <div style={{ fontSize:'0.78rem' }}>
                  Click any date to see and manage classes for that day
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Mobile bottom sheet ─── */}
      {!isDesktop && showSheet && selectedDate && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position:'fixed', inset:0,
              background:'rgba(0,0,0,0.4)', zIndex:200,
              backdropFilter:'blur(4px)',
            }}
            onClick={() => setShowSheet(false)}
          />
          {/* Sheet */}
          <div style={{
            position:'fixed', bottom:0, left:0, right:0,
            background:'var(--bg-secondary)',
            borderRadius:'var(--r-xl) var(--r-xl) 0 0',
            padding:'20px 20px 40px',
            maxHeight:'80dvh', overflowY:'auto',
            zIndex:201,
            animation:'sheetUp 0.36s var(--ease-spring) both',
          }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
              <button className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowSheet(false)} id="btn-cal-sheet-close">
                <X size={16}/>
              </button>
            </div>
            <DayDetailContent
              selectedDate={selectedDate}
              dayClasses={selectedDayClasses}
              onAdd={() => { setShowSheet(false); setShowAdd(true); }}
            />
          </div>
        </>
      )}

      {showAdd && <ClassForm onClose={() => setShowAdd(false)}/>}
    </main>
  );
};

export default CalendarView;
