"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("your-project.supabase.co")
);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return clientInstance;
}

export interface PolaUser {
  id: string;
  username: string;
  isLocalOnly: boolean;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  totalSeconds: number;
  hintsUsed: number;
  isCurrentUser?: boolean;
}

const LOCAL_USER_KEY = "pola_local_user_v1";
const LOCAL_LEADERBOARD_KEY = "pola_local_leaderboard_v1";

/** Internal email mapping: Username-only auth (never exposed in UI) */
export function usernameToInternalEmail(username: string): string {
  return `${username.trim().toLowerCase()}@pola.local`;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
    return "Username must be 3–20 characters (letters, numbers, underscore).";
  }
  return null;
}

export async function getCurrentUser(): Promise<PolaUser | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle();

      const fallbackName =
        (data.user.user_metadata?.username as string | undefined) ??
        data.user.email?.split("@")[0] ??
        "player";

      return {
        id: data.user.id,
        username: profile?.username ?? fallbackName,
        isLocalOnly: false,
      };
    }
    return null;
  }

  // Local fallback profile when Supabase is not configured
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? (JSON.parse(raw) as PolaUser) : null;
  } catch {
    return null;
  }
}

export async function signUpWithUsername(
  username: string,
  password: string
): Promise<{ user?: PolaUser; error?: string }> {
  const validationErr = validateUsername(username);
  if (validationErr) return { error: validationErr };
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const cleanUsername = username.trim();
  const supabase = getSupabaseClient();

  if (supabase) {
    const email = usernameToInternalEmail(cleanUsername);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: cleanUsername },
      },
    });
    if (error || !data.user) {
      return { error: error?.message ?? "Could not create account." };
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: cleanUsername,
    });
    if (profileErr) {
      return { error: "Username may already be taken." };
    }

    return {
      user: {
        id: data.user.id,
        username: cleanUsername,
        isLocalOnly: false,
      },
    };
  }

  // Local fallback
  const localUser: PolaUser = {
    id: `local_${cleanUsername.toLowerCase()}`,
    username: cleanUsername,
    isLocalOnly: true,
  };
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  } catch {
    // Ignore
  }
  return { user: localUser };
}

export async function signInWithUsername(
  username: string,
  password: string
): Promise<{ user?: PolaUser; error?: string }> {
  const validationErr = validateUsername(username);
  if (validationErr) return { error: validationErr };
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const cleanUsername = username.trim();
  const supabase = getSupabaseClient();

  if (supabase) {
    const email = usernameToInternalEmail(cleanUsername);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return { error: "Invalid username or password." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .maybeSingle();

    return {
      user: {
        id: data.user.id,
        username: profile?.username ?? cleanUsername,
        isLocalOnly: false,
      },
    };
  }

  // Local fallback
  const localUser: PolaUser = {
    id: `local_${cleanUsername.toLowerCase()}`,
    username: cleanUsername,
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
    await supabase.auth.signOut();
  }
  try {
    localStorage.removeItem(LOCAL_USER_KEY);
  } catch {
    // Ignore
  }
}

export async function submitDailyScore(params: {
  user: PolaUser;
  puzzleDate: string;
  gameType: "queens";
  totalSeconds: number;
  hintsUsed: number;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase && !params.user.isLocalOnly) {
    await supabase.from("leaderboards").upsert(
      {
        user_id: params.user.id,
        username: params.user.username,
        puzzle_date: params.puzzleDate,
        game_type: params.gameType,
        total_seconds: params.totalSeconds,
        hints_used: params.hintsUsed,
      },
      { onConflict: "user_id,puzzle_date,game_type" }
    );
    return;
  }

  // Local leaderboard persistence
  if (typeof window === "undefined") return;
  try {
    const key = `${LOCAL_LEADERBOARD_KEY}_${params.puzzleDate}_${params.gameType}`;
    const raw = localStorage.getItem(key);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    const existingIdx = entries.findIndex(
      (e) => e.username.toLowerCase() === params.user.username.toLowerCase()
    );
    const nextEntry: LeaderboardEntry = {
      id: params.user.id,
      username: params.user.username,
      totalSeconds: params.totalSeconds,
      hintsUsed: params.hintsUsed,
    };
    if (existingIdx >= 0) {
      if (params.totalSeconds < entries[existingIdx].totalSeconds) {
        entries[existingIdx] = nextEntry;
      }
    } else {
      entries.push(nextEntry);
    }
    entries.sort((a, b) => a.totalSeconds - b.totalSeconds || a.hintsUsed - b.hintsUsed);
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // Ignore
  }
}

export async function fetchDailyLeaderboard(
  puzzleDate: string,
  gameType: "queens",
  currentUserId?: string
): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("leaderboards")
      .select("id, user_id, username, total_seconds, hints_used")
      .eq("puzzle_date", puzzleDate)
      .eq("game_type", gameType)
      .order("total_seconds", { ascending: true })
      .order("hints_used", { ascending: true })
      .limit(50);

    if (!error && data) {
      return data.map((row) => ({
        id: row.id as string,
        username: row.username as string,
        totalSeconds: row.total_seconds as number,
        hintsUsed: row.hints_used as number,
        isCurrentUser: currentUserId ? row.user_id === currentUserId : false,
      }));
    }
  }

  // Local fallback
  if (typeof window === "undefined") return [];
  try {
    const key = `${LOCAL_LEADERBOARD_KEY}_${puzzleDate}_${gameType}`;
    const raw = localStorage.getItem(key);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    return entries.map((e) => ({
      ...e,
      isCurrentUser: currentUserId ? e.id === currentUserId : false,
    }));
  } catch {
    return [];
  }
}
