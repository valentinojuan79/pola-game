import { buildTransformedMiniSudokuPreset } from "./presetBank";
import type { MiniSudokuDifficulty, MiniSudokuPuzzle } from "./types";

/**
 * Weekly difficulty curve for Mini Sudoku (always 6x6 with 2x3 blocks):
 * Mon (1) & Tue (2): Easy   (17 clues, breezy naked singles)
 * Wed (3) & Thu (4): Medium (14 clues, clean hidden singles)
 * Fri (5) & Sat (6): Hard   (11 clues, deeper deduction)
 * Sun (0):           Expert (9-10 clues, razor-thin clues)
 */
export function getMiniSudokuDifficultyForDayOfWeek(
  dayOfWeek: number
): MiniSudokuDifficulty {
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

export function getMiniSudokuDifficultyForDateString(
  dateStr: string
): MiniSudokuDifficulty {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return getMiniSudokuDifficultyForDayOfWeek(dt.getDay());
}

const dailyMiniSudokuCache = new Map<string, MiniSudokuPuzzle>();

/**
 * Get Today's Daily Mini Sudoku puzzle for a given YYYY-MM-DD date in 0ms.
 */
export function getDailyMiniSudokuPuzzle(dateStr: string): MiniSudokuPuzzle {
  const cached = dailyMiniSudokuCache.get(dateStr);
  if (cached) return cached;

  const difficulty = getMiniSudokuDifficultyForDateString(dateStr);
  const puzzle = buildTransformedMiniSudokuPreset(
    difficulty,
    `daily-${dateStr}`
  );
  dailyMiniSudokuCache.set(dateStr, puzzle);
  return puzzle;
}

/**
 * Get an Unlimited Mini Sudoku puzzle for any chosen difficulty in 0ms.
 */
export function getUnlimitedMiniSudokuPuzzle(
  difficulty: MiniSudokuDifficulty,
  nonce: string
): MiniSudokuPuzzle {
  return buildTransformedMiniSudokuPreset(difficulty, `unlimited-${nonce}`);
}
