"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Flame,
  CheckCircle2,
  ChevronRight,
  Route,
  SunMoon,
  Grid3X3,
  LayoutGrid,
  Lock,
  Play,
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
import { formatTime } from "@/lib/games/queens/engine";

interface TodayHubProps {
  stats: LocalProfileStats;
  todayDateStr: string;
  todayDifficulty: QueensDifficulty;
  todayZipDifficulty: ZipDifficulty;
  todayQueensCompletion: DailyCompletion | null;
  todayZipCompletion: DailyCompletion | null;
  onPlayDailyQueens: () => void;
  onPlayDailyZip: () => void;
}

export function TodayHub({
  stats,
  todayDateStr,
  todayDifficulty,
  todayZipDifficulty,
  todayQueensCompletion,
  todayZipCompletion,
  onPlayDailyQueens,
  onPlayDailyZip,
}: TodayHubProps) {
  const { locale, t } = useI18n();

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

  const upcomingGames = [
    {
      id: "tango",
      name: t.games.tango.name,
      tagline: t.games.tango.tagline,
      icon: SunMoon,
      cardTint:
        "bg-gradient-to-br from-orange-500/[0.04] via-white/70 to-white/60 border-orange-500/[0.15] dark:from-orange-500/[0.06] dark:via-neutral-900/55 dark:to-neutral-900/50 dark:border-orange-400/15",
      iconTint:
        "bg-orange-500/[0.10] text-orange-700 border-orange-500/20 dark:bg-orange-400/15 dark:text-orange-300 dark:border-orange-400/20",
    },
    {
      id: "mini-sudoku",
      name: t.games.miniSudoku.name,
      tagline: t.games.miniSudoku.tagline,
      icon: Grid3X3,
      cardTint:
        "bg-gradient-to-br from-emerald-500/[0.04] via-white/70 to-white/60 border-emerald-600/[0.15] dark:from-emerald-500/[0.06] dark:via-neutral-900/55 dark:to-neutral-900/50 dark:border-emerald-400/15",
      iconTint:
        "bg-emerald-600/[0.10] text-emerald-700 border-emerald-600/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20",
    },
    {
      id: "patches",
      name: t.games.patches.name,
      tagline: t.games.patches.tagline,
      icon: LayoutGrid,
      cardTint:
        "bg-gradient-to-br from-rose-500/[0.04] via-white/70 to-white/60 border-rose-500/[0.15] dark:from-rose-500/[0.06] dark:via-neutral-900/55 dark:to-neutral-900/50 dark:border-rose-400/15",
      iconTint:
        "bg-rose-500/[0.10] text-rose-700 border-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20",
    },
  ];

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
      </div>

      {/* Coming Soon Preview Cards (Games 3–5) */}
      <div className="mt-3.5 space-y-2.5">
        {upcomingGames.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className={`glass-card flex items-center gap-3.5 rounded-[22px] p-4 opacity-85 ${game.cardTint}`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border ${game.iconTint}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[16px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {game.name}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400">
                    <Lock className="h-2.5 w-2.5" />
                    {t.today.comingSoon}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-neutral-500 dark:text-neutral-400">
                  {game.tagline}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
