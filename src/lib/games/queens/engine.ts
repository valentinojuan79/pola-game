import type {
  CellState,
  QueensBoardState,
  QueensPuzzle,
  QueensSnapshot,
  QueensValidation,
} from "./types";

function cloneCells(cells: CellState[][]): CellState[][] {
  return cells.map((row) => [...row]);
}

function cloneBoolGrid(grid: boolean[][]): boolean[][] {
  return grid.map((row) => [...row]);
}

export function createInitialBoardState(size: number): QueensBoardState {
  return {
    cells: Array.from({ length: size }, () => Array<CellState>(size).fill("empty")),
    autoXMask: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
    lockedCrowns: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
    history: [],
  };
}

function pushHistory(state: QueensBoardState): QueensSnapshot[] {
  const snapshot: QueensSnapshot = {
    cells: cloneCells(state.cells),
    autoXMask: cloneBoolGrid(state.autoXMask),
  };
  // Keep up to 100 undo steps
  const next = [...state.history, snapshot];
  return next.length > 100 ? next.slice(next.length - 100) : next;
}

/** Compute which cells are attacked by all currently placed Crowns */
function computeAttackedCells(
  cells: CellState[][],
  regions: number[][]
): boolean[][] {
  const n = cells.length;
  const attacked = Array.from({ length: n }, () => Array<boolean>(n).fill(false));

  const crownRows = new Set<number>();
  const crownCols = new Set<number>();
  const crownRegions = new Set<number>();
  const crowns: [number, number][] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c] === "crown") {
        crownRows.add(r);
        crownCols.add(c);
        crownRegions.add(regions[r][c]);
        crowns.push([r, c]);
      }
    }
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c] === "crown") continue;
      if (
        crownRows.has(r) ||
        crownCols.has(c) ||
        crownRegions.has(regions[r][c])
      ) {
        attacked[r][c] = true;
        continue;
      }
      for (const [cr, cc] of crowns) {
        if (Math.abs(r - cr) <= 1 && Math.abs(c - cc) <= 1) {
          attacked[r][c] = true;
          break;
        }
      }
    }
  }

  return attacked;
}

/**
 * Reconcile Auto-X marks:
 * - If autoXEnabled: any empty cell attacked by a crown gets an auto-X.
 * - Any existing auto-X that is no longer attacked by any crown returns to empty.
 * - Manually placed X's (autoXMask === false) are never removed.
 */
function reconcileAutoX(
  cells: CellState[][],
  autoXMask: boolean[][],
  regions: number[][],
  autoXEnabled: boolean
): void {
  const n = cells.length;
  const attacked = computeAttackedCells(cells, regions);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c] === "crown") {
        autoXMask[r][c] = false;
        continue;
      }

      if (autoXEnabled) {
        if (attacked[r][c] && cells[r][c] === "empty") {
          cells[r][c] = "x";
          autoXMask[r][c] = true;
        } else if (!attacked[r][c] && cells[r][c] === "x" && autoXMask[r][c]) {
          cells[r][c] = "empty";
          autoXMask[r][c] = false;
        }
      } else {
        // When Auto-X is disabled, still clean up orphaned auto-X if a crown is removed
        if (!attacked[r][c] && cells[r][c] === "x" && autoXMask[r][c]) {
          cells[r][c] = "empty";
          autoXMask[r][c] = false;
        }
      }
    }
  }
}

/**
 * Tap cycle: Empty -> X -> Crown -> Empty
 */
export function tapCell(
  state: QueensBoardState,
  puzzle: QueensPuzzle,
  row: number,
  col: number,
  autoXEnabled: boolean
): { nextState: QueensBoardState; action: "x" | "crown" | "clear" | "locked" } {
  if (state.lockedCrowns[row][col]) {
    return { nextState: state, action: "locked" };
  }

  const nextCells = cloneCells(state.cells);
  const nextAutoX = cloneBoolGrid(state.autoXMask);
  const history = pushHistory(state);

  const current = nextCells[row][col];
  let action: "x" | "crown" | "clear";

  if (current === "empty") {
    nextCells[row][col] = "x";
    nextAutoX[row][col] = false;
    action = "x";
  } else if (current === "x") {
    nextCells[row][col] = "crown";
    nextAutoX[row][col] = false;
    action = "crown";
  } else {
    nextCells[row][col] = "empty";
    nextAutoX[row][col] = false;
    action = "clear";
  }

  reconcileAutoX(nextCells, nextAutoX, puzzle.regions, autoXEnabled);

  return {
    action,
    nextState: {
      ...state,
      cells: nextCells,
      autoXMask: nextAutoX,
      history,
    },
  };
}

/**
 * Start a drag gesture snapshot (so an entire drag stroke undoes as one step).
 */
export function pushDragSnapshot(state: QueensBoardState): QueensBoardState {
  return {
    ...state,
    history: pushHistory(state),
  };
}

/**
 * Drag across cells to mark X or erase X (never overwrites Crowns).
 */
export function applyDragX(
  state: QueensBoardState,
  row: number,
  col: number,
  mode: "mark" | "erase"
): { nextState: QueensBoardState; changed: boolean } {
  const current = state.cells[row][col];
  if (current === "crown") {
    return { nextState: state, changed: false };
  }

  if (mode === "mark" && current === "empty") {
    const nextCells = cloneCells(state.cells);
    const nextAutoX = cloneBoolGrid(state.autoXMask);
    nextCells[row][col] = "x";
    nextAutoX[row][col] = false;
    return {
      changed: true,
      nextState: {
        ...state,
        cells: nextCells,
        autoXMask: nextAutoX,
      },
    };
  }

  if (mode === "erase" && current === "x") {
    const nextCells = cloneCells(state.cells);
    const nextAutoX = cloneBoolGrid(state.autoXMask);
    nextCells[row][col] = "empty";
    nextAutoX[row][col] = false;
    return {
      changed: true,
      nextState: {
        ...state,
        cells: nextCells,
        autoXMask: nextAutoX,
      },
    };
  }

  return { nextState: state, changed: false };
}

export function undoMove(state: QueensBoardState): QueensBoardState {
  if (state.history.length === 0) return state;
  const previous = state.history[state.history.length - 1];
  const nextCells = cloneCells(previous.cells);
  const nextAutoX = cloneBoolGrid(previous.autoXMask);

  // Preserve locked hint crowns even on undo
  const n = nextCells.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (state.lockedCrowns[r][c]) {
        nextCells[r][c] = "crown";
        nextAutoX[r][c] = false;
      }
    }
  }

  return {
    ...state,
    cells: nextCells,
    autoXMask: nextAutoX,
    history: state.history.slice(0, -1),
  };
}

export function resetBoard(state: QueensBoardState): QueensBoardState {
  const n = state.cells.length;
  const nextCells = Array.from({ length: n }, () => Array<CellState>(n).fill("empty"));
  const nextAutoX = Array.from({ length: n }, () => Array<boolean>(n).fill(false));

  // Keep locked hint crowns on reset
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (state.lockedCrowns[r][c]) {
        nextCells[r][c] = "crown";
      }
    }
  }

  return {
    ...state,
    cells: nextCells,
    autoXMask: nextAutoX,
    history: pushHistory(state),
  };
}

/**
 * Hint: pick 1 random unsolved region, place its correct Crown, lock it,
 * clear any conflicting non-locked crowns, and apply Auto-X if enabled.
 */
export function applyHint(
  state: QueensBoardState,
  puzzle: QueensPuzzle,
  autoXEnabled: boolean
): { nextState: QueensBoardState; hintCell: [number, number] | null } {
  const unsolvedTargets: [number, number][] = [];

  for (const [r, c] of puzzle.solution) {
    if (state.cells[r][c] !== "crown" || !state.lockedCrowns[r][c]) {
      // Only consider regions that don't already have the correct crown placed
      if (state.cells[r][c] !== "crown") {
        unsolvedTargets.push([r, c]);
      }
    }
  }

  if (unsolvedTargets.length === 0) {
    return { nextState: state, hintCell: null };
  }

  const chosen =
    unsolvedTargets[Math.floor(Math.random() * unsolvedTargets.length)];
  const [tr, tc] = chosen;
  const targetRegion = puzzle.regions[tr][tc];

  const nextCells = cloneCells(state.cells);
  const nextAutoX = cloneBoolGrid(state.autoXMask);
  const nextLocked = cloneBoolGrid(state.lockedCrowns);
  const history = pushHistory(state);

  // Remove any misplaced unlocked crown conflicting with the hinted crown
  const n = puzzle.size;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (r === tr && c === tc) continue;
      if (nextCells[r][c] === "crown" && !nextLocked[r][c]) {
        const sameRow = r === tr;
        const sameCol = c === tc;
        const sameReg = puzzle.regions[r][c] === targetRegion;
        const touching = Math.abs(r - tr) <= 1 && Math.abs(c - tc) <= 1;
        if (sameRow || sameCol || sameReg || touching) {
          nextCells[r][c] = "empty";
        }
      }
    }
  }

  nextCells[tr][tc] = "crown";
  nextAutoX[tr][tc] = false;
  nextLocked[tr][tc] = true;

  reconcileAutoX(nextCells, nextAutoX, puzzle.regions, autoXEnabled);

  return {
    hintCell: chosen,
    nextState: {
      cells: nextCells,
      autoXMask: nextAutoX,
      lockedCrowns: nextLocked,
      history,
    },
  };
}

/**
 * Validate board state for row, column, region, and diagonal-touching conflicts.
 */
export function validateBoard(
  puzzle: QueensPuzzle,
  cells: CellState[][]
): QueensValidation {
  const n = puzzle.size;
  const crowns: [number, number][] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cells[r][c] === "crown") {
        crowns.push([r, c]);
      }
    }
  }

  const conflictCells = new Set<string>();
  const conflictRows = new Set<number>();
  const conflictCols = new Set<number>();
  const conflictRegions = new Set<number>();

  for (let i = 0; i < crowns.length; i++) {
    const [r1, c1] = crowns[i];
    const reg1 = puzzle.regions[r1][c1];
    for (let j = i + 1; j < crowns.length; j++) {
      const [r2, c2] = crowns[j];
      const reg2 = puzzle.regions[r2][c2];

      let conflict = false;
      if (r1 === r2) {
        conflictRows.add(r1);
        conflict = true;
      }
      if (c1 === c2) {
        conflictCols.add(c1);
        conflict = true;
      }
      if (reg1 === reg2) {
        conflictRegions.add(reg1);
        conflict = true;
      }
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
        conflict = true;
      }

      if (conflict) {
        conflictCells.add(`${r1},${c1}`);
        conflictCells.add(`${r2},${c2}`);
      }
    }
  }

  const isSolved = crowns.length === n && conflictCells.size === 0;

  return {
    conflictCells,
    conflictRows,
    conflictCols,
    conflictRegions,
    crownCount: crowns.length,
    isSolved,
  };
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function generateShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  size: number;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  cells: CellState[][];
}): string {
  const header =
    params.mode === "daily"
      ? `Pola · Queens (${params.dateStr})`
      : `Pola · Queens Unlimited (${params.size}×${params.size})`;

  const meta = [
    `⏱ ${formatTime(params.totalSeconds)}`,
    params.hintsUsed > 0 ? `💡 ${params.hintsUsed}` : "✨ No hints",
    params.mode === "daily" && params.streak > 0 ? `🔥 ${params.streak}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Clean spoiler-free mini emoji grid (crowns vs subtle squares)
  const gridLines = params.cells
    .map((row) => row.map((cell) => (cell === "crown" ? "👑" : "▫️")).join(""))
    .join("\n");

  return `${header}\n${meta}\n\n${gridLines}`;
}
