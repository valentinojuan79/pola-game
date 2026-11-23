import type { Locale } from "@/lib/i18n";
import { cloneGrid } from "./engine";
import type {
  TangoCellValue,
  TangoConstraint,
  TangoHint,
  TangoPuzzle,
  TangoVisualMode,
} from "./types";

function opposite(v: 1 | 2): 1 | 2 {
  return v === 1 ? 2 : 1;
}

function getLine(
  grid: TangoCellValue[][],
  axis: "row" | "col",
  idx: number
): TangoCellValue[] {
  return Array.from({ length: 6 }, (_, k) =>
    axis === "row" ? grid[idx][k] : grid[k][idx]
  );
}

function coordOnLine(
  axis: "row" | "col",
  lineIdx: number,
  pos: number
): [number, number] {
  return axis === "row" ? [lineIdx, pos] : [pos, lineIdx];
}

/**
 * Checks if a line constraint applies along a given row or column,
 * returning { pos1, pos2, constraint } with pos1 < pos2.
 */
function getLineConstraints(
  constraints: TangoConstraint[],
  axis: "row" | "col",
  lineIdx: number
): { pos1: number; pos2: number; constraint: TangoConstraint }[] {
  const list: { pos1: number; pos2: number; constraint: TangoConstraint }[] = [];
  for (const con of constraints) {
    if (axis === "row" && con.r1 === lineIdx && con.r2 === lineIdx) {
      list.push({ pos1: con.c1, pos2: con.c2, constraint: con });
    } else if (axis === "col" && con.c1 === lineIdx && con.c2 === lineIdx) {
      list.push({ pos1: con.r1, pos2: con.r2, constraint: con });
    }
  }
  return list;
}

/**
 * Lightweight 1-step logical propagator used for Rule 8 (contradiction check on Expert boards).
 * Returns true if placing `val` at `(r, c)` leads to an immediate contradiction.
 */
function leadsToContradiction(
  baseGrid: TangoCellValue[][],
  constraints: TangoConstraint[],
  r: number,
  c: number,
  val: 1 | 2
): boolean {
  const g = cloneGrid(baseGrid);
  g[r][c] = val;

  const hasImmediateViolation = (): boolean => {
    for (let i = 0; i < 6; i++) {
      let r1 = 0, r2 = 0, c1 = 0, c2 = 0;
      for (let k = 0; k < 6; k++) {
        if (g[i][k] === 1) r1++;
        else if (g[i][k] === 2) r2++;
        if (g[k][i] === 1) c1++;
        else if (g[k][i] === 2) c2++;
      }
      if (r1 > 3 || r2 > 3 || c1 > 3 || c2 > 3) return true;
      for (let k = 0; k < 4; k++) {
        if (g[i][k] !== 0 && g[i][k] === g[i][k + 1] && g[i][k] === g[i][k + 2]) return true;
        if (g[k][i] !== 0 && g[k][i] === g[k + 1][i] && g[k][i] === g[k + 2][i]) return true;
      }
    }
    for (const con of constraints) {
      const v1 = g[con.r1][con.c1];
      const v2 = g[con.r2][con.c2];
      if (v1 !== 0 && v2 !== 0) {
        if (con.type === "same" && v1 !== v2) return true;
        if (con.type === "diff" && v1 === v2) return true;
      }
    }
    return false;
  };

  if (hasImmediateViolation()) return true;

  // Propagate forced moves up to 24 steps
  for (let step = 0; step < 24; step++) {
    let changed = false;

    for (const con of constraints) {
      const v1 = g[con.r1][con.c1];
      const v2 = g[con.r2][con.c2];
      if (v1 !== 0 && v2 === 0) {
        g[con.r2][con.c2] = con.type === "same" ? v1 : opposite(v1);
        changed = true;
      } else if (v2 !== 0 && v1 === 0) {
        g[con.r1][con.c1] = con.type === "same" ? v2 : opposite(v2);
        changed = true;
      }
    }

    for (const axis of ["row", "col"] as const) {
      for (let i = 0; i < 6; i++) {
        const line = getLine(g, axis, i);
        const set = (pos: number, v: 1 | 2) => {
          const [rr, cc] = coordOnLine(axis, i, pos);
          g[rr][cc] = v;
          changed = true;
        };

        for (let k = 0; k < 4; k++) {
          if (line[k] !== 0 && line[k] === line[k + 1] && line[k + 2] === 0) {
            set(k + 2, opposite(line[k] as 1 | 2));
          }
          if (line[k + 1] !== 0 && line[k + 1] === line[k + 2] && line[k] === 0) {
            set(k, opposite(line[k + 1] as 1 | 2));
          }
          if (line[k] !== 0 && line[k] === line[k + 2] && line[k + 1] === 0) {
            set(k + 1, opposite(line[k] as 1 | 2));
          }
        }

        let n1 = 0, n2 = 0;
        for (let k = 0; k < 6; k++) {
          if (line[k] === 1) n1++;
          else if (line[k] === 2) n2++;
        }
        if (n1 === 3 && n2 < 3) {
          for (let k = 0; k < 6; k++) if (line[k] === 0) set(k, 2);
        } else if (n2 === 3 && n1 < 3) {
          for (let k = 0; k < 6; k++) if (line[k] === 0) set(k, 1);
        }
      }
    }

    if (hasImmediateViolation()) return true;
    if (!changed) break;
  }

  return false;
}

/**
 * Smart Hint Engine for Tango:
 * Step 1: Check for any mistake vs solution -> highlight & ask to fix first.
 * Step 2: Deduce 1 solvable empty cell using 8 layered human logic patterns.
 */
export function getSmartTangoHint(
  grid: TangoCellValue[][],
  puzzle: TangoPuzzle
): TangoHint | null {
  // Step 1: Error Check
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0 && grid[r][c] !== puzzle.solution[r][c]) {
        return {
          kind: "error",
          ruleCode: "fix_error",
          targetCell: [r, c],
          deducedSymbol: puzzle.solution[r][c] as 1 | 2,
          refSymbol: grid[r][c] as 1 | 2,
          highlightCells: [[r, c]],
          highlightConstraints: [],
        };
      }
    }
  }

  // Check if already solved
  let firstEmpty: [number, number] | null = null;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] === 0) {
        firstEmpty = [r, c];
        break;
      }
    }
    if (firstEmpty) break;
  }
  if (!firstEmpty) return null;

  // Rule 1: Two adjacent same symbols (AA_ or _AA)
  for (const axis of ["row", "col"] as const) {
    for (let i = 0; i < 6; i++) {
      const line = getLine(grid, axis, i);
      for (let k = 0; k < 4; k++) {
        if (line[k] !== 0 && line[k] === line[k + 1] && line[k + 2] === 0) {
          const sym = line[k] as 1 | 2;
          return {
            kind: "deduction",
            ruleCode: "two_adjacent",
            targetCell: coordOnLine(axis, i, k + 2),
            deducedSymbol: opposite(sym),
            refSymbol: sym,
            axis,
            lineIndex: i,
            highlightCells: [
              coordOnLine(axis, i, k),
              coordOnLine(axis, i, k + 1),
            ],
            highlightConstraints: [],
          };
        }
        if (line[k + 1] !== 0 && line[k + 1] === line[k + 2] && line[k] === 0) {
          const sym = line[k + 1] as 1 | 2;
          return {
            kind: "deduction",
            ruleCode: "two_adjacent",
            targetCell: coordOnLine(axis, i, k),
            deducedSymbol: opposite(sym),
            refSymbol: sym,
            axis,
            lineIndex: i,
            highlightCells: [
              coordOnLine(axis, i, k + 1),
              coordOnLine(axis, i, k + 2),
            ],
            highlightConstraints: [],
          };
        }
      }
    }
  }

  // Rule 2: Sandwiched empty cell (A_A)
  for (const axis of ["row", "col"] as const) {
    for (let i = 0; i < 6; i++) {
      const line = getLine(grid, axis, i);
      for (let k = 0; k < 4; k++) {
        if (line[k] !== 0 && line[k] === line[k + 2] && line[k + 1] === 0) {
          const sym = line[k] as 1 | 2;
          return {
            kind: "deduction",
            ruleCode: "sandwich",
            targetCell: coordOnLine(axis, i, k + 1),
            deducedSymbol: opposite(sym),
            refSymbol: sym,
            axis,
            lineIndex: i,
            highlightCells: [
              coordOnLine(axis, i, k),
              coordOnLine(axis, i, k + 2),
            ],
            highlightConstraints: [],
          };
        }
      }
    }
  }

  // Rule 3: Direct = or × constraint next to a filled cell
  for (const con of puzzle.constraints) {
    const v1 = grid[con.r1][con.c1];
    const v2 = grid[con.r2][con.c2];
    if (v1 !== 0 && v2 === 0) {
      const sym = v1 as 1 | 2;
      return {
        kind: "deduction",
        ruleCode: "direct_constraint",
        targetCell: [con.r2, con.c2],
        deducedSymbol: con.type === "same" ? sym : opposite(sym),
        refSymbol: sym,
        constraintType: con.type,
        highlightCells: [[con.r1, con.c1]],
        highlightConstraints: [con],
      };
    }
    if (v2 !== 0 && v1 === 0) {
      const sym = v2 as 1 | 2;
      return {
        kind: "deduction",
        ruleCode: "direct_constraint",
        targetCell: [con.r1, con.c1],
        deducedSymbol: con.type === "same" ? sym : opposite(sym),
        refSymbol: sym,
        constraintType: con.type,
        highlightCells: [[con.r2, con.c2]],
        highlightConstraints: [con],
      };
    }
  }

  // Rule 4: Row or column already has 3 of one symbol
  for (const axis of ["row", "col"] as const) {
    for (let i = 0; i < 6; i++) {
      const line = getLine(grid, axis, i);
      let c1 = 0, c2 = 0;
      for (const v of line) {
        if (v === 1) c1++;
        else if (v === 2) c2++;
      }
      if (c1 === 3 && c2 < 3) {
        const emptyPos = line.findIndex((v) => v === 0);
        const existing = line
          .map((v, k) => (v === 1 ? coordOnLine(axis, i, k) : null))
          .filter(Boolean) as [number, number][];
        return {
          kind: "deduction",
          ruleCode: "line_quota_complete",
          targetCell: coordOnLine(axis, i, emptyPos),
          deducedSymbol: 2,
          refSymbol: 1,
          axis,
          lineIndex: i,
          highlightCells: existing,
          highlightConstraints: [],
        };
      }
      if (c2 === 3 && c1 < 3) {
        const emptyPos = line.findIndex((v) => v === 0);
        const existing = line
          .map((v, k) => (v === 2 ? coordOnLine(axis, i, k) : null))
          .filter(Boolean) as [number, number][];
        return {
          kind: "deduction",
          ruleCode: "line_quota_complete",
          targetCell: coordOnLine(axis, i, emptyPos),
          deducedSymbol: 1,
          refSymbol: 2,
          axis,
          lineIndex: i,
          highlightCells: existing,
          highlightConstraints: [],
        };
      }
    }
  }

  // Rule 5: Empty = pair adjacent to a filled symbol (A _=_ or _=_ A)
  for (const con of puzzle.constraints) {
    if (con.type !== "same") continue;
    if (grid[con.r1][con.c1] !== 0 || grid[con.r2][con.c2] !== 0) continue;

    if (con.r1 === con.r2) {
      const r = con.r1;
      if (con.c1 > 0 && grid[r][con.c1 - 1] !== 0) {
        const sym = grid[r][con.c1 - 1] as 1 | 2;
        return {
          kind: "deduction",
          ruleCode: "pair_adjacent_symbol",
          targetCell: [r, con.c1],
          deducedSymbol: opposite(sym),
          refSymbol: sym,
          axis: "row",
          lineIndex: r,
          constraintType: "same",
          highlightCells: [[r, con.c1 - 1], [r, con.c2]],
          highlightConstraints: [con],
        };
      }
      if (con.c2 < 5 && grid[r][con.c2 + 1] !== 0) {
        const sym = grid[r][con.c2 + 1] as 1 | 2;
        return {
          kind: "deduction",
          ruleCode: "pair_adjacent_symbol",
          targetCell: [r, con.c2],
          deducedSymbol: opposite(sym),
          refSymbol: sym,
          axis: "row",
          lineIndex: r,
          constraintType: "same",
          highlightCells: [[r, con.c2 + 1], [r, con.c1]],
          highlightConstraints: [con],
        };
      }
    } else {
      const c = con.c1;
      if (con.r1 > 0 && grid[con.r1 - 1][c] !== 0) {
        const sym = grid[con.r1 - 1][c] as 1 | 2;
        return {
          kind: "deduction",
          ruleCode: "pair_adjacent_symbol",
          targetCell: [con.r1, c],
          deducedSymbol: opposite(sym),
          refSymbol: sym,
          axis: "col",
          lineIndex: c,
          constraintType: "same",
          highlightCells: [[con.r1 - 1, c], [con.r2, c]],
          highlightConstraints: [con],
        };
      }
      if (con.r2 < 5 && grid[con.r2 + 1][c] !== 0) {
        const sym = grid[con.r2 + 1][c] as 1 | 2;
        return {
          kind: "deduction",
          ruleCode: "pair_adjacent_symbol",
          targetCell: [con.r2, c],
          deducedSymbol: opposite(sym),
          refSymbol: sym,
          axis: "col",
          lineIndex: c,
          constraintType: "same",
          highlightCells: [[con.r2 + 1, c], [con.r1, c]],
          highlightConstraints: [con],
        };
      }
    }
  }

  // Rule 6: Remaining quota of 1 + empty = pair or empty × pair deduction
  for (const axis of ["row", "col"] as const) {
    for (let i = 0; i < 6; i++) {
      const line = getLine(grid, axis, i);
      let c1 = 0, c2 = 0;
      for (const v of line) {
        if (v === 1) c1++;
        else if (v === 2) c2++;
      }
      const lineCons = getLineConstraints(puzzle.constraints, axis, i);

      for (const sym of [1, 2] as const) {
        const count = sym === 1 ? c1 : c2;
        if (count !== 2) continue; // Only 1 of `sym` left in this line
        const other = opposite(sym);

        // 6a: Empty = pair cannot hold 2 of `sym`, so both must be `other`
        for (const lc of lineCons) {
          if (
            lc.constraint.type === "same" &&
            line[lc.pos1] === 0 &&
            line[lc.pos2] === 0
          ) {
            return {
              kind: "deduction",
              ruleCode: "quota_pair_deduction",
              targetCell: coordOnLine(axis, i, lc.pos1),
              deducedSymbol: other,
              refSymbol: sym,
              axis,
              lineIndex: i,
              constraintType: "same",
              highlightCells: [coordOnLine(axis, i, lc.pos2)],
              highlightConstraints: [lc.constraint],
            };
          }
        }

        // 6b: Empty × pair consumes the last remaining `sym`, so any other empty cell in the line must be `other`
        for (const lc of lineCons) {
          if (
            lc.constraint.type === "diff" &&
            line[lc.pos1] === 0 &&
            line[lc.pos2] === 0
          ) {
            for (let k = 0; k < 6; k++) {
              if (line[k] === 0 && k !== lc.pos1 && k !== lc.pos2) {
                return {
                  kind: "deduction",
                  ruleCode: "quota_pair_deduction",
                  targetCell: coordOnLine(axis, i, k),
                  deducedSymbol: other,
                  refSymbol: sym,
                  axis,
                  lineIndex: i,
                  constraintType: "diff",
                  highlightCells: [
                    coordOnLine(axis, i, lc.pos1),
                    coordOnLine(axis, i, lc.pos2),
                  ],
                  highlightConstraints: [lc.constraint],
                };
              }
            }
          }
        }
      }
    }
  }

  // Rule 7: "3-Empty-Gap" Trap
  // e.g. B B _ _ _ _ (last cell can't be B -> forces AAA in middle)
  // or   _ B _ _ _ B (first cell can't be B -> forces AAA in middle)
  // including reversed & vertical variations.
  for (const axis of ["row", "col"] as const) {
    for (let i = 0; i < 6; i++) {
      const line = getLine(grid, axis, i);
      let c1 = 0, c2 = 0;
      for (const v of line) {
        if (v === 1) c1++;
        else if (v === 2) c2++;
      }

      for (const sym of [1, 2] as const) {
        const count = sym === 1 ? c1 : c2;
        if (count !== 2) continue; // Only 1 `sym` remaining in this line
        const other = opposite(sym);

        for (let k = 0; k < 6; k++) {
          if (line[k] !== 0) continue;
          // Simulate placing the last `sym` at `k`, forcing all other empties to `other`
          const sim = line.map((v, idx) =>
            idx === k ? sym : v === 0 ? other : v
          );
          let tripleStart = -1;
          for (let t = 0; t < 4; t++) {
            if (sim[t] === other && sim[t + 1] === other && sim[t + 2] === other) {
              tripleStart = t;
              break;
            }
          }
          if (tripleStart >= 0) {
            return {
              kind: "deduction",
              ruleCode: "three_empty_gap",
              targetCell: coordOnLine(axis, i, k),
              deducedSymbol: other,
              refSymbol: sym,
              axis,
              lineIndex: i,
              highlightCells: [
                coordOnLine(axis, i, tripleStart),
                coordOnLine(axis, i, tripleStart + 1),
                coordOnLine(axis, i, tripleStart + 2),
              ],
              highlightConstraints: [],
            };
          }
        }
      }
    }
  }

  // Rule 8: 1-step contradiction fallback for Expert boards
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) continue;
      const correct = puzzle.solution[r][c] as 1 | 2;
      const wrong = opposite(correct);
      if (leadsToContradiction(grid, puzzle.constraints, r, c, wrong)) {
        return {
          kind: "deduction",
          ruleCode: "contradiction_fallback",
          targetCell: [r, c],
          deducedSymbol: correct,
          refSymbol: wrong,
          highlightCells: [],
          highlightConstraints: [],
        };
      }
    }
  }

  // Final safety fallback (always resolves a valid empty cell)
  const [fr, fc] = firstEmpty;
  const correct = puzzle.solution[fr][fc] as 1 | 2;
  return {
    kind: "deduction",
    ruleCode: "contradiction_fallback",
    targetCell: [fr, fc],
    deducedSymbol: correct,
    refSymbol: opposite(correct),
    highlightCells: [],
    highlightConstraints: [],
  };
}

function symbolName(
  sym: 1 | 2,
  locale: Locale,
  visualMode: TangoVisualMode
): string {
  if (visualMode === "icons") {
    if (locale === "id") return sym === 1 ? "Matahari" : "Bulan";
    return sym === 1 ? "Sun" : "Moon";
  }
  if (locale === "id") return sym === 1 ? "Oranye" : "Biru";
  return sym === 1 ? "Orange" : "Blue";
}

function lineLabel(
  axis: "row" | "col" | undefined,
  locale: Locale
): string {
  if (locale === "id") return axis === "col" ? "kolom ini" : "baris ini";
  return axis === "col" ? "this column" : "this row";
}

/**
 * Formats a Smart Hint into natural, casual EN/ID copy that adapts automatically
 * to the active Visual Mode (Sun/Moon icons vs Orange/Blue circles).
 */
export function formatTangoHint(
  hint: TangoHint,
  locale: Locale,
  visualMode: TangoVisualMode
): { title: string; body: string } {
  const deduced = hint.deducedSymbol
    ? symbolName(hint.deducedSymbol, locale, visualMode)
    : "";
  const ref = hint.refSymbol
    ? symbolName(hint.refSymbol, locale, visualMode)
    : "";
  const line = lineLabel(hint.axis, locale);

  if (locale === "id") {
    switch (hint.ruleCode) {
      case "fix_error":
        return {
          title: "Ada yang kurang pas nih",
          body: `Kotak yang disorot belum cocok dengan solusinya—ganti dulu sebelum lanjut ya.`,
        };
      case "two_adjacent":
        return {
          title: "Maksimal 2 berurutan",
          body: `Sudah ada dua ${ref} berjejer di sebelahnya, jadi kotak ini pasti ${deduced}.`,
        };
      case "sandwich":
        return {
          title: "Terjepit di tengah",
          body: `Kotak ini diapit dua ${ref}. Biar nggak jadi tiga berurutan, isinya pasti ${deduced}.`,
        };
      case "direct_constraint":
        return hint.constraintType === "same"
          ? {
              title: "Tanda = harus sama",
              body: `Tanda = artinya kedua kotak harus sama, jadi kotak ini juga ${deduced}.`,
            }
          : {
              title: "Tanda × harus beda",
              body: `Tanda × artinya kedua kotak harus beda, jadi kotak ini pasti ${deduced}.`,
            };
      case "line_quota_complete":
        return {
          title: `Kuota ${ref} sudah penuh`,
          body: `Di ${line} sudah ada 3 ${ref}, jadi sisa kotak kosongnya pasti ${deduced}.`,
        };
      case "pair_adjacent_symbol":
        return {
          title: "Pasangan = di sebelah simbol",
          body: `Pasangan = ini nggak boleh jadi ${ref} (nanti 3 berurutan), jadi keduanya pasti ${deduced}.`,
        };
      case "quota_pair_deduction":
        return hint.constraintType === "same"
          ? {
              title: `Sisa 1 ${ref} di ${line}`,
              body: `Cuma butuh 1 ${ref} lagi di ${line}, jadi pasangan = ini nggak muat ${ref}—keduanya pasti ${deduced}.`,
            }
          : {
              title: `Pasangan × menghabiskan kuota`,
              body: `Pasangan × di ${line} pasti berisi 1 ${ref} terakhir, jadi kotak kosong di luarnya pasti ${deduced}.`,
            };
      case "three_empty_gap":
        return {
          title: "Jebakan 3 kotak kosong",
          body: `Kalau kotak ini diisi ${ref} terakhir di ${line}, sisa 3 kotak kosong bakal jadi tiga ${deduced} berurutan. Jadi kotak ini harus ${deduced}.`,
        };
      case "contradiction_fallback":
      default:
        return {
          title: "Langkah logika lanjutan",
          body: `Kalau kotak ini diisi ${ref}, nanti bakal bentrok aturan beberapa langkah ke depan—jadi isinya pasti ${deduced}.`,
        };
    }
  }

  // English (casual & clear)
  switch (hint.ruleCode) {
    case "fix_error":
      return {
        title: "Quick fix first",
        body: `The highlighted cell doesn't match the solution—fix that one before moving on.`,
      };
    case "two_adjacent":
      return {
        title: "No 3 in a row",
        body: `There are already two ${ref}s side by side here, so this cell must be ${deduced}.`,
      };
    case "sandwich":
      return {
        title: "Sandwiched cell",
        body: `This cell sits right between two ${ref}s, so it has to be ${deduced} to avoid 3 in a row.`,
      };
    case "direct_constraint":
      return hint.constraintType === "same"
        ? {
            title: "Matching = sign",
            body: `The = marker means both cells match, so this cell must be ${deduced}.`,
          }
        : {
            title: "Opposite × sign",
            body: `The × marker means these two cells are different, so this one must be ${deduced}.`,
          };
    case "line_quota_complete":
      return {
        title: `${ref} quota full`,
        body: `There are already 3 ${ref}s in ${line}, so any empty spot left must be ${deduced}.`,
      };
    case "pair_adjacent_symbol":
      return {
        title: "Empty = pair next to a symbol",
        body: `This = pair can't be ${ref}s (that would make 3 in a row), so both cells must be ${deduced}.`,
      };
    case "quota_pair_deduction":
      return hint.constraintType === "same"
        ? {
            title: `Only 1 ${ref} left`,
            body: `Only one ${ref} is left in ${line}, so the = pair can't be ${ref}s—both must be ${deduced}.`,
          }
        : {
            title: `× pair uses the last ${ref}`,
            body: `The × pair in ${line} will take the last ${ref}, so this other empty cell has to be ${deduced}.`,
          };
    case "three_empty_gap":
      return {
        title: "3-empty-gap trap",
        body: `Putting the last ${ref} here would force 3 ${deduced}s in a row in ${line}. So this cell must be ${deduced}.`,
      };
    case "contradiction_fallback":
    default:
      return {
        title: "Look-ahead deduction",
        body: `Trying ${ref} here triggers a rule conflict a step later—so this cell must be ${deduced}.`,
      };
  }
}
