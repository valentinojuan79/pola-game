"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import {
  loadAutoXPreference,
  markTutorialSeen,
  saveAutoXPreference,
  setSkipAllTutorials,
  shouldAutoShowTutorial,
  type DailyCompletion,
} from "@/lib/storage";
import {
  applyDragX,
  applyHint,
  createInitialBoardState,
  formatTime,
  generateShareText,
  pushDragSnapshot,
  resetBoard,
  tapCell,
  undoMove,
  validateBoard,
} from "@/lib/games/queens/engine";
import type {
  CellState,
  QueensBoardState,
  QueensPuzzle,
} from "@/lib/games/queens/types";
import type { PolaUser } from "@/lib/supabase";
import { DailyReviewBar } from "@/components/games/shared/DailyReviewBar";
import { TutorialModalFooter } from "@/components/games/shared/TutorialModalFooter";
import { QueensBoard } from "./QueensBoard";
import { WinModal } from "./WinModal";

function buildQueensReviewState(
  puzzle: QueensPuzzle,
  snapshot: unknown
): QueensBoardState {
  const n = puzzle.size;
  const falseGrid = () =>
    Array.from({ length: n }, () => Array<boolean>(n).fill(false));

  if (
    Array.isArray(snapshot) &&
    snapshot.length === n &&
    snapshot.every((row) => Array.isArray(row) && row.length === n)
  ) {
    return {
      cells: (snapshot as CellState[][]).map((row) => [...row]),
      autoXMask: falseGrid(),
      lockedCrowns: falseGrid(),
      history: [],
    };
  }
  const cells: CellState[][] = Array.from({ length: n }, () =>
    Array<CellState>(n).fill("empty")
  );
  for (const [r, c] of puzzle.solution) {
    if (r >= 0 && r < n && c >= 0 && c < n) cells[r][c] = "crown";
  }
  return {
    cells,
    autoXMask: falseGrid(),
    lockedCrowns: falseGrid(),
    history: [],
  };
}

interface QueensGameProps {
  puzzle: QueensPuzzle;
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
  onPlayUnlimitedNext: () => void;
  onOpenAuth: () => void;
}

export function QueensGame({
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
}: QueensGameProps) {
  const { t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<QueensBoardState>(() =>
    reviewCompletion
      ? buildQueensReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialBoardState(puzzle.size)
  );
  const [autoX, setAutoX] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    reviewCompletion ? reviewCompletion.elapsedSeconds : 0
  );
  const [penaltySeconds, setPenaltySeconds] = useState(
    reviewCompletion ? reviewCompletion.penaltySeconds : 0
  );
  const [hintsUsed, setHintsUsed] = useState(
    reviewCompletion ? reviewCompletion.hintsUsed : 0
  );
  const [penaltyBurstKey, setPenaltyBurstKey] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);

  // Sync Auto-X preference on mount
  useEffect(() => {
    setAutoX(loadAutoXPreference());
  }, []);

  // Reset board cleanly whenever puzzle.id or reviewCompletion changes
  useEffect(() => {
    if (reviewCompletion) {
      setBoard(buildQueensReviewState(puzzle, reviewCompletion.boardSnapshot));
      setElapsedSeconds(reviewCompletion.elapsedSeconds);
      setPenaltySeconds(reviewCompletion.penaltySeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }
    setBoard(createInitialBoardState(puzzle.size));
    setElapsedSeconds(0);
    setPenaltySeconds(0);
    setHintsUsed(0);
    setHasWon(false);
    completedRef.current = false;
    if (shouldAutoShowTutorial("queens")) {
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

  const validation = useMemo(
    () => validateBoard(puzzle, board.cells),
    [puzzle, board.cells]
  );

  // Detect puzzle completion
  useEffect(() => {
    if (validation.isSolved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      feedback.chime();
      onComplete({
        elapsedSeconds,
        penaltySeconds,
        hintsUsed,
        boardSnapshot: board.cells,
      });
    }
  }, [
    validation.isSolved,
    isReviewMode,
    elapsedSeconds,
    penaltySeconds,
    hintsUsed,
    board.cells,
    onComplete,
  ]);

  const totalSeconds = reviewCompletion
    ? reviewCompletion.totalSeconds
    : elapsedSeconds + penaltySeconds;

  const handleCloseRules = useCallback(() => {
    if (isAutoTutorial) {
      markTutorialSeen("queens");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("queens");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  const handleTapCell = useCallback(
    (row: number, col: number) => {
      if (hasWon) return;
      setBoard((prev) => {
        const { nextState, action } = tapCell(prev, puzzle, row, col, autoX);
        if (action === "x") feedback.click();
        else if (action === "crown") {
          const nextVal = validateBoard(puzzle, nextState.cells);
          if (nextVal.conflictCells.size > 0) feedback.warn();
          else feedback.pop();
        } else if (action === "clear") feedback.erase();
        return nextState;
      });
    },
    [hasWon, puzzle, autoX]
  );

  const handleDragStart = useCallback(() => {
    if (hasWon) return;
    setBoard((prev) => pushDragSnapshot(prev));
  }, [hasWon]);

  const handleDragCell = useCallback(
    (row: number, col: number, dragMode: "mark" | "erase") => {
      if (hasWon) return;
      setBoard((prev) => {
        const { nextState, changed } = applyDragX(prev, row, col, dragMode);
        if (changed) {
          if (dragMode === "mark") feedback.click();
          else feedback.erase();
        }
        return nextState;
      });
    },
    [hasWon]
  );

  const handleUndo = () => {
    if (board.history.length === 0 || hasWon) return;
    feedback.erase();
    setBoard((prev) => undoMove(prev));
  };

  const handleReset = () => {
    if (hasWon) return;
    feedback.erase();
    setBoard((prev) => resetBoard(prev));
  };

  const handleToggleAutoX = () => {
    feedback.click();
    const next = !autoX;
    setAutoX(next);
    saveAutoXPreference(next);
  };

  const handleHint = () => {
    if (hasWon) return;
    const { nextState, hintCell } = applyHint(board, puzzle, autoX);
    if (!hintCell) {
      feedback.warn();
      return;
    }
    feedback.pop();
    setBoard(nextState);
    setHintsUsed((h) => h + 1);
    setPenaltySeconds((p) => p + 10);
    setPenaltyBurstKey((k) => k + 1);
  };

  const shareText = useMemo(
    () =>
      generateShareText({
        mode,
        dateStr,
        size: puzzle.size,
        totalSeconds,
        hintsUsed,
        streak,
        cells: board.cells,
      }),
    [mode, dateStr, puzzle.size, totalSeconds, hintsUsed, streak, board.cells]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-[100dvh] flex-col justify-between px-4 pb-6 safe-pb"
    >
      {/* Top Game Navigation Bar — 3-column grid for dead-center title & timer */}
      <div className="relative z-10 grid grid-cols-[84px_1fr_84px] items-center pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <button
          type="button"
          onClick={() => {
            feedback.click();
            onExit();
          }}
          className="header-btn justify-self-start flex h-9 items-center gap-1 rounded-full pr-3.5 pl-2.5 text-[13px] font-medium text-neutral-800 transition-colors dark:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.queens.back}
        </button>

        {/* Center Title + Timer with floating +10s penalty */}
        <div className="flex flex-col items-center justify-self-center text-center">
          <span className="whitespace-nowrap text-[13px] font-semibold tracking-normal text-slate-600 dark:text-slate-300">
            {mode === "daily" ? t.queens.dailyLabel : t.queens.unlimitedLabel} ·{" "}
            {puzzle.size}×{puzzle.size}
          </span>

          <div className="relative mt-0.5 flex items-center justify-center">
            <span className="font-display tabular-nums text-[22px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatTime(totalSeconds)}
            </span>

            <AnimatePresence>
              {penaltyBurstKey > 0 && (
                <motion.span
                  key={penaltyBurstKey}
                  initial={{ opacity: 0, y: 6, scale: 0.85 }}
                  animate={{ opacity: 1, y: -2, scale: 1 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="pointer-events-none absolute left-full ml-1.5 rounded-full bg-red-500/15 px-1.5 py-0.5 tabular-nums text-[11px] font-bold text-red-600 dark:text-red-400"
                >
                  {t.queens.penaltyNotice}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            feedback.click();
            setIsAutoTutorial(false);
            setShowRules(true);
          }}
          aria-label={t.queens.howToPlay}
          className="header-btn justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Center Board Area */}
      <div className="my-auto flex flex-col items-center">
        <QueensBoard
          puzzle={puzzle}
          board={board}
          validation={validation}
          disabled={hasWon || isReviewMode}
          onTapCell={handleTapCell}
          onDragStart={handleDragStart}
          onDragCell={handleDragCell}
        />

        {/* Progress indicator pill */}
        <div className="mt-3.5 flex items-center gap-3 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          <span className="tabular-nums">
            {validation.crownCount} / {puzzle.size} Crowns
          </span>
          {hintsUsed > 0 && (
            <span className="tabular-nums text-amber-600 dark:text-amber-400">
              · {hintsUsed} {t.win.hints.toLowerCase()} (+{penaltySeconds}s)
            </span>
          )}
        </div>
      </div>

      {/* Tactile Controls Bar or Solved Daily Review Bar */}
      {isReviewMode ? (
        <DailyReviewBar
          game="queens"
          dateStr={dateStr}
          difficulty={puzzle.difficulty}
          gridSize={puzzle.size}
          totalSeconds={reviewCompletion?.totalSeconds ?? totalSeconds}
          hintsUsed={reviewCompletion?.hintsUsed ?? hintsUsed}
          streak={streak}
          dailyRank={dailyRank}
          username={user?.displayName ?? null}
          shareText={shareText}
          onPlayUnlimited={onPlayUnlimitedNext}
          onBackHome={onExit}
        />
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={board.history.length === 0 || hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-800 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-200"
          >
            <Undo2 className="h-[18px] w-[18px]" />
            <span>{t.queens.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAutoX}
            className={`flex flex-col items-center justify-center gap-1 rounded-[20px] border py-3 text-[11px] font-medium transition-all active:scale-95 ${
              autoX
                ? "border-amber-500/45 bg-amber-500/[0.14] text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/[0.18] dark:text-amber-100"
                : "glass-card text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Sparkles className="h-[18px] w-[18px]" />
            <span>{t.queens.autoX}</span>
          </button>

          <button
            type="button"
            onClick={handleHint}
            disabled={hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-amber-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-amber-300"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
            <span>{t.queens.hint}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
            <span>{t.queens.reset}</span>
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
                {t.queens.howToPlay}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.queens.rule1}</li>
                <li>• {t.queens.rule2}</li>
                <li>• {t.queens.rule3}</li>
                <li>• {t.queens.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.queens.gotIt}
                accentButtonClass="bg-[#D97706] text-white shadow-[0_4px_14px_-4px_rgba(180,83,9,0.28)] hover:bg-[#B45309] dark:bg-amber-500/90 dark:text-neutral-950"
                onDismiss={handleCloseRules}
                onSkipAll={handleSkipAllTutorials}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bubble-Pop Win Modal */}
      <WinModal
        open={hasWon}
        game="queens"
        mode={mode}
        dateStr={dateStr}
        difficulty={puzzle.difficulty}
        gridSize={puzzle.size}
        totalSeconds={totalSeconds}
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
