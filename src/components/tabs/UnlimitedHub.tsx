"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Grid3X3, Layers, LayoutGrid, Route, SunMoon, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { QueensDifficulty } from "@/lib/games/queens/types";
import type { ZipDifficulty } from "@/lib/games/zip/types";
import type { TangoDifficulty } from "@/lib/games/tango/types";
import type { MiniSudokuDifficulty } from "@/lib/games/mini-sudoku/types";
import type { PatchesDifficulty } from "@/lib/games/patches/types";
import type { FoldDifficulty } from "@/lib/games/fold/types";

interface UnlimitedHubProps {
  onPlayUnlimitedQueens: (difficulty: QueensDifficulty) => void;
  onPlayUnlimitedZip: (difficulty: ZipDifficulty) => void;
  onPlayUnlimitedTango: (difficulty: TangoDifficulty) => void;
  onPlayUnlimitedMiniSudoku: (difficulty: MiniSudokuDifficulty) => void;
  onPlayUnlimitedPatches: (difficulty: PatchesDifficulty) => void;
  onPlayUnlimitedFold: (difficulty: FoldDifficulty) => void;
}

const DIFFICULTIES: QueensDifficulty[] = ["easy", "medium", "hard", "expert"];

export function UnlimitedHub({
  onPlayUnlimitedQueens,
  onPlayUnlimitedZip,
  onPlayUnlimitedTango,
  onPlayUnlimitedMiniSudoku,
  onPlayUnlimitedPatches,
  onPlayUnlimitedFold,
}: UnlimitedHubProps) {
  const { t } = useI18n();
  const [queensDiff, setQueensDiff] = useState<QueensDifficulty>("easy");
  const [zipDiff, setZipDiff] = useState<ZipDifficulty>("easy");
  const [tangoDiff, setTangoDiff] = useState<TangoDifficulty>("easy");
  const [miniSudokuDiff, setMiniSudokuDiff] =
    useState<MiniSudokuDifficulty>("easy");
  const [patchesDiff, setPatchesDiff] = useState<PatchesDifficulty>("easy");
  const [foldDiff, setFoldDiff] = useState<FoldDifficulty>("easy");

  return (
    <div className="px-5 pt-2 pb-28 lg:px-6 lg:pb-12">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-neutral-950 dark:text-white">
        {t.unlimited.title}
      </h1>
      <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t.unlimited.subtitle}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
      {/* Queens Unlimited Card — Calm Muted Amber Tinted Glass */}
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-amber-600/[0.18] bg-gradient-to-br from-amber-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 dark:border-amber-400/[0.16] dark:from-amber-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
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
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-sky-600/[0.18] bg-gradient-to-br from-sky-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 dark:border-sky-400/[0.16] dark:from-sky-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
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

      {/* Tango Unlimited Card — Calm Muted Warm Orange Tinted Glass */}
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-orange-600/[0.18] bg-gradient-to-br from-orange-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 dark:border-orange-400/[0.16] dark:from-orange-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-orange-500/[0.12] text-orange-700 border border-orange-600/20 dark:bg-orange-400/15 dark:text-orange-300 dark:border-orange-400/20">
            <SunMoon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.tango.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = tangoDiff === diff;
            const info = t.unlimited.tangoDifficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setTangoDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-orange-500/45 bg-orange-500/[0.12] text-orange-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-orange-400/40 dark:bg-orange-400/[0.16] dark:text-orange-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-orange-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-orange-900/75 dark:text-orange-200/80"
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
            onPlayUnlimitedTango(tangoDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA580C] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(234,88,12,0.3)] transition-all hover:bg-[#C2410C] dark:bg-orange-400/90 dark:text-neutral-950 dark:hover:bg-orange-300"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Mini Sudoku Unlimited Card — Calm Emerald/Mint Tinted Glass */}
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-emerald-600/[0.18] bg-gradient-to-br from-emerald-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 dark:border-emerald-400/[0.16] dark:from-emerald-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-emerald-500/[0.12] text-emerald-700 border border-emerald-600/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20">
            <Grid3X3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.miniSudoku.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = miniSudokuDiff === diff;
            const info = t.unlimited.miniSudokuDifficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setMiniSudokuDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-emerald-400/40 dark:bg-emerald-400/[0.16] dark:text-emerald-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-emerald-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-emerald-900/75 dark:text-emerald-200/80"
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
            onPlayUnlimitedMiniSudoku(miniSudokuDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(5,150,105,0.3)] transition-all hover:bg-[#047857] dark:bg-emerald-400/90 dark:text-neutral-950 dark:hover:bg-emerald-300"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Patches Unlimited Card — Calm Soft Rose / Berry Tinted Glass */}
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-rose-600/[0.18] bg-gradient-to-br from-rose-500/[0.05] via-white/75 to-white/65 p-5 lg:p-6 dark:border-rose-400/[0.16] dark:from-rose-500/[0.07] dark:via-neutral-900/60 dark:to-neutral-900/55">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-rose-500/[0.12] text-rose-700 border border-rose-600/20 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/20">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.patches.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = patchesDiff === diff;
            const info = t.unlimited.patchesDifficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setPatchesDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-rose-500/45 bg-rose-500/[0.12] text-rose-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-rose-400/40 dark:bg-rose-400/[0.16] dark:text-rose-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-rose-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-rose-900/75 dark:text-rose-200/80"
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
            onPlayUnlimitedPatches(patchesDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E11D48] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(225,29,72,0.3)] transition-all hover:bg-[#BE123C] dark:bg-rose-400/90 dark:text-neutral-950 dark:hover:bg-rose-300"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>

      {/* Fold Unlimited Card — Calm Soft Lavender / Periwinkle Tinted Glass */}
      <div className="glass-card flex flex-col justify-between rounded-[26px] border-indigo-600/[0.18] bg-gradient-to-br from-indigo-500/[0.06] via-white/75 to-violet-500/[0.04] p-5 lg:p-6 dark:border-indigo-400/[0.16] dark:from-indigo-500/[0.08] dark:via-neutral-900/60 dark:to-violet-500/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-indigo-500/[0.12] text-indigo-700 border border-indigo-600/20 dark:bg-indigo-400/15 dark:text-indigo-300 dark:border-indigo-400/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-neutral-950 dark:text-white">
              {t.games.fold.name}
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              {t.unlimited.selectDifficulty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const active = foldDiff === diff;
            const info = t.unlimited.foldDifficulties[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  feedback.click();
                  setFoldDiff(diff);
                }}
                className={`relative rounded-[18px] border p-3 text-left transition-all active:scale-[0.98] ${
                  active
                    ? "border-indigo-500/45 bg-indigo-500/[0.12] text-indigo-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-indigo-400/40 dark:bg-indigo-400/[0.16] dark:text-indigo-100"
                    : "border-black/[0.06] bg-white/60 text-neutral-800 hover:border-indigo-500/25 hover:bg-white/85 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07]"
                }`}
              >
                <div className="font-display text-[15px] font-bold">
                  {info.label}
                </div>
                <div
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? "text-indigo-900/75 dark:text-indigo-200/80"
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
            onPlayUnlimitedFold(foldDiff);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F46E5] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.3)] transition-all hover:bg-[#4338CA] dark:bg-indigo-400/90 dark:text-neutral-950 dark:hover:bg-indigo-300"
        >
          <Play className="h-4 w-4 fill-current" />
          {t.unlimited.startGame}
        </motion.button>
      </div>
      </div>
    </div>
  );
}
