export type ZipDifficulty = "easy" | "medium" | "hard" | "expert";

/** [row, col] coordinate on the grid */
export type ZipCoord = [number, number];

export interface ZipWaypoint {
  row: number;
  col: number;
  num: number; // 1..K
}

/**
 * Wall barrier between two 4-directionally adjacent cells: [r1, c1, r2, c2].
 * Normalized so (r1 < r2) or (r1 === r2 && c1 < c2).
 */
export type ZipWall = [number, number, number, number];

export interface ZipPuzzle {
  id: string;
  difficulty: ZipDifficulty;
  size: number; // 6 (Easy), 7 (Medium), 8 (Hard & Expert)
  waypoints: ZipWaypoint[];
  walls: ZipWall[];
  solutionPath: ZipCoord[];
}

export interface ZipBoardState {
  /** Active drawn path, always starting at waypoint 1 */
  path: ZipCoord[];
  /** Undo history snapshots */
  history: ZipCoord[][];
}

export const ZIP_DIFFICULTY_TO_SIZE: Record<ZipDifficulty, number> = {
  easy: 6,
  medium: 7,
  hard: 8,
  expert: 8,
};
