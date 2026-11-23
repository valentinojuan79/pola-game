import { formatTime } from "@/lib/games/queens/engine";
import type {
  CompletedUnit,
  MiniSudokuBoardState,
  MiniSudokuDifficulty,
  MiniSudokuDigit,
  MiniSudokuPuzzle,
  MiniSudokuValue,
} from "./types";

const MAX_HISTORY = 120;

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

/** Returns block index 0..5 for a 6x6 grid with 2x3 blocks (2 rows x 3 cols) */
export function getBlockIndex(r: number, c: number): number {
  return Math.floor(r / 2) * 2 + Math.floor(c / 3);
}

export function getBlockOrigin(blockIdx: number): [number, number] {
  return [Math.floor(blockIdx / 2) * 2, (blockIdx % 2) * 3];
}

export function getBlockCells(blockIdx: number): [number, number][] {
  const [br, bc] = getBlockOrigin(blockIdx);
  const cells: [number, number][] = [];
  for (let dr = 0; dr < 2; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      cells.push([br + dr, bc + dc]);
    }
  }
  return cells;
}

export function isLockedCell(
  puzzle: MiniSudokuPuzzle,
  r: number,
  c: number
): boolean {
  return puzzle.initial[r][c] !== 0;
}

export function cloneGrid(grid: MiniSudokuValue[][]): MiniSudokuValue[][] {
  return grid.map((row) => row.slice());
}

export function cloneNotes(notes: number[][]): number[][] {
  return notes.map((row) => row.slice());
}

export function createEmptyNotes(): number[][] {
  return Array.from({ length: 6 }, () => Array<number>(6).fill(0));
}

export function hasNote(mask: number, digit: MiniSudokuDigit): boolean {
  return (mask & (1 << digit)) !== 0;
}

export function createInitialMiniSudokuState(
  puzzle: MiniSudokuPuzzle
): MiniSudokuBoardState {
  return {
    grid: cloneGrid(puzzle.initial),
    notes: createEmptyNotes(),
    history: [],
  };
}

/**
 * Place a permanent digit (1..6) in a cell.
 * - If the cell already has that same digit, clears it (toggle off).
 * - Clears all pencil notes in the placed cell.
 * - Automatically removes `digit` from pencil notes in the same row, column, and 2x3 block.
 * - Computes any newly completed & 100%-correct units (row, col, block) for wave animation.
 */
export function placeMiniSudokuNumber(
  state: MiniSudokuBoardState,
  puzzle: MiniSudokuPuzzle,
  r: number,
  c: number,
  digit: MiniSudokuDigit
): {
  nextState: MiniSudokuBoardState;
  changed: boolean;
  placed: boolean;
  newlyCompletedUnits: CompletedUnit[];
} {
  if (isLockedCell(puzzle, r, c)) {
    return {
      nextState: state,
      changed: false,
      placed: false,
      newlyCompletedUnits: [],
    };
  }

  const prevVal = state.grid[r][c];
  const nextVal: MiniSudokuValue = prevVal === digit ? 0 : digit;

  const prevUnits = getCompletedCorrectUnitKeys(state.grid, puzzle.solution);

  const nextGrid = cloneGrid(state.grid);
  const nextNotes = cloneNotes(state.notes);

  nextGrid[r][c] = nextVal;

  if (nextVal !== 0) {
    // Clear notes inside the placed cell
    nextNotes[r][c] = 0;

    // Auto-clear `nextVal` from pencil notes in the same row, column, and 2x3 block
    const bitClear = ~(1 << nextVal);
    for (let i = 0; i < 6; i++) {
      nextNotes[r][i] &= bitClear;
      nextNotes[i][c] &= bitClear;
    }
    const [br, bc] = getBlockOrigin(getBlockIndex(r, c));
    for (let dr = 0; dr < 2; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        nextNotes[br + dr][bc + dc] &= bitClear;
      }
    }
  }

  const nextHistory = [
    ...state.history.slice(-(MAX_HISTORY - 1)),
    { grid: cloneGrid(state.grid), notes: cloneNotes(state.notes) },
  ];

  const newlyCompletedUnits: CompletedUnit[] = [];
  if (nextVal !== 0) {
    // Check row r
    if (
      !prevUnits.has(`row-${r}`) &&
      isRowCorrectlyComplete(nextGrid, puzzle.solution, r)
    ) {
      newlyCompletedUnits.push({
        type: "row",
        index: r,
        cells: Array.from({ length: 6 }, (_, col) => [r, col]),
      });
    }
    // Check col c
    if (
      !prevUnits.has(`col-${c}`) &&
      isColCorrectlyComplete(nextGrid, puzzle.solution, c)
    ) {
      newlyCompletedUnits.push({
        type: "col",
        index: c,
        cells: Array.from({ length: 6 }, (_, row) => [row, c]),
      });
    }
    // Check 2x3 block
    const bIdx = getBlockIndex(r, c);
    if (
      !prevUnits.has(`block-${bIdx}`) &&
      isBlockCorrectlyComplete(nextGrid, puzzle.solution, bIdx)
    ) {
      newlyCompletedUnits.push({
        type: "block",
        index: bIdx,
        cells: getBlockCells(bIdx),
      });
    }
  }

  return {
    nextState: {
      grid: nextGrid,
      notes: nextNotes,
      history: nextHistory,
    },
    changed: true,
    placed: nextVal !== 0,
    newlyCompletedUnits,
  };
}

/** Toggle a pencil candidate digit (1..6) inside an empty unlocked cell */
export function toggleMiniSudokuNote(
  state: MiniSudokuBoardState,
  puzzle: MiniSudokuPuzzle,
  r: number,
  c: number,
  digit: MiniSudokuDigit
): { nextState: MiniSudokuBoardState; changed: boolean } {
  if (isLockedCell(puzzle, r, c)) {
    return { nextState: state, changed: false };
  }

  // If cell already has a permanent value, clear it first and add note
  const nextGrid = cloneGrid(state.grid);
  const nextNotes = cloneNotes(state.notes);

  if (nextGrid[r][c] !== 0) {
    nextGrid[r][c] = 0;
  }

  nextNotes[r][c] ^= 1 << digit;

  const nextHistory = [
    ...state.history.slice(-(MAX_HISTORY - 1)),
    { grid: cloneGrid(state.grid), notes: cloneNotes(state.notes) },
  ];

  return {
    nextState: {
      grid: nextGrid,
      notes: nextNotes,
      history: nextHistory,
    },
    changed: true,
  };
}

/** Erase the permanent digit or pencil notes in a cell */
export function eraseMiniSudokuCell(
  state: MiniSudokuBoardState,
  puzzle: MiniSudokuPuzzle,
  r: number,
  c: number
): { nextState: MiniSudokuBoardState; changed: boolean } {
  if (isLockedCell(puzzle, r, c)) {
    return { nextState: state, changed: false };
  }
  if (state.grid[r][c] === 0 && state.notes[r][c] === 0) {
    return { nextState: state, changed: false };
  }

  const nextGrid = cloneGrid(state.grid);
  const nextNotes = cloneNotes(state.notes);
  nextGrid[r][c] = 0;
  nextNotes[r][c] = 0;

  const nextHistory = [
    ...state.history.slice(-(MAX_HISTORY - 1)),
    { grid: cloneGrid(state.grid), notes: cloneNotes(state.notes) },
  ];

  return {
    nextState: {
      grid: nextGrid,
      notes: nextNotes,
      history: nextHistory,
    },
    changed: true,
  };
}

export function undoMiniSudokuMove(
  state: MiniSudokuBoardState
): MiniSudokuBoardState {
  if (state.history.length === 0) return state;
  const previous = state.history[state.history.length - 1];
  return {
    grid: cloneGrid(previous.grid),
    notes: cloneNotes(previous.notes),
    history: state.history.slice(0, -1),
  };
}

export function resetMiniSudokuBoard(
  state: MiniSudokuBoardState,
  puzzle: MiniSudokuPuzzle
): MiniSudokuBoardState {
  const hasProgress = state.grid.some((row, r) =>
    row.some((val, c) => val !== puzzle.initial[r][c] || state.notes[r][c] !== 0)
  );
  if (!hasProgress) return state;

  return {
    grid: cloneGrid(puzzle.initial),
    notes: createEmptyNotes(),
    history: [
      ...state.history.slice(-(MAX_HISTORY - 1)),
      { grid: cloneGrid(state.grid), notes: cloneNotes(state.notes) },
    ],
  };
}

/** Returns keys of all cells currently participating in a row, col, or 2x3 block duplicate */
export function findMiniSudokuConflicts(
  grid: MiniSudokuValue[][]
): Set<string> {
  const conflicts = new Set<string>();

  // Rows
  for (let r = 0; r < 6; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      const cols = seen.get(v) ?? [];
      cols.push(c);
      seen.set(v, cols);
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) {
        for (const c of cols) conflicts.add(cellKey(r, c));
      }
    }
  }

  // Columns
  for (let c = 0; c < 6; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 6; r++) {
      const v = grid[r][c];
      if (v === 0) continue;
      const rows = seen.get(v) ?? [];
      rows.push(r);
      seen.set(v, rows);
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) {
        for (const r of rows) conflicts.add(cellKey(r, c));
      }
    }
  }

  // 2x3 Blocks
  for (let b = 0; b < 6; b++) {
    const seen = new Map<number, [number, number][]>();
    for (const [r, c] of getBlockCells(b)) {
      const v = grid[r][c];
      if (v === 0) continue;
      const list = seen.get(v) ?? [];
      list.push([r, c]);
      seen.set(v, list);
    }
    for (const cells of seen.values()) {
      if (cells.length > 1) {
        for (const [r, c] of cells) conflicts.add(cellKey(r, c));
      }
    }
  }

  return conflicts;
}

/**
 * Returns the set of digits (1..6) that have all 6 instances placed on the board
 * with zero conflicts involving that digit.
 */
export function getCompletedDigits(
  grid: MiniSudokuValue[][],
  conflicts: Set<string>
): Set<MiniSudokuDigit> {
  const counts = new Array<number>(7).fill(0);
  const conflictedDigits = new Set<number>();

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      counts[v]++;
      if (conflicts.has(cellKey(r, c))) {
        conflictedDigits.add(v);
      }
    }
  }

  const completed = new Set<MiniSudokuDigit>();
  for (let d = 1; d <= 6; d++) {
    if (counts[d] === 6 && !conflictedDigits.has(d)) {
      completed.add(d as MiniSudokuDigit);
    }
  }
  return completed;
}

export function isRowCorrectlyComplete(
  grid: MiniSudokuValue[][],
  solution: MiniSudokuDigit[][],
  r: number
): boolean {
  for (let c = 0; c < 6; c++) {
    if (grid[r][c] !== solution[r][c]) return false;
  }
  return true;
}

export function isColCorrectlyComplete(
  grid: MiniSudokuValue[][],
  solution: MiniSudokuDigit[][],
  c: number
): boolean {
  for (let r = 0; r < 6; r++) {
    if (grid[r][c] !== solution[r][c]) return false;
  }
  return true;
}

export function isBlockCorrectlyComplete(
  grid: MiniSudokuValue[][],
  solution: MiniSudokuDigit[][],
  blockIdx: number
): boolean {
  for (const [r, c] of getBlockCells(blockIdx)) {
    if (grid[r][c] !== solution[r][c]) return false;
  }
  return true;
}

export function getCompletedCorrectUnitKeys(
  grid: MiniSudokuValue[][],
  solution: MiniSudokuDigit[][]
): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < 6; i++) {
    if (isRowCorrectlyComplete(grid, solution, i)) keys.add(`row-${i}`);
    if (isColCorrectlyComplete(grid, solution, i)) keys.add(`col-${i}`);
    if (isBlockCorrectlyComplete(grid, solution, i)) keys.add(`block-${i}`);
  }
  return keys;
}

export function countFilledCells(grid: MiniSudokuValue[][]): number {
  let count = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

export function isMiniSudokuSolved(
  grid: MiniSudokuValue[][],
  puzzle: MiniSudokuPuzzle
): boolean {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== puzzle.solution[r][c]) return false;
    }
  }
  return true;
}

export function generateMiniSudokuShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  difficulty: MiniSudokuDifficulty;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  initial: MiniSudokuValue[][];
}): string {
  const header =
    params.mode === "daily"
      ? `Pola Mini Sudoku · ${params.dateStr}`
      : `Pola Mini Sudoku · ${params.difficulty.toUpperCase()}`;

  const meta = `⏱️ ${formatTime(params.totalSeconds)} | 💡 ${
    params.hintsUsed
  } | 🔥 ${params.streak}`;

  // Clean 6x6 emerald/mint grid showing clues vs solved cells
  const gridLines = params.initial.map((row) =>
    row.map((v) => (v !== 0 ? "⬜" : "🟩")).join("")
  );

  return `${header}\n${meta}\n\n${gridLines.join("\n")}`;
}
