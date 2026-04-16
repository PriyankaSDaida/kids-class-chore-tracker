import { supabase } from './supabase';
import { getDeviceId } from './deviceId';
import { useAuthStore } from '../store/useAuthStore';

// If Supabase is not configured, all db calls silently do nothing.
// The app still works 100% via localStorage persist.
const isReady = () => supabase !== null;
const uid     = () => useAuthStore.getState().user?.id || getDeviceId();

// ── Generic helpers ───────────────────────────────────────────────────────────

async function upsertRow(table: string, id: string, data: unknown) {
  if (!isReady()) return;
  const { error } = await supabase!.from(table).upsert({
    id,
    user_id:     uid(),
    data,
    updated_at:  new Date().toISOString(),
  });
  if (error) console.error(`[db] upsert ${table}:`, error.message);
}

async function deleteRow(table: string, id: string) {
  if (!isReady()) return;
  const { error } = await supabase!
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', uid());
  if (error) console.error(`[db] delete ${table}:`, error.message);
}

async function fetchAll<T>(table: string): Promise<T[]> {
  if (!isReady()) return [];
  const { data, error } = await supabase!
    .from(table)
    .select('data')
    .eq('user_id', uid());
  if (error) { console.error(`[db] fetch ${table}:`, error.message); return []; }
  return (data ?? []).map((row) => row.data as T);
}

// ── Exported db object ────────────────────────────────────────────────────────

export const db = {

  children: {
    upsert:   (child: { id: string }) => upsertRow('children', child.id, child),
    delete:   (id: string)            => deleteRow('children', id),
    fetchAll: <T>()                    => fetchAll<T>('children'),
  },

  classes: {
    upsert:   (cls: { id: string })   => upsertRow('classes', cls.id, cls),
    delete:   (id: string)            => deleteRow('classes', id),
    fetchAll: <T>()                    => fetchAll<T>('classes'),
  },

  attendance: {
    upsert:   (rec: { id: string })   => upsertRow('attendance_records', rec.id, rec),
    fetchAll: <T>()                    => fetchAll<T>('attendance_records'),
  },

  chores: {
    upsert:   (c: { id: string })     => upsertRow('chores', c.id, c),
    delete:   (id: string)            => deleteRow('chores', id),
    fetchAll: <T>()                    => fetchAll<T>('chores'),
  },

  choreCompletions: {
    upsert: (cc: { id: string })      => upsertRow('chore_completions', cc.id, cc),
    deleteByChildDate: async (childId: string, date: string) => {
      if (!isReady()) return;
      const { error } = await supabase!
        .from('chore_completions')
        .delete()
        .eq('user_id', uid())
        .filter('data->>childId', 'eq', childId)
        .filter('data->>date',    'eq', date);
      if (error) console.error('[db] deleteByChildDate:', error.message);
    },
    deleteOne: (id: string)           => deleteRow('chore_completions', id),
    fetchAll:  <T>()                   => fetchAll<T>('chore_completions'),
  },

  milestones: {
    upsert:   (m: { id: string })     => upsertRow('reward_milestones', m.id, m),
    fetchAll: <T>()                    => fetchAll<T>('reward_milestones'),
  },

  shopPurchases: {
    upsert:   (p: { id: string })     => upsertRow('shop_purchases', p.id, p),
    fetchAll: <T>()                    => fetchAll<T>('shop_purchases'),
  },

  settings: {
    save: async (data: unknown) => {
      if (!isReady()) return;
      const { error } = await supabase!.from('app_settings').upsert({
        user_id:    uid(),
        data,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error('[db] save settings:', error.message);
    },
    fetch: async <T>(): Promise<T | null> => {
      if (!isReady()) return null;
      const { data, error } = await supabase!
        .from('app_settings')
        .select('data')
        .eq('user_id', uid())
        .single();
      if (error) return null;
      return (data?.data as T) ?? null;
    },
  },

  // ── Load everything for this device at startup ──────────────────────────────
  loadAll: async () => {
    if (!isReady()) return null;
    const [children, classes, attendance, chores, completions, milestones, shopPurchases, settingsRes] =
      await Promise.all([
        fetchAll('children'),
        fetchAll('classes'),
        fetchAll('attendance_records'),
        fetchAll('chores'),
        fetchAll('chore_completions'),
        fetchAll('reward_milestones'),
        fetchAll('shop_purchases'),
        supabase!
          .from('app_settings')
          .select('data')
          .eq('user_id', uid())
          .maybeSingle(),
      ]);
    return {
      children,
      classes,
      attendance,
      chores,
      completions,
      milestones,
      shopPurchases,
      settings: settingsRes.data?.data ?? null,
    };
  },

  // ── Sweep offline data to newly logged-in account ─────────────────────────
  migrateLocalToCloud: async (newUserId: string) => {
    if (!isReady()) return;
    const oldUid = getDeviceId();
    if (oldUid === newUserId) return;

    const tables = [
      'children', 'classes', 'attendance_records', 
      'chores', 'chore_completions', 'reward_milestones', 'app_settings', 'shop_purchases'
    ];

    for (const t of tables) {
      await supabase!.from(t).update({ user_id: newUserId }).eq('user_id', oldUid);
    }
  },
};