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
import {
  getDailyQueensPuzzle,
  getDifficultyForDateString,
  getUnlimitedQueensPuzzle,
} from "@/lib/games/queens/presets";
import type { QueensDifficulty, QueensPuzzle } from "@/lib/games/queens/types";
import {
  getDailyCompletion,
  getTodayDateString,
  loadStats,
  recordGameCompletion,
  type LocalProfileStats,
} from "@/lib/storage";
import {
  fetchDailyLeaderboard,
  getCurrentUser,
  signOutUser,
  submitDailyScore,
  type PolaUser,
} from "@/lib/supabase";

interface ActiveQueensSession {
  mode: "daily" | "unlimited";
  puzzle: QueensPuzzle;
}

export default function PolaAppPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [activeGame, setActiveGame] = useState<ActiveQueensSession | null>(null);
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

  const handlePlayDailyQueens = useCallback(() => {
    const puzzle = getDailyQueensPuzzle(todayDateStr);
    setActiveGame({ mode: "daily", puzzle });
  }, [todayDateStr]);

  const handlePlayUnlimitedQueens = useCallback(
    (difficulty: QueensDifficulty) => {
      const nextNonce = unlimitedNonce + 1;
      setUnlimitedNonce(nextNonce);
      const puzzle = getUnlimitedQueensPuzzle(
        difficulty,
        `${Date.now()}-${nextNonce}`
      );
      setActiveGame({ mode: "unlimited", puzzle });
    },
    [unlimitedNonce]
  );

  const handleQueensComplete = useCallback(
    async (result: {
      elapsedSeconds: number;
      penaltySeconds: number;
      hintsUsed: number;
    }) => {
      if (!activeGame) return;
      const updated = recordGameCompletion({
        mode: activeGame.mode,
        game: "queens",
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
          gameType: "queens",
          totalSeconds,
          hintsUsed: result.hintsUsed,
        });
        const board = await fetchDailyLeaderboard(
          todayDateStr,
          "queens",
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
      // If the user already completed today's daily Queens as a guest, submit it now!
      const completion = getDailyCompletion(todayDateStr, "queens");
      if (completion) {
        await submitDailyScore({
          user: signedInUser,
          puzzleDate: todayDateStr,
          gameType: "queens",
          totalSeconds: completion.totalSeconds,
          hintsUsed: completion.hintsUsed,
        });
        const board = await fetchDailyLeaderboard(
          todayDateStr,
          "queens",
          signedInUser.id
        );
        const idx = board.findIndex((e) => e.isCurrentUser);
        setDailyRank(idx >= 0 ? idx + 1 : null);
      }
    },
    [todayDateStr]
  );

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setDailyRank(null);
  }, []);

  return (
    <main className="relative min-h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <QueensGame
            key={activeGame.puzzle.id}
            puzzle={activeGame.puzzle}
            mode={activeGame.mode}
            dateStr={todayDateStr}
            streak={stats.currentStreak}
            user={user}
            dailyRank={dailyRank}
            onComplete={handleQueensComplete}
            onExit={() => setActiveGame(null)}
            onPlayUnlimitedNext={() =>
              handlePlayUnlimitedQueens(activeGame.puzzle.difficulty)
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
                  todayQueensCompletion={todayQueensCompletion}
                  onPlayDailyQueens={handlePlayDailyQueens}
                />
              )}

              {activeTab === "unlimited" && (
                <UnlimitedHub
                  onPlayUnlimitedQueens={handlePlayUnlimitedQueens}
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
