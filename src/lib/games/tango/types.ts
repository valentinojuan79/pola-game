export type TangoCellValue = 0 | 1 | 2; // 0 = empty, 1 = Sun / Orange, 2 = Moon / Blue

export type TangoDifficulty = "easy" | "medium" | "hard" | "expert";

export type TangoVisualMode = "icons" | "circles";

export type TangoConstraintType = "same" | "diff";

export interface TangoConstraint {
  /** Normalized so (r1, c1) is always top or left of (r2, c2) */
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  type: TangoConstraintType;
}

export interface TangoPuzzle {
  id: string;
  size: 6;
  difficulty: TangoDifficulty;
  /** 6x6 grid of initial clues (0 = empty, 1 = Sun, 2 = Moon). Non-zero cells are locked. */
  initial: TangoCellValue[][];
  /** 6x6 unique solved grid (1 = Sun, 2 = Moon) */
  solution: TangoCellValue[][];
  /** Edge constraints (= or ×) between orthogonally adjacent cells */
  constraints: TangoConstraint[];
}

export interface TangoBoardState {
  grid: TangoCellValue[][];
  history: TangoCellValue[][][];
}

export interface TangoViolations {
  /** Cell keys "r,c" currently violating a rule */
  cells: Set<string>;
  /** Constraint keys "r1,c1-r2,c2" currently violated */
  constraints: Set<string>;
}

export type TangoHintRuleCode =
  | "fix_error"
  | "two_adjacent"
  | "sandwich"
  | "direct_constraint"
  | "line_quota_complete"
  | "pair_adjacent_symbol"
  | "quota_pair_deduction"
  | "three_empty_gap"
  | "contradiction_fallback";

export interface TangoHint {
  kind: "error" | "deduction";
  ruleCode: TangoHintRuleCode;
  targetCell: [number, number];
  /** Symbol that should go in targetCell (1 = Sun, 2 = Moon) */
  deducedSymbol?: 1 | 2;
  /** Reference symbol driving the rule (e.g. the repeated symbol) */
  refSymbol?: 1 | 2;
  axis?: "row" | "col";
  lineIndex?: number;
  constraintType?: TangoConstraintType;
  /** Secondary cells involved in the deduction (for subtle board highlight) */
  highlightCells: [number, number][];
  /** Constraints involved in the deduction */
  highlightConstraints: TangoConstraint[];
}
