import { buildTransformedZipPreset } from "./presetBank";
import type { ZipDifficulty, ZipPuzzle } from "./types";

/**
 * Weekly difficulty curve for Zip:
 * Mon (1) & Tue (2): 6×6 Easy (no walls, more numbered waypoints)
 * Wed (3) & Thu (4): 7×7 Medium (introduces thick wall barriers)
 * Fri (5) & Sat (6): 8×8 Hard (strategic wall barriers, fewer numbers)
 * Sun (0):           8×8 Expert (complex wall barriers, minimal numbers)
 */
export function getZipDifficultyForDayOfWeek(dayOfWeek: number): ZipDifficulty {
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

export function getZipDifficultyForDateString(dateStr: string): ZipDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getZipDifficultyForDayOfWeek(dt.getDay());
}

const dailyZipCache = new Map<string, ZipPuzzle>();

/**
 * Get Today's Daily Zip puzzle for a given YYYY-MM-DD date.
 * Loads in 0ms from verified presets + deterministic dihedral symmetry.
 */
export function getDailyZipPuzzle(dateStr: string): ZipPuzzle {
  const cached = dailyZipCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getZipDifficultyForDateString(dateStr);
  const puzzle = buildTransformedZipPreset(difficulty, `daily-${dateStr}`);
  dailyZipCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Get an Unlimited Zip puzzle for any chosen difficulty in 0ms.
 */
export function getUnlimitedZipPuzzle(
  difficulty: ZipDifficulty,
  nonce: string
): ZipPuzzle {
  return buildTransformedZipPreset(difficulty, `unlimited-${nonce}`);
}
