"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Crown,
  Flame,
  CheckCircle2,
  ChevronRight,
  Infinity as InfinityIcon,
  Keyboard,
  Medal,
  Route,
  Share2,
  Shuffle,
  Sparkles,
  SunMoon,
  Grid3X3,
  Layers,
  LayoutGrid,
  Play,
  Trophy,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { feedback } from "@/lib/feedback";
import type { DailyCompletion, LocalProfileStats } from "@/lib/storage";
import {
  fetchOverallDailyLeaderboard,
  type LeaderboardEntry,
} from "@/lib/supabase";
import type { DailyRecapSharePayload } from "@/lib/shareCardRenderer";
import { VisualShareModal } from "@/components/VisualShareModal";
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
  userId?: string | null;
  username?: string | null;
  syncVersion?: number;
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
  onGoToRanks: () => void;
  onPlayRandomUnlimited: () => void;
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
  userId,
  username,
  syncVersion = 0,
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
  onGoToRanks,
  onPlayRandomUnlimited,
}: TodayHubProps) {
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const [midnightCountdown, setMidnightCountdown] = useState<string>("--:--:--");
  const [recapShareOpen, setRecapShareOpen] = useState(false);
  const [topRanks, setTopRanks] = useState<LeaderboardEntry[]>([]);
  const [ranksLoading, setRanksLoading] = useState(true);

  const completedList = useMemo(
    () =>
      [
        todayQueensCompletion
          ? {
              game: "queens" as const,
              completion: todayQueensCompletion,
              difficulty: todayDifficulty,
            }
          : null,
        todayZipCompletion
          ? {
              game: "zip" as const,
              completion: todayZipCompletion,
              difficulty: todayZipDifficulty,
            }
          : null,
        todayTangoCompletion
          ? {
              game: "tango" as const,
              completion: todayTangoCompletion,
              difficulty: todayTangoDifficulty,
            }
          : null,
        todayMiniSudokuCompletion
          ? {
              game: "mini-sudoku" as const,
              completion: todayMiniSudokuCompletion,
              difficulty: todayMiniSudokuDifficulty,
            }
          : null,
        todayPatchesCompletion
          ? {
              game: "patches" as const,
              completion: todayPatchesCompletion,
              difficulty: todayPatchesDifficulty,
            }
          : null,
        todayFoldCompletion
          ? {
              game: "fold" as const,
              completion: todayFoldCompletion,
              difficulty: todayFoldDifficulty,
            }
          : null,
      ].filter(Boolean) as {
        game: DailyRecapSharePayload["games"][number]["game"];
        completion: DailyCompletion;
        difficulty: DailyRecapSharePayload["games"][number]["difficulty"];
      }[],
    [
      todayQueensCompletion,
      todayZipCompletion,
      todayTangoCompletion,
      todayMiniSudokuCompletion,
      todayPatchesCompletion,
      todayFoldCompletion,
      todayDifficulty,
      todayZipDifficulty,
      todayTangoDifficulty,
      todayMiniSudokuDifficulty,
      todayPatchesDifficulty,
      todayFoldDifficulty,
    ]
  );

  const completedCount = completedList.length;
  const allCleared = completedCount === 6;

  const combinedTotalSeconds = useMemo(
    () =>
      completedList.reduce(
        (sum, item) => sum + item.completion.totalSeconds,
        0
      ),
    [completedList]
  );

  const recapPayload = useMemo<DailyRecapSharePayload | null>(() => {
    if (completedList.length === 0) return null;

    const games: DailyRecapSharePayload["games"] = completedList.map(
      (item) => ({
        game: item.game,
        totalSeconds: item.completion.totalSeconds,
        hintsUsed: item.completion.hintsUsed,
        difficulty: item.difficulty,
      })
    );

    const totalHintsUsed = games.reduce((sum, g) => sum + g.hintsUsed, 0);

    return {
      kind: "recap",
      dateStr: todayDateStr,
      totalSeconds: combinedTotalSeconds,
      totalHintsUsed,
      streak: stats.currentStreak,
      username: username ?? null,
      games,
    };
  }, [
    completedList,
    todayDateStr,
    combinedTotalSeconds,
    stats.currentStreak,
    username,
  ]);

  // Live top-3 snapshot for the desktop info strip
  useEffect(() => {
    let active = true;
    setRanksLoading(true);
    fetchOverallDailyLeaderboard(todayDateStr, userId ?? undefined)
      .then((entries) => {
        if (active) {
          setTopRanks(entries.slice(0, 3));
          setRanksLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setTopRanks([]);
          setRanksLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [todayDateStr, userId, stats.totalSolved, syncVersion]);

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
    <div className="px-5 pt-3 pb-28 lg:px-6 lg:pb-12">
      {/* Greeting + Date + Mobile Streak Pill / Desktop Progress & Share Card */}
      <div className="flex items-start justify-between gap-3 lg:items-center">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {formattedDate}
          </p>
          <h1 className="font-display mt-1 text-[30px] lg:text-[34px] font-bold leading-tight tracking-tight text-neutral-950 dark:text-white">
            {greeting}
          </h1>
          <p className="mt-1.5 hidden text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400 lg:block">
            {t.today.subtitle}
          </p>
        </div>

        {/* Mobile/Tablet Streak Pill */}
        <div className="glass-pill mt-1 flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 lg:hidden">
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

        {/* Desktop Daily Progress & Share Summary Card (lg+ only) */}
        <div className="glass-card hidden shrink-0 items-center gap-5 rounded-[22px] px-5 py-3.5 lg:flex">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {locale === "id" ? "Progres Hari Ini" : "Daily Progress"}
              </div>
              <div className="font-display mt-0.5 flex items-baseline gap-1.5 text-[18px] font-bold tabular-nums text-neutral-950 dark:text-white">
                <span>{completedCount} / 6</span>
                <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
                  {t.today.completed}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-black/[0.07] dark:bg-white/[0.1]" />

            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.today.totalTime}
              </div>
              <div className="font-display mt-0.5 flex items-center gap-1.5 text-[18px] font-bold tabular-nums text-neutral-950 dark:text-white">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                {completedCount > 0 ? formatTime(combinedTotalSeconds) : "—"}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={completedCount === 0}
            onClick={() => {
              feedback.pop();
              setRecapShareOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#0369A1] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(3,105,161,0.3)] transition-all hover:bg-[#075985] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-sky-400/90 dark:text-neutral-950 dark:hover:bg-sky-300"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{locale === "id" ? "Bagikan Skor" : "Share Scorecard"}</span>
          </button>
        </div>
      </div>

      <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400 lg:hidden">
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

          <div className="mt-4 space-y-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                feedback.pop();
                setRecapShareOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(5,150,105,0.32)] transition-colors hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950 dark:hover:bg-emerald-300"
            >
              <Share2 className="h-4 w-4" />
              {t.today.shareDailyRecap}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                feedback.pop();
                onGoToUnlimited();
              }}
              className="glass-card flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13.5px] font-semibold text-neutral-900 transition-colors hover:bg-white/85 dark:text-white dark:hover:bg-white/[0.1]"
            >
              <InfinityIcon className="h-4 w-4" />
              {t.today.playUnlimitedCta}
            </motion.button>
          </div>
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

      {/* Active Daily Games: 1-col on mobile/tablet, 3×2 grid on desktop (lg+) */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3 lg:gap-5">
        {/* Game #1: Queens */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            feedback.pop();
            onPlayDailyQueens();
          }}
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-amber-600/[0.18] bg-gradient-to-br from-amber-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-amber-600/35 hover:shadow-[0_10px_24px_-8px_rgba(180,83,9,0.14)] dark:border-amber-400/[0.16] dark:from-amber-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-amber-400/30"
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
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-sky-600/[0.18] bg-gradient-to-br from-sky-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-sky-600/35 hover:shadow-[0_10px_24px_-8px_rgba(3,105,161,0.14)] dark:border-sky-400/[0.16] dark:from-sky-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-sky-400/30"
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
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-orange-600/[0.18] bg-gradient-to-br from-orange-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-orange-600/35 hover:shadow-[0_10px_24px_-8px_rgba(234,88,12,0.14)] dark:border-orange-400/[0.16] dark:from-orange-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-orange-400/30"
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
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-emerald-600/[0.18] bg-gradient-to-br from-emerald-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-600/35 hover:shadow-[0_10px_24px_-8px_rgba(5,150,105,0.14)] dark:border-emerald-400/[0.16] dark:from-emerald-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-emerald-400/30"
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
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-rose-600/[0.18] bg-gradient-to-br from-rose-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-rose-600/35 hover:shadow-[0_10px_24px_-8px_rgba(225,29,72,0.14)] dark:border-rose-400/[0.16] dark:from-rose-500/[0.08] dark:via-neutral-900/60 dark:to-neutral-900/55 dark:hover:border-rose-400/30"
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
          className="glass-card group relative flex h-full w-full flex-col justify-between gap-4 overflow-hidden rounded-[26px] border-indigo-600/[0.18] bg-gradient-to-br from-indigo-500/[0.06] via-white/75 to-violet-500/[0.04] p-5 lg:p-6 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-600/35 hover:shadow-[0_10px_24px_-8px_rgba(79,70,229,0.14)] dark:border-indigo-400/[0.16] dark:from-indigo-500/[0.09] dark:via-neutral-900/60 dark:to-violet-500/[0.07] dark:hover:border-indigo-400/30"
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

      {/* Desktop 3-Column Info Strip (lg+ only) */}
      <div className="mt-6 hidden lg:grid lg:grid-cols-3 lg:gap-5">
        {/* Card 1 — Today's Top Ranks */}
        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/[0.12] text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
                  <Trophy className="h-4 w-4" />
                </div>
                <h3 className="font-display text-[15px] font-bold text-neutral-950 dark:text-white">
                  {locale === "id" ? "Peringkat Teratas Hari Ini" : "Today's Top Ranks"}
                </h3>
              </div>
              <span className="tabular-nums text-[11px] font-medium text-neutral-400">
                {todayDateStr}
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {ranksLoading ? (
                <p className="py-4 text-center text-[12px] text-neutral-400">
                  {t.leaderboard.loading}
                </p>
              ) : topRanks.length === 0 ? (
                <p className="py-4 text-[12.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {t.leaderboard.emptyBoardOverall}
                </p>
              ) : (
                topRanks.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] ${
                      entry.isCurrentUser
                        ? "bg-sky-500/[0.1] font-semibold text-sky-950 dark:bg-sky-400/[0.12] dark:text-sky-100"
                        : "bg-black/[0.03] text-neutral-800 dark:bg-white/[0.04] dark:text-neutral-200"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[11px] font-bold">
                        {idx === 0 ? (
                          <Medal className="h-4 w-4 text-amber-500" />
                        ) : idx === 1 ? (
                          <Medal className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Medal className="h-4 w-4 text-amber-700 dark:text-amber-600" />
                        )}
                      </span>
                      <span className="truncate font-medium">
                        @{entry.displayName}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 tabular-nums text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {entry.gamesSolved ?? 1}/6
                      </span>
                      <span>{formatTime(entry.totalSeconds)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              feedback.click();
              onGoToRanks();
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-sky-700 transition-colors hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
          >
            <span>
              {locale === "id" ? "Lihat Semua Peringkat" : "View Full Ranks"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 2 — Quick Practice */}
        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/[0.12] text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                <InfinityIcon className="h-4 w-4" />
              </div>
              <h3 className="font-display text-[15px] font-bold text-neutral-950 dark:text-white">
                {locale === "id" ? "Latihan Cepat" : "Quick Practice"}
              </h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {locale === "id"
                ? "Langsung main puzzle acak dari 6 game Pola tanpa memengaruhi streak harianmu."
                : "Jump straight into a random puzzle across all 6 games with zero pressure on your daily streak."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              feedback.pop();
              onPlayRandomUnlimited();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0369A1] py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(3,105,161,0.3)] transition-all hover:bg-[#075985] active:scale-[0.98] dark:bg-sky-400/90 dark:text-neutral-950 dark:hover:bg-sky-300"
          >
            <Shuffle className="h-4 w-4" />
            <span>
              {locale === "id"
                ? "Main Acak Tanpa Batas"
                : "Play Random Unlimited"}
            </span>
          </button>
        </div>

        {/* Card 3 — Desktop Controls */}
        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/[0.12] text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <Keyboard className="h-4 w-4" />
              </div>
              <h3 className="font-display text-[15px] font-bold text-neutral-950 dark:text-white">
                {locale === "id" ? "Kontrol Desktop" : "Desktop Controls"}
              </h3>
            </div>

            <div className="mt-3.5 space-y-2 text-[12.5px] text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center justify-between gap-2">
                <span>
                  {locale === "id" ? "Isi angka Mini Sudoku" : "Mini Sudoku digits"}
                </span>
                <kbd className="rounded-lg border border-black/[0.1] bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-800 dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-neutral-100">
                  1–6
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>
                  {locale === "id" ? "Hapus kotak terpilih" : "Clear selected cell"}
                </span>
                <kbd className="rounded-lg border border-black/[0.1] bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-800 dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-neutral-100">
                  Backspace
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>{locale === "id" ? "Batalkan langkah" : "Undo last move"}</span>
                <kbd className="rounded-lg border border-black/[0.1] bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-800 dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-neutral-100">
                  Z
                </kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>
                  {locale === "id" ? "Tarik jalur & area" : "Draw paths & marks"}
                </span>
                <kbd className="rounded-lg border border-black/[0.1] bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-800 dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-neutral-100">
                  Click & Drag
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recapPayload && (
        <VisualShareModal
          isOpen={recapShareOpen}
          onClose={() => setRecapShareOpen(false)}
          payload={recapPayload}
          theme={theme}
          lang={locale}
        />
      )}
    </div>
  );
}
