import type {
  ZipBoardState,
  ZipCoord,
  ZipPuzzle,
  ZipWall,
  ZipWaypoint,
} from "./types";
import { formatTime } from "@/lib/games/queens/engine";

const MAX_HISTORY = 80;

export function coordKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function wallKey(r1: number, c1: number, r2: number, c2: number): string {
  if (r1 < r2 || (r1 === r2 && c1 < c2)) {
    return `${r1},${c1}|${r2},${c2}`;
  }
  return `${r2},${c2}|${r1},${c1}`;
}

export function buildWallSet(walls: ZipWall[]): Set<string> {
  const set = new Set<string>();
  for (const [r1, c1, r2, c2] of walls) {
    set.add(wallKey(r1, c1, r2, c2));
  }
  return set;
}

export function buildWaypointMap(waypoints: ZipWaypoint[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const wp of waypoints) {
    map.set(coordKey(wp.row, wp.col), wp.num);
  }
  return map;
}

export function isAdjacent(a: ZipCoord, b: ZipCoord): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

export function hasWallBetween(
  wallSet: Set<string>,
  a: ZipCoord,
  b: ZipCoord
): boolean {
  return wallSet.has(wallKey(a[0], a[1], b[0], b[1]));
}

export function getHighestWaypointReached(
  path: ZipCoord[],
  waypointMap: Map<string, number>
): number {
  let highest = 1;
  for (const [r, c] of path) {
    const wp = waypointMap.get(coordKey(r, c));
    if (wp !== undefined && wp > highest) {
      highest = wp;
    }
  }
  return highest;
}

export function createInitialZipState(puzzle: ZipPuzzle): ZipBoardState {
  const start =
    puzzle.waypoints.find((w) => w.num === 1) ?? puzzle.waypoints[0];
  return {
    path: [[start.row, start.col]],
    history: [],
  };
}

export function pushZipSnapshot(state: ZipBoardState): ZipBoardState {
  const snapshot = state.path.map(([r, c]): ZipCoord => [r, c]);
  const nextHistory =
    state.history.length >= MAX_HISTORY
      ? [...state.history.slice(1), snapshot]
      : [...state.history, snapshot];
  return {
    ...state,
    history: nextHistory,
  };
}

export interface StepResult {
  nextPath: ZipCoord[];
  action: "extend" | "backtrack" | "blocked" | "noop";
  reachedWaypoint: number | null;
}

/**
 * Attempt to move the tip of the path to `target`.
 * Supports:
 * - Single-step backtracking onto path[path.length - 2]
 * - Single-step extension to a 4-directionally adjacent cell
 * - Straight-line interpolation for fast mobile swipes (row or col aligned)
 * Strictly enforces wall barriers, no duplicate visits, and ascending waypoints 1..K.
 */
export function tryStepToCell(
  path: ZipCoord[],
  target: ZipCoord,
  puzzle: ZipPuzzle,
  wallSet: Set<string>,
  waypointMap: Map<string, number>
): StepResult {
  if (path.length === 0) {
    return { nextPath: path, action: "noop", reachedWaypoint: null };
  }

  const tip = path[path.length - 1];
  if (tip[0] === target[0] && tip[1] === target[1]) {
    return { nextPath: path, action: "noop", reachedWaypoint: null };
  }

  // Smooth backtrack onto previous cell
  if (path.length >= 2) {
    const prev = path[path.length - 2];
    if (prev[0] === target[0] && prev[1] === target[1]) {
      return {
        nextPath: path.slice(0, -1),
        action: "backtrack",
        reachedWaypoint: null,
      };
    }
  }

  // Must be on the same row or column to step / interpolate
  const dr = target[0] - tip[0];
  const dc = target[1] - tip[1];
  if (dr !== 0 && dc !== 0) {
    return { nextPath: path, action: "noop", reachedWaypoint: null };
  }

  const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  const dist = Math.abs(dr) + Math.abs(dc);

  const visited = new Set<string>(path.map(([r, c]) => coordKey(r, c)));
  let highestWp = getHighestWaypointReached(path, waypointMap);
  const maxWp = puzzle.waypoints.length;

  const working = path.slice();
  let reachedWaypoint: number | null = null;
  let moved = false;

  for (let s = 1; s <= dist; s++) {
    const curr = working[working.length - 1];
    const next: ZipCoord = [curr[0] + stepR, curr[1] + stepC];

    if (
      next[0] < 0 ||
      next[0] >= puzzle.size ||
      next[1] < 0 ||
      next[1] >= puzzle.size
    ) {
      break;
    }

    // Cannot cross a wall
    if (hasWallBetween(wallSet, curr, next)) {
      if (!moved) {
        return { nextPath: path, action: "blocked", reachedWaypoint: null };
      }
      break;
    }

    const nextKey = coordKey(next[0], next[1]);

    // Cannot revisit a cell
    if (visited.has(nextKey)) {
      if (!moved) {
        return { nextPath: path, action: "noop", reachedWaypoint: null };
      }
      break;
    }

    // Cannot extend past final waypoint K
    const currWp = waypointMap.get(coordKey(curr[0], curr[1]));
    if (currWp === maxWp) {
      if (!moved) {
        return { nextPath: path, action: "blocked", reachedWaypoint: null };
      }
      break;
    }

    // Strict ascending waypoint order
    const nextWp = waypointMap.get(nextKey);
    if (nextWp !== undefined) {
      if (nextWp !== highestWp + 1) {
        if (!moved) {
          return { nextPath: path, action: "blocked", reachedWaypoint: null };
        }
        break;
      }
      highestWp = nextWp;
      reachedWaypoint = nextWp;
    }

    working.push(next);
    visited.add(nextKey);
    moved = true;
  }

  if (!moved) {
    return { nextPath: path, action: "noop", reachedWaypoint: null };
  }

  return {
    nextPath: working,
    action: "extend",
    reachedWaypoint,
  };
}

/**
 * Trim the path back to an already-visited cell (when tapped).
 */
export function trimPathToCell(
  state: ZipBoardState,
  target: ZipCoord
): { nextState: ZipBoardState; trimmed: boolean } {
  const idx = state.path.findIndex(
    ([r, c]) => r === target[0] && c === target[1]
  );
  if (idx < 0 || idx === state.path.length - 1) {
    return { nextState: state, trimmed: false };
  }
  const withSnap = pushZipSnapshot(state);
  return {
    nextState: {
      ...withSnap,
      path: state.path.slice(0, idx + 1),
    },
    trimmed: true,
  };
}

/**
 * Check win condition:
 * Path visits every cell (length === size * size) and ends at final waypoint K.
 */
export function isZipSolved(path: ZipCoord[], puzzle: ZipPuzzle): boolean {
  const totalCells = puzzle.size * puzzle.size;
  if (path.length !== totalCells) return false;
  const last = path[path.length - 1];
  const finalWp = puzzle.waypoints[puzzle.waypoints.length - 1];
  return last[0] === finalWp.row && last[1] === finalWp.col;
}

/**
 * Smart Hint:
 * Compare current path against solutionPath.
 * - If the player diverged, trim back to the last correct cell and add 1 correct next step.
 * - If already on track, add 1 correct next step.
 */
export function applyZipHint(
  state: ZipBoardState,
  puzzle: ZipPuzzle,
  waypointMap: Map<string, number>
): {
  nextState: ZipBoardState;
  reachedWaypoint: number | null;
  changed: boolean;
} {
  const sol = puzzle.solutionPath;
  if (sol.length === 0) {
    return { nextState: state, reachedWaypoint: null, changed: false };
  }

  // Longest matching prefix with solutionPath
  let matchLen = 0;
  const minLen = Math.min(state.path.length, sol.length);
  while (
    matchLen < minLen &&
    state.path[matchLen][0] === sol[matchLen][0] &&
    state.path[matchLen][1] === sol[matchLen][1]
  ) {
    matchLen++;
  }

  if (matchLen >= sol.length) {
    return { nextState: state, reachedWaypoint: null, changed: false };
  }

  // Ensure at least waypoint 1 is included
  const baseLen = Math.max(1, matchLen);
  const nextLen = Math.min(sol.length, baseLen + 1);
  const nextPath = sol.slice(0, nextLen).map(([r, c]): ZipCoord => [r, c]);

  const addedCell = nextPath[nextPath.length - 1];
  const wp = waypointMap.get(coordKey(addedCell[0], addedCell[1])) ?? null;

  const withSnap = pushZipSnapshot(state);
  return {
    nextState: {
      ...withSnap,
      path: nextPath,
    },
    reachedWaypoint: wp,
    changed: true,
  };
}

export function undoZipMove(state: ZipBoardState): ZipBoardState {
  if (state.history.length === 0) return state;
  const prevPath = state.history[state.history.length - 1];
  return {
    path: prevPath,
    history: state.history.slice(0, -1),
  };
}

export function resetZipBoard(
  state: ZipBoardState,
  puzzle: ZipPuzzle
): ZipBoardState {
  if (state.path.length <= 1) return state;
  const withSnap = pushZipSnapshot(state);
  const start =
    puzzle.waypoints.find((w) => w.num === 1) ?? puzzle.waypoints[0];
  return {
    ...withSnap,
    path: [[start.row, start.col]],
  };
}

export function generateZipShareText(params: {
  mode: "daily" | "unlimited";
  dateStr: string;
  size: number;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  waypointsCount: number;
}): string {
  const title =
    params.mode === "daily"
      ? `Pola Zip · ${params.dateStr}`
      : `Pola Zip Unlimited (${params.size}×${params.size})`;

  const timeLine = `⏱ ${formatTime(params.totalSeconds)}${
    params.hintsUsed > 0 ? ` · 💡 ${params.hintsUsed}` : " · ✨ No hints"
  }${params.mode === "daily" && params.streak > 0 ? ` · 🔥 ${params.streak}` : ""}`;

  // Compact visual path strip
  const filled = "🟦".repeat(Math.min(params.size, 8));
  return `${title}\n${timeLine}\n1️⃣${filled}${params.waypointsCount}️⃣`;
}
