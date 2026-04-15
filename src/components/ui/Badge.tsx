// ─── Badge Component ───────────────────────────────────────────────────────────
import React from 'react';
import type { ClassStatus, Category } from '../../store/types';
import { CATEGORY_EMOJIS } from '../../utils/colorUtils';

interface StatusBadgeProps { status: ClassStatus; }
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const map: Record<ClassStatus, { label: string; icon: string; cls: string }> = {
    upcoming:    { label: 'Upcoming',    icon: '🕐', cls: 'badge-upcoming' },
    attended:    { label: 'Attended',    icon: '✅', cls: 'badge-attended' },
    missed:      { label: 'Missed',      icon: '❌', cls: 'badge-missed' },
    cancelled:   { label: 'Cancelled',   icon: '🚫', cls: 'badge-cancelled' },
    rescheduled: { label: 'Rescheduled', icon: '🔄', cls: 'badge-rescheduled' },
  };
  const { label, icon, cls } = map[status];
  return <span className={`badge ${cls}`}>{icon} {label}</span>;
};

interface CategoryBadgeProps { category: Category; }
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => (
  <span className="badge badge-category">
    {CATEGORY_EMOJIS[category]} {category}
  </span>
);
