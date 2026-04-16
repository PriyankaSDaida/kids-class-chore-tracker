<div align="center">

# ⚔️ Class Quest

### *The all-in-one kids activity tracker, quest board & mini-game hub*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B6B?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Track classes · Complete quests · Earn rewards · Play games · Level up together**

[✨ Features](#-features) · [🚀 Getting Started](#-getting-started) · [🏗 Architecture](#-architecture) · [🎮 Games](#-mini-games) · [🏆 Reward System](#-reward-system)

</div>

---

## 🌟 What is Class Quest?

Class Quest is a **desktop-first, fully responsive** web app for parents and kids. It combines a beautiful **extracurricular class tracker** with a gamified **Quest Board** (chore tracker), a **rewards chain** (Points → Hearts → Stars → Gifts), and **four built-in educational mini-games** — all in one place.

Leo the Lion 🦁 is your mascot, cheering kids on every step of the way.

> 💡 **Supabase Backend Synced.** Includes secure authentication, live data syncing across devices with Supabase, and offline PWA support!

---

## ✨ Features

### 🗂 Class Tracker
- Add / edit / delete classes with name, child, date, time, duration, location, category, recurring frequency, instructor, and notes
- **6 categories** with custom SVG illustrated icons: ⚽ Sport · 🎵 Music · 🎨 Art · 📚 Academic · 💃 Dance · ⭐ Other
- **Recurring classes** — one-time, weekly, biweekly, monthly; auto-generates 12 future sessions
- **Mark attended / missed** with one tap — triggers mood check-in and confetti celebration
- **Reschedule** — new date/time with optional reason; tagged with 🔄 Rescheduled badge
- **Cancel** (keeps record) vs **Delete** (removes permanently), both with confirmation dialogs
- **Live countdown chip** on today's cards — turns red when < 30 minutes away
- **Pre-class reactions** — kids tap "Can't wait! 🙌" or "Not feeling it 😴"
- **Filter & search** by child, category, date range, or status

### 🗓 Calendar
- Full **monthly grid** with colour-coded category dots per day
- **Desktop**: right-side panel slides in when a day is selected
- **Mobile**: bottom sheet animates up
- Navigate months, add a class directly from any selected day

### 📊 Dashboard
- **Hero banner** with time-aware greeting, next class details, and Leo the mascot
- **4-stat chips** — Total · Done · Upcoming · Missed
- **3-column desktop grid** — Today's classes + Chore Widget | Weekly ring + Challenge | Child XP + Leaderboard
- **Week strip** — 7-day horizontal scroll with category dots and completion ratios
- **Recent Activity feed** — last 5 attendance events and badge unlocks

### ⚔️ Quest Board (Chore Tracker)
- Day/night themed header — rolling clouds & sun by day, twinkling stars & moon after 7 pm
- **Golden Quests** (positive chores) and **Watch Out!** cards (behaviour records) in a card grid
- Each quest card has: animated category icon, rarity system (Silver / Gold / Legendary), streak flame 🔥, lifetime completion mini-bar
- **Card flip** — tap to reveal full details and the "Complete Quest!" button
- **Idle float animation** — cards gently bob while waiting to be tapped
- **+/− floating point indicator** animates upward on every completion
- **Done Today** section — completed quests move to a greyed row at the bottom
- **Game token counter** — every 5 quests completed = 1 🎮 token for the Games section
- **Recurring chores** — daily, weekdays only, weekly, or one-time with auto-reset
- **Kid Mode** — Giant, single-tap buttons, enormous category emojis, and simplified big-pill layout tailored for young children aged 4-12. Toggleable in settings!
- **Interactive Celebrations** — Web Audio API integrated sounds (chimes, bell rings) based on chore category plus CSS confetti explosions upon completion.
- **My Quests vs Family Tabs** — View quests assigned to the active child or a multi-column side-by-side view of all children (desktop only).
- **Parent Mode Overlay** — PIN-protected lock overlay hiding all edit/delete buttons from kids and leaving only the satisfying completion button!

### 🏆 Reward Chain
```
Chore Done → Points → ❤️ Hearts → ⭐ Stars → 🎁 Gift Milestone
```

| Milestone | Trigger | Celebration |
|-----------|---------|-------------|
| ❤️ Heart | Every 25 pts | Full-screen rising hearts + pink confetti + Leo |
| ⭐ Star | Every 5 hearts | SVG starburst ring + golden confetti + mascot dance |
| 🎁 Gift | Every 5 stars | Undismissable popup — balloon float, gift lid-pop, parent PIN + gift note |

| 🎁 Gift | Every 5 stars | Undismissable popup — balloon float, gift lid-pop, parent PIN + gift note |

- Hearts and stars are **permanent** — negative chores never take them away
- Gift popup has a **"Remind me later"** snooze (re-appears after 1 hour)
- All thresholds are **customisable** in Settings

### 🛍️ Virtual Reward Shop
Parents can configure real-world rewards (e.g. "Pizza Night", "$5 Robux", "1hr iPad time") priced in tokens, hearts, or points. Kids can browse their allowance shop and "purchase" these rewards securely, which immediately alerts parents via the dashboard.

### 🎮 Mini-Games
Kids spend 🎮 game tokens (earned from quests) to unlock games:

| Game | Description | XP Reward |
|------|-------------|-----------|
| ⚔️ **Math Quest** | Defeat number monsters. Age-adaptive ops. Hero costumes unlock every 5 correct. | +5 XP per answer |
| 🔤 **Word Builder** | Tap falling letters to spell target words. Words saved to Word Collection. | +5 XP per word |
| 🃏 **Memory Match** | Match chore icons to names. Age-adaptive grid. Hint costs 1 token. | +10 XP per game |
| ♻️ **Sorting Safari** | Sort falling items into the right bins in 60 seconds. 1–3 star rating. | +2 XP per sort |

### 👦 Multi-Child Support
- Add unlimited children with name, age, emoji avatar, colour theme, and favourite emoji
- Each child has their own XP bar, badge trophy shelf, and reward history
- **Sidebar child switcher** on desktop; **pill filters** in mobile header
- **Sibling leaderboard** for friendly XP competition

### 🌍 Ambient World
- **Day mode**: clouds drift across the sky, animated sun rotates in the corner
- **Night mode** (after 7 pm): deep blue sky, twinkling stars, glowing moon
- **Tappable collectibles** — tap a ⭐ 🪙 ❤️ before it disappears for +1 bonus point
- **Decorative animals** walk / fly across the screen periodically (🦋 🐦 🐇 🐝 🦎)
- Toggle the ambient world on/off in Settings

### 👤 Child Profile
- Hero banner with avatar, level, XP bar, points / hearts / stars
- Progress bar to next ❤️, hearts-toward-⭐ grid, stars-toward-🎁 grid
- **30-day SVG points chart** — green earned / red deducted bars
- **Gift Reward History** — every milestone with date and parent's gift note
- **Badge Trophy Shelf** — 8 unlockable achievement badges
- **Class Passport Stamps** — one stamp per category attended
- **Mood Check-In log** — last 10 moods with average score

### ⚙️ Settings
- Light / Dark Mode toggle
- Sound on/off (Web Audio API — all sounds synthesized, no audio files)
- Separate sound toggles: celebrations · correct answers · wrong answers · ambient
- Adjustable reward thresholds (pts/heart, hearts/star, stars/gift)
- Parent PIN setup — set, change, or clear
- Family weekly chore report
- Export all data as JSON backup
- Reset all data with confirmation

### 📱 Responsive Layout

| Breakpoint | Layout |
|---|---|
| **≥ 1024px** Desktop | Fixed 240px sidebar · TopBar with global search + notification bell · 3-column dashboard |
| **768–1023px** Tablet | Collapsed 64px icon-only sidebar |
| **< 768px** Mobile | No sidebar · sticky mobile header · bottom tab bar (5 tabs) · bottom-sheet modals |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm** 9+

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/PriyankaSDaida/kids-class-chore-tracker.git
cd kids-class-chore-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** — the onboarding wizard will walk you through adding your first child and class.

### Build for Production

```bash
npm run build        # outputs to /dist
npm run preview      # preview the production build locally
```

### Deploy to Vercel

Connect your GitHub repo to Vercel — it auto-detects Vite and deploys on every push to `main`. Your app will be live at `your-project.vercel.app` within 60 seconds.

> **Note**: make sure `tsconfig.app.json` has `"noUnusedLocals": false` and `"noUnusedParameters": false` to prevent TypeScript warnings from blocking the Vercel build.

---

## 🏗 Architecture

The app is organised into four clear layers flowing top-down. The UI dispatches to a single Zustand store, which is persisted to `localStorage` via Zustand's persist middleware.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                            │
│          React 19 · Vite 5 · Vanilla CSS + 80+ CSS @keyframes        │
│                                                                      │
│  AppShell → Sidebar (desktop) │ TopBar │ MobileHeader │ BottomNav    │
│                                                                      │
│  Dashboard     CalendarView    ClassList     QuestBoard              │
│  GamesSection  ChildProfile    CostSummary   Settings                │
│  Onboarding    AmbientWorld                                          │
│                                                                      │
│  Global overlays: HeartCelebration · StarCelebration                 │
│                   GiftMilestoneModal · BadgeCelebration              │
│                   ConfettiEffect                                     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │  hooks / setState
┌────────────────────────────▼─────────────────────────────────────────┐
│                     STATE MANAGEMENT LAYER                           │
│              Single Zustand store + persist middleware (v5)          │
│                                                                      │
│  Data:   children · classes · attendanceRecords                      │
│          chores · choreCompletions · rewardMilestones                │
│          notifications · choreSettings · filter                      │
│                                                                      │
│  UI:     activeScreen · activeChildFilter · theme · soundEnabled     │
│                                                                      │
│  Triggers: newHeartChildId · newStarChildId                          │
│            pendingGiftChildId · newlyEarnedBadge                     │
│                                                                      │
│  Custom hooks:                                                       │
│  useAttendance · useCountdown · useFilter · useMediaQuery            │
│  useNotifications · useRecurring · useSound                          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │  JSON serialise / deserialise
┌────────────────────────────▼─────────────────────────────────────────┐
│                       PERSISTENCE LAYER                              │
│              Supabase Cloud Sync + Local Fallback                    │
│                                                                      │
│  Zustand persist local caching ("kids-class-tracker-store")          │
│  Real-time write-through caching to Supabase remote DB               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    CROSS-CUTTING UTILITIES                           │
│                                                                      │
│  dateUtils.ts    format, recurring dates, todayStr, countdowns       │
│  colorUtils.ts   category colours, child palettes, hex→rgba          │
│  Points engine   hearts/stars/gift chain inside completeChore()      │
│  Badge engine    checkNewBadges() called on every markAttended()     │
│  Sound engine    Web Audio API — all tones synthesized, no files     │
│  Animations CSS  80+ @keyframes, prefers-reduced-motion safe         │
└──────────────────────────────────────────────────────────────────────┘
```

### Rewards flow

```
completeChore(choreId, childId, date)
        │
        ▼
  child.points += chore.points   ← can go negative; never affects hearts/stars
        │
        └─► while points >= pointsPerHeart (default 25):
                points  -= 25
                hearts++   lifetimeHearts++
                trigger → HeartCelebration overlay
                │
                └─► if hearts >= heartsPerStar (default 5):
                        hearts -= 5
                        stars++   lifetimeStars++
                        trigger → StarCelebration overlay
                        │
                        └─► if stars >= starsPerGift (default 5):
                                stars -= 5
                                trigger → GiftMilestoneModal (undismissable)
                                          parent PIN → gift note → claimGift()
```

### Component tree

```
App
├── ToastProvider
└── AppShell
    ├── AmbientWorld              (z-index 0, behind everything)
    ├── Sidebar                   (desktop / tablet)
    ├── main-area
    │   ├── MobileHeader          (mobile only)
    │   ├── TopBar                (desktop / tablet)
    │   ├── screen-content
    │   │   ├── Dashboard
    │   │   │   ├── HeroBanner
    │   │   │   ├── StatsBar
    │   │   │   ├── ChoreWidget
    │   │   │   ├── WeeklyRing + WeeklyChallenge
    │   │   │   ├── Leaderboard
    │   │   │   ├── WeekStrip
    │   │   │   └── RecentActivity
    │   │   ├── CalendarView
    │   │   ├── ClassList → ClassCard → ClassForm / RescheduleModal
    │   │   ├── QuestBoard → QuestCard → ChoreForm
    │   │   ├── GamesSection
    │   │   │   ├── GamesHub
    │   │   │   ├── MathQuest
    │   │   │   ├── WordBuilder
    │   │   │   ├── MemoryMatch
    │   │   │   └── SortingSafari
    │   │   ├── ChildrenList
    │   │   ├── ChildProfile → BadgeGrid, PointsChart
    │   │   ├── CostSummary
    │   │   └── Settings → PinPad
    │   └── BottomNav             (mobile only)
    ├── BadgeCelebration          (z-index 10000)
    └── ChoreEffects
        ├── HeartCelebration
        ├── StarCelebration
        └── GiftMilestoneModal    (z-index 600, undismissable)
```

---

## 🗂️ Project Structure

```
kids-class-chore-tracker/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── calendar/       CalendarView
│   │   ├── children/       ChildrenList
│   │   ├── chores/         QuestBoard, QuestCard, ChoreForm, ChoreWidget
│   │   │                   ChoreEffects, HeartCelebration, StarCelebration
│   │   │                   GiftMilestoneModal, FloatingPoint, PinPad, PointsChart
│   │   ├── classes/        ClassList, ClassForm, RescheduleModal, AttendanceLog
│   │   ├── costs/          CostSummary
│   │   ├── dashboard/      Dashboard, HeroBanner, StatsBar, WeekStrip, WeeklyRing
│   │   │                   ClassCard, RecentActivity, MoodCheckIn
│   │   ├── games/          GamesSection, GamesHub, MathQuest, WordBuilder
│   │   │                   MemoryMatch, SortingSafari
│   │   ├── gamification/   XPBar, BadgeGrid, BadgeCelebration, WeeklyChallenge
│   │   │                   Leaderboard, StreakFlame, ConfettiEffect
│   │   ├── layout/         AppShell, Sidebar, TopBar, MobileHeader, BottomNav
│   │   ├── onboarding/     Onboarding (3-step wizard)
│   │   ├── profile/        ChildProfile
│   │   ├── settings/       Settings
│   │   └── ui/             Avatar, Badge, CategoryIllustration, ConfirmDialog
│   │                       EmptyState, Mascot, Modal, Toast, AmbientWorld
│   ├── hooks/
│   │   ├── useAttendance.ts     streak + attendance % calculations
│   │   ├── useCountdown.ts      live countdown to next class
│   │   ├── useFilter.ts         class filter / search logic
│   │   ├── useMediaQuery.ts     responsive breakpoint hooks
│   │   ├── useNotifications.ts  browser notification scheduling
│   │   ├── useRecurring.ts      recurring class instance generator
│   │   └── useSound.ts          Web Audio API sound engine
│   ├── store/
│   │   ├── types.ts             all TypeScript types, badge defs, word lists
│   │   └── useAppStore.ts       single Zustand store + persist middleware
│   ├── styles/
│   │   ├── index.css            CSS variables, tokens, layout, dark mode
│   │   ├── components.css       all component styles
│   │   └── animations.css       80+ @keyframe animations
│   └── utils/
│       ├── colorUtils.ts
│       └── dateUtils.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json    ← set noUnusedLocals/Params: false for Vercel
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | React 19 | Concurrent features |
| **Language** | TypeScript 6 | `strict: false` for Vercel build compat |
| **Build tool** | Vite 5 | Sub-second HMR |
| **State** | Zustand 5 + persist | Supabase Auth + Postgres realtime syncing |
| **Styling** | Vanilla CSS | CSS variables, no Tailwind, `data-theme` dark mode |
| **Icons** | Lucide React 1.8 | Tree-shakeable SVG icons |
| **Dates** | date-fns 4 | Lightweight, tree-shakeable |
| **Sound** | Web Audio API | All synthesized — zero audio files |
| **Charts** | Pure SVG | Hand-drawn 30-day bar chart |
| **PDF/image export** | jsPDF + html2canvas | Client-side only |
| **Animations** | CSS @keyframes | 80+ keyframes, reduced-motion safe |

---

## 🔐 Parent Controls

All controls in **Settings → Chore Controls**:

- **Kids self-mark toggle** — off = PIN required for every chore completion
- **Parent PIN** — 4-digit PIN for completions, gift claiming, and settings changes
- **Celebration animations** — toggle heart / star / gift overlays
- **Ambient world** — toggle background clouds, stars, animals, collectibles
- **Sound toggles** — separate controls for celebrations, correct answers, wrong answers
- **Reward thresholds** — customise pts/heart, hearts/star, stars/gift
- **Family weekly report** — inline points summary per child
- **Export** — full JSON backup download
- **Reset all** — wipe everything with a confirmation step

---

## 🌙 Themes

| Theme | How | Description |
|-------|-----|-------------|
| ☀️ Light | Default / toggle | Bright violet accent, pastel backgrounds |
| 🌙 Dark | Settings toggle | Deep purple darks, same vivid accents |
| ⭐ Night | Auto after 7 pm | Quest Board + AmbientWorld shift to starry sky |

---

## 🗺️ Roadmap

- [x] Cloud sync and multi-device support
- [x] PWA with push notifications
- [x] Virtual Allowance Shop
- [x] Kid Mode simplifies Quest Board
- [ ] Separate parent and child login modes
- [ ] More mini-games (spelling, science trivia)
- [ ] Printable weekly schedule PDF
- [ ] Teacher / instructor messaging
- [ ] Apple Watch companion

---

## 🤝 Contributing

Pull requests are welcome! For major changes please open an issue first.

```bash
npm install
npm run dev
npm run build   # verify build passes before opening a PR
```

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ for kids and the parents who cheer them on

**🦁 Leo says: "Keep going — you've got this!"**

</div>
