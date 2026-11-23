# Pola

**Pola** is a mobile-first, iOS PWA daily and unlimited logic puzzle web app crafted with tactile interactions and a calm iOS Liquid Glass aesthetic.

**Live Demo:** [playpola.vercel.app](https://playpola.vercel.app)

---

## Games

Pola includes **6 logic puzzle games**, each with deterministic Daily challenges and Unlimited replayable presets:

- **Queens** (`6×6` to `9×9`) — Place one crown in every row, column, and colored region so no two crowns touch orthogonally or diagonally. Supports tap-to-cycle (`Empty → X → Crown`) and drag-to-mark `X`.
- **Zip** (`6×6` to `8×8`) — Draw a single continuous path through numbered waypoints (`1 → K`) that visits every cell on the board while navigating around wall barriers.
- **Tango** (`6×6`) — Fill the grid with Suns and Moons (or minimalist Circles) with 3 of each per row and column, no three identical symbols adjacent, and all `=` / `×` edge constraints satisfied.
- **Mini Sudoku** (`6×6`) — Fill each row, column, and `2×3` box with digits `1–6`. Includes a tactile number pad, pencil notes, smart highlighting, and green-wave unit completion animations.
- **Patches** (`6×6` to `8×8`) — Drag from any cell to partition the grid into rectangular regions enclosing one clue each, matching required area and shape (`any`, `square`, `horizontal`, or `vertical`).
- **Fold** (`4×4` to `6×6`, *Pola Original*) — Swipe across grid creases to fold a translucent glass sheet so every solid dot aligns inside a matching hollow target ring within the fold limit.

---

## Key Features

- **Monday-to-Sunday Difficulty Curve** — Daily puzzles automatically scale from Easy on Monday up to Expert on Sunday across all six games.
- **Daily & Unlimited Modes** — Solve one curated Daily puzzle per game (with frozen read-only board review and emoji result sharing) or play Unlimited puzzles in Easy, Medium, Hard, and Expert without affecting daily streaks.
- **Smart Hint System** — Context-aware hints with game-specific balancing: `+10s` time penalties in Queens and Patches, `15s` cooldown in Zip, and deductive/step hints with a `10s` cooldown in Tango, Mini Sudoku, and Fold.
- **Guest-First Play & Username Leaderboards** — Play immediately with local progress and streak persistence (`localStorage`). Optionally claim a username + password account (no email required) to sync streaks and compete on daily Supabase leaderboards.
- **Bilingual (`EN` / `ID`)** — Instant English and Indonesian language toggle in the top header.
- **Light & Dark iOS Liquid Glass UI** — Layered translucent surfaces over soft ambient orbs, spring-physics animations, and toggleable Web Audio + haptic feedback.
- **iOS PWA Ready** — Configured with `manifest.json`, `viewport-fit=cover`, `100dvh`, and safe-area inset spacing for standalone **Add to Home Screen** play, plus a centered mobile viewport shell on desktop.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Styling & Typography:** Tailwind CSS v4 (`@tailwindcss/postcss`), Google Fonts (`Outfit` & `Plus Jakarta Sans`)
- **Animation & Icons:** Framer Motion 12, Lucide React
- **Backend & Auth:** Supabase (`@supabase/supabase-js`, PostgreSQL with Row Level Security & Auth)
- **Deployment:** Vercel

---

## Project Structure

```text
pola-game/
├── public/
│   ├── icons/icon.svg          # App & PWA icon
│   └── manifest.json           # Web App Manifest for iOS/mobile PWA
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 theme, Liquid Glass primitives, safe-area helpers
│   │   ├── layout.tsx          # Root layout, PWA metadata, Google Fonts, ambient orbs
│   │   └── page.tsx            # Main shell, tab router, and active game orchestrator
│   ├── components/
│   │   ├── games/
│   │   │   ├── fold/           # Fold board & game screen
│   │   │   ├── mini-sudoku/    # Mini Sudoku board & game screen
│   │   │   ├── patches/        # Patches board & game screen
│   │   │   ├── queens/         # Queens board, game screen, and shared WinModal
│   │   │   ├── shared/         # DailyReviewBar and TutorialModalFooter
│   │   │   ├── tango/          # Tango board & game screen
│   │   │   └── zip/            # Zip board & game screen
│   │   ├── shell/              # HeaderBar, BottomNav, AuthModal
│   │   └── tabs/               # TodayHub, UnlimitedHub, LeaderboardHub
│   └── lib/
│       ├── games/              # Pure game engines, types, presets, solvers, and hint logic
│       ├── feedback.ts         # Procedural Web Audio sounds & haptic vibration
│       ├── i18n.ts             # English & Indonesian translations
│       ├── storage.ts          # Local stats, streaks, daily snapshots, preferences
│       ├── supabase.ts         # Supabase client, username auth, and leaderboard queries
│       └── theme.tsx           # Light/Dark theme provider
└── supabase/
    └── schema.sql              # Idempotent PostgreSQL schema, triggers, and RLS policies
```

---

## Getting Started

### Prerequisites

- Node.js 20+ and `npm`
- *(Optional)* A [Supabase](https://supabase.com) project for username accounts and daily leaderboards

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd pola-game
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> You can leave these unset to run Pola locally in **Guest / local-only mode** without errors.

### 3. Set up Supabase (optional, for leaderboards & auth)

1. Open your Supabase project's **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This creates the `profiles` and `daily_completions` tables, auto-profile signup trigger, indexes, and RLS policies for all 6 games.
2. In **Authentication → Providers → Email**, disable **Confirm email** so players can sign up immediately with just a username and password (mapped internally to `<username>@pola.local`).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js ESLint checks |
