"use client";

import React, { useEffect, useState } from "react";
import {
  Crown,
  Flame,
  LogOut,
  Medal,
  Sparkles,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { LocalProfileStats } from "@/lib/storage";
import {
  fetchDailyLeaderboard,
  isSupabaseConfigured,
  type LeaderboardEntry,
  type PolaUser,
} from "@/lib/supabase";
import { formatTime } from "@/lib/games/queens/engine";

interface LeaderboardHubProps {
  user: PolaUser | null;
  stats: LocalProfileStats;
  todayDateStr: string;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export function LeaderboardHub({
  user,
  stats,
  todayDateStr,
  onOpenAuth,
  onSignOut,
}: LeaderboardHubProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDailyLeaderboard(todayDateStr, "queens", user?.id).then((list) => {
      if (active) {
        setEntries(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [todayDateStr, user?.id, stats.totalSolved]);

  return (
    <div className="px-5 pt-2 pb-28">
      <h1 className="text-[26px] font-semibold tracking-tight text-neutral-950 dark:text-white">
        {t.leaderboard.title}
      </h1>
      <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
        {t.leaderboard.subtitle}
      </p>

      {/* Profile & Personal Stats Card */}
      <div className="glass-card mt-5 rounded-[24px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {t.leaderboard.yourProfile}
            </p>
            <h2 className="mt-0.5 text-[18px] font-semibold text-neutral-950 dark:text-white">
              {user ? `@${user.username}` : t.leaderboard.guestTitle}
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
              className="flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-2 text-[12px] font-semibold text-white transition-transform active:scale-95 dark:bg-white dark:text-neutral-950"
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
          <div className="rounded-2xl bg-black/[0.035] p-3 text-center dark:bg-white/[0.05]">
            <div className="flex items-center justify-center gap-1 text-[18px] font-semibold tabular-nums text-neutral-950 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {stats.totalSolved}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.solved}
            </div>
          </div>

          <div className="rounded-2xl bg-black/[0.035] p-3 text-center dark:bg-white/[0.05]">
            <div className="flex items-center justify-center gap-1 text-[18px] font-semibold tabular-nums text-neutral-950 dark:text-white">
              <Flame className="h-4 w-4 text-amber-500" />
              {stats.currentStreak}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.currentStreak}
            </div>
          </div>

          <div className="rounded-2xl bg-black/[0.035] p-3 text-center dark:bg-white/[0.05]">
            <div className="flex items-center justify-center gap-1 text-[18px] font-semibold tabular-nums text-neutral-950 dark:text-white">
              <Sparkles className="h-4 w-4 text-neutral-500 dark:text-neutral-300" />
              {stats.longestStreak}
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.bestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Queens Leaderboard List */}
      <div className="mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
            <Crown className="h-4 w-4 text-amber-500" />
            <span>{t.queens.dailyLabel}</span>
          </div>
          <span className="tabular-nums text-[12px] text-neutral-400">
            {todayDateStr}
          </span>
        </div>

        <div className="glass-card overflow-hidden rounded-[24px]">
          {loading ? (
            <div className="p-6 text-center text-[13px] text-neutral-400">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-neutral-500 dark:text-neutral-400">
              {t.leaderboard.emptyBoard}
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
              {entries.map((entry, idx) => (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    entry.isCurrentUser
                      ? "bg-amber-500/[0.08] dark:bg-amber-400/[0.08]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] text-[12px] font-semibold tabular-nums text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-200">
                      {idx === 0 ? (
                        <Medal className="h-4 w-4 text-amber-500" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div>
                      <span className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                        @{entry.username}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                          {t.leaderboard.you}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {entry.hintsUsed > 0 && (
                      <span className="text-[11px] tabular-nums text-neutral-400">
                        {entry.hintsUsed}h
                      </span>
                    )}
                    <span className="tabular-nums text-[14px] font-semibold text-neutral-900 dark:text-white">
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
