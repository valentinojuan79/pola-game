"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Infinity as InfinityIcon, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { feedback } from "@/lib/feedback";
import {
  getDailyCompletion,
  getTodayDateString,
  loadStats,
  type PolaGameType,
} from "@/lib/storage";
import type {
  ShareDifficulty,
  SingleGameSharePayload,
} from "@/lib/shareCardRenderer";
import { VisualShareModal } from "@/components/VisualShareModal";

interface DailyReviewBarProps {
  game: PolaGameType;
  dateStr?: string;
  difficulty?: ShareDifficulty;
  gridSize?: number;
  totalSeconds?: number;
  hintsUsed?: number;
  streak?: number;
  dailyRank?: number | null;
  username?: string | null;
  shareText: string;
  onPlayUnlimited: () => void;
  onBackHome: () => void;
}

const ACCENT_STYLES: Record<
  PolaGameType,
  {
    borderTint: string;
    primaryBtn: string;
    checkColor: string;
  }
> = {
  queens: {
    borderTint:
      "border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] via-white/75 to-white/65 dark:border-amber-400/20 dark:from-amber-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#D97706] text-white shadow-[0_4px_14px_-4px_rgba(180,83,9,0.28)] hover:bg-[#B45309] dark:bg-amber-500/90 dark:text-neutral-950 dark:hover:bg-amber-400",
    checkColor: "text-amber-600 dark:text-amber-400",
  },
  zip: {
    borderTint:
      "border-sky-500/25 bg-gradient-to-br from-sky-500/[0.06] via-white/75 to-white/65 dark:border-sky-400/20 dark:from-sky-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#0369A1] text-white shadow-[0_4px_14px_-4px_rgba(3,105,161,0.28)] hover:bg-[#075985] dark:bg-sky-400/90 dark:text-neutral-950 dark:hover:bg-sky-300",
    checkColor: "text-sky-600 dark:text-sky-400",
  },
  tango: {
    borderTint:
      "border-orange-500/25 bg-gradient-to-br from-orange-500/[0.06] via-white/75 to-white/65 dark:border-orange-400/20 dark:from-orange-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#EA580C] text-white shadow-[0_4px_14px_-4px_rgba(234,88,12,0.28)] hover:bg-[#C2410C] dark:bg-orange-400/90 dark:text-neutral-950 dark:hover:bg-orange-300",
    checkColor: "text-orange-600 dark:text-orange-400",
  },
  "mini-sudoku": {
    borderTint:
      "border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.06] via-white/75 to-white/65 dark:border-emerald-400/20 dark:from-emerald-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#059669] text-white shadow-[0_4px_14px_-4px_rgba(5,150,105,0.28)] hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950 dark:hover:bg-emerald-300",
    checkColor: "text-emerald-600 dark:text-emerald-400",
  },
  patches: {
    borderTint:
      "border-rose-500/25 bg-gradient-to-br from-rose-500/[0.06] via-white/75 to-white/65 dark:border-rose-400/20 dark:from-rose-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#E11D48] text-white shadow-[0_4px_14px_-4px_rgba(225,29,72,0.28)] hover:bg-[#BE123C] dark:bg-rose-400/90 dark:text-neutral-950 dark:hover:bg-rose-300",
    checkColor: "text-rose-600 dark:text-rose-400",
  },
  fold: {
    borderTint:
      "border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.06] via-white/75 to-white/65 dark:border-indigo-400/20 dark:from-indigo-500/[0.09] dark:via-neutral-900/65 dark:to-neutral-900/60",
    primaryBtn:
      "bg-[#4F46E5] text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.28)] hover:bg-[#4338CA] dark:bg-indigo-400/90 dark:text-neutral-950 dark:hover:bg-indigo-300",
    checkColor: "text-indigo-600 dark:text-indigo-400",
  },
};

export function DailyReviewBar({
  game,
  dateStr,
  difficulty,
  gridSize,
  totalSeconds,
  hintsUsed,
  streak,
  dailyRank = null,
  username = null,
  shareText,
  onPlayUnlimited,
  onBackHome,
}: DailyReviewBarProps) {
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const [shareOpen, setShareOpen] = useState(false);

  const style = ACCENT_STYLES[game];
  const headline =
    game === "queens"
      ? t.review.crushedQueens
      : game === "zip"
      ? t.review.crushedZip
      : game === "tango"
      ? t.review.crushedTango
      : game === "mini-sudoku"
      ? t.review.crushedMiniSudoku
      : game === "patches"
      ? t.review.crushedPatches
      : t.review.crushedFold;

  const sharePayload = useMemo<SingleGameSharePayload>(() => {
    const resolvedDate = dateStr ?? getTodayDateString();
    const saved = getDailyCompletion(resolvedDate, game);
    const savedStats = loadStats();

    return {
      kind: "single",
      game,
      mode: "daily",
      dateStr: resolvedDate,
      difficulty,
      gridSize,
      totalSeconds: totalSeconds ?? saved?.totalSeconds ?? 0,
      hintsUsed: hintsUsed ?? saved?.hintsUsed ?? 0,
      streak: streak ?? savedStats.currentStreak,
      dailyRank,
      username,
    };
  }, [
    game,
    dateStr,
    difficulty,
    gridSize,
    totalSeconds,
    hintsUsed,
    streak,
    dailyRank,
    username,
  ]);

  const handleShare = () => {
    feedback.pop();
    setShareOpen(true);
  };

  return (
    <>
      <div
        className={`glass-card mt-4 w-full rounded-[24px] p-4 ${style.borderTint}`}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className={`h-4 w-4 shrink-0 ${style.checkColor}`} />
          <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
            {headline}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              feedback.pop();
              onPlayUnlimited();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-semibold transition-all active:scale-[0.98] ${style.primaryBtn}`}
          >
            <InfinityIcon className="h-4 w-4" />
            {t.review.playUnlimited}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="glass-card flex items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-semibold text-neutral-900 transition-transform active:scale-[0.98] dark:text-white"
          >
            <Share2 className="h-4 w-4" />
            {t.review.shareResult}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            feedback.click();
            onBackHome();
          }}
          className="mt-2 w-full py-1.5 text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          {t.review.backToToday}
        </button>
      </div>

      <VisualShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={sharePayload}
        theme={theme}
        lang={locale}
        shareText={shareText}
      />
    </>
  );
}
