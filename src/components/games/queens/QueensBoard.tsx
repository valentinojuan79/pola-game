"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, X as XIcon } from "lucide-react";
import type {
  QueensBoardState,
  QueensPuzzle,
  QueensValidation,
} from "@/lib/games/queens/types";

/**
 * Crisp, saturated-yet-pastel modern iOS region palette (9 distinct tones).
 * High contrast for Crowns & X marks in both Light & Dark modes.
 */
const REGION_STYLES: { light: string; dark: string }[] = [
  { light: "bg-[#BAE6FD]", dark: "dark:bg-[#0E4A6F]" }, // 0: Sky Blue
  { light: "bg-[#A7F3D0]", dark: "dark:bg-[#0D5A43]" }, // 1: Mint Emerald
  { light: "bg-[#FECACA]", dark: "dark:bg-[#7A272D]" }, // 2: Coral Rose
  { light: "bg-[#FDE68A]", dark: "dark:bg-[#6E5316]" }, // 3: Sunlit Amber
  { light: "bg-[#FED7AA]", dark: "dark:bg-[#733A19]" }, // 4: Warm Apricot
  { light: "bg-[#99F6E4]", dark: "dark:bg-[#125B58]" }, // 5: Crisp Teal
  { light: "bg-[#FBCFE8]", dark: "dark:bg-[#752750]" }, // 6: Blossom Pink
  { light: "bg-[#D9F99D]", dark: "dark:bg-[#3F5E17]" }, // 7: Fresh Lime
  { light: "bg-[#CBD5E1]", dark: "dark:bg-[#334155]" }, // 8: Cool Slate
];

interface QueensBoardProps {
  puzzle: QueensPuzzle;
  board: QueensBoardState;
  validation: QueensValidation;
  disabled?: boolean;
  onTapCell: (row: number, col: number) => void;
  onDragStart: () => void;
  onDragCell: (row: number, col: number, mode: "mark" | "erase") => void;
}

export function QueensBoard({
  puzzle,
  board,
  validation,
  disabled = false,
  onTapCell,
  onDragStart,
  onDragCell,
}: QueensBoardProps) {
  const n = puzzle.size;

  const pointerActiveRef = useRef(false);
  const startCellRef = useRef<[number, number] | null>(null);
  const lastCellKeyRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<"mark" | "erase" | null>(null);

  const getCellFromPoint = (
    clientX: number,
    clientY: number
  ): [number, number] | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const cellEl = (el as HTMLElement).closest?.("[data-q-cell]") as HTMLElement | null;
    if (!cellEl) return null;
    const r = Number(cellEl.dataset.row);
    const c = Number(cellEl.dataset.col);
    if (Number.isNaN(r) || Number.isNaN(c)) return null;
    return [r, c];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = getCellFromPoint(e.clientX, e.clientY);
    if (!target) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const [r, c] = target;
    pointerActiveRef.current = true;
    startCellRef.current = [r, c];
    lastCellKeyRef.current = `${r},${c}`;
    isDraggingRef.current = false;

    const current = board.cells[r][c];
    if (current === "empty") {
      dragModeRef.current = "mark";
    } else if (current === "x") {
      dragModeRef.current = "erase";
    } else {
      dragModeRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !pointerActiveRef.current || !dragModeRef.current) return;
    const target = getCellFromPoint(e.clientX, e.clientY);
    if (!target) return;

    const [r, c] = target;
    const key = `${r},${c}`;
    if (key === lastCellKeyRef.current) return;

    if (!isDraggingRef.current && startCellRef.current) {
      isDraggingRef.current = true;
      onDragStart();
      const [sr, sc] = startCellRef.current;
      onDragCell(sr, sc, dragModeRef.current);
    }

    lastCellKeyRef.current = key;
    onDragCell(r, c, dragModeRef.current);
  };

  const handlePointerUp = () => {
    if (!pointerActiveRef.current) return;
    if (!isDraggingRef.current && startCellRef.current && !disabled) {
      const [r, c] = startCellRef.current;
      onTapCell(r, c);
    }
    pointerActiveRef.current = false;
    startCellRef.current = null;
    lastCellKeyRef.current = null;
    isDraggingRef.current = false;
    dragModeRef.current = null;
  };

  const iconSize = n >= 9 ? "h-4 w-4" : n >= 8 ? "h-[18px] w-[18px]" : "h-5 w-5";
  const xSize = n >= 9 ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className="glass-card w-full rounded-[26px] p-2.5">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          touchAction: "none",
          overscrollBehavior: "none",
        }}
        className="grid aspect-square w-full select-none overflow-hidden rounded-[18px] border-[2.5px] border-neutral-900 dark:border-white/75"
      >
        {puzzle.regions.map((rowRegions, r) =>
          rowRegions.map((reg, c) => {
            const cell = board.cells[r][c];
            const isLocked = board.lockedCrowns[r][c];
            const isAutoX = board.autoXMask[r][c];
            const cellKey = `${r},${c}`;
            const isConflict = validation.conflictCells.has(cellKey);

            // Crisp 2.5px borders between different color regions; subtle 1px inside same region
            const diffTop = r > 0 && puzzle.regions[r - 1][c] !== reg;
            const diffLeft = c > 0 && puzzle.regions[r][c - 1] !== reg;

            const style = REGION_STYLES[reg % REGION_STYLES.length];

            const borderClasses = [
              r === 0
                ? ""
                : diffTop
                ? "border-t-[2.5px] border-t-neutral-900 dark:border-t-white/75"
                : "border-t border-t-black/[0.09] dark:border-t-white/[0.1]",
              c === 0
                ? ""
                : diffLeft
                ? "border-l-[2.5px] border-l-neutral-900 dark:border-l-white/75"
                : "border-l border-l-black/[0.09] dark:border-l-white/[0.1]",
            ].join(" ");

            return (
              <div
                key={cellKey}
                data-q-cell="true"
                data-row={r}
                data-col={c}
                className={`relative overflow-hidden ${style.light} ${style.dark} ${borderClasses}`}
              >
                {/* Conflict wash */}
                {isConflict && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pointer-events-none absolute inset-0 bg-red-500/30 ring-2 ring-inset ring-red-600/80 dark:ring-red-400/80"
                  />
                )}

                {/* Absolute layer prevents any layout/row height shifts */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {cell === "x" && (
                      <motion.span
                        key="x"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: isAutoX ? 0.35 : 0.7 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.11 }}
                        className="text-neutral-900 dark:text-white"
                      >
                        <XIcon className={`${xSize} stroke-[2.4]`} />
                      </motion.span>
                    )}

                    {cell === "crown" && (
                      <motion.div
                        key="crown"
                        initial={{ scale: 0.35, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: isConflict ? [0, -2, 2, -1.5, 1.5, 0] : 0,
                        }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 24,
                          x: { duration: 0.3 },
                        }}
                        className="relative flex items-center justify-center"
                      >
                        <Crown
                          className={`${iconSize} ${
                            isConflict
                              ? "fill-red-600 text-red-700 dark:fill-red-400 dark:text-red-200"
                              : "fill-neutral-900 text-neutral-900 dark:fill-white dark:text-white"
                          } drop-shadow-[0_1px_1px_rgba(0,0,0,0.14)]`}
                        />
                        {isLocked && (
                          <span className="absolute -right-1.5 -bottom-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                            <Lock className="h-2 w-2 stroke-[2.5]" />
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
