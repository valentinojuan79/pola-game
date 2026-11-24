"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  HelpCircle,
  Layers,
  Lightbulb,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { formatTime } from "@/lib/games/queens/engine";
import {
  applyFoldToCells,
  createInitialBoardState,
  generateFoldShareText,
  getFoldHint,
  isBoardSolved,
  performFold,
  resetFoldBoard,
  rewindToStep,
  undoFold,
} from "@/lib/games/fold/engine";
import type {
  FoldBoardState,
  FoldCell,
  FoldMove,
  FoldPuzzle,
} from "@/lib/games/fold/types";
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
import { FoldBoard } from "./FoldBoard";

const HINT_COOLDOWN_SECONDS = 10;

interface FoldSnapshotPayload {
  cells: FoldCell[][];
  bounds: FoldBoardState["bounds"];
  foldsUsed: number;
}

function buildFoldReviewState(
  puzzle: FoldPuzzle,
  snapshot: unknown
): FoldBoardState {
  if (
    snapshot &&
    typeof snapshot === "object" &&
    "cells" in snapshot &&
    "bounds" in snapshot
  ) {
    const payload = snapshot as FoldSnapshotPayload;
    if (Array.isArray(payload.cells) && payload.cells.length === puzzle.size) {
      return {
        cells: payload.cells,
        bounds: payload.bounds,
        foldsUsed: payload.foldsUsed ?? puzzle.solutionFolds.length,
        moveHistory: [],
        snapshots: [],
      };
    }
  }

  // Fallback: replay solutionFolds cleanly to show the solved folded sheet
  let state = createInitialBoardState(puzzle);
  for (const move of puzzle.solutionFolds) {
    const applied = applyFoldToCells(state.cells, state.bounds, move);
    if (!applied) break;
    state = {
      ...state,
      cells: applied.cells,
      bounds: applied.bounds,
      foldsUsed: state.foldsUsed + 1,
    };
  }
  return state;
}

interface FoldGameProps {
  puzzle: FoldPuzzle;
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

export function FoldGame({
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
}: FoldGameProps) {
  const { t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<FoldBoardState>(() =>
    reviewCompletion
      ? buildFoldReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialBoardState(puzzle)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    reviewCompletion ? reviewCompletion.elapsedSeconds : 0
  );
  const [hintsUsed, setHintsUsed] = useState(
    reviewCompletion ? reviewCompletion.hintsUsed : 0
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [activeHintMove, setActiveHintMove] = useState<FoldMove | null>(null);
  const [divergedRewindStep, setDivergedRewindStep] = useState<number | null>(
    null
  );
  const [shakeKey, setShakeKey] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);

  // Reset board cleanly whenever puzzle or reviewCompletion changes
  useEffect(() => {
    if (reviewCompletion) {
      setBoard(buildFoldReviewState(puzzle, reviewCompletion.boardSnapshot));
      setElapsedSeconds(reviewCompletion.elapsedSeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setHintCooldown(0);
      setActiveHintMove(null);
      setDivergedRewindStep(null);
      setShakeKey(0);
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }

    setBoard(createInitialBoardState(puzzle));
    setElapsedSeconds(0);
    setHintsUsed(0);
    setHintCooldown(0);
    setActiveHintMove(null);
    setDivergedRewindStep(null);
    setShakeKey(0);
    setHasWon(false);
    completedRef.current = false;

    if (shouldAutoShowTutorial("fold")) {
      setIsAutoTutorial(true);
      setShowRules(true);
    }
  }, [puzzle, reviewCompletion]);

  // Live timer (pauses when solved, review mode, or tutorial open)
  useEffect(() => {
    if (hasWon || showRules || isReviewMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasWon, showRules, isReviewMode]);

  // Hint 10s cooldown ticker
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const timer = setInterval(() => {
      setHintCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hintCooldown]);

  const solved = useMemo(() => isBoardSolved(board.cells), [board.cells]);
  const foldsLeft = Math.max(0, puzzle.maxFolds - board.foldsUsed);
  const isOutOfFolds = !solved && foldsLeft === 0 && !isReviewMode;

  // Detect puzzle completion
  useEffect(() => {
    if (solved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      setActiveHintMove(null);
      setDivergedRewindStep(null);
      feedback.chime();
      const snapshotPayload: FoldSnapshotPayload = {
        cells: board.cells,
        bounds: board.bounds,
        foldsUsed: board.foldsUsed,
      };
      onComplete({
        elapsedSeconds,
        penaltySeconds: 0,
        hintsUsed,
        boardSnapshot: snapshotPayload,
      });
    }
  }, [
    solved,
    isReviewMode,
    elapsedSeconds,
    hintsUsed,
    board.cells,
    board.bounds,
    board.foldsUsed,
    onComplete,
  ]);

  const totalSeconds = reviewCompletion
    ? reviewCompletion.totalSeconds
    : elapsedSeconds;

  const handleCloseRules = useCallback(() => {
    if (isAutoTutorial) {
      markTutorialSeen("fold");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("fold");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  const handleFold = useCallback(
    (move: FoldMove) => {
      if (hasWon || isReviewMode) return;
      setActiveHintMove(null);
      setDivergedRewindStep(null);

      setBoard((prev) => {
        if (prev.foldsUsed >= puzzle.maxFolds) {
          feedback.warn();
          setShakeKey((k) => k + 1);
          return prev;
        }

        const { nextState, folded, newlyMatched } = performFold(
          prev,
          puzzle,
          move
        );
        if (!folded) return prev;

        const nextSolved = isBoardSolved(nextState.cells);
        if (!nextSolved) {
          if (nextState.foldsUsed >= puzzle.maxFolds) {
            // Ran out of folds without solving
            feedback.warn();
            setShakeKey((k) => k + 1);
          } else if (newlyMatched > 0) {
            // Pleasant glassy chime when new dot(s) lock into target rings
            feedback.unitComplete(newlyMatched);
          } else {
            // Soft tactile fold pop
            feedback.pop();
          }
        }
        return nextState;
      });
    },
    [hasWon, isReviewMode, puzzle]
  );

  const handleUndo = () => {
    if (board.snapshots.length === 0 || hasWon) return;
    feedback.erase();
    setActiveHintMove(null);
    setDivergedRewindStep(null);
    setBoard((prev) => undoFold(prev));
  };

  const handleReset = () => {
    if (hasWon || board.foldsUsed === 0) return;
    feedback.erase();
    setActiveHintMove(null);
    setDivergedRewindStep(null);
    setBoard(resetFoldBoard(puzzle));
  };

  const handleHint = () => {
    if (hasWon || hintCooldown > 0) return;
    const hint = getFoldHint(board, puzzle);
    if (hint.status === "already_solved") {
      feedback.click();
      return;
    }

    if (hint.status === "diverged") {
      feedback.warn();
      setActiveHintMove(null);
      setDivergedRewindStep(hint.rewindToStep);
      setHintsUsed((h) => h + 1);
      setHintCooldown(HINT_COOLDOWN_SECONDS);
      return;
    }

    // On track -> highlight exact next crease + animated directional swipe arrow
    feedback.pop();
    setDivergedRewindStep(null);
    setActiveHintMove(hint.nextMove);
    setHintsUsed((h) => h + 1);
    setHintCooldown(HINT_COOLDOWN_SECONDS);
  };

  const handleRewindToValid = () => {
    if (divergedRewindStep === null || hasWon) return;
    feedback.erase();
    setBoard((prev) => rewindToStep(prev, divergedRewindStep));
    setDivergedRewindStep(null);
  };

  const shareText = useMemo(
    () =>
      generateFoldShareText({
        mode,
        dateStr,
        puzzle,
        foldsUsed: board.foldsUsed,
        totalSeconds,
        hintsUsed,
        streak,
        formatTime,
      }),
    [mode, dateStr, puzzle, board.foldsUsed, totalSeconds, hintsUsed, streak]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-[100dvh] flex-col justify-between px-4 pb-6 safe-pb"
    >
      {/* Top Game Navigation Bar — 3-column symmetric header */}
      <div className="relative z-10 grid grid-cols-[84px_1fr_84px] items-center pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <button
          type="button"
          onClick={() => {
            feedback.click();
            onExit();
          }}
          className="glass-card justify-self-start flex h-9 items-center gap-1 rounded-full pr-3.5 pl-2.5 text-[13px] font-medium text-neutral-800 transition-transform active:scale-95 dark:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.fold.back}
        </button>

        <div className="flex flex-col items-center justify-self-center text-center">
          <span className="whitespace-nowrap text-[12px] font-semibold tracking-tight text-neutral-500 dark:text-neutral-400">
            {mode === "daily" ? t.fold.dailyLabel : t.fold.unlimitedLabel} ·{" "}
            {puzzle.size}×{puzzle.size}
          </span>

          <div className="relative mt-0.5 flex items-center justify-center">
            <span className="font-display tabular-nums text-[22px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatTime(totalSeconds)}
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
          aria-label={t.fold.howToPlay}
          className="glass-card justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-transform active:scale-95 dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Center Board Area */}
      <div className="my-auto flex flex-col items-center">
        {/* Diverged Hint Banner with 1-tap Rewind */}
        <AnimatePresence>
          {divergedRewindStep !== null && !isReviewMode && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              className="mb-3 flex w-full max-w-[390px] items-center justify-between gap-2 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.10] px-3.5 py-2.5 text-[12px] text-indigo-900 dark:border-indigo-400/25 dark:bg-indigo-500/[0.16] dark:text-indigo-100"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
                <span className="leading-snug font-medium">
                  {t.fold.divergedHint}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRewindToValid}
                className="shrink-0 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white transition-transform active:scale-95 dark:bg-indigo-400 dark:text-neutral-950"
              >
                {t.fold.rewindBtn}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <FoldBoard
          size={puzzle.size}
          cells={board.cells}
          bounds={board.bounds}
          hintMove={activeHintMove}
          disabled={hasWon || isReviewMode || isOutOfFolds}
          onFold={handleFold}
        />

        {/* Folds Left Glass Pill */}
        <motion.div
          key={shakeKey}
          animate={
            shakeKey > 0
              ? { x: [0, -7, 7, -5, 5, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.36 }}
          className="mt-4 flex flex-col items-center gap-1.5"
        >
          <div
            className={`glass-pill flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              isOutOfFolds
                ? "border-rose-500/35 bg-rose-500/[0.10] text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/[0.16] dark:text-rose-200"
                : "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-900 dark:border-indigo-400/25 dark:bg-indigo-400/[0.12] dark:text-indigo-100"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="font-display tabular-nums">
              {foldsLeft}{" "}
              {foldsLeft === 1 ? t.fold.foldLeftSingular : t.fold.foldsLeft}
            </span>
          </div>

          <AnimatePresence>
            {isOutOfFolds && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-center text-[12px] font-medium text-rose-600 dark:text-rose-300"
              >
                {t.fold.outOfFoldsHint}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom 3-Button Controls Bar or Solved Daily Review Bar */}
      {isReviewMode ? (
        <DailyReviewBar
          game="fold"
          shareText={shareText}
          onPlayUnlimited={onPlayUnlimitedNext}
          onBackHome={onExit}
        />
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={board.snapshots.length === 0 || hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-800 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-200"
          >
            <Undo2 className="h-[18px] w-[18px]" />
            <span>{t.fold.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleHint}
            disabled={hasWon || hintCooldown > 0}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-indigo-700 transition-transform active:scale-95 disabled:opacity-45 dark:text-indigo-300"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
            <span className="tabular-nums">
              {hintCooldown > 0 ? `${t.fold.hint} (${hintCooldown}s)` : t.fold.hint}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={hasWon || board.foldsUsed === 0}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
            <span>{t.fold.reset}</span>
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
                {t.fold.howToPlay}
              </h3>

              {/* Mini Visual Legend */}
              <div className="mt-3.5 flex items-center justify-center gap-4 rounded-2xl bg-indigo-500/[0.07] px-3 py-3 dark:bg-indigo-400/[0.10]">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#6D28D9] shadow-xs" />
                  <span className="text-[11.5px] font-medium text-neutral-700 dark:text-neutral-200">
                    {t.fold.legendDot}
                  </span>
                </div>
                <span className="text-neutral-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full border-[2.5px] border-[#7C3AED] bg-[#7C3AED]/10 dark:border-[#A78BFA]" />
                  <span className="text-[11.5px] font-medium text-neutral-700 dark:text-neutral-200">
                    {t.fold.legendRing}
                  </span>
                </div>
              </div>

              <ul className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.fold.rule1}</li>
                <li>• {t.fold.rule2}</li>
                <li>• {t.fold.rule3}</li>
                <li>• {t.fold.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.fold.gotIt}
                accentButtonClass="bg-[#4F46E5] text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.32)] hover:bg-[#4338CA] dark:bg-indigo-400/90 dark:text-neutral-950"
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
        game="fold"
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
