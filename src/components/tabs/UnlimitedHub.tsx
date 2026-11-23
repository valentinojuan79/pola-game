"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Route, Play, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { QueensDifficulty } from "@/lib/games/queens/types";
import type { ZipDifficulty } from "@/lib/games/zip/types";

interface UnlimitedHubProps {
  onPlayUnlimitedQueens: (difficulty: QueensDifficulty) => void;
  onPlayUnlimitedZip: (difficulty: ZipDifficulty) => void;
}

const DIFFICULTIES: QueensDifficulty[] = ["easy", "medium", "hard", "expert"];

export function UnlimitedHub({
  onPlayUnlimitedQueens,
  onPlayUnlimitedZip,
}: UnlimitedHubProps) {
  const { t } = useI18n();
  const [queensDiff, setQueensDiff] = useState<QueensDifficulty>("easy");
  const [zipDiff, setZipDiff] = useState<ZipDifficulty>("easy");

  return (
    <div className="px-5 pt-2 pb-28">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-neutral-950 dark:text-white">
        {t.unlimited.title}
      </h1>
      <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t.unlimited.subtitle}
      </p>

      {/* Queens Unlimited Card — Calm Muted Amber Tinted Glass */}
      <div className="glass-card mt-5 rounded-[26px] border-amber-600/[0.18] bg-gradient-to-br from-amber-500/[0.05] via-white/75 to-white/65 p-5 dark:border-amber-400/[0.16] dark:from-amber-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-amber-500/[0.12] text-amber-700 border border-amber-600/20 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/20">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.queens.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = queensDiff === diff;
            const info = t.unlimited.difficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setQueensDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-amber-500/45 bg-amber-500/[0.12] text-amber-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-amber-400/40 dark:bg-amber-400/[0.16] dark:text-amber-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-amber-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-amber-900/75 dark:text-amber-200/80"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {info.desc}
                </div>
              </button>
            );
          })}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            feedback.pop();
            onPlayUnlimitedQueens(queensDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D97706] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(180,83,9,0.3)] transition-all hover:bg-[#B45309] dark:bg-amber-500/90 dark:text-neutral-950 dark:hover:bg-amber-400"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Zip Unlimited Card — Calm Muted Ocean Blue Tinted Glass */}
      <div className="glass-card mt-4 rounded-[26px] border-sky-600/[0.18] bg-gradient-to-br from-sky-500/[0.05] via-white/75 to-white/65 p-5 dark:border-sky-400/[0.16] dark:from-sky-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-sky-500/[0.12] text-sky-700 border border-sky-600/20 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/20">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.zip.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = zipDiff === diff;
            const info = t.unlimited.zipDifficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setZipDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-sky-500/45 bg-sky-500/[0.12] text-sky-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-sky-400/40 dark:bg-sky-400/[0.16] dark:text-sky-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-sky-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-sky-900/75 dark:text-sky-200/80"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {info.desc}
                </div>
              </button>
            );
          })}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            feedback.pop();
            onPlayUnlimitedZip(zipDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0369A1] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(3,105,161,0.3)] transition-all hover:bg-[#075985] dark:bg-sky-400/90 dark:text-neutral-950 dark:hover:bg-sky-300"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Upcoming Games Note */}
      <div className="glass-card mt-4 flex items-center gap-3 rounded-[20px] px-4 py-3.5 opacity-80">
        <Lock className="h-4 w-4 shrink-0 text-neutral-400" />
        <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
          {t.unlimited.comingSoonNote}
        </p>
      </div>
    </div>
  );
}
