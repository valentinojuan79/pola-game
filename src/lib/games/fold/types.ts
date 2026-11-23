export type FoldColor = "lavender" | "coral" | "sky" | "mint";

export type FoldDifficulty = "easy" | "medium" | "hard" | "expert";

export const FOLD_DIFFICULTY_TO_SIZE: Record<FoldDifficulty, number> = {
  easy: 4,
  medium: 4,
  hard: 5,
  expert: 5,
};

export const FOLD_COLORS: FoldColor[] = ["lavender", "coral", "sky", "mint"];

export type FoldAxis = "vertical" | "horizontal";

export type FoldDirection = "left" | "right" | "up" | "down";

export interface FoldMove {
  axis: FoldAxis;
  /** Grid crease line index between 1 and size - 1 */
  line: number;
  direction: FoldDirection;
}

export interface FoldBounds {
  minR: number;
  maxR: number;
  minC: number;
  maxC: number;
}

export interface FoldCell {
  dots: FoldColor[];
  targets: FoldColor[];
  /** Number of stacked glass layers in this cell (0 = folded away) */
  layers: number;
}

export interface FoldItemPlacement {
  row: number;
  col: number;
  color: FoldColor;
}

export interface FoldPuzzle {
  id: string;
  size: number;
  difficulty: FoldDifficulty;
  maxFolds: number;
  dots: FoldItemPlacement[];
  targets: FoldItemPlacement[];
  solutionFolds: FoldMove[];
}

export interface FoldSnapshot {
  cells: FoldCell[][];
  bounds: FoldBounds;
}

export interface FoldBoardState {
  cells: FoldCell[][];
  bounds: FoldBounds;
  foldsUsed: number;
  moveHistory: FoldMove[];
  snapshots: FoldSnapshot[];
}

export type FoldHintResult =
  | {
      status: "on_track";
      nextMove: FoldMove;
    }
  | {
      status: "diverged";
      rewindToStep: number;
    }
  | {
      status: "already_solved";
    };
