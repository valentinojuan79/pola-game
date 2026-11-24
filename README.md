# Pola.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://playpola.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://playpola.vercel.app)

**Live Demo:** **[playpola.vercel.app](https://playpola.vercel.app)**

**Pola** is a mobile-first, installable Progressive Web App offering **6 daily bite-sized logic puzzles**, crafted with tactile Pointer-Event controls, deterministic procedural generation, and an iOS Liquid Glass aesthetic.

> *Disclaimer: Pola is an independent, non-commercial portfolio project inspired by LinkedIn Games and is not affiliated with LinkedIn.*

---

## The 6 Logic Games

| Game | Grid Size | Core Mechanics |
| --- | --- | --- |
| **Queens** | `6×6` – `9×9` | Place exactly one crown in every row, column, and colored region so no two crowns touch orthogonally or diagonally. Supports tap-to-cycle (`Empty → X → Crown`), swipe-to-mark `X`, and optional Auto-X. |
| **Tango** | `6×6` | Balance Suns & Moons (or minimalist Orange & Blue circles) with 3 of each per row/column, never 3 identical in a row, while satisfying all `=` and `×` edge constraints. |
| **Zip** | `6×6` – `8×8` | Draw one unbroken Hamiltonian path visiting every cell on the board, hitting numbered waypoints (`1 → K`) in order while navigating around wall barriers. |
| **Mini Sudoku** | `6×6` | Fill every row, column, and `2×3` block with digits `1–6`. Features a thumb-ergonomic `1–6` vertical keypad, pencil notes, conflict highlighting, and unit completion waves. |
| **Patches** | `6×6` – `8×8` | Drag from clue cells to partition the entire board into non-overlapping rectangles enclosing one clue each, matching its area and shape constraint (`any`, `square`, `wide`, `tall`). |
| **Fold** *(Pola Original)* | `4×4` – `5×5` | Swipe across grid creases to fold a translucent glass sheet within the fold limit so every glossy dot aligns inside a matching hollow target ring. |

---

## Key Features

- **Deterministic Daily Lineups & Unlimited Mode**
  Date-seeded procedural RNG ensures every player worldwide gets the exact same 6 puzzles each day (scaling from Easy on Monday to Expert on Sunday). Switch to **Unlimited** mode anytime with selectable difficulty tiers (`Easy`, `Medium`, `Hard`, `Expert`)—including an inline difficulty switcher right inside the Unlimited Win Modal for fast replay flow.
- **100% Purely Logical Board Generation**
  Clue-removal loops (including **Tango Expert**) are verified by a deterministic human-deduction solver—guaranteeing every board is uniquely solvable strictly through logical rules with zero trial-and-error guessing, paired with randomized board symmetries on every Unlimited run.
- **Spoiler-Free Visual Share Cards**
  Custom HTML5 Canvas 2D renderer (`shareCardRenderer.ts`) exports crisp, spoiler-free high-resolution PNG scorecards for both single games and the 6-game Daily Recap in **Compact (`1080×1350`)** and **9:16 Story (`1080×1920`)** formats via the native Web Share sheet or instant PNG download.
- **Global Ranks, Streaks & Fair-Play Guardrails**
  Guest-first play with optional frictionless username + password accounts powered by Supabase Auth and PostgreSQL. Tracks daily solve times, streaks, one-time guest-to-account migration, Supabase hydration on sign-in, clean local progress reset on sign-out, a minimum plausible solve-time check (`≥ 4s`), and a per-device daily rank lock (with a `?dev=1` developer bypass for local testing).
- **Cross-Device PWA Polish**
  Installable on iOS, Android, and desktop with unified 4-color PNG app icons generated via `next/og` (`/icons/icon-192.png`, `/icons/icon-512.png`, maskable variants, and Apple Touch icons), `100dvh` & safe-area inset handling, compact `360px` responsiveness, and unified Pointer Events for smooth touch and mouse drag controls.
- **Bilingual & Theme Support**
  Instant **English (`EN`)** and **Indonesian (`ID`)** localization, Light & Dark Liquid Glass themes, and synthesized Web Audio + haptic feedback.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Styling & Typography:** Tailwind CSS v4 (`@tailwindcss/postcss`), Google Fonts (`Outfit` & `Plus Jakarta Sans`)
- **Motion & Icons:** Framer Motion 12, Lucide React
- **Visual Exports & PWA Icons:** HTML5 Canvas 2D API, `next/og` (`ImageResponse`)
- **Backend & Auth:** Supabase (`@supabase/supabase-js`, PostgreSQL with Row Level Security & Auth triggers)
- **Deployment:** Vercel

---

## Project Structure

```text
pola-game/
├── public/
│   └── manifest.json               # Web App Manifest (standalone portrait PWA)
├── src/
│   ├── app/
│   │   ├── icons/[icon]/route.tsx  # Dynamic 4-color PNG PWA icons (192/512 + maskable)
│   │   ├── apple-icon.tsx          # Apple Touch icon
│   │   ├── icon.tsx                # Favicon
│   │   ├── opengraph-image.tsx     # Social Open Graph preview card
│   │   ├── globals.css             # Tailwind v4 theme, Liquid Glass primitives, safe areas
│   │   ├── layout.tsx              # Root layout, PWA metadata, fonts, theme & i18n providers
│   │   └── page.tsx                # Main shell, tab router, auth/sync & game orchestrator
│   ├── components/
│   │   ├── VisualShareModal.tsx    # Compact & Story PNG scorecard preview + Web Share
│   │   ├── games/
│   │   │   ├── fold/               # Fold board & game screen
│   │   │   ├── mini-sudoku/        # Mini Sudoku board & thumb-ergonomic game screen
│   │   │   ├── patches/            # Patches board & game screen
│   │   │   ├── queens/             # Queens board, game screen & shared WinModal
│   │   │   ├── shared/             # DailyReviewBar & TutorialModalFooter
│   │   │   ├── tango/              # Tango board & game screen
│   │   │   └── zip/                # Zip board & game screen
│   │   ├── shell/                  # HeaderBar, BottomNav, AuthModal, InstallPwaModal
│   │   └── tabs/                   # TodayHub, UnlimitedHub, LeaderboardHub
│   └── lib/
│       ├── games/                  # Pure engines, generators, solvers, presets & smart hints
│       ├── brandIcon.tsx           # Shared 4-color Pola brand icon renderer
│       ├── feedback.ts             # Synthesized Web Audio sounds & haptic feedback
│       ├── i18n.ts                 # English & Indonesian dictionary + provider
│       ├── shareCardRenderer.ts    # Canvas 2D spoiler-free PNG scorecard generator
│       ├── storage.ts              # Local progress, streaks, guest migration & device lock
│       ├── supabase.ts             # Supabase client, username auth, hydration & leaderboards
│       ├── theme.tsx               # Light/Dark theme provider
│       └── usePwaInstall.ts        # Cross-platform PWA install prompt hook
└── supabase/
    └── schema.sql                  # Idempotent PostgreSQL schema, triggers & RLS policies
```

---

## Development Workflow & Local Setup

### Prerequisites

- Node.js 20+ and `npm`
- *(Optional)* A [Supabase](https://supabase.com) project for accounts and global daily leaderboards

### 1. Clone & Install

```bash
git clone <repository-url>
cd pola-game
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Leave these unset to run Pola locally in **Guest / local-only mode** with zero setup.

### 3. Supabase Setup *(Optional)*

1. Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase **SQL Editor** to create `public.profiles`, `public.daily_completions`, indexes, the `handle_new_user` trigger, and Row Level Security policies for all 6 games.
2. In **Authentication → Providers → Email**, disable **Confirm email** so players can register instantly with username + password (internally mapped to `<username>@pola.local`).
3. To test multiple accounts on the same browser without triggering the per-device daily rank lock, open the app once with `?dev=1` (persists `pola_dev_bypass=1` in `localStorage`).

### 4. Run & Build

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Compile, typecheck, lint, and build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint checks |

---

*Pola is an independent, non-commercial portfolio project inspired by LinkedIn Games and is not affiliated with LinkedIn.*
