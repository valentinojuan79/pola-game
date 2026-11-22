"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Play, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { QueensDifficulty } from "@/lib/games/queens/types";

interface UnlimitedHubProps {
  onPlayUnlimitedQueens: (difficulty: QueensDifficulty) => void;
}

const DIFFICULTIES: QueensDifficulty[] = ["easy", "medium", "hard", "expert"];

export function UnlimitedHub({ onPlayUnlimitedQueens }: UnlimitedHubProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<QueensDifficulty>("easy");

  return (
    <div className="px-5 pt-2 pb-28">
      <h1 className="text-[26px] font-semibold tracking-tight text-neutral-950 dark:text-white">
        {t.unlimited.title}
      </h1>
      <p className="mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        {t.unlimited.subtitle}
      </p>

      {/* Queens Unlimited Card */}
      <div className="glass-card mt-5 rounded-[26px] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-500/20">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-neutral-950 dark:text-white">
              {t.games.queens.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = selected === diff;
            const info = t.unlimited.difficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setSelected(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-black/[0.07] bg-white/50 text-neutral-800 hover:bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200"
                }`}
              >
                <div className="text-[14px] font-semibold">{info.label}</div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-neutral-300 dark:text-neutral-600"
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
            onPlayUnlimitedQueens(selected);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-3.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Upcoming Games Note */}
      <div className="glass-card mt-4 flex items-center gap-3 rounded-[20px] px-4 py-3.5 opacity-75">
        <Lock className="h-4 w-4 shrink-0 text-neutral-400" />
        <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
          {t.unlimited.comingSoonNote}
        </p>
      </div>
    </div>
  );
}
