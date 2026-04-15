// ─── Child Avatar ──────────────────────────────────────────────────────────────
import React from 'react';
import { hexToRgba } from '../../utils/colorUtils';

interface AvatarProps {
  emoji: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ emoji, color, size = 'md' }) => (
  <div
    className={`avatar avatar-${size}`}
    style={{ background: hexToRgba(color, 0.18), border: `2px solid ${hexToRgba(color, 0.35)}` }}
    aria-label={`Avatar: ${emoji}`}
  >
    {emoji}
  </div>
);

export default Avatar;
