import { generateTangoPuzzle } from "./generator";
import type { TangoDifficulty, TangoPuzzle } from "./types";

/**
 * Weekly difficulty curve for Tango (always 6×6, scales by clue density & logical depth):
 * Mon (1) & Tue (2): Easy   (more initial cells & constraints)
 * Wed (3) & Thu (4): Medium (moderate clues, introduces pair deductions)
 * Fri (5) & Sat (6): Hard   (sparse clues, 3-empty-gap traps & pair quotas)
 * Sun (0):           Expert (minimal clues, deep logic)
 */
export function getTangoDifficultyForDayOfWeek(
  dayOfWeek: number
): TangoDifficulty {
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

export function getTangoDifficultyForDateString(
  dateStr: string
): TangoDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getTangoDifficultyForDayOfWeek(dt.getDay());
}

const dailyTangoCache = new Map<string, TangoPuzzle>();

/**
 * Get Today's Daily Tango puzzle for a given YYYY-MM-DD date.
 * Guaranteed 100% purely logical (no trial-and-error / look-ahead guessing).
 */
export function getDailyTangoPuzzle(dateStr: string): TangoPuzzle {
  const cached = dailyTangoCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getTangoDifficultyForDateString(dateStr);
  const puzzle = generateTangoPuzzle(difficulty, `daily-${dateStr}`);
  dailyTangoCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Get an Unlimited Tango puzzle for any chosen difficulty with randomized
 * board symmetries and clue-removal order.
 */
export function getUnlimitedTangoPuzzle(
  difficulty: TangoDifficulty,
  nonce: string
): TangoPuzzle {
  return generateTangoPuzzle(difficulty, `unlimited-${nonce}`);
}
