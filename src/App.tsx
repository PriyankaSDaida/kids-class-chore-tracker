// ─── App Root — Class Quest ────────────────────────────────────────────────────
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
import GamesSection from './components/games/GamesSection';

import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  const { onboardingComplete, activeScreen, theme, _hasHydrated, loadFromDB } = useAppStore();

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Once localStorage has hydrated, fetch the latest data from Supabase.
  // The app is already usable from localStorage — this just syncs any
  // changes made on other devices or sessions.
  useEffect(() => {
    if (_hasHydrated) {
      loadFromDB();
    }
  }, [_hasHydrated, loadFromDB]);

  // Show a minimal loading state while localStorage is being read.
  // This prevents a flash of empty state that could overwrite good data.
  if (!_hasHydrated) {
    return (
      <div
        data-theme={theme}
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '2.5rem',
        }}
      >
        🦁
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <ToastProvider>
        <div data-theme={theme}>
          <Onboarding />
        </div>
      </ToastProvider>
    );
  }

  const screens: Record<string, ReactElement> = {
    dashboard: <Dashboard />,
    calendar:  <CalendarView />,
    classes:   <ClassList />,
    children:  <ChildrenList />,
    costs:     <CostSummary />,
    profile:   <ChildProfile />,
    settings:  <Settings />,
    chores:    <ChoreBoard />,
    games:     <GamesSection />,
  };

  return (
    <ToastProvider>
      <AppShell>
        {screens[activeScreen] ?? <Dashboard />}
      </AppShell>
    </ToastProvider>
  );
}

export default App;