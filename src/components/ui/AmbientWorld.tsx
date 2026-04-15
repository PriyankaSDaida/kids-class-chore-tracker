// ─── AmbientWorld — App-wide Animated Background Layer ────────────────────────
// Day: clouds, sun with rotating rays, floating collectibles, walking animals
// Night (after 7pm): deep blue sky, twinkling stars, glowing moon
// All animations: CSS transform/opacity only. No JS animation loop.
import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';


interface Collectible {
  id: number;
  emoji: string;
  x: number;   // vw %
  y: number;   // vh %
}

interface Animal {
  id: number;
  emoji: string;
  y: number;   // vh %
  delay: number;
  duration: number;
}

function isNightTime() {
  const h = new Date().getHours();
  return h >= 19 || h < 6;
}

const COLLECTIBLES = ['⭐', '🪙', '❤️', '💎', '🍀'];
const ANIMALS      = ['🦋', '🐦', '🐇', '🐝', '🦎'];

const AmbientWorld: React.FC = () => {
  const { choreSettings, children, activeChildFilter } = useAppStore();
  const { backgroundAnimations } = choreSettings;

  const [night,   setNight]   = useState(isNightTime());
  const [items,   setItems]   = useState<Collectible[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [bonuses, setBonuses] = useState<{ id: number; x: number; y: number }[]>([]);

  // Re-check day/night every minute
  useEffect(() => {
    const t = setInterval(() => setNight(isNightTime()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Spawn collectibles periodically
  useEffect(() => {
    if (!backgroundAnimations) return;
    const spawn = () => {
      const id = Date.now();
      setItems((prev) => [
        ...prev.slice(-4),   // keep max 5
        { id, emoji: COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)], x: 5 + Math.random() * 85, y: 30 + Math.random() * 45 },
      ]);
      // Auto-remove after 6s
      setTimeout(() => setItems((prev) => prev.filter((c) => c.id !== id)), 6000);
    };
    spawn();
    const t = setInterval(spawn, 9000);
    return () => clearInterval(t);
  }, [backgroundAnimations]);

  // Spawn decorative animals periodically
  useEffect(() => {
    if (!backgroundAnimations) return;
    let next = 0;
    const spawn = () => {
      const id = next++;
      setAnimals((prev) => [
        ...prev.slice(-2),
        { id, emoji: ANIMALS[Math.floor(Math.random() * ANIMALS.length)], y: 70 + Math.random() * 20, delay: 0, duration: 16 + Math.random() * 10 },
      ]);
      setTimeout(() => setAnimals((prev) => prev.filter((a) => a.id !== id)), 28_000);
    };
    spawn();
    const t = setInterval(spawn, 14_000);
    return () => clearInterval(t);
  }, [backgroundAnimations]);

  const handleTapCollectible = useCallback((item: Collectible) => {
    // Remove collectible
    setItems((prev) => prev.filter((c) => c.id !== item.id));
    // Show bonus pop
    const bonusId = Date.now();
    setBonuses((prev) => [...prev, { id: bonusId, x: item.x, y: item.y }]);
    setTimeout(() => setBonuses((prev) => prev.filter((b) => b.id !== bonusId)), 900);

    // Award +1 point by triggering a tiny "bonus chore" completion — we just award
    // via updateChild directly; simplest is to just update child points
    // We'll use the store's direct child update instead
    const childId = activeChildFilter || children[0]?.id || '';
    if (childId) {
      useAppStore.setState((s) => ({
        children: s.children.map((c) =>
          c.id === childId ? { ...c, points: c.points + 1 } : c,
        ),
      }));
    }
  }, [activeChildFilter, children]);

  if (!backgroundAnimations) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        overflow: 'hidden',
        background: night
          ? 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)'
          : 'linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 40%, #F0FDF4 100%)',
        transition: 'background 2s ease',
      }}
    >
      {/* ── Day: Clouds ── */}
      {!night && (
        <>
          {[
            { delay: 0,  dur: 35, top: '6%',  fontSize: '2.8rem', opacity: 0.55 },
            { delay: 10, dur: 48, top: '14%', fontSize: '2rem',   opacity: 0.4 },
            { delay: 20, dur: 28, top: '4%',  fontSize: '1.4rem', opacity: 0.35 },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', top: c.top, left: 0,
              fontSize: c.fontSize, opacity: c.opacity,
              animation: `cloudDrift ${c.dur}s linear ${c.delay}s infinite`,
            }}>☁️</div>
          ))}
          {/* Sun */}
          <div style={{
            position: 'absolute', top: 16, right: 20, fontSize: '2.8rem',
            animation: 'sunRays 18s linear infinite', opacity: 0.8,
          }}>☀️</div>
        </>
      )}

      {/* ── Night: Stars + Moon ── */}
      {night && (
        <>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${2 + (i * 17) % 45}%`,
              left: `${(i * 13 + 7) % 95}%`,
              fontSize: '0.45rem', opacity: 0.7,
              animation: `nightTwinkle ${1.2 + (i % 5) * 0.5}s ease-in-out ${(i % 7) * 0.28}s infinite`,
            }}>⭐</div>
          ))}
          <div style={{
            position: 'absolute', top: 14, right: 18, fontSize: '2.4rem', opacity: 0.9,
            animation: 'moonGlow 4s ease-in-out infinite',
          }}>🌙</div>
        </>
      )}

      {/* ── Collectibles (tappable — pointerEvents: auto) ── */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={(e) => { e.stopPropagation(); handleTapCollectible(item); }}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: '1.5rem',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'collectibleRise 6s ease both',
            zIndex: 2,
            userSelect: 'none',
          }}
          title="+1 bonus!"
        >
          {item.emoji}
        </div>
      ))}

      {/* ── Bonus pop overlay ── */}
      {bonuses.map((b) => (
        <div key={b.id} style={{
          position: 'absolute',
          left: `${b.x}%`, top: `${b.y}%`,
          fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', color: '#10B981',
          animation: 'bonusPop 0.9s ease both',
          pointerEvents: 'none', zIndex: 3,
          textShadow: '0 2px 6px rgba(16,185,129,0.6)',
        }}>
          +1 ⭐
        </div>
      ))}

      {/* ── Decorative animals ── */}
      {animals.map((a) => (
        <div key={a.id} style={{
          position: 'absolute',
          top: `${a.y}%`, left: 0,
          fontSize: '1.6rem', opacity: 0.7,
          animation: `animalWalk ${a.duration}s linear ${a.delay}s 1`,
        }}>
          {a.emoji}
        </div>
      ))}
    </div>
  );
};

export default AmbientWorld;
