import type {
  TangoBoardState,
  TangoCellValue,
  TangoConstraint,
  TangoDifficulty,
  TangoPuzzle,
  TangoViolations,
  TangoVisualMode,
} from "./types";
import { formatTime } from "@/lib/games/queens/engine";

export function cloneGrid(grid: TangoCellValue[][]): TangoCellValue[][] {
  return grid.map((row) => [...row]);
}

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function constraintKey(c: TangoConstraint): string {
  return `${c.r1},${c.c1}-${c.r2},${c.c2}`;
}

export function createInitialTangoState(puzzle: TangoPuzzle): TangoBoardState {
  return {
    grid: cloneGrid(puzzle.initial),
    history: [],
  };
}

export function isLockedCell(
  puzzle: TangoPuzzle,
  r: number,
  c: number
): boolean {
  return puzzle.initial[r][c] !== 0;
}

/**
 * Cycle unlocked cell: Empty (0) -> Sun (1) -> Moon (2) -> Empty (0)
 */
export function tapTangoCell(
  state: TangoBoardState,
  puzzle: TangoPuzzle,
  r: number,
  c: number
): { nextState: TangoBoardState; nextValue: TangoCellValue; changed: boolean } {
  if (isLockedCell(puzzle, r, c)) {
    return { nextState: state, nextValue: state.grid[r][c], changed: false };
  }

  const prevVal = state.grid[r][c];
  const nextVal: TangoCellValue = prevVal === 0 ? 1 : prevVal === 1 ? 2 : 0;

  const nextGrid = cloneGrid(state.grid);
  nextGrid[r][c] = nextVal;

  return {
    nextState: {
      grid: nextGrid,
      history: [...state.history.slice(-49), cloneGrid(state.grid)],
    },
    nextValue: nextVal,
    changed: true,
  };
}

export function undoTangoMove(state: TangoBoardState): TangoBoardState {
  if (state.history.length === 0) return state;
  const prevGrid = state.history[state.history.length - 1];
  return {
    grid: prevGrid,
    history: state.history.slice(0, -1),
  };
}

export function resetTangoBoard(
  state: TangoBoardState,
  puzzle: TangoPuzzle
): TangoBoardState {
  const initialGrid = cloneGrid(puzzle.initial);
  let hasDiff = false;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (state.grid[r][c] !== initialGrid[r][c]) {
        hasDiff = true;
        break;
      }
    }
    if (hasDiff) break;
  }
  if (!hasDiff) return state;

  return {
    grid: initialGrid,
    history: [...state.history.slice(-49), cloneGrid(state.grid)],
  };
}

export function countFilledCells(grid: TangoCellValue[][]): number {
  let count = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

/**
 * Finds all current rule violations:
 * 1. More than 3 of the same symbol in any row or column
 * 2. More than 2 identical symbols adjacent horizontally or vertically
 * 3. Any = or × constraint violated by two filled adjacent cells
 */
export function findTangoViolations(
  grid: TangoCellValue[][],
  constraints: TangoConstraint[]
): TangoViolations {
  const cells = new Set<string>();
  const violatedConstraints = new Set<string>();

  // Rows
  for (let r = 0; r < 6; r++) {
    let c1 = 0;
    let c2 = 0;
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] === 1) c1++;
      else if (grid[r][c] === 2) c2++;
    }
    if (c1 > 3) {
      for (let c = 0; c < 6; c++) if (grid[r][c] === 1) cells.add(cellKey(r, c));
    }
    if (c2 > 3) {
      for (let c = 0; c < 6; c++) if (grid[r][c] === 2) cells.add(cellKey(r, c));
    }
    for (let c = 0; c < 4; c++) {
      const v = grid[r][c];
      if (v !== 0 && v === grid[r][c + 1] && v === grid[r][c + 2]) {
        cells.add(cellKey(r, c));
        cells.add(cellKey(r, c + 1));
        cells.add(cellKey(r, c + 2));
      }
    }
  }

  // Columns
  for (let c = 0; c < 6; c++) {
    let c1 = 0;
    let c2 = 0;
    for (let r = 0; r < 6; r++) {
      if (grid[r][c] === 1) c1++;
      else if (grid[r][c] === 2) c2++;
    }
    if (c1 > 3) {
      for (let r = 0; r < 6; r++) if (grid[r][c] === 1) cells.add(cellKey(r, c));
    }
    if (c2 > 3) {
      for (let r = 0; r < 6; r++) if (grid[r][c] === 2) cells.add(cellKey(r, c));
    }
    for (let r = 0; r < 4; r++) {
      const v = grid[r][c];
      if (v !== 0 && v === grid[r + 1][c] && v === grid[r + 2][c]) {
        cells.add(cellKey(r, c));
        cells.add(cellKey(r + 1, c));
        cells.add(cellKey(r + 2, c));
      }
    }
  }

  // Edge constraints
  for (const con of constraints) {
    const v1 = grid[con.r1][con.c1];
    const v2 = grid[con.r2][con.c2];
    if (v1 === 0 || v2 === 0) continue;
    const violated =
      (con.type === "same" && v1 !== v2) || (con.type === "diff" && v1 === v2);
    if (violated) {
      cells.add(cellKey(con.r1, con.c1));
      cells.add(cellKey(con.r2, con.c2));
      violatedConstraints.add(constraintKey(con));
    }
  }

  return { cells, constraints: violatedConstraints };
}

export function isTangoSolved(
  grid: TangoCellValue[][],
  puzzle: TangoPuzzle
): boolean {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  const { cells, constraints } = findTangoViolations(grid, puzzle.constraints);
  return cells.size === 0 && constraints.size === 0;
}

export function generateTangoShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  difficulty: TangoDifficulty;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  visualMode: TangoVisualMode;
  solution: TangoCellValue[][];
}): string {
  const header =
    params.mode === "daily"
      ? `Pola · Tango ${params.dateStr}`
      : `Pola · Tango Unlimited (${params.difficulty})`;

  const s1 = params.visualMode === "icons" ? "☀️" : "🟠";
  const s2 = params.visualMode === "icons" ? "🌙" : "🔵";

  const miniGrid = params.solution
    .slice(0, 3)
    .map((row) => row.map((v) => (v === 1 ? s1 : s2)).join(""))
    .join("\n");

  const hintsPart =
    params.hintsUsed === 0 ? "0 hints" : `${params.hintsUsed} hint${params.hintsUsed > 1 ? "s" : ""}`;

  return `${header}\n⏱ ${formatTime(params.totalSeconds)} · 💡 ${hintsPart} · 🔥 ${params.streak}\n${miniGrid}`;
}
