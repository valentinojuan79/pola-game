"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Eraser,
  HelpCircle,
  Lightbulb,
  Pencil,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { formatTime } from "@/lib/games/queens/engine";
import {
  cellKey,
  countFilledCells,
  createInitialMiniSudokuState,
  eraseMiniSudokuCell,
  findMiniSudokuConflicts,
  generateMiniSudokuShareText,
  getCompletedDigits,
  isLockedCell,
  isMiniSudokuSolved,
  placeMiniSudokuNumber,
  resetMiniSudokuBoard,
  toggleMiniSudokuNote,
  undoMiniSudokuMove,
} from "@/lib/games/mini-sudoku/engine";
import {
  formatMiniSudokuHint,
  getSmartMiniSudokuHint,
} from "@/lib/games/mini-sudoku/hints";
import type {
  CompletedUnit,
  MiniSudokuBoardState,
  MiniSudokuValue,
  MiniSudokuDigit,
  MiniSudokuHint,
  MiniSudokuPuzzle,
} from "@/lib/games/mini-sudoku/types";
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
import { MiniSudokuBoard, type WaveEffect } from "./MiniSudokuBoard";

const HINT_COOLDOWN_SECONDS = 10;
const DIGITS: MiniSudokuDigit[] = [1, 2, 3, 4, 5, 6];

function buildMiniSudokuReviewState(
  puzzle: MiniSudokuPuzzle,
  snapshot: unknown
): MiniSudokuBoardState {
  if (
    Array.isArray(snapshot) &&
    snapshot.length === 6 &&
    snapshot.every((row) => Array.isArray(row) && row.length === 6)
  ) {
    return {
      grid: (snapshot as MiniSudokuValue[][]).map((row) => [...row]),
      notes: Array.from({ length: 6 }, () => Array<number>(6).fill(0)),
      history: [],
    };
  }
  return {
    grid: puzzle.solution.map((row) => [...row]),
    notes: Array.from({ length: 6 }, () => Array<number>(6).fill(0)),
    history: [],
  };
}

interface MiniSudokuGameProps {
  puzzle: MiniSudokuPuzzle;
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
  onPlayUnlimitedNext: (difficulty?: MiniSudokuPuzzle["difficulty"]) => void;
  onOpenAuth: () => void;
}

export function MiniSudokuGame({
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
}: MiniSudokuGameProps) {
  const { locale, t } = useI18n();
  const isReviewMode = Boolean(reviewCompletion);

  const [board, setBoard] = useState<MiniSudokuBoardState>(() =>
    reviewCompletion
      ? buildMiniSudokuReviewState(puzzle, reviewCompletion.boardSnapshot)
      : createInitialMiniSudokuState(puzzle)
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    () => {
      if (reviewCompletion) return null;
      // Pre-select the first empty cell for immediate playability
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (puzzle.initial[r][c] === 0) return [r, c];
        }
      }
      return [0, 0];
    }
  );
  const [notesMode, setNotesMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    reviewCompletion ? reviewCompletion.totalSeconds : 0
  );
  const [hintsUsed, setHintsUsed] = useState(
    reviewCompletion ? reviewCompletion.hintsUsed : 0
  );
  const [hintCooldown, setHintCooldown] = useState(0);
  const [activeHint, setActiveHint] = useState<MiniSudokuHint | null>(null);
  const [waveEffect, setWaveEffect] = useState<WaveEffect | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isAutoTutorial, setIsAutoTutorial] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const completedRef = useRef(isReviewMode);
  const waveIdRef = useRef(0);
  const waveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean reset when puzzle or reviewCompletion changes
  useEffect(() => {
    if (waveTimerRef.current) {
      clearTimeout(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    if (reviewCompletion) {
      setBoard(
        buildMiniSudokuReviewState(puzzle, reviewCompletion.boardSnapshot)
      );
      setSelectedCell(null);
      setNotesMode(false);
      setElapsedSeconds(reviewCompletion.totalSeconds);
      setHintsUsed(reviewCompletion.hintsUsed);
      setHintCooldown(0);
      setActiveHint(null);
      setWaveEffect(null);
      setHasWon(false);
      setShowRules(false);
      setIsAutoTutorial(false);
      completedRef.current = true;
      return;
    }
    setBoard(createInitialMiniSudokuState(puzzle));
    let firstEmpty: [number, number] = [0, 0];
    outer: for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (puzzle.initial[r][c] === 0) {
          firstEmpty = [r, c];
          break outer;
        }
      }
    }
    setSelectedCell(firstEmpty);
    setNotesMode(false);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setHintCooldown(0);
    setActiveHint(null);
    setWaveEffect(null);
    setHasWon(false);
    completedRef.current = false;
    if (shouldAutoShowTutorial("mini-sudoku")) {
      setIsAutoTutorial(true);
      setShowRules(true);
    }
  }, [puzzle, reviewCompletion]);

  // Cleanup wave timer on unmount
  useEffect(() => {
    return () => {
      if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
    };
  }, []);

  // Live timer (pauses on win, review mode, or when rules modal is open)
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

  const conflicts = useMemo(
    () => findMiniSudokuConflicts(board.grid),
    [board.grid]
  );

  const completedDigits = useMemo(
    () => getCompletedDigits(board.grid, conflicts),
    [board.grid, conflicts]
  );

  // Auto-clear active hint once resolved
  useEffect(() => {
    if (!activeHint) return;
    const [r, c] = activeHint.targetCell;
    const currentVal = board.grid[r][c];
    if (activeHint.kind === "error" && currentVal !== activeHint.digit) {
      setActiveHint(null);
    } else if (
      activeHint.kind === "deduction" &&
      currentVal === activeHint.digit
    ) {
      setActiveHint(null);
    }
  }, [board.grid, activeHint]);

  const solved = useMemo(
    () => isMiniSudokuSolved(board.grid, puzzle),
    [board.grid, puzzle]
  );

  // Detect puzzle completion
  useEffect(() => {
    if (solved && !completedRef.current && !isReviewMode) {
      completedRef.current = true;
      setHasWon(true);
      setActiveHint(null);
      // Slight delay so the final unit's green wave starts before modal pops
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
      markTutorialSeen("mini-sudoku");
      setIsAutoTutorial(false);
    }
    setShowRules(false);
  }, [isAutoTutorial]);

  const handleSkipAllTutorials = useCallback(() => {
    markTutorialSeen("mini-sudoku");
    setSkipAllTutorials(true);
    setIsAutoTutorial(false);
    setShowRules(false);
  }, []);

  /** Trigger staggered emerald wave radiating outward from the placed cell across all newly completed units */
  const triggerUnitWave = useCallback(
    (originR: number, originC: number, units: CompletedUnit[]) => {
      if (units.length === 0) return;

      const cellDelays = new Map<string, number>();
      let maxDist = 0;

      for (const unit of units) {
        for (const [cr, cc] of unit.cells) {
          const dist = Math.abs(cr - originR) + Math.abs(cc - originC);
          if (dist > maxDist) maxDist = dist;
          const k = cellKey(cr, cc);
          const delaySec = dist * 0.055;
          const existing = cellDelays.get(k);
          if (existing === undefined || delaySec < existing) {
            cellDelays.set(k, delaySec);
          }
        }
      }

      waveIdRef.current += 1;
      setWaveEffect({ id: waveIdRef.current, cellDelays });

      if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
      const totalMs = Math.ceil((maxDist * 0.055 + 0.78) * 1000);
      waveTimerRef.current = setTimeout(() => {
        setWaveEffect(null);
        waveTimerRef.current = null;
      }, totalMs);
    },
    []
  );

  const handleSelectCell = useCallback(
    (r: number, c: number) => {
      if (hasWon) return;
      feedback.click();
      setSelectedCell([r, c]);
    },
    [hasWon]
  );

  const handleDigitInput = useCallback(
    (digit: MiniSudokuDigit) => {
      if (hasWon || !selectedCell) return;
      const [r, c] = selectedCell;
      if (isLockedCell(puzzle, r, c)) {
        feedback.warn();
        return;
      }

      if (notesMode) {
        setBoard((prev) => {
          const { nextState, changed } = toggleMiniSudokuNote(
            prev,
            puzzle,
            r,
            c,
            digit
          );
          if (changed) feedback.click();
          return nextState;
        });
        return;
      }

      // Permanent number placement
      const result = placeMiniSudokuNumber(board, puzzle, r, c, digit);
      if (!result.changed) return;

      setBoard(result.nextState);

      if (!result.placed) {
        feedback.erase();
        return;
      }

      // Check if placement created a conflict or completed 1+ units
      const nextConflicts = findMiniSudokuConflicts(result.nextState.grid);
      const cellHasConflict = nextConflicts.has(cellKey(r, c));

      if (cellHasConflict) {
        feedback.warn();
      } else if (result.newlyCompletedUnits.length > 0) {
        triggerUnitWave(r, c, result.newlyCompletedUnits);
        // If this final move didn't finish the entire board, play the unit-complete chime
        if (!isMiniSudokuSolved(result.nextState.grid, puzzle)) {
          feedback.unitComplete(result.newlyCompletedUnits.length);
        }
      } else {
        feedback.pop();
      }
    },
    [hasWon, selectedCell, puzzle, notesMode, board, triggerUnitWave]
  );

  const handleErase = useCallback(() => {
    if (hasWon || !selectedCell) return;
    const [r, c] = selectedCell;
    const { nextState, changed } = eraseMiniSudokuCell(board, puzzle, r, c);
    if (!changed) return;
    feedback.erase();
    setBoard(nextState);
  }, [hasWon, selectedCell, board, puzzle]);

  const handleUndo = useCallback(() => {
    if (board.history.length === 0 || hasWon) return;
    feedback.erase();
    setBoard((prev) => undoMiniSudokuMove(prev));
  }, [board.history.length, hasWon]);

  const handleReset = useCallback(() => {
    if (hasWon) return;
    feedback.erase();
    setActiveHint(null);
    setWaveEffect(null);
    setBoard((prev) => resetMiniSudokuBoard(prev, puzzle));
  }, [hasWon, puzzle]);

  const handleHint = useCallback(() => {
    if (hasWon || hintCooldown > 0) return;
    const hint = getSmartMiniSudokuHint(board.grid, puzzle);
    if (!hint) return;
    setActiveHint(hint);
    setSelectedCell(hint.targetCell);
    setHintsUsed((h) => h + 1);
    setHintCooldown(HINT_COOLDOWN_SECONDS);
    if (hint.kind === "error") {
      feedback.warn();
    } else {
      feedback.pop();
    }
  }, [hasWon, hintCooldown, board.grid, puzzle]);

  // Optional keyboard navigation & input for desktop users
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (hasWon || showRules) return;
      if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        handleDigitInput(Number(e.key) as MiniSudokuDigit);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleErase();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        feedback.click();
        setNotesMode((prev) => !prev);
      } else if (selectedCell && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const [r, c] = selectedCell;
        if (e.key === "ArrowUp") setSelectedCell([(r + 5) % 6, c]);
        else if (e.key === "ArrowDown") setSelectedCell([(r + 1) % 6, c]);
        else if (e.key === "ArrowLeft") setSelectedCell([r, (c + 5) % 6]);
        else if (e.key === "ArrowRight") setSelectedCell([r, (c + 1) % 6]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasWon, showRules, selectedCell, handleDigitInput, handleErase]);

  const filledCount = useMemo(() => countFilledCells(board.grid), [board.grid]);
  const hasAnyProgress = useMemo(
    () =>
      board.grid.some((row, r) =>
        row.some(
          (val, c) => val !== puzzle.initial[r][c] || board.notes[r][c] !== 0
        )
      ),
    [board.grid, board.notes, puzzle.initial]
  );

  const formattedHint = useMemo(
    () => (activeHint ? formatMiniSudokuHint(activeHint, locale) : null),
    [activeHint, locale]
  );

  const shareText = useMemo(
    () =>
      generateMiniSudokuShareText({
        mode,
        dateStr,
        difficulty: puzzle.difficulty,
        totalSeconds: elapsedSeconds,
        hintsUsed,
        streak,
        initial: puzzle.initial,
      }),
    [
      mode,
      dateStr,
      puzzle.difficulty,
      puzzle.initial,
      elapsedSeconds,
      hintsUsed,
      streak,
    ]
  );

  const selectedIsLocked =
    selectedCell !== null &&
    isLockedCell(puzzle, selectedCell[0], selectedCell[1]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-dvh flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      {/* Dead-center 3-column Game Navigation Bar */}
      <div className="relative z-10 grid h-auto grid-cols-[72px_1fr_72px] sm:grid-cols-[84px_1fr_84px] items-center gap-1 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2">
        <button
          type="button"
          onClick={() => {
            feedback.click();
            onExit();
          }}
          className="header-btn justify-self-start flex h-9 items-center gap-1 rounded-full pr-3 pl-2 sm:pr-3.5 sm:pl-2.5 text-[13px] font-medium text-neutral-800 transition-colors dark:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          {t.miniSudoku.back}
        </button>

        {/* Center Title + Timer */}
        <div className="flex min-w-0 flex-col items-center justify-self-center text-center">
          <span className="max-w-full truncate whitespace-nowrap text-[12px] sm:text-[13px] font-semibold tracking-normal text-slate-600 dark:text-slate-300">
            {mode === "daily"
              ? t.miniSudoku.dailyLabel
              : t.miniSudoku.unlimitedLabel}{" "}
            · 6×6
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
          aria-label={t.miniSudoku.howToPlay}
          className="header-btn justify-self-end flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors dark:text-neutral-200"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Cohesive Vertically Centered Board + Counter + Controls Stack */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence initial={false}>
          {activeHint && formattedHint && (
            <motion.div
              key={`${activeHint.rule}-${activeHint.targetCell.join(",")}`}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`glass-pill mb-3 flex w-full max-w-[376px] items-start gap-3 rounded-[20px] px-3.5 py-3 text-left ${
                activeHint.kind === "error"
                  ? "border-rose-500/30 bg-rose-50/85 dark:border-rose-400/30 dark:bg-rose-950/50"
                  : "border-emerald-500/30 bg-emerald-50/85 dark:border-emerald-400/25 dark:bg-neutral-900/80"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold ${
                  activeHint.kind === "error"
                    ? "bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300"
                    : "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
                }`}
              >
                {activeHint.kind === "deduction" ? (
                  activeHint.digit
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[12px] font-bold leading-tight ${
                    activeHint.kind === "error"
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-emerald-800 dark:text-emerald-300"
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

        <MiniSudokuBoard
          puzzle={puzzle}
          grid={board.grid}
          notes={board.notes}
          selectedCell={selectedCell}
          conflicts={conflicts}
          activeHint={activeHint}
          waveEffect={waveEffect}
          disabled={hasWon || isReviewMode}
          onSelectCell={handleSelectCell}
        />

        {/* Progress + Notes Status Indicator */}
        <div className="mt-3 flex w-full max-w-[376px] items-center justify-between px-1">
          <span className="tabular-nums text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
            {filledCount} / 36 {t.miniSudoku.cellsFilled}
          </span>

          {notesMode && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/[0.12] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200">
              <Pencil className="h-3 w-3" />
              {t.miniSudoku.notesOn}
            </span>
          )}
        </div>

        {/* Thumb-Friendly Number Pad (1-6) + Action Tools or Solved Daily Review Bar */}
        {isReviewMode ? (
          <div className="mt-3.5 w-full max-w-[376px]">
            <DailyReviewBar
              game="mini-sudoku"
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
          </div>
        ) : (
          <div className="mt-3.5 w-full max-w-[376px]">
            {/* 1-6 Vertical Rectangular Glass Number Pad */}
            <div className="grid grid-cols-6 gap-1.5">
              {DIGITS.map((d) => {
                const isDone = completedDigits.has(d);
                return (
                  <motion.button
                    key={d}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    disabled={hasWon}
                    onClick={() => handleDigitInput(d)}
                    aria-label={`Number ${d}${isDone ? " completed" : ""}`}
                    className={`glass-card relative flex h-14 min-h-[56px] items-center justify-center rounded-2xl font-display tabular-nums text-xl font-bold transition-all disabled:opacity-40 ${
                      isDone && !notesMode
                        ? "border-emerald-500/20 bg-emerald-500/[0.06] text-neutral-400 opacity-55 dark:border-emerald-400/15 dark:bg-emerald-400/[0.06] dark:text-neutral-500"
                        : notesMode
                        ? "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-800 hover:bg-emerald-500/[0.14] dark:border-emerald-400/25 dark:bg-emerald-400/[0.1] dark:text-emerald-200"
                        : "text-neutral-900 hover:border-emerald-500/30 hover:bg-white/90 dark:text-white dark:hover:border-emerald-400/30 dark:hover:bg-neutral-800/80"
                    }`}
                  >
                    <span>{d}</span>
                    {isDone && (
                      <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600/85 text-white dark:bg-emerald-400/90 dark:text-neutral-950">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* 5 Action Controls: Notes, Erase, Undo, Hint, Reset */}
            <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  feedback.click();
                  setNotesMode((prev) => !prev);
                }}
                disabled={hasWon}
                aria-pressed={notesMode}
                className={`glass-card flex flex-col items-center justify-center gap-1 rounded-[18px] py-2.5 text-[10px] sm:text-[10.5px] font-medium transition-all active:scale-95 disabled:opacity-40 ${
                  notesMode
                    ? "border-emerald-500/45 bg-emerald-500/[0.16] text-emerald-900 dark:border-emerald-400/45 dark:bg-emerald-400/[0.18] dark:text-emerald-100"
                    : "text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <Pencil className="h-[17px] w-[17px]" />
                <span className="whitespace-nowrap">{t.miniSudoku.notes}</span>
              </button>

              <button
                type="button"
                onClick={handleErase}
                disabled={hasWon || !selectedCell || selectedIsLocked}
                className="glass-card flex flex-col items-center justify-center gap-1 rounded-[18px] py-2.5 text-[10px] sm:text-[10.5px] font-medium text-neutral-800 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-200"
              >
                <Eraser className="h-[17px] w-[17px]" />
                <span className="whitespace-nowrap">{t.miniSudoku.erase}</span>
              </button>

              <button
                type="button"
                onClick={handleUndo}
                disabled={board.history.length === 0 || hasWon}
                className="glass-card flex flex-col items-center justify-center gap-1 rounded-[18px] py-2.5 text-[10px] sm:text-[10.5px] font-medium text-neutral-800 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-200"
              >
                <Undo2 className="h-[17px] w-[17px]" />
                <span className="whitespace-nowrap">{t.miniSudoku.undo}</span>
              </button>

              <button
                type="button"
                onClick={handleHint}
                disabled={hasWon || hintCooldown > 0}
                className="glass-card relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[18px] py-2.5 text-[10px] sm:text-[10.5px] font-medium text-emerald-700 transition-transform active:scale-95 disabled:opacity-50 dark:text-emerald-300"
              >
                <Lightbulb className="h-[17px] w-[17px]" />
                <span className="whitespace-nowrap tabular-nums">
                  {hintCooldown > 0 ? `${hintCooldown}s` : t.miniSudoku.hint}
                </span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={hasWon || !hasAnyProgress}
                className="glass-card flex flex-col items-center justify-center gap-1 rounded-[18px] py-2.5 text-[10px] sm:text-[10.5px] font-medium text-neutral-700 transition-transform active:scale-95 disabled:opacity-40 dark:text-neutral-300"
              >
                <RotateCcw className="h-[17px] w-[17px]" />
                <span className="whitespace-nowrap">{t.miniSudoku.reset}</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
                {t.miniSudoku.howToPlay}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                <li>• {t.miniSudoku.rule1}</li>
                <li>• {t.miniSudoku.rule2}</li>
                <li>• {t.miniSudoku.rule3}</li>
                <li>• {t.miniSudoku.rule4}</li>
              </ul>

              <TutorialModalFooter
                isAutoTutorial={isAutoTutorial}
                manualLabel={t.miniSudoku.gotIt}
                accentButtonClass="bg-[#059669] text-white shadow-[0_4px_14px_-4px_rgba(5,150,105,0.28)] hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950"
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
        game="mini-sudoku"
        mode={mode}
        dateStr={dateStr}
        difficulty={puzzle.difficulty}
        gridSize={6}
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
