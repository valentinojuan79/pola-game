# Pola.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://playpola.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://playpola.vercel.app)

**Live Demo:** **[playpola.vercel.app](https://playpola.vercel.app)**

**Pola** is a mobile-first, installable Progressive Web App with a dedicated responsive desktop layout, offering **6 daily bite-sized logic puzzles** built with deterministic procedural generation, tactile Pointer-Event controls, and a Liquid Glass aesthetic.

> *Disclaimer: Pola is an independent, non-commercial portfolio project inspired by LinkedIn Games and is not affiliated with LinkedIn.*

---

## The 6 Logic Games

| Game | Grid Size | Core Rules & Mechanics |
| --- | --- | --- |
| **Queens** | `6×6` – `9×9` | Place exactly one crown in every row, column, and colored region so no two crowns touch orthogonally or diagonally. Supports tap-to-cycle (`Empty → X → Crown`), swipe-to-mark `X`, and optional Auto-X. |
| **Tango** | `6×6` | Balance Suns & Moons (or Orange & Blue circles) with 3 of each per row/column, never 3 identical symbols adjacent, while satisfying all `=` and `×` edge constraints. |
| **Zip** | `6×6` – `8×8` | Draw one continuous Hamiltonian path visiting every cell on the board, hitting numbered waypoints (`1 → K`) in order while navigating around wall barriers. |
| **Mini Sudoku** | `6×6` | Fill every row, column, and `2×3` block with digits `1–6`. Features a thumb-ergonomic vertical `1–6` keypad, pencil notes, conflict highlighting, and unit-completion waves. |
| **Patches** | `6×6` – `8×8` | Drag from clue cells to partition the entire board into non-overlapping rectangles enclosing one clue each, matching required area and shape constraints (`any`, `square`, `wide`, `tall`). |
| **Fold** *(Pola Original)* | `4×4` – `5×5` | Swipe across grid creases to fold a translucent glass sheet within the fold limit so every glossy dot aligns inside a matching hollow target ring. |

---

## Key Features

- **Deterministic Daily Lineups & Unlimited Mode**
  Date-seeded procedural RNG (`YYYY-MM-DD`) ensures every player worldwide gets the exact same 6 puzzles each day (scaling from Easy on Monday to Expert on Sunday). Unlimited mode lets players practice freely across selectable difficulty tiers (`Easy`, `Medium`, `Hard`, `Expert`) with an inline difficulty switcher and replay-focused Win Modal.
- **100% Purely Logical Board Generation**
  Human-deduction-verified clue removal across all difficulties (including **Tango Expert**) guarantees every board is uniquely solvable strictly through deterministic logic—never requiring backtracking or trial-and-error guessing—paired with randomized board symmetries on every Unlimited generation.
- **Spoiler-Free Visual Share Cards**
  Custom HTML5 Canvas 2D renderer (`shareCardRenderer.ts`) exports high-resolution, spoiler-free PNG scorecards for both single puzzles and 6-game Daily Recaps in **Compact (`1080×1350`)** and **9:16 Story (`1080×1920`)** formats via the native Web Share sheet or instant PNG download.
- **Global Ranks, Streaks & Fair-Play Guardrails**
  Frictionless username + password accounts backed by Supabase Auth and PostgreSQL. Tracks live daily solve-time leaderboards (Overall 6-game + per-game tabs), streaks, one-time guest-to-account migration, Supabase hydration on sign-in, clean local progress reset on Sign Out, per-device daily rank claim protection (with a `?dev=1` developer bypass), and minimum plausible solve-time validation (`≥ 4s`).
- **Cross-Device Mobile PWA & Native Desktop Layout**
  - **Mobile & Tablet (`< 1024px`):** Installable PWA with unified 4-color PNG app icons (`next/og`), dynamic viewport (`dvh`) & safe-area support, compact `360px` responsiveness, thumb-ergonomic Mini Sudoku controls, and unified Pointer Events for smooth touch-drag gameplay.
  - **Desktop (`>= 1024px`):** Mathematically centered 3-column top navigation bar, 3×2 game hub grid, live Daily Progress & Share summary card, Today's Top 3 Ranks snapshot, Quick Practice random launcher, live `00:00 UTC` daily reset countdown footer, centered puzzle stage (`max-w-[460px]`), and keyboard shortcuts (`1–6`, `Backspace`/`Delete`, `Z` for Undo).
- **Bilingual & Theme Support**
  Instant **English (`EN`)** and **Indonesian (`ID`)** localization, Light & Dark Liquid Glass themes, and synthesized Web Audio + haptic feedback.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Styling & Motion:** Tailwind CSS v4 (`@tailwindcss/postcss`), Framer Motion 12, Lucide React
- **Visual Exports & Icons:** HTML5 Canvas 2D API, `next/og` (`ImageResponse`)
- **Backend & Auth:** Supabase Auth & PostgreSQL (`@supabase/supabase-js`, Row Level Security & DB triggers)
- **Deployment:** Vercel

### Development Workflow

Every aspect of Pola's game design, UI/UX ergonomics, and product rules was human-directed and tested across real devices, leveraging **Google Antigravity** (powered by **Gemini 4 Neon**) as an AI pair-programming workflow to accelerate implementation and iteration.

---

## Project Structure

```text
pola-game/
├── public/
│   └── manifest.json                  # Web App Manifest (standalone portrait PWA)
├── src/
│   ├── app/
│   │   ├── favicon.ico/route.ts       # Static 200 OK /favicon.ico 4-color brand icon
│   │   ├── icons/[icon]/route.tsx     # Dynamic 4-color PNG PWA icons (192/512 + maskable)
│   │   ├── apple-icon.tsx             # Apple Touch icon
│   │   ├── icon.tsx                   # App favicon route
│   │   ├── opengraph-image.tsx        # Dynamic Open Graph social preview
│   │   ├── globals.css                # Tailwind v4 theme, Liquid Glass primitives, safe areas
│   │   ├── layout.tsx                 # Root layout, PWA metadata, fonts & providers
│   │   └── page.tsx                   # Main shell, tab router, auth/sync & game orchestrator
│   ├── components/
│   │   ├── VisualShareModal.tsx       # Compact & Story PNG scorecard preview + Web Share
│   │   ├── games/
│   │   │   ├── fold/                  # FoldBoard & FoldGame
│   │   │   ├── mini-sudoku/           # MiniSudokuBoard & MiniSudokuGame
│   │   │   ├── patches/               # PatchesBoard & PatchesGame
│   │   │   ├── queens/                # QueensBoard, QueensGame & shared WinModal
│   │   │   ├── shared/                # DailyReviewBar & TutorialModalFooter
│   │   │   ├── tango/                 # TangoBoard & TangoGame
│   │   │   └── zip/                   # ZipBoard & ZipGame
│   │   ├── shell/                     # HeaderBar, BottomNav, DesktopFooter, AuthModal, InstallPwaModal
│   │   └── tabs/                      # TodayHub, UnlimitedHub, LeaderboardHub
│   └── lib/
│       ├── games/                     # Pure engines, generators (Queens & Tango), solvers, presets & hints
│       ├── brandIcon.tsx              # Shared 4-color Pola brand icon renderer
│       ├── feedback.ts                # Synthesized Web Audio & haptic vibration
│       ├── i18n.ts                    # English & Indonesian localization dictionary
│       ├── shareCardRenderer.ts       # HTML5 Canvas 2D spoiler-free PNG renderer
│       ├── storage.ts                 # Local progress, streaks, guest migration & device rank lock
│       ├── supabase.ts                # Supabase client, username auth, hydration & leaderboards
│       ├── theme.tsx                  # Light/Dark theme provider
│       └── usePwaInstall.ts           # Cross-platform PWA install prompt hook
└── supabase/
    └── schema.sql                     # Idempotent PostgreSQL schema, triggers & RLS policies
```

---

## Local Setup

### Prerequisites

- Node.js 20+ and `npm`
- *(Optional)* A [Supabase](https://supabase.com) project for username accounts and global daily leaderboards

### 1. Clone & Install

```bash
git clone https://github.com/valentinojuan79/pola-game.git
cd pola-game
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Leave these unset to run Pola locally in **Guest / local-only mode** with zero setup.

### 3. Supabase Schema Setup *(Optional)*

1. Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase **SQL Editor** to create `public.profiles`, `public.daily_completions`, indexes, the `handle_new_user` trigger, and Row Level Security policies.
2. In **Authentication → Providers → Email**, disable **Confirm email** so players can sign up with just a username and password (mapped internally to `<username>@pola.local`).
3. Append `?dev=1` to the URL once during local testing to enable `pola_dev_bypass` and test multiple accounts on the same browser.

### 4. Start the Development Server

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
