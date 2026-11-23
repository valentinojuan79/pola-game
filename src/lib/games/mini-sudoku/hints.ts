import type { Locale } from "@/lib/i18n";
import { getBlockCells, getBlockIndex, isLockedCell } from "./engine";
import type {
  MiniSudokuDigit,
  MiniSudokuHint,
  MiniSudokuPuzzle,
  MiniSudokuValue,
} from "./types";

function getLegalCandidates(
  grid: MiniSudokuValue[][],
  r: number,
  c: number
): MiniSudokuDigit[] {
  if (grid[r][c] !== 0) return [];
  const used = new Set<number>();

  for (let i = 0; i < 6; i++) {
    if (grid[r][i] !== 0) used.add(grid[r][i]);
    if (grid[i][c] !== 0) used.add(grid[i][c]);
  }
  for (const [br, bc] of getBlockCells(getBlockIndex(r, c))) {
    if (grid[br][bc] !== 0) used.add(grid[br][bc]);
  }

  const cands: MiniSudokuDigit[] = [];
  for (let d = 1; d <= 6; d++) {
    if (!used.has(d)) cands.push(d as MiniSudokuDigit);
  }
  return cands;
}

function findDuplicatePeer(
  grid: MiniSudokuValue[][],
  r: number,
  c: number
): [number, number] | null {
  const v = grid[r][c];
  if (v === 0) return null;

  for (let i = 0; i < 6; i++) {
    if (i !== c && grid[r][i] === v) return [r, i];
    if (i !== r && grid[i][c] === v) return [i, c];
  }
  for (const [br, bc] of getBlockCells(getBlockIndex(r, c))) {
    if ((br !== r || bc !== c) && grid[br][bc] === v) return [br, bc];
  }
  return null;
}

/**
 * Smart Mini Sudoku Hint Engine:
 * Step 1 (Error Check): If any player-entered number conflicts or doesn't match the solution,
 *                       highlight it and advise fixing it first.
 * Step 2 (Deduction):   Find 1 solvable empty cell (Naked Single -> Hidden Single in Block/Row/Col -> Fallback).
 */
export function getSmartMiniSudokuHint(
  grid: MiniSudokuValue[][],
  puzzle: MiniSudokuPuzzle
): MiniSudokuHint | null {
  // Step 1a: Check for player-entered duplicates first
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v === 0 || isLockedCell(puzzle, r, c)) continue;
      const peer = findDuplicatePeer(grid, r, c);
      if (peer) {
        return {
          kind: "error",
          rule: "conflict_duplicate",
          targetCell: [r, c],
          digit: v as MiniSudokuDigit,
          highlightCells: [peer],
        };
      }
    }
  }

  // Step 1b: Check for any player-entered value that doesn't match the unique solution
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v === 0 || isLockedCell(puzzle, r, c)) continue;
      if (v !== puzzle.solution[r][c]) {
        return {
          kind: "error",
          rule: "wrong_value",
          targetCell: [r, c],
          digit: v as MiniSudokuDigit,
          highlightCells: [],
        };
      }
    }
  }

  // Step 2a: Naked Single (only 1 legal digit fits in an empty cell)
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) continue;
      const cands = getLegalCandidates(grid, r, c);
      if (cands.length === 1) {
        return {
          kind: "deduction",
          rule: "naked_single",
          targetCell: [r, c],
          digit: cands[0],
          highlightCells: [],
        };
      }
    }
  }

  // Step 2b: Hidden Single in a 2x3 Block
  for (let b = 0; b < 6; b++) {
    const cells = getBlockCells(b);
    for (let d = 1; d <= 6; d++) {
      const digit = d as MiniSudokuDigit;
      if (cells.some(([r, c]) => grid[r][c] === digit)) continue;
      const spots = cells.filter(
        ([r, c]) => grid[r][c] === 0 && getLegalCandidates(grid, r, c).includes(digit)
      );
      if (spots.length === 1) {
        return {
          kind: "deduction",
          rule: "hidden_single_block",
          targetCell: spots[0],
          digit,
          unit: { type: "block", index: b },
          highlightCells: [],
        };
      }
    }
  }

  // Step 2c: Hidden Single in a Row
  for (let r = 0; r < 6; r++) {
    for (let d = 1; d <= 6; d++) {
      const digit = d as MiniSudokuDigit;
      let exists = false;
      const spots: [number, number][] = [];
      for (let c = 0; c < 6; c++) {
        if (grid[r][c] === digit) {
          exists = true;
          break;
        }
        if (grid[r][c] === 0 && getLegalCandidates(grid, r, c).includes(digit)) {
          spots.push([r, c]);
        }
      }
      if (!exists && spots.length === 1) {
        return {
          kind: "deduction",
          rule: "hidden_single_row",
          targetCell: spots[0],
          digit,
          unit: { type: "row", index: r },
          highlightCells: [],
        };
      }
    }
  }

  // Step 2d: Hidden Single in a Column
  for (let c = 0; c < 6; c++) {
    for (let d = 1; d <= 6; d++) {
      const digit = d as MiniSudokuDigit;
      let exists = false;
      const spots: [number, number][] = [];
      for (let r = 0; r < 6; r++) {
        if (grid[r][c] === digit) {
          exists = true;
          break;
        }
        if (grid[r][c] === 0 && getLegalCandidates(grid, r, c).includes(digit)) {
          spots.push([r, c]);
        }
      }
      if (!exists && spots.length === 1) {
        return {
          kind: "deduction",
          rule: "hidden_single_col",
          targetCell: spots[0],
          digit,
          unit: { type: "col", index: c },
          highlightCells: [],
        };
      }
    }
  }

  // Step 2e: Fallback (for Expert puzzles requiring multi-step pair/chain logic)
  let bestCell: [number, number] | null = null;
  let minCands = 7;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) continue;
      const count = getLegalCandidates(grid, r, c).length;
      if (count < minCands) {
        minCands = count;
        bestCell = [r, c];
      }
    }
  }

  if (bestCell) {
    const [r, c] = bestCell;
    return {
      kind: "deduction",
      rule: "deduction_fallback",
      targetCell: [r, c],
      digit: puzzle.solution[r][c],
      unit: { type: "block", index: getBlockIndex(r, c) },
      highlightCells: [],
    };
  }

  return null;
}

/** Casual, natural EN/ID copywriting for the floating Smart Hint pill */
export function formatMiniSudokuHint(
  hint: MiniSudokuHint,
  locale: Locale
): { title: string; body: string } {
  const [r, c] = hint.targetCell;
  const rowNum = r + 1;
  const colNum = c + 1;
  const d = hint.digit;

  if (locale === "id") {
    switch (hint.rule) {
      case "conflict_duplicate":
        return {
          title: "Ada angka dobel nih",
          body: `Angka ${d} di Baris ${rowNum}, Kolom ${colNum} bentrok sama kotak lain. Rapihin ini dulu ya!`,
        };
      case "wrong_value":
        return {
          title: "Cek kotak ini dulu",
          body: `Angka ${d} di Baris ${rowNum}, Kolom ${colNum} belum pas sama solusinya. Hapus atau ganti dulu sebelum lanjut.`,
        };
      case "naked_single":
        return {
          title: `Cuma ${d} yang muat`,
          body: `Di Baris ${rowNum}, Kolom ${colNum}, semua angka lain udah kepakai di baris, kolom, atau bloknya—jadi pasti ${d}.`,
        };
      case "hidden_single_block":
        return {
          title: `Satu-satunya tempat buat ${d}`,
          body: `Di blok 2×3 ini, nggak ada kotak lain yang bisa diisi ${d} selain Baris ${rowNum}, Kolom ${colNum}.`,
        };
      case "hidden_single_row":
        return {
          title: `Baris ${rowNum} butuh ${d}`,
          body: `Di Baris ${rowNum}, angka ${d} cuma bisa masuk di Kolom ${colNum}—kotak lain udah ketutup.`,
        };
      case "hidden_single_col":
        return {
          title: `Kolom ${colNum} butuh ${d}`,
          body: `Di Kolom ${colNum}, satu-satunya tempat yang masih aman buat ${d} ada di Baris ${rowNum}.`,
        };
      case "deduction_fallback":
        return {
          title: `Coba taruh ${d} di sini`,
          body: `Kalau dieliminasi pelan-pelan, Baris ${rowNum}, Kolom ${colNum} bakal mengarah ke angka ${d}.`,
        };
    }
  }

  // English (casual, friendly)
  switch (hint.rule) {
    case "conflict_duplicate":
      return {
        title: "Duplicate spotted",
        body: `That ${d} at Row ${rowNum}, Col ${colNum} clashes with another ${d}. Fix this one first!`,
      };
    case "wrong_value":
      return {
        title: "Double-check this spot",
        body: `The ${d} at Row ${rowNum}, Col ${colNum} doesn't fit the solution. Clear or swap it before moving on.`,
      };
    case "naked_single":
      return {
        title: `Only ${d} fits here`,
        body: `Every other number is already taken in Row ${rowNum}, Col ${colNum}, or its 2×3 block—so this cell must be ${d}.`,
      };
    case "hidden_single_block":
      return {
        title: `Only spot for ${d} in this block`,
        body: `Other cells in this 2×3 block are blocked from holding ${d}, leaving Row ${rowNum}, Col ${colNum} as its only home.`,
      };
    case "hidden_single_row":
      return {
        title: `Row ${rowNum} needs a ${d}`,
        body: `Every other open cell in Row ${rowNum} is ruled out for ${d}, so it has to go in Col ${colNum}.`,
      };
    case "hidden_single_col":
      return {
        title: `Column ${colNum} needs a ${d}`,
        body: `Row ${rowNum} is the only spot left in Column ${colNum} where ${d} can legally go.`,
      };
    case "deduction_fallback":
      return {
        title: `Try ${d} here`,
        body: `Tracing the remaining candidates narrows Row ${rowNum}, Col ${colNum} down to ${d}.`,
      };
  }
}
