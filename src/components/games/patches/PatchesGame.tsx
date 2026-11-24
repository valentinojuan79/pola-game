"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
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
  applyHint,
  commitPatch,
  createInitialBoardState,
  generatePatchesShareText,
  removePatch,
  resetBoard,
  undoMove,
  validateBoard,
} from "@/lib/games/patches/engine";
import type {
  PatchRect,
  PatchesBoardState,
  PatchesPuzzle,
  PlayerPatch,
} from "@/lib/games/patches/types";
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
import { PatchesBoard } from "./PatchesBoard";

function buildPatchesReviewState(
  puzzle: PatchesPuzzle,
  snapshot: unknown
): PatchesBoardState {
  if (
    snapshot &&
    typeof snapshot === "object" &&
    !Array.isArray(snapshot) &&
    Object.keys(snapshot as Record<string, unknown>).length ===
      puzzle.clues.length
  ) {
    const raw = snapshot as Record<string, PlayerPatch>;
    const patches: Record<string, PlayerPatch> = {};
    for (const [k, v] of Object.entries(raw)) {
      patches[k] = {
        clueId: v.clueId,
        rect: { ...v.rect },
        locked: false,
      };
    }
    return { patches, history: [] };
  }

  const patches: Record<string, PlayerPatch> = {};
  for (const clue of puzzle.clues) {
    patches[clue.id] = {
      clueId: clue.id,
      rect: { ...clue.solution },
      locked: false,
    };
  }
  return { patches, history: [] };
}

interface PatchesGameProps {
  puzzle: PatchesPuzzle;
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

export function PatchesGame({
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
}: PatchesGameProps) {
  const { t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<PatchesBoardState>(() =>
    reviewCompletion
      ? buildPatchesReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialBoardState()
  );
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
  const [wrongClueId, setWrongClueId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);

  // Reset board cleanly whenever puzzle.id or reviewCompletion changes
  useEffect(() => {
    if (reviewCompletion) {
      setBoard(buildPatchesReviewState(puzzle, reviewCompletion.boardSnapshot));
      setElapsedSeconds(reviewCompletion.elapsedSeconds);
      setPenaltySeconds(reviewCompletion.penaltySeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setPenaltyBurstKey(0);
      setWrongClueId(null);
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }
    setBoard(createInitialBoardState());
    setElapsedSeconds(0);
    setPenaltySeconds(0);
    setHintsUsed(0);
    setPenaltyBurstKey(0);
    setWrongClueId(null);
    setHasWon(false);
    completedRef.current = false;
    if (shouldAutoShowTutorial("patches")) {
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
    () => validateBoard(puzzle, board.patches),
    [puzzle, board.patches]
  );

  // Detect puzzle completion
  useEffect(() => {
    if (validation.isSolved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      setWrongClueId(null);
      feedback.chime();
      onComplete({
        elapsedSeconds,
        penaltySeconds,
        hintsUsed,
        boardSnapshot: board.patches,
      });
    }
  }, [
    validation.isSolved,
    isReviewMode,
    elapsedSeconds,
    penaltySeconds,
    hintsUsed,
    board.patches,
    onComplete,
  ]);

  const totalSeconds = reviewCompletion
    ? reviewCompletion.totalSeconds
    : elapsedSeconds + penaltySeconds;

  const handleCloseRules = useCallback(() => {
    if (isAutoTutorial) {
      markTutorialSeen("patches");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("patches");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  const handleCommitPatch = useCallback(
    (clueId: string, rect: PatchRect) => {
      if (hasWon) return;
      setWrongClueId(null);
      setBoard((prev) => {
        const { nextState, committed, isValid } = commitPatch(
          prev,
          puzzle,
          clueId,
          rect
        );
        if (committed) {
          if (isValid) {
            feedback.pop();
          } else {
            feedback.warn();
          }
        }
        return nextState;
      });
    },
    [hasWon, puzzle]
  );

  const handleRemovePatch = useCallback(
    (clueId: string) => {
      if (hasWon) return;
      setWrongClueId((prev) => (prev === clueId ? null : prev));
      setBoard((prev) => {
        const { nextState, removed } = removePatch(prev, clueId);
        if (removed) {
          feedback.erase();
        }
        return nextState;
      });
    },
    [hasWon]
  );

  const handleUndo = () => {
    if (board.history.length === 0 || hasWon) return;
    feedback.erase();
    setWrongClueId(null);
    setBoard((prev) => undoMove(prev));
  };

  const handleReset = () => {
    if (hasWon) return;
    feedback.erase();
    setWrongClueId(null);
    setBoard((prev) => resetBoard(prev));
  };

  const handleHint = () => {
    if (hasWon) return;
    const result = applyHint(board, puzzle);
    if (result.type === "wrong_patch") {
      feedback.warn();
      setWrongClueId(result.wrongClueId);
      return;
    }
    if (result.type === "already_solved") {
      feedback.click();
      return;
    }

    feedback.pop();
    setWrongClueId(null);
    setBoard(result.nextState);
    setHintsUsed((h) => h + 1);
    setPenaltySeconds((p) => p + 10);
    setPenaltyBurstKey((k) => k + 1);
  };

  const shareText = useMemo(
    () =>
      generatePatchesShareText({
        mode,
        dateStr,
        puzzle,
        totalSeconds,
        hintsUsed,
        streak,
        formatTime,
      }),
    [mode, dateStr, puzzle, totalSeconds, hintsUsed, streak]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2 }}
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
          className="header-btn justify-self-start flex h-9 items-center gap-1 rounded-full pr-3.5 pl-2.5 text-[13px] font-medium text-neutral-800 transition-transform active:scale-95 dark:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.patches.back}
        </button>

        {/* Center Title + Timer with floating +10s penalty */}
        <div className="flex flex-col items-center justify-self-center text-center">
          <span className="whitespace-nowrap text-[12px] font-semibold tracking-tight text-neutral-500 dark:text-neutral-400">
            {mode === "daily" ? t.patches.dailyLabel : t.patches.unlimitedLabel}{" "}
            · {puzzle.size}×{puzzle.size}
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
                  {t.patches.penaltyNotice}
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
          aria-label={t.patches.howToPlay}
          className="header-btn justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-transform active:scale-95 dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Center Board Area */}
      <div className="my-auto flex flex-col items-center">
        {/* Incorrect patch hint banner */}
        <AnimatePresence>
          {wrongClueId && !isReviewMode && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              className="mb-3 flex w-full max-w-[390px] items-center justify-between gap-2 rounded-2xl border border-red-500/25 bg-red-500/[0.10] px-3.5 py-2.5 text-[12px] text-red-800 dark:border-red-400/25 dark:bg-red-500/[0.14] dark:text-red-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span className="leading-snug font-medium">
                  {t.patches.wrongPatchHint}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePatch(wrongClueId)}
                className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-transform active:scale-95 dark:bg-red-400/20 dark:text-red-200"
              >
                {t.patches.clearIt}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <PatchesBoard
          puzzle={puzzle}
          patches={board.patches}
          wrongClueId={wrongClueId}
          disabled={hasWon || isReviewMode}
          onCommitPatch={handleCommitPatch}
          onRemovePatch={handleRemovePatch}
        />

        {/* Progress indicator pill */}
        <div className="mt-3.5 flex items-center gap-2.5 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          <span className="tabular-nums">
            {validation.validPatchCount} / {validation.totalClues}{" "}
            {t.patches.patchesPlaced}
          </span>
          {hintsUsed > 0 && (
            <span className="tabular-nums text-rose-600 dark:text-rose-400">
              · {hintsUsed} {t.win.hints.toLowerCase()} (+{penaltySeconds}s)
            </span>
          )}
        </div>
      </div>

      {/* Tactile 3-Button Controls Bar or Solved Daily Review Bar */}
      {isReviewMode ? (
        <DailyReviewBar
          game="patches"
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
            <span>{t.patches.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleHint}
            disabled={hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-rose-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-rose-300"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
            <span>{t.patches.hint}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={hasWon}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
            <span>{t.patches.reset}</span>
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
                {t.patches.howToPlay}
              </h3>

              {/* Mini Visual Legend for the 4 Clue Types */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.035] p-3 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-[1.6px] border-dashed border-rose-500 bg-rose-500/15 text-[11px] font-bold text-rose-700 dark:border-rose-400 dark:text-rose-200">
                    6
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {t.patches.legendAny}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-sky-500 text-[11px] font-bold text-white dark:bg-sky-400 dark:text-neutral-950">
                    4
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {t.patches.legendSquare}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-7 shrink-0 items-center justify-center rounded-[5px] bg-amber-500 text-[10px] font-bold text-white dark:bg-amber-400 dark:text-neutral-950">
                    6
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {t.patches.legendHorizontal}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-4 shrink-0 items-center justify-center rounded-[5px] bg-emerald-500 text-[10px] font-bold text-white dark:bg-emerald-400 dark:text-neutral-950">
                    3
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                    {t.patches.legendVertical}
                  </span>
                </div>
              </div>

              <ul className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.patches.rule1}</li>
                <li>• {t.patches.rule2}</li>
                <li>• {t.patches.rule3}</li>
                <li>• {t.patches.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.patches.gotIt}
                accentButtonClass="bg-[#E11D48] text-white shadow-[0_4px_14px_-4px_rgba(225,29,72,0.28)] hover:bg-[#BE123C] dark:bg-rose-400/90 dark:text-neutral-950"
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
        game="patches"
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
