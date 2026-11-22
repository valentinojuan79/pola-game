# POLA — Project Rules & Architecture Blueprint

## 1. Core Identity & Tech Stack
- **App Name:** Pola (Daily & Unlimited Logic Puzzle Web App)
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Animation & Icons:** Framer Motion (mandatory for iOS spring physics), Lucide React
- **Backend & DB:** Supabase (PostgreSQL + Auth)
- **Target Platform:** Mobile-First / iOS PWA (Add to Home Screen). On desktop, center the app in a sleek mobile container (`max-w-[430px] mx-auto min-h-[100dvh]`) with subtle ambient background.

## 2. Design System: Modern iOS Liquid Glass (STRICT ANTI-AI-SLOP)
- **NO AI SLOP:** Strictly avoid generic purple/indigo SaaS gradients, excessive drop shadows, neon glow, or cluttered cards.
- **Liquid Glass Aesthetic:**
  - Use layered translucent surfaces: `backdrop-blur-2xl` with subtle tint (`bg-white/70` in Light Mode, `bg-neutral-900/65` in Dark Mode).
  - Crisp specular hairline borders (`border border-white/40 dark:border-white/10`) and subtle inner top highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]`).
  - Floating glass bottom navigation bar (pill-shaped, detached from bottom edge with safe-area padding).
- **Typography:** Clean geometric sans-serif (`Inter` / `-apple-system, BlinkMacSystemFont`). Tabular numbers (`tabular-nums`) for all timers and scores.
- **Theme & Language:**
  - Full **Light & Dark Mode** toggle (persisted in `localStorage`).
  - **English (default)** and **Indonesian** language switcher (`EN` / `ID`) using a clean dictionary-based i18n context.

## 3. iOS PWA & Tactile UX Rules
- Always use `100dvh` (never `100vh`), `viewport-fit=cover`, and `env(safe-area-inset-top/bottom)`.
- All game boards MUST have `touch-action: none`, `overscroll-behavior: none`, and `select-none`.
- **Tactile Feedback Utility (`src/lib/feedback.ts`):**
  - Combine `navigator.vibrate()` (for Android) with subtle procedural Web Audio API sounds (soft *pop*, *click*, *chime* — no external MP3s, toggleable mute).
- **Win Popup (Bubble Pop Modal):**
  - Every completed game triggers a satisfying spring-animated "bubble pop" glass modal displaying: completion time, hints used, current streak, daily leaderboard rank (or subtle CTA to register username for leaderboard), Share Result (emoji grid copy), and "Next Game" button.

## 4. Auth & Data Strategy (Zero-Friction Guest + Username Leaderboard)
- **Guest-First:** Users can play Daily & Unlimited immediately without logging in. Progress, streaks, and settings save to `localStorage`.
- **Optional Auth (Username + Password ONLY, NO Email):**
  - Purpose: Global/Daily Leaderboard & cross-device streak sync.
  - Supabase Implementation: Internally map `username` to `${username.toLowerCase()}@pola.local` for Supabase Auth (email confirmation disabled), and store display `username` in a `profiles` table with a unique constraint. Never show or ask for an email in the UI.

## 5. Architecture & Code Separation
- **Strict Separation:** Keep ALL pure game logic (board state, validators, hint engines, win checkers) inside `src/lib/games/[game-name]/`. Keep React UI components inside `src/components/games/[game-name]/`.
- **Modes & Weekly Difficulty Curve (All 5 Games):**
  - **Daily Challenge:** 1 puzzle/day per game. Difficulty scales from Monday (Easiest) → Sunday (Hardest).
  - **Unlimited Play:** Selectable difficulty (Easy, Medium, Hard, Expert), does not affect daily streak.

## 6. Game Specifications Summary
1. **Queens:** 6x6 (Mon-Tue) → 9x9 (Sun). Tap cycle (Empty → X → Crown) + Drag for bulk X. Hint reveals 1 random correct Crown in an unsolved region with **+10s time penalty** (animated red `+10s` near timer).
2. **Zip:** 6x6 (Mon-Tue) → 8x8 (Fri-Sun), includes thick wall barriers between cells. Drag/swipe continuous path 1→K visiting all cells. Bubble-pop spring animation + vibrate/pop sound when hitting each sequential number. Hint adds 1 correct path segment with a **cooldown timer**.
3. **Tango:** Always 6x6 (difficulty scales via clue density). 2 UI Modes toggleable: (1) Blue Moon & Warm Sun icons, (2) Minimalist Blue & Yellow/Orange solid circles. Delayed error highlight (~600ms) for smooth double-tapping. Smart Hint explains *why* (including "3-empty-gap" deduction rules).
4. **Mini Sudoku:** Always 6x6 (2x3 blocks). Number pad + Pencil notes + Smart highlight. When a row, column, or 2x3 block is completely and correctly filled, trigger a **staggered green wave animation + vibrate/chime**. Smart Hint with logical explanation.
5. **Patches:** 6x6 (Mon) → 8x8 (Sun). Drag from clue cell to draw non-overlapping rectangles. 4 visual clue types: dashed overlapping shape (any rectangle matching area), solid square, solid horizontal rectangle, solid vertical rectangle (later days omit numbers on solid shapes). Tactile snap + vibrate/pop on valid patch.