import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { db } from '../lib/db';

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isInitializing: true,
  initialize: () => {
    // Return early if Supabase is not available (offline fallback)
    if (!supabase) {
      set({ isInitializing: false });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isInitializing: false });
      if (session?.user) {
        db.migrateLocalToCloud(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        db.migrateLocalToCloud(session.user.id);
      }
    });
  },
  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    }
  },
}));
