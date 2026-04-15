// ─── Color Mapping ─────────────────────────────────────────────────────────────
import type { Category } from '../store/types';

export const CATEGORY_COLORS: Record<Category, string> = {
  Sport:    '#3b82f6', // blue
  Music:    '#a855f7', // purple
  Art:      '#f97316', // orange
  Academic: '#22c55e', // green
  Dance:    '#ec4899', // pink
  Other:    '#64748b', // slate
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  Sport:    '⚽',
  Music:    '🎵',
  Art:      '🎨',
  Academic: '📚',
  Dance:    '💃',
  Other:    '⭐',
};

export const CHILD_COLOR_OPTIONS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b',
  '#3b82f6', '#a855f7', '#06b6d4', '#84cc16',
];

export const CHILD_AVATAR_OPTIONS = [
  '🦁', '🐼', '🦊', '🐸', '🦄', '🐬',
  '🦋', '🐯', '🐳', '🦅', '🐰', '🦉',
];

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
