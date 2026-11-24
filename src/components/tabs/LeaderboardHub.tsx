"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Flame,
  Grid3X3,
  Info,
  Layers,
  LayoutGrid,
  LogOut,
  Medal,
  Route,
  Sparkles,
  SunMoon,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import {
  isDailyRankLockedByOtherUser,
  type LocalProfileStats,
} from "@/lib/storage";
import {
  fetchDailyLeaderboard,
  fetchOverallDailyLeaderboard,
  isSupabaseConfigured,
  type LeaderboardEntry,
  type LeaderboardFilter,
  type PolaUser,
} from "@/lib/supabase";
import { formatTime } from "@/lib/games/queens/engine";

interface LeaderboardHubProps {
  user: PolaUser | null;
  stats: LocalProfileStats;
  todayDateStr: string;
  syncVersion?: number;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export function LeaderboardHub({
  user,
  stats,
  todayDateStr,
  syncVersion = 0,
  onOpenAuth,
  onSignOut,
}: LeaderboardHubProps) {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] =
    useState<LeaderboardFilter>("overall");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const request =
      selectedFilter === "overall"
        ? fetchOverallDailyLeaderboard(todayDateStr, user?.id)
        : fetchDailyLeaderboard(todayDateStr, selectedFilter, user?.id);

    request
      .then((list) => {
        if (active) {
          setEntries(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setEntries([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [todayDateStr, selectedFilter, user?.id, stats.totalSolved, syncVersion]);

  const highlightRowClass =
    selectedFilter === "overall"
      ? "bg-sky-500/[0.08] dark:bg-sky-400/[0.1]"
      : selectedFilter === "zip"
      ? "bg-sky-500/[0.08] dark:bg-sky-400/[0.08]"
      : selectedFilter === "tango"
      ? "bg-orange-500/[0.08] dark:bg-orange-400/[0.08]"
      : selectedFilter === "mini-sudoku"
      ? "bg-emerald-500/[0.08] dark:bg-emerald-400/[0.08]"
      : selectedFilter === "patches"
      ? "bg-rose-500/[0.08] dark:bg-rose-400/[0.08]"
      : selectedFilter === "fold"
      ? "bg-indigo-500/[0.08] dark:bg-indigo-400/[0.08]"
      : "bg-amber-500/[0.08] dark:bg-amber-400/[0.08]";

  const youBadgeClass =
    selectedFilter === "overall"
      ? "bg-sky-500/20 text-sky-800 dark:text-sky-300"
      : selectedFilter === "zip"
      ? "bg-sky-500/20 text-sky-800 dark:text-sky-300"
      : selectedFilter === "tango"
      ? "bg-orange-500/20 text-orange-800 dark:text-orange-300"
      : selectedFilter === "mini-sudoku"
      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
      : selectedFilter === "patches"
      ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
      : selectedFilter === "fold"
      ? "bg-indigo-500/20 text-indigo-800 dark:text-indigo-300"
      : "bg-amber-500/20 text-amber-800 dark:text-amber-300";

  const emptyMessage =
    selectedFilter === "overall"
      ? t.leaderboard.emptyBoardOverall
      : selectedFilter === "zip"
      ? t.leaderboard.emptyBoardZip
      : selectedFilter === "tango"
      ? t.leaderboard.emptyBoardTango
      : selectedFilter === "mini-sudoku"
      ? t.leaderboard.emptyBoardMiniSudoku
      : selectedFilter === "patches"
      ? t.leaderboard.emptyBoardPatches
      : selectedFilter === "fold"
      ? t.leaderboard.emptyBoardFold
      : t.leaderboard.emptyBoard;

  return (
    <div className="px-5 pt-2 pb-28 lg:mx-auto lg:max-w-2xl lg:px-6 lg:pb-12">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-neutral-950 dark:text-white">
        {t.leaderboard.title}
      </h1>
      <p className="mt-1 text-[13.5px] text-neutral-600 dark:text-neutral-400">
        {t.leaderboard.subtitleAll}
      </p>

      {/* Profile & Personal Stats Card */}
      <div className="glass-card mt-5 rounded-[24px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {t.leaderboard.yourProfile}
            </p>
            <h2 className="font-display mt-0.5 text-[19px] font-bold text-neutral-950 dark:text-white">
              {user ? `@${user.displayName}` : t.leaderboard.guestTitle}
            </h2>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => {
                feedback.click();
                onSignOut();
              }}
              className="flex items-center gap-1.5 rounded-full bg-black/[0.06] px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition-transform active:scale-95 dark:bg-white/[0.1] dark:text-neutral-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.leaderboard.signOutBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                feedback.click();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#0369A1] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(3,105,161,0.28)] transition-colors hover:bg-[#075985] active:scale-95 dark:bg-sky-400/90 dark:text-neutral-950"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t.leaderboard.signInBtn}
            </button>
          )}
        </div>

        {!user && (
          <p className="mt-2 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {t.leaderboard.guestDesc}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-emerald-500/[0.08] p-3 text-center dark:bg-white/[0.05]">
            <div className="font-display flex items-center justify-center gap-1 text-[19px] font-bold tabular-nums text-neutral-950 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {stats.totalSolved}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.solved}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-500/[0.08] p-3 text-center dark:bg-white/[0.05]">
            <div className="font-display flex items-center justify-center gap-1 text-[19px] font-bold tabular-nums text-neutral-950 dark:text-white">
              <Flame className="h-4 w-4 text-amber-500" />
              {stats.currentStreak}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.currentStreak}
            </div>
          </div>

          <div className="rounded-2xl bg-sky-500/[0.08] p-3 text-center dark:bg-white/[0.05]">
            <div className="font-display flex items-center justify-center gap-1 text-[19px] font-bold tabular-nums text-neutral-950 dark:text-white">
              <Sparkles className="h-4 w-4 text-sky-500 dark:text-sky-300" />
              {stats.longestStreak}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.bestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle info pill when today's device rank slot was claimed by another account */}
      {user && isDailyRankLockedByOtherUser(todayDateStr, user.id) && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-black/[0.03] px-3.5 py-2.5 text-[12px] leading-snug text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300">
          <Info className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span>{t.leaderboard.deviceSlotClaimed}</span>
        </div>
      )}

      {/* Daily Leaderboard Section with Overall + 6-Game Switcher */}
      <div className="mt-6">
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t.today.dailyChallenge}
            </span>
            <span className="tabular-nums text-[12px] text-neutral-400">
              {todayDateStr}
            </span>
          </div>

          <div className="glass-card flex items-center gap-1 overflow-x-auto rounded-full p-1">
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("overall");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "overall"
                  ? "border-sky-500/40 bg-sky-500/[0.14] text-sky-950 dark:border-sky-400/35 dark:bg-sky-400/[0.18] dark:text-sky-100"
                  : "border-transparent text-neutral-600 hover:text-sky-800 dark:text-neutral-300"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              {t.leaderboard.overall}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("queens");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "queens"
                  ? "border-amber-500/40 bg-amber-500/[0.14] text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/[0.18] dark:text-amber-100"
                  : "border-transparent text-neutral-600 hover:text-amber-800 dark:text-neutral-300"
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              {t.games.queens.name}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("zip");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "zip"
                  ? "border-sky-500/40 bg-sky-500/[0.14] text-sky-950 dark:border-sky-400/35 dark:bg-sky-400/[0.18] dark:text-sky-100"
                  : "border-transparent text-neutral-600 hover:text-sky-800 dark:text-neutral-300"
              }`}
            >
              <Route className="h-3.5 w-3.5" />
              {t.games.zip.name}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("tango");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "tango"
                  ? "border-orange-500/40 bg-orange-500/[0.14] text-orange-950 dark:border-orange-400/35 dark:bg-orange-400/[0.18] dark:text-orange-100"
                  : "border-transparent text-neutral-600 hover:text-orange-800 dark:text-neutral-300"
              }`}
            >
              <SunMoon className="h-3.5 w-3.5" />
              {t.games.tango.name}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("mini-sudoku");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "mini-sudoku"
                  ? "border-emerald-500/40 bg-emerald-500/[0.14] text-emerald-950 dark:border-emerald-400/35 dark:bg-emerald-400/[0.18] dark:text-emerald-100"
                  : "border-transparent text-neutral-600 hover:text-emerald-800 dark:text-neutral-300"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              {t.games.miniSudoku.name}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("patches");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "patches"
                  ? "border-rose-500/40 bg-rose-500/[0.14] text-rose-950 dark:border-rose-400/35 dark:bg-rose-400/[0.18] dark:text-rose-100"
                  : "border-transparent text-neutral-600 hover:text-rose-800 dark:text-neutral-300"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t.games.patches.name}
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.click();
                setSelectedFilter("fold");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                selectedFilter === "fold"
                  ? "border-indigo-500/40 bg-indigo-500/[0.14] text-indigo-950 dark:border-indigo-400/35 dark:bg-indigo-400/[0.18] dark:text-indigo-100"
                  : "border-transparent text-neutral-600 hover:text-indigo-800 dark:text-neutral-300"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {t.games.fold.name}
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden rounded-[24px]">
          {loading ? (
            <div
              className="divide-y divide-black/[0.05] dark:divide-white/[0.06]"
              aria-label={t.leaderboard.loading}
            >
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="h-4 w-28 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                  </div>
                  <div className="h-4 w-12 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-7 text-center text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {emptyMessage}
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
              {entries.map((entry, idx) => (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    entry.isCurrentUser ? highlightRowClass : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[12px] font-semibold tabular-nums text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-200">
                      {idx === 0 ? (
                        <Medal className="h-4 w-4 text-amber-500" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="flex min-w-0 items-center">
                      <span className="truncate text-[14px] font-semibold text-neutral-900 dark:text-white">
                        @{entry.displayName}
                      </span>
                      {entry.isCurrentUser && (
                        <span
                          className={`ml-1.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${youBadgeClass}`}
                        >
                          {t.leaderboard.you}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {selectedFilter === "overall" &&
                      typeof entry.gamesSolved === "number" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                            entry.gamesSolved === 6
                              ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                              : "bg-black/[0.05] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300"
                          }`}
                        >
                          {entry.gamesSolved}/6
                        </span>
                      )}
                    {entry.hintsUsed > 0 && (
                      <span className="text-[11px] tabular-nums text-neutral-400">
                        {entry.hintsUsed}h
                      </span>
                    )}
                    <span className="font-display tabular-nums text-[15px] font-bold text-neutral-900 dark:text-white">
                      {formatTime(entry.totalSeconds)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-2.5 px-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            {t.leaderboard.offlineNote}
          </p>
        )}
      </div>
    </div>
  );
}
