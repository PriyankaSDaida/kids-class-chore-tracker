// ─── AppShell — Root Layout Wrapper ───────────────────────────────────────────
import React, { useEffect, type ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';
import BadgeCelebration from '../gamification/BadgeCelebration';
import ChoreEffects from '../chores/ChoreEffects';

interface Props { children: ReactNode; }

const AppShell: React.FC<Props> = ({ children }) => {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-shell">
      {/* Fixed left sidebar — hidden on mobile via CSS */}
      <Sidebar />

      {/* Right main area */}
      <div className="main-area">
        {/* Mobile-only header — CSS hides on tablet+ */}
        <MobileHeader />
        {/* Desktop/tablet top bar — CSS hides on mobile */}
        <TopBar />
        {/* Scrollable screen content */}
        <div className="screen-content">
          {children}
        </div>
        {/* Mobile-only bottom tabs — CSS hides on tablet+ */}
        <BottomNav />
      </div>

      {/* Global celebration overlays (appear above everything) */}
      <BadgeCelebration />
      <ChoreEffects />
    </div>
  );
};

export default AppShell;

