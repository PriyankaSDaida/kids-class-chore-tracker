// ─── PointsChart — 30-Day SVG Bar Chart ─────────────────────────────────────
import React, { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

interface Props { childId: string }

const W = 360; const H = 130;
const LABEL_H = 18;
const BAR_AREA_H = H - LABEL_H;
const ZERO_Y_RATIO = 0.6;            // zero line at 60% from top
const ZERO_Y = Math.round(BAR_AREA_H * ZERO_Y_RATIO);
const MAX_POS_H = ZERO_Y - 8;        // max green bar height
const MAX_NEG_H = BAR_AREA_H - ZERO_Y - 4; // max red bar height

const PointsChart: React.FC<Props> = ({ childId }) => {
  const { choreCompletions } = useAppStore();

  // Build last-30-days data
  const days = useMemo(
    () => Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')),
    [],
  );

  const dailyNet = useMemo(
    () => days.map((date) =>
      choreCompletions
        .filter((cc) => cc.childId === childId && cc.date === date)
        .reduce((sum, cc) => sum + cc.points, 0)
    ),
    [choreCompletions, childId, days],
  );

  const maxPos = Math.max(1, ...dailyNet.map((v) => Math.max(0, v)));
  const maxNeg = Math.max(1, ...dailyNet.map((v) => Math.abs(Math.min(0, v))));

  const barW   = W / 30 - 1.5;
  const hasAny = dailyNet.some((v) => v !== 0);

  return (
    <div style={{ width:'100%', overflowX:'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width:'100%', height:'auto', display:'block', minWidth:260 }}
        aria-label="30-day points chart"
      >
        {/* Background grid lines */}
        {[0.25, 0.5, 0.75].map((r, i) => (
          <line key={i}
            x1={0} y1={Math.round(BAR_AREA_H * r)} x2={W} y2={Math.round(BAR_AREA_H * r)}
            stroke="var(--border)" strokeWidth="0.8" strokeDasharray="4 4"
          />
        ))}

        {/* Zero line (bold) */}
        <line x1={0} y1={ZERO_Y} x2={W} y2={ZERO_Y} stroke="var(--border)" strokeWidth="1.5"/>

        {/* Bars */}
        {dailyNet.map((net, i) => {
          if (net === 0) return null;
          const x    = i * (W / 30) + 0.8;
          const isPos = net > 0;
          const barH  = isPos
            ? Math.max(3, (net / maxPos) * MAX_POS_H)
            : Math.max(3, (Math.abs(net) / maxNeg) * MAX_NEG_H);
          const y = isPos ? ZERO_Y - barH : ZERO_Y;
          return (
            <rect key={i}
              x={x} y={y} width={barW} height={barH}
              fill={isPos ? 'var(--green)' : 'var(--red)'}
              rx={2} opacity={0.82}
            >
              <title>{days[i]}: {net > 0 ? '+' : ''}{net} pts</title>
            </rect>
          );
        })}

        {/* Empty state message */}
        {!hasAny && (
          <text x={W/2} y={BAR_AREA_H/2} textAnchor="middle"
            fontSize={11} fill="var(--text-muted)" fontFamily="Nunito, sans-serif" fontWeight={700}>
            No chore data yet
          </text>
        )}

        {/* X-axis labels */}
        <text x={2}   y={H} fontSize={9} fill="var(--text-muted)" fontFamily="Inter, sans-serif">
          {format(subDays(new Date(), 29), 'MMM d')}
        </text>
        <text x={W/2} y={H} fontSize={9} fill="var(--text-muted)" textAnchor="middle" fontFamily="Inter, sans-serif">
          {format(subDays(new Date(), 14), 'MMM d')}
        </text>
        <text x={W-2} y={H} fontSize={9} fill="var(--text-muted)" textAnchor="end" fontFamily="Inter, sans-serif">
          Today
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:8, justifyContent:'center' }}>
        {[['var(--green)','Earned'],['var(--red)','Deducted']].map(([c,l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)' }}>
            <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointsChart;
