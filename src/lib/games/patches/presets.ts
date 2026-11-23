import { buildTransformedPatchesPreset } from "./presetBank";
import type { PatchesDifficulty, PatchesPuzzle } from "./types";

/**
 * Weekly difficulty curve for Patches:
 * Mon (1) & Tue (2): 6×6 Easy (all clues numbered)
 * Wed (3) & Thu (4): 7×7 Medium (mix of numbered free-shape & solid-shape clues)
 * Fri (5) & Sat (6): 8×8 Hard (introduces unnumbered solid-shape clues)
 * Sun (0):           8×8 Expert (multiple unnumbered solid-shape clues)
 */
export function getPatchesDifficultyForDayOfWeek(
  dayOfWeek: number
): PatchesDifficulty {
  switch (dayOfWeek) {
    case 1:
    case 2:
      return "easy";
    case 3:
    case 4:
      return "medium";
    case 5:
    case 6:
      return "hard";
    case 0:
    default:
      return "expert";
  }
}

export function getPatchesDifficultyForDateString(
  dateStr: string
): PatchesDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getPatchesDifficultyForDayOfWeek(dt.getDay());
}

const dailyPatchesCache = new Map<string, PatchesPuzzle>();

/**
 * Get Today's Daily Patches puzzle for a given YYYY-MM-DD date in 0ms.
 */
export function getDailyPatchesPuzzle(dateStr: string): PatchesPuzzle {
  const cached = dailyPatchesCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getPatchesDifficultyForDateString(dateStr);
  const puzzle = buildTransformedPatchesPreset(difficulty, `daily-${dateStr}`);
  dailyPatchesCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Get an Unlimited Patches puzzle for any chosen difficulty in 0ms.
 */
export function getUnlimitedPatchesPuzzle(
  difficulty: PatchesDifficulty,
  nonce: string
): PatchesPuzzle {
  return buildTransformedPatchesPreset(difficulty, `unlimited-${nonce}`);
}
