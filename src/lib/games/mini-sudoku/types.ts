export type MiniSudokuDifficulty = "easy" | "medium" | "hard" | "expert";

/** 0 = empty, 1..6 = placed digit */
export type MiniSudokuValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MiniSudokuDigit = 1 | 2 | 3 | 4 | 5 | 6;

export interface MiniSudokuPuzzle {
  id: string;
  difficulty: MiniSudokuDifficulty;
  /** 6x6 initial clues (0 = empty, 1..6 = locked clue) */
  initial: MiniSudokuValue[][];
  /** 6x6 verified unique solution */
  solution: MiniSudokuDigit[][];
}

export interface MiniSudokuSnapshot {
  grid: MiniSudokuValue[][];
  /** 6x6 bitmask of pencil notes: bit (1 << digit) means digit 1..6 is noted */
  notes: number[][];
}

export interface MiniSudokuBoardState {
  grid: MiniSudokuValue[][];
  notes: number[][];
  history: MiniSudokuSnapshot[];
}

export type MiniSudokuUnitType = "row" | "col" | "block";

export interface CompletedUnit {
  type: MiniSudokuUnitType;
  /** 0..5 for row/col; 0..5 for block (0=top-left, 1=top-right, 2=mid-left, 3=mid-right, 4=bot-left, 5=bot-right) */
  index: number;
  /** Ordered list of 6 cells in wave order */
  cells: [number, number][];
}

export type MiniSudokuHintKind = "error" | "deduction";

export type MiniSudokuHintRule =
  | "conflict_duplicate"
  | "wrong_value"
  | "naked_single"
  | "hidden_single_block"
  | "hidden_single_row"
  | "hidden_single_col"
  | "deduction_fallback";

export interface MiniSudokuHint {
  kind: MiniSudokuHintKind;
  rule: MiniSudokuHintRule;
  targetCell: [number, number];
  /** Digit that belongs here (for deduction) or the wrong digit currently placed (for error) */
  digit: MiniSudokuDigit;
  /** Optional unit context for subtle board wash */
  unit?: {
    type: MiniSudokuUnitType;
    index: number;
  };
  /** Supporting cells to highlight (e.g. duplicate peer cell) */
  highlightCells: [number, number][];
}
