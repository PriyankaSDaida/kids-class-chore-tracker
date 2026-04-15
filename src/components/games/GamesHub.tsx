// ─── GamesHub — Games Section Landing Page ────────────────────────────────────
import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface GameDef {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  color: string;
  bg: string;
  minTokens: number;
}

const GAMES: GameDef[] = [
  { id: 'math',    emoji: '⚔️', name: 'Math Quest',      desc: 'Defeat number monsters!',     color: '#7C3AED', bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', minTokens: 1 },
  { id: 'word',    emoji: '🔤', name: 'Word Builder',     desc: 'Catch falling letters!',       color: '#0891B2', bg: 'linear-gradient(135deg,#164E63,#0891B2)', minTokens: 1 },
  { id: 'memory',  emoji: '🃏', name: 'Memory Match',     desc: 'Match icons to words!',        color: '#059669', bg: 'linear-gradient(135deg,#064E3B,#059669)', minTokens: 1 },
  { id: 'sorting', emoji: '♻️', name: 'Sorting Safari',   desc: 'Sort items to save Earth!',    color: '#D97706', bg: 'linear-gradient(135deg,#78350F,#D97706)', minTokens: 1 },
];

type ActiveGame = 'math' | 'word' | 'memory' | 'sorting' | null;

const GamesHub: React.FC<{
  onPlay: (game: ActiveGame) => void;
}> = ({ onPlay }) => {
  const { children, activeChildFilter, setScreen } = useAppStore();
  const childId = activeChildFilter || children[0]?.id || '';
  const child   = children.find((c) => c.id === childId);
  const tokens  = child?.gameTokens ?? 0;

  return (
    <main className="page-content" id="screen-games">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setScreen('dashboard')} id="btn-back-games">
          <ArrowLeft size={18}/>
        </button>
        <div>
          <h1 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.6rem', margin: 0 }}>
            🎮 Games
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            Complete quests to earn game tokens!
          </p>
        </div>
      </div>

      {/* Token balance hero */}
      <div style={{
        borderRadius: 'var(--r-xl)', padding: '20px 24px',
        background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
      }}>
        <div style={{ fontSize: '3rem' }}>🎮</div>
        <div>
          <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '2rem', color: '#fff', lineHeight: 1 }}>
            {tokens}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
            Game token{tokens !== 1 ? 's' : ''} available
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            Every 5 quests completed = 1 token
          </div>
        </div>
        {child && (
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: child.color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.6rem',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
            }}>
              {child.avatarEmoji}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 4 }}>
              {child.name}
            </div>
          </div>
        )}
      </div>

      {tokens === 0 && (
        <div style={{
          borderRadius: 'var(--r-lg)', padding: '12px 16px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          marginBottom: 20, fontSize: '0.82rem', color: '#92400E',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠️ Complete 5 quests on the Quest Board to earn a game token!
        </div>
      )}

      {/* Game cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {GAMES.map((game, i) => {
          const locked = tokens < game.minTokens;
          return (
            <button
              key={game.id}
              className="card"
              disabled={locked}
              onClick={() => !locked && onPlay(game.id as ActiveGame)}
              id={`game-${game.id}`}
              style={{
                padding: 0, overflow: 'hidden', cursor: locked ? 'not-allowed' : 'pointer',
                border: 'none', textAlign: 'left',
                opacity: locked ? 0.55 : 1,
                animation: `questReveal 0.4s var(--ease-spring) ${i * 80}ms both`,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={(e) => { if (!locked) (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {/* Coloured header */}
              <div style={{ background: game.bg, padding: '20px 20px 16px', position: 'relative' }}>
                <div style={{ fontSize: '3rem', marginBottom: 4 }}>{game.emoji}</div>
                {locked && (
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <Lock size={16} color="rgba(255,255,255,0.7)"/>
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 16px 16px' }}>
                <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>
                  {game.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {game.desc}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    background: locked ? 'var(--bg-tertiary)' : game.color,
                    color: locked ? 'var(--text-muted)' : '#fff',
                    padding: '4px 12px', borderRadius: 999,
                    fontSize: '0.72rem', fontWeight: 800,
                  }}>
                    {locked ? `🔒 Need ${game.minTokens} token` : '▶ Play'}
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    🎮 1 token
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Word collection preview */}
      {child && (child.wordCollection?.length ?? 0) > 0 && (
        <div className="card" style={{ padding: '16px', marginTop: 24 }}>
          <div style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', marginBottom: 10 }}>
            📚 {child.name}'s Word Collection ({child.wordCollection.length} words)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {child.wordCollection.map((w) => (
              <span key={w} style={{
                background: 'linear-gradient(135deg,#0891B2,#06B6D4)',
                color: '#fff', padding: '3px 10px', borderRadius: 999,
                fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Nunito, sans-serif',
              }}>{w}</span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default GamesHub;
