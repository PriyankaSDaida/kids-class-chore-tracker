// ─── Cost Summary Screen ──────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../utils/colorUtils';
import type { Category } from '../../store/types';

const CostSummary: React.FC = () => {
  const { classes, children, activeChildFilter } = useAppStore();

  const filtered = useMemo(() =>
    activeChildFilter ? classes.filter((c) => c.childId === activeChildFilter) : classes,
    [classes, activeChildFilter]
  );

  // Only count non-cancelled classes with a cost
  const active = filtered.filter((c) => c.status !== 'cancelled' && c.monthlyCost > 0);

  // Per-child breakdown
  const childBreakdown = useMemo(() =>
    children.map((child) => {
      const childClasses = active.filter((c) => c.childId === child.id);
      const total = childClasses.reduce((sum, c) => sum + c.monthlyCost, 0);
      return { child, classes: childClasses, total };
    }).filter((b) => b.total > 0),
    [children, active]
  );

  // Per-category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    for (const cls of active) {
      map[cls.category] = (map[cls.category] || 0) + cls.monthlyCost;
    }
    return Object.entries(map).sort((a, b) => (b[1] as number) - (a[1] as number)) as [Category, number][];
  }, [active]);

  const grandTotal = useMemo(() => active.reduce((s, c) => s + c.monthlyCost, 0), [active]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <main className="page-content" id="screen-costs">
      {/* Grand total card */}
      <div className="card" style={{
        padding:'24px',
        marginBottom:'20px',
        background:'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
        border:'none', textAlign:'center'
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', color:'rgba(255,255,255,0.8)', marginBottom:'8px', fontSize:'0.875rem', fontWeight:600 }}>
          <DollarSign size={16} /> Monthly Total
        </div>
        <div style={{ fontSize:'2.8rem', fontWeight:900, color:'#fff', lineHeight:1 }}>
          {fmt(grandTotal)}
        </div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', marginTop:'6px' }}>
          {active.length} active class{active.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {grandTotal === 0 ? (
        <EmptyState
          emoji="💰"
          title="No costs tracked"
          description="Set a monthly cost when adding or editing a class to track your spending."
        />
      ) : (
        <>
          {/* Per-child breakdown */}
          {childBreakdown.length > 0 && (
            <section style={{ marginBottom:'20px' }}>
              <h3 className="section-title" style={{ marginBottom:'12px' }}>👶 By Child</h3>
              <div className="card" style={{ padding:'0 16px' }}>
                {childBreakdown.map(({ child, classes: cls, total }) => (
                  <div key={child.id}>
                    <div className="cost-row">
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <Avatar emoji={child.avatarEmoji} color={child.color} size="sm" />
                        <div>
                          <div style={{ fontWeight:600 }}>{child.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                            {cls.map((c) => c.name).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="cost-amount">{fmt(total)}</div>
                    </div>
                    {/* Per-class rows for this child */}
                    {cls.map((c) => (
                      <div key={c.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0 6px 32px', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                        <span style={{ color:'var(--text-secondary)' }}>{c.name}</span>
                        <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{fmt(c.monthlyCost)}/mo</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Per-category breakdown */}
          {categoryBreakdown.length > 0 && (
            <section style={{ marginBottom:'20px' }}>
              <h3 className="section-title" style={{ marginBottom:'12px' }}>📊 By Category</h3>
              <div className="card" style={{ padding:'0 16px' }}>
                {categoryBreakdown.map(([cat, total]) => (
                  <div key={cat} className="cost-row">
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'1.2rem' }}>{CATEGORY_EMOJIS[cat as Category]}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{cat}</div>
                        <div style={{ width:`${Math.round((total / grandTotal) * 100)}%`, height:'4px', background: CATEGORY_COLORS[cat as Category], borderRadius:'2px', marginTop:'4px', minWidth:'8px' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                      <div className="cost-amount">{fmt(total)}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{Math.round((total/grandTotal)*100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Annual projection */}
          <div className="card" style={{ padding:'16px', background:'var(--accent-light)', border:'1px solid var(--accent)', borderRadius:'12px' }}>
            <div style={{ fontWeight:700, color:'var(--accent)', marginBottom:'4px' }}>📈 Annual Estimate</div>
            <div style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--accent)' }}>{fmt(grandTotal * 12)}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px' }}>
              Based on current monthly spend of {fmt(grandTotal)}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default CostSummary;
