"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cellKey, constraintKey, isLockedCell } from "@/lib/games/tango/engine";
import type {
  TangoCellValue,
  TangoHint,
  TangoPuzzle,
  TangoViolations,
  TangoVisualMode,
} from "@/lib/games/tango/types";

interface TangoBoardProps {
  puzzle: TangoPuzzle;
  grid: TangoCellValue[][];
  visualMode: TangoVisualMode;
  violations: TangoViolations;
  activeHint: TangoHint | null;
  disabled: boolean;
  onCellTap: (r: number, c: number) => void;
}

/** Crisp Warm Sun / Cool Blue Moon icons or Minimalist Circles */
export function TangoSymbolGlyph({
  value,
  visualMode,
  size = "board",
}: {
  value: 1 | 2;
  visualMode: TangoVisualMode;
  size?: "board" | "sm" | "xs";
}) {
  const dim =
    size === "board"
      ? "h-[60%] w-[60%]"
      : size === "sm"
      ? "h-4 w-4"
      : "h-3.5 w-3.5";

  if (visualMode === "circles") {
    if (value === 1) {
      // Warm Yellow/Orange solid circle
      return (
        <span
          className={`${dim} inline-block rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_2px_6px_-1px_rgba(234,88,12,0.35)] dark:from-amber-300 dark:to-orange-500`}
        />
      );
    }
    // Crisp Blue solid circle
    return (
      <span
        className={`${dim} inline-block rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.4),0_2px_6px_-1px_rgba(37,99,235,0.35)] dark:from-sky-400 dark:to-blue-500`}
      />
    );
  }

  // Icon Mode: Warm Sun & Crisp Blue Moon
  if (value === 1) {
    return (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className={`${dim} drop-shadow-[0_1px_2px_rgba(234,88,12,0.22)]`}
        aria-hidden="true"
      >
        <circle cx="14" cy="14" r="5.6" fill="url(#tangoSunGrad)" />
        <g
          stroke="#EA580C"
          strokeWidth="2.1"
          strokeLinecap="round"
          className="dark:stroke-amber-400"
        >
          <line x1="14" y1="2.8" x2="14" y2="5.4" />
          <line x1="14" y1="22.6" x2="14" y2="25.2" />
          <line x1="2.8" y1="14" x2="5.4" y2="14" />
          <line x1="22.6" y1="14" x2="25.2" y2="14" />
          <line x1="6.1" y1="6.1" x2="7.9" y2="7.9" />
          <line x1="20.1" y1="20.1" x2="21.9" y2="21.9" />
          <line x1="21.9" y1="6.1" x2="20.1" y2="7.9" />
          <line x1="7.9" y1="20.1" x2="6.1" y2="21.9" />
        </g>
        <defs>
          <linearGradient id="tangoSunGrad" x1="8" y1="8" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Crisp Blue Moon
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={`${dim} drop-shadow-[0_1px_2px_rgba(37,99,235,0.22)]`}
      aria-hidden="true"
    >
      <path
        d="M20.6 17.6A8.6 8.6 0 0 1 10.4 7.4a8.6 8.6 0 1 0 10.2 10.2Z"
        fill="url(#tangoMoonGrad)"
        stroke="#2563EB"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="dark:stroke-sky-300"
      />
      <defs>
        <linearGradient id="tangoMoonGrad" x1="7" y1="6" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TangoBoard({
  puzzle,
  grid,
  visualMode,
  violations,
  activeHint,
  disabled,
  onCellTap,
}: TangoBoardProps) {
  const hintTargetKey = activeHint
    ? cellKey(activeHint.targetCell[0], activeHint.targetCell[1])
    : null;

  const hintSecondaryKeys = new Set(
    activeHint ? activeHint.highlightCells.map(([r, c]) => cellKey(r, c)) : []
  );

  const hintConstraintKeys = new Set(
    activeHint ? activeHint.highlightConstraints.map(constraintKey) : []
  );

  return (
    <div
      className="glass-card relative w-full max-w-[376px] select-none rounded-2xl p-2.5"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      {/* Inner strict 6x6 coordinate frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-neutral-300/70 bg-white/75 dark:border-white/[0.12] dark:bg-neutral-900/65">
        {/* 6x6 Cell Grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const key = cellKey(r, c);
              const locked = isLockedCell(puzzle, r, c);
              const isViolated = violations.cells.has(key);
              const isHintTarget = hintTargetKey === key;
              const isHintSecondary = !isHintTarget && hintSecondaryKeys.has(key);
              const isHintLine =
                activeHint?.axis === "row"
                  ? activeHint.lineIndex === r
                  : activeHint?.axis === "col"
                  ? activeHint.lineIndex === c
                  : false;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled || locked}
                  onPointerDown={(e) => {
                    if (disabled || locked) return;
                    e.preventDefault();
                    onCellTap(r, c);
                  }}
                  aria-label={`Row ${r + 1} Column ${c + 1}${locked ? " locked" : ""}`}
                  className={`relative flex h-full w-full items-center justify-center border-r border-b border-neutral-200/85 transition-colors duration-150 focus:outline-none dark:border-white/[0.08] ${
                    c === 5 ? "border-r-0" : ""
                  } ${r === 5 ? "border-b-0" : ""} ${
                    locked
                      ? "cursor-default bg-neutral-900/[0.05] dark:bg-white/[0.075]"
                      : "cursor-pointer bg-transparent active:bg-neutral-900/[0.04] dark:active:bg-white/[0.06]"
                  }`}
                >
                  {/* Subtle hint row/col wash */}
                  {isHintLine && !isHintTarget && !isViolated && (
                    <span className="pointer-events-none absolute inset-0 bg-orange-500/[0.05] dark:bg-orange-400/[0.07]" />
                  )}

                  {/* Hint secondary evidence highlight */}
                  {isHintSecondary && !isViolated && (
                    <span className="pointer-events-none absolute inset-[2px] rounded-[9px] bg-orange-500/[0.11] ring-1 ring-orange-500/35 dark:bg-orange-400/[0.14] dark:ring-orange-400/40" />
                  )}

                  {/* Hint target highlight (error = rose, deduction = orange/amber) */}
                  {isHintTarget && (
                    <motion.span
                      layoutId="tango-hint-ring"
                      initial={{ opacity: 0.4, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`pointer-events-none absolute inset-[2px] rounded-[10px] ring-2 ${
                        activeHint?.kind === "error"
                          ? "bg-rose-500/[0.14] ring-rose-500/80 dark:bg-rose-500/[0.18] dark:ring-rose-400"
                          : "bg-orange-500/[0.14] ring-orange-500/85 dark:bg-orange-400/[0.18] dark:ring-orange-400"
                      }`}
                    />
                  )}

                  {/* Delayed red violation overlay */}
                  {isViolated && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.16 }}
                      className="pointer-events-none absolute inset-[2px] rounded-[9px] bg-rose-500/[0.15] ring-1.5 ring-rose-500/65 dark:bg-rose-500/[0.2] dark:ring-rose-400/75"
                    />
                  )}

                  {/* Symbol Glyph with spring pop */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {val !== 0 && (
                      <motion.div
                        key={`${key}-${val}-${visualMode}`}
                        initial={{ scale: 0.55, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 26,
                          mass: 0.7,
                        }}
                        className="relative z-10 flex h-full w-full items-center justify-center"
                      >
                        <TangoSymbolGlyph
                          value={val}
                          visualMode={visualMode}
                          size="board"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })
          )}
        </div>

        {/* Edge Constraints (= and ×) centered on borders between cells */}
        {puzzle.constraints.map((con) => {
          const cKey = constraintKey(con);
          const isHorizontal = con.r1 === con.r2;
          const leftPct = isHorizontal
            ? ((con.c1 + 1) / 6) * 100
            : ((con.c1 + 0.5) / 6) * 100;
          const topPct = isHorizontal
            ? ((con.r1 + 0.5) / 6) * 100
            : ((con.r1 + 1) / 6) * 100;

          const isViolated = violations.constraints.has(cKey);
          const isHinted = hintConstraintKeys.has(cKey);

          return (
            <div
              key={cKey}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              aria-hidden="true"
              className={`pointer-events-none absolute z-20 flex h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-xs transition-colors duration-150 ${
                isViolated
                  ? "border-rose-500 bg-rose-500 text-white dark:border-rose-400 dark:bg-rose-500"
                  : isHinted
                  ? "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-400 dark:text-neutral-950"
                  : "border-neutral-300/90 bg-white/95 text-neutral-700 dark:border-white/20 dark:bg-neutral-800/95 dark:text-neutral-200"
              }`}
            >
              {con.type === "same" ? (
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="h-3 w-3 shrink-0"
                >
                  <line
                    x1="3"
                    y1="4.25"
                    x2="9"
                    y2="4.25"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <line
                    x1="3"
                    y1="7.75"
                    x2="9"
                    y2="7.75"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="h-3 w-3 shrink-0"
                >
                  <line
                    x1="3.25"
                    y1="3.25"
                    x2="8.75"
                    y2="8.75"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <line
                    x1="8.75"
                    y1="3.25"
                    x2="3.25"
                    y2="8.75"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
