"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import {
  FOLD_COLORS,
  type FoldBounds,
  type FoldCell,
  type FoldColor,
  type FoldDirection,
  type FoldMove,
} from "@/lib/games/fold/types";
import { getValidFolds, isValidFold } from "@/lib/games/fold/engine";

interface FoldBoardProps {
  size: number;
  cells: FoldCell[][];
  bounds: FoldBounds;
  hintMove: FoldMove | null;
  disabled: boolean;
  onFold: (move: FoldMove) => void;
}

const COLOR_STYLES: Record<
  FoldColor,
  {
    dotBg: string;
    dotShadow: string;
    ringBorder: string;
    ringBg: string;
    haloBg: string;
  }
> = {
  lavender: {
    dotBg: "bg-gradient-to-br from-[#A78BFA] to-[#6D28D9]",
    dotShadow: "shadow-[0_2px_8px_-1px_rgba(109,40,217,0.45)]",
    ringBorder: "border-[#7C3AED] dark:border-[#A78BFA]",
    ringBg: "bg-[#7C3AED]/[0.08] dark:bg-[#A78BFA]/[0.12]",
    haloBg: "bg-[#8B5CF6]/20 dark:bg-[#A78BFA]/25",
  },
  coral: {
    dotBg: "bg-gradient-to-br from-[#FB7185] to-[#E11D48]",
    dotShadow: "shadow-[0_2px_8px_-1px_rgba(225,29,72,0.42)]",
    ringBorder: "border-[#E11D48] dark:border-[#FB7185]",
    ringBg: "bg-[#F43F5E]/[0.08] dark:bg-[#FB7185]/[0.12]",
    haloBg: "bg-[#F43F5E]/20 dark:bg-[#FB7185]/25",
  },
  sky: {
    dotBg: "bg-gradient-to-br from-[#38BDF8] to-[#0284C7]",
    dotShadow: "shadow-[0_2px_8px_-1px_rgba(2,132,199,0.42)]",
    ringBorder: "border-[#0284C7] dark:border-[#38BDF8]",
    ringBg: "bg-[#0284C7]/[0.08] dark:bg-[#38BDF8]/[0.12]",
    haloBg: "bg-[#0EA5E9]/20 dark:bg-[#38BDF8]/25",
  },
  mint: {
    dotBg: "bg-gradient-to-br from-[#34D399] to-[#059669]",
    dotShadow: "shadow-[0_2px_8px_-1px_rgba(5,150,105,0.42)]",
    ringBorder: "border-[#059669] dark:border-[#34D399]",
    ringBg: "bg-[#059669]/[0.08] dark:bg-[#34D399]/[0.12]",
    haloBg: "bg-[#10B981]/20 dark:bg-[#34D399]/25",
  },
};

type CellToken =
  | { kind: "matched"; color: FoldColor }
  | { kind: "dot"; color: FoldColor }
  | { kind: "target"; color: FoldColor };

function buildCellTokens(cell: FoldCell): CellToken[] {
  const tokens: CellToken[] = [];
  for (const color of FOLD_COLORS) {
    let d = 0;
    let t = 0;
    for (const c of cell.dots) if (c === color) d++;
    for (const c of cell.targets) if (c === color) t++;
    const matched = Math.min(d, t);
    for (let i = 0; i < matched; i++) tokens.push({ kind: "matched", color });
    for (let i = 0; i < d - matched; i++) tokens.push({ kind: "dot", color });
    for (let i = 0; i < t - matched; i++) tokens.push({ kind: "target", color });
  }
  return tokens;
}

function CellContents({
  cell,
  size,
  compact = false,
}: {
  cell: FoldCell;
  size: number;
  compact?: boolean;
}) {
  const tokens = useMemo(() => buildCellTokens(cell), [cell]);
  if (tokens.length === 0) return null;

  const isMulti = tokens.length > 1;
  const isDense = tokens.length > 2;
  const baseSize = compact
    ? isDense
      ? "h-3.5 w-3.5"
      : isMulti
      ? "h-4.5 w-4.5"
      : size >= 5
      ? "h-6 w-6"
      : "h-7 w-7"
    : isDense
    ? "h-4 w-4"
    : isMulti
    ? "h-5 w-5"
    : size >= 5
    ? "h-7 w-7"
    : "h-8 w-8";

  return (
    <div
      className={`pointer-events-none flex h-full w-full items-center justify-center p-1 ${
        isMulti ? "flex-wrap gap-0.5 content-center" : ""
      }`}
    >
      {tokens.map((tok, idx) => {
        const s = COLOR_STYLES[tok.color];
        if (tok.kind === "matched") {
          return (
            <motion.div
              key={`m-${tok.color}-${idx}`}
              initial={{ scale: 0.72 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 460, damping: 20 }}
              className={`relative flex items-center justify-center rounded-full ${baseSize}`}
            >
              {/* Satisfied soft halo glow */}
              <span
                className={`absolute -inset-1 rounded-full ${s.haloBg} animate-pulse`}
              />
              {/* Outer hollow ring */}
              <span
                className={`relative flex h-full w-full items-center justify-center rounded-full border-[2.5px] ${s.ringBorder} bg-white/85 dark:bg-neutral-900/80`}
              >
                {/* Inner locked glossy dot */}
                <span
                  className={`relative h-[62%] w-[62%] rounded-full ${s.dotBg} ${s.dotShadow}`}
                >
                  <span className="absolute top-[15%] left-[18%] h-[32%] w-[32%] rounded-full bg-white/65" />
                </span>
              </span>
            </motion.div>
          );
        }

        if (tok.kind === "dot") {
          return (
            <div
              key={`d-${tok.color}-${idx}`}
              className={`relative rounded-full ${baseSize} ${s.dotBg} ${s.dotShadow} border border-white/40`}
            >
              {/* Glossy liquid specular highlight */}
              <span className="absolute top-[14%] left-[18%] h-[30%] w-[34%] rounded-full bg-white/65 blur-[0.3px]" />
            </div>
          );
        }

        // Hollow target ring
        return (
          <div
            key={`t-${tok.color}-${idx}`}
            className={`relative rounded-full border-[2.5px] ${baseSize} ${s.ringBorder} ${s.ringBg}`}
          >
            <span className="absolute inset-[24%] rounded-full border border-white/45 dark:border-white/15" />
          </div>
        );
      })}
    </div>
  );
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startR: number;
  startC: number;
  /** If drag began on a crease handle, lock to that crease line */
  lockedAxis: "vertical" | "horizontal" | null;
  lockedLine: number | null;
  activeMove: FoldMove | null;
  progress: number; // 0..1
}

export function FoldBoard({
  size,
  cells,
  bounds,
  hintMove,
  disabled,
  onFold,
}: FoldBoardProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const validFolds = useMemo(() => getValidFolds(bounds, size), [bounds, size]);

  // Crease lines that have at least one valid fold direction
  const validVerticalLines = useMemo(() => {
    const set = new Set<number>();
    for (const m of validFolds) {
      if (m.axis === "vertical") set.add(m.line);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [validFolds]);

  const validHorizontalLines = useMemo(() => {
    const set = new Set<number>();
    for (const m of validFolds) {
      if (m.axis === "horizontal") set.add(m.line);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [validFolds]);

  const pickBestMove = (
    axis: "vertical" | "horizontal",
    direction: FoldDirection,
    startR: number,
    startC: number,
    currPosCoord: number,
    lockedLine: number | null
  ): FoldMove | null => {
    if (lockedLine !== null) {
      const m: FoldMove = { axis, line: lockedLine, direction };
      return isValidFold(bounds, size, m) ? m : null;
    }

    const candidates = validFolds.filter(
      (m) => m.axis === axis && m.direction === direction
    );
    if (candidates.length === 0) return null;

    // Prefer crease lines where the starting cell lies ON the moving flap
    const coveringStart = candidates.filter((m) => {
      if (axis === "vertical") {
        return direction === "left" ? startC >= m.line : startC < m.line;
      }
      return direction === "up" ? startR >= m.line : startR < m.line;
    });

    const pool = coveringStart.length > 0 ? coveringStart : candidates;
    // Choose the crease closest to the midpoint between start cell center and current pointer
    const startCenter = axis === "vertical" ? startC + 0.5 : startR + 0.5;
    const targetCoord = (startCenter + currPosCoord) * 0.5;

    let best = pool[0];
    let bestDist = Math.abs(pool[0].line - targetCoord);
    for (let i = 1; i < pool.length; i++) {
      const dist = Math.abs(pool[i].line - targetCoord);
      if (dist < bestDist) {
        best = pool[i];
        bestDist = dist;
      }
    }
    return best;
  };

  const startDrag = (
    e: React.PointerEvent,
    lockedAxis: "vertical" | "horizontal" | null = null,
    lockedLine: number | null = null
  ) => {
    if (disabled) return;
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const rect = gridEl.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const col = Math.max(0, Math.min(size - 1, Math.floor((relX / rect.width) * size)));
    const row = Math.max(0, Math.min(size - 1, Math.floor((relY / rect.height) * size)));

    // If not starting from a crease handle, require starting on an active cell
    if (lockedLine === null) {
      if (
        row < bounds.minR ||
        row > bounds.maxR ||
        col < bounds.minC ||
        col > bounds.maxC
      ) {
        return;
      }
    }

    try {
      gridEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture unavailable
    }

    setDrag({
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startR: row,
      startC: col,
      lockedAxis,
      lockedLine,
      activeMove: null,
      progress: 0,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const rect = gridEl.getBoundingClientRect();
    const cellPx = rect.width / size;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      if (drag.activeMove !== null || drag.progress !== 0) {
        setDrag({ ...drag, activeMove: null, progress: 0 });
      }
      return;
    }

    const axis: "vertical" | "horizontal" =
      drag.lockedAxis ?? (Math.abs(dx) >= Math.abs(dy) ? "vertical" : "horizontal");

    const direction: FoldDirection =
      axis === "vertical"
        ? dx < 0
          ? "left"
          : "right"
        : dy < 0
        ? "up"
        : "down";

    const currCoord =
      axis === "vertical"
        ? ((e.clientX - rect.left) / rect.width) * size
        : ((e.clientY - rect.top) / rect.height) * size;

    const move = pickBestMove(
      axis,
      direction,
      drag.startR,
      drag.startC,
      currCoord,
      drag.lockedLine
    );

    if (!move) {
      setDrag({ ...drag, activeMove: null, progress: 0 });
      return;
    }

    const signedDelta = axis === "vertical" ? Math.abs(dx) : Math.abs(dy);
    const progress = Math.max(0, Math.min(1, signedDelta / (cellPx * 1.15)));

    setDrag({
      ...drag,
      activeMove: move,
      progress,
    });
  };

  const finishDrag = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const gridEl = gridRef.current;
    if (gridEl) {
      try {
        gridEl.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (drag.activeMove && drag.progress >= 0.38) {
      onFold(drag.activeMove);
    }
    setDrag(null);
  };

  // Compute flap cells & destination preview cells when dragging
  const activeMove = drag?.activeMove ?? null;
  const dragProgress = drag?.progress ?? 0;

  const isCellOnMovingFlap = (r: number, c: number): boolean => {
    if (!activeMove) return false;
    if (cells[r][c].layers === 0) return false;
    if (activeMove.axis === "vertical") {
      return activeMove.direction === "left"
        ? c >= activeMove.line
        : c < activeMove.line;
    }
    return activeMove.direction === "up"
      ? r >= activeMove.line
      : r < activeMove.line;
  };

  const destCellSet = useMemo(() => {
    const set = new Set<string>();
    if (!activeMove) return set;
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        if (cells[r][c].layers === 0) continue;
        if (activeMove.axis === "vertical") {
          if (activeMove.direction === "left" && c >= activeMove.line) {
            set.add(`${r},${2 * activeMove.line - 1 - c}`);
          } else if (activeMove.direction === "right" && c < activeMove.line) {
            set.add(`${r},${2 * activeMove.line - 1 - c}`);
          }
        } else {
          if (activeMove.direction === "up" && r >= activeMove.line) {
            set.add(`${2 * activeMove.line - 1 - r},${c}`);
          } else if (activeMove.direction === "down" && r < activeMove.line) {
            set.add(`${2 * activeMove.line - 1 - r},${c}`);
          }
        }
      }
    }
    return set;
  }, [activeMove, bounds, cells]);

  // 3D Flap geometry (in percentage of grid)
  const flapOverlayStyle = useMemo(() => {
    if (!activeMove) return null;
    const pct = (v: number) => `${(v / size) * 100}%`;

    let topR = bounds.minR;
    let botR = bounds.maxR + 1;
    let leftC = bounds.minC;
    let rightC = bounds.maxC + 1;

    if (activeMove.axis === "vertical") {
      if (activeMove.direction === "left") {
        leftC = activeMove.line;
      } else {
        rightC = activeMove.line;
      }
    } else {
      if (activeMove.direction === "up") {
        topR = activeMove.line;
      } else {
        botR = activeMove.line;
      }
    }

    const angle = dragProgress * 165;
    let transform = "";
    let transformOrigin = "center center";

    if (activeMove.axis === "vertical") {
      if (activeMove.direction === "left") {
        transformOrigin = "left center";
        transform = `rotateY(${-angle}deg)`;
      } else {
        transformOrigin = "right center";
        transform = `rotateY(${angle}deg)`;
      }
    } else {
      if (activeMove.direction === "up") {
        transformOrigin = "center top";
        transform = `rotateX(${angle}deg)`;
      } else {
        transformOrigin = "center bottom";
        transform = `rotateX(${-angle}deg)`;
      }
    }

    return {
      topR,
      botR,
      leftC,
      rightC,
      style: {
        top: pct(topR),
        left: pct(leftC),
        width: pct(rightC - leftC),
        height: pct(botR - topR),
        transformOrigin,
        transform,
      } as React.CSSProperties,
    };
  }, [activeMove, bounds, dragProgress, size]);

  const pct = (v: number) => `${(v / size) * 100}%`;

  // Active crease line to glow (dragged crease takes priority over hint crease)
  const highlightedCrease = activeMove ?? hintMove;

  return (
    <div className="glass-card relative aspect-square w-full max-w-[390px] touch-none overscroll-none select-none rounded-[28px] border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] via-white/75 to-violet-500/[0.05] p-3.5 dark:border-indigo-400/20 dark:from-indigo-500/[0.10] dark:via-neutral-900/65 dark:to-violet-500/[0.08]">
      <div
        ref={gridRef}
        onPointerDown={(e) => startDrag(e)}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className="relative h-full w-full"
        style={{ perspective: "920px" }}
      >
        {/* Base N×N Grid */}
        <div
          className="grid h-full w-full gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((row, r) =>
            row.map((cell, c) => {
              const isActive = cell.layers > 0;
              const onMovingFlap = isCellOnMovingFlap(r, c);
              const isDest = destCellSet.has(`${r},${c}`);

              const layerSurfaceClass = !isActive
                ? "border border-dashed border-indigo-400/18 bg-indigo-500/[0.02] dark:border-indigo-300/12 dark:bg-white/[0.015]"
                : cell.layers >= 3
                ? "border border-indigo-500/45 bg-indigo-100/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_3px_10px_-3px_rgba(99,102,241,0.22)] dark:border-indigo-300/40 dark:bg-indigo-900/65"
                : cell.layers === 2
                ? "border border-indigo-500/32 bg-indigo-50/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.92),0_2px_8px_-3px_rgba(99,102,241,0.16)] dark:border-indigo-300/28 dark:bg-indigo-950/60"
                : "border border-indigo-500/18 bg-white/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.88)] dark:border-white/12 dark:bg-neutral-800/75";

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center rounded-[14px] transition-all duration-200 ${layerSurfaceClass} ${
                    onMovingFlap ? "opacity-20 scale-[0.96]" : "opacity-100"
                  } ${
                    isDest && dragProgress > 0.08
                      ? "ring-2 ring-indigo-500/45 dark:ring-indigo-300/50"
                      : ""
                  }`}
                >
                  {isActive && <CellContents cell={cell} size={size} />}

                  {/* Subtle stacked glass layer indicator */}
                  {isActive && cell.layers >= 2 && !onMovingFlap && (
                    <span className="pointer-events-none absolute top-1 right-1.5 font-display text-[9px] font-bold tabular-nums text-indigo-600/70 dark:text-indigo-300/75">
                      {cell.layers}×
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live 3D Translucent Frosted Glass Folding Flap */}
        {activeMove && flapOverlayStyle && (
          <div
            className="pointer-events-none absolute z-20 rounded-[16px] border border-indigo-400/45 bg-indigo-100/65 shadow-[0_14px_30px_-8px_rgba(79,70,229,0.32)] backdrop-blur-md dark:border-indigo-300/40 dark:bg-indigo-900/55"
            style={{
              ...flapOverlayStyle.style,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <div
              className="grid h-full w-full gap-1.5 p-0.5"
              style={{
                gridTemplateColumns: `repeat(${
                  flapOverlayStyle.rightC - flapOverlayStyle.leftC
                }, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${
                  flapOverlayStyle.botR - flapOverlayStyle.topR
                }, minmax(0, 1fr))`,
              }}
            >
              {Array.from({
                length: flapOverlayStyle.botR - flapOverlayStyle.topR,
              }).map((_, ri) =>
                Array.from({
                  length: flapOverlayStyle.rightC - flapOverlayStyle.leftC,
                }).map((__, ci) => {
                  const r = flapOverlayStyle.topR + ri;
                  const c = flapOverlayStyle.leftC + ci;
                  const cell = cells[r][c];
                  return (
                    <div
                      key={`flap-${r}-${c}`}
                      className="flex items-center justify-center rounded-[12px] border border-white/55 bg-white/50 dark:border-white/15 dark:bg-white/[0.08]"
                    >
                      {cell.layers > 0 && (
                        <CellContents cell={cell} size={size} compact />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Glowing Active / Hint Crease Line */}
        {highlightedCrease && (
          <motion.div
            key={`${highlightedCrease.axis}-${highlightedCrease.line}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute z-30"
            style={
              highlightedCrease.axis === "vertical"
                ? {
                    left: pct(highlightedCrease.line),
                    top: pct(bounds.minR),
                    height: pct(bounds.maxR - bounds.minR + 1),
                    width: "3px",
                    transform: "translateX(-50%)",
                  }
                : {
                    top: pct(highlightedCrease.line),
                    left: pct(bounds.minC),
                    width: pct(bounds.maxC - bounds.minC + 1),
                    height: "3px",
                    transform: "translateY(-50%)",
                  }
            }
          >
            <div className="h-full w-full rounded-full bg-indigo-500 shadow-[0_0_12px_2px_rgba(99,102,241,0.55)] dark:bg-indigo-300 dark:shadow-[0_0_12px_2px_rgba(165,180,252,0.55)]" />
          </motion.div>
        )}

        {/* Visual Hint Animated Directional Swipe Arrow */}
        {hintMove && !activeMove && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              x:
                hintMove.direction === "left"
                  ? [6, -10, 6]
                  : hintMove.direction === "right"
                  ? [-6, 10, -6]
                  : 0,
              y:
                hintMove.direction === "up"
                  ? [6, -10, 6]
                  : hintMove.direction === "down"
                  ? [-6, 10, -6]
                  : 0,
            }}
            transition={{
              opacity: { duration: 0.2 },
              x: { repeat: Infinity, duration: 1.35, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 1.35, ease: "easeInOut" },
            }}
            className="pointer-events-none absolute z-30 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-400/50 bg-indigo-600 text-white shadow-[0_6px_18px_-3px_rgba(79,70,229,0.55)] dark:bg-indigo-400 dark:text-neutral-950"
            style={
              hintMove.axis === "vertical"
                ? {
                    left: pct(hintMove.line),
                    top: pct((bounds.minR + bounds.maxR + 1) / 2),
                  }
                : {
                    left: pct((bounds.minC + bounds.maxC + 1) / 2),
                    top: pct(hintMove.line),
                  }
            }
          >
            {hintMove.direction === "left" && <ArrowLeft className="h-4.5 w-4.5 stroke-[2.5]" />}
            {hintMove.direction === "right" && <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />}
            {hintMove.direction === "up" && <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />}
            {hintMove.direction === "down" && <ArrowDown className="h-4.5 w-4.5 stroke-[2.5]" />}
          </motion.div>
        )}

        {/* Subtle Interactive Crease Ticks / Handles along active sheet edges */}
        {!disabled &&
          validVerticalLines.map((line) => (
            <React.Fragment key={`vh-${line}`}>
              <button
                type="button"
                aria-label={`Vertical crease ${line}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, "vertical", line);
                }}
                className="absolute z-10 flex h-4 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  left: pct(line),
                  top: `calc(${pct(bounds.minR)} - 6px)`,
                }}
              >
                <span className="h-2.5 w-1 rounded-full bg-indigo-500/45 transition-colors hover:bg-indigo-600 dark:bg-indigo-300/45 dark:hover:bg-indigo-300" />
              </button>
              <button
                type="button"
                aria-label={`Vertical crease ${line} bottom`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, "vertical", line);
                }}
                className="absolute z-10 flex h-4 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  left: pct(line),
                  top: `calc(${pct(bounds.maxR + 1)} + 6px)`,
                }}
              >
                <span className="h-2.5 w-1 rounded-full bg-indigo-500/45 transition-colors hover:bg-indigo-600 dark:bg-indigo-300/45 dark:hover:bg-indigo-300" />
              </button>
            </React.Fragment>
          ))}

        {!disabled &&
          validHorizontalLines.map((line) => (
            <React.Fragment key={`hh-${line}`}>
              <button
                type="button"
                aria-label={`Horizontal crease ${line}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, "horizontal", line);
                }}
                className="absolute z-10 flex h-5 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  top: pct(line),
                  left: `calc(${pct(bounds.minC)} - 6px)`,
                }}
              >
                <span className="h-1 w-2.5 rounded-full bg-indigo-500/45 transition-colors hover:bg-indigo-600 dark:bg-indigo-300/45 dark:hover:bg-indigo-300" />
              </button>
              <button
                type="button"
                aria-label={`Horizontal crease ${line} right`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, "horizontal", line);
                }}
                className="absolute z-10 flex h-5 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  top: pct(line),
                  left: `calc(${pct(bounds.maxC + 1)} + 6px)`,
                }}
              >
                <span className="h-1 w-2.5 rounded-full bg-indigo-500/45 transition-colors hover:bg-indigo-600 dark:bg-indigo-300/45 dark:hover:bg-indigo-300" />
              </button>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
