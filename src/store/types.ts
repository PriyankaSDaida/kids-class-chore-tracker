// ─── Core Types — Class Quest with Chore Tracker + Games ──────────────────────

export type Category = 'Sport' | 'Music' | 'Art' | 'Academic' | 'Dance' | 'Other';
export type RecurringFrequency = 'one-time' | 'weekly' | 'biweekly' | 'monthly';
export type ClassStatus = 'upcoming' | 'attended' | 'missed' | 'cancelled' | 'rescheduled';
export type AttendanceStatus = 'attended' | 'missed' | 'cancelled';
export type Theme = 'light' | 'dark';
export type Screen =
  | 'dashboard' | 'calendar' | 'classes' | 'children'
  | 'costs' | 'profile' | 'settings' | 'chores' | 'games' | 'shop';
export type ReminderBefore = 'none' | '15min' | '30min' | '1hour' | '1day';
export type ClassReaction = 'cant-wait' | 'not-feeling-it' | null;
export type Mood = 1 | 2 | 3 | 4 | 5;

// ─── Gamification (Classes) ────────────────────────────────────────────────────
export type BadgeId =
  | 'first-class' | 'on-fire' | 'soccer-star' | 'artist'
  | 'scholar'     | 'perfect-week' | 'early-bird' | 'champion';

export interface BadgeDefinition {
  id: BadgeId; name: string; description: string; emoji: string; color: string;
}

export const BADGE_DEFS: Record<BadgeId, BadgeDefinition> = {
  'first-class':  { id:'first-class',  name:'First Step!',   description:'Attended your very first class', emoji:'🌟', color:'#F59E0B' },
  'on-fire':      { id:'on-fire',      name:'On Fire!',      description:'5 classes in a row',             emoji:'🔥', color:'#EF4444' },
  'soccer-star':  { id:'soccer-star',  name:'Sport Star',    description:'5 Sport classes attended',       emoji:'⚽', color:'#3B82F6' },
  'artist':       { id:'artist',       name:'Little Artist', description:'First Art class attended',       emoji:'🎨', color:'#F97316' },
  'scholar':      { id:'scholar',      name:'Scholar',       description:'5 Academic classes attended',    emoji:'📚', color:'#10B981' },
  'perfect-week': { id:'perfect-week', name:'Perfect Week!', description:'All classes done in a week',     emoji:'✅', color:'#22C55E' },
  'early-bird':   { id:'early-bird',   name:'Early Bird',    description:'10 total classes attended',      emoji:'🐦', color:'#06B6D4' },
  'champion':     { id:'champion',     name:'Champion!',     description:'25 total classes attended',      emoji:'🏆', color:'#7C3AED' },
};

export const XP_PER_ATTEND   = 50;
export const XP_PER_LEVEL    = 200;
export const getLevel         = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXPInLevel     = (xp: number) => xp % XP_PER_LEVEL;
export const getLevelProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

// ─── Mood (Classes) ────────────────────────────────────────────────────────────
export interface MoodEntry { id:string; classId:string; date:string; mood:Mood; }
export const MOOD_EMOJIS: Record<Mood, string> = { 1:'😢',2:'😟',3:'😐',4:'🙂',5:'😁' };
export const MOOD_LABELS: Record<Mood, string>  = { 1:'Rough',2:'Okay',3:'Meh',4:'Good',5:'Amazing!' };

// ─── Notifications ─────────────────────────────────────────────────────────────
export type NotifType = 'badge' | 'attended' | 'reminder' | 'system' | 'chore';
export interface AppNotification {
  id:string; type:NotifType; title:string; message:string; read:boolean; createdAt:string;
}

// ─── Chore Tracker ─────────────────────────────────────────────────────────────
export type ChoreCategory = 'Helping' | 'Hygiene' | 'Homework' | 'Behaviour' | 'Kindness' | 'Responsibility';
export type ChoreRecurrence = 'once' | 'daily' | 'weekdays' | 'weekly';

export const CHORE_CAT_CONFIG: Record<ChoreCategory, { emoji:string; color:string; bg:string; darkBg:string }> = {
  Helping:        { emoji:'🤝', color:'#3B82F6', bg:'#DBEAFE', darkBg:'#1E3A5F' },
  Hygiene:        { emoji:'🧼', color:'#A855F7', bg:'#EDE9FE', darkBg:'#2E1F5E' },
  Homework:       { emoji:'📚', color:'#10B981', bg:'#D1FAE5', darkBg:'#064E3B' },
  Behaviour:      { emoji:'😊', color:'#F59E0B', bg:'#FEF3C7', darkBg:'#451A03' },
  Kindness:       { emoji:'💝', color:'#EC4899', bg:'#FCE7F3', darkBg:'#500724' },
  Responsibility: { emoji:'⭐', color:'#6366F1', bg:'#EEF2FF', darkBg:'#1E1B4B' },
};

export const CHORE_ICONS = [
  '🛏','🧹','🍽','🧼','📚','🐕','🛁','🌱','📦','🧺',
  '💪','🤝','🎯','⚡','🌟','💡','🔑','🎨','🍳','🚿',
  '😊','💝','🏃','🎮','🎵','🚴','🦷','🍎','📖','✏️',
  '🧸','🎒','👟','🏅','🧡','🌈','🦋','🐣','🌺','🎪',
];

// ─── Quest Card Rarity ─────────────────────────────────────────────────────────
export type ChoreRarity = 'silver' | 'gold' | 'legendary';
export const getChoreRarity = (lifetimeCompletions: number): ChoreRarity => {
  if (lifetimeCompletions >= 25) return 'legendary';
  if (lifetimeCompletions >= 10) return 'gold';
  return 'silver';
};

export interface Chore {
  id:string;
  assignedChildId:string; // specific child ID or 'all'
  name:string;
  description:string;
  icon:string;            // emoji
  points:number;          // positive (reward) or negative (deduction)
  category:ChoreCategory;
  recurrence:ChoreRecurrence;
  isActive:boolean;
  createdAt:string;
}

export interface ChoreCompletion {
  id:string;
  choreId:string;
  childId:string;
  date:string;            // YYYY-MM-DD
  completedAt:string;     // ISO
  points:number;          // snapshot of chore.points at time of completion
  note:string;
}

export type RewardMilestoneType = 'heart' | 'star' | 'gift';

export interface RewardMilestone {
  id:string;
  childId:string;
  type:RewardMilestoneType;
  date:string;            // YYYY-MM-DD
  giftNote:string;        // written by parent when claiming gift
  isClaimed:boolean;
  claimedAt:string;
}

export interface ChoreSettings {
  kidsCanMarkChores:boolean;   // false = PIN required
  parentPin:string;            // 4 digits or '' = no PIN
  pointsPerHeart:number;       // default 25
  heartsPerStar:number;        // default 5
  starsPerGift:number;         // default 5
  showAnimations:boolean;
  backgroundAnimations:boolean; // ambient world on/off
  soundCelebrations:boolean;    // heart/star/gift sounds
  soundCorrectAnswer:boolean;   // game correct sounds
  soundWrongAnswer:boolean;     // game wrong sounds
}

export const DEFAULT_CHORE_SETTINGS: ChoreSettings = {
  kidsCanMarkChores: true,
  parentPin: '',
  pointsPerHeart: 25,
  heartsPerStar: 5,
  starsPerGift: 5,
  showAnimations: true,
  backgroundAnimations: true,
  soundCelebrations: true,
  soundCorrectAnswer: true,
  soundWrongAnswer: true,
};

// ─── Gamification (Virtual Shop) ──────────────────────────────────────────────
export type ShopItemType = 'points' | 'tokens';

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: ShopItemType;
  icon: string;
}

export interface ShopPurchase {
  id: string;
  childId: string;
  itemId: string;
  cost: number;
  type: ShopItemType;
  date: string;
  isFulfilled: boolean;
  fulfilledAt: string;
}

// ─── Child ─────────────────────────────────────────────────────────────────────
export interface Child {
  id:string; name:string; age:number;
  color:string; avatarEmoji:string; favoriteEmoji:string;
  // Class XP
  xp:number; level:number; badges:BadgeId[];
  moodLog:MoodEntry[];
  // Chore rewards
  points:number;         // current points toward next heart (can be negative)
  hearts:number;         // current hearts toward next star
  stars:number;          // current stars toward next gift
  lifetimeHearts:number; // total hearts ever earned (permanent)
  lifetimeStars:number;  // total stars ever earned (permanent)
  // Games
  gameTokens:number;       // earned by completing chores (every 5 completions)
  wordCollection:string[]; // words learned in Word Builder game
  createdAt:string;
}

// ─── Class Session ─────────────────────────────────────────────────────────────
export interface ClassSession {
  id:string; childId:string; name:string; category:Category;
  instructorName:string; location:string;
  date:string; time:string; duration:number;
  recurringFrequency:RecurringFrequency;
  recurringGroupId:string|null;
  status:ClassStatus; notes:string; monthlyCost:number;
  remindBefore:ReminderBefore;
  isRescheduled:boolean; rescheduleReason:string; originalDate:string|null;
  reaction:ClassReaction; createdAt:string;
}

// ─── Attendance ────────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id:string; classId:string; date:string;
  status:AttendanceStatus; progressNote:string; createdAt:string;
}

// ─── Filter ────────────────────────────────────────────────────────────────────
export interface FilterState {
  childId:string; category:Category|''; status:ClassStatus|'';
  searchQuery:string; dateFrom:string; dateTo:string;
}

// ─── Word lists for Word Builder game ─────────────────────────────────────────
export const GAME_WORD_LISTS: Record<ChoreCategory, { easy: string[]; hard: string[] }> = {
  Helping:       { easy:['mop','wipe','help','give'], hard:['assist','scrub','tidy','sweep'] },
  Hygiene:       { easy:['soap','wash','rinse','dry'], hard:['brush','floss','clean','shower'] },
  Homework:      { easy:['read','draw','math','book'], hard:['study','write','learn','think'] },
  Behaviour:     { easy:['kind','calm','nice','try'], hard:['focus','smile','share','quiet'] },
  Kindness:      { easy:['love','hug','care','give'], hard:['thank','share','cheer','greet'] },
  Responsibility:{ easy:['tidy','safe','done','pack'], hard:['ready','check','alert','trust'] },
};
