"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { formatTime } from "@/lib/games/queens/engine";
import {
  applyZipHint,
  buildWallSet,
  buildWaypointMap,
  createInitialZipState,
  generateZipShareText,
  getHighestWaypointReached,
  isZipSolved,
  pushZipSnapshot,
  resetZipBoard,
  trimPathToCell,
  tryStepToCell,
  undoZipMove,
} from "@/lib/games/zip/engine";
import type { ZipBoardState, ZipCoord, ZipPuzzle } from "@/lib/games/zip/types";
import {
  markTutorialSeen,
  setSkipAllTutorials,
  shouldAutoShowTutorial,
  type DailyCompletion,
} from "@/lib/storage";
import type { PolaUser } from "@/lib/supabase";
import { DailyReviewBar } from "@/components/games/shared/DailyReviewBar";
import { TutorialModalFooter } from "@/components/games/shared/TutorialModalFooter";
import { WinModal } from "@/components/games/queens/WinModal";
import { ZipBoard } from "./ZipBoard";

const HINT_COOLDOWN_SECONDS = 15;

function buildZipReviewState(
  puzzle: ZipPuzzle,
  snapshot: unknown
): ZipBoardState {
  const total = puzzle.size * puzzle.size;
  if (
    Array.isArray(snapshot) &&
    snapshot.length === total &&
    snapshot.every((pt) => Array.isArray(pt) && pt.length === 2)
  ) {
    return {
      path: (snapshot as ZipCoord[]).map(([r, c]) => [r, c]),
      history: [],
    };
  }
  return {
    path: puzzle.solutionPath.map(([r, c]) => [r, c]),
    history: [],
  };
}

interface ZipGameProps {
  puzzle: ZipPuzzle;
  mode: "daily" | "unlimited";
  dateStr: string;
  streak: number;
  user: PolaUser | null;
  dailyRank: number | null;
  reviewCompletion?: DailyCompletion | null;
  onComplete: (result: {
    elapsedSeconds: number;
    penaltySeconds: number;
    hintsUsed: number;
    boardSnapshot?: unknown;
  }) => void;
  onExit: () => void;
  onPlayUnlimitedNext: (difficulty?: ZipPuzzle["difficulty"]) => void;
  onOpenAuth: () => void;
}

export function ZipGame({
  puzzle,
  mode,
  dateStr,
  streak,
  user,
  dailyRank,
  reviewCompletion = null,
  onComplete,
  onExit,
  onPlayUnlimitedNext,
  onOpenAuth,
}: ZipGameProps) {
  const { t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<ZipBoardState>(() =>
    reviewCompletion
      ? buildZipReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialZipState(puzzle)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    reviewCompletion ? reviewCompletion.totalSeconds : 0
  );
  const [hintsUsed, setHintsUsed] = useState(
    reviewCompletion ? reviewCompletion.hintsUsed : 0
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [popCounters, setPopCounters] = useState<Record<number, number>>({});
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);
  const lastWarnTimeRef = useRef(0);
  const boardRef = useRef<ZipBoardState>(board);
  boardRef.current = board;

  const wallSet = useMemo(() => buildWallSet(puzzle.walls), [puzzle.walls]);
  const waypointMap = useMemo(
    () => buildWaypointMap(puzzle.waypoints),
    [puzzle.waypoints]
  );

  // Reset cleanly whenever puzzle.id or reviewCompletion changes
  useEffect(() => {
    if (reviewCompletion) {
      setBoard(buildZipReviewState(puzzle, reviewCompletion.boardSnapshot));
      setElapsedSeconds(reviewCompletion.totalSeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setHintCooldown(0);
      setPopCounters({});
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }
    setBoard(createInitialZipState(puzzle));
    setElapsedSeconds(0);
    setHintsUsed(0);
    setHintCooldown(0);
    setPopCounters({});
    setHasWon(false);
    completedRef.current = false;
    if (shouldAutoShowTutorial("zip")) {
      setIsAutoTutorial(true);
      setShowRules(true);
    }
  }, [puzzle, reviewCompletion]);

  // Live timer (pauses when solved, review mode, or rules open)
  useEffect(() => {
    if (hasWon || showRules || isReviewMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasWon, showRules, isReviewMode]);

  // 15-second Hint cooldown countdown
  useEffect(() => {
    if (hintCooldown <= 0 || hasWon || isReviewMode) return;
    const timer = setInterval(() => {
      setHintCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hintCooldown, hasWon, isReviewMode]);

  const solved = useMemo(
    () => isZipSolved(board.path, puzzle),
    [board.path, puzzle]
  );

  // Detect puzzle completion
  useEffect(() => {
    if (solved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      feedback.chime();
      onComplete({
        elapsedSeconds,
        penaltySeconds: 0,
        hintsUsed,
        boardSnapshot: board.path,
      });
    }
  }, [solved, isReviewMode, elapsedSeconds, hintsUsed, board.path, onComplete]);

  const handleCloseRules = useCallback(() => {
    if (isAutoTutorial) {
      markTutorialSeen("zip");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("zip");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  const triggerNodePop = useCallback((waypointNum: number) => {
    setPopCounters((prev) => ({
      ...prev,
      [waypointNum]: (prev[waypointNum] ?? 0) + 1,
    }));
  }, []);

  const handleDragStart = useCallback(() => {
    if (hasWon) return;
    const next = pushZipSnapshot(boardRef.current);
    boardRef.current = next;
    setBoard(next);
  }, [hasWon]);

  const handleStepToCell = useCallback(
    (row: number, col: number) => {
      if (hasWon) return;
      const current = boardRef.current;
      const res = tryStepToCell(
        current.path,
        [row, col],
        puzzle,
        wallSet,
        waypointMap
      );

      if (res.action === "extend" || res.action === "backtrack") {
        const next: ZipBoardState = {
          ...current,
          path: res.nextPath,
        };
        boardRef.current = next;
        setBoard(next);
      }

      if (res.reachedWaypoint !== null) {
        triggerNodePop(res.reachedWaypoint);
        feedback.pop();
      } else if (res.action === "extend") {
        feedback.click();
      } else if (res.action === "backtrack") {
        feedback.erase();
      } else if (res.action === "blocked") {
        const now = Date.now();
        if (now - lastWarnTimeRef.current > 240) {
          lastWarnTimeRef.current = now;
          feedback.warn();
        }
      }
    },
    [hasWon, puzzle, wallSet, waypointMap, triggerNodePop]
  );

  const handleTrimToCell = useCallback(
    (row: number, col: number, recordSnapshot: boolean) => {
      if (hasWon) return;
      const current = boardRef.current;
      if (recordSnapshot) {
        const { nextState, trimmed } = trimPathToCell(current, [row, col]);
        if (trimmed) {
          boardRef.current = nextState;
          setBoard(nextState);
          feedback.erase();
        }
        return;
      }

      const idx = current.path.findIndex(([r, c]) => r === row && c === col);
      if (idx >= 0 && idx < current.path.length - 1) {
        const next: ZipBoardState = {
          ...current,
          path: current.path.slice(0, idx + 1),
        };
        boardRef.current = next;
        setBoard(next);
        feedback.erase();
      }
    },
    [hasWon]
  );

  const handleUndo = useCallback(() => {
    if (board.history.length === 0 || hasWon) return;
    feedback.erase();
    setBoard((prev) => undoZipMove(prev));
  }, [board.history.length, hasWon]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (hasWon || showRules || isReviewMode) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasWon, showRules, isReviewMode, handleUndo]);

  const handleReset = () => {
    if (hasWon || board.path.length <= 1) return;
    feedback.erase();
    setBoard((prev) => resetZipBoard(prev, puzzle));
  };

  const handleHint = () => {
    if (hasWon || hintCooldown > 0) return;
    const { nextState, reachedWaypoint, changed } = applyZipHint(
      board,
      puzzle,
      waypointMap
    );
    if (!changed) {
      feedback.warn();
      return;
    }
    setBoard(nextState);
    setHintsUsed((h) => h + 1);
    setHintCooldown(HINT_COOLDOWN_SECONDS);
    if (reachedWaypoint !== null) {
      triggerNodePop(reachedWaypoint);
    }
    feedback.pop();
  };

  const totalCells = puzzle.size * puzzle.size;
  const highestWp = useMemo(
    () => getHighestWaypointReached(board.path, waypointMap),
    [board.path, waypointMap]
  );

  const shareText = useMemo(
    () =>
      generateZipShareText({
        mode,
        dateStr,
        size: puzzle.size,
        totalSeconds: elapsedSeconds,
        hintsUsed,
        streak,
        waypointsCount: puzzle.waypoints.length,
      }),
    [mode, dateStr, puzzle.size, puzzle.waypoints.length, elapsedSeconds, hintsUsed, streak]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-dvh flex-col justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      {/* Top Game Navigation Bar — 3-column grid for dead-center title & timer */}
      <div className="relative z-10 grid h-auto grid-cols-[72px_1fr_72px] sm:grid-cols-[84px_1fr_84px] items-center gap-1 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
        <button
          type="button"
          onClick={() => {
            feedback.click();
            onExit();
          }}
          className="header-btn justify-self-start flex h-9 items-center gap-1 rounded-full pr-3 pl-2 sm:pr-3.5 sm:pl-2.5 text-[13px] font-medium text-neutral-800 transition-colors dark:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          {t.zip.back}
        </button>

        {/* Center Title + Timer */}
        <div className="flex min-w-0 flex-col items-center justify-self-center text-center">
          <span className="max-w-full truncate whitespace-nowrap text-[12px] sm:text-[13px] font-semibold tracking-normal text-slate-600 dark:text-slate-300">
            {mode === "daily" ? t.zip.dailyLabel : t.zip.unlimitedLabel} ·{" "}
            {puzzle.size}×{puzzle.size}
          </span>

          <div className="relative mt-0.5 flex items-center justify-center">
            <span className="font-display tabular-nums text-[22px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            feedback.click();
            setIsAutoTutorial(false);
            setShowRules(true);
          }}
          aria-label={t.zip.howToPlay}
          className="header-btn justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Center Board Area */}
      <div className="my-auto flex flex-col items-center">
        <ZipBoard
          puzzle={puzzle}
          path={board.path}
          waypointMap={waypointMap}
          popCounters={popCounters}
          disabled={hasWon || isReviewMode}
          onDragStart={handleDragStart}
          onStepToCell={handleStepToCell}
          onTrimToCell={handleTrimToCell}
        />

        {/* Progress indicator */}
        <div className="mt-3.5 flex items-center gap-3 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          <span className="tabular-nums">
            {board.path.length} / {totalCells} {t.zip.cellsFilled}
          </span>
          <span className="tabular-nums text-sky-600 dark:text-sky-400">
            · #{highestWp} / #{puzzle.waypoints.length}
          </span>
        </div>
      </div>

      {/* Tactile Bottom Controls Bar or Solved Daily Review Bar */}
      {isReviewMode ? (
        <DailyReviewBar
          game="zip"
          dateStr={dateStr}
          difficulty={puzzle.difficulty}
          gridSize={puzzle.size}
          totalSeconds={reviewCompletion?.totalSeconds ?? elapsedSeconds}
          hintsUsed={reviewCompletion?.hintsUsed ?? hintsUsed}
          streak={streak}
          dailyRank={dailyRank}
          username={user?.displayName ?? null}
          shareText={shareText}
          onPlayUnlimited={onPlayUnlimitedNext}
          onBackHome={onExit}
        />
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={board.history.length === 0 || hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-800 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-200"
          >
            <Undo2 className="h-[18px] w-[18px]" />
            <span>{t.zip.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleHint}
            disabled={hasWon || hintCooldown > 0}
            className="glass-card relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[20px] py-3 text-[11px] font-medium text-sky-700 transition-transform active:scale-95 disabled:opacity-50 dark:text-sky-300"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
            <span className="tabular-nums">
              {hintCooldown > 0 ? `${hintCooldown}s` : t.zip.hint}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={hasWon || board.path.length <= 1}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
            <span>{t.zip.reset}</span>
          </button>
        </div>
      )}

      {/* How to Play Glass Sheet */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseRules}
              className="absolute inset-0 bg-black/35 backdrop-blur-xs dark:bg-black/60"
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="glass-modal relative z-10 m-4 w-full max-w-[380px] rounded-[28px] p-6"
            >
              <button
                type="button"
                onClick={() => {
                  feedback.click();
                  handleCloseRules();
                }}
                aria-label="Close"
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-display text-[20px] font-bold text-neutral-950 dark:text-white">
                {t.zip.howToPlay}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.zip.rule1}</li>
                <li>• {t.zip.rule2}</li>
                <li>• {t.zip.rule3}</li>
                <li>• {t.zip.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.zip.gotIt}
                accentButtonClass="bg-[#0369A1] text-white shadow-[0_4px_14px_-4px_rgba(3,105,161,0.28)] hover:bg-[#075985] dark:bg-sky-400/90 dark:text-neutral-950"
                onDismiss={handleCloseRules}
                onSkipAll={handleSkipAllTutorials}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Bubble-Pop Win Modal */}
      <WinModal
        open={hasWon}
        game="zip"
        mode={mode}
        dateStr={dateStr}
        difficulty={puzzle.difficulty}
        gridSize={puzzle.size}
        totalSeconds={elapsedSeconds}
        hintsUsed={hintsUsed}
        streak={streak}
        dailyRank={dailyRank}
        user={user}
        shareText={shareText}
        onClaimUsername={onOpenAuth}
        onPlayUnlimited={onPlayUnlimitedNext}
        onBackHome={onExit}
      />
    </motion.div>
  );
}
