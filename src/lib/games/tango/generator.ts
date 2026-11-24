import { cloneGrid, findTangoViolations } from "./engine";
import type {
  TangoCellValue,
  TangoConstraint,
  TangoConstraintType,
  TangoDifficulty,
  TangoPuzzle,
} from "./types";

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

function opposite(v: 1 | 2): 1 | 2 {
  return v === 1 ? 2 : 1;
}

/** Precompute all 14 valid 6-cell Tango lines (3 ones, 3 twos, no 3 adjacent) */
const VALID_LINES: (1 | 2)[][] = (() => {
  const lines: (1 | 2)[][] = [];
  for (let mask = 0; mask < 64; mask++) {
    const row: (1 | 2)[] = [];
    let ones = 0;
    for (let i = 0; i < 6; i++) {
      const bit = (mask >> i) & 1;
      if (bit === 1) ones++;
      row.push(bit === 1 ? 1 : 2);
    }
    if (ones !== 3) continue;
    let valid = true;
    for (let i = 0; i < 4; i++) {
      if (row[i] === row[i + 1] && row[i] === row[i + 2]) {
        valid = false;
        break;
      }
    }
    if (valid) lines.push(row);
  }
  return lines;
})();

/** Generate a random valid 6×6 Tango solution grid */
function generateValidSolution(rng: () => number): TangoCellValue[][] {
  const grid: TangoCellValue[][] = [];
  const colCount1 = [0, 0, 0, 0, 0, 0];
  const colCount2 = [0, 0, 0, 0, 0, 0];

  function backtrack(rowIdx: number): boolean {
    if (rowIdx === 6) return true;
    const candidates = shuffleInPlace([...VALID_LINES], rng);

    for (const line of candidates) {
      let ok = true;
      for (let c = 0; c < 6; c++) {
        const v = line[c];
        const next1 = colCount1[c] + (v === 1 ? 1 : 0);
        const next2 = colCount2[c] + (v === 2 ? 1 : 0);
        if (next1 > 3 || next2 > 3) {
          ok = false;
          break;
        }
        if (
          rowIdx >= 2 &&
          grid[rowIdx - 1][c] === v &&
          grid[rowIdx - 2][c] === v
        ) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      grid.push([...line]);
      for (let c = 0; c < 6; c++) {
        if (line[c] === 1) colCount1[c]++;
        else colCount2[c]++;
      }

      if (backtrack(rowIdx + 1)) return true;

      grid.pop();
      for (let c = 0; c < 6; c++) {
        if (line[c] === 1) colCount1[c]--;
        else colCount2[c]--;
      }
    }
    return false;
  }

  backtrack(0);
  return grid;
}

export interface LogicalSolveResult {
  solved: boolean;
  passes: number;
  advancedCount: number;
}

/**
 * Purely deterministic human-logic solver for 6×6 Tango.
 * Uses ONLY deterministic deduction rules (NEVER backtracking or trial-and-error):
 *   (a) Adjacent pair (`OO_` -> `OOB`) and sandwich (`O_O` -> `OBO`).
 *   (b) Row/column quota completion (3 of one symbol -> remaining cells are opposite).
 *   (c) Direct `=` and `×` constraint propagation when one side is known.
 *   (d) Line-quota + constraint interaction (when `allowAdvanced` is true):
 *       - Empty `=` pair adjacent to a filled symbol (`O _=_` -> `O B=B`).
 *       - Row/col with 2 of symbol A + empty `=` pair -> `=` pair must be B=B.
 *       - Row/col with 2 of symbol A + empty `×` pair -> other empty cells in line must be B.
 */
export function solveTangoLogically(
  initial: TangoCellValue[][],
  constraints: TangoConstraint[],
  allowAdvanced = true,
  expectedSolution?: TangoCellValue[][]
): LogicalSolveResult {
  const g = cloneGrid(initial);

  // Pre-index constraints by row and column for fast line-quota checks
  const rowCons: { c1: number; c2: number; type: TangoConstraintType }[][] =
    Array.from({ length: 6 }, () => []);
  const colCons: { r1: number; r2: number; type: TangoConstraintType }[][] =
    Array.from({ length: 6 }, () => []);

  for (const con of constraints) {
    if (con.r1 === con.r2) {
      rowCons[con.r1].push({ c1: con.c1, c2: con.c2, type: con.type });
    } else {
      colCons[con.c1].push({ r1: con.r1, r2: con.r2, type: con.type });
    }
  }

  let passes = 0;
  let advancedCount = 0;

  const setCell = (r: number, c: number, v: 1 | 2): boolean => {
    if (g[r][c] === 0) {
      g[r][c] = v;
      return true;
    }
    return false;
  };

  while (true) {
    passes++;
    let changed = false;

    // --- Basic Rules (a), (b), (c) ---

    // (a) Adjacent pair & sandwich in rows and columns
    for (let i = 0; i < 6; i++) {
      // Row i
      for (let k = 0; k < 4; k++) {
        const a = g[i][k];
        const b = g[i][k + 1];
        const c = g[i][k + 2];
        if (a !== 0 && a === b && c === 0) {
          if (setCell(i, k + 2, opposite(a as 1 | 2))) changed = true;
        }
        if (b !== 0 && b === c && a === 0) {
          if (setCell(i, k, opposite(b as 1 | 2))) changed = true;
        }
        if (a !== 0 && a === c && b === 0) {
          if (setCell(i, k + 1, opposite(a as 1 | 2))) changed = true;
        }
      }
      // Col i
      for (let k = 0; k < 4; k++) {
        const a = g[k][i];
        const b = g[k + 1][i];
        const c = g[k + 2][i];
        if (a !== 0 && a === b && c === 0) {
          if (setCell(k + 2, i, opposite(a as 1 | 2))) changed = true;
        }
        if (b !== 0 && b === c && a === 0) {
          if (setCell(k, i, opposite(b as 1 | 2))) changed = true;
        }
        if (a !== 0 && a === c && b === 0) {
          if (setCell(k + 1, i, opposite(a as 1 | 2))) changed = true;
        }
      }
    }

    // (b) Row/column quota completion
    for (let i = 0; i < 6; i++) {
      let r1 = 0,
        r2 = 0,
        c1 = 0,
        c2 = 0;
      for (let k = 0; k < 6; k++) {
        if (g[i][k] === 1) r1++;
        else if (g[i][k] === 2) r2++;
        if (g[k][i] === 1) c1++;
        else if (g[k][i] === 2) c2++;
      }
      if (r1 === 3 && r2 < 3) {
        for (let k = 0; k < 6; k++) if (setCell(i, k, 2)) changed = true;
      } else if (r2 === 3 && r1 < 3) {
        for (let k = 0; k < 6; k++) if (setCell(i, k, 1)) changed = true;
      }
      if (c1 === 3 && c2 < 3) {
        for (let k = 0; k < 6; k++) if (setCell(k, i, 2)) changed = true;
      } else if (c2 === 3 && c1 < 3) {
        for (let k = 0; k < 6; k++) if (setCell(k, i, 1)) changed = true;
      }
    }

    // (c) Direct = and × propagation
    for (const con of constraints) {
      const v1 = g[con.r1][con.c1];
      const v2 = g[con.r2][con.c2];
      if (v1 !== 0 && v2 === 0) {
        const target = con.type === "same" ? (v1 as 1 | 2) : opposite(v1 as 1 | 2);
        if (setCell(con.r2, con.c2, target)) changed = true;
      } else if (v2 !== 0 && v1 === 0) {
        const target = con.type === "same" ? (v2 as 1 | 2) : opposite(v2 as 1 | 2);
        if (setCell(con.r1, con.c1, target)) changed = true;
      }
    }

    if (changed) continue;
    if (!allowAdvanced) break;

    // --- Advanced Deterministic Rule (d): Line-quota + constraint interaction ---
    let advChanged = false;

    // (d1) Empty `=` pair adjacent to a filled cell (O _=_ -> O B=B)
    for (const con of constraints) {
      if (con.type !== "same") continue;
      if (g[con.r1][con.c1] !== 0 || g[con.r2][con.c2] !== 0) continue;

      if (con.r1 === con.r2) {
        const r = con.r1;
        if (con.c1 > 0 && g[r][con.c1 - 1] !== 0) {
          const opp = opposite(g[r][con.c1 - 1] as 1 | 2);
          if (setCell(r, con.c1, opp)) advChanged = true;
          if (setCell(r, con.c2, opp)) advChanged = true;
        } else if (con.c2 < 5 && g[r][con.c2 + 1] !== 0) {
          const opp = opposite(g[r][con.c2 + 1] as 1 | 2);
          if (setCell(r, con.c1, opp)) advChanged = true;
          if (setCell(r, con.c2, opp)) advChanged = true;
        }
      } else {
        const c = con.c1;
        if (con.r1 > 0 && g[con.r1 - 1][c] !== 0) {
          const opp = opposite(g[con.r1 - 1][c] as 1 | 2);
          if (setCell(con.r1, c, opp)) advChanged = true;
          if (setCell(con.r2, c, opp)) advChanged = true;
        } else if (con.r2 < 5 && g[con.r2 + 1][c] !== 0) {
          const opp = opposite(g[con.r2 + 1][c] as 1 | 2);
          if (setCell(con.r1, c, opp)) advChanged = true;
          if (setCell(con.r2, c, opp)) advChanged = true;
        }
      }
    }

    // (d2 & d3) Line quota (2 of color A placed) + empty `=` or `×` pair
    for (let r = 0; r < 6; r++) {
      let n1 = 0,
        n2 = 0;
      for (let c = 0; c < 6; c++) {
        if (g[r][c] === 1) n1++;
        else if (g[r][c] === 2) n2++;
      }
      const cons = rowCons[r];
      for (const sym of [1, 2] as const) {
        const count = sym === 1 ? n1 : n2;
        if (count !== 2) continue;
        const other = opposite(sym);

        for (const lc of cons) {
          if (g[r][lc.c1] !== 0 || g[r][lc.c2] !== 0) continue;
          if (lc.type === "same") {
            if (setCell(r, lc.c1, other)) advChanged = true;
            if (setCell(r, lc.c2, other)) advChanged = true;
          } else {
            for (let c = 0; c < 6; c++) {
              if (g[r][c] === 0 && c !== lc.c1 && c !== lc.c2) {
                if (setCell(r, c, other)) advChanged = true;
              }
            }
          }
        }
      }
    }

    for (let c = 0; c < 6; c++) {
      let n1 = 0,
        n2 = 0;
      for (let r = 0; r < 6; r++) {
        if (g[r][c] === 1) n1++;
        else if (g[r][c] === 2) n2++;
      }
      const cons = colCons[c];
      for (const sym of [1, 2] as const) {
        const count = sym === 1 ? n1 : n2;
        if (count !== 2) continue;
        const other = opposite(sym);

        for (const lc of cons) {
          if (g[lc.r1][c] !== 0 || g[lc.r2][c] !== 0) continue;
          if (lc.type === "same") {
            if (setCell(lc.r1, c, other)) advChanged = true;
            if (setCell(lc.r2, c, other)) advChanged = true;
          } else {
            for (let r = 0; r < 6; r++) {
              if (g[r][c] === 0 && r !== lc.r1 && r !== lc.r2) {
                if (setCell(r, c, other)) advChanged = true;
              }
            }
          }
        }
      }
    }

    if (advChanged) {
      advancedCount++;
      continue;
    }

    break;
  }

  // Verify every cell is filled with zero violations
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (g[r][c] === 0) {
        return { solved: false, passes, advancedCount };
      }
      if (expectedSolution && g[r][c] !== expectedSolution[r][c]) {
        return { solved: false, passes, advancedCount };
      }
    }
  }

  const violations = findTangoViolations(g, constraints);
  const solved = violations.cells.size === 0 && violations.constraints.size === 0;
  return { solved, passes, advancedCount };
}

function transformCoord(r: number, c: number, sym: number): [number, number] {
  const n = 6;
  switch (sym % 8) {
    case 0:
      return [r, c];
    case 1:
      return [c, n - 1 - r];
    case 2:
      return [n - 1 - r, n - 1 - c];
    case 3:
      return [n - 1 - c, r];
    case 4:
      return [r, n - 1 - c];
    case 5:
      return [n - 1 - r, c];
    case 6:
      return [c, r];
    case 7:
    default:
      return [n - 1 - c, n - 1 - r];
  }
}

function applyRandomSymmetry(
  initial: TangoCellValue[][],
  solution: TangoCellValue[][],
  constraints: TangoConstraint[],
  rng: () => number
): {
  initial: TangoCellValue[][];
  solution: TangoCellValue[][];
  constraints: TangoConstraint[];
} {
  const sym = Math.floor(rng() * 8);
  const swapSymbols = rng() < 0.5;

  const mapVal = (v: TangoCellValue): TangoCellValue => {
    if (v === 0) return 0;
    return swapSymbols ? (v === 1 ? 2 : 1) : v;
  };

  const nextInit: TangoCellValue[][] = Array.from({ length: 6 }, () =>
    Array<TangoCellValue>(6).fill(0)
  );
  const nextSol: TangoCellValue[][] = Array.from({ length: 6 }, () =>
    Array<TangoCellValue>(6).fill(0)
  );

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const [nr, nc] = transformCoord(r, c, sym);
      nextInit[nr][nc] = mapVal(initial[r][c]);
      nextSol[nr][nc] = mapVal(solution[r][c]);
    }
  }

  const nextCons: TangoConstraint[] = constraints.map((con) => {
    const [nr1, nc1] = transformCoord(con.r1, con.c1, sym);
    const [nr2, nc2] = transformCoord(con.r2, con.c2, sym);
    const ordered =
      nr1 < nr2 || (nr1 === nr2 && nc1 < nc2)
        ? { r1: nr1, c1: nc1, r2: nr2, c2: nc2 }
        : { r1: nr2, c1: nc2, r2: nr1, c2: nc1 };
    return { ...ordered, type: con.type };
  });

  return { initial: nextInit, solution: nextSol, constraints: nextCons };
}

interface DifficultyProfile {
  allowAdvanced: boolean;
  seedConstraintsMin: number;
  seedConstraintsMax: number;
  minCells: number;
  targetMaxCells: number;
  minConstraints: number;
  candidates: number;
}

const DIFFICULTY_PROFILES: Record<TangoDifficulty, DifficultyProfile> = {
  easy: {
    allowAdvanced: false,
    seedConstraintsMin: 7,
    seedConstraintsMax: 9,
    minCells: 11,
    targetMaxCells: 14,
    minConstraints: 6,
    candidates: 2,
  },
  medium: {
    allowAdvanced: true,
    seedConstraintsMin: 8,
    seedConstraintsMax: 11,
    minCells: 8,
    targetMaxCells: 10,
    minConstraints: 6,
    candidates: 4,
  },
  hard: {
    allowAdvanced: true,
    seedConstraintsMin: 9,
    seedConstraintsMax: 13,
    minCells: 5,
    targetMaxCells: 7,
    minConstraints: 6,
    candidates: 8,
  },
  expert: {
    allowAdvanced: true,
    seedConstraintsMin: 10,
    seedConstraintsMax: 15,
    minCells: 2,
    targetMaxCells: 5,
    minConstraints: 5,
    candidates: 12,
  },
};

function buildAllEdges(solution: TangoCellValue[][]): TangoConstraint[] {
  const edges: TangoConstraint[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (c < 5) {
        edges.push({
          r1: r,
          c1: c,
          r2: r,
          c2: c + 1,
          type: solution[r][c] === solution[r][c + 1] ? "same" : "diff",
        });
      }
      if (r < 5) {
        edges.push({
          r1: r,
          c1: c,
          r2: r + 1,
          c2: c,
          type: solution[r][c] === solution[r + 1][c] ? "same" : "diff",
        });
      }
    }
  }
  return edges;
}

function generateCandidate(
  difficulty: TangoDifficulty,
  rng: () => number
): {
  initial: TangoCellValue[][];
  solution: TangoCellValue[][];
  constraints: TangoConstraint[];
  clueCount: number;
  passes: number;
  advancedCount: number;
} {
  const profile = DIFFICULTY_PROFILES[difficulty];
  const solution = generateValidSolution(rng);

  // Pick a randomized, well-balanced initial pool of constraints
  const allEdges = shuffleInPlace(buildAllEdges(solution), rng);
  const seedConstraintCount =
    profile.seedConstraintsMin +
    Math.floor(
      rng() * (profile.seedConstraintsMax - profile.seedConstraintsMin + 1)
    );

  // Encourage a balanced mix of `=` and `×` constraints
  const sameEdges = allEdges.filter((e) => e.type === "same");
  const diffEdges = allEdges.filter((e) => e.type === "diff");
  let constraints: TangoConstraint[] = [];
  const half = Math.ceil(seedConstraintCount / 2);
  constraints.push(...sameEdges.slice(0, half));
  constraints.push(...diffEdges.slice(0, seedConstraintCount - half));
  if (constraints.length < seedConstraintCount) {
    const used = new Set(constraints);
    for (const e of allEdges) {
      if (!used.has(e)) {
        constraints.push(e);
        if (constraints.length >= seedConstraintCount) break;
      }
    }
  }

  // Start with all 36 cells filled and dig in randomized order
  const initial = cloneGrid(solution);
  const cells: [number, number][] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push([r, c]);
    }
  }
  shuffleInPlace(cells, rng);

  let clueCount = 36;
  const targetCellFloor =
    profile.minCells +
    Math.floor(rng() * Math.max(1, profile.targetMaxCells - profile.minCells + 1));

  for (const [r, c] of cells) {
    if (clueCount <= targetCellFloor) break;
    const saved = initial[r][c];
    initial[r][c] = 0;
    const res = solveTangoLogically(
      initial,
      constraints,
      profile.allowAdvanced,
      solution
    );
    if (res.solved) {
      clueCount--;
    } else {
      initial[r][c] = saved;
    }
  }

  // Prune redundant constraints in randomized order while preserving pure logical solvability
  const conIndices = shuffleInPlace(
    Array.from({ length: constraints.length }, (_, i) => i),
    rng
  );
  const removedIndices = new Set<number>();

  for (const idx of conIndices) {
    if (constraints.length - removedIndices.size <= profile.minConstraints) {
      break;
    }
    const testCons = constraints.filter(
      (_, i) => i !== idx && !removedIndices.has(i)
    );
    const res = solveTangoLogically(
      initial,
      testCons,
      profile.allowAdvanced,
      solution
    );
    if (res.solved) {
      removedIndices.add(idx);
    }
  }

  constraints = constraints.filter((_, i) => !removedIndices.has(i));

  // For Expert, attempt one more pass to dig any remaining removable cells down to minCells
  if (difficulty === "expert" && clueCount > profile.minCells) {
    const remainingCells: [number, number][] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (initial[r][c] !== 0) remainingCells.push([r, c]);
      }
    }
    shuffleInPlace(remainingCells, rng);
    for (const [r, c] of remainingCells) {
      if (clueCount <= profile.minCells) break;
      const saved = initial[r][c];
      initial[r][c] = 0;
      const res = solveTangoLogically(initial, constraints, true, solution);
      if (res.solved) {
        clueCount--;
      } else {
        initial[r][c] = saved;
      }
    }
  }

  const finalCheck = solveTangoLogically(
    initial,
    constraints,
    profile.allowAdvanced,
    solution
  );

  return {
    initial,
    solution,
    constraints,
    clueCount,
    passes: finalCheck.passes,
    advancedCount: finalCheck.advancedCount,
  };
}

function scoreCandidate(
  difficulty: TangoDifficulty,
  cand: {
    clueCount: number;
    constraints: TangoConstraint[];
    passes: number;
    advancedCount: number;
  }
): number {
  switch (difficulty) {
    case "easy":
      return (
        -Math.abs(cand.clueCount - 12) * 3 -
        Math.abs(cand.constraints.length - 7) * 2
      );
    case "medium":
      return (
        -Math.abs(cand.clueCount - 9) * 3 +
        (cand.advancedCount >= 1 ? 6 : 0) +
        cand.passes * 0.5
      );
    case "hard":
      return (
        -Math.abs(cand.clueCount - 6) * 4 +
        Math.min(cand.advancedCount, 3) * 8 +
        cand.passes
      );
    case "expert":
      return (
        (10 - cand.clueCount) * 5 +
        Math.min(cand.advancedCount, 5) * 10 +
        cand.passes * 1.5 -
        Math.max(0, cand.constraints.length - 9) * 2
      );
  }
}

/**
 * Generates a 100% purely logical 6×6 Tango puzzle (zero backtracking / trial-and-error)
 * with randomized board symmetries and randomized clue-removal order.
 */
export function generateTangoPuzzle(
  difficulty: TangoDifficulty,
  seed: string
): TangoPuzzle {
  const rng = createRng(hashString(`tango-v2-${difficulty}-${seed}`));
  const profile = DIFFICULTY_PROFILES[difficulty];

  let best = generateCandidate(difficulty, rng);
  let bestScore = scoreCandidate(difficulty, best);

  for (let i = 1; i < profile.candidates; i++) {
    const cand = generateCandidate(difficulty, rng);
    const sc = scoreCandidate(difficulty, cand);
    if (sc > bestScore) {
      best = cand;
      bestScore = sc;
    }
  }

  // Apply random dihedral symmetry (transpose/rotations/reflections) + optional symbol swap
  const transformed = applyRandomSymmetry(
    best.initial,
    best.solution,
    best.constraints,
    rng
  );

  return {
    id: `tango-${difficulty}-${seed}`,
    size: 6,
    difficulty,
    initial: transformed.initial,
    solution: transformed.solution,
    constraints: transformed.constraints,
  };
}
