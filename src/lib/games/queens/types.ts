export type CellState = "empty" | "x" | "crown";

export type QueensDifficulty = "easy" | "medium" | "hard" | "expert";

export interface QueensPuzzle {
  id: string;
  size: number;
  difficulty: QueensDifficulty;
  regions: number[][]; // size x size matrix of region indices 0..(size-1)
  solution: [number, number][]; // [row, col] for each row 0..(size-1)
  seed: string;
}

export interface QueensSnapshot {
  cells: CellState[][];
  autoXMask: boolean[][];
}

export interface QueensBoardState {
  cells: CellState[][];
  autoXMask: boolean[][]; // true if the 'x' at [r][c] was placed automatically by Auto-X
  lockedCrowns: boolean[][]; // true if placed by Hint
  history: QueensSnapshot[];
}

export interface QueensValidation {
  conflictCells: Set<string>; // "r,c" keys of cells in conflict
  conflictRows: Set<number>;
  conflictCols: Set<number>;
  conflictRegions: Set<number>;
  crownCount: number;
  isSolved: boolean;
}

export const DIFFICULTY_TO_SIZE: Record<QueensDifficulty, number> = {
  easy: 6,
  medium: 7,
  hard: 8,
  expert: 9,
};
