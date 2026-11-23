import {
  getPatchColor,
  type PatchClue,
  type PatchRect,
  type PatchesBoardState,
  type PatchesPuzzle,
  type PlayerPatch,
} from "./types";

export function normalizeRect(
  rA: number,
  cA: number,
  rB: number,
  cB: number
): PatchRect {
  return {
    r1: Math.min(rA, rB),
    c1: Math.min(cA, cB),
    r2: Math.max(rA, rB),
    c2: Math.max(cA, cB),
  };
}

export function getRectDimensions(rect: PatchRect): {
  width: number;
  height: number;
  area: number;
} {
  const width = rect.c2 - rect.c1 + 1;
  const height = rect.r2 - rect.r1 + 1;
  return { width, height, area: width * height };
}

export function rectContainsCell(
  rect: PatchRect,
  row: number,
  col: number
): boolean {
  return row >= rect.r1 && row <= rect.r2 && col >= rect.c1 && col <= rect.c2;
}

export function rectsOverlap(a: PatchRect, b: PatchRect): boolean {
  return a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1;
}

export function rectsEqual(a: PatchRect, b: PatchRect): boolean {
  return a.r1 === b.r1 && a.c1 === b.c1 && a.r2 === b.r2 && a.c2 === b.c2;
}

export function clonePatches(
  patches: Record<string, PlayerPatch>
): Record<string, PlayerPatch> {
  const out: Record<string, PlayerPatch> = {};
  for (const [k, v] of Object.entries(patches)) {
    out[k] = {
      clueId: v.clueId,
      rect: { ...v.rect },
      locked: v.locked,
    };
  }
  return out;
}

export function createInitialBoardState(): PatchesBoardState {
  return {
    patches: {},
    history: [],
  };
}

export interface RectCheckResult {
  valid: boolean;
  hasConflict: boolean;
  reason?: "other_clue" | "overlap" | "missing_clue" | "shape" | "area";
  width: number;
  height: number;
  area: number;
}

/**
 * Evaluate a candidate rectangle being drawn for a given clue against
 * the puzzle rules and existing patches on the board.
 */
export function evaluateCandidateRect(
  puzzle: PatchesPuzzle,
  clue: PatchClue,
  rect: PatchRect,
  existingPatches: Record<string, PlayerPatch>
): RectCheckResult {
  const { width, height, area } = getRectDimensions(rect);

  if (!rectContainsCell(rect, clue.row, clue.col)) {
    return { valid: false, hasConflict: true, reason: "missing_clue", width, height, area };
  }

  // Must not contain any other clue cell
  for (const other of puzzle.clues) {
    if (other.id !== clue.id && rectContainsCell(rect, other.row, other.col)) {
      return { valid: false, hasConflict: true, reason: "other_clue", width, height, area };
    }
  }

  // Must not overlap any other placed patch
  for (const [otherId, patch] of Object.entries(existingPatches)) {
    if (otherId !== clue.id && rectsOverlap(rect, patch.rect)) {
      return { valid: false, hasConflict: true, reason: "overlap", width, height, area };
    }
  }

  // Check shape constraint
  if (clue.shape === "square" && width !== height) {
    return { valid: false, hasConflict: false, reason: "shape", width, height, area };
  }
  if (clue.shape === "horizontal" && width <= height) {
    return { valid: false, hasConflict: false, reason: "shape", width, height, area };
  }
  if (clue.shape === "vertical" && height <= width) {
    return { valid: false, hasConflict: false, reason: "shape", width, height, area };
  }

  // Check area constraint (when numbered)
  if (clue.area !== null && area !== clue.area) {
    return { valid: false, hasConflict: false, reason: "area", width, height, area };
  }

  return { valid: true, hasConflict: false, width, height, area };
}

export interface PatchesValidation {
  validPatchCount: number;
  totalClues: number;
  coveredCells: number;
  totalCells: number;
  isSolved: boolean;
}

export function validateBoard(
  puzzle: PatchesPuzzle,
  patches: Record<string, PlayerPatch>
): PatchesValidation {
  const n = puzzle.size;
  const totalCells = n * n;
  const occupied = new Uint8Array(totalCells);
  let hasOverlap = false;
  let validPatchCount = 0;

  for (const clue of puzzle.clues) {
    const patch = patches[clue.id];
    if (!patch) continue;

    const check = evaluateCandidateRect(puzzle, clue, patch.rect, patches);
    if (check.valid) {
      validPatchCount++;
    }

    for (let r = patch.rect.r1; r <= patch.rect.r2; r++) {
      for (let c = patch.rect.c1; c <= patch.rect.c2; c++) {
        const idx = r * n + c;
        if (occupied[idx] > 0) hasOverlap = true;
        occupied[idx] = 1;
      }
    }
  }

  let coveredCells = 0;
  for (let i = 0; i < totalCells; i++) {
    if (occupied[i] === 1) coveredCells++;
  }

  const isSolved =
    !hasOverlap &&
    coveredCells === totalCells &&
    validPatchCount === puzzle.clues.length;

  return {
    validPatchCount,
    totalClues: puzzle.clues.length,
    coveredCells,
    totalCells,
    isSolved,
  };
}

export interface FreeRectCheckResult {
  status: "neutral" | "valid" | "error" | "conflict";
  clue: PatchClue | null;
  valid: boolean;
  hasConflict: boolean;
  reason?: "multiple_clues" | "overlap" | "locked" | "shape" | "area";
  width: number;
  height: number;
  area: number;
}

export function getCluesInRect(
  puzzle: PatchesPuzzle,
  rect: PatchRect
): PatchClue[] {
  return puzzle.clues.filter((c) => rectContainsCell(rect, c.row, c.col));
}

/**
 * Evaluate a free-drawn rectangle starting from ANY cell on the board.
 * - 0 clues inside: neutral outline (conflict if overlapping an existing patch).
 * - 2+ clues inside: conflict (red), cannot commit.
 * - 1 clue inside: links to that clue; conflict if locked or overlapping another patch;
 *   valid if shape + area match; error if shape or area violate the clue constraint.
 */
export function evaluateFreeRect(
  puzzle: PatchesPuzzle,
  rect: PatchRect,
  existingPatches: Record<string, PlayerPatch>
): FreeRectCheckResult {
  const { width, height, area } = getRectDimensions(rect);
  const enclosed = getCluesInRect(puzzle, rect);

  if (enclosed.length === 0) {
    const overlapsAny = Object.values(existingPatches).some((p) =>
      rectsOverlap(rect, p.rect)
    );
    return {
      status: overlapsAny ? "conflict" : "neutral",
      clue: null,
      valid: false,
      hasConflict: overlapsAny,
      reason: overlapsAny ? "overlap" : undefined,
      width,
      height,
      area,
    };
  }

  if (enclosed.length > 1) {
    return {
      status: "conflict",
      clue: null,
      valid: false,
      hasConflict: true,
      reason: "multiple_clues",
      width,
      height,
      area,
    };
  }

  const clue = enclosed[0];
  if (existingPatches[clue.id]?.locked) {
    return {
      status: "conflict",
      clue,
      valid: false,
      hasConflict: true,
      reason: "locked",
      width,
      height,
      area,
    };
  }

  // Must not overlap any OTHER placed patch
  for (const [otherId, patch] of Object.entries(existingPatches)) {
    if (otherId !== clue.id && rectsOverlap(rect, patch.rect)) {
      return {
        status: "conflict",
        clue,
        valid: false,
        hasConflict: true,
        reason: "overlap",
        width,
        height,
        area,
      };
    }
  }

  // Check shape constraint
  if (clue.shape === "square" && width !== height) {
    return {
      status: "error",
      clue,
      valid: false,
      hasConflict: false,
      reason: "shape",
      width,
      height,
      area,
    };
  }
  if (clue.shape === "horizontal" && width <= height) {
    return {
      status: "error",
      clue,
      valid: false,
      hasConflict: false,
      reason: "shape",
      width,
      height,
      area,
    };
  }
  if (clue.shape === "vertical" && height <= width) {
    return {
      status: "error",
      clue,
      valid: false,
      hasConflict: false,
      reason: "shape",
      width,
      height,
      area,
    };
  }

  // Check area constraint (when numbered)
  if (clue.area !== null && area !== clue.area) {
    return {
      status: "error",
      clue,
      valid: false,
      hasConflict: false,
      reason: "area",
      width,
      height,
      area,
    };
  }

  return {
    status: "valid",
    clue,
    valid: true,
    hasConflict: false,
    width,
    height,
    area,
  };
}

export function commitPatch(
  state: PatchesBoardState,
  puzzle: PatchesPuzzle,
  clueId: string,
  rect: PatchRect
): { nextState: PatchesBoardState; committed: boolean; isValid: boolean } {
  const clue = puzzle.clues.find((c) => c.id === clueId);
  if (!clue) return { nextState: state, committed: false, isValid: false };

  const existing = state.patches[clueId];
  if (existing?.locked) {
    return { nextState: state, committed: false, isValid: false };
  }

  const check = evaluateCandidateRect(puzzle, clue, rect, state.patches);
  // Reject hard conflicts (overlapping another patch or containing another clue),
  // but ALLOW committing invalid shape/area patches so they stay rendered in Error State!
  if (check.hasConflict) {
    return { nextState: state, committed: false, isValid: false };
  }

  if (existing && rectsEqual(existing.rect, rect)) {
    return { nextState: state, committed: false, isValid: check.valid };
  }

  const nextPatches = clonePatches(state.patches);
  nextPatches[clueId] = { clueId, rect: { ...rect }, locked: false };

  return {
    nextState: {
      patches: nextPatches,
      history: [...state.history.slice(-49), clonePatches(state.patches)],
    },
    committed: true,
    isValid: check.valid,
  };
}

export function removePatch(
  state: PatchesBoardState,
  clueId: string
): { nextState: PatchesBoardState; removed: boolean } {
  const existing = state.patches[clueId];
  if (!existing || existing.locked) {
    return { nextState: state, removed: false };
  }

  const nextPatches = clonePatches(state.patches);
  delete nextPatches[clueId];

  return {
    nextState: {
      patches: nextPatches,
      history: [...state.history.slice(-49), clonePatches(state.patches)],
    },
    removed: true,
  };
}

export function undoMove(state: PatchesBoardState): PatchesBoardState {
  if (state.history.length === 0) return state;
  const previous = state.history[state.history.length - 1];
  return {
    patches: previous,
    history: state.history.slice(0, -1),
  };
}

export function resetBoard(state: PatchesBoardState): PatchesBoardState {
  const hasUnlocked = Object.values(state.patches).some((p) => !p.locked);
  if (!hasUnlocked) return state;

  const nextPatches: Record<string, PlayerPatch> = {};
  for (const [k, v] of Object.entries(state.patches)) {
    if (v.locked) {
      nextPatches[k] = { ...v, rect: { ...v.rect } };
    }
  }

  return {
    patches: nextPatches,
    history: [...state.history.slice(-49), clonePatches(state.patches)],
  };
}

export type PatchesHintResult =
  | {
      type: "wrong_patch";
      wrongClueId: string;
      nextState: PatchesBoardState;
    }
  | {
      type: "locked_patch";
      clueId: string;
      nextState: PatchesBoardState;
    }
  | {
      type: "already_solved";
      nextState: PatchesBoardState;
    };

/**
 * Hint Engine:
 * 1. First checks if any player-drawn patch does NOT match its exact solution.
 *    If so, flags that patch so the player can clear/fix it (no time penalty).
 * 2. Otherwise, picks 1 unsolved clue, draws & locks its exact solution rectangle (+10s penalty).
 */
export function applyHint(
  state: PatchesBoardState,
  puzzle: PatchesPuzzle
): PatchesHintResult {
  // 1. Check for incorrect player-drawn patches first
  for (const clue of puzzle.clues) {
    const patch = state.patches[clue.id];
    if (patch && !patch.locked && !rectsEqual(patch.rect, clue.solution)) {
      return {
        type: "wrong_patch",
        wrongClueId: clue.id,
        nextState: state,
      };
    }
  }

  // 2. Find unsolved clues
  const unsolved = puzzle.clues.filter((clue) => {
    const patch = state.patches[clue.id];
    return !patch || !rectsEqual(patch.rect, clue.solution);
  });

  if (unsolved.length === 0) {
    return { type: "already_solved", nextState: state };
  }

  // Pick a helpful unsolved clue (prefer unnumbered clues on Hard/Expert or random)
  const unnumbered = unsolved.filter((c) => c.area === null);
  const pool = unnumbered.length > 0 ? unnumbered : unsolved;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const nextPatches = clonePatches(state.patches);
  // Remove any unlocked patch that might overlap (safety guard)
  for (const [otherId, patch] of Object.entries(nextPatches)) {
    if (
      otherId !== chosen.id &&
      !patch.locked &&
      rectsOverlap(patch.rect, chosen.solution)
    ) {
      delete nextPatches[otherId];
    }
  }

  nextPatches[chosen.id] = {
    clueId: chosen.id,
    rect: { ...chosen.solution },
    locked: true,
  };

  return {
    type: "locked_patch",
    clueId: chosen.id,
    nextState: {
      patches: nextPatches,
      history: [...state.history.slice(-49), clonePatches(state.patches)],
    },
  };
}

export function generatePatchesShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  puzzle: PatchesPuzzle;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  formatTime: (s: number) => string;
}): string {
  const { mode, dateStr, puzzle, totalSeconds, hintsUsed, streak, formatTime } =
    params;
  const header =
    mode === "daily"
      ? `Pola · Patches ${dateStr}`
      : `Pola · Patches (${puzzle.size}×${puzzle.size})`;

  const n = puzzle.size;
  const grid: string[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => "⬜")
  );

  for (const clue of puzzle.clues) {
    const emoji = getPatchColor(clue.colorIndex).emoji;
    const { r1, c1, r2, c2 } = clue.solution;
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        grid[r][c] = emoji;
      }
    }
  }

  const boardLines = grid.map((row) => row.join("")).join("\n");
  const hintSuffix = hintsUsed > 0 ? ` · 💡 ${hintsUsed}` : "";
  const streakSuffix =
    mode === "daily" && streak > 0 ? ` · 🔥 ${streak}` : "";

  return `${header}\n⏱️ ${formatTime(totalSeconds)}${hintSuffix}${streakSuffix}\n\n${boardLines}`;
}
