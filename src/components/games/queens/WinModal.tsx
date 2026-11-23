"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Crown,
  Flame,
  Grid3X3,
  Infinity as InfinityIcon,
  LayoutGrid,
  Lightbulb,
  Route,
  Share2,
  SunMoon,
  UserPlus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { formatTime } from "@/lib/games/queens/engine";
import type { PolaUser } from "@/lib/supabase";
import type { PolaGameType } from "@/lib/storage";

interface WinModalProps {
  open: boolean;
  game?: PolaGameType;
  mode: "daily" | "unlimited";
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  dailyRank: number | null;
  user: PolaUser | null;
  shareText: string;
  onClaimUsername: () => void;
  onPlayUnlimited: () => void;
  onBackHome: () => void;
}

export function WinModal({
  open,
  game = "queens",
  mode,
  totalSeconds,
  hintsUsed,
  streak,
  dailyRank,
  user,
  shareText,
  onClaimUsername,
  onPlayUnlimited,
  onBackHome,
}: WinModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    feedback.pop();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback textarea copy
      const ta = document.createElement("textarea");
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          {/* Frosted backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/35 backdrop-blur-sm dark:bg-black/60"
          />

          {/* Bubble-pop spring glass modal */}
          <motion.div
            initial={{ scale: 0.72, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 16 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 22,
              mass: 0.85,
            }}
            className="glass-modal relative z-10 w-full max-w-[360px] rounded-[30px] p-6 text-center"
          >
            {/* Game emblem */}
            <motion.div
              initial={{ scale: 0.5, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 440,
                damping: 18,
                delay: 0.08,
              }}
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] border ${
                game === "zip"
                  ? "bg-sky-500/18 text-sky-600 dark:bg-sky-400/18 dark:text-sky-300 border-sky-500/25"
                  : game === "tango"
                  ? "bg-orange-500/18 text-orange-600 dark:bg-orange-400/18 dark:text-orange-300 border-orange-500/25"
                  : game === "mini-sudoku"
                  ? "bg-emerald-500/18 text-emerald-600 dark:bg-emerald-400/18 dark:text-emerald-300 border-emerald-500/25"
                  : game === "patches"
                  ? "bg-rose-500/18 text-rose-600 dark:bg-rose-400/18 dark:text-rose-300 border-rose-500/25"
                  : "bg-amber-500/18 text-amber-600 dark:bg-amber-400/18 dark:text-amber-300 border-amber-500/25"
              }`}
            >
              {game === "zip" ? (
                <Route className="h-7 w-7 stroke-[2.2]" />
              ) : game === "tango" ? (
                <SunMoon className="h-7 w-7 stroke-[2.2]" />
              ) : game === "mini-sudoku" ? (
                <Grid3X3 className="h-7 w-7 stroke-[2.2]" />
              ) : game === "patches" ? (
                <LayoutGrid className="h-7 w-7 stroke-[2.2]" />
              ) : (
                <Crown className="h-7 w-7 fill-current" />
              )}
            </motion.div>

            <h2 className="font-display mt-4 text-[24px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.win.title}
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
              {game === "zip"
                ? mode === "daily"
                  ? t.win.subtitleDailyZip
                  : t.win.subtitleUnlimitedZip
                : game === "tango"
                ? mode === "daily"
                  ? t.win.subtitleDailyTango
                  : t.win.subtitleUnlimitedTango
                : game === "mini-sudoku"
                ? mode === "daily"
                  ? t.win.subtitleDailyMiniSudoku
                  : t.win.subtitleUnlimitedMiniSudoku
                : game === "patches"
                ? mode === "daily"
                  ? t.win.subtitleDailyPatches
                  : t.win.subtitleUnlimitedPatches
                : mode === "daily"
                ? t.win.subtitleDaily
                : t.win.subtitleUnlimited}
            </p>

            {/* 3 Stat Pills */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Clock className="mx-auto h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <div className="font-display mt-1 tabular-nums text-[18px] font-bold text-neutral-950 dark:text-white">
                  {formatTime(totalSeconds)}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.win.time}
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Lightbulb className="mx-auto h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <div className="font-display mt-1 tabular-nums text-[18px] font-bold text-neutral-950 dark:text-white">
                  {hintsUsed}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.win.hints}
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Flame className="mx-auto h-4 w-4 text-amber-500" />
                <div className="font-display mt-1 tabular-nums text-[18px] font-bold text-neutral-950 dark:text-white">
                  {streak}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.win.streak}
                </div>
              </div>
            </div>

            {/* Daily Leaderboard Rank or subtle Guest CTA */}
            {mode === "daily" && (
              <div className="mt-4 rounded-2xl bg-black/[0.035] px-3.5 py-2.5 dark:bg-white/[0.05]">
                {user ? (
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {t.win.rank} (@{user.username})
                    </span>
                    <span className="tabular-nums font-semibold text-neutral-900 dark:text-white">
                      {dailyRank ? `#${dailyRank}` : "#1"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-left">
                    <p className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
                      {t.win.rankGuest}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        feedback.click();
                        onClaimUsername();
                      }}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition-colors active:scale-95 dark:text-neutral-950 ${
                        game === "zip"
                          ? "bg-[#0369A1] hover:bg-[#075985] dark:bg-sky-400/90"
                          : game === "tango"
                          ? "bg-[#EA580C] hover:bg-[#C2410C] dark:bg-orange-400/90"
                          : game === "mini-sudoku"
                          ? "bg-[#059669] hover:bg-[#047857] dark:bg-emerald-400/90"
                          : game === "patches"
                          ? "bg-[#E11D48] hover:bg-[#BE123C] dark:bg-rose-400/90"
                          : "bg-[#D97706] hover:bg-[#B45309] dark:bg-amber-500/90"
                      }`}
                    >
                      <UserPlus className="h-3 w-3" />
                      {t.win.claimUsername}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary Actions */}
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleShare}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.98] dark:text-neutral-950 ${
                  game === "zip"
                    ? "bg-[#0369A1] shadow-[0_4px_14px_-4px_rgba(3,105,161,0.3)] hover:bg-[#075985] dark:bg-sky-400/90 dark:hover:bg-sky-300"
                    : game === "tango"
                    ? "bg-[#EA580C] shadow-[0_4px_14px_-4px_rgba(234,88,12,0.3)] hover:bg-[#C2410C] dark:bg-orange-400/90 dark:hover:bg-orange-300"
                    : game === "mini-sudoku"
                    ? "bg-[#059669] shadow-[0_4px_14px_-4px_rgba(5,150,105,0.3)] hover:bg-[#047857] dark:bg-emerald-400/90 dark:hover:bg-emerald-300"
                    : game === "patches"
                    ? "bg-[#E11D48] shadow-[0_4px_14px_-4px_rgba(225,29,72,0.3)] hover:bg-[#BE123C] dark:bg-rose-400/90 dark:hover:bg-rose-300"
                    : "bg-[#D97706] shadow-[0_4px_14px_-4px_rgba(180,83,9,0.3)] hover:bg-[#B45309] dark:bg-amber-500/90 dark:hover:bg-amber-400"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-white dark:text-neutral-950" />
                    {t.win.copied}
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    {t.win.shareResult}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  feedback.pop();
                  onPlayUnlimited();
                }}
                className="glass-card flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold text-neutral-900 transition-transform active:scale-[0.98] dark:text-white"
              >
                <InfinityIcon className="h-4 w-4" />
                {mode === "daily" ? t.win.playUnlimited : t.win.nextPuzzle}
              </button>

              <button
                type="button"
                onClick={() => {
                  feedback.click();
                  onBackHome();
                }}
                className="w-full py-1.5 text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {t.win.backToToday}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
