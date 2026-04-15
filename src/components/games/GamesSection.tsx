// ─── GamesSection — Games Router (Hub + 4 games) ──────────────────────────────
// Lazy-loaded so it doesn't bloat the initial bundle.
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import GamesHub     from './GamesHub';
import MathQuest    from './MathQuest';
import WordBuilder  from './WordBuilder';
import MemoryMatch  from './MemoryMatch';
import SortingSafari from './SortingSafari';

type ActiveGame = 'math' | 'word' | 'memory' | 'sorting' | null;

const GamesSection: React.FC = () => {
  const { children, activeChildFilter } = useAppStore();
  const childId = activeChildFilter || children[0]?.id || '';

  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  const handlePlay = (game: ActiveGame) => {
    if (!game) return;
    // Spend 1 token
    useAppStore.setState((s) => ({
      children: s.children.map((c) =>
        c.id === childId
          ? { ...c, gameTokens: Math.max(0, (c.gameTokens ?? 0) - 1) }
          : c,
      ),
    }));
    setActiveGame(game);
  };

  const handleBack = () => setActiveGame(null);

  if (activeGame === 'math')    return <MathQuest    onBack={handleBack} childId={childId}/>;
  if (activeGame === 'word')    return <WordBuilder   onBack={handleBack} childId={childId}/>;
  if (activeGame === 'memory')  return <MemoryMatch   onBack={handleBack} childId={childId}/>;
  if (activeGame === 'sorting') return <SortingSafari onBack={handleBack} childId={childId}/>;

  return <GamesHub onPlay={handlePlay}/>;
};

export default GamesSection;
