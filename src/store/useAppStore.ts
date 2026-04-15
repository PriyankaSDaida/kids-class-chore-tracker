import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Child, ClassSession, AttendanceRecord, Theme, Screen,
  FilterState, ClassStatus, BadgeId, MoodEntry, ClassReaction,
  AppNotification, Chore, ChoreCompletion, RewardMilestone,
  ChoreSettings, RewardMilestoneType,
} from './types';
import { XP_PER_ATTEND, getLevel, DEFAULT_CHORE_SETTINGS } from './types';

// ─── Badge check (class XP) ────────────────────────────────────────────────────
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
  if (artCount >= 1)  grant('artist');
  const acadCount = childRecords.filter((r) => allClasses.find((c) => c.id === r.classId)?.category === 'Academic').length;
  if (acadCount >= 5) grant('scholar');
  const sorted = [...childRecords].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) { if (sorted[i].status === 'attended') streak++; else break; }
  if (streak >= 5) grant('on-fire');
  return newBadges;
};

// ─── App State Shape ───────────────────────────────────────────────────────────
interface AppState {
  // ── UI ──
  theme: Theme;
  activeScreen: Screen;
  activeProfileChildId: string | null;
  onboardingComplete: boolean;
  soundEnabled: boolean;
  sidebarCollapsed: boolean;
  globalSearch: string;
  _hasHydrated: boolean;

  // ── Class gamification celebration triggers ──
  newlyEarnedBadge: BadgeId | null;

  // ── Chore celebration triggers ──
  newHeartChildId: string | null;
  newStarChildId:  string | null;
  pendingGiftChildId: string | null;
  giftSnoozedUntil:   string | null;

  // ── Data ──
  children: Child[];
  classes: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  notifications: AppNotification[];
  chores: Chore[];
  choreCompletions: ChoreCompletion[];
  rewardMilestones: RewardMilestone[];
  choreSettings: ChoreSettings;

  // ── Filters ──
  filter: FilterState;
  activeChildFilter: string;

  // ── UI Actions ──
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

  // ── Children ──
  addChild:    (c: Child) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  // ── Classes ──
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

  // ── Attendance & mood ──
  addAttendanceRecord:  (r: AttendanceRecord) => void;
  updateAttendanceNote: (id: string, note: string) => void;
  addMoodEntry:         (childId: string, e: MoodEntry) => void;

  // ── Notifications ──
  addNotification:          (n: Omit<AppNotification, 'id'|'createdAt'|'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications:       () => void;

  // ── Chores ──
  addChore:            (c: Chore) => void;
  updateChore:         (id: string, u: Partial<Chore>) => void;
  deleteChore:         (id: string) => void;
  completeChore:       (choreId: string, childId: string, date: string) => void;
  uncompleteChore:     (choreId: string, childId: string, date: string) => void;
  resetTodayChores:    (childId: string, date: string) => void;
  claimGift:           (childId: string, giftNote: string) => void;
  updateChoreSettings: (u: Partial<ChoreSettings>) => void;

  // ── Games ──
  addToWordCollection: (childId: string, word: string) => void;
  awardXP:             (childId: string, xp: number) => void;

  // ── Filters ──
  setFilter:   (u: Partial<FilterState>) => void;
  resetFilter: () => void;
}

const defaultFilter: FilterState = {
  childId:'', category:'', status:'', searchQuery:'', dateFrom:'', dateTo:'',
};

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──
      theme:'light', activeScreen:'dashboard', activeProfileChildId:null,
      onboardingComplete:false, soundEnabled:true, sidebarCollapsed:false,
      globalSearch:'', _hasHydrated: false,
      newlyEarnedBadge:null, newHeartChildId:null, newStarChildId:null,
      pendingGiftChildId:null, giftSnoozedUntil:null,
      children:[], classes:[], attendanceRecords:[],
      notifications:[], chores:[], choreCompletions:[], rewardMilestones:[],
      choreSettings: DEFAULT_CHORE_SETTINGS,
      filter:defaultFilter, activeChildFilter:'',

      // ── UI ──
      setHasHydrated:       (v) => set({ _hasHydrated: v }),
      toggleTheme:          () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setScreen:            (screen) => set({ activeScreen: screen }),
      setActiveProfile:     (id) => set({ activeProfileChildId: id, activeScreen: id ? 'profile' : 'children' }),
      completeOnboarding:   () => set({ onboardingComplete: true }),
      setActiveChildFilter: (id) => set({ activeChildFilter: id }),
      setSoundEnabled:      (v) => set({ soundEnabled: v }),
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

      // ── Children ──
      addChild:    (child) => set((s) => ({ children: [...s.children, child] })),
      updateChild: (id, upd) => set((s) => ({ children: s.children.map((c) => c.id === id ? { ...c, ...upd } : c) })),
      deleteChild: (id) => set((s) => {
        const removedIds = new Set(s.classes.filter((c) => c.childId === id).map((c) => c.id));
        return {
          children: s.children.filter((c) => c.id !== id),
          classes:  s.classes.filter((c) => c.childId !== id),
          attendanceRecords: s.attendanceRecords.filter((r) => !removedIds.has(r.classId)),
          chores: s.chores.filter((c) => c.assignedChildId !== id),
          choreCompletions: s.choreCompletions.filter((c) => c.childId !== id),
          rewardMilestones: s.rewardMilestones.filter((m) => m.childId !== id),
        };
      }),

      // ── Classes ──
      addClass:    (cls) => set((s) => ({ classes: [...s.classes, cls] })),
      addClasses:  (cs)  => set((s) => ({ classes: [...s.classes, ...cs] })),
      updateClass: (id, u) => set((s) => ({ classes: s.classes.map((c) => c.id === id ? { ...c, ...u } : c) })),
      updateRecurringClasses: (gid, u, from) =>
        set((s) => ({ classes: s.classes.map((c) => c.recurringGroupId === gid && c.date >= from ? { ...c, ...u } : c) })),
      deleteClass: (id) => set((s) => ({
        classes: s.classes.filter((c) => c.id !== id),
        attendanceRecords: s.attendanceRecords.filter((r) => r.classId !== id),
      })),

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
          const newRecords = [...s.attendanceRecords, record];
          const newXP      = child.xp + XP_PER_ATTEND;
          const newLevel   = getLevel(newXP);
          const tempChild  = { ...child, xp:newXP, level:newLevel };
          const newBadges  = checkNewBadges(tempChild, newRecords, s.classes);
          const updatedChild = { ...child, xp:newXP, level:newLevel, badges:[...child.badges,...newBadges] };
          const notif: AppNotification = {
            id:crypto.randomUUID(), type:'attended', read:false, createdAt:now,
            title:'Class completed! ✅', message:`${child.name} attended ${cls.name} · +${XP_PER_ATTEND} XP`,
          };
          const badgeNotifs: AppNotification[] = newBadges.map((_b) => ({
            id:crypto.randomUUID(), type:'badge' as const, read:false, createdAt:now,
            title:'New badge unlocked! 🏆', message:`${child.name} earned a new badge!`,
          }));
          return {
            classes: s.classes.map((c) => c.id === id ? { ...c, status:'attended' as ClassStatus } : c),
            attendanceRecords: newRecords,
            children: s.children.map((c) => c.id === child.id ? updatedChild : c),
            newlyEarnedBadge: newBadges[0] ?? s.newlyEarnedBadge,
            notifications: [...s.notifications, notif, ...badgeNotifs],
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
          return {
            classes: s.classes.map((c) => c.id === id ? { ...c, status:'missed' as ClassStatus } : c),
            attendanceRecords: [...s.attendanceRecords, record],
          };
        });
      },
      cancelClass: (id) => set((s) => ({
        classes: s.classes.map((c) => c.id === id ? { ...c, status:'cancelled' as ClassStatus } : c),
      })),
      rescheduleClass: (id, d, t, r) => set((s) => ({
        classes: s.classes.map((c) => c.id === id
          ? { ...c, status:'rescheduled' as ClassStatus, isRescheduled:true, originalDate:c.date, date:d, time:t, rescheduleReason:r }
          : c),
      })),
      setClassReaction: (id, reaction) =>
        set((s) => ({ classes: s.classes.map((c) => c.id === id ? { ...c, reaction } : c) })),

      // ── Attendance & mood ──
      addAttendanceRecord:  (r) => set((s) => ({ attendanceRecords: [...s.attendanceRecords, r] })),
      updateAttendanceNote: (id, note) =>
        set((s) => ({ attendanceRecords: s.attendanceRecords.map((r) => r.id === id ? { ...r, progressNote:note } : r) })),
      addMoodEntry: (childId, entry) =>
        set((s) => ({ children: s.children.map((c) => c.id === childId ? { ...c, moodLog:[...c.moodLog, entry] } : c) })),

      // ── Notifications ──
      addNotification: (n) => set((s) => ({
        notifications: [{ id:crypto.randomUUID(), read:false, createdAt:new Date().toISOString(), ...n }, ...s.notifications].slice(0, 50),
      })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read:true })) })),
      clearNotifications: () => set({ notifications: [] }),

      // ── Chores CRUD ──
      addChore:    (c)    => set((s) => ({ chores: [...s.chores, c] })),
      updateChore: (id,u) => set((s) => ({ chores: s.chores.map((c) => c.id === id ? { ...c, ...u } : c) })),
      deleteChore: (id)   => set((s) => ({
        chores: s.chores.filter((c) => c.id !== id),
        choreCompletions: s.choreCompletions.filter((cc) => cc.choreId !== id),
      })),

      // ── Complete a chore ──
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
            newPoints -= pointsPerHeart;
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

          return {
            choreCompletions: newCompletions,
            rewardMilestones: [...s.rewardMilestones, ...milestones],
            children: s.children.map((c) => c.id === childId ? updatedChild : c),
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
          return {
            choreCompletions: s.choreCompletions.filter((cc) => cc.id !== completion.id),
            children: s.children.map((c) =>
              c.id === childId ? { ...c, points: c.points - completion.points } : c,
            ),
          };
        });
      },

      resetTodayChores: (childId, date) =>
        set((s) => ({
          choreCompletions: s.choreCompletions.filter(
            (cc) => !(cc.childId === childId && cc.date === date),
          ),
        })),

      claimGift: (childId, giftNote) => {
        set((s) => {
          const pending = s.rewardMilestones
            .filter((m) => m.childId === childId && m.type === 'gift' && !m.isClaimed)
            .sort((a, b) => b.date.localeCompare(a.date))[0];
          if (!pending) return { pendingGiftChildId: null };
          return {
            rewardMilestones: s.rewardMilestones.map((m) =>
              m.id === pending.id ? { ...m, isClaimed:true, claimedAt:new Date().toISOString(), giftNote } : m,
            ),
            pendingGiftChildId: null,
            giftSnoozedUntil: null,
          };
        });
      },

      updateChoreSettings: (u) =>
        set((s) => ({ choreSettings: { ...s.choreSettings, ...u } })),

      // ── Games ──
      addToWordCollection: (childId, word) =>
        set((s) => ({
          children: s.children.map((c) =>
            c.id === childId && !(c.wordCollection ?? []).includes(word)
              ? { ...c, wordCollection: [...(c.wordCollection ?? []), word] }
              : c,
          ),
        })),

      awardXP: (childId, xpGain) =>
        set((s) => ({
          children: s.children.map((c) => {
            if (c.id !== childId) return c;
            const newXP    = c.xp + xpGain;
            const newLevel = getLevel(newXP);
            return { ...c, xp: newXP, level: newLevel };
          }),
        })),

      // ── Filters ──
      setFilter:   (u) => set((s) => ({ filter: { ...s.filter, ...u } })),
      resetFilter: ()  => set({ filter: defaultFilter }),
    }),

    // ─── Persist config ────────────────────────────────────────────────────────
    {
      name: 'kids-class-tracker-store',

      // createJSONStorage is required for Zustand v5 — without it persist
      // silently fails to write in many environments including Vercel deploys.
      storage: createJSONStorage(() => localStorage),

      version: 6,

      // _hasHydrated is runtime-only — never save it to localStorage
      partialize: (state) => {
        const { _hasHydrated, ...rest } = state;
        return rest;
      },

      // onRehydrateStorage fires after localStorage is read and merged into state.
      // Setting _hasHydrated lets App.tsx wait before rendering, preventing a
      // flash of empty state on page load.
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },

      // Accumulating migrations — every version block updates state in place.
      // A single return at the end means ALL pending migrations always run.
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
            notifications: state.notifications ?? [],
            globalSearch: state.globalSearch ?? '',
            sidebarCollapsed: state.sidebarCollapsed ?? false,
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
            chores: state.chores ?? [],
            choreCompletions: state.choreCompletions ?? [],
            rewardMilestones: state.rewardMilestones ?? [],
            choreSettings: { ...DEFAULT_CHORE_SETTINGS, ...((state.choreSettings as Record<string,unknown>) ?? {}) },
            newHeartChildId: null,
            newStarChildId: null,
            pendingGiftChildId: null,
            giftSnoozedUntil: null,
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

        // version 6: adds _hasHydrated (runtime only, not stored)
        // no data migration needed — partialize handles exclusion

        return state as unknown as AppState;
      },
    },
  ),
);