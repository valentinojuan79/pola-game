"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Crown,
  Flame,
  Infinity as InfinityIcon,
  Lightbulb,
  Share2,
  UserPlus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { formatTime } from "@/lib/games/queens/engine";
import type { PolaUser } from "@/lib/supabase";

interface WinModalProps {
  open: boolean;
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
            {/* Crown emblem */}
            <motion.div
              initial={{ scale: 0.5, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 440,
                damping: 18,
                delay: 0.08,
              }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-amber-500/18 text-amber-600 dark:bg-amber-400/18 dark:text-amber-300 border border-amber-500/25"
            >
              <Crown className="h-7 w-7 fill-current" />
            </motion.div>

            <h2 className="mt-4 text-[22px] font-semibold tracking-tight text-neutral-950 dark:text-white">
              {t.win.title}
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
              {mode === "daily" ? t.win.subtitleDaily : t.win.subtitleUnlimited}
            </p>

            {/* 3 Stat Pills */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Clock className="mx-auto h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <div className="mt-1 tabular-nums text-[17px] font-semibold text-neutral-950 dark:text-white">
                  {formatTime(totalSeconds)}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.win.time}
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Lightbulb className="mx-auto h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <div className="mt-1 tabular-nums text-[17px] font-semibold text-neutral-950 dark:text-white">
                  {hintsUsed}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t.win.hints}
                </div>
              </div>

              <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                <Flame className="mx-auto h-4 w-4 text-amber-500" />
                <div className="mt-1 tabular-nums text-[17px] font-semibold text-neutral-950 dark:text-white">
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
                      className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-[11px] font-semibold text-white dark:bg-white dark:text-neutral-950"
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-3.5 text-[14px] font-semibold text-white transition-transform active:scale-[0.98] dark:bg-white dark:text-neutral-950"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
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
