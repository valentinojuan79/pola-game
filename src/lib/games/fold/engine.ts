import {
  FOLD_COLORS,
  type FoldBoardState,
  type FoldBounds,
  type FoldCell,
  type FoldColor,
  type FoldHintResult,
  type FoldMove,
  type FoldPuzzle,
  type FoldSnapshot,
} from "./types";

export function cloneCells(cells: FoldCell[][]): FoldCell[][] {
  return cells.map((row) =>
    row.map((cell) => ({
      dots: [...cell.dots],
      targets: [...cell.targets],
      layers: cell.layers,
    }))
  );
}

export function computeBounds(cells: FoldCell[][]): FoldBounds {
  const n = cells.length;
  let minR = n;
  let maxR = -1;
  let minC = n;
  let maxC = -1;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c].layers > 0) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  if (maxR < 0) {
    return { minR: 0, maxR: n - 1, minC: 0, maxC: n - 1 };
  }
  return { minR, maxR, minC, maxC };
}

export function createInitialBoardState(puzzle: FoldPuzzle): FoldBoardState {
  const n = puzzle.size;
  const cells: FoldCell[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({
      dots: [],
      targets: [],
      layers: 1,
    }))
  );

  for (const d of puzzle.dots) {
    if (d.row >= 0 && d.row < n && d.col >= 0 && d.col < n) {
      cells[d.row][d.col].dots.push(d.color);
    }
  }

  for (const t of puzzle.targets) {
    if (t.row >= 0 && t.row < n && t.col >= 0 && t.col < n) {
      cells[t.row][t.col].targets.push(t.color);
    }
  }

  return {
    cells,
    bounds: { minR: 0, maxR: n - 1, minC: 0, maxC: n - 1 },
    foldsUsed: 0,
    moveHistory: [],
    snapshots: [],
  };
}

/**
 * Exact crease folding validity check (keeps all reflected cells strictly inside 0..N-1).
 */
export function isValidFold(
  bounds: FoldBounds,
  size: number,
  move: FoldMove
): boolean {
  const { minR, maxR, minC, maxC } = bounds;
  if (move.axis === "vertical") {
    if (move.line <= minC || move.line > maxC) return false;
    if (move.direction === "left") {
      return 2 * move.line - 1 - maxC >= 0;
    }
    if (move.direction === "right") {
      return 2 * move.line - 1 - minC <= size - 1;
    }
    return false;
  } else {
    if (move.line <= minR || move.line > maxR) return false;
    if (move.direction === "up") {
      return 2 * move.line - 1 - maxR >= 0;
    }
    if (move.direction === "down") {
      return 2 * move.line - 1 - minR <= size - 1;
    }
    return false;
  }
}

/**
 * Return all currently valid folds for the active sheet bounds.
 */
export function getValidFolds(bounds: FoldBounds, size: number): FoldMove[] {
  const moves: FoldMove[] = [];
  for (let line = bounds.minC + 1; line <= bounds.maxC; line++) {
    const left: FoldMove = { axis: "vertical", line, direction: "left" };
    if (isValidFold(bounds, size, left)) moves.push(left);
    const right: FoldMove = { axis: "vertical", line, direction: "right" };
    if (isValidFold(bounds, size, right)) moves.push(right);
  }
  for (let line = bounds.minR + 1; line <= bounds.maxR; line++) {
    const up: FoldMove = { axis: "horizontal", line, direction: "up" };
    if (isValidFold(bounds, size, up)) moves.push(up);
    const down: FoldMove = { axis: "horizontal", line, direction: "down" };
    if (isValidFold(bounds, size, down)) moves.push(down);
  }
  return moves;
}

/**
 * Apply a single crease fold to a grid of cells, returning new cells & bounds.
 */
export function applyFoldToCells(
  cells: FoldCell[][],
  bounds: FoldBounds,
  move: FoldMove
): { cells: FoldCell[][]; bounds: FoldBounds } | null {
  const size = cells.length;
  if (!isValidFold(bounds, size, move)) return null;

  const next = cloneCells(cells);

  if (move.axis === "vertical") {
    if (move.direction === "left") {
      // Reflect all cells with c >= line to newC = 2 * line - 1 - c
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        for (let c = move.line; c <= bounds.maxC; c++) {
          const src = cells[r][c];
          if (src.layers === 0) continue;
          const newC = 2 * move.line - 1 - c;
          next[r][newC].dots.push(...src.dots);
          next[r][newC].targets.push(...src.targets);
          next[r][newC].layers += src.layers;
          next[r][c] = { dots: [], targets: [], layers: 0 };
        }
      }
    } else {
      // direction === "right": reflect all cells with c < line to newC = 2 * line - 1 - c
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        for (let c = bounds.minC; c < move.line; c++) {
          const src = cells[r][c];
          if (src.layers === 0) continue;
          const newC = 2 * move.line - 1 - c;
          next[r][newC].dots.push(...src.dots);
          next[r][newC].targets.push(...src.targets);
          next[r][newC].layers += src.layers;
          next[r][c] = { dots: [], targets: [], layers: 0 };
        }
      }
    }
  } else {
    if (move.direction === "up") {
      // Reflect all cells with r >= line to newR = 2 * line - 1 - r
      for (let r = move.line; r <= bounds.maxR; r++) {
        for (let c = bounds.minC; c <= bounds.maxC; c++) {
          const src = cells[r][c];
          if (src.layers === 0) continue;
          const newR = 2 * move.line - 1 - r;
          next[newR][c].dots.push(...src.dots);
          next[newR][c].targets.push(...src.targets);
          next[newR][c].layers += src.layers;
          next[r][c] = { dots: [], targets: [], layers: 0 };
        }
      }
    } else {
      // direction === "down": reflect all cells with r < line to newR = 2 * line - 1 - r
      for (let r = bounds.minR; r < move.line; r++) {
        for (let c = bounds.minC; c <= bounds.maxC; c++) {
          const src = cells[r][c];
          if (src.layers === 0) continue;
          const newR = 2 * move.line - 1 - r;
          next[newR][c].dots.push(...src.dots);
          next[newR][c].targets.push(...src.targets);
          next[newR][c].layers += src.layers;
          next[r][c] = { dots: [], targets: [], layers: 0 };
        }
      }
    }
  }

  return {
    cells: next,
    bounds: computeBounds(next),
  };
}

/**
 * Count how many dot-target pairs are currently matched 1-to-1 by color across the board.
 */
export function countMatchedPairs(cells: FoldCell[][]): number {
  let matched = 0;
  for (const row of cells) {
    for (const cell of row) {
      if (cell.dots.length === 0 || cell.targets.length === 0) continue;
      for (const color of FOLD_COLORS) {
        let d = 0;
        let t = 0;
        for (const c of cell.dots) if (c === color) d++;
        for (const c of cell.targets) if (c === color) t++;
        matched += Math.min(d, t);
      }
    }
  }
  return matched;
}

/**
 * Check whether every cell's dots match its targets 1-to-1 by color.
 */
export function isBoardSolved(cells: FoldCell[][]): boolean {
  for (const row of cells) {
    for (const cell of row) {
      if (cell.dots.length !== cell.targets.length) return false;
      if (cell.dots.length === 0) continue;
      for (const color of FOLD_COLORS) {
        let d = 0;
        let t = 0;
        for (const c of cell.dots) if (c === color) d++;
        for (const c of cell.targets) if (c === color) t++;
        if (d !== t) return false;
      }
    }
  }
  return true;
}

/**
 * Execute a fold move on the full FoldBoardState, enforcing maxFolds.
 */
export function performFold(
  state: FoldBoardState,
  puzzle: FoldPuzzle,
  move: FoldMove
): {
  nextState: FoldBoardState;
  folded: boolean;
  newlyMatched: number;
} {
  if (state.foldsUsed >= puzzle.maxFolds) {
    return { nextState: state, folded: false, newlyMatched: 0 };
  }

  const applied = applyFoldToCells(state.cells, state.bounds, move);
  if (!applied) {
    return { nextState: state, folded: false, newlyMatched: 0 };
  }

  const prevMatched = countMatchedPairs(state.cells);
  const nextMatched = countMatchedPairs(applied.cells);

  const snapshot: FoldSnapshot = {
    cells: cloneCells(state.cells),
    bounds: { ...state.bounds },
  };

  return {
    nextState: {
      cells: applied.cells,
      bounds: applied.bounds,
      foldsUsed: state.foldsUsed + 1,
      moveHistory: [...state.moveHistory, move],
      snapshots: [...state.snapshots, snapshot],
    },
    folded: true,
    newlyMatched: Math.max(0, nextMatched - prevMatched),
  };
}

export function undoFold(state: FoldBoardState): FoldBoardState {
  if (state.snapshots.length === 0) return state;
  const prevSnapshot = state.snapshots[state.snapshots.length - 1];
  return {
    cells: cloneCells(prevSnapshot.cells),
    bounds: { ...prevSnapshot.bounds },
    foldsUsed: Math.max(0, state.foldsUsed - 1),
    moveHistory: state.moveHistory.slice(0, -1),
    snapshots: state.snapshots.slice(0, -1),
  };
}

export function rewindToStep(
  state: FoldBoardState,
  stepIndex: number
): FoldBoardState {
  if (stepIndex < 0 || stepIndex >= state.snapshots.length) return state;
  const target = state.snapshots[stepIndex];
  return {
    cells: cloneCells(target.cells),
    bounds: { ...target.bounds },
    foldsUsed: stepIndex,
    moveHistory: state.moveHistory.slice(0, stepIndex),
    snapshots: state.snapshots.slice(0, stepIndex),
  };
}

export function resetFoldBoard(puzzle: FoldPuzzle): FoldBoardState {
  return createInitialBoardState(puzzle);
}

export function movesEqual(a: FoldMove, b: FoldMove): boolean {
  return a.axis === b.axis && a.line === b.line && a.direction === b.direction;
}

/**
 * Compare current moveHistory against puzzle.solutionFolds to give a visual hint.
 */
export function getFoldHint(
  state: FoldBoardState,
  puzzle: FoldPuzzle
): FoldHintResult {
  if (isBoardSolved(state.cells)) {
    return { status: "already_solved" };
  }

  let matchingPrefix = 0;
  const maxCheck = Math.min(state.moveHistory.length, puzzle.solutionFolds.length);
  for (let i = 0; i < maxCheck; i++) {
    if (movesEqual(state.moveHistory[i], puzzle.solutionFolds[i])) {
      matchingPrefix++;
    } else {
      break;
    }
  }

  if (
    matchingPrefix === state.moveHistory.length &&
    matchingPrefix < puzzle.solutionFolds.length
  ) {
    return {
      status: "on_track",
      nextMove: puzzle.solutionFolds[matchingPrefix],
    };
  }

  return {
    status: "diverged",
    rewindToStep: matchingPrefix,
  };
}

/**
 * Lightweight mathematical verification that a puzzle's solutionFolds solve it cleanly.
 */
export function verifyFoldPuzzle(puzzle: FoldPuzzle): boolean {
  if (puzzle.solutionFolds.length === 0 || puzzle.solutionFolds.length > puzzle.maxFolds) {
    return false;
  }
  const initial = createInitialBoardState(puzzle);
  if (isBoardSolved(initial.cells)) return false;

  let cells = initial.cells;
  let bounds = initial.bounds;
  for (const move of puzzle.solutionFolds) {
    const applied = applyFoldToCells(cells, bounds, move);
    if (!applied) return false;
    cells = applied.cells;
    bounds = applied.bounds;
  }
  return isBoardSolved(cells);
}

/**
 * Generate emoji share card for Fold.
 */
export function generateFoldShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  puzzle: FoldPuzzle;
  foldsUsed: number;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  formatTime: (s: number) => string;
}): string {
  const { mode, dateStr, puzzle, foldsUsed, totalSeconds, hintsUsed, streak, formatTime } =
    params;
  const title =
    mode === "daily" ? `Pola Fold · ${dateStr}` : `Pola Fold · Unlimited`;
  const diffLabel =
    puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1);
  const hintPart = hintsUsed > 0 ? ` · 💡 ${hintsUsed}` : "";
  const streakPart = mode === "daily" && streak > 0 ? ` · 🔥 ${streak}` : "";

  const dotsRow = "🟣".repeat(Math.max(1, foldsUsed)) + "◽".repeat(Math.max(0, puzzle.maxFolds - foldsUsed));

  return [
    title,
    `${puzzle.size}×${puzzle.size} ${diffLabel} · ${foldsUsed}/${puzzle.maxFolds} folds`,
    dotsRow,
    `⏱ ${formatTime(totalSeconds)}${hintPart}${streakPart}`,
  ].join("\n");
}
