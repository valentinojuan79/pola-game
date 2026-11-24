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
import { formatTime } from "@/lib/games/queens/engine";
import {
  countFilledCells,
  createInitialTangoState,
  findTangoViolations,
  generateTangoShareText,
  isTangoSolved,
  resetTangoBoard,
  tapTangoCell,
  undoTangoMove,
} from "@/lib/games/tango/engine";
import { formatTangoHint, getSmartTangoHint } from "@/lib/games/tango/hints";
import type {
  TangoBoardState,
  TangoCellValue,
  TangoHint,
  TangoPuzzle,
  TangoViolations,
  TangoVisualMode,
} from "@/lib/games/tango/types";
import {
  loadTangoVisualMode,
  markTutorialSeen,
  saveTangoVisualMode,
  setSkipAllTutorials,
  shouldAutoShowTutorial,
  type DailyCompletion,
} from "@/lib/storage";
import type { PolaUser } from "@/lib/supabase";
import { DailyReviewBar } from "@/components/games/shared/DailyReviewBar";
import { TutorialModalFooter } from "@/components/games/shared/TutorialModalFooter";
import { WinModal } from "@/components/games/queens/WinModal";
import { TangoBoard, TangoSymbolGlyph } from "./TangoBoard";

const HINT_COOLDOWN_SECONDS = 10;
const VIOLATION_DELAY_MS = 600;

const EMPTY_VIOLATIONS: TangoViolations = {
  cells: new Set<string>(),
  constraints: new Set<string>(),
};

function buildTangoReviewState(
  puzzle: TangoPuzzle,
  snapshot: unknown
): TangoBoardState {
  if (
    Array.isArray(snapshot) &&
    snapshot.length === 6 &&
    snapshot.every((row) => Array.isArray(row) && row.length === 6)
  ) {
    return {
      grid: (snapshot as TangoCellValue[][]).map((row) => [...row]),
      history: [],
    };
  }
  return {
    grid: puzzle.solution.map((row) => [...row]),
    history: [],
  };
}

interface TangoGameProps {
  puzzle: TangoPuzzle;
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
  onPlayUnlimitedNext: (difficulty?: TangoPuzzle["difficulty"]) => void;
  onOpenAuth: () => void;
}

export function TangoGame({
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
}: TangoGameProps) {
  const { locale, t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<TangoBoardState>(() =>
    reviewCompletion
      ? buildTangoReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialTangoState(puzzle)
  );
  const [visualMode, setVisualMode] = useState<TangoVisualMode>("icons");
  const [elapsedSeconds, setElapsedSeconds] = useState(
    reviewCompletion ? reviewCompletion.totalSeconds : 0
  );
  const [hintsUsed, setHintsUsed] = useState(
    reviewCompletion ? reviewCompletion.hintsUsed : 0
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [activeHint, setActiveHint] = useState<TangoHint | null>(null);
  const [visibleViolations, setVisibleViolations] =
    useState<TangoViolations>(EMPTY_VIOLATIONS);
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);
  const violationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate persisted visual mode preference
  useEffect(() => {
    setVisualMode(loadTangoVisualMode());
  }, []);

  // Reset cleanly whenever puzzle.id or reviewCompletion changes
  useEffect(() => {
    if (violationTimerRef.current) {
      clearTimeout(violationTimerRef.current);
      violationTimerRef.current = null;
    }
    if (reviewCompletion) {
      setBoard(buildTangoReviewState(puzzle, reviewCompletion.boardSnapshot));
      setElapsedSeconds(reviewCompletion.totalSeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setHintCooldown(0);
      setActiveHint(null);
      setVisibleViolations(EMPTY_VIOLATIONS);
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }
    setBoard(createInitialTangoState(puzzle));
    setElapsedSeconds(0);
    setHintsUsed(0);
    setHintCooldown(0);
    setActiveHint(null);
    setVisibleViolations(EMPTY_VIOLATIONS);
    setHasWon(false);
    completedRef.current = false;
    if (shouldAutoShowTutorial("tango")) {
      setIsAutoTutorial(true);
      setShowRules(true);
    }
  }, [puzzle, reviewCompletion]);

  // Live timer (pauses when solved, review mode, or rules modal is open)
  useEffect(() => {
    if (hasWon || showRules || isReviewMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasWon, showRules, isReviewMode]);

  // 10-second Hint cooldown
  useEffect(() => {
    if (hintCooldown <= 0 || hasWon || isReviewMode) return;
    const timer = setInterval(() => {
      setHintCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hintCooldown, hasWon, isReviewMode]);

  // Delayed error highlight (~600ms) so double-tapping to Moon never flashes red
  const rawViolations = useMemo(
    () => findTangoViolations(board.grid, puzzle.constraints),
    [board.grid, puzzle.constraints]
  );

  useEffect(() => {
    if (violationTimerRef.current) {
      clearTimeout(violationTimerRef.current);
      violationTimerRef.current = null;
    }

    if (
      rawViolations.cells.size === 0 &&
      rawViolations.constraints.size === 0
    ) {
      setVisibleViolations(EMPTY_VIOLATIONS);
      return;
    }

    violationTimerRef.current = setTimeout(() => {
      setVisibleViolations(rawViolations);
      feedback.warn();
    }, VIOLATION_DELAY_MS);

    return () => {
      if (violationTimerRef.current) {
        clearTimeout(violationTimerRef.current);
        violationTimerRef.current = null;
      }
    };
  }, [rawViolations]);

  // Auto-clear active hint once the user resolves the hinted cell
  useEffect(() => {
    if (!activeHint) return;
    const [r, c] = activeHint.targetCell;
    const currentVal = board.grid[r][c];
    if (
      activeHint.kind === "error" &&
      currentVal !== activeHint.refSymbol
    ) {
      setActiveHint(null);
    } else if (
      activeHint.kind === "deduction" &&
      currentVal === activeHint.deducedSymbol
    ) {
      setActiveHint(null);
    }
  }, [board.grid, activeHint]);

  const solved = useMemo(
    () => isTangoSolved(board.grid, puzzle),
    [board.grid, puzzle]
  );

  // Detect puzzle completion
  useEffect(() => {
    if (solved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      setActiveHint(null);
      setVisibleViolations(EMPTY_VIOLATIONS);
      feedback.chime();
      onComplete({
        elapsedSeconds,
        penaltySeconds: 0,
        hintsUsed,
        boardSnapshot: board.grid,
      });
    }
  }, [solved, isReviewMode, elapsedSeconds, hintsUsed, board.grid, onComplete]);

  const handleCloseRules = useCallback(() => {
    if (isAutoTutorial) {
      markTutorialSeen("tango");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("tango");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  const handleSelectVisualMode = useCallback(
    (next: TangoVisualMode) => {
      if (next === visualMode) return;
      feedback.click();
      setVisualMode(next);
      saveTangoVisualMode(next);
    },
    [visualMode]
  );

  const handleCellTap = useCallback(
    (r: number, c: number) => {
      if (hasWon) return;
      setBoard((prev) => {
        const { nextState, nextValue, changed } = tapTangoCell(
          prev,
          puzzle,
          r,
          c
        );
        if (!changed) return prev;
        if (nextValue === 0) feedback.erase();
        else if (nextValue === 1) feedback.pop();
        else feedback.click();
        return nextState;
      });
    },
    [hasWon, puzzle]
  );

  const handleUndo = useCallback(() => {
    if (board.history.length === 0 || hasWon) return;
    feedback.erase();
    setBoard((prev) => undoTangoMove(prev));
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
    if (hasWon) return;
    feedback.erase();
    setActiveHint(null);
    setBoard((prev) => resetTangoBoard(prev, puzzle));
  };

  const handleHint = () => {
    if (hasWon || hintCooldown > 0) return;
    const hint = getSmartTangoHint(board.grid, puzzle);
    if (!hint) return;
    setActiveHint(hint);
    setHintsUsed((h) => h + 1);
    setHintCooldown(HINT_COOLDOWN_SECONDS);
    if (hint.kind === "error") {
      feedback.warn();
    } else {
      feedback.pop();
    }
  };

  const filledCount = useMemo(() => countFilledCells(board.grid), [board.grid]);
  const initialFilledCount = useMemo(
    () => countFilledCells(puzzle.initial),
    [puzzle.initial]
  );

  const formattedHint = useMemo(
    () => (activeHint ? formatTangoHint(activeHint, locale, visualMode) : null),
    [activeHint, locale, visualMode]
  );

  const shareText = useMemo(
    () =>
      generateTangoShareText({
        mode,
        dateStr,
        difficulty: puzzle.difficulty,
        totalSeconds: elapsedSeconds,
        hintsUsed,
        streak,
        visualMode,
        solution: puzzle.solution,
      }),
    [
      mode,
      dateStr,
      puzzle.difficulty,
      puzzle.solution,
      elapsedSeconds,
      hintsUsed,
      streak,
      visualMode,
    ]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-dvh flex-col justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      {/* Top Game Navigation Bar — dead-center 3-column grid */}
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
          {t.tango.back}
        </button>

        {/* Center Title + Timer */}
        <div className="flex min-w-0 flex-col items-center justify-self-center text-center">
          <span className="max-w-full truncate whitespace-nowrap text-[12px] sm:text-[13px] font-semibold tracking-normal text-slate-600 dark:text-slate-300">
            {mode === "daily" ? t.tango.dailyLabel : t.tango.unlimitedLabel} ·
            6×6
          </span>

          <div className="relative mt-0.5 flex items-center justify-center">
            <span className="font-display tabular-nums text-[22px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Right: How-to-Play */}
        <button
          type="button"
          onClick={() => {
            feedback.click();
            setIsAutoTutorial(false);
            setShowRules(true);
          }}
          aria-label={t.tango.howToPlay}
          className="header-btn justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Center Board Area + Floating Smart Hint Pill */}
      <div className="my-auto flex flex-col items-center">
        {/* Smart Hint Glass Card (reserved height-friendly, animates cleanly) */}
        <AnimatePresence initial={false}>
          {activeHint && formattedHint && (
            <motion.div
              key={`${activeHint.ruleCode}-${activeHint.targetCell.join(",")}`}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`glass-pill mb-3 flex w-full max-w-[376px] items-start gap-3 rounded-[20px] px-3.5 py-3 text-left ${
                activeHint.kind === "error"
                  ? "border-rose-500/30 bg-rose-50/85 dark:border-rose-400/30 dark:bg-rose-950/50"
                  : "border-orange-500/30 bg-orange-50/80 dark:border-orange-400/25 dark:bg-neutral-900/80"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  activeHint.kind === "error"
                    ? "bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300"
                    : "bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300"
                }`}
              >
                {activeHint.kind === "deduction" && activeHint.deducedSymbol ? (
                  <TangoSymbolGlyph
                    value={activeHint.deducedSymbol}
                    visualMode={visualMode}
                    size="sm"
                  />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[12px] font-bold leading-tight ${
                    activeHint.kind === "error"
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-orange-800 dark:text-orange-300"
                  }`}
                >
                  {formattedHint.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-neutral-700 dark:text-neutral-300">
                  {formattedHint.body}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  feedback.click();
                  setActiveHint(null);
                }}
                aria-label="Dismiss hint"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/[0.06] hover:text-neutral-700 dark:hover:bg-white/[0.1] dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <TangoBoard
          puzzle={puzzle}
          grid={board.grid}
          visualMode={visualMode}
          violations={visibleViolations}
          activeHint={activeHint}
          disabled={hasWon || isReviewMode}
          onCellTap={handleCellTap}
        />

        {/* Progress + Native iOS Segmented Control for Visual Mode */}
        <div className="mt-3.5 flex w-full max-w-[376px] items-center justify-between gap-2 px-1">
          <span className="truncate tabular-nums text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
            {filledCount} / 36 {t.tango.cellsFilled}
          </span>

          <div
            role="radiogroup"
            aria-label={t.tango.toggleVisualMode}
            className="relative inline-grid shrink-0 grid-cols-2 items-center rounded-full border border-black/[0.06] bg-black/[0.045] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            {(["icons", "circles"] as const).map((option) => {
              const active = visualMode === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSelectVisualMode(option)}
                  className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-semibold transition-colors ${
                    active
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="tango-visual-mode-pill"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 32,
                      }}
                      className="absolute inset-0 -z-10 rounded-full border border-white/80 bg-white/90 shadow-[0_1px_4px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/15 dark:bg-neutral-800/90 dark:shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                    />
                  )}
                  <TangoSymbolGlyph
                    value={1}
                    visualMode={option}
                    size="xs"
                  />
                  <span>
                    {option === "icons"
                      ? t.tango.modeIcons
                      : t.tango.modeCircles}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tactile Bottom Controls Bar or Solved Daily Review Bar */}
      {isReviewMode ? (
        <DailyReviewBar
          game="tango"
          dateStr={dateStr}
          difficulty={puzzle.difficulty}
          gridSize={6}
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
            <span>{t.tango.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleHint}
            disabled={hasWon || hintCooldown > 0}
            className="glass-card relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[20px] py-3 text-[11px] font-medium text-orange-700 transition-transform active:scale-95 disabled:opacity-50 dark:text-orange-300"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
            <span className="tabular-nums">
              {hintCooldown > 0 ? `${hintCooldown}s` : t.tango.hint}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={hasWon || filledCount <= initialFilledCount}
            className="glass-card flex flex-col items-center justify-center gap-1 rounded-[20px] py-3 text-[11px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
            <span>{t.tango.reset}</span>
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
                {t.tango.howToPlay}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.tango.rule1}</li>
                <li>• {t.tango.rule2}</li>
                <li>• {t.tango.rule3}</li>
                <li>• {t.tango.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.tango.gotIt}
                accentButtonClass="bg-[#EA580C] text-white shadow-[0_4px_14px_-4px_rgba(234,88,12,0.28)] hover:bg-[#C2410C] dark:bg-orange-400/90 dark:text-neutral-950"
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
        game="tango"
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
