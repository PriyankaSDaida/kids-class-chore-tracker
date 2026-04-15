// ─── EmptyState — now accepts ReactNode for illustration ──────────────────────
import React, { type ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ emoji, title, description, action }) => (
  <div className="empty-state anim-fadeIn">
    <div className="empty-emoji">{emoji}</div>
    <div className="empty-title">{title}</div>
    {description && <p className="empty-desc">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
