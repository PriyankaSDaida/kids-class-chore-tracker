// ─── App Root — Class Quest ────────────────────────────────────────────────────
import { useEffect, type ReactElement } from 'react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';

import AppShell     from './components/layout/AppShell';
import AuthPage     from './components/auth/AuthPage';
import Onboarding   from './components/onboarding/Onboarding';
import Dashboard    from './components/dashboard/Dashboard';
import CalendarView from './components/calendar/CalendarView';
import ClassList    from './components/classes/ClassList';
import ChildrenList from './components/children/ChildrenList';
import CostSummary  from './components/costs/CostSummary';
import ChildProfile from './components/profile/ChildProfile';
import Settings     from './components/settings/Settings';
import ChoreBoard   from './components/chores/ChoreBoard';
import ShopBoard    from './components/shop/ShopBoard';
import { ToastProvider } from './components/ui/Toast';
import GamesSection from './components/games/GamesSection';

import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  const { onboardingComplete, activeScreen, theme, _hasHydrated, loadFromDB } = useAppStore();
  const { user, isInitializing, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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

  // Show a minimal loading state while localStorage is being read or auth checks.
  // This prevents a flash of empty state that could overwrite good data.
  if (!_hasHydrated || isInitializing) {
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

  // Mandatory Authentication
  if (!user) {
    return (
      <ToastProvider>
        <div data-theme={theme}><AuthPage /></div>
      </ToastProvider>
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
    shop:      <ShopBoard />,
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