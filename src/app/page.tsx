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
  getDailyCompletion,
  getTodayDateString,
  loadStats,
  recordGameCompletion,
  type LocalProfileStats,
  type PolaGameType,
} from "@/lib/storage";
import {
  fetchDailyLeaderboard,
  getCurrentUser,
  signOutUser,
  submitDailyScore,
  type PolaUser,
} from "@/lib/supabase";

type ActiveGameSession =
  | {
      game: "queens";
      mode: "daily" | "unlimited";
      puzzle: QueensPuzzle;
    }
  | {
      game: "zip";
      mode: "daily" | "unlimited";
      puzzle: ZipPuzzle;
    };

export default function PolaAppPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [activeGame, setActiveGame] = useState<ActiveGameSession | null>(null);
  const [stats, setStats] = useState<LocalProfileStats>(() => loadStats());
  const [user, setUser] = useState<PolaUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dailyRank, setDailyRank] = useState<number | null>(null);
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

  useEffect(() => {
    setStats(loadStats());
    getCurrentUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  const todayQueensCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:queens`] ?? null,
    [stats, todayDateStr]
  );

  const todayZipCompletion = useMemo(
    () => stats.dailyCompletions[`${todayDateStr}:zip`] ?? null,
    [stats, todayDateStr]
  );

  const handlePlayDailyQueens = useCallback(() => {
    setDailyRank(null);
    const puzzle = getDailyQueensPuzzle(todayDateStr);
    setActiveGame({ game: "queens", mode: "daily", puzzle });
  }, [todayDateStr]);

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
    setActiveGame({ game: "zip", mode: "daily", puzzle });
  }, [todayDateStr]);

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

  const handleGameComplete = useCallback(
    async (result: {
      elapsedSeconds: number;
      penaltySeconds: number;
      hintsUsed: number;
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
      });
      setStats(updated);

      if (activeGame.mode === "daily" && user) {
        const totalSeconds = result.elapsedSeconds + result.penaltySeconds;
        await submitDailyScore({
          user,
          puzzleDate: todayDateStr,
          gameType,
          totalSeconds,
          hintsUsed: result.hintsUsed,
        });
        const board = await fetchDailyLeaderboard(
          todayDateStr,
          gameType,
          user.id
        );
        const idx = board.findIndex((e) => e.isCurrentUser);
        setDailyRank(idx >= 0 ? idx + 1 : null);
      }
    },
    [activeGame, todayDateStr, user]
  );

  const handleAuthenticated = useCallback(
    async (signedInUser: PolaUser) => {
      setUser(signedInUser);
      const games: PolaGameType[] = ["queens", "zip"];
      for (const gameType of games) {
        const completion = getDailyCompletion(todayDateStr, gameType);
        if (completion) {
          await submitDailyScore({
            user: signedInUser,
            puzzleDate: todayDateStr,
            gameType,
            totalSeconds: completion.totalSeconds,
            hintsUsed: completion.hintsUsed,
          });
          if (activeGame?.game === gameType && activeGame.mode === "daily") {
            const board = await fetchDailyLeaderboard(
              todayDateStr,
              gameType,
              signedInUser.id
            );
            const idx = board.findIndex((e) => e.isCurrentUser);
            setDailyRank(idx >= 0 ? idx + 1 : null);
          }
        }
      }
    },
    [todayDateStr, activeGame]
  );

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setDailyRank(null);
  }, []);

  return (
    <main className="relative min-h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {activeGame?.game === "queens" ? (
          <QueensGame
            key={activeGame.puzzle.id}
            puzzle={activeGame.puzzle}
            mode={activeGame.mode}
            dateStr={todayDateStr}
            streak={stats.currentStreak}
            user={user}
            dailyRank={dailyRank}
            onComplete={handleGameComplete}
            onExit={() => setActiveGame(null)}
            onPlayUnlimitedNext={() =>
              handlePlayUnlimitedQueens(activeGame.puzzle.difficulty)
            }
            onOpenAuth={() => setAuthOpen(true)}
          />
        ) : activeGame?.game === "zip" ? (
          <ZipGame
            key={activeGame.puzzle.id}
            puzzle={activeGame.puzzle}
            mode={activeGame.mode}
            dateStr={todayDateStr}
            streak={stats.currentStreak}
            user={user}
            dailyRank={dailyRank}
            onComplete={handleGameComplete}
            onExit={() => setActiveGame(null)}
            onPlayUnlimitedNext={() =>
              handlePlayUnlimitedZip(activeGame.puzzle.difficulty)
            }
            onOpenAuth={() => setAuthOpen(true)}
          />
        ) : (
          <div key="hub-shell" className="flex min-h-[100dvh] flex-col">
            <HeaderBar />

            <div className="flex-1">
              {activeTab === "today" && (
                <TodayHub
                  stats={stats}
                  todayDateStr={todayDateStr}
                  todayDifficulty={todayDifficulty}
                  todayZipDifficulty={todayZipDifficulty}
                  todayQueensCompletion={todayQueensCompletion}
                  todayZipCompletion={todayZipCompletion}
                  onPlayDailyQueens={handlePlayDailyQueens}
                  onPlayDailyZip={handlePlayDailyZip}
                />
              )}

              {activeTab === "unlimited" && (
                <UnlimitedHub
                  onPlayUnlimitedQueens={handlePlayUnlimitedQueens}
                  onPlayUnlimitedZip={handlePlayUnlimitedZip}
                />
              )}

              {activeTab === "leaderboard" && (
                <LeaderboardHub
                  user={user}
                  stats={stats}
                  todayDateStr={todayDateStr}
                  onOpenAuth={() => setAuthOpen(true)}
                  onSignOut={handleSignOut}
                />
              )}
            </div>

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
