import { generateQueensPuzzle } from "./generator";
import { buildTransformedPreset } from "./presetBank";
import type { QueensDifficulty, QueensPuzzle } from "./types";

/**
 * Weekly difficulty curve (PROJECT_RULES.md):
 * Mon (1) & Tue (2): 6x6 Easy
 * Wed (3) & Thu (4): 7x7 Medium
 * Fri (5) & Sat (6): 8x8 Hard
 * Sun (0):           9x9 Expert
 */
export function getDifficultyForDayOfWeek(dayOfWeek: number): QueensDifficulty {
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

export function getDifficultyForDateString(dateStr: string): QueensDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getDifficultyForDayOfWeek(dt.getDay());
}

const dailyCache = new Map<string, QueensPuzzle>();

/**
 * Get Today's Daily Queens puzzle for a given YYYY-MM-DD date.
 * Uses verified pre-built presets with deterministic board symmetries so
 * Today's Puzzle (including 8x8 Hard and 9x9 Expert) loads in 0ms without
 * ever blocking the main thread.
 */
export function getDailyQueensPuzzle(dateStr: string): QueensPuzzle {
  const cached = dailyCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getDifficultyForDateString(dateStr);
  const puzzle = buildTransformedPreset(difficulty, `daily-${dateStr}`);
  dailyCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Generate a fresh Unlimited Queens puzzle for any chosen difficulty.
 * Uses the fast refinement generator with a strict 60ms cap + preset fallback.
 */
export function getUnlimitedQueensPuzzle(
  difficulty: QueensDifficulty,
  nonce: string
): QueensPuzzle {
  return generateQueensPuzzle(difficulty, `unlimited-${nonce}`);
}
