import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Child, ClassSession, AttendanceRecord, Theme, Screen,
  FilterState, ClassStatus, BadgeId, MoodEntry, ClassReaction,
  AppNotification, Chore, ChoreCompletion, RewardMilestone,
  ChoreSettings, RewardMilestoneType, ShopItem, ShopPurchase
} from './types';
import { XP_PER_ATTEND, getLevel, DEFAULT_CHORE_SETTINGS } from './types';
import { db } from '../lib/db';

// ─── Badge check ──────────────────────────────────────────────────────────────
const checkNewBadges = (
  child: Child,
  allRecords: AttendanceRecord[],
  allClasses: ClassSession[],
): BadgeId[] => {
  const childRecords = allRecords.filter((r) => {
    const cls = allClasses.find((c) => c.id === r.classId);
    return cls?.childId === child.id && r.status === 'attended';
  });
  const total  = childRecords.length;
  const earned = new Set(child.badges);
  const newBadges: BadgeId[] = [];
  const grant = (b: BadgeId) => { if (!earned.has(b)) { earned.add(b); newBadges.push(b); } };

  if (total >= 1)  grant('first-class');
  if (total >= 10) grant('early-bird');
  if (total >= 25) grant('champion');
  const sportCount = childRecords.filter((r) => allClasses.find((c) => c.id === r.classId)?.category === 'Sport').length;
  if (sportCount >= 5) grant('soccer-star');
  const artCount = childRecords.filter((r) => allClasses.find((c) => c.id === r.classId)?.category === 'Art').length;
  if (artCount >= 1)   grant('artist');
  const acadCount = childRecords.filter((r) => allClasses.find((c) => c.id === r.classId)?.category === 'Academic').length;
  if (acadCount >= 5)  grant('scholar');
  const sorted = [...childRecords].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) { if (sorted[i].status === 'attended') streak++; else break; }
  if (streak >= 5) grant('on-fire');
  return newBadges;
};

// ─── State shape ──────────────────────────────────────────────────────────────
interface AppState {
  // UI
  theme: Theme;
  activeScreen: Screen;
  activeProfileChildId: string | null;
  onboardingComplete: boolean;
  soundEnabled: boolean;
  sidebarCollapsed: boolean;
  globalSearch: string;
  _hasHydrated: boolean;
  _isSyncing: boolean;

  // Celebration triggers
  newlyEarnedBadge: BadgeId | null;
  newHeartChildId: string | null;
  newStarChildId:  string | null;
  pendingGiftChildId: string | null;
  giftSnoozedUntil:   string | null;

  // Data
  children: Child[];
  classes: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  notifications: AppNotification[];
  chores: Chore[];
  choreCompletions: ChoreCompletion[];
  rewardMilestones: RewardMilestone[];
  choreSettings: ChoreSettings;
  shopItems: ShopItem[];
  shopPurchases: ShopPurchase[];

  // Filters
  filter: FilterState;
  activeChildFilter: string;

  // UI actions
  setHasHydrated:        (v: boolean) => void;
  toggleTheme:           () => void;
  setScreen:             (s: Screen) => void;
  setActiveProfile:      (id: string | null) => void;
  completeOnboarding:    () => void;
  setActiveChildFilter:  (id: string) => void;
  setSoundEnabled:       (v: boolean) => void;
  setSidebarCollapsed:   (v: boolean) => void;
  setGlobalSearch:       (q: string) => void;
  clearNewBadge:         () => void;
  clearHeartCelebration: () => void;
  clearStarCelebration:  () => void;
  snoozeGift:            () => void;
  checkPendingGift:      () => void;

  // DB sync
  loadFromDB: () => Promise<void>;

  // Children
  addChild:    (c: Child) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  // Classes
  addClass:               (c: ClassSession) => void;
  addClasses:             (cs: ClassSession[]) => void;
  updateClass:            (id: string, u: Partial<ClassSession>) => void;
  updateRecurringClasses: (groupId: string, u: Partial<ClassSession>, fromDate: string) => void;
  deleteClass:            (id: string) => void;
  markAttended:           (id: string) => void;
  markMissed:             (id: string) => void;
  cancelClass:            (id: string) => void;
  rescheduleClass:        (id: string, d: string, t: string, r: string) => void;
  setClassReaction:       (id: string, r: ClassReaction) => void;

  // Attendance & mood
  addAttendanceRecord:  (r: AttendanceRecord) => void;
  updateAttendanceNote: (id: string, note: string) => void;
  addMoodEntry:         (childId: string, e: MoodEntry) => void;

  // Notifications
  addNotification:          (n: Omit<AppNotification, 'id'|'createdAt'|'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications:       () => void;

  // Chores
  addChore:            (c: Chore) => void;
  updateChore:         (id: string, u: Partial<Chore>) => void;
  deleteChore:         (id: string) => void;
  completeChore:       (choreId: string, childId: string, date: string) => void;
  uncompleteChore:     (choreId: string, childId: string, date: string) => void;
  resetTodayChores:    (childId: string, date: string) => void;
  claimGift:           (childId: string, giftNote: string) => void;
  updateChoreSettings: (u: Partial<ChoreSettings>) => void;

  // Shop
  addShopItem:     (i: ShopItem) => void;
  deleteShopItem:  (id: string) => void;
  buyShopItem:     (childId: string, itemId: string) => boolean;
  fulfillPurchase: (purchaseId: string) => void;

  // Games
  addToWordCollection: (childId: string, word: string) => void;
  awardXP:             (childId: string, xp: number) => void;

  // Filters
  setFilter:   (u: Partial<FilterState>) => void;
  resetFilter: () => void;
}

const defaultFilter: FilterState = {
  childId:'', category:'', status:'', searchQuery:'', dateFrom:'', dateTo:'',
};

const defaultShopItems: ShopItem[] = [
  { id: 'item-1', name: 'Extra Screen Time', cost: 150, type: 'points', icon: '📺' },
  { id: 'item-2', name: 'Pizza Night', cost: 500, type: 'points', icon: '🍕' },
  { id: 'item-3', name: '$5 Robux', cost: 10, type: 'tokens', icon: '💎' },
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme:'light', activeScreen:'dashboard', activeProfileChildId:null,
      onboardingComplete:false, soundEnabled:true, sidebarCollapsed:false,
      globalSearch:'', _hasHydrated:false, _isSyncing:false,
      newlyEarnedBadge:null, newHeartChildId:null, newStarChildId:null,
      pendingGiftChildId:null, giftSnoozedUntil:null,
      children:[], classes:[], attendanceRecords:[],
      notifications:[], chores:[], choreCompletions:[], rewardMilestones:[],
      choreSettings: DEFAULT_CHORE_SETTINGS,
      shopItems: defaultShopItems, shopPurchases: [],
      filter:defaultFilter, activeChildFilter:'',

      // ── UI ──────────────────────────────────────────────────────────────────
      setHasHydrated:       (v) => set({ _hasHydrated: v }),
      toggleTheme:          () => {
        const theme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme });
        db.settings.save({ ...get(), theme });
      },
      setScreen:            (screen) => set({ activeScreen: screen }),
      setActiveProfile:     (id) => set({ activeProfileChildId: id, activeScreen: id ? 'profile' : 'children' }),
      completeOnboarding:   () => {
        set({ onboardingComplete: true });
        db.settings.save({ ...get(), onboardingComplete: true });
      },
      setActiveChildFilter: (id) => set({ activeChildFilter: id }),
      setSoundEnabled:      (v) => {
        set({ soundEnabled: v });
        db.settings.save({ ...get(), soundEnabled: v });
      },
      setSidebarCollapsed:  (v) => set({ sidebarCollapsed: v }),
      setGlobalSearch:      (q) => set({ globalSearch: q }),
      clearNewBadge:        () => set({ newlyEarnedBadge: null }),
      clearHeartCelebration:() => set({ newHeartChildId: null }),
      clearStarCelebration: () => set({ newStarChildId: null }),

      snoozeGift: () => set({
        pendingGiftChildId: null,
        giftSnoozedUntil: new Date(Date.now() + 3_600_000).toISOString(),
      }),

      checkPendingGift: () => {
        const { rewardMilestones, pendingGiftChildId, giftSnoozedUntil } = get();
        if (pendingGiftChildId) return;
        if (giftSnoozedUntil && new Date(giftSnoozedUntil) > new Date()) return;
        const unclaimedGift = rewardMilestones.find((m) => m.type === 'gift' && !m.isClaimed);
        if (unclaimedGift) set({ pendingGiftChildId: unclaimedGift.childId, giftSnoozedUntil: null });
      },

      // ── DB sync — load everything from Supabase on startup ─────────────────
      loadFromDB: async () => {
        if (get()._isSyncing) return;
        set({ _isSyncing: true });
        try {
          const data = await db.loadAll();
          if (!data) return;
          const s = get();
          set({
            children:          data.children.length    > 0 ? data.children    : s.children,
            classes:           data.classes.length     > 0 ? data.classes     : s.classes,
            attendanceRecords: data.attendance.length  > 0 ? data.attendance  : s.attendanceRecords,
            chores:            data.chores.length      > 0 ? data.chores      : s.chores,
            choreCompletions:  data.completions.length > 0 ? data.completions : s.choreCompletions,
            rewardMilestones:  data.milestones.length  > 0 ? data.milestones  : s.rewardMilestones,
            shopPurchases:     data.shopPurchases.length > 0 ? data.shopPurchases : s.shopPurchases,
            // Merge settings if they exist in DB
            ...(data.settings
              ? {
                  theme:            (data.settings as AppState).theme            ?? s.theme,
                  onboardingComplete:(data.settings as AppState).onboardingComplete ?? s.onboardingComplete,
                  soundEnabled:     (data.settings as AppState).soundEnabled     ?? s.soundEnabled,
                  choreSettings:    (data.settings as AppState).choreSettings    ?? s.choreSettings,
                  shopItems:        (data.settings as AppState).shopItems        ?? s.shopItems,
                }
              : {}),
          });
        } catch (e) {
          console.error('[loadFromDB]', e);
        } finally {
          set({ _isSyncing: false });
        }
      },

      // ── Children ────────────────────────────────────────────────────────────
      addChild: (child) => {
        set((s) => ({ children: [...s.children, child] }));
        db.children.upsert(child);
      },
      updateChild: (id, upd) => {
        set((s) => ({ children: s.children.map((c) => c.id === id ? { ...c, ...upd } : c) }));
        const updated = get().children.find((c) => c.id === id);
        if (updated) db.children.upsert(updated);
      },
      deleteChild: (id) => {
        set((s) => {
          const removedIds = new Set(s.classes.filter((c) => c.childId === id).map((c) => c.id));
          return {
            children:          s.children.filter((c) => c.id !== id),
            classes:           s.classes.filter((c) => c.childId !== id),
            attendanceRecords: s.attendanceRecords.filter((r) => !removedIds.has(r.classId)),
            chores:            s.chores.filter((c) => c.assignedChildId !== id),
            choreCompletions:  s.choreCompletions.filter((c) => c.childId !== id),
            rewardMilestones:  s.rewardMilestones.filter((m) => m.childId !== id),
          };
        });
        db.children.delete(id);
      },

      // ── Classes ─────────────────────────────────────────────────────────────
      addClass: (cls) => {
        set((s) => ({ classes: [...s.classes, cls] }));
        db.classes.upsert(cls);
      },
      addClasses: (cs) => {
        set((s) => ({ classes: [...s.classes, ...cs] }));
        cs.forEach((c) => db.classes.upsert(c));
      },
      updateClass: (id, u) => {
        set((s) => ({ classes: s.classes.map((c) => c.id === id ? { ...c, ...u } : c) }));
        const updated = get().classes.find((c) => c.id === id);
        if (updated) db.classes.upsert(updated);
      },
      updateRecurringClasses: (gid, u, from) => {
        set((s) => ({ classes: s.classes.map((c) => c.recurringGroupId === gid && c.date >= from ? { ...c, ...u } : c) }));
        get().classes
          .filter((c) => c.recurringGroupId === gid && c.date >= from)
          .forEach((c) => db.classes.upsert(c));
      },
      deleteClass: (id) => {
        set((s) => ({
          classes:           s.classes.filter((c) => c.id !== id),
          attendanceRecords: s.attendanceRecords.filter((r) => r.classId !== id),
        }));
        db.classes.delete(id);
      },

      markAttended: (id) => {
        const now = new Date().toISOString();
        set((s) => {
          const cls   = s.classes.find((c) => c.id === id);
          if (!cls) return s;
          const child = s.children.find((c) => c.id === cls.childId);
          if (!child) return s;
          const record: AttendanceRecord = {
            id:crypto.randomUUID(), classId:id, date:cls.date,
            status:'attended', progressNote:'', createdAt:now,
          };
          const newRecords   = [...s.attendanceRecords, record];
          const newXP        = child.xp + XP_PER_ATTEND;
          const newLevel     = getLevel(newXP);
          const tempChild    = { ...child, xp:newXP, level:newLevel };
          const newBadges    = checkNewBadges(tempChild, newRecords, s.classes);
          const updatedChild = { ...child, xp:newXP, level:newLevel, badges:[...child.badges,...newBadges] };
          const notif: AppNotification = {
            id:crypto.randomUUID(), type:'attended', read:false, createdAt:now,
            title:'Class completed! ✅', message:`${child.name} attended ${cls.name} · +${XP_PER_ATTEND} XP`,
          };
          const badgeNotifs: AppNotification[] = newBadges.map(() => ({
            id:crypto.randomUUID(), type:'badge' as const, read:false, createdAt:now,
            title:'New badge unlocked! 🏆', message:`${child.name} earned a new badge!`,
          }));

          // Sync to DB
          db.attendance.upsert(record);
          db.children.upsert(updatedChild);
          const updatedCls = { ...cls, status:'attended' as ClassStatus };
          db.classes.upsert(updatedCls);

          return {
            classes:           s.classes.map((c) => c.id === id ? updatedCls : c),
            attendanceRecords: newRecords,
            children:          s.children.map((c) => c.id === child.id ? updatedChild : c),
            newlyEarnedBadge:  newBadges[0] ?? s.newlyEarnedBadge,
            notifications:     [...s.notifications, notif, ...badgeNotifs],
          };
        });
      },

      markMissed: (id) => {
        const now = new Date().toISOString();
        set((s) => {
          const cls = s.classes.find((c) => c.id === id);
          if (!cls) return s;
          const record: AttendanceRecord = {
            id:crypto.randomUUID(), classId:id, date:cls.date,
            status:'missed', progressNote:'', createdAt:now,
          };
          const updatedCls = { ...cls, status:'missed' as ClassStatus };
          db.attendance.upsert(record);
          db.classes.upsert(updatedCls);
          return {
            classes:           s.classes.map((c) => c.id === id ? updatedCls : c),
            attendanceRecords: [...s.attendanceRecords, record],
          };
        });
      },

      cancelClass: (id) => {
        set((s) => ({
          classes: s.classes.map((c) => c.id === id ? { ...c, status:'cancelled' as ClassStatus } : c),
        }));
        const updated = get().classes.find((c) => c.id === id);
        if (updated) db.classes.upsert(updated);
      },

      rescheduleClass: (id, d, t, r) => {
        set((s) => ({
          classes: s.classes.map((c) => c.id === id
            ? { ...c, status:'rescheduled' as ClassStatus, isRescheduled:true, originalDate:c.date, date:d, time:t, rescheduleReason:r }
            : c),
        }));
        const updated = get().classes.find((c) => c.id === id);
        if (updated) db.classes.upsert(updated);
      },

      setClassReaction: (id, reaction) => {
        set((s) => ({ classes: s.classes.map((c) => c.id === id ? { ...c, reaction } : c) }));
        const updated = get().classes.find((c) => c.id === id);
        if (updated) db.classes.upsert(updated);
      },

      // ── Attendance & mood ───────────────────────────────────────────────────
      addAttendanceRecord: (r) => {
        set((s) => ({ attendanceRecords: [...s.attendanceRecords, r] }));
        db.attendance.upsert(r);
      },
      updateAttendanceNote: (id, note) => {
        set((s) => ({ attendanceRecords: s.attendanceRecords.map((r) => r.id === id ? { ...r, progressNote:note } : r) }));
        const updated = get().attendanceRecords.find((r) => r.id === id);
        if (updated) db.attendance.upsert(updated);
      },
      addMoodEntry: (childId, entry) => {
        set((s) => ({ children: s.children.map((c) => c.id === childId ? { ...c, moodLog:[...c.moodLog, entry] } : c) }));
        const updated = get().children.find((c) => c.id === childId);
        if (updated) db.children.upsert(updated);
      },

      // ── Notifications ───────────────────────────────────────────────────────
      addNotification: (n) => set((s) => ({
        notifications: [{ id:crypto.randomUUID(), read:false, createdAt:new Date().toISOString(), ...n }, ...s.notifications].slice(0, 50),
      })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read:true })) })),
      clearNotifications:       () => set({ notifications: [] }),

      // ── Chores ──────────────────────────────────────────────────────────────
      addChore: (c) => {
        set((s) => ({ chores: [...s.chores, c] }));
        db.chores.upsert(c);
      },
      updateChore: (id, u) => {
        set((s) => ({ chores: s.chores.map((c) => c.id === id ? { ...c, ...u } : c) }));
        const updated = get().chores.find((c) => c.id === id);
        if (updated) db.chores.upsert(updated);
      },
      deleteChore: (id) => {
        set((s) => ({
          chores:           s.chores.filter((c) => c.id !== id),
          choreCompletions: s.choreCompletions.filter((cc) => cc.choreId !== id),
        }));
        db.chores.delete(id);
      },

      // ── Complete a chore — Points → Hearts → Stars → Gift ──────────────────
      completeChore: (choreId, childId, date) => {
        const now = new Date().toISOString();
        set((s) => {
          const chore = s.chores.find((c) => c.id === choreId);
          if (!chore) return s;
          const child = s.children.find((c) => c.id === childId);
          if (!child) return s;

          const alreadyDone = s.choreCompletions.some(
            (cc) => cc.choreId === choreId && cc.childId === childId && cc.date === date,
          );
          if (alreadyDone) return s;

          const completion: ChoreCompletion = {
            id:crypto.randomUUID(), choreId, childId, date,
            completedAt:now, points:chore.points, note:'',
          };

          const { pointsPerHeart, heartsPerStar, starsPerGift } = s.choreSettings;
          let newPoints      = child.points + chore.points;
          let newHearts      = child.hearts;
          let newStars       = child.stars;
          let newLifeHearts  = child.lifetimeHearts;
          let newLifeStars   = child.lifetimeStars;
          let newHeartChildId    = s.newHeartChildId;
          let newStarChildId     = s.newStarChildId;
          let pendingGiftChildId = s.pendingGiftChildId;
          const milestones: RewardMilestone[] = [];

          const mkMilestone = (type: RewardMilestoneType): RewardMilestone => ({
            id:crypto.randomUUID(), childId, type, date,
            giftNote:'', isClaimed:false, claimedAt:'',
          });

          let loops = 0;
          while (newPoints >= pointsPerHeart && loops < 20) {
            loops++;
            newPoints    -= pointsPerHeart;
            newHearts++;
            newLifeHearts++;
            newHeartChildId = childId;
            milestones.push(mkMilestone('heart'));
            if (newHearts >= heartsPerStar) {
              newHearts -= heartsPerStar;
              newStars++;
              newLifeStars++;
              newStarChildId = childId;
              milestones.push(mkMilestone('star'));
              if (newStars >= starsPerGift) {
                newStars -= starsPerGift;
                pendingGiftChildId = childId;
                milestones.push(mkMilestone('gift'));
              }
            }
          }

          const newCompletions = [...s.choreCompletions, completion];
          const doneToday = newCompletions.filter(
            (cc) => cc.childId === childId && cc.date === date,
          ).length;
          const tokenBonus = doneToday % 5 === 0 ? 1 : 0;

          const updatedChild: Child = {
            ...child,
            points:newPoints, hearts:newHearts, stars:newStars,
            lifetimeHearts:newLifeHearts, lifetimeStars:newLifeStars,
            gameTokens: (child.gameTokens ?? 0) + tokenBonus,
          };

          const notif: AppNotification = {
            id:crypto.randomUUID(), type:'chore', read:false, createdAt:now,
            title:`${chore.points > 0 ? '🌟' : '⚠️'} Chore ${chore.points > 0 ? 'completed' : 'recorded'}`,
            message:`${child.name}: ${chore.name} (${chore.points > 0 ? '+' : ''}${chore.points} pts)${tokenBonus ? ' · 🎮 +1 game token!' : ''}`,
          };

          // Sync to DB (fire and forget)
          db.choreCompletions.upsert(completion);
          db.children.upsert(updatedChild);
          milestones.forEach((m) => db.milestones.upsert(m));

          return {
            choreCompletions:  newCompletions,
            rewardMilestones:  [...s.rewardMilestones, ...milestones],
            children:          s.children.map((c) => c.id === childId ? updatedChild : c),
            newHeartChildId,
            newStarChildId,
            pendingGiftChildId,
            notifications: [...s.notifications, notif],
          };
        });
      },

      uncompleteChore: (choreId, childId, date) => {
        set((s) => {
          const completion = s.choreCompletions.find(
            (cc) => cc.choreId === choreId && cc.childId === childId && cc.date === date,
          );
          if (!completion) return s;
          const child = s.children.find((c) => c.id === childId);
          if (!child) return s;
          db.choreCompletions.deleteOne(completion.id);
          const updatedChild = { ...child, points: child.points - completion.points };
          db.children.upsert(updatedChild);
          return {
            choreCompletions: s.choreCompletions.filter((cc) => cc.id !== completion.id),
            children: s.children.map((c) => c.id === childId ? updatedChild : c),
          };
        });
      },

      resetTodayChores: (childId, date) => {
        set((s) => ({
          choreCompletions: s.choreCompletions.filter(
            (cc) => !(cc.childId === childId && cc.date === date),
          ),
        }));
        db.choreCompletions.deleteByChildDate(childId, date);
      },

      claimGift: (childId, giftNote) => {
        set((s) => {
          const pending = s.rewardMilestones
            .filter((m) => m.childId === childId && m.type === 'gift' && !m.isClaimed)
            .sort((a, b) => b.date.localeCompare(a.date))[0];
          if (!pending) return { pendingGiftChildId: null };
          const updated = { ...pending, isClaimed:true, claimedAt:new Date().toISOString(), giftNote };
          db.milestones.upsert(updated);
          return {
            rewardMilestones:  s.rewardMilestones.map((m) => m.id === pending.id ? updated : m),
            pendingGiftChildId: null,
            giftSnoozedUntil:  null,
          };
        });
      },

      updateChoreSettings: (u) => {
        set((s) => ({ choreSettings: { ...s.choreSettings, ...u } }));
        db.settings.save({ ...get(), choreSettings: get().choreSettings });
      },

      // ── Shop ─────────────────────────────────────────────────────────────────
      addShopItem: (item) => {
        set((s) => {
          const items = [...s.shopItems, item];
          db.settings.save({ ...get(), shopItems: items });
          return { shopItems: items };
        });
      },
      deleteShopItem: (id) => {
        set((s) => {
          const items = s.shopItems.filter((i) => i.id !== id);
          db.settings.save({ ...get(), shopItems: items });
          return { shopItems: items };
        });
      },
      buyShopItem: (childId, itemId) => {
        let success = false;
        set((s) => {
          const child = s.children.find((c) => c.id === childId);
          const item  = s.shopItems.find((i) => i.id === itemId);
          if (!child || !item) return s;

          if (item.type === 'points' && child.points < item.cost) return s;
          if (item.type === 'tokens' && (child.gameTokens ?? 0) < item.cost) return s;

          const updatedChild = { ...child };
          if (item.type === 'points') updatedChild.points -= item.cost;
          if (item.type === 'tokens') updatedChild.gameTokens = (child.gameTokens ?? 0) - item.cost;

          const purchase: ShopPurchase = {
            id: crypto.randomUUID(),
            childId, itemId, cost: item.cost, type: item.type,
            date: new Date().toISOString(),
            isFulfilled: false, fulfilledAt: ''
          };

          success = true;
          db.children.upsert(updatedChild);
          db.shopPurchases.upsert(purchase);

          return {
            children: s.children.map((c) => c.id === childId ? updatedChild : c),
            shopPurchases: [...s.shopPurchases, purchase],
          };
        });
        return success;
      },
      fulfillPurchase: (pid) => {
        set((s) => {
          const p = s.shopPurchases.find(x => x.id === pid);
          if (!p) return s;
          const updated = { ...p, isFulfilled: true, fulfilledAt: new Date().toISOString() };
          db.shopPurchases.upsert(updated);
          return {
            shopPurchases: s.shopPurchases.map(x => x.id === pid ? updated : x)
          };
        });
      },

      // ── Games ────────────────────────────────────────────────────────────────
      addToWordCollection: (childId, word) => {
        set((s) => ({
          children: s.children.map((c) =>
            c.id === childId && !(c.wordCollection ?? []).includes(word)
              ? { ...c, wordCollection: [...(c.wordCollection ?? []), word] }
              : c,
          ),
        }));
        const updated = get().children.find((c) => c.id === childId);
        if (updated) db.children.upsert(updated);
      },

      awardXP: (childId, xpGain) => {
        set((s) => ({
          children: s.children.map((c) => {
            if (c.id !== childId) return c;
            const newXP    = c.xp + xpGain;
            const newLevel = getLevel(newXP);
            return { ...c, xp: newXP, level: newLevel };
          }),
        }));
        const updated = get().children.find((c) => c.id === childId);
        if (updated) db.children.upsert(updated);
      },

      // ── Filters ─────────────────────────────────────────────────────────────
      setFilter:   (u) => set((s) => ({ filter: { ...s.filter, ...u } })),
      resetFilter: ()  => set({ filter: defaultFilter }),
    }),

    // ── Persist config ─────────────────────────────────────────────────────────
    {
      name:    'kids-class-tracker-store',
      storage: createJSONStorage(() => localStorage),
      version: 7,

      // _hasHydrated and _isSyncing are runtime-only — never write to localStorage
      partialize: (state) => {
        // Exclude runtime-only flags from localStorage persistence
        const { _hasHydrated: _h, _isSyncing: _s, ...rest } = state;
        void _h; void _s;
        return rest;
      },

      // After localStorage rehydrates, mark ready and kick off DB sync
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },

      // Accumulating migrations — all pending versions always run in sequence
      migrate: (raw: unknown, version: number) => {
        let state = { ...(raw as Record<string, unknown>) };

        if (version < 2) {
          const children = ((state.children as Array<Record<string,unknown>>) ?? []).map((c) => ({
            xp:0, level:1, badges:[], favoriteEmoji:'⭐', moodLog:[],
            points:0, hearts:0, stars:0, lifetimeHearts:0, lifetimeStars:0,
            gameTokens:0, wordCollection:[], ...c,
          }));
          state = { ...state, children, soundEnabled:true, newlyEarnedBadge:null, activeProfileChildId:null };
        }

        if (version < 3) {
          state = {
            ...state,
            notifications:   state.notifications   ?? [],
            globalSearch:    state.globalSearch    ?? '',
            sidebarCollapsed:state.sidebarCollapsed ?? false,
          };
        }

        if (version < 4) {
          const children = ((state.children as Array<Record<string,unknown>>) ?? []).map((c) => ({
            points:0, hearts:0, stars:0, lifetimeHearts:0, lifetimeStars:0,
            gameTokens:0, wordCollection:[], ...c,
          }));
          state = {
            ...state,
            children,
            chores:            state.chores            ?? [],
            choreCompletions:  state.choreCompletions  ?? [],
            rewardMilestones:  state.rewardMilestones  ?? [],
            choreSettings:     { ...DEFAULT_CHORE_SETTINGS, ...((state.choreSettings as Record<string,unknown>) ?? {}) },
            newHeartChildId:   null,
            newStarChildId:    null,
            pendingGiftChildId:null,
            giftSnoozedUntil:  null,
          };
        }

        if (version < 5) {
          const children = ((state.children as Array<Record<string,unknown>>) ?? []).map((c) => ({
            gameTokens:0, wordCollection:[], ...c,
          }));
          state = {
            ...state,
            children,
            choreSettings: { ...DEFAULT_CHORE_SETTINGS, ...((state.choreSettings as Record<string,unknown>) ?? {}) },
          };
        }

        if (version < 7) {
          state = {
            ...state,
            shopItems: (state.shopItems as Array<unknown>) ?? defaultShopItems,
            shopPurchases: (state.shopPurchases as Array<unknown>) ?? [],
          }
        }

        // version 6: _hasHydrated + _isSyncing added (runtime only, excluded via partialize)
        // version 7: shopItems + shopPurchases

        return state as unknown as AppState;
      },
    },
  ),
);