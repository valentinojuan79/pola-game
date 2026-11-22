import { buildTransformedPreset } from "./presetBank";
import { countSolutions } from "./solver";
import { DIFFICULTY_TO_SIZE, type QueensDifficulty, type QueensPuzzle } from "./types";

/** Deterministic FNV-1a 32-bit string hash */
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 deterministic PRNG */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

/** Generate a valid N-Queens placement where no two queens touch diagonally */
function generateValidPlacement(n: number, rng: () => number): [number, number][] | null {
  const usedCol = new Uint8Array(n);
  const placed = new Int8Array(n).fill(-1);

  function backtrack(row: number, prevCol: number): boolean {
    if (row === n) return true;
    const cols = Array.from({ length: n }, (_, i) => i);
    shuffleInPlace(cols, rng);

    for (const col of cols) {
      if (usedCol[col]) continue;
      if (row > 0 && Math.abs(col - prevCol) <= 1) continue;
      usedCol[col] = 1;
      placed[row] = col;
      if (backtrack(row + 1, col)) return true;
      usedCol[col] = 0;
    }
    return false;
  }

  if (!backtrack(0, -10)) return null;
  return Array.from({ length: n }, (_, r) => [r, placed[r]]);
}

function growRegions(
  n: number,
  queens: [number, number][],
  rng: () => number
): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  const frontiers: [number, number][][] = Array.from({ length: n }, () => []);

  const colorOrder = shuffleInPlace(
    Array.from({ length: n }, (_, i) => i),
    rng
  );

  for (let i = 0; i < n; i++) {
    const [r, c] = queens[i];
    const color = colorOrder[i];
    grid[r][c] = color;
    frontiers[color].push([r, c]);
  }

  let unassigned = n * n - n;
  while (unassigned > 0) {
    const activeRegions: number[] = [];
    for (let reg = 0; reg < n; reg++) {
      if (frontiers[reg].length > 0) activeRegions.push(reg);
    }
    if (activeRegions.length === 0) break;

    const reg = activeRegions[Math.floor(rng() * activeRegions.length)];
    const frontier = frontiers[reg];
    const idx = Math.floor(rng() * frontier.length);
    const [r, c] = frontier[idx];

    const neighbors: [number, number][] = [];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === -1) {
        neighbors.push([nr, nc]);
      }
    }

    if (neighbors.length === 0) {
      frontier.splice(idx, 1);
      continue;
    }

    const [nr, nc] = neighbors[Math.floor(rng() * neighbors.length)];
    grid[nr][nc] = reg;
    frontier.push([nr, nc]);
    unassigned--;
  }

  return grid;
}

function isRegionConnected(regions: number[][], targetReg: number): boolean {
  const n = regions.length;
  let total = 0;
  let start: [number, number] | null = null;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (regions[r][c] === targetReg) {
        total++;
        if (!start) start = [r, c];
      }
    }
  }
  if (total <= 1 || !start) return true;

  const visited = new Uint8Array(n * n);
  const stack: [number, number][] = [start];
  visited[start[0] * n + start[1]] = 1;
  let seen = 1;

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < n &&
        nc >= 0 &&
        nc < n &&
        regions[nr][nc] === targetReg &&
        !visited[nr * n + nc]
      ) {
        visited[nr * n + nc] = 1;
        seen++;
        stack.push([nr, nc]);
      }
    }
  }
  return seen === total;
}

function findTwoSolutions(
  regions: number[][]
): { count: number; sols: [number, number][][] } {
  const n = regions.length;
  const usedCol = new Uint8Array(n);
  const usedRegion = new Uint8Array(n);
  const placedCol = new Int8Array(n).fill(-1);
  let count = 0;
  const sols: [number, number][][] = [];

  function bt(row: number, prevCol: number) {
    if (count >= 2) return;
    if (row === n) {
      count++;
      sols.push(Array.from({ length: n }, (_, r) => [r, placedCol[r]]));
      return;
    }
    const rr = regions[row];
    for (let col = 0; col < n; col++) {
      if (usedCol[col] || (row > 0 && Math.abs(col - prevCol) <= 1)) continue;
      const reg = rr[col];
      if (usedRegion[reg]) continue;
      usedCol[col] = 1;
      usedRegion[reg] = 1;
      placedCol[row] = col;
      bt(row + 1, col);
      usedCol[col] = 0;
      usedRegion[reg] = 0;
      if (count >= 2) return;
    }
  }

  bt(0, -10);
  return { count, sols };
}

/**
 * Iteratively eliminates spurious alternate solutions by reassigning a single
 * non-target cell to an adjacent region while keeping every region connected.
 */
function refineToUnique(
  n: number,
  queens: [number, number][],
  regions: number[][],
  rng: () => number
): [number, number][] | null {
  const queenSet = new Set(queens.map(([r, c]) => `${r},${c}`));

  for (let step = 0; step < 24; step++) {
    const { count, sols } = findTwoSolutions(regions);
    if (count === 1) return sols[0];
    if (count === 0) return null;

    const alt =
      sols.find((s) => s.some(([, c], idx) => queens[idx][1] !== c)) ?? sols[1];
    const diffCells = shuffleInPlace(
      alt.filter(([r, c]) => !queenSet.has(`${r},${c}`)),
      rng
    );

    let moved = false;
    for (const [r, c] of diffCells) {
      const oldReg = regions[r][c];
      const adjRegs = new Set<number>();
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && regions[nr][nc] !== oldReg) {
          adjRegs.add(regions[nr][nc]);
        }
      }
      for (const newReg of shuffleInPlace([...adjRegs], rng)) {
        regions[r][c] = newReg;
        if (isRegionConnected(regions, oldReg)) {
          moved = true;
          break;
        }
        regions[r][c] = oldReg;
      }
      if (moved) break;
    }
    if (!moved) return null;
  }

  return null;
}

const MAX_TIME_MS = 60;
const MAX_ATTEMPTS = 36;

/**
 * Deterministically generate a Queens puzzle with guaranteed unique solution.
 * Enforces a strict wall-clock time budget (60ms) and iteration cap so it can
 * NEVER freeze the browser; falls back to an instant verified preset if needed.
 */
export function generateQueensPuzzle(
  difficulty: QueensDifficulty,
  seed: string
): QueensPuzzle {
  const size = DIFFICULTY_TO_SIZE[difficulty];
  const baseHash = hashString(`${difficulty}:${seed}`);
  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - startTime > MAX_TIME_MS) {
      break;
    }

    const rng = createRng(baseHash + attempt * 7919);
    const placement = generateValidPlacement(size, rng);
    if (!placement) continue;

    const regions = growRegions(size, placement, rng);
    const refinedSolution = refineToUnique(size, placement, regions, rng);
    if (refinedSolution) {
      const verify = countSolutions(regions, 2);
      if (verify.count === 1 && verify.firstSolution) {
        return {
          id: `queens-${difficulty}-${seed}`,
          size,
          difficulty,
          regions,
          solution: verify.firstSolution,
          seed,
        };
      }
    }
  }

  // Guaranteed instant (0ms), verified unique-solution fallback — never hangs
  return buildTransformedPreset(difficulty, seed);
}
