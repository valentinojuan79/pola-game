import { DIFFICULTY_TO_SIZE, type QueensDifficulty, type QueensPuzzle } from "./types";

interface RawPreset {
  regions: number[][];
  solution: [number, number][];
}

/**
 * Mathematically verified unique-solution Queens boards (countSolutions === 1)
 * for 6x6 (easy), 7x7 (medium), 8x8 (hard), and 9x9 (expert).
 * Every region is 4-way contiguous.
 */
export const VERIFIED_PRESETS: Record<QueensDifficulty, RawPreset[]> = {
  easy: [
    {
      regions: [
        [1, 1, 1, 0, 2, 2],
        [4, 1, 1, 0, 2, 0],
        [4, 1, 5, 0, 2, 0],
        [4, 1, 5, 0, 0, 0],
        [4, 1, 5, 5, 5, 5],
        [4, 5, 5, 5, 3, 5],
      ],
      solution: [[0, 5], [1, 1], [2, 3], [3, 0], [4, 2], [5, 4]],
    },
    {
      regions: [
        [2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 1, 1],
        [2, 5, 5, 5, 5, 1],
        [0, 0, 0, 3, 5, 3],
        [0, 4, 4, 3, 5, 3],
        [0, 4, 3, 3, 3, 3],
      ],
      solution: [[0, 1], [1, 5], [2, 3], [3, 0], [4, 2], [5, 4]],
    },
    {
      regions: [
        [4, 2, 2, 2, 2, 1],
        [4, 2, 5, 5, 2, 1],
        [4, 2, 5, 0, 1, 1],
        [4, 4, 5, 0, 0, 1],
        [4, 4, 5, 3, 0, 0],
        [4, 4, 5, 3, 0, 0],
      ],
      solution: [[0, 1], [1, 5], [2, 2], [3, 4], [4, 0], [5, 3]],
    },
    {
      regions: [
        [4, 4, 4, 4, 2, 2],
        [4, 4, 4, 4, 1, 1],
        [4, 4, 4, 1, 1, 1],
        [4, 4, 4, 1, 0, 0],
        [3, 5, 5, 1, 0, 0],
        [5, 5, 5, 5, 0, 0],
      ],
      solution: [[0, 4], [1, 1], [2, 3], [3, 5], [4, 0], [5, 2]],
    },
  ],
  medium: [
    {
      regions: [
        [0, 0, 0, 0, 4, 4, 4],
        [0, 0, 0, 0, 0, 4, 4],
        [2, 2, 4, 4, 4, 4, 4],
        [2, 2, 3, 3, 3, 4, 4],
        [1, 3, 3, 3, 3, 3, 5],
        [1, 3, 3, 3, 6, 6, 6],
        [3, 3, 3, 3, 6, 6, 6],
      ],
      solution: [[0, 2], [1, 5], [2, 1], [3, 3], [4, 6], [5, 0], [6, 4]],
    },
    {
      regions: [
        [1, 5, 5, 5, 5, 6, 6],
        [1, 1, 5, 5, 5, 6, 6],
        [1, 1, 1, 5, 2, 2, 6],
        [4, 4, 1, 1, 3, 2, 0],
        [4, 4, 3, 3, 3, 2, 0],
        [4, 4, 4, 3, 3, 3, 0],
        [4, 3, 3, 3, 3, 0, 0],
      ],
      solution: [[0, 1], [1, 6], [2, 4], [3, 2], [4, 0], [5, 3], [6, 5]],
    },
    {
      regions: [
        [3, 4, 4, 4, 0, 0, 0],
        [3, 4, 4, 0, 0, 6, 1],
        [3, 5, 5, 5, 6, 6, 1],
        [5, 5, 5, 6, 6, 6, 1],
        [5, 2, 5, 6, 6, 1, 1],
        [2, 2, 2, 2, 6, 1, 1],
        [2, 2, 2, 2, 1, 1, 1],
      ],
      solution: [[0, 1], [1, 4], [2, 0], [3, 5], [4, 2], [5, 6], [6, 3]],
    },
    {
      regions: [
        [3, 3, 3, 6, 6, 6, 6],
        [3, 3, 3, 6, 6, 1, 0],
        [3, 3, 1, 1, 1, 1, 0],
        [3, 3, 1, 1, 4, 0, 0],
        [5, 5, 5, 5, 5, 0, 0],
        [5, 5, 5, 5, 2, 2, 2],
        [5, 5, 5, 5, 2, 2, 2],
      ],
      solution: [[0, 3], [1, 0], [2, 2], [3, 4], [4, 6], [5, 1], [6, 5]],
    },
  ],
  hard: [
    {
      regions: [
        [2, 2, 2, 2, 2, 3, 3, 3],
        [2, 2, 2, 7, 2, 2, 6, 3],
        [5, 2, 7, 7, 7, 6, 6, 3],
        [0, 0, 0, 7, 7, 7, 6, 1],
        [0, 0, 7, 7, 7, 7, 1, 1],
        [0, 7, 7, 4, 7, 7, 7, 1],
        [0, 4, 7, 4, 7, 4, 1, 1],
        [0, 4, 4, 4, 4, 4, 1, 1],
      ],
      solution: [[0, 5], [1, 2], [2, 0], [3, 6], [4, 1], [5, 4], [6, 7], [7, 3]],
    },
    {
      regions: [
        [6, 6, 6, 6, 6, 6, 3, 3],
        [6, 6, 6, 6, 6, 4, 4, 4],
        [6, 6, 6, 6, 4, 4, 4, 4],
        [2, 2, 4, 4, 4, 1, 4, 1],
        [2, 2, 2, 4, 4, 1, 1, 1],
        [5, 5, 2, 5, 4, 1, 1, 1],
        [5, 5, 5, 5, 5, 5, 5, 0],
        [7, 5, 5, 5, 5, 0, 0, 0],
      ],
      solution: [[0, 6], [1, 2], [2, 4], [3, 1], [4, 5], [5, 3], [6, 7], [7, 0]],
    },
    {
      regions: [
        [4, 4, 4, 1, 3, 3, 3, 3],
        [4, 4, 5, 1, 1, 3, 3, 0],
        [4, 4, 5, 1, 1, 3, 0, 0],
        [4, 5, 5, 1, 1, 0, 0, 0],
        [4, 5, 5, 1, 1, 0, 0, 0],
        [5, 5, 7, 7, 0, 0, 0, 0],
        [5, 7, 7, 7, 0, 2, 2, 2],
        [5, 7, 7, 7, 7, 6, 2, 2],
      ],
      solution: [[0, 4], [1, 0], [2, 3], [3, 1], [4, 6], [5, 2], [6, 7], [7, 5]],
    },
    {
      regions: [
        [2, 2, 2, 2, 3, 3, 6, 6],
        [2, 2, 2, 4, 4, 4, 6, 6],
        [2, 5, 5, 4, 4, 6, 6, 6],
        [2, 5, 5, 5, 4, 4, 7, 7],
        [2, 2, 5, 5, 4, 7, 7, 7],
        [5, 5, 5, 7, 7, 7, 7, 7],
        [1, 0, 0, 0, 0, 7, 7, 7],
        [0, 0, 0, 7, 7, 7, 7, 7],
      ],
      solution: [[0, 4], [1, 1], [2, 7], [3, 5], [4, 3], [5, 6], [6, 0], [7, 2]],
    },
  ],
  expert: [
    {
      regions: [
        [1, 1, 7, 7, 0, 0, 0, 5, 5],
        [1, 1, 7, 0, 0, 5, 5, 5, 5],
        [1, 7, 7, 0, 0, 5, 5, 5, 5],
        [1, 7, 0, 0, 0, 3, 5, 5, 5],
        [1, 4, 4, 3, 3, 3, 6, 5, 5],
        [8, 4, 6, 6, 6, 6, 6, 2, 5],
        [8, 4, 4, 6, 6, 6, 2, 2, 2],
        [8, 4, 4, 6, 6, 6, 6, 6, 2],
        [4, 4, 6, 6, 6, 6, 2, 2, 2],
      ],
      solution: [[0, 3], [1, 1], [2, 4], [3, 7], [4, 5], [5, 0], [6, 2], [7, 6], [8, 8]],
    },
    {
      regions: [
        [5, 5, 5, 5, 0, 0, 0, 0, 1],
        [5, 5, 5, 5, 0, 4, 6, 6, 1],
        [5, 5, 5, 0, 0, 4, 6, 1, 1],
        [7, 2, 2, 2, 0, 4, 6, 1, 1],
        [7, 7, 2, 2, 4, 4, 4, 4, 1],
        [7, 8, 2, 2, 2, 4, 4, 1, 1],
        [7, 2, 2, 2, 2, 4, 4, 1, 4],
        [3, 3, 2, 2, 4, 4, 4, 1, 4],
        [3, 3, 3, 3, 4, 4, 4, 4, 4],
      ],
      solution: [[0, 5], [1, 7], [2, 2], [3, 0], [4, 8], [5, 1], [6, 4], [7, 6], [8, 3]],
    },
    {
      regions: [
        [3, 3, 3, 6, 6, 6, 6, 6, 6],
        [3, 3, 3, 6, 1, 1, 1, 2, 2],
        [3, 3, 3, 3, 1, 1, 1, 2, 2],
        [4, 3, 3, 1, 1, 5, 5, 2, 2],
        [4, 4, 4, 4, 4, 5, 5, 2, 2],
        [0, 0, 0, 0, 4, 5, 2, 2, 2],
        [0, 0, 0, 0, 5, 5, 8, 2, 2],
        [0, 0, 0, 0, 0, 7, 7, 7, 2],
        [0, 0, 0, 0, 7, 7, 7, 7, 2],
      ],
      solution: [[0, 3], [1, 1], [2, 4], [3, 0], [4, 5], [5, 8], [6, 6], [7, 2], [8, 7]],
    },
    {
      regions: [
        [8, 1, 1, 1, 3, 3, 3, 3, 3],
        [8, 1, 8, 1, 1, 2, 2, 7, 3],
        [8, 8, 8, 1, 2, 2, 7, 7, 7],
        [8, 8, 5, 1, 2, 2, 2, 7, 7],
        [5, 5, 5, 1, 1, 2, 7, 7, 7],
        [5, 5, 5, 5, 6, 2, 2, 7, 7],
        [5, 0, 4, 5, 6, 2, 2, 7, 7],
        [0, 0, 4, 6, 6, 6, 2, 2, 7],
        [0, 0, 4, 6, 6, 2, 2, 2, 7],
      ],
      solution: [[0, 7], [1, 4], [2, 0], [3, 6], [4, 8], [5, 3], [6, 1], [7, 5], [8, 2]],
    },
  ],
};

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function transformCoord(
  r: number,
  c: number,
  n: number,
  rot: number,
  flipX: boolean
): [number, number] {
  let nr = r;
  let nc = c;
  if (flipX) nc = n - 1 - nc;
  for (let i = 0; i < rot; i++) {
    const tmp = nr;
    nr = nc;
    nc = n - 1 - tmp;
  }
  return [nr, nc];
}

/**
 * Instantly (0ms) builds a verified unique-solution puzzle from the preset bank
 * using deterministic board symmetry (rotation + mirror + color permutation).
 */
export function buildTransformedPreset(
  difficulty: QueensDifficulty,
  seed: string
): QueensPuzzle {
  const pool = VERIFIED_PRESETS[difficulty];
  const size = DIFFICULTY_TO_SIZE[difficulty];
  const h = hashSeed(`${difficulty}:${seed}`);

  const preset = pool[h % pool.length];
  const rot = (h >>> 4) % 4;
  const flipX = Boolean((h >>> 6) & 1);

  // Deterministic color permutation so regions look fresh each time
  const perm = Array.from({ length: size }, (_, i) => i);
  let state = h ^ 0x9e3779b9;
  for (let i = size - 1; i > 0; i--) {
    state = Math.imul(state ^ (state >>> 15), 2246822507) >>> 0;
    const j = state % (i + 1);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }

  const regions: number[][] = Array.from({ length: size }, () =>
    Array<number>(size).fill(0)
  );
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const [nr, nc] = transformCoord(r, c, size, rot, flipX);
      regions[nr][nc] = perm[preset.regions[r][c]];
    }
  }

  const solution: [number, number][] = preset.solution
    .map(([r, c]) => transformCoord(r, c, size, rot, flipX))
    .sort((a, b) => a[0] - b[0]);

  return {
    id: `queens-${difficulty}-${seed}`,
    size,
    difficulty,
    regions,
    solution,
    seed,
  };
}
