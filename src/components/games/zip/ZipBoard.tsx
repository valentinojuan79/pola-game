"use client";

import React, { useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ZipCoord, ZipPuzzle } from "@/lib/games/zip/types";
import { coordKey, getHighestWaypointReached } from "@/lib/games/zip/engine";

interface ZipBoardProps {
  puzzle: ZipPuzzle;
  path: ZipCoord[];
  waypointMap: Map<string, number>;
  popCounters: Record<number, number>;
  disabled?: boolean;
  onDragStart: () => void;
  onStepToCell: (row: number, col: number) => void;
  onTrimToCell: (row: number, col: number, recordSnapshot: boolean) => void;
}

export function ZipBoard({
  puzzle,
  path,
  waypointMap,
  popCounters,
  disabled = false,
  onDragStart,
  onStepToCell,
  onTrimToCell,
}: ZipBoardProps) {
  const n = puzzle.size;
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Pointer gesture state
  const drawingRef = useRef(false);
  const snapshotPushedRef = useRef(false);
  const lastCellKeyRef = useRef<string | null>(null);
  const pressedVisitedRef = useRef<ZipCoord | null>(null);

  const visitedSet = useMemo(() => {
    const s = new Set<string>();
    for (const [r, c] of path) {
      s.add(coordKey(r, c));
    }
    return s;
  }, [path]);

  const highestWaypoint = useMemo(
    () => getHighestWaypointReached(path, waypointMap),
    [path, waypointMap]
  );

  const getCellFromClientPoint = (
    clientX: number,
    clientY: number
  ): ZipCoord | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
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

  const ensureSnapshot = () => {
    if (!snapshotPushedRef.current) {
      snapshotPushedRef.current = true;
      onDragStart();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const cell = getCellFromClientPoint(e.clientX, e.clientY);
    if (!cell) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const [r, c] = cell;
    const key = coordKey(r, c);
    lastCellKeyRef.current = key;
    snapshotPushedRef.current = false;
    pressedVisitedRef.current = null;

    const tip = path[path.length - 1];
    const isTip = tip && tip[0] === r && tip[1] === c;

    if (isTip) {
      drawingRef.current = true;
      return;
    }

    if (visitedSet.has(key)) {
      // User pressed an earlier cell in the path:
      // tap -> trim to it; drag -> trim to it then continue drawing
      drawingRef.current = true;
      pressedVisitedRef.current = [r, c];
      return;
    }

    // If user tapped/pressed a cell adjacent to tip (or straight-line aligned), allow starting draw immediately
    if (tip && (tip[0] === r || tip[1] === c)) {
      drawingRef.current = true;
      ensureSnapshot();
      onStepToCell(r, c);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !drawingRef.current) return;
    const cell = getCellFromClientPoint(e.clientX, e.clientY);
    if (!cell) return;

    const [r, c] = cell;
    const key = coordKey(r, c);
    if (key === lastCellKeyRef.current) return;
    lastCellKeyRef.current = key;

    ensureSnapshot();

    if (pressedVisitedRef.current) {
      const [pr, pc] = pressedVisitedRef.current;
      pressedVisitedRef.current = null;
      onTrimToCell(pr, pc, false);
    }

    onStepToCell(r, c);
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;

    // Pure tap on an earlier visited cell -> trim path back to that cell
    if (pressedVisitedRef.current && !disabled) {
      const [pr, pc] = pressedVisitedRef.current;
      onTrimToCell(pr, pc, true);
    }

    drawingRef.current = false;
    snapshotPushedRef.current = false;
    lastCellKeyRef.current = null;
    pressedVisitedRef.current = null;
  };

  // Build continuous SVG path string connecting cell centers in viewBox (0..n*100)
  const svgPathD = useMemo(() => {
    if (path.length === 0) return "";
    return path
      .map(([r, c], idx) => {
        const x = c * 100 + 50;
        const y = r * 100 + 50;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [path]);

  const tip = path[path.length - 1];
  const tipIsWaypoint = tip ? waypointMap.has(coordKey(tip[0], tip[1])) : false;

  // Responsive node sizing for 6x6, 7x7, 8x8
  const nodeSizeClass =
    n >= 8
      ? "h-[68%] w-[68%] text-[12px]"
      : n === 7
      ? "h-[66%] w-[66%] text-[13px]"
      : "h-[62%] w-[62%] text-[15px]";

  return (
    <div className="glass-card w-full rounded-[26px] p-2.5">
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          touchAction: "none",
          overscrollBehavior: "none",
        }}
        className="relative aspect-square w-full select-none overflow-hidden rounded-[18px] border-[2.5px] border-neutral-900/90 bg-white/85 dark:border-white/70 dark:bg-neutral-900/80"
      >
        {/* Layer 1: Background Cell Grid */}
        <div
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          }}
          className="grid h-full w-full"
        >
          {Array.from({ length: n * n }).map((_, idx) => {
            const r = Math.floor(idx / n);
            const c = idx % n;
            const key = coordKey(r, c);
            const isVisited = visitedSet.has(key);

            return (
              <div
                key={key}
                className={`relative overflow-hidden transition-colors duration-150 ${
                  r > 0 ? "border-t border-t-black/[0.08] dark:border-t-white/[0.09]" : ""
                } ${
                  c > 0 ? "border-l border-l-black/[0.08] dark:border-l-white/[0.09]" : ""
                } ${
                  isVisited
                    ? "bg-sky-500/[0.10] dark:bg-sky-400/[0.13]"
                    : "bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Layer 2: Smooth Continuous SVG Path (behind number nodes) */}
        <svg
          viewBox={`0 0 ${n * 100} ${n * 100}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="zip-path-gradient"
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={n * 100}
              y2={n * 100}
            >
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="55%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>

          {path.length >= 2 && (
            <path
              d={svgPathD}
              fill="none"
              stroke="url(#zip-path-gradient)"
              strokeWidth={44}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Subtle rounded start/head cap when path has 1 cell */}
          {path.length === 1 && tip && (
            <circle
              cx={tip[1] * 100 + 50}
              cy={tip[0] * 100 + 50}
              r={22}
              fill="url(#zip-path-gradient)"
            />
          )}

          {/* Crisp active path head indicator on non-waypoint tip */}
          {tip && !tipIsWaypoint && (
            <circle
              cx={tip[1] * 100 + 50}
              cy={tip[0] * 100 + 50}
              r={11}
              fill="#FFFFFF"
              fillOpacity={0.92}
            />
          )}
        </svg>

        {/* Layer 3: Thick, Crisp Wall Barriers along exact cell edges */}
        {puzzle.walls.length > 0 && (
          <svg
            viewBox={`0 0 ${n * 100} ${n * 100}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {puzzle.walls.map(([r1, c1, r2, c2], idx) => {
              // Horizontal wall between (r1, c1) and (r1 + 1, c1)
              const isHorizontal = r2 === r1 + 1 && c1 === c2;
              const x1 = isHorizontal ? c1 * 100 : (c1 + 1) * 100;
              const y1 = isHorizontal ? (r1 + 1) * 100 : r1 * 100;
              const x2 = isHorizontal ? (c1 + 1) * 100 : (c1 + 1) * 100;
              const y2 = isHorizontal ? (r1 + 1) * 100 : (r1 + 1) * 100;

              return (
                <line
                  key={`wall-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeLinecap="round"
                  strokeWidth={14}
                  className="stroke-neutral-900 dark:stroke-white"
                />
              );
            })}
          </svg>
        )}

        {/* Layer 4: Numbered Waypoint Nodes (above path, with bubble-pop + ripple) */}
        <div
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
          }}
          className="pointer-events-none absolute inset-0 grid h-full w-full"
        >
          {puzzle.waypoints.map((wp) => {
            const key = coordKey(wp.row, wp.col);
            const isReached = visitedSet.has(key);
            const isNextTarget = wp.num === highestWaypoint + 1;
            const popCount = popCounters[wp.num] ?? 0;

            return (
              <div
                key={`wp-${wp.num}`}
                style={{
                  gridRowStart: wp.row + 1,
                  gridColumnStart: wp.col + 1,
                }}
                className="relative flex items-center justify-center"
              >
                {/* Expanding subtle ripple ring when waypoint is reached */}
                <AnimatePresence>
                  {popCount > 0 && (
                    <motion.span
                      key={`ripple-${wp.num}-${popCount}`}
                      initial={{ scale: 0.75, opacity: 0.8 }}
                      animate={{ scale: 1.95, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className={`pointer-events-none absolute rounded-full border-2 border-sky-400 dark:border-sky-300 ${nodeSizeClass}`}
                    />
                  )}
                </AnimatePresence>

                {/* Number badge with bubble-pop spring animation */}
                <motion.div
                  key={`node-${wp.num}-${popCount}`}
                  initial={popCount > 0 ? { scale: 1 } : false}
                  animate={
                    popCount > 0
                      ? { scale: [1, 1.35, 0.9, 1.05, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    popCount > 0
                      ? {
                          duration: 0.42,
                          times: [0, 0.3, 0.6, 0.82, 1],
                          ease: "easeOut",
                        }
                      : { type: "spring", stiffness: 420, damping: 24 }
                  }
                  className={`relative z-10 flex items-center justify-center rounded-full font-bold tabular-nums transition-colors duration-150 ${nodeSizeClass} ${
                    isReached
                      ? "bg-neutral-950 text-white ring-2 ring-white/85 shadow-sm dark:bg-white dark:text-neutral-950 dark:ring-neutral-900/80"
                      : isNextTarget
                      ? "bg-white text-sky-700 border-2 border-sky-500 shadow-xs dark:bg-neutral-900 dark:text-sky-300 dark:border-sky-400"
                      : "bg-white/95 text-neutral-900 border-[1.5px] border-neutral-900/25 shadow-xs dark:bg-neutral-800 dark:text-neutral-100 dark:border-white/25"
                  }`}
                >
                  {wp.num}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
