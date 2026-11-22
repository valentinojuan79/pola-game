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
import { DIFFICULTY_TO_SIZE, type QueensDifficulty } from "@/lib/games/queens/types";
import { formatTime } from "@/lib/games/queens/engine";

interface TodayHubProps {
  stats: LocalProfileStats;
  todayDateStr: string;
  todayDifficulty: QueensDifficulty;
  todayQueensCompletion: DailyCompletion | null;
  onPlayDailyQueens: () => void;
}

export function TodayHub({
  stats,
  todayDateStr,
  todayDifficulty,
  todayQueensCompletion,
  onPlayDailyQueens,
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

  const gridSize = DIFFICULTY_TO_SIZE[todayDifficulty];
  const diffLabel = t.unlimited.difficulties[todayDifficulty].label;

  const upcomingGames = [
    {
      id: "zip",
      name: t.games.zip.name,
      tagline: t.games.zip.tagline,
      icon: Route,
      tint: "bg-sky-500/14 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border-sky-500/20",
    },
    {
      id: "tango",
      name: t.games.tango.name,
      tagline: t.games.tango.tagline,
      icon: SunMoon,
      tint: "bg-orange-500/14 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300 border-orange-500/20",
    },
    {
      id: "mini-sudoku",
      name: t.games.miniSudoku.name,
      tagline: t.games.miniSudoku.tagline,
      icon: Grid3X3,
      tint: "bg-emerald-500/14 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300 border-emerald-500/20",
    },
    {
      id: "patches",
      name: t.games.patches.name,
      tagline: t.games.patches.tagline,
      icon: LayoutGrid,
      tint: "bg-rose-500/14 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300 border-rose-500/20",
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
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-neutral-950 dark:text-white">
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
          <span className="tabular-nums text-[14px] font-bold text-neutral-950 dark:text-white">
            {stats.currentStreak}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t.today.subtitle}
      </p>

      {/* Section Header */}
      <div className="mt-7 mb-3 flex items-center justify-between px-0.5">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t.today.dailyProgress}
        </h2>
        <span className="tabular-nums text-[12px] font-medium text-neutral-400 dark:text-neutral-500">
          {todayDateStr}
        </span>
      </div>

      {/* Featured Active Game #1: Queens */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={() => {
          feedback.pop();
          onPlayDailyQueens();
        }}
        className="glass-card group relative flex w-full flex-col gap-4 overflow-hidden rounded-[26px] p-5 text-left transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-amber-400/20 text-amber-600 border border-amber-500/25 shadow-xs dark:bg-amber-400/15 dark:text-amber-300">
            <Crown className="h-7 w-7 fill-amber-500/20 stroke-[2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
                {t.games.queens.name}
              </span>
              <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700 dark:bg-white/[0.1] dark:text-neutral-200">
                {gridSize}×{gridSize} · {diffLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
              {t.games.queens.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.07]">
          {todayQueensCompletion ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {t.today.completed} ·{" "}
              <span className="tabular-nums">
                {formatTime(todayQueensCompletion.totalSeconds)}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-[12px] font-semibold text-white shadow-xs transition-colors group-hover:bg-neutral-800 dark:bg-white dark:text-neutral-950">
              <Play className="h-3.5 w-3.5 fill-current" />
              {t.today.play}
            </span>
          )}

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-neutral-500 transition-transform group-hover:translate-x-0.5 dark:bg-white/[0.06] dark:text-neutral-300">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </motion.button>

      {/* Coming Soon Preview Cards (Games 2–5) */}
      <div className="mt-3.5 space-y-2.5">
        {upcomingGames.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className="glass-card flex items-center gap-3.5 rounded-[22px] p-4 opacity-80"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border ${game.tint}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
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
