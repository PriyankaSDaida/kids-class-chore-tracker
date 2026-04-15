// ─── Category SVG Illustrations ───────────────────────────────────────────────
// Each category has a distinct inline SVG icon styled for kids
import React from 'react';
import type { Category } from '../../store/types';

interface Props { category: Category; size?: number; }

const illustrations: Record<Category, React.FC<{ size: number }>> = {

  Sport: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
      <path d="M20 4 C26 10 26 30 20 36 C14 30 14 10 20 4Z" fill="#3B82F6" opacity="0.5"/>
      <path d="M4 20 C10 14 30 14 36 20 C30 26 10 26 4 20Z" fill="#3B82F6" opacity="0.5"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
  ),

  Music: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#EDE9FE"/>
      <ellipse cx="14" cy="28" rx="5" ry="3.5" fill="#A855F7"/>
      <ellipse cx="28" cy="25" rx="5" ry="3.5" fill="#A855F7"/>
      <path d="M19 28 L19 12 L33 9 L33 25" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19 12 L33 9" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  Art: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FFEDD5"/>
      {/* Palette */}
      <ellipse cx="20" cy="21" rx="13" ry="11" fill="#FDE68A" stroke="#F97316" strokeWidth="2"/>
      <circle cx="12" cy="18" r="3" fill="#F43F5E"/>
      <circle cx="20" cy="13" r="3" fill="#3B82F6"/>
      <circle cx="28" cy="18" r="3" fill="#10B981"/>
      <circle cx="26" cy="27" r="3" fill="#A855F7"/>
      {/* Thumb hole */}
      <circle cx="21" cy="22" r="4" fill="#FFEDD5"/>
      {/* Brush */}
      <path d="M26 10 L32 4" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M30 6 L34 2 L36 4 L32 8Z" fill="#7C3AED"/>
    </svg>
  ),

  Academic: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#D1FAE5"/>
      {/* Book */}
      <rect x="8" y="10" width="24" height="22" rx="3" fill="#10B981" stroke="#059669" strokeWidth="1.5"/>
      <rect x="11" y="10" width="4" height="22" fill="#059669" opacity="0.6"/>
      <path d="M16 16 L28 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 21 L28 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 26 L23 26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      {/* Star */}
      <path d="M32 8 L33 5 L34 8 L37 8 L34.5 10 L35.5 13 L33 11 L30.5 13 L31.5 10 L29 8Z"
        fill="#F59E0B" stroke="#D97706" strokeWidth="0.5"/>
    </svg>
  ),

  Dance: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FFE4E6"/>
      {/* Ballet shoe */}
      <path d="M8 28 C8 22 12 14 20 14 C26 14 34 18 34 28 C32 30 24 32 14 30 Z"
        fill="#EC4899" stroke="#DB2777" strokeWidth="1.5"/>
      <ellipse cx="20" cy="28" rx="12" ry="4" fill="#F9A8D4"/>
      {/* Ribbons */}
      <path d="M12 26 C10 20 8 16 12 12" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M24 26 C28 20 30 16 26 10" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Bow */}
      <ellipse cx="20" cy="12" rx="4" ry="2.5" fill="#F43F5E" transform="rotate(-20 20 12)"/>
      <ellipse cx="20" cy="12" rx="4" ry="2.5" fill="#F43F5E" transform="rotate(20 20 12)"/>
      <circle cx="20" cy="12" r="2" fill="#DB2777"/>
    </svg>
  ),

  Other: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#F1F5F9"/>
      <path d="M20 6 L23 14 L32 14 L25 19 L28 28 L20 23 L12 28 L15 19 L8 14 L17 14Z"
        fill="#7C3AED" stroke="#6D28D9" strokeWidth="1"/>
    </svg>
  ),
};

const CategoryIllustration: React.FC<Props> = ({ category, size = 40 }) => {
  const Illustration = illustrations[category];
  return (
    <div className="cat-illustration" style={{ width: size, height: size }}>
      <Illustration size={size} />
    </div>
  );
};

export default CategoryIllustration;
