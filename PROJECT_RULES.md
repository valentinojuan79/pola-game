# POLA — Project Rules & Architecture Blueprint

## 1. Core Identity & Tech Stack
- **App Name:** Pola (`Pola.` wordmark with colorful 4-tile squircle icon)
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Animation & Icons:** Framer Motion (mandatory for iOS spring physics), Lucide React
- **Backend & DB:** Supabase (PostgreSQL + Auth)
- **Target Platform:** Mobile-First / iOS PWA (Add to Home Screen). On desktop, center the app in a sleek mobile container (`max-w-[430px] mx-auto min-h-[100dvh]`) with subtle ambient background.

## 2. Design System: Calm iOS Liquid Glass (STRICT ANTI-AI-SLOP)
- **NO AI SLOP & NO HARSH CONTRAST:** Avoid generic SaaS gradients, excessive drop shadows, neon glow, or stark solid-black buttons/hovers in Light Mode.
- **Calm Tinted Liquid Glass Aesthetic:**
  - Layered translucent surfaces: `backdrop-blur-2xl` with subtle tint (`bg-white/70` in Light Mode, `bg-neutral-900/65` in Dark Mode) over soft pastel ambient orbs.
  - Crisp specular hairline borders (`border border-white/40 dark:border-white/10`) and subtle inner top highlights.
  - Floating glass bottom navigation bar (pill-shaped, detached from bottom edge with safe-area padding).
  - **Per-Game Calm Accent Palettes (Low-Glare Tinted Glass):**
    1. **Queens:** Warm Amber
    2. **Zip:** Ocean Sky Blue
    3. **Tango:** Warm Coral / Sun
    4. **Mini Sudoku:** Fresh Emerald / Mint
    5. **Patches:** Soft Rose / Berry
    6. **Fold:** Soft Lavender / Periwinkle
- **Typography:** Display font **`Outfit`** (`font-display`) for brand wordmark, headings, game titles, and `tabular-nums` timers/scores. Body font **`Plus Jakarta Sans`** for descriptions and UI copy. Zero serif fonts.
- **Theme & Language:**
  - Full **Light & Dark Mode** toggle (persisted in `localStorage`).
  - **English (default)** and **Indonesian** (`EN` / `ID`) with **casual, playful, natural copywriting** (no stiff/textbook wording).

## 3. iOS PWA, Tactile UX & Global Game Flows
- Always use `100dvh`, `viewport-fit=cover`, `<meta name="mobile-web-app-capable" content="yes" />`, and `env(safe-area-inset-top/bottom)`.
- Never read `localStorage` during SSR render (always hydrate client stats inside `useEffect` to prevent Next.js hydration errors).
- All game boards MUST have `aspect-square w-full`, `touch-action: none`, `overscroll-behavior: none`, `select-none`, and zero cell resizing.
- **Game Header:** Symmetric 3-column grid (`< Back`, dead-center Title + Timer, `?` How-to-Play).
- **Tactile Feedback (`src/lib/feedback.ts`):** `navigator.vibrate()` + subtle procedural Web Audio API sounds (*pop*, *click*, *chime* — toggleable mute).
- **First-Time Auto-Tutorial:** Automatically opens How-to-Play on first entry into each game (pausing the timer while open), with a *"Skip tutorials for other games"* option persisted in `localStorage`.
- **Solved Daily Review Mode:** Re-opening a solved Daily game shows the frozen completed board snapshot + final time in read-only mode with quick CTAs (**Play Unlimited**, **Share Result**, **Back to Today**).
- **All-Cleared Today Hub:** Once all **6 Daily games** are solved, show a celebratory glass hero card with total time, streak, midnight countdown, and **Play Unlimited** CTA.
- **Win Popup (Bubble Pop Modal):** Spring-animated glass modal with completion time, hints used, streak, Share Result (emoji copy), and "Next Game" / "Play Unlimited" CTA.

## 4. Auth & Data Strategy (Zero-Friction Guest + Username Leaderboard)
- **Guest-First:** Play Daily & Unlimited immediately without login; progress & streaks save in `localStorage`.
- **Optional Auth (Username + Password ONLY, NO Email):** Map `username` internally to `${username.toLowerCase()}@pola.local` for Supabase Auth and store unique display `username` in `profiles`. Never expose email in the UI.

## 5. Architecture & Code Separation
- **Strict Separation:** Pure game logic inside `src/lib/games/[game-name]/`; React UI components inside `src/components/games/[game-name]/`.
- **Instant Load (0ms):** Use verified pre-built presets (or strictly bounded generators) so no puzzle ever freezes the browser.
- **Modes & Weekly Difficulty Curve (All 6 Games):**
  - **Daily Challenge:** 1 puzzle/day per game, scaling Monday (Easy) → Sunday (Expert).
  - **Unlimited Play:** Selectable Easy, Medium, Hard, Expert (does not affect daily streak).

## 6. Game Specifications Summary (6 Games)
1. **Queens:** 6×6 (Mon–Tue) → 9×9 (Sun). Tap cycle (Empty → X → Crown) + Drag bulk X. Thick region borders. Hint places 1 locked Crown with **+10s penalty**.
2. **Zip:** 6×6 (Mon–Tue) → 8×8 (Fri–Sun) with wall barriers. Drag continuous path 1→K visiting all cells. Bubble-pop + vibrate on sequential numbers. Hint adds 1 step with **15s cooldown**.
3. **Tango:** Always 6×6. iOS Segmented Control toggle (`Icons` vs `Circles`). Delayed error highlight (~600ms). Smart Hint with logical explanation.
4. **Mini Sudoku:** Always 6×6 (2×3 blocks). Number pad + Pencil notes + Smart highlight. Staggered **green wave + vibrate/chime** when a row, column, or 2×3 block is completely & correctly filled. Smart Hint.
5. **Patches:** 6×6 (Mon) → 8×8 (Sun). Drag from **any cell** to enclose 1 clue; invalid shape/area stays on board in Error State. 4 visual clue types (`any`, `square`, `horizontal`, `vertical`). Hint locks 1 correct patch with **+10s penalty**.
6. **Fold (Pola Original):** 4×4 (Mon–Tue) → 5×5 / 6×6 (Sun). Translucent layered glass folding puzzle. Swipe/drag across grid creases to fold the glass sheet so every solid colored dot aligns inside a matching hollow target ring within a limited number of folds (`maxFolds`). Soft Lavender accent, 3D frosted glass fold animation + tactile snap/chime when dots lock into targets.