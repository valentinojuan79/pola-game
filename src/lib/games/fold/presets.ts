import { buildTransformedFoldPreset } from "./presetBank";
import type { FoldDifficulty, FoldPuzzle } from "./types";

/**
 * Weekly difficulty curve for Fold:
 * Mon (1) & Tue (2): 4×4 Easy (2 folds, 3 pairs)
 * Wed (3) & Thu (4): 4×4 Medium (3 folds, 4 pairs, fold order matters)
 * Fri (5) & Sat (6): 5×5 Hard (3–4 folds, 5 pairs across 3 colors)
 * Sun (0):           5×5 Expert (4–5 folds, tricky order-dependent spatial folds)
 */
export function getFoldDifficultyForDayOfWeek(
  dayOfWeek: number
): FoldDifficulty {
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

export function getFoldDifficultyForDateString(
  dateStr: string
): FoldDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getFoldDifficultyForDayOfWeek(dt.getDay());
}

const dailyFoldCache = new Map<string, FoldPuzzle>();

/**
 * Get Today's Daily Fold puzzle for a given YYYY-MM-DD date in 0ms.
 */
export function getDailyFoldPuzzle(dateStr: string): FoldPuzzle {
  const cached = dailyFoldCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getFoldDifficultyForDateString(dateStr);
  const puzzle = buildTransformedFoldPreset(difficulty, `daily-${dateStr}`);
  dailyFoldCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Get an Unlimited Fold puzzle for any chosen difficulty in 0ms.
 */
export function getUnlimitedFoldPuzzle(
  difficulty: FoldDifficulty,
  nonce: string
): FoldPuzzle {
  return buildTransformedFoldPreset(difficulty, `unlimited-${nonce}`);
}
