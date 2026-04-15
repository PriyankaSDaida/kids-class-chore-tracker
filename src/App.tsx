// ─── App Root — Class Quest with Chore Tracker + Games ────────────────────────
import { useEffect, type ReactElement } from 'react';
import { useAppStore } from './store/useAppStore';

import AppShell     from './components/layout/AppShell';
import Onboarding   from './components/onboarding/Onboarding';
import Dashboard    from './components/dashboard/Dashboard';
import CalendarView from './components/calendar/CalendarView';
import ClassList    from './components/classes/ClassList';
import ChildrenList from './components/children/ChildrenList';
import CostSummary  from './components/costs/CostSummary';
import ChildProfile from './components/profile/ChildProfile';
import Settings     from './components/settings/Settings';
import ChoreBoard   from './components/chores/ChoreBoard';
import { ToastProvider } from './components/ui/Toast';

// ── Lazy-load Games section so it doesn't affect initial load ──
import GamesSection from './components/games/GamesSection';

import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  const { onboardingComplete, activeScreen, theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!onboardingComplete) {
    return (
      <ToastProvider>
        <div data-theme={theme}>
          <Onboarding/>
        </div>
      </ToastProvider>
    );
  }

  const screens: Record<string, ReactElement> = {
    dashboard: <Dashboard/>,
    calendar:  <CalendarView/>,
    classes:   <ClassList/>,
    children:  <ChildrenList/>,
    costs:     <CostSummary/>,
    profile:   <ChildProfile/>,
    settings:  <Settings/>,
    chores:    <ChoreBoard/>,
    games:     <GamesSection/>,
  };

  return (
    <ToastProvider>
      <AppShell>
        {screens[activeScreen] ?? <Dashboard/>}
      </AppShell>
    </ToastProvider>
  );
}

export default App;
