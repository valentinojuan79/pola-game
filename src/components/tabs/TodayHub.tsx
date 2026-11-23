"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Crown,
  Flame,
  CheckCircle2,
  ChevronRight,
  Infinity as InfinityIcon,
  Route,
  Sparkles,
  SunMoon,
  Grid3X3,
  Layers,
  LayoutGrid,
  Play,
  Trophy,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { DailyCompletion, LocalProfileStats } from "@/lib/storage";
import {
  DIFFICULTY_TO_SIZE,
  type QueensDifficulty,
} from "@/lib/games/queens/types";
import {
  ZIP_DIFFICULTY_TO_SIZE,
  type ZipDifficulty,
} from "@/lib/games/zip/types";
import type { TangoDifficulty } from "@/lib/games/tango/types";
import type { MiniSudokuDifficulty } from "@/lib/games/mini-sudoku/types";
import {
  PATCHES_DIFFICULTY_TO_SIZE,
  type PatchesDifficulty,
} from "@/lib/games/patches/types";
import {
  FOLD_DIFFICULTY_TO_SIZE,
  type FoldDifficulty,
} from "@/lib/games/fold/types";
import { formatTime } from "@/lib/games/queens/engine";

interface TodayHubProps {
  stats: LocalProfileStats;
  todayDateStr: string;
  todayDifficulty: QueensDifficulty;
  todayZipDifficulty: ZipDifficulty;
  todayTangoDifficulty: TangoDifficulty;
  todayMiniSudokuDifficulty: MiniSudokuDifficulty;
  todayPatchesDifficulty: PatchesDifficulty;
  todayFoldDifficulty: FoldDifficulty;
  todayQueensCompletion: DailyCompletion | null;
  todayZipCompletion: DailyCompletion | null;
  todayTangoCompletion: DailyCompletion | null;
  todayMiniSudokuCompletion: DailyCompletion | null;
  todayPatchesCompletion: DailyCompletion | null;
  todayFoldCompletion: DailyCompletion | null;
  onPlayDailyQueens: () => void;
  onPlayDailyZip: () => void;
  onPlayDailyTango: () => void;
  onPlayDailyMiniSudoku: () => void;
  onPlayDailyPatches: () => void;
  onPlayDailyFold: () => void;
  onGoToUnlimited: () => void;
}

function getCountdownToMidnight(): string {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const diffSec = Math.max(
    0,
    Math.floor((midnight.getTime() - now.getTime()) / 1000)
  );
  const hrs = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

export function TodayHub({
  stats,
  todayDateStr,
  todayDifficulty,
  todayZipDifficulty,
  todayTangoDifficulty,
  todayMiniSudokuDifficulty,
  todayPatchesDifficulty,
  todayFoldDifficulty,
  todayQueensCompletion,
  todayZipCompletion,
  todayTangoCompletion,
  todayMiniSudokuCompletion,
  todayPatchesCompletion,
  todayFoldCompletion,
  onPlayDailyQueens,
  onPlayDailyZip,
  onPlayDailyTango,
  onPlayDailyMiniSudoku,
  onPlayDailyPatches,
  onPlayDailyFold,
  onGoToUnlimited,
}: TodayHubProps) {
  const { locale, t } = useI18n();
  const [midnightCountdown, setMidnightCountdown] = useState<string>("--:--:--");

  const allCleared = Boolean(
    todayQueensCompletion &&
      todayZipCompletion &&
      todayTangoCompletion &&
      todayMiniSudokuCompletion &&
      todayPatchesCompletion &&
      todayFoldCompletion
  );

  const combinedTotalSeconds = allCleared
    ? (todayQueensCompletion?.totalSeconds ?? 0) +
      (todayZipCompletion?.totalSeconds ?? 0) +
      (todayTangoCompletion?.totalSeconds ?? 0) +
      (todayMiniSudokuCompletion?.totalSeconds ?? 0) +
      (todayPatchesCompletion?.totalSeconds ?? 0) +
      (todayFoldCompletion?.totalSeconds ?? 0)
    : 0;

  // Client-side countdown to midnight (never runs during SSR -> zero hydration mismatch)
  useEffect(() => {
    if (!allCleared) return;
    setMidnightCountdown(getCountdownToMidnight());
    const interval = setInterval(() => {
      setMidnightCountdown(getCountdownToMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, [allCleared]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? t.greetings.morning
      : hour < 18
      ? t.greetings.afternoon
      : t.greetings.evening;

  const formattedDate = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  ).format(now);

  const queensGridSize = DIFFICULTY_TO_SIZE[todayDifficulty];
  const queensDiffLabel = t.unlimited.difficulties[todayDifficulty].label;

  const zipGridSize = ZIP_DIFFICULTY_TO_SIZE[todayZipDifficulty];
  const zipDiffLabel = t.unlimited.zipDifficulties[todayZipDifficulty].label;

  const tangoDiffLabel = t.unlimited.tangoDifficulties[todayTangoDifficulty].label;
  const miniSudokuDiffLabel =
    t.unlimited.miniSudokuDifficulties[todayMiniSudokuDifficulty].label;
  const patchesGridSize = PATCHES_DIFFICULTY_TO_SIZE[todayPatchesDifficulty];
  const patchesDiffLabel =
    t.unlimited.patchesDifficulties[todayPatchesDifficulty].label;
  const foldGridSize = FOLD_DIFFICULTY_TO_SIZE[todayFoldDifficulty];
  const foldDiffLabel =
    t.unlimited.foldDifficulties[todayFoldDifficulty].label;

  return (
    <div className="px-5 pt-3 pb-28">
      {/* Greeting + Date + Streak Pill */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {formattedDate}
          </p>
          <h1 className="font-display mt-1 text-[30px] font-bold leading-tight tracking-tight text-neutral-950 dark:text-white">
            {greeting}
          </h1>
        </div>

        <div className="glass-pill mt-1 flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2">
          <Flame
            className={`h-4 w-4 ${
              stats.currentStreak > 0
                ? "fill-amber-500 text-amber-500"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          />
          <span className="font-display tabular-nums text-[15px] font-bold text-neutral-950 dark:text-white">
            {stats.currentStreak}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t.today.subtitle}
      </p>

      {/* Celebratory "All Daily Puzzles Cleared" Hero Card */}
      {allCleared && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="glass-card relative mt-5 overflow-hidden rounded-[28px] border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-white/80 to-amber-500/[0.06] p-5 dark:border-emerald-400/20 dark:from-emerald-500/[0.12] dark:via-neutral-900/70 dark:to-amber-500/[0.08]"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-emerald-500/25 bg-emerald-500/[0.14] text-emerald-700 shadow-xs dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-300">
              <Trophy className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  6 / 6 {t.today.completed}
                </span>
              </div>
              <h2 className="font-display mt-0.5 text-[18px] font-bold leading-snug tracking-tight text-neutral-950 dark:text-white">
                {t.today.allClearedTitle}
              </h2>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t.today.allClearedSubtitle}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-black/[0.04] px-2.5 py-2.5 text-center dark:bg-white/[0.06]">
              <Clock className="mx-auto h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
              <div className="font-display mt-1 tabular-nums text-[15px] font-bold text-neutral-950 dark:text-white">
                {formatTime(combinedTotalSeconds)}
              </div>
              <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                {t.today.totalTime}
              </div>
            </div>

            <div className="rounded-2xl bg-black/[0.04] px-2.5 py-2.5 text-center dark:bg-white/[0.06]">
              <Flame className="mx-auto h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <div className="font-display mt-1 tabular-nums text-[15px] font-bold text-neutral-950 dark:text-white">
                {stats.currentStreak}
              </div>
              <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                {t.win.streak}
              </div>
            </div>

            <div className="rounded-2xl bg-black/[0.04] px-2.5 py-2.5 text-center dark:bg-white/[0.06]">
              <Sparkles className="mx-auto h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <div className="font-display mt-1 tabular-nums text-[14px] font-bold text-neutral-950 dark:text-white">
                {midnightCountdown}
              </div>
              <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                {t.today.nextDrop}
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              feedback.pop();
              onGoToUnlimited();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(5,150,105,0.32)] transition-colors hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950 dark:hover:bg-emerald-300"
          >
            <InfinityIcon className="h-4 w-4" />
            {t.today.playUnlimitedCta}
          </motion.button>
        </motion.div>
      )}

      {/* Section Header */}
      <div className="mt-7 mb-3 flex items-center justify-between px-0.5">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t.today.dailyProgress}
        </h2>
        <span className="tabular-nums text-[12px] font-medium text-neutral-400 dark:text-neutral-500">
          {todayDateStr}
        </span>
      </div>

      {/* Active Daily Games: Queens (Muted Amber) & Zip (Muted Ocean Blue) */}
      <div className="space-y-3.5">
        {/* Game #1: Queens */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyQueens();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-amber-600/[0.18] bg-gradient-to-br from-amber-500/[0.05] via-white/75 to-white/65 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-amber-600/35 hover:shadow-[0_10px_24px_-8px_rgba(180,83,9,0.14)] dark:border-amber-400/[0.16] dark:from-amber-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-amber-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-amber-500/[0.12] text-amber-700 border border-amber-600/20 shadow-xs dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/20">
              <Crown className="h-7 w-7 fill-amber-600/15 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.queens.name}
                </span>
                <span className="rounded-full bg-amber-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                  {queensGridSize}×{queensGridSize} · {queensDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.queens.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayQueensCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayQueensCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D97706] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(180,83,9,0.28)] transition-colors group-hover:bg-[#B45309] dark:bg-amber-500/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/[0.10] text-amber-800 transition-transform group-hover:translate-x-0.5 dark:bg-amber-400/15 dark:text-amber-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>

        {/* Game #2: Zip */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyZip();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-sky-600/[0.18] bg-gradient-to-br from-sky-500/[0.05] via-white/75 to-white/65 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-sky-600/35 hover:shadow-[0_10px_24px_-8px_rgba(3,105,161,0.14)] dark:border-sky-400/[0.16] dark:from-sky-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-sky-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-sky-500/[0.12] text-sky-700 border border-sky-600/20 shadow-xs dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/20">
              <Route className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.zip.name}
                </span>
                <span className="rounded-full bg-sky-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-sky-900 dark:bg-sky-400/15 dark:text-sky-200">
                  {zipGridSize}×{zipGridSize} · {zipDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.zip.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayZipCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayZipCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0369A1] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(3,105,161,0.28)] transition-colors group-hover:bg-[#075985] dark:bg-sky-400/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/[0.10] text-sky-800 transition-transform group-hover:translate-x-0.5 dark:bg-sky-400/15 dark:text-sky-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>

        {/* Game #3: Tango */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyTango();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-orange-600/[0.18] bg-gradient-to-br from-orange-500/[0.05] via-white/75 to-white/65 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-orange-600/35 hover:shadow-[0_10px_24px_-8px_rgba(234,88,12,0.14)] dark:border-orange-400/[0.16] dark:from-orange-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-orange-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-orange-500/[0.12] text-orange-700 border border-orange-600/20 shadow-xs dark:bg-orange-400/15 dark:text-orange-300 dark:border-orange-400/20">
              <SunMoon className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.tango.name}
                </span>
                <span className="rounded-full bg-orange-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 dark:bg-orange-400/15 dark:text-orange-200">
                  6×6 · {tangoDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.tango.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayTangoCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayTangoCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EA580C] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(234,88,12,0.28)] transition-colors group-hover:bg-[#C2410C] dark:bg-orange-400/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/[0.10] text-orange-800 transition-transform group-hover:translate-x-0.5 dark:bg-orange-400/15 dark:text-orange-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>

        {/* Game #4: Mini Sudoku */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyMiniSudoku();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-emerald-600/[0.18] bg-gradient-to-br from-emerald-500/[0.05] via-white/75 to-white/65 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-600/35 hover:shadow-[0_10px_24px_-8px_rgba(5,150,105,0.14)] dark:border-emerald-400/[0.16] dark:from-emerald-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-emerald-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-emerald-500/[0.12] text-emerald-700 border border-emerald-600/20 shadow-xs dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20">
              <Grid3X3 className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.miniSudoku.name}
                </span>
                <span className="rounded-full bg-emerald-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200">
                  6×6 · {miniSudokuDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.miniSudoku.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayMiniSudokuCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayMiniSudokuCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#059669] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(5,150,105,0.28)] transition-colors group-hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/[0.10] text-emerald-800 transition-transform group-hover:translate-x-0.5 dark:bg-emerald-400/15 dark:text-emerald-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>

        {/* Game #5: Patches (Soft Rose / Berry Tinted Glass) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyPatches();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-rose-600/[0.18] bg-gradient-to-br from-rose-500/[0.05] via-white/75 to-white/65 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-rose-600/35 hover:shadow-[0_10px_24px_-8px_rgba(225,29,72,0.14)] dark:border-rose-400/[0.16] dark:from-rose-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-rose-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-rose-500/[0.12] text-rose-700 border border-rose-600/20 shadow-xs dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20">
              <LayoutGrid className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.patches.name}
                </span>
                <span className="rounded-full bg-rose-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-rose-900 dark:bg-rose-400/15 dark:text-rose-200">
                  {patchesGridSize}×{patchesGridSize} · {patchesDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.patches.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayPatchesCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayPatchesCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E11D48] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(225,29,72,0.28)] transition-colors group-hover:bg-[#BE123C] dark:bg-rose-400/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/[0.10] text-rose-800 transition-transform group-hover:translate-x-0.5 dark:bg-rose-400/15 dark:text-rose-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>

        {/* Game #6: Fold (Soft Lavender / Periwinkle Tinted Glass) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyFold();
          }}
          className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] border-indigo-600/[0.18] bg-gradient-to-br from-indigo-500/[0.06] via-white/75 to-violet-500/[0.04] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-600/35 hover:shadow-[0_10px_24px_-8px_rgba(79,70,229,0.14)] dark:border-indigo-400/[0.16] dark:from-indigo-500/[0.09] dark:via-neutral-900/60 dark:to-violet-500/[0.07] dark:hover:border-indigo-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-indigo-500/[0.12] text-indigo-700 border border-indigo-600/20 shadow-xs dark:bg-indigo-400/15 dark:text-indigo-300 dark:border-indigo-400/20">
              <Layers className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[19px] font-bold tracking-tight text-neutral-950 dark:text-white">
                  {t.games.fold.name}
                </span>
                <span className="rounded-full bg-indigo-500/[0.11] px-2.5 py-0.5 text-[11px] font-semibold text-indigo-900 dark:bg-indigo-400/15 dark:text-indigo-200">
                  {foldGridSize}×{foldGridSize} · {foldDiffLabel}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {t.games.fold.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
            {todayFoldCompletion ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/[0.12] px-3 py-1.5 text-[12px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.today.completed} ·{" "}
                <span className="font-display tabular-nums">
                  {formatTime(todayFoldCompletion.totalSeconds)}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F46E5] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(79,70,229,0.28)] transition-colors group-hover:bg-[#4338CA] dark:bg-indigo-400/90 dark:text-neutral-950">
                <Play className="h-3.5 w-3.5 fill-current" />
                {t.today.play}
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/[0.10] text-indigo-800 transition-transform group-hover:translate-x-0.5 dark:bg-indigo-400/15 dark:text-indigo-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
