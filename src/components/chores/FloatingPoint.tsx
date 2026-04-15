// ─── FloatingPoint — Animated +10 / -3 Rising from ChoreCard ─────────────────
import React, { useEffect } from 'react';

interface Props {
  points:  number;
  onDone:  () => void;
}

const FloatingPoint: React.FC<Props> = ({ points, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 1300);
    return () => clearTimeout(t);
  }, [onDone]);

  const isPos = points > 0;
  return (
    <div
      className="floating-point"
      style={{ color: isPos ? 'var(--green)' : 'var(--red)' }}
      aria-hidden="true"
    >
      {isPos ? '+' : ''}{points}
    </div>
  );
};

export default FloatingPoint;
