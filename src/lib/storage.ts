// Guest-first localStorage persistence for Pola

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  game: "queens";
  elapsedSeconds: number;
  penaltySeconds: number;
  totalSeconds: number;
  hintsUsed: number;
  completedAt: string;
}

export interface LocalProfileStats {
  currentStreak: number;
  longestStreak: number;
  lastDailyDate: string | null;
  totalSolved: number;
  dailyCompletions: Record<string, DailyCompletion>; // key: `${date}:${game}`
}

const STATS_KEY = "pola_stats_v1";
const AUTO_X_KEY = "pola_queens_auto_x";

const defaultStats: LocalProfileStats = {
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
  if (typeof window === "undefined") return defaultStats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw) as Partial<LocalProfileStats>;
    return {
      currentStreak: parsed.currentStreak ?? 0,
      longestStreak: parsed.longestStreak ?? 0,
      lastDailyDate: parsed.lastDailyDate ?? null,
      totalSolved: parsed.totalSolved ?? 0,
      dailyCompletions: parsed.dailyCompletions ?? {},
    };
  } catch {
    return defaultStats;
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

export function recordGameCompletion(params: {
  mode: "daily" | "unlimited";
  game: "queens";
  date: string;
  elapsedSeconds: number;
  penaltySeconds: number;
  hintsUsed: number;
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
  game: "queens"
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
