// ─── Child Profile Page ────────────────────────────────────────────────────────
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getLevel, MOOD_EMOJIS } from '../../store/types';
import { getStreak, getAttendancePercent } from '../../hooks/useAttendance';
import Avatar from '../ui/Avatar';
import XPBar from '../gamification/XPBar';
import BadgeGrid from '../gamification/BadgeGrid';
import PointsChart from '../chores/PointsChart';

const ChildProfile: React.FC = () => {
  const {
    children, classes, attendanceRecords, activeProfileChildId, setActiveProfile,
    choreSettings, rewardMilestones,
  } = useAppStore();
  const child = children.find((c) => c.id === activeProfileChildId);
  if (!child) return null;

  const childRecords = attendanceRecords.filter((r) => {
    const cls = classes.find((c) => c.id === r.classId);
    return cls?.childId === child.id;
  });
  const attended  = childRecords.filter((r) => r.status === 'attended');
  const streak    = getStreak(attended);
  const pct       = getAttendancePercent(attended);
  const level     = getLevel(child.xp);
  const recentMood = [...child.moodLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const categoryStamps = [...new Set(
    attended.map((r) => classes.find((c) => c.id === r.classId)?.category).filter(Boolean)
  )];
  const catEmoji: Record<string, string> = {
    Sport:'⚽', Music:'🎵', Art:'🎨', Academic:'📚', Dance:'💃', Other:'⭐',
  };

  // Chore rewards
  const pts        = child.points ?? 0;
  const hearts     = child.hearts ?? 0;
  const stars      = child.stars  ?? 0;
  const lifeHearts = child.lifetimeHearts ?? 0;
  const lifeStars  = child.lifetimeStars  ?? 0;
  const ptsToHeart = Math.max(0, choreSettings.pointsPerHeart - Math.max(0, pts));
  const pct2Heart  = Math.min(1, Math.max(0, pts) / choreSettings.pointsPerHeart);
  const giftsEarned = rewardMilestones
    .filter((m) => m.childId === child.id && m.type === 'gift')
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="page-content" id="screen-profile" style={{ paddingTop:'8px' }}>
      <button className="btn btn-ghost btn-sm"
        onClick={() => setActiveProfile(null)} id="btn-profile-back"
        style={{ marginBottom:'12px', gap:'6px' }}>
        <ArrowLeft size={16}/> Back to Children
      </button>

      {/* ── Hero ── */}
      <div className="profile-hero" style={{ background:`linear-gradient(135deg,${child.color},${child.color}99)` }}>
        <Avatar emoji={child.avatarEmoji} color={child.color} size="xl"
          style={{ margin:'0 auto 12px', border:'4px solid rgba(255,255,255,0.5)' } as React.CSSProperties}/>
        <h2 style={{ color:'#fff', fontSize:'1.6rem', fontWeight:900, fontFamily:'Nunito, sans-serif', marginBottom:2 }}>
          {child.name} {child.favoriteEmoji}
        </h2>
        <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.85rem', marginBottom:16 }}>
          Age {child.age || '?'} · Level {level} Explorer
        </div>
        <div style={{ background:'rgba(255,255,255,0.25)', borderRadius:12, padding:12 }}>
          <XPBar child={child}/>
        </div>
        {/* Pts / Hearts / Stars inline */}
        <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:14, color:'rgba(255,255,255,0.95)' }}>
          {[['🎯', pts, 'POINTS'],['❤️', hearts, 'HEARTS'],['⭐', stars, 'STARS']].map(([em, val, lbl]) => (
            <div key={lbl as string} style={{ textAlign:'center' }}>
              <div style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'1.4rem' }}>{em} {val}</div>
              <div style={{ fontSize:'0.62rem', fontWeight:700, opacity:0.8 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[
          { label:'Classes', value:attended.length, emoji:'✅' },
          { label:'Streak',  value:`${streak}🔥`,   emoji:'' },
          { label:'Rate',    value:`${pct}%`,        emoji:'📈' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding:14, textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem', fontWeight:900, fontFamily:'Nunito, sans-serif', color:'var(--accent)' }}>
              {s.emoji} {s.value}
            </div>
            <div style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chore Rewards ── */}
      <div className="card" style={{ padding:18, marginBottom:16 }}>
        <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:14 }}>
          🏆 Chore Rewards
        </h3>
        {/* Progress bar */}
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', marginBottom:4 }}>
            <span>Progress to next ❤️</span>
            <span>{Math.max(0,pts)} / {choreSettings.pointsPerHeart} pts</span>
          </div>
          <div className="points-bar-track">
            <div className="points-bar-fill" style={{ width:`${pct2Heart*100}%` }}/>
          </div>
          <div style={{ fontSize:'0.68rem', color:ptsToHeart===0?'var(--green)':'var(--text-muted)', marginTop:4, fontWeight:600 }}>
            {ptsToHeart===0 ? '❤️ Heart ready!' : `${ptsToHeart} more pts to next ❤️`}
          </div>
        </div>
        {/* Hearts / Stars grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          {[
            { label:'HEARTS TOWARD ⭐', count:hearts, max:choreSettings.heartsPerStar, icon:'❤️', sub:`${hearts} / ${choreSettings.heartsPerStar} to next ⭐`, cls:'heart-icon' },
            { label:'STARS TOWARD 🎁',  count:stars,  max:choreSettings.starsPerGift,  icon:'⭐', sub:`${stars} / ${choreSettings.starsPerGift} to next 🎁`,   cls:'star-icon' },
          ].map(({ label, count, max, icon, sub, cls }) => (
            <div key={label} style={{ background:'var(--bg-tertiary)', borderRadius:'var(--r-md)', padding:'10px 12px' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:800, color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {Array.from({ length:Math.max(count, max) }).map((_, i) => (
                  <span key={i} className={cls} style={{ opacity:i<count?1:0.2 }}>{icon}</span>
                ))}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4, fontWeight:600 }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:16, fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)' }}>
          <span>❤️ {lifeHearts} lifetime hearts</span>
          <span>⭐ {lifeStars} lifetime stars</span>
        </div>
      </div>

      {/* ── 30-day chart ── */}
      <div className="card" style={{ padding:16, marginBottom:16 }}>
        <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:12 }}>
          📊 30-Day Points History
        </h3>
        <PointsChart childId={child.id}/>
      </div>

      {/* ── Gift history ── */}
      {giftsEarned.length > 0 && (
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <h3 style={{ fontWeight:900, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:12 }}>🎁 Reward History</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {giftsEarned.map((m) => (
              <div key={m.id} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 12px', background:'var(--bg-tertiary)', borderRadius:'var(--r-md)' }}>
                <span style={{ fontSize:'1.6rem', flexShrink:0 }}>🎁</span>
                <div>
                  <div style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.85rem', marginBottom:2 }}>
                    Gift Milestone {m.isClaimed ? '✓ Claimed' : '(pending)'}
                  </div>
                  {m.giftNote && <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', fontStyle:'italic' }}>"{m.giftNote}"</div>}
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4 }}>{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges ── */}
      <div className="card" style={{ padding:16, marginBottom:16 }}><BadgeGrid child={child}/></div>

      {/* ── Class Passport ── */}
      {categoryStamps.length > 0 && (
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <h3 style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:12 }}>🛂 Class Passport Stamps</h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {categoryStamps.map((cat) => (
              <div key={cat as string} style={{ display:'flex', flexDirection:'column', alignItems:'center', background:`var(--cat-${cat}-bg,var(--bg-tertiary))`, borderRadius:12, padding:'10px 14px', border:'2px dashed var(--border)', gap:4 }}>
                <div style={{ fontSize:'1.8rem' }}>{catEmoji[cat as string]}</div>
                <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase' }}>{cat}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mood ── */}
      {recentMood.length > 0 && (
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <h3 style={{ fontWeight:800, fontFamily:'Nunito, sans-serif', fontSize:'0.95rem', marginBottom:12 }}>💭 Recent Mood Check-Ins</h3>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {recentMood.map((e) => (
              <div key={e.id} title={`${e.date} · ${e.mood}/5`}
                style={{ width:40, height:40, borderRadius:10, background:'var(--bg-tertiary)', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
                {MOOD_EMOJIS[e.mood]}
              </div>
            ))}
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:8 }}>
            Average: {(recentMood.reduce((s,e)=>s+e.mood,0)/recentMood.length).toFixed(1)} / 5
          </div>
        </div>
      )}
    </main>
  );
};

export default ChildProfile;
