// ─── Canvas Confetti Explosion ─────────────────────────────────────────────────
// Full-screen canvas particle system — fires when a class is marked complete
import React, { useRef, useEffect, useLayoutEffect } from 'react';

interface ConfettiEffectProps {
  onComplete?: () => void;
}

const COLORS = [
  '#7C3AED','#A855F7','#EC4899','#F43F5E',
  '#F59E0B','#10B981','#3B82F6','#FDE68A',
  '#86EFAC','#93C5FD','#F9A8D4',
];

type Shape = 'rect' | 'circle' | 'triangle';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  shape: Shape;
  alpha: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep latest onComplete in a ref so the animation loop always calls the current version
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Launch from bottom-center
    const originX = canvas.width / 2;
    const originY = canvas.height;
    const shapes: Shape[] = ['rect', 'circle', 'triangle'];

    const particles: Particle[] = Array.from({ length: 160 }, () => ({
      x: originX + (Math.random() - 0.5) * 200,
      y: originY,
      vx: (Math.random() - 0.5) * 14,
      vy: -(Math.random() * 18 + 10), // upward launch
      size: Math.random() * 9 + 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      alpha: 1,
    }));

    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.55);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      for (const p of particles) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotSpeed;

        // Fade out as particles hit bottom
        if (p.y > canvas.height * 0.7) p.alpha -= 0.02;
        if (p.alpha > 0) { anyAlive = true; drawParticle(p); }
      }

      if (anyAlive) {
        frame = requestAnimationFrame(animate);
      } else {
        onCompleteRef.current?.();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 9999, pointerEvents: 'none',
      }}
    />
  );
};

export default ConfettiEffect;
