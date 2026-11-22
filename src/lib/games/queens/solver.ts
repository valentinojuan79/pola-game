/**
 * Fast exact backtracking solver for Queens (Star Battle 1-per-region).
 * Rules:
 *  - Exactly 1 crown per row
 *  - Exactly 1 crown per column
 *  - Exactly 1 crown per colored region
 *  - No two crowns touch orthogonally or diagonally
 */
export function countSolutions(
  regions: number[][],
  limit: number = 2
): { count: number; firstSolution: [number, number][] | null } {
  const n = regions.length;
  if (n === 0) return { count: 0, firstSolution: null };

  const usedCol = new Uint8Array(n);
  const usedRegion = new Uint8Array(n);
  const placedCol = new Int8Array(n).fill(-1);

  let count = 0;
  let firstSolution: [number, number][] | null = null;

  function backtrack(row: number, prevCol: number) {
    if (count >= limit) return;
    if (row === n) {
      count++;
      if (!firstSolution) {
        firstSolution = [];
        for (let r = 0; r < n; r++) {
          firstSolution.push([r, placedCol[r]]);
        }
      }
      return;
    }

    const rowRegions = regions[row];
    for (let col = 0; col < n; col++) {
      if (usedCol[col]) continue;
      if (row > 0 && Math.abs(col - prevCol) <= 1) continue;

      const reg = rowRegions[col];
      if (usedRegion[reg]) continue;

      usedCol[col] = 1;
      usedRegion[reg] = 1;
      placedCol[row] = col;

      backtrack(row + 1, col);

      usedCol[col] = 0;
      usedRegion[reg] = 0;
      if (count >= limit) return;
    }
  }

  backtrack(0, -10);
  return { count, firstSolution };
}

export function hasUniqueSolution(regions: number[][]): {
  unique: boolean;
  solution: [number, number][] | null;
} {
  const { count, firstSolution } = countSolutions(regions, 2);
  return {
    unique: count === 1,
    solution: count === 1 ? firstSolution : null,
  };
}
