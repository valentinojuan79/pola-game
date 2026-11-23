export type PatchesDifficulty = "easy" | "medium" | "hard" | "expert";

export type PatchShape = "any" | "square" | "horizontal" | "vertical";

export interface PatchRect {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

export interface PatchClue {
  id: string;
  row: number;
  col: number;
  shape: PatchShape;
  /** Target area (width * height). Null for unnumbered solid-shape clues on Hard/Expert. */
  area: number | null;
  colorIndex: number;
  solution: PatchRect;
}

export interface PatchesPuzzle {
  id: string;
  difficulty: PatchesDifficulty;
  size: number;
  clues: PatchClue[];
}

export interface PlayerPatch {
  clueId: string;
  rect: PatchRect;
  locked?: boolean;
}

export interface PatchesBoardState {
  patches: Record<string, PlayerPatch>;
  history: Array<Record<string, PlayerPatch>>;
}

export interface PatchColorTheme {
  name: string;
  emoji: string;
  /** Translucent patch fill (Light / Dark) */
  fillClass: string;
  /** Crisp solid border when valid */
  borderClass: string;
  /** Dashed border while dragging (incomplete) */
  dashedBorderClass: string;
  /** Solid clue badge fill & text */
  badgeClass: string;
  /** Dashed "any" clue badge styling */
  anyBadgeClass: string;
  /** Live counter pill text */
  counterClass: string;
}

export const PATCHES_DIFFICULTY_TO_SIZE: Record<PatchesDifficulty, number> = {
  easy: 6,
  medium: 7,
  hard: 8,
  expert: 8,
};

/**
 * Calm, refined iOS Tinted Glass color palette for Patches.
 * Soft, harmonious hues that stay legible in both Light & Dark mode.
 */
export const PATCH_COLORS: PatchColorTheme[] = [
  {
    name: "rose",
    emoji: "🩷",
    fillClass: "bg-rose-500/[0.16] dark:bg-rose-400/[0.20]",
    borderClass: "border-rose-500/80 dark:border-rose-400/85",
    dashedBorderClass: "border-rose-500/60 dark:border-rose-400/60",
    badgeClass: "bg-rose-500 text-white dark:bg-rose-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-rose-500/80 bg-rose-500/[0.14] text-rose-800 dark:border-rose-400/80 dark:bg-rose-400/[0.20] dark:text-rose-100",
    counterClass: "bg-rose-600 text-white dark:bg-rose-400 dark:text-neutral-950",
  },
  {
    name: "sky",
    emoji: "🩵",
    fillClass: "bg-sky-500/[0.16] dark:bg-sky-400/[0.20]",
    borderClass: "border-sky-500/80 dark:border-sky-400/85",
    dashedBorderClass: "border-sky-500/60 dark:border-sky-400/60",
    badgeClass: "bg-sky-500 text-white dark:bg-sky-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-sky-500/80 bg-sky-500/[0.14] text-sky-800 dark:border-sky-400/80 dark:bg-sky-400/[0.20] dark:text-sky-100",
    counterClass: "bg-sky-600 text-white dark:bg-sky-400 dark:text-neutral-950",
  },
  {
    name: "amber",
    emoji: "🟨",
    fillClass: "bg-amber-500/[0.17] dark:bg-amber-400/[0.20]",
    borderClass: "border-amber-500/85 dark:border-amber-400/85",
    dashedBorderClass: "border-amber-500/65 dark:border-amber-400/60",
    badgeClass: "bg-amber-500 text-white dark:bg-amber-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-amber-600/80 bg-amber-500/[0.15] text-amber-900 dark:border-amber-400/80 dark:bg-amber-400/[0.20] dark:text-amber-100",
    counterClass: "bg-amber-600 text-white dark:bg-amber-400 dark:text-neutral-950",
  },
  {
    name: "emerald",
    emoji: "🟩",
    fillClass: "bg-emerald-500/[0.16] dark:bg-emerald-400/[0.20]",
    borderClass: "border-emerald-500/80 dark:border-emerald-400/85",
    dashedBorderClass: "border-emerald-500/60 dark:border-emerald-400/60",
    badgeClass:
      "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-emerald-600/80 bg-emerald-500/[0.14] text-emerald-800 dark:border-emerald-400/80 dark:bg-emerald-400/[0.20] dark:text-emerald-100",
    counterClass:
      "bg-emerald-600 text-white dark:bg-emerald-400 dark:text-neutral-950",
  },
  {
    name: "coral",
    emoji: "🟧",
    fillClass: "bg-orange-500/[0.16] dark:bg-orange-400/[0.20]",
    borderClass: "border-orange-500/80 dark:border-orange-400/85",
    dashedBorderClass: "border-orange-500/60 dark:border-orange-400/60",
    badgeClass:
      "bg-orange-500 text-white dark:bg-orange-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-orange-600/80 bg-orange-500/[0.14] text-orange-800 dark:border-orange-400/80 dark:bg-orange-400/[0.20] dark:text-orange-100",
    counterClass:
      "bg-orange-600 text-white dark:bg-orange-400 dark:text-neutral-950",
  },
  {
    name: "teal",
    emoji: "🟦",
    fillClass: "bg-teal-500/[0.16] dark:bg-teal-400/[0.20]",
    borderClass: "border-teal-500/80 dark:border-teal-400/85",
    dashedBorderClass: "border-teal-500/60 dark:border-teal-400/60",
    badgeClass: "bg-teal-500 text-white dark:bg-teal-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-teal-600/80 bg-teal-500/[0.14] text-teal-800 dark:border-teal-400/80 dark:bg-teal-400/[0.20] dark:text-teal-100",
    counterClass: "bg-teal-600 text-white dark:bg-teal-400 dark:text-neutral-950",
  },
  {
    name: "berry",
    emoji: "🟪",
    fillClass: "bg-pink-500/[0.16] dark:bg-pink-400/[0.20]",
    borderClass: "border-pink-500/80 dark:border-pink-400/85",
    dashedBorderClass: "border-pink-500/60 dark:border-pink-400/60",
    badgeClass: "bg-pink-500 text-white dark:bg-pink-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-pink-600/80 bg-pink-500/[0.14] text-pink-800 dark:border-pink-400/80 dark:bg-pink-400/[0.20] dark:text-pink-100",
    counterClass: "bg-pink-600 text-white dark:bg-pink-400 dark:text-neutral-950",
  },
  {
    name: "blue",
    emoji: "🔷",
    fillClass: "bg-blue-500/[0.15] dark:bg-blue-400/[0.20]",
    borderClass: "border-blue-500/80 dark:border-blue-400/85",
    dashedBorderClass: "border-blue-500/60 dark:border-blue-400/60",
    badgeClass: "bg-blue-500 text-white dark:bg-blue-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-blue-600/80 bg-blue-500/[0.14] text-blue-800 dark:border-blue-400/80 dark:bg-blue-400/[0.20] dark:text-blue-100",
    counterClass: "bg-blue-600 text-white dark:bg-blue-400 dark:text-neutral-950",
  },
  {
    name: "lime",
    emoji: "🟢",
    fillClass: "bg-lime-500/[0.17] dark:bg-lime-400/[0.20]",
    borderClass: "border-lime-600/80 dark:border-lime-400/85",
    dashedBorderClass: "border-lime-600/60 dark:border-lime-400/60",
    badgeClass: "bg-lime-600 text-white dark:bg-lime-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-lime-600/80 bg-lime-500/[0.15] text-lime-900 dark:border-lime-400/80 dark:bg-lime-400/[0.20] dark:text-lime-100",
    counterClass: "bg-lime-600 text-white dark:bg-lime-400 dark:text-neutral-950",
  },
  {
    name: "fuchsia",
    emoji: "🌸",
    fillClass: "bg-fuchsia-500/[0.15] dark:bg-fuchsia-400/[0.19]",
    borderClass: "border-fuchsia-500/75 dark:border-fuchsia-400/80",
    dashedBorderClass: "border-fuchsia-500/55 dark:border-fuchsia-400/55",
    badgeClass:
      "bg-fuchsia-500 text-white dark:bg-fuchsia-400 dark:text-neutral-950",
    anyBadgeClass:
      "border-fuchsia-600/75 bg-fuchsia-500/[0.14] text-fuchsia-800 dark:border-fuchsia-400/80 dark:bg-fuchsia-400/[0.20] dark:text-fuchsia-100",
    counterClass:
      "bg-fuchsia-600 text-white dark:bg-fuchsia-400 dark:text-neutral-950",
  },
];

export function getPatchColor(colorIndex: number): PatchColorTheme {
  return PATCH_COLORS[((colorIndex % PATCH_COLORS.length) + PATCH_COLORS.length) % PATCH_COLORS.length];
}
