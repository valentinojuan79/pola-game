"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lock } from "lucide-react";
import {
  evaluateCandidateRect,
  evaluateFreeRect,
  normalizeRect,
  rectContainsCell,
  type FreeRectCheckResult,
} from "@/lib/games/patches/engine";
import {
  getPatchColor,
  type PatchClue,
  type PatchRect,
  type PatchesPuzzle,
  type PlayerPatch,
} from "@/lib/games/patches/types";
import { feedback } from "@/lib/feedback";

interface PatchesBoardProps {
  puzzle: PatchesPuzzle;
  patches: Record<string, PlayerPatch>;
  wrongClueId: string | null;
  disabled?: boolean;
  onCommitPatch: (clueId: string, rect: PatchRect) => void;
  onRemovePatch: (clueId: string) => void;
}

interface ActiveDrag {
  rect: PatchRect;
  check: FreeRectCheckResult;
  validPopKey: number;
}

/**
 * Picks a corner inside `rect` that does NOT contain `clue` so live counters,
 * error indicators, and lock badges never overlap the clue badge.
 * For a 1×1 rect centered on the clue itself, floats cleanly just outside top/bottom.
 */
function getSafeCornerClass(rect: PatchRect, clue: PatchClue | null): string {
  const isSingleCell = rect.r1 === rect.r2 && rect.c1 === rect.c2;
  if (isSingleCell) {
    // Float just outside the cell so the clue inside stays 100% unobstructed
    return rect.r1 === 0
      ? "-bottom-2.5 left-1/2 -translate-x-1/2"
      : "-top-2.5 left-1/2 -translate-x-1/2";
  }

  if (!clue) {
    return "top-1 right-1";
  }

  const corners: Array<{ r: number; c: number; cls: string }> = [
    { r: rect.r1, c: rect.c2, cls: "top-1 right-1" },
    { r: rect.r1, c: rect.c1, cls: "top-1 left-1" },
    { r: rect.r2, c: rect.c2, cls: "bottom-1 right-1" },
    { r: rect.r2, c: rect.c1, cls: "bottom-1 left-1" },
  ];

  for (const corner of corners) {
    if (corner.r !== clue.row || corner.c !== clue.col) {
      return corner.cls;
    }
  }

  return "top-1 right-1";
}

export function PatchesBoard({
  puzzle,
  patches,
  wrongClueId,
  disabled = false,
  onCommitPatch,
  onRemovePatch,
}: PatchesBoardProps) {
  const n = puzzle.size;
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  const dragMetaRef = useRef<{
    downRow: number;
    downCol: number;
    lastRow: number;
    lastCol: number;
    hasDragged: boolean;
    hitPatchClueId: string | null;
    wasValid: boolean;
    wasConflict: boolean;
    validPopKey: number;
  } | null>(null);

  const clueById = useMemo(() => {
    const map = new Map<string, PatchClue>();
    for (const c of puzzle.clues) {
      map.set(c.id, c);
    }
    return map;
  }, [puzzle.clues]);

  const getCellFromPoint = (
    clientX: number,
    clientY: number
  ): [number, number] | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const c = Math.min(
      n - 1,
      Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * n))
    );
    const r = Math.min(
      n - 1,
      Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * n))
    );
    return [r, c];
  };

  const findPatchAtCell = (r: number, c: number): PlayerPatch | null => {
    for (const patch of Object.values(patches)) {
      if (rectContainsCell(patch.rect, r, c)) {
        return patch;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const [r, c] = cell;

    // Cannot start a gesture on a hint-locked patch
    const hitPatch = findPatchAtCell(r, c);
    if (hitPatch?.locked) {
      feedback.click();
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    const initialRect = normalizeRect(r, c, r, c);
    const initialCheck = evaluateFreeRect(puzzle, initialRect, patches);

    dragMetaRef.current = {
      downRow: r,
      downCol: c,
      lastRow: r,
      lastCol: c,
      hasDragged: false,
      hitPatchClueId: hitPatch ? hitPatch.clueId : null,
      wasValid: initialCheck.valid,
      wasConflict: initialCheck.hasConflict,
      validPopKey: initialCheck.valid ? 1 : 0,
    };

    // If starting on an empty/uncovered cell, show immediate 1×1 preview
    if (!hitPatch) {
      feedback.click();
      setActiveDrag({
        rect: initialRect,
        check: initialCheck,
        validPopKey: initialCheck.valid ? 1 : 0,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const meta = dragMetaRef.current;
    if (!meta || disabled) return;

    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const [r, c] = cell;

    if (r === meta.lastRow && c === meta.lastCol) return;

    meta.lastRow = r;
    meta.lastCol = c;
    meta.hasDragged = true;

    const rect = normalizeRect(meta.downRow, meta.downCol, r, c);
    const check = evaluateFreeRect(puzzle, rect, patches);

    if (check.valid) {
      meta.validPopKey += 1;
      feedback.pop();
    } else if (check.hasConflict && !meta.wasConflict) {
      feedback.warn();
    } else if (!check.hasConflict) {
      feedback.click();
    }

    meta.wasValid = check.valid;
    meta.wasConflict = check.hasConflict;

    setActiveDrag({
      rect,
      check,
      validPopKey: meta.validPopKey,
    });
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const meta = dragMetaRef.current;
    if (!meta) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const { downRow, downCol, lastRow, lastCol, hasDragged, hitPatchClueId } =
      meta;
    dragMetaRef.current = null;
    setActiveDrag(null);

    if (!hasDragged) {
      // Single tap on an existing unlocked patch clears/removes it
      if (hitPatchClueId) {
        onRemovePatch(hitPatchClueId);
      }
      return;
    }

    const finalRect = normalizeRect(downRow, downCol, lastRow, lastCol);
    const finalCheck = evaluateFreeRect(puzzle, finalRect, patches);

    if (
      (finalCheck.status === "valid" || finalCheck.status === "error") &&
      finalCheck.clue
    ) {
      // Always keep non-overlapping 1-clue patches (valid or error state)
      onCommitPatch(finalCheck.clue.id, finalRect);
    } else if (finalCheck.hasConflict) {
      feedback.warn();
    }
    // If neutral (0 clues inside), simply clear the preview
  };

  // Compute font sizing for clue numbers based on grid size
  const clueTextSize =
    n <= 6
      ? "text-[14px]"
      : n === 7
      ? "text-[13px]"
      : "text-[12px]";

  // Which clue is currently being replaced by an active drag preview
  const draggingClueId = activeDrag?.check.clue?.id ?? null;

  return (
    <div className="relative w-full max-w-[390px] rounded-2xl border border-rose-500/20 bg-white/75 p-2.5 shadow-[0_8px_30px_-10px_rgba(225,29,72,0.10),inset_0_1px_0_0_rgba(255,255,255,0.65)] backdrop-blur-2xl dark:border-rose-400/18 dark:bg-neutral-900/65 dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{ touchAction: "none", overscrollBehavior: "none" }}
        className="relative aspect-square w-full select-none overflow-hidden rounded-xl border border-black/[0.08] bg-white/85 dark:border-white/[0.10] dark:bg-neutral-950/60"
      >
        {/* Layer 1: Static equal-sized grid cells (zero resizing) */}
        <div
          className="grid aspect-square w-full"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: n * n }).map((_, idx) => {
            const r = Math.floor(idx / n);
            const c = idx % n;
            return (
              <div
                key={`cell-${r}-${c}`}
                className="border-r border-b border-black/[0.06] last:border-r-0 dark:border-white/[0.07]"
                style={{
                  borderRightWidth: c === n - 1 ? 0 : 1,
                  borderBottomWidth: r === n - 1 ? 0 : 1,
                }}
              />
            );
          })}
        </div>

        {/* Layer 2: Committed Patches (Valid + Error State) */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {Object.values(patches).map((patch) => {
              // Hide existing patch while actively re-dragging a rectangle linked to this same clue
              if (draggingClueId && draggingClueId === patch.clueId) {
                return null;
              }
              const clue = clueById.get(patch.clueId);
              if (!clue) return null;
              const theme = getPatchColor(clue.colorIndex);
              const patchCheck = evaluateCandidateRect(
                puzzle,
                clue,
                patch.rect,
                patches
              );
              const isErrorState = !patchCheck.valid;
              const isHintFlagged = wrongClueId === patch.clueId;
              const cornerClass = getSafeCornerClass(patch.rect, clue);

              const left = `${(patch.rect.c1 / n) * 100}%`;
              const top = `${(patch.rect.r1 / n) * 100}%`;
              const width = `${((patch.rect.c2 - patch.rect.c1 + 1) / n) * 100}%`;
              const height = `${((patch.rect.r2 - patch.rect.r1 + 1) / n) * 100}%`;

              return (
                <motion.div
                  key={`patch-${patch.clueId}-${patch.rect.r1}-${patch.rect.c1}-${patch.rect.r2}-${patch.rect.c2}`}
                  initial={{ scale: 0.94, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 28 }}
                  style={{ left, top, width, height }}
                  className="absolute p-[2.5px]"
                >
                  <div
                    className={`relative h-full w-full rounded-[11px] border-[2.5px] transition-colors ${
                      isHintFlagged
                        ? "border-red-500 bg-red-500/20 ring-2 ring-red-500/40 dark:border-red-400 dark:bg-red-500/25"
                        : isErrorState
                        ? "border-dashed border-red-500/85 bg-red-500/[0.13] dark:border-red-400/85 dark:bg-red-500/[0.18]"
                        : `${theme.fillClass} ${theme.borderClass}`
                    }`}
                  >
                    {/* Lock indicator for hint-locked patches */}
                    {patch.locked && (
                      <div
                        className={`absolute z-30 flex h-4 w-4 items-center justify-center rounded-full bg-white/85 text-neutral-600 shadow-xs dark:bg-neutral-900/85 dark:text-neutral-300 ${cornerClass}`}
                      >
                        <Lock className="h-2.5 w-2.5" />
                      </div>
                    )}

                    {/* Error state badge showing mismatch without overlapping the clue */}
                    {isErrorState && !patch.locked && (
                      <div
                        className={`absolute z-30 flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-[1px] text-[9.5px] font-bold leading-tight text-white tabular-nums shadow-xs dark:bg-red-500/95 ${cornerClass}`}
                      >
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                        <span>
                          {clue.area !== null && patchCheck.area !== clue.area
                            ? `${patchCheck.area}/${clue.area}`
                            : `${patchCheck.width}×${patchCheck.height}`}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Layer 3: Active Drag Preview */}
        {activeDrag && (() => {
          const { rect, check, validPopKey } = activeDrag;
          const clue = check.clue;
          const theme = clue ? getPatchColor(clue.colorIndex) : null;
          const cornerClass = getSafeCornerClass(rect, clue);

          const left = `${(rect.c1 / n) * 100}%`;
          const top = `${(rect.r1 / n) * 100}%`;
          const width = `${((rect.c2 - rect.c1 + 1) / n) * 100}%`;
          const height = `${((rect.r2 - rect.r1 + 1) / n) * 100}%`;

          let boxStyle = "";
          if (check.hasConflict) {
            boxStyle =
              "border-[2.5px] border-dashed border-red-500/90 bg-red-500/18 dark:border-red-400 dark:bg-red-500/22";
          } else if (check.status === "neutral" || !theme) {
            boxStyle =
              "border-[2px] border-dashed border-neutral-400/75 bg-neutral-500/[0.08] dark:border-neutral-500/75 dark:bg-white/[0.08]";
          } else if (check.valid) {
            boxStyle = `border-[2.5px] border-solid ${theme.borderClass} ${theme.fillClass} shadow-sm`;
          } else {
            boxStyle = `border-[2px] border-dashed ${theme.dashedBorderClass} ${theme.fillClass}`;
          }

          return (
            <motion.div
              key={`drag-box-${clue?.id ?? "neutral"}-${validPopKey}`}
              initial={check.valid ? { scale: 0.96 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 560, damping: 24 }}
              style={{ left, top, width, height }}
              className="pointer-events-none absolute z-30 p-[2.5px]"
            >
              <div
                className={`relative h-full w-full rounded-[11px] transition-colors ${boxStyle}`}
              >
                {/* Live area / dimension counter positioned in a non-clue corner */}
                {clue && theme && !check.valid && !check.hasConflict && (
                  <div
                    className={`absolute z-30 rounded-full px-1.5 py-[1px] text-[9.5px] font-bold leading-tight tabular-nums shadow-xs ${theme.counterClass} ${cornerClass}`}
                  >
                    {clue.area !== null
                      ? `${check.area}/${clue.area}`
                      : `${check.width}×${check.height}`}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* Layer 4: Clue Badges (4 distinct iOS visual shapes) */}
        <div
          className="pointer-events-none absolute inset-0 z-20 grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          }}
        >
          {puzzle.clues.map((clue) => {
            const theme = getPatchColor(clue.colorIndex);
            const isPlaced = Boolean(patches[clue.id]);

            return (
              <div
                key={clue.id}
                style={{
                  gridRowStart: clue.row + 1,
                  gridColumnStart: clue.col + 1,
                }}
                className="flex items-center justify-center p-[3px]"
              >
                {clue.shape === "any" ? (
                  /* Dashed overlapping rounded shape badge for Free Rectangle */
                  <div className="relative flex h-[66%] w-[66%] items-center justify-center">
                    <div
                      className={`absolute -top-[2px] -left-[2px] h-[82%] w-[82%] rounded-[7px] border-[1.5px] border-dashed opacity-55 ${theme.anyBadgeClass}`}
                    />
                    <div
                      className={`relative flex h-[86%] w-[86%] translate-x-[1.5px] translate-y-[1.5px] items-center justify-center rounded-[7px] border-[1.8px] border-dashed backdrop-blur-xs shadow-xs ${theme.anyBadgeClass}`}
                    >
                      {clue.area !== null && (
                        <span
                          className={`font-display font-bold leading-none tabular-nums ${clueTextSize}`}
                        >
                          {clue.area}
                        </span>
                      )}
                    </div>
                  </div>
                ) : clue.shape === "square" ? (
                  /* Solid rounded square badge */
                  <div
                    className={`flex h-[60%] w-[60%] items-center justify-center rounded-[7px] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition-transform ${
                      theme.badgeClass
                    } ${isPlaced ? "scale-95" : "scale-100"}`}
                  >
                    {clue.area !== null && (
                      <span
                        className={`font-display font-bold leading-none tabular-nums ${clueTextSize}`}
                      >
                        {clue.area}
                      </span>
                    )}
                  </div>
                ) : clue.shape === "horizontal" ? (
                  /* Solid rounded wide pill/rectangle badge */
                  <div
                    className={`flex h-[46%] w-[78%] items-center justify-center rounded-[7px] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition-transform ${
                      theme.badgeClass
                    } ${isPlaced ? "scale-95" : "scale-100"}`}
                  >
                    {clue.area !== null && (
                      <span
                        className={`font-display font-bold leading-none tabular-nums ${clueTextSize}`}
                      >
                        {clue.area}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Solid rounded tall pill/rectangle badge */
                  <div
                    className={`flex h-[78%] w-[46%] items-center justify-center rounded-[7px] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition-transform ${
                      theme.badgeClass
                    } ${isPlaced ? "scale-95" : "scale-100"}`}
                  >
                    {clue.area !== null && (
                      <span
                        className={`font-display font-bold leading-none tabular-nums ${clueTextSize}`}
                      >
                        {clue.area}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
