"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DailyCompletion, LocalProfileStats, PolaGameType } from "./storage";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const ALL_GAME_IDS: readonly PolaGameType[] = [
  "queens",
  "zip",
  "tango",
  "mini-sudoku",
  "patches",
  "fold",
] as const;

export type LeaderboardFilter = "overall" | PolaGameType;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    /^https?:\/\//i.test(SUPABASE_URL) &&
    !SUPABASE_URL.includes("your-project.supabase.co") &&
    !SUPABASE_ANON_KEY.includes("your-anon-key")
);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

export interface PolaUser {
  id: string;
  username: string;
  displayName: string;
  isLocalOnly: boolean;
}

export type AuthErrorCode =
  | "invalid_username"
  | "password_too_short"
  | "username_taken"
  | "invalid_credentials"
  | "network_error"
  | "rate_limited"
  | "unknown";

export interface AuthResult {
  user?: PolaUser;
  errorCode?: AuthErrorCode;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  totalSeconds: number;
  hintsUsed: number;
  /** Number of today's daily games solved (1-6), populated in "overall" view */
  gamesSolved?: number;
  isCurrentUser?: boolean;
}

const LOCAL_USER_KEY = "pola_local_user_v1";
const LOCAL_LEADERBOARD_KEY = "pola_local_leaderboard_v1";
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/** Internal email mapping: Username-only auth (never exposed in UI) */
export function usernameToInternalEmail(username: string): string {
  return `${username.trim().toLowerCase()}@pola.local`;
}

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username.trim());
}

function mapSupabaseAuthError(
  error: { message?: string; status?: number; code?: string } | null,
  mode: "signup" | "signin"
): AuthErrorCode {
  if (!error) return "unknown";
  const msg = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    error.status === 0
  ) {
    return "network_error";
  }

  if (
    error.status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    code.includes("over_request_rate_limit")
  ) {
    return "rate_limited";
  }

  if (
    mode === "signup" &&
    (msg.includes("already registered") ||
      msg.includes("already exists") ||
      code === "user_already_exists")
  ) {
    return "username_taken";
  }

  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    code === "invalid_credentials"
  ) {
    return "invalid_credentials";
  }

  if (msg.includes("password")) {
    return "password_too_short";
  }

  return "unknown";
}

interface ProfileJoinShape {
  username?: string | null;
  display_name?: string | null;
}

function extractProfileNames(
  joined: ProfileJoinShape | ProfileJoinShape[] | null | undefined
): { username: string; displayName: string } {
  const rec = Array.isArray(joined) ? joined[0] : joined;
  const username = rec?.username?.trim() || "player";
  const displayName = rec?.display_name?.trim() || username;
  return { username, displayName };
}

export async function getCurrentUser(): Promise<PolaUser | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      const metaUsername = data.user.user_metadata?.username as string | undefined;
      const metaDisplayName = data.user.user_metadata?.display_name as string | undefined;
      const fallbackUsername =
        metaUsername?.trim().toLowerCase() ??
        data.user.email?.split("@")[0]?.toLowerCase() ??
        "player";

      const username = profile?.username ?? fallbackUsername;
      const displayName = profile?.display_name ?? metaDisplayName ?? username;

      return {
        id: data.user.id,
        username,
        displayName,
        isLocalOnly: false,
      };
    } catch {
      return null;
    }
  }

  // Local fallback profile when Supabase is not configured
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PolaUser>;
    if (!parsed.id || !parsed.username) return null;
    return {
      id: parsed.id,
      username: parsed.username,
      displayName: parsed.displayName ?? parsed.username,
      isLocalOnly: true,
    };
  } catch {
    return null;
  }
}

export async function signUpWithUsername(
  username: string,
  password: string
): Promise<AuthResult> {
  const displayName = username.trim();
  if (!isValidUsername(displayName)) {
    return { errorCode: "invalid_username" };
  }
  if (password.length < 6) {
    return { errorCode: "password_too_short" };
  }

  const cleanUsername = displayName.toLowerCase();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // Check case-insensitive username availability up front
      const { data: existingProfile, error: lookupErr } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (lookupErr && lookupErr.message.toLowerCase().includes("fetch")) {
        return { errorCode: "network_error" };
      }
      if (existingProfile) {
        return { errorCode: "username_taken" };
      }

      const internalId = usernameToInternalEmail(cleanUsername);
      const { data, error } = await supabase.auth.signUp({
        email: internalId,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: displayName,
          },
        },
      });

      if (error || !data.user) {
        return { errorCode: mapSupabaseAuthError(error, "signup") };
      }

      // Supabase returns empty identities when the account already exists
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { errorCode: "username_taken" };
      }

      // The handle_new_user DB trigger creates public.profiles automatically.
      // As a resilient fallback (if trigger is absent), ensure profile exists when session is active.
      if (data.session) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            username: cleanUsername,
            display_name: displayName,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }

      return {
        user: {
          id: data.user.id,
          username: cleanUsername,
          displayName,
          isLocalOnly: false,
        },
      };
    } catch {
      return { errorCode: "network_error" };
    }
  }

  // Local fallback when Supabase env is not configured
  const localUser: PolaUser = {
    id: `local_${cleanUsername}`,
    username: cleanUsername,
    displayName,
    isLocalOnly: true,
  };
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  } catch {
    // Ignore storage errors
  }
  return { user: localUser };
}

export async function signInWithUsername(
  username: string,
  password: string
): Promise<AuthResult> {
  const displayName = username.trim();
  if (!isValidUsername(displayName)) {
    return { errorCode: "invalid_username" };
  }
  if (password.length < 6) {
    return { errorCode: "password_too_short" };
  }

  const cleanUsername = displayName.toLowerCase();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const internalId = usernameToInternalEmail(cleanUsername);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: internalId,
        password,
      });

      if (error || !data.user) {
        return { errorCode: mapSupabaseAuthError(error, "signin") };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      return {
        user: {
          id: data.user.id,
          username: profile?.username ?? cleanUsername,
          displayName: profile?.display_name ?? displayName,
          isLocalOnly: false,
        },
      };
    } catch {
      return { errorCode: "network_error" };
    }
  }

  // Local fallback
  const localUser: PolaUser = {
    id: `local_${cleanUsername}`,
    username: cleanUsername,
    displayName,
    isLocalOnly: true,
  };
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  } catch {
    // Ignore
  }
  return { user: localUser };
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout network errors
    }
  }
  try {
    localStorage.removeItem(LOCAL_USER_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Submit a player's Daily solve.
 * First valid solve per (user, game, date) is locked by DB UNIQUE constraint
 * and cannot be overwritten by replays.
 */
export async function submitDailyScore(params: {
  user: PolaUser;
  puzzleDate: string;
  gameType: PolaGameType;
  totalSeconds: number;
  hintsUsed: number;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase && !params.user.isLocalOnly) {
    try {
      const { error } = await supabase.from("daily_completions").insert({
        user_id: params.user.id,
        game_id: params.gameType,
        puzzle_date: params.puzzleDate,
        time_seconds: Math.max(0, Math.round(params.totalSeconds)),
        hints_used: Math.max(0, Math.round(params.hintsUsed)),
      });

      // 23505 = unique_violation (first daily solve already locked — treat as success)
      if (error && error.code !== "23505") {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Local leaderboard persistence (also locks first daily solve)
  if (typeof window === "undefined") return false;
  try {
    const key = `${LOCAL_LEADERBOARD_KEY}_${params.puzzleDate}_${params.gameType}`;
    const raw = localStorage.getItem(key);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const exists = entries.some(
      (e) =>
        e.userId === params.user.id ||
        e.username.toLowerCase() === params.user.username.toLowerCase()
    );
    if (!exists) {
      entries.push({
        id: `${params.user.id}_${params.gameType}_${params.puzzleDate}`,
        userId: params.user.id,
        username: params.user.username,
        displayName: params.user.displayName,
        totalSeconds: Math.max(0, Math.round(params.totalSeconds)),
        hintsUsed: Math.max(0, Math.round(params.hintsUsed)),
      });
      entries.sort(
        (a, b) => a.totalSeconds - b.totalSeconds || a.hintsUsed - b.hintsUsed
      );
      localStorage.setItem(key, JSON.stringify(entries));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sync local guest streaks up to the user's Supabase profile (keeps the higher streak).
 */
export async function syncProfileStreaks(
  user: PolaUser,
  stats: LocalProfileStats
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || user.isLocalOnly) return;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak")
      .eq("id", user.id)
      .maybeSingle();

    const nextCurrent = Math.max(profile?.current_streak ?? 0, stats.currentStreak);
    const nextLongest = Math.max(
      profile?.longest_streak ?? 0,
      stats.longestStreak,
      nextCurrent
    );

    if (
      !profile ||
      nextCurrent !== profile.current_streak ||
      nextLongest !== profile.longest_streak
    ) {
      await supabase
        .from("profiles")
        .update({
          current_streak: nextCurrent,
          longest_streak: nextLongest,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  } catch {
    // Non-critical background sync
  }
}

/**
 * Guest-to-Account Sync:
 * Automatically uploads all of today's locally solved Daily puzzles to Supabase
 * when a guest registers or logs in later that same day.
 */
export async function syncGuestCompletionsToAccount(
  user: PolaUser,
  todayDateStr: string,
  completions: Partial<Record<PolaGameType, DailyCompletion | null>>,
  stats: LocalProfileStats
): Promise<number> {
  let syncedCount = 0;

  await Promise.all(
    ALL_GAME_IDS.map(async (gameType) => {
      const completion = completions[gameType];
      if (!completion) return;
      const ok = await submitDailyScore({
        user,
        puzzleDate: todayDateStr,
        gameType,
        totalSeconds: completion.totalSeconds,
        hintsUsed: completion.hintsUsed,
      });
      if (ok) syncedCount += 1;
    })
  );

  await syncProfileStreaks(user, stats);
  return syncedCount;
}

/**
 * Compute the exact live Daily rank (1-based) for a signed-in user on a specific game.
 * Works accurately even if the player ranks outside the Top 50.
 */
export async function fetchUserDailyRank(
  puzzleDate: string,
  gameType: PolaGameType,
  userId: string
): Promise<number | null> {
  const supabase = getSupabaseClient();
  if (supabase && !userId.startsWith("local_")) {
    try {
      const { data: myRow, error: rowErr } = await supabase
        .from("daily_completions")
        .select("time_seconds, hints_used, completed_at")
        .eq("puzzle_date", puzzleDate)
        .eq("game_id", gameType)
        .eq("user_id", userId)
        .maybeSingle();

      if (rowErr || !myRow) return null;

      const { count, error: countErr } = await supabase
        .from("daily_completions")
        .select("id", { count: "exact", head: true })
        .eq("puzzle_date", puzzleDate)
        .eq("game_id", gameType)
        .or(
          `time_seconds.lt.${myRow.time_seconds},` +
            `and(time_seconds.eq.${myRow.time_seconds},hints_used.lt.${myRow.hints_used}),` +
            `and(time_seconds.eq.${myRow.time_seconds},hints_used.eq.${myRow.hints_used},completed_at.lt.${myRow.completed_at})`
        );

      if (countErr) return null;
      return (count ?? 0) + 1;
    } catch {
      return null;
    }
  }

  // Local fallback
  const localBoard = readLocalGameLeaderboard(puzzleDate, gameType, userId);
  const idx = localBoard.findIndex((e) => e.isCurrentUser);
  return idx >= 0 ? idx + 1 : null;
}

function readLocalGameLeaderboard(
  puzzleDate: string,
  gameType: PolaGameType,
  currentUserId?: string
): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const key = `${LOCAL_LEADERBOARD_KEY}_${puzzleDate}_${gameType}`;
    const raw = localStorage.getItem(key);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    return entries.map((e) => {
      const uid = e.userId ?? e.id;
      return {
        ...e,
        userId: uid,
        displayName: e.displayName ?? e.username,
        isCurrentUser: currentUserId ? uid === currentUserId : false,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchDailyLeaderboard(
  puzzleDate: string,
  gameType: PolaGameType,
  currentUserId?: string
): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("daily_completions")
        .select(
          "id, user_id, time_seconds, hints_used, completed_at, profiles(username, display_name)"
        )
        .eq("puzzle_date", puzzleDate)
        .eq("game_id", gameType)
        .order("time_seconds", { ascending: true })
        .order("hints_used", { ascending: true })
        .order("completed_at", { ascending: true })
        .limit(50);

      if (!error && data) {
        return data.map((row) => {
          const { username, displayName } = extractProfileNames(
            row.profiles as ProfileJoinShape | ProfileJoinShape[] | null
          );
          const uid = row.user_id as string;
          return {
            id: row.id as string,
            userId: uid,
            username,
            displayName,
            totalSeconds: row.time_seconds as number,
            hintsUsed: row.hints_used as number,
            isCurrentUser: currentUserId ? uid === currentUserId : false,
          };
        });
      }
    } catch {
      return [];
    }
    return [];
  }

  return readLocalGameLeaderboard(puzzleDate, gameType, currentUserId);
}

/**
 * Overall Daily Leaderboard across all 6 games:
 * Ranked by most Daily games solved today (6/6 → 1/6), then fastest combined total time, then fewest hints.
 */
export async function fetchOverallDailyLeaderboard(
  puzzleDate: string,
  currentUserId?: string
): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("daily_completions")
        .select(
          "user_id, game_id, time_seconds, hints_used, completed_at, profiles(username, display_name)"
        )
        .eq("puzzle_date", puzzleDate)
        .limit(1000);

      if (error || !data) return [];

      const byUser = new Map<
        string,
        {
          userId: string;
          username: string;
          displayName: string;
          games: Set<string>;
          totalSeconds: number;
          hintsUsed: number;
          latestCompletedAt: string;
        }
      >();

      for (const row of data) {
        const uid = row.user_id as string;
        const gameId = row.game_id as string;
        const { username, displayName } = extractProfileNames(
          row.profiles as ProfileJoinShape | ProfileJoinShape[] | null
        );

        let agg = byUser.get(uid);
        if (!agg) {
          agg = {
            userId: uid,
            username,
            displayName,
            games: new Set<string>(),
            totalSeconds: 0,
            hintsUsed: 0,
            latestCompletedAt: (row.completed_at as string) ?? "",
          };
          byUser.set(uid, agg);
        }

        if (!agg.games.has(gameId)) {
          agg.games.add(gameId);
          agg.totalSeconds += row.time_seconds as number;
          agg.hintsUsed += row.hints_used as number;
          const completedAt = (row.completed_at as string) ?? "";
          if (completedAt > agg.latestCompletedAt) {
            agg.latestCompletedAt = completedAt;
          }
        }
      }

      return Array.from(byUser.values())
        .sort(
          (a, b) =>
            b.games.size - a.games.size ||
            a.totalSeconds - b.totalSeconds ||
            a.hintsUsed - b.hintsUsed ||
            a.latestCompletedAt.localeCompare(b.latestCompletedAt)
        )
        .slice(0, 50)
        .map((agg) => ({
          id: `overall_${agg.userId}`,
          userId: agg.userId,
          username: agg.username,
          displayName: agg.displayName,
          totalSeconds: agg.totalSeconds,
          hintsUsed: agg.hintsUsed,
          gamesSolved: agg.games.size,
          isCurrentUser: currentUserId ? agg.userId === currentUserId : false,
        }));
    } catch {
      return [];
    }
  }

  // Local fallback aggregation across all 6 games
  const byUser = new Map<
    string,
    {
      userId: string;
      username: string;
      displayName: string;
      gamesSolved: number;
      totalSeconds: number;
      hintsUsed: number;
    }
  >();

  for (const gameId of ALL_GAME_IDS) {
    const board = readLocalGameLeaderboard(puzzleDate, gameId, currentUserId);
    for (const entry of board) {
      const existing = byUser.get(entry.userId);
      if (existing) {
        existing.gamesSolved += 1;
        existing.totalSeconds += entry.totalSeconds;
        existing.hintsUsed += entry.hintsUsed;
      } else {
        byUser.set(entry.userId, {
          userId: entry.userId,
          username: entry.username,
          displayName: entry.displayName,
          gamesSolved: 1,
          totalSeconds: entry.totalSeconds,
          hintsUsed: entry.hintsUsed,
        });
      }
    }
  }

  return Array.from(byUser.values())
    .sort(
      (a, b) =>
        b.gamesSolved - a.gamesSolved ||
        a.totalSeconds - b.totalSeconds ||
        a.hintsUsed - b.hintsUsed
    )
    .map((agg) => ({
      id: `overall_${agg.userId}`,
      userId: agg.userId,
      username: agg.username,
      displayName: agg.displayName,
      totalSeconds: agg.totalSeconds,
      hintsUsed: agg.hintsUsed,
      gamesSolved: agg.gamesSolved,
      isCurrentUser: currentUserId ? agg.userId === currentUserId : false,
    }));
}
