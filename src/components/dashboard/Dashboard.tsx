// ─── Dashboard — Desktop 3-Column Grid Layout ─────────────────────────────────
import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { todayStr } from '../../utils/dateUtils';
import { applyFilter } from '../../hooks/useFilter';
import { getLevel } from '../../store/types';
import { getStreak } from '../../hooks/useAttendance';

import HeroBanner      from './HeroBanner';
import StatsBar        from './StatsBar';
import WeeklyRing      from './WeeklyRing';
import WeekStrip       from './WeekStrip';
import RecentActivity  from './RecentActivity';
import ClassCard       from './ClassCard';
import WeeklyChallenge from '../gamification/WeeklyChallenge';
import Leaderboard     from '../gamification/Leaderboard';
import XPBar           from '../gamification/XPBar';
import ClassForm       from '../classes/ClassForm';
import EmptyState      from '../ui/EmptyState';
import Mascot          from '../ui/Mascot';
import ChoreWidget     from '../chores/ChoreWidget';


// ── Streak badge icons map
const BADGE_EMOJI: Record<string, string> = {
  'first-class':'🌟','on-fire':'🔥','soccer-star':'⚽','artist':'🎨',
  'scholar':'📚','perfect-week':'✅','early-bird':'🐦','champion':'🏆',
};

const Dashboard: React.FC = () => {
  const {
    classes, filter, activeChildFilter,
    children, attendanceRecords,
  } = useAppStore();

  const [showAdd, setShowAdd] = useState(false);
  const today  = todayStr();
  const in7d   = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const workingFilter = useMemo(
    () => (activeChildFilter ? { ...filter, childId: activeChildFilter } : filter),
    [filter, activeChildFilter]
  );
  const allFiltered = useMemo(() => applyFilter(classes, workingFilter), [classes, workingFilter]);

  const todayClasses = useMemo(
    () => allFiltered
      .filter((c) => c.date === today)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [allFiltered, today]
  );

  const upcoming = useMemo(
    () => allFiltered
      .filter((c) => c.date > today && c.date <= in7d && (c.status === 'upcoming' || c.status === 'rescheduled'))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 4),
    [allFiltered, today, in7d]
  );

  // Featured child for right column
  const activeChild = useMemo(
    () => (activeChildFilter ? children.find((c) => c.id === activeChildFilter) : children[0]),
    [activeChildFilter, children]
  );

  const streak = useMemo(() => {
    if (!activeChild) return 0;
    const records = attendanceRecords.filter((r) => {
      const cls = classes.find((c) => c.id === r.classId);
      return cls?.childId === activeChild.id && r.status === 'attended';
    });
    return getStreak(records);
  }, [activeChild, attendanceRecords, classes]);

  if (classes.length === 0) {
    return (
      <main className="page-content" id="screen-dashboard">
        <HeroBanner />
        <EmptyState
          emoji={<Mascot size={130} mood="thinking"/>}
          title="Start your Class Quest! 🦁"
          description="Add your first class and Leo will help track every adventure."
          action={
            <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="btn-dash-first">
              Add First Class
            </button>
          }
        />
        {showAdd && <ClassForm onClose={() => setShowAdd(false)}/>}
      </main>
    );
  }

  return (
    <main className="page-content" id="screen-dashboard">
      {/* Full-width hero */}
      <HeroBanner/>

      {/* 4-stat chips */}
      <StatsBar/>

      {/* ─── Desktop 3-column grid ─────────────────────────────────────────── */}
      <div className="dashboard-grid">

        {/* ── LEFT: Chore Widget + Today + Upcoming ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Chore widget — always shown if chores exist */}
          <ChoreWidget/>

          {todayClasses.length > 0 && (

            <section>
              <div className="section-header">
                <h2 className="section-title">⚡ Today's Adventure</h2>
                <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700 }}>
                  {todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="stagger">
                {todayClasses.map((cls) => <ClassCard key={cls.id} cls={cls}/>)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">🗓 Coming Up</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="stagger">
                {upcoming.map((cls) => <ClassCard key={cls.id} cls={cls}/>)}
              </div>
            </section>
          )}

          {todayClasses.length === 0 && upcoming.length === 0 && (
            <div className="card" style={{ padding:28, textAlign:'center' }}>
              <Mascot size={80} mood="happy"/>
              <p style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', marginTop:12, marginBottom:12 }}>
                You're all free this week! 🎉
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} id="btn-dash-add-empty">
                + Add a Class
              </button>
            </div>
          )}
        </div>

        {/* ── CENTER: Weekly Ring + Challenge ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <WeeklyRing/>
          <WeeklyChallenge/>
        </div>

        {/* ── RIGHT: Child XP + Streak + Leaderboard ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {activeChild && (
            <div className="card" style={{ padding:18 }}>
              {/* Avatar + name row */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{
                  width:44, height:44, borderRadius:'50%',
                  background:activeChild.color, display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0,
                }}>
                  {activeChild.avatarEmoji}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem' }}>
                    {activeChild.name} {activeChild.favoriteEmoji}
                  </div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600 }}>
                    Level {getLevel(activeChild.xp)} · {activeChild.badges.length} badge{activeChild.badges.length !== 1 ? 's':''}
                  </div>
                </div>
                {/* Streak flame */}
                {streak > 1 && (
                  <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <span className="streak-flame" style={{ fontSize:'1.4rem' }}>🔥</span>
                    <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--red)', fontFamily:'Nunito, sans-serif' }}>
                      {streak}
                    </span>
                  </div>
                )}
              </div>

              {/* XP bar */}
              <XPBar child={activeChild}/>

              {/* Recent badges row */}
              {activeChild.badges.length > 0 && (
                <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:4 }}>
                  {activeChild.badges.map((b) => (
                    <span key={b} title={b} style={{ fontSize:'1.3rem' }}>
                      {BADGE_EMOJI[b] ?? '🏅'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <Leaderboard/>
        </div>
      </div>{/* /dashboard-grid */}

      {/* ── Week strip ── */}
      <WeekStrip/>

      {/* ── Recent activity feed ── */}
      <RecentActivity/>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add class" id="btn-dash-fab">
        <Plus size={24}/>
      </button>

      {showAdd && <ClassForm onClose={() => setShowAdd(false)}/>}
    </main>
  );
};

export default Dashboard;
