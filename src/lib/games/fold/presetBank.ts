import { verifyFoldPuzzle } from "./engine";
import {
  FOLD_COLORS,
  type FoldColor,
  type FoldDifficulty,
  type FoldItemPlacement,
  type FoldMove,
  type FoldPuzzle,
} from "./types";

interface FoldPresetTemplate {
  size: number;
  maxFolds: number;
  /** Compact tuples: [row, col, colorIndex] */
  dots: Array<[number, number, number]>;
  targets: Array<[number, number, number]>;
  /** Compact tuples: [axis ('v'|'h'), line, direction ('l'|'r'|'u'|'d')] */
  solutionFolds: Array<["v" | "h", number, "l" | "r" | "u" | "d"]>;
}

const EASY_PRESETS: FoldPresetTemplate[] = [
  {
    size: 4,
    maxFolds: 2,
    dots: [
      [3, 1, 0],
      [1, 2, 1],
      [1, 0, 0],
    ],
    targets: [
      [3, 2, 0],
      [2, 1, 1],
      [1, 3, 0],
    ],
    solutionFolds: [
      ["v", 2, "l"],
      ["h", 2, "u"],
    ],
  },
  {
    size: 4,
    maxFolds: 2,
    dots: [
      [0, 3, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    targets: [
      [3, 0, 0],
      [2, 2, 1],
      [3, 2, 0],
    ],
    solutionFolds: [
      ["h", 2, "d"],
      ["v", 2, "r"],
    ],
  },
  {
    size: 4,
    maxFolds: 2,
    dots: [
      [0, 3, 0],
      [1, 2, 1],
      [0, 0, 0],
    ],
    targets: [
      [3, 3, 0],
      [1, 3, 1],
      [3, 0, 0],
    ],
    solutionFolds: [
      ["v", 3, "l"],
      ["h", 2, "u"],
    ],
  },
  {
    size: 4,
    maxFolds: 2,
    dots: [
      [1, 0, 0],
      [0, 1, 1],
      [2, 1, 0],
    ],
    targets: [
      [1, 3, 0],
      [1, 2, 1],
      [2, 2, 0],
    ],
    solutionFolds: [
      ["h", 1, "d"],
      ["v", 2, "l"],
    ],
  },
  {
    size: 4,
    maxFolds: 2,
    dots: [
      [2, 2, 0],
      [1, 0, 1],
      [2, 1, 0],
    ],
    targets: [
      [3, 2, 0],
      [1, 1, 1],
      [3, 0, 0],
    ],
    solutionFolds: [
      ["v", 1, "r"],
      ["h", 3, "u"],
    ],
  },
];

const MEDIUM_PRESETS: FoldPresetTemplate[] = [
  {
    size: 4,
    maxFolds: 3,
    dots: [
      [3, 2, 0],
      [1, 3, 1],
      [1, 1, 2],
      [0, 1, 0],
    ],
    targets: [
      [3, 3, 0],
      [2, 3, 1],
      [2, 2, 2],
      [0, 2, 0],
    ],
    solutionFolds: [
      ["v", 3, "l"],
      ["v", 2, "l"],
      ["h", 2, "u"],
    ],
  },
  {
    size: 4,
    maxFolds: 3,
    dots: [
      [0, 2, 0],
      [0, 1, 1],
      [0, 0, 2],
      [2, 0, 0],
    ],
    targets: [
      [1, 1, 0],
      [2, 2, 1],
      [1, 3, 2],
      [2, 3, 0],
    ],
    solutionFolds: [
      ["h", 1, "d"],
      ["v", 2, "r"],
      ["h", 2, "d"],
    ],
  },
  {
    size: 4,
    maxFolds: 3,
    dots: [
      [2, 0, 0],
      [0, 0, 1],
      [2, 1, 2],
      [2, 2, 0],
    ],
    targets: [
      [3, 1, 0],
      [0, 2, 1],
      [3, 2, 2],
      [3, 0, 0],
    ],
    solutionFolds: [
      ["v", 1, "r"],
      ["h", 3, "u"],
      ["v", 2, "r"],
    ],
  },
  {
    size: 4,
    maxFolds: 3,
    dots: [
      [0, 2, 0],
      [0, 3, 1],
      [2, 3, 2],
      [3, 1, 0],
    ],
    targets: [
      [1, 1, 0],
      [1, 0, 1],
      [3, 3, 2],
      [3, 2, 0],
    ],
    solutionFolds: [
      ["h", 3, "u"],
      ["h", 1, "d"],
      ["v", 2, "l"],
    ],
  },
  {
    size: 4,
    maxFolds: 3,
    dots: [
      [2, 2, 0],
      [0, 0, 1],
      [2, 0, 2],
      [1, 1, 0],
    ],
    targets: [
      [3, 3, 0],
      [0, 2, 1],
      [2, 3, 2],
      [1, 2, 0],
    ],
    solutionFolds: [
      ["v", 2, "l"],
      ["h", 3, "u"],
      ["v", 1, "l"],
    ],
  },
];

const HARD_PRESETS: FoldPresetTemplate[] = [
  {
    size: 5,
    maxFolds: 3,
    dots: [
      [2, 4, 0],
      [1, 1, 1],
      [1, 4, 2],
      [2, 2, 0],
      [1, 3, 1],
    ],
    targets: [
      [3, 4, 0],
      [4, 2, 1],
      [4, 4, 2],
      [3, 1, 0],
      [4, 1, 1],
    ],
    solutionFolds: [
      ["v", 3, "l"],
      ["h", 3, "u"],
      ["v", 2, "l"],
    ],
  },
  {
    size: 5,
    maxFolds: 3,
    dots: [
      [0, 0, 0],
      [2, 2, 1],
      [1, 2, 2],
      [4, 1, 0],
      [0, 1, 1],
    ],
    targets: [
      [3, 0, 0],
      [3, 3, 1],
      [2, 3, 2],
      [4, 4, 0],
      [1, 4, 1],
    ],
    solutionFolds: [
      ["h", 2, "d"],
      ["v", 3, "l"],
      ["h", 3, "d"],
    ],
  },
  {
    size: 5,
    maxFolds: 4,
    dots: [
      [0, 0, 0],
      [1, 3, 1],
      [0, 1, 2],
      [0, 3, 0],
      [0, 4, 1],
    ],
    targets: [
      [3, 4, 0],
      [3, 0, 1],
      [2, 1, 2],
      [3, 3, 0],
      [1, 4, 1],
    ],
    solutionFolds: [
      ["v", 4, "l"],
      ["h", 2, "d"],
      ["v", 2, "r"],
      ["h", 3, "u"],
    ],
  },
  {
    size: 5,
    maxFolds: 4,
    dots: [
      [0, 1, 0],
      [0, 4, 1],
      [0, 2, 2],
      [0, 3, 0],
      [2, 3, 1],
    ],
    targets: [
      [1, 4, 0],
      [1, 0, 1],
      [1, 3, 2],
      [1, 2, 0],
      [3, 2, 1],
    ],
    solutionFolds: [
      ["h", 1, "d"],
      ["v", 3, "l"],
      ["h", 3, "u"],
      ["v", 1, "r"],
    ],
  },
  {
    size: 5,
    maxFolds: 4,
    dots: [
      [1, 3, 0],
      [0, 3, 1],
      [1, 1, 2],
      [4, 0, 0],
      [0, 2, 1],
    ],
    targets: [
      [2, 0, 0],
      [4, 2, 1],
      [2, 2, 2],
      [4, 1, 0],
      [3, 3, 1],
    ],
    solutionFolds: [
      ["v", 2, "r"],
      ["h", 4, "u"],
      ["v", 3, "r"],
      ["h", 2, "u"],
    ],
  },
];

const EXPERT_PRESETS: FoldPresetTemplate[] = [
  {
    size: 5,
    maxFolds: 4,
    dots: [
      [1, 4, 0],
      [1, 1, 1],
      [3, 3, 2],
      [2, 3, 3],
      [0, 1, 0],
    ],
    targets: [
      [4, 0, 0],
      [4, 2, 1],
      [3, 4, 2],
      [2, 4, 3],
      [1, 2, 0],
    ],
    solutionFolds: [
      ["v", 4, "l"],
      ["v", 2, "l"],
      ["h", 3, "u"],
      ["h", 1, "d"],
    ],
  },
  {
    size: 5,
    maxFolds: 4,
    dots: [
      [2, 2, 0],
      [1, 0, 1],
      [0, 1, 2],
      [2, 0, 3],
      [0, 2, 0],
    ],
    targets: [
      [2, 3, 0],
      [4, 4, 1],
      [1, 4, 2],
      [3, 4, 3],
      [1, 2, 0],
    ],
    solutionFolds: [
      ["h", 1, "d"],
      ["v", 3, "l"],
      ["h", 3, "d"],
      ["v", 1, "r"],
    ],
  },
  {
    size: 5,
    maxFolds: 5,
    dots: [
      [1, 4, 0],
      [3, 0, 1],
      [0, 0, 2],
      [3, 2, 3],
      [1, 1, 0],
    ],
    targets: [
      [2, 3, 0],
      [4, 4, 1],
      [0, 2, 2],
      [4, 1, 3],
      [2, 4, 0],
    ],
    solutionFolds: [
      ["v", 3, "l"],
      ["h", 4, "u"],
      ["v", 1, "r"],
      ["h", 2, "u"],
      ["v", 2, "l"],
    ],
  },
  {
    size: 5,
    maxFolds: 5,
    dots: [
      [0, 4, 0],
      [2, 1, 1],
      [1, 4, 2],
      [2, 2, 3],
      [1, 0, 0],
    ],
    targets: [
      [4, 3, 0],
      [3, 2, 1],
      [2, 3, 2],
      [3, 1, 3],
      [3, 3, 0],
    ],
    solutionFolds: [
      ["h", 2, "d"],
      ["v", 4, "l"],
      ["h", 3, "d"],
      ["v", 2, "l"],
      ["h", 4, "u"],
    ],
  },
  {
    size: 5,
    maxFolds: 5,
    dots: [
      [3, 0, 0],
      [0, 2, 1],
      [2, 1, 2],
      [0, 1, 3],
      [1, 1, 0],
    ],
    targets: [
      [3, 1, 0],
      [1, 2, 1],
      [2, 4, 2],
      [4, 1, 3],
      [4, 0, 0],
    ],
    solutionFolds: [
      ["v", 1, "r"],
      ["h", 3, "u"],
      ["v", 3, "l"],
      ["h", 1, "d"],
      ["v", 2, "l"],
    ],
  },
];

const BANK: Record<FoldDifficulty, FoldPresetTemplate[]> = {
  easy: EASY_PRESETS,
  medium: MEDIUM_PRESETS,
  hard: HARD_PRESETS,
  expert: EXPERT_PRESETS,
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function expandMove(m: ["v" | "h", number, "l" | "r" | "u" | "d"]): FoldMove {
  const dirMap = {
    l: "left",
    r: "right",
    u: "up",
    d: "down",
  } as const;
  return {
    axis: m[0] === "v" ? "vertical" : "horizontal",
    line: m[1],
    direction: dirMap[m[2]],
  };
}

function flipHorizontalPoint(
  row: number,
  col: number,
  size: number
): [number, number] {
  return [row, size - 1 - col];
}

function flipHorizontalMove(move: FoldMove, size: number): FoldMove {
  if (move.axis === "vertical") {
    return {
      axis: "vertical",
      line: size - move.line,
      direction: move.direction === "left" ? "right" : "left",
    };
  }
  return { ...move };
}

function rotate90CWPoint(
  row: number,
  col: number,
  size: number
): [number, number] {
  return [col, size - 1 - row];
}

function rotate90CWMove(move: FoldMove, size: number): FoldMove {
  if (move.axis === "vertical") {
    return {
      axis: "horizontal",
      line: move.line,
      direction: move.direction === "left" ? "up" : "down",
    };
  }
  return {
    axis: "vertical",
    line: size - move.line,
    direction: move.direction === "up" ? "right" : "left",
  };
}

function transformPoint(
  row: number,
  col: number,
  size: number,
  rotations: number,
  flipH: boolean
): [number, number] {
  let r = row;
  let c = col;
  if (flipH) [r, c] = flipHorizontalPoint(r, c, size);
  for (let i = 0; i < rotations; i++) {
    [r, c] = rotate90CWPoint(r, c, size);
  }
  return [r, c];
}

function transformMove(
  move: FoldMove,
  size: number,
  rotations: number,
  flipH: boolean
): FoldMove {
  let m = flipH ? flipHorizontalMove(move, size) : { ...move };
  for (let i = 0; i < rotations; i++) {
    m = rotate90CWMove(m, size);
  }
  return m;
}

function permuteColors(seedNum: number): FoldColor[] {
  const arr = [...FOLD_COLORS];
  let s = seedNum || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Deterministically build a verified Fold puzzle in 0ms from the preset bank,
 * applying dihedral symmetry (rotation + flip) and color permutation.
 */
export function buildTransformedFoldPreset(
  difficulty: FoldDifficulty,
  seed: string
): FoldPuzzle {
  const templates = BANK[difficulty];
  const h = hashSeed(seed);
  const template = templates[h % templates.length];
  const rotations = (h >>> 3) % 4;
  const flipH = ((h >>> 5) & 1) === 1;
  const colorOrder = permuteColors(h >>> 6);

  const dots: FoldItemPlacement[] = template.dots.map(([r, c, colorIdx]) => {
    const [nr, nc] = transformPoint(r, c, template.size, rotations, flipH);
    return { row: nr, col: nc, color: colorOrder[colorIdx % colorOrder.length] };
  });

  const targets: FoldItemPlacement[] = template.targets.map(
    ([r, c, colorIdx]) => {
      const [nr, nc] = transformPoint(r, c, template.size, rotations, flipH);
      return {
        row: nr,
        col: nc,
        color: colorOrder[colorIdx % colorOrder.length],
      };
    }
  );

  const solutionFolds: FoldMove[] = template.solutionFolds.map((m) =>
    transformMove(expandMove(m), template.size, rotations, flipH)
  );

  const puzzle: FoldPuzzle = {
    id: `fold-${difficulty}-${seed}`,
    size: template.size,
    difficulty,
    maxFolds: template.maxFolds,
    dots,
    targets,
    solutionFolds,
  };

  if (verifyFoldPuzzle(puzzle)) {
    return puzzle;
  }

  // Fallback to untransformed base template (guaranteed verified)
  return {
    id: `fold-${difficulty}-${seed}`,
    size: template.size,
    difficulty,
    maxFolds: template.maxFolds,
    dots: template.dots.map(([row, col, ci]) => ({
      row,
      col,
      color: FOLD_COLORS[ci % FOLD_COLORS.length],
    })),
    targets: template.targets.map(([row, col, ci]) => ({
      row,
      col,
      color: FOLD_COLORS[ci % FOLD_COLORS.length],
    })),
    solutionFolds: template.solutionFolds.map(expandMove),
  };
}
