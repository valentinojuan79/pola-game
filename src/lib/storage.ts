// Guest-first localStorage persistence for Pola

export type PolaGameType =
  | "queens"
  | "zip"
  | "tango"
  | "mini-sudoku"
  | "patches"
  | "fold";

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  game: PolaGameType;
  elapsedSeconds: number;
  penaltySeconds: number;
  totalSeconds: number;
  hintsUsed: number;
  completedAt: string;
  /** Optional serialized final board state for Read-Only Daily Review Mode */
  boardSnapshot?: unknown;
}

export interface LocalProfileStats {
  currentStreak: number;
  longestStreak: number;
  lastDailyDate: string | null;
  totalSolved: number;
  dailyCompletions: Record<string, DailyCompletion>; // key: `${date}:${game}`
}

const STATS_KEY = "pola_stats_v1";
const GUEST_MIGRATED_KEY = "pola_guest_migrated_v1";
const DEV_BYPASS_KEY = "pola_dev_bypass";
const DAILY_RANKED_CLAIMED_PREFIX = "pola_daily_ranked_claimed_";
const AUTO_X_KEY = "pola_queens_auto_x";
const TANGO_VISUAL_MODE_KEY = "pola_tango_visual_mode";
const TUTORIAL_PREFS_KEY = "pola_tutorial_prefs_v1";

export interface TutorialPrefs {
  seen: Partial<Record<PolaGameType, boolean>>;
  skipAll: boolean;
}

export const DEFAULT_STATS: LocalProfileStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastDailyDate: null,
  totalSolved: 0,
  dailyCompletions: {},
};

export function getTodayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayDateString(todayStr: string): string {
  const [y, m, d] = todayStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return getTodayDateString(dt);
}

export function loadStats(): LocalProfileStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<LocalProfileStats>;
    return {
      currentStreak: parsed.currentStreak ?? 0,
      longestStreak: parsed.longestStreak ?? 0,
      lastDailyDate: parsed.lastDailyDate ?? null,
      totalSolved: parsed.totalSolved ?? 0,
      dailyCompletions: parsed.dailyCompletions ?? {},
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: LocalProfileStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Clears all local puzzle progress & guest-migration flags on Sign Out.
 * Preserves non-account UI preferences (theme, language, sound, visual/tutorial prefs),
 * the per-device daily rank lock (`pola_daily_ranked_claimed_${dateKey}`),
 * and developer bypass (`pola_dev_bypass`).
 */
export function clearLocalProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(GUEST_MIGRATED_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getGuestMigratedOwner(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(GUEST_MIGRATED_KEY);
  } catch {
    return null;
  }
}

export function isGuestProgressMigrated(): boolean {
  return Boolean(getGuestMigratedOwner());
}

export function markGuestProgressMigrated(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_MIGRATED_KEY, userId);
  } catch {
    // Ignore storage errors
  }
}

export function hasUnmigratedGuestProgress(stats: LocalProfileStats): boolean {
  if (isGuestProgressMigrated()) return false;
  return (
    stats.totalSolved > 0 || Object.keys(stats.dailyCompletions).length > 0
  );
}

/**
 * Checks URL for `?dev=1` (persisting `pola_dev_bypass = "1"` in localStorage)
 * or reads existing `pola_dev_bypass` flag.
 */
export function isDevBypassActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") {
      localStorage.setItem(DEV_BYPASS_KEY, "1");
      return true;
    }
    return localStorage.getItem(DEV_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

export function initDevBypassFromUrl(): boolean {
  return isDevBypassActive();
}

export function getDailyRankedClaimedBy(dateKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${DAILY_RANKED_CLAIMED_PREFIX}${dateKey}`);
  } catch {
    return null;
  }
}

export function isDailyRankLockedByOtherUser(
  dateKey: string,
  userId: string | null | undefined
): boolean {
  if (!userId) return false;
  if (isDevBypassActive()) return false;
  const claimedBy = getDailyRankedClaimedBy(dateKey);
  return Boolean(claimedBy && claimedBy !== userId);
}

/**
 * Claims today's device leaderboard slot for `userId` (unless dev bypass is active).
 * Returns true if `userId` is allowed to post to the public daily leaderboard today.
 */
export function claimDailyRankedSlot(dateKey: string, userId: string): boolean {
  if (typeof window === "undefined") return true;
  if (isDevBypassActive()) return true;
  try {
    const key = `${DAILY_RANKED_CLAIMED_PREFIX}${dateKey}`;
    const claimedBy = localStorage.getItem(key);
    if (!claimedBy) {
      localStorage.setItem(key, userId);
      return true;
    }
    return claimedBy === userId;
  } catch {
    return true;
  }
}

export function recordGameCompletion(params: {
  mode: "daily" | "unlimited";
  game: PolaGameType;
  date: string;
  elapsedSeconds: number;
  penaltySeconds: number;
  hintsUsed: number;
  boardSnapshot?: unknown;
}): LocalProfileStats {
  const stats = loadStats();
  const totalSeconds = params.elapsedSeconds + params.penaltySeconds;
  const next: LocalProfileStats = {
    ...stats,
    totalSolved: stats.totalSolved + 1,
    dailyCompletions: { ...stats.dailyCompletions },
  };

  if (params.mode === "daily") {
    const key = `${params.date}:${params.game}`;
    const alreadyCompleted = Boolean(next.dailyCompletions[key]);

    if (!alreadyCompleted) {
      next.dailyCompletions[key] = {
        date: params.date,
        game: params.game,
        elapsedSeconds: params.elapsedSeconds,
        penaltySeconds: params.penaltySeconds,
        totalSeconds,
        hintsUsed: params.hintsUsed,
        completedAt: new Date().toISOString(),
        boardSnapshot: params.boardSnapshot,
      };

      // Update streak if this is the first daily completion for today
      if (next.lastDailyDate !== params.date) {
        const yesterday = getYesterdayDateString(params.date);
        if (next.lastDailyDate === yesterday) {
          next.currentStreak = next.currentStreak + 1;
        } else {
          next.currentStreak = 1;
        }
        next.longestStreak = Math.max(next.longestStreak, next.currentStreak);
        next.lastDailyDate = params.date;
      }
    }
  }

  saveStats(next);
  return next;
}

export function getDailyCompletion(
  date: string,
  game: PolaGameType
): DailyCompletion | null {
  const stats = loadStats();
  return stats.dailyCompletions[`${date}:${game}`] ?? null;
}

export function loadAutoXPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(AUTO_X_KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

export function saveAutoXPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTO_X_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export function loadTangoVisualMode(): "icons" | "circles" {
  if (typeof window === "undefined") return "icons";
  try {
    const val = localStorage.getItem(TANGO_VISUAL_MODE_KEY);
    return val === "circles" ? "circles" : "icons";
  } catch {
    return "icons";
  }
}

export function saveTangoVisualMode(mode: "icons" | "circles"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TANGO_VISUAL_MODE_KEY, mode);
  } catch {
    // Ignore
  }
}

export function loadTutorialPrefs(): TutorialPrefs {
  if (typeof window === "undefined") return { seen: {}, skipAll: false };
  try {
    const raw = localStorage.getItem(TUTORIAL_PREFS_KEY);
    if (!raw) return { seen: {}, skipAll: false };
    const parsed = JSON.parse(raw) as Partial<TutorialPrefs>;
    return {
      seen: parsed.seen ?? {},
      skipAll: Boolean(parsed.skipAll),
    };
  } catch {
    return { seen: {}, skipAll: false };
  }
}

export function saveTutorialPrefs(prefs: TutorialPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TUTORIAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

export function shouldAutoShowTutorial(game: PolaGameType): boolean {
  const prefs = loadTutorialPrefs();
  return !prefs.skipAll && !prefs.seen[game];
}

export function markTutorialSeen(game: PolaGameType): void {
  const prefs = loadTutorialPrefs();
  saveTutorialPrefs({
    ...prefs,
    seen: { ...prefs.seen, [game]: true },
  });
}

export function setSkipAllTutorials(skip: boolean): void {
  const prefs = loadTutorialPrefs();
  saveTutorialPrefs({
    ...prefs,
    skipAll: skip,
  });
}
