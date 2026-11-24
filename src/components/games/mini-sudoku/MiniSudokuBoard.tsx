"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  cellKey,
  getBlockIndex,
  hasNote,
  isLockedCell,
} from "@/lib/games/mini-sudoku/engine";
import type {
  MiniSudokuDigit,
  MiniSudokuHint,
  MiniSudokuPuzzle,
  MiniSudokuValue,
} from "@/lib/games/mini-sudoku/types";

export interface WaveEffect {
  id: number;
  /** cellKey -> stagger delay in seconds */
  cellDelays: Map<string, number>;
}

interface MiniSudokuBoardProps {
  puzzle: MiniSudokuPuzzle;
  grid: MiniSudokuValue[][];
  notes: number[][];
  selectedCell: [number, number] | null;
  conflicts: Set<string>;
  activeHint: MiniSudokuHint | null;
  waveEffect: WaveEffect | null;
  disabled: boolean;
  onSelectCell: (r: number, c: number) => void;
}

const DIGITS: MiniSudokuDigit[] = [1, 2, 3, 4, 5, 6];

export function MiniSudokuBoard({
  puzzle,
  grid,
  notes,
  selectedCell,
  conflicts,
  activeHint,
  waveEffect,
  disabled,
  onSelectCell,
}: MiniSudokuBoardProps) {
  const selectedVal = selectedCell
    ? grid[selectedCell[0]][selectedCell[1]]
    : 0;
  const selectedBlock = selectedCell
    ? getBlockIndex(selectedCell[0], selectedCell[1])
    : -1;

  const hintTargetKey = activeHint
    ? cellKey(activeHint.targetCell[0], activeHint.targetCell[1])
    : null;

  const hintSecondaryKeys = useMemo(
    () =>
      new Set(
        activeHint ? activeHint.highlightCells.map(([r, c]) => cellKey(r, c)) : []
      ),
    [activeHint]
  );

  return (
    <div
      className="glass-card relative w-full max-w-[376px] select-none rounded-2xl p-2.5"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      {/* Inner strict 6x6 frame with crisp outer border */}
      <div className="relative w-full overflow-hidden rounded-xl border-[1.5px] border-neutral-400/75 bg-white/80 dark:border-white/[0.18] dark:bg-neutral-900/70">
        <div className="grid aspect-square w-full grid-cols-6 grid-rows-6">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const key = cellKey(r, c);
              const locked = isLockedCell(puzzle, r, c);
              const blockIdx = getBlockIndex(r, c);
              const isSelected =
                selectedCell !== null &&
                selectedCell[0] === r &&
                selectedCell[1] === c;
              const isPeer =
                !isSelected &&
                selectedCell !== null &&
                (selectedCell[0] === r ||
                  selectedCell[1] === c ||
                  selectedBlock === blockIdx);
              const isSameNumber =
                !isSelected && selectedVal !== 0 && val === selectedVal;

              const isConflict = conflicts.has(key);
              const isHintTarget = hintTargetKey === key;
              const isHintSecondary = !isHintTarget && hintSecondaryKeys.has(key);
              const isHintUnit =
                activeHint?.unit !== undefined &&
                ((activeHint.unit.type === "row" &&
                  activeHint.unit.index === r) ||
                  (activeHint.unit.type === "col" &&
                    activeHint.unit.index === c) ||
                  (activeHint.unit.type === "block" &&
                    activeHint.unit.index === blockIdx));

              const waveDelay = waveEffect?.cellDelays.get(key);
              const noteMask = notes[r][c];

              // Crisp thicker borders separating 2x3 blocks (2 rows x 3 cols):
              // Thick vertical divider after column 2 (c === 2)
              // Thick horizontal dividers after rows 1 and 3 (r === 1 || r === 3)
              const rightBorderClass =
                c === 5
                  ? "border-r-0"
                  : c === 2
                  ? "border-r-[2px] border-r-neutral-400/85 dark:border-r-white/[0.26]"
                  : "border-r border-r-neutral-200/85 dark:border-r-white/[0.08]";

              const bottomBorderClass =
                r === 5
                  ? "border-b-0"
                  : r === 1 || r === 3
                  ? "border-b-[2px] border-b-neutral-400/85 dark:border-b-white/[0.26]"
                  : "border-b border-b-neutral-200/85 dark:border-b-white/[0.08]";

              // Layered background tint priority (calm iOS tinted glass)
              let bgClass = "bg-transparent";
              if (isSelected) {
                bgClass = "bg-emerald-500/[0.18] dark:bg-emerald-400/[0.22]";
              } else if (isSameNumber) {
                bgClass = "bg-emerald-500/[0.13] dark:bg-emerald-400/[0.16]";
              } else if (isPeer) {
                bgClass = "bg-emerald-500/[0.045] dark:bg-emerald-400/[0.065]";
              } else if (locked) {
                bgClass = "bg-neutral-900/[0.04] dark:bg-white/[0.055]";
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onPointerDown={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    onSelectCell(r, c);
                  }}
                  aria-label={`Row ${r + 1} Column ${c + 1}${
                    val !== 0 ? ` value ${val}` : " empty"
                  }${locked ? " locked" : ""}`}
                  className={`relative flex h-full w-full items-center justify-center transition-colors duration-150 focus:outline-none ${rightBorderClass} ${bottomBorderClass} ${bgClass}`}
                >
                  {/* Subtle hint unit wash */}
                  {isHintUnit && !isHintTarget && !isConflict && (
                    <span className="pointer-events-none absolute inset-0 bg-emerald-500/[0.07] dark:bg-emerald-400/[0.09]" />
                  )}

                  {/* Hint secondary evidence highlight */}
                  {isHintSecondary && !isConflict && (
                    <span className="pointer-events-none absolute inset-[2px] rounded-[8px] bg-rose-500/[0.12] ring-1 ring-rose-500/45 dark:bg-rose-400/[0.15] dark:ring-rose-400/50" />
                  )}

                  {/* Selected cell crisp emerald ring */}
                  {isSelected && (
                    <span className="pointer-events-none absolute inset-[1.5px] z-10 rounded-[8px] ring-2 ring-inset ring-emerald-600/80 dark:ring-emerald-400/85" />
                  )}

                  {/* Conflict highlight (soft rose) */}
                  {isConflict && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.14 }}
                      className="pointer-events-none absolute inset-[2px] z-10 rounded-[8px] bg-rose-500/[0.16] ring-1.5 ring-rose-500/70 dark:bg-rose-500/[0.22] dark:ring-rose-400/80"
                    />
                  )}

                  {/* Active Hint target ring */}
                  {isHintTarget && (
                    <motion.span
                      layoutId="mini-sudoku-hint-ring"
                      initial={{ opacity: 0.4, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`pointer-events-none absolute inset-[2px] z-20 rounded-[9px] ring-2 ${
                        activeHint?.kind === "error"
                          ? "bg-rose-500/[0.14] ring-rose-500/85 dark:bg-rose-500/[0.2] dark:ring-rose-400"
                          : "bg-emerald-500/[0.14] ring-emerald-600/90 dark:bg-emerald-400/[0.18] dark:ring-emerald-400"
                      }`}
                    />
                  )}

                  {/* Staggered Emerald Wave overlay on Row/Col/Block completion */}
                  {waveEffect && waveDelay !== undefined && (
                    <motion.span
                      key={`wave-${waveEffect.id}-${key}`}
                      initial={{ opacity: 0, scale: 0.86 }}
                      animate={{
                        opacity: [0, 0.95, 0.55, 0],
                        scale: [0.86, 1.04, 1.01, 1],
                      }}
                      transition={{
                        duration: 0.68,
                        delay: waveDelay,
                        times: [0, 0.3, 0.65, 1],
                        ease: "easeOut",
                      }}
                      className="pointer-events-none absolute inset-[1.5px] z-20 rounded-[9px] bg-gradient-to-br from-emerald-400/50 via-teal-300/40 to-emerald-500/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] ring-1 ring-emerald-500/60 dark:from-emerald-400/45 dark:via-teal-400/35 dark:to-emerald-500/40 dark:ring-emerald-300/65"
                    />
                  )}

                  {/* Permanent Digit OR Pencil Notes */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {val !== 0 ? (
                      <motion.span
                        key={`${key}-val-${val}`}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.55, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 26,
                          mass: 0.65,
                        }}
                        className={`font-display relative z-10 tabular-nums text-[24px] leading-none sm:text-[26px] ${
                          isConflict
                            ? "font-bold text-rose-600 dark:text-rose-300"
                            : locked
                            ? "font-bold text-neutral-900 dark:text-white"
                            : "font-semibold text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {val}
                      </motion.span>
                    ) : noteMask !== 0 ? (
                      <div
                        key={`${key}-notes`}
                        className="relative z-10 grid h-full w-full grid-cols-3 grid-rows-2 place-items-center px-[3px] py-[4px]"
                      >
                        {DIGITS.map((d) => {
                          const active = hasNote(noteMask, d);
                          const isHighlightedNote =
                            active && selectedVal === d;
                          return (
                            <span
                              key={d}
                              className={`tabular-nums text-[10px] leading-none transition-colors ${
                                active
                                  ? isHighlightedNote
                                    ? "font-bold text-emerald-700 dark:text-emerald-300"
                                    : "font-medium text-neutral-500 dark:text-neutral-400"
                                  : "opacity-0"
                              }`}
                            >
                              {d}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </AnimatePresence>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
