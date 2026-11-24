"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { HeaderBar } from "@/components/shell/HeaderBar";
import { BottomNav, type AppTab } from "@/components/shell/BottomNav";
import { AuthModal } from "@/components/shell/AuthModal";
import { TodayHub } from "@/components/tabs/TodayHub";
import { UnlimitedHub } from "@/components/tabs/UnlimitedHub";
import { LeaderboardHub } from "@/components/tabs/LeaderboardHub";
import { QueensGame } from "@/components/games/queens/QueensGame";
import { ZipGame } from "@/components/games/zip/ZipGame";
import { TangoGame } from "@/components/games/tango/TangoGame";
import { MiniSudokuGame } from "@/components/games/mini-sudoku/MiniSudokuGame";
import { PatchesGame } from "@/components/games/patches/PatchesGame";
import { FoldGame } from "@/components/games/fold/FoldGame";
import {
  getDailyQueensPuzzle,
  getDifficultyForDateString,
  getUnlimitedQueensPuzzle,
} from "@/lib/games/queens/presets";
import type { QueensDifficulty, QueensPuzzle } from "@/lib/games/queens/types";
import {
  getDailyZipPuzzle,
  getUnlimitedZipPuzzle,
  getZipDifficultyForDateString,
} from "@/lib/games/zip/presets";
import type { ZipDifficulty, ZipPuzzle } from "@/lib/games/zip/types";
import {
  getDailyTangoPuzzle,
  getTangoDifficultyForDateString,
  getUnlimitedTangoPuzzle,
} from "@/lib/games/tango/presets";
import type { TangoDifficulty, TangoPuzzle } from "@/lib/games/tango/types";
import {
  getDailyMiniSudokuPuzzle,
  getMiniSudokuDifficultyForDateString,
  getUnlimitedMiniSudokuPuzzle,
} from "@/lib/games/mini-sudoku/presets";
import type {
  MiniSudokuDifficulty,
  MiniSudokuPuzzle,
} from "@/lib/games/mini-sudoku/types";
import {
  getDailyPatchesPuzzle,
  getPatchesDifficultyForDateString,
  getUnlimitedPatchesPuzzle,
} from "@/lib/games/patches/presets";
import type {
  PatchesDifficulty,
  PatchesPuzzle,
} from "@/lib/games/patches/types";
import {
  getDailyFoldPuzzle,
  getFoldDifficultyForDateString,
  getUnlimitedFoldPuzzle,
} from "@/lib/games/fold/presets";
import type { FoldDifficulty, FoldPuzzle } from "@/lib/games/fold/types";
import {
  clearLocalProgress,
  DEFAULT_STATS,
  getDailyCompletion,
  getGuestMigratedOwner,
  getTodayDateString,
  hasUnmigratedGuestProgress,
  initDevBypassFromUrl,
  isDailyRankLockedByOtherUser,
  loadStats,
  markGuestProgressMigrated,
  recordGameCompletion,
  saveStats,
  type DailyCompletion,
  type LocalProfileStats,
  type PolaGameType,
} from "@/lib/storage";
import {
  ALL_GAME_IDS,
  fetchUserDailyRank,
  getCurrentUser,
  hydrateUserStatsFromSupabase,
  MIN_PLAUSIBLE_SOLVE_SECONDS,
  signOutUser,
  submitDailyScore,
  syncGuestCompletionsToAccount,
  syncProfileStreaks,
  type PolaUser,
} from "@/lib/supabase";

type ActiveGameSession =
  | {
      game: "queens";
      mode: "daily" | "unlimited";
      puzzle: QueensPuzzle;
      reviewCompletion?: DailyCompletion | null;
    }
  | {
      game: "zip";
      mode: "daily" | "unlimited";
      puzzle: ZipPuzzle;
      reviewCompletion?: DailyCompletion | null;
    }
  | {
      game: "tango";
      mode: "daily" | "unlimited";
      puzzle: TangoPuzzle;
      reviewCompletion?: DailyCompletion | null;
    }
  | {
      game: "mini-sudoku";
      mode: "daily" | "unlimited";
      puzzle: MiniSudokuPuzzle;
      reviewCompletion?: DailyCompletion | null;
    }
  | {
      game: "patches";
      mode: "daily" | "unlimited";
      puzzle: PatchesPuzzle;
      reviewCompletion?: DailyCompletion | null;
    }
  | {
      game: "fold";
      mode: "daily" | "unlimited";
      puzzle: FoldPuzzle;
      reviewCompletion?: DailyCompletion | null;
    };

export default function PolaAppPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [activeGame, setActiveGame] = useState<ActiveGameSession | null>(null);
  const [stats, setStats] = useState<LocalProfileStats>(DEFAULT_STATS);
  const [user, setUser] = useState<PolaUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dailyRank, setDailyRank] = useState<number | null>(null);
  const [syncVersion, setSyncVersion] = useState(0);
  const [unlimitedNonce, setUnlimitedNonce] = useState(1);

  const todayDateStr = useMemo(() => getTodayDateString(), []);
  const todayDifficulty = useMemo(
    () => getDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );
  const todayZipDifficulty = useMemo(
    () => getZipDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );
  const todayTangoDifficulty = useMemo(
    () => getTangoDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );
  const todayMiniSudokuDifficulty = useMemo(
    () => getMiniSudokuDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );
  const todayPatchesDifficulty = useMemo(
    () => getPatchesDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );
  const todayFoldDifficulty = useMemo(
    () => getFoldDifficultyForDateString(todayDateStr),
    [todayDateStr]
  );

  useEffect(() => {
    initDevBypassFromUrl();
    const localStats = loadStats();
    setStats(localStats);

    let active = true;
    getCurrentUser().then(async (u) => {
      if (!active || !u) return;
      setUser(u);
      if (!u.isLocalOnly) {
        const sameOwner = getGuestMigratedOwner() === u.id;
        const hydrated = await hydrateUserStatsFromSupabase(
          u,
          sameOwner ? localStats : undefined
        );
        if (!active) return;
        saveStats(hydrated);
        markGuestProgressMigrated(u.id);
        setStats(hydrated);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const todayQueensCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:queens`] ?? null,
    [stats, todayDateStr]
  );

  const todayZipCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:zip`] ?? null,
    [stats, todayDateStr]
  );

  const todayTangoCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:tango`] ?? null,
    [stats, todayDateStr]
  );

  const todayMiniSudokuCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:mini-sudoku`] ?? null,
    [stats, todayDateStr]
  );

  const todayPatchesCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:patches`] ?? null,
    [stats, todayDateStr]
  );

  const todayFoldCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:fold`] ?? null,
    [stats, todayDateStr]
  );

  const handlePlayDailyQueens = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyQueensPuzzle(todayDateStr);
    setActiveGame({
      game: "queens",
      mode: "daily",
      puzzle,
      reviewCompletion: todayQueensCompletion,
    });
  }, [todayDateStr, todayQueensCompletion]);

  const handlePlayUnlimitedQueens = useCallback(
    (difficulty: QueensDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedQueensPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "queens", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handlePlayDailyZip = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyZipPuzzle(todayDateStr);
    setActiveGame({
      game: "zip",
      mode: "daily",
      puzzle,
      reviewCompletion: todayZipCompletion,
    });
  }, [todayDateStr, todayZipCompletion]);

  const handlePlayUnlimitedZip = useCallback(
    (difficulty: ZipDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedZipPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "zip", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handlePlayDailyTango = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyTangoPuzzle(todayDateStr);
    setActiveGame({
      game: "tango",
      mode: "daily",
      puzzle,
      reviewCompletion: todayTangoCompletion,
    });
  }, [todayDateStr, todayTangoCompletion]);

  const handlePlayUnlimitedTango = useCallback(
    (difficulty: TangoDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedTangoPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "tango", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handlePlayDailyMiniSudoku = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyMiniSudokuPuzzle(todayDateStr);
    setActiveGame({
      game: "mini-sudoku",
      mode: "daily",
      puzzle,
      reviewCompletion: todayMiniSudokuCompletion,
    });
  }, [todayDateStr, todayMiniSudokuCompletion]);

  const handlePlayUnlimitedMiniSudoku = useCallback(
    (difficulty: MiniSudokuDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedMiniSudokuPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "mini-sudoku", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handlePlayDailyPatches = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyPatchesPuzzle(todayDateStr);
    setActiveGame({
      game: "patches",
      mode: "daily",
      puzzle,
      reviewCompletion: todayPatchesCompletion,
    });
  }, [todayDateStr, todayPatchesCompletion]);

  const handlePlayUnlimitedPatches = useCallback(
    (difficulty: PatchesDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedPatchesPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "patches", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handlePlayDailyFold = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyFoldPuzzle(todayDateStr);
    setActiveGame({
      game: "fold",
      mode: "daily",
      puzzle,
      reviewCompletion: todayFoldCompletion,
    });
  }, [todayDateStr, todayFoldCompletion]);

  const handlePlayUnlimitedFold = useCallback(
    (difficulty: FoldDifficulty) => {
      setDailyRank(null);
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedFoldPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ game: "fold", mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handleGameComplete = useCallback(
    async (result: {
      elapsedSeconds: number;
      penaltySeconds: number;
      hintsUsed: number;
      boardSnapshot?: unknown;
    }) => {
      if (!activeGame) return;
      const gameType: PolaGameType = activeGame.game;
      const updated = recordGameCompletion({
        mode: activeGame.mode,
        game: gameType,
        date: todayDateStr,
        elapsedSeconds: result.elapsedSeconds,
        penaltySeconds: result.penaltySeconds,
        hintsUsed: result.hintsUsed,
        boardSnapshot: result.boardSnapshot,
      });
      setStats(updated);

      if (activeGame.mode === "daily" && user) {
        const totalSeconds = result.elapsedSeconds + result.penaltySeconds;
        const canSubmitToPublicRanks =
          result.elapsedSeconds >= MIN_PLAUSIBLE_SOLVE_SECONDS &&
          !isDailyRankLockedByOtherUser(todayDateStr, user.id);

        if (canSubmitToPublicRanks) {
          const submitted = await submitDailyScore({
            user,
            puzzleDate: todayDateStr,
            gameType,
            totalSeconds,
            elapsedSeconds: result.elapsedSeconds,
            hintsUsed: result.hintsUsed,
          });
          await syncProfileStreaks(user, updated);
          if (submitted) {
            const rank = await fetchUserDailyRank(
              todayDateStr,
              gameType,
              user.id
            );
            setDailyRank(rank);
          } else {
            setDailyRank(null);
          }
        } else {
          await syncProfileStreaks(user, updated);
          setDailyRank(null);
        }
        setSyncVersion((v) => v + 1);
      }
    },
    [activeGame, todayDateStr, user]
  );

  const handleAuthenticated = useCallback(
    async (signedInUser: PolaUser) => {
      setUser(signedInUser);
      const currentStats = loadStats();
      const shouldMigrateGuest = hasUnmigratedGuestProgress(currentStats);

      if (shouldMigrateGuest) {
        const completions: Partial<
          Record<PolaGameType, DailyCompletion | null>
        > = {};
        for (const gameType of ALL_GAME_IDS) {
          completions[gameType] = getDailyCompletion(todayDateStr, gameType);
        }

        await syncGuestCompletionsToAccount(
          signedInUser,
          todayDateStr,
          completions,
          currentStats
        );
        // Immediately mark claimed so a subsequent account can never inherit guest progress
        markGuestProgressMigrated(signedInUser.id);
      }

      const hydrated = await hydrateUserStatsFromSupabase(
        signedInUser,
        shouldMigrateGuest ? currentStats : undefined
      );
      saveStats(hydrated);
      markGuestProgressMigrated(signedInUser.id);
      setStats(hydrated);
      setSyncVersion((v) => v + 1);

      if (
        activeGame?.mode === "daily" &&
        !isDailyRankLockedByOtherUser(todayDateStr, signedInUser.id)
      ) {
        const rank = await fetchUserDailyRank(
          todayDateStr,
          activeGame.game,
          signedInUser.id
        );
        setDailyRank(rank);
      } else {
        setDailyRank(null);
      }
    },
    [todayDateStr, activeGame]
  );

  const handlePlayRandomUnlimited = useCallback(() => {
    const games: PolaGameType[] = [
      "queens",
      "zip",
      "tango",
      "mini-sudoku",
      "patches",
      "fold",
    ];
    const diffs = ["easy", "medium", "hard", "expert"] as const;
    const pickedGame = games[Math.floor(Math.random() * games.length)];
    const pickedDiff = diffs[Math.floor(Math.random() * diffs.length)];

    switch (pickedGame) {
      case "queens":
        handlePlayUnlimitedQueens(pickedDiff);
        break;
      case "zip":
        handlePlayUnlimitedZip(pickedDiff);
        break;
      case "tango":
        handlePlayUnlimitedTango(pickedDiff);
        break;
      case "mini-sudoku":
        handlePlayUnlimitedMiniSudoku(pickedDiff);
        break;
      case "patches":
        handlePlayUnlimitedPatches(pickedDiff);
        break;
      case "fold":
        handlePlayUnlimitedFold(pickedDiff);
        break;
    }
  }, [
    handlePlayUnlimitedQueens,
    handlePlayUnlimitedZip,
    handlePlayUnlimitedTango,
    handlePlayUnlimitedMiniSudoku,
    handlePlayUnlimitedPatches,
    handlePlayUnlimitedFold,
  ]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    clearLocalProgress();
    setUser(null);
    setStats(DEFAULT_STATS);
    setDailyRank(null);
    setActiveGame(null);
    setSyncVersion((v) => v + 1);
  }, []);

  return (
    <main className="relative min-h-dvh w-full">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <div
            key={`${activeGame.puzzle.id}-${activeGame.mode}`}
            className="mx-auto w-full max-w-[460px]"
          >
            {activeGame.game === "queens" ? (
              <QueensGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedQueens(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            ) : activeGame.game === "zip" ? (
              <ZipGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedZip(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            ) : activeGame.game === "tango" ? (
              <TangoGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedTango(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            ) : activeGame.game === "mini-sudoku" ? (
              <MiniSudokuGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedMiniSudoku(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            ) : activeGame.game === "patches" ? (
              <PatchesGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedPatches(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            ) : (
              <FoldGame
                puzzle={activeGame.puzzle}
                mode={activeGame.mode}
                dateStr={todayDateStr}
                streak={stats.currentStreak}
                user={user}
                dailyRank={dailyRank}
                reviewCompletion={activeGame.reviewCompletion ?? null}
                onComplete={handleGameComplete}
                onExit={() => setActiveGame(null)}
                onPlayUnlimitedNext={(nextDifficulty) =>
                  handlePlayUnlimitedFold(
                    nextDifficulty ?? activeGame.puzzle.difficulty
                  )
                }
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
          </div>
        ) : (
          <div key="hub-shell" className="flex min-h-dvh flex-col">
            <HeaderBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              streak={stats.currentStreak}
            />

            <div className="flex-1">
              {activeTab === "today" && (
                <TodayHub
                  stats={stats}
                  userId={user?.id ?? null}
                  username={user?.displayName ?? null}
                  syncVersion={syncVersion}
                  todayDateStr={todayDateStr}
                  todayDifficulty={todayDifficulty}
                  todayZipDifficulty={todayZipDifficulty}
                  todayTangoDifficulty={todayTangoDifficulty}
                  todayMiniSudokuDifficulty={todayMiniSudokuDifficulty}
                  todayPatchesDifficulty={todayPatchesDifficulty}
                  todayFoldDifficulty={todayFoldDifficulty}
                  todayQueensCompletion={todayQueensCompletion}
                  todayZipCompletion={todayZipCompletion}
                  todayTangoCompletion={todayTangoCompletion}
                  todayMiniSudokuCompletion={todayMiniSudokuCompletion}
                  todayPatchesCompletion={todayPatchesCompletion}
                  todayFoldCompletion={todayFoldCompletion}
                  onPlayDailyQueens={handlePlayDailyQueens}
                  onPlayDailyZip={handlePlayDailyZip}
                  onPlayDailyTango={handlePlayDailyTango}
                  onPlayDailyMiniSudoku={handlePlayDailyMiniSudoku}
                  onPlayDailyPatches={handlePlayDailyPatches}
                  onPlayDailyFold={handlePlayDailyFold}
                  onGoToUnlimited={() => setActiveTab("unlimited")}
                  onGoToRanks={() => setActiveTab("leaderboard")}
                  onPlayRandomUnlimited={handlePlayRandomUnlimited}
                />
              )}

              {activeTab === "unlimited" && (
                <UnlimitedHub
                  onPlayUnlimitedQueens={handlePlayUnlimitedQueens}
                  onPlayUnlimitedZip={handlePlayUnlimitedZip}
                  onPlayUnlimitedTango={handlePlayUnlimitedTango}
                  onPlayUnlimitedMiniSudoku={handlePlayUnlimitedMiniSudoku}
                  onPlayUnlimitedPatches={handlePlayUnlimitedPatches}
                  onPlayUnlimitedFold={handlePlayUnlimitedFold}
                />
              )}

              {activeTab === "leaderboard" && (
                <LeaderboardHub
                  user={user}
                  stats={stats}
                  todayDateStr={todayDateStr}
                  syncVersion={syncVersion}
                  onOpenAuth={() => setAuthOpen(true)}
                  onSignOut={handleSignOut}
                />
              )}
            </div>

            {/* Minimal single-line desktop footer (lg+ only) */}
            <footer className="hidden lg:flex items-center justify-between text-xs opacity-60 mt-10 mx-6 pt-5 pb-6 border-t border-black/[0.08] dark:border-white/[0.1] text-neutral-700 dark:text-neutral-300">
              <span>Pola — Daily Logic Puzzles</span>
              <span>
                Independent portfolio project inspired by LinkedIn Games
              </span>
            </footer>

            <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </main>
  );
}
