"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Locale = "en" | "id";

const STORAGE_KEY = "pola_locale";

export const dictionary = {
  en: {
    appName: "Pola",
    tagline: "Daily Logic Puzzles",
    nav: {
      today: "Today",
      unlimited: "Unlimited",
      leaderboard: "Ranks",
    },
    greetings: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    today: {
      streak: "day streak",
      streakPlural: "day streak",
      dailyChallenge: "Daily Challenge",
      completed: "Solved",
      play: "Play",
      comingSoon: "Coming Soon",
      dailyProgress: "Today's Puzzles",
      subtitle: "Fresh puzzles every day. Easy on Monday, sharpest on Sunday.",
    },
    unlimited: {
      title: "Unlimited Play",
      subtitle: "Practice anytime without affecting your daily streak.",
      selectDifficulty: "Choose Grid & Difficulty",
      startGame: "Start Puzzle",
      comingSoonNote: "More games unlock as Pola expands.",
      difficulties: {
        easy: { label: "Easy", desc: "6×6 · Relaxed warm-up" },
        medium: { label: "Medium", desc: "7×7 · Balanced logic" },
        hard: { label: "Hard", desc: "8×8 · Deep deduction" },
        expert: { label: "Expert", desc: "9×9 · Sunday mastery" },
      },
    },
    games: {
      queens: {
        name: "Queens",
        tagline: "One crown per row, column & color region",
      },
      zip: {
        name: "Zip",
        tagline: "Trace one continuous path through every cell",
      },
      tango: {
        name: "Tango",
        tagline: "Balance suns & moons with pure deduction",
      },
      miniSudoku: {
        name: "Mini Sudoku",
        tagline: "6×6 classic precision with 2×3 blocks",
      },
      patches: {
        name: "Patches",
        tagline: "Partition the grid into exact rectangles",
      },
    },
    queens: {
      dailyLabel: "Daily Queens",
      unlimitedLabel: "Unlimited Queens",
      undo: "Undo",
      hint: "Hint",
      autoX: "Auto-X",
      reset: "Reset",
      howToPlay: "How to Play",
      rule1: "Place exactly one Crown in each row, column, and colored region.",
      rule2: "Crowns cannot touch each other — not even diagonally.",
      rule3: "Tap once for X, tap again for Crown. Drag across cells to mark or clear X's quickly.",
      rule4: "Hints place one locked Crown and add a +10s penalty.",
      gotIt: "Got it",
      back: "Back",
      penaltyNotice: "+10s",
      noHintsLeft: "All regions solved!",
      newPuzzle: "New Puzzle",
    },
    win: {
      title: "Puzzle Solved!",
      subtitleDaily: "Daily Queens complete",
      subtitleUnlimited: "Unlimited Queens complete",
      time: "Time",
      hints: "Hints",
      streak: "Streak",
      rank: "Daily Rank",
      rankGuest: "Claim a username to appear on the Daily Leaderboard.",
      claimUsername: "Set Username",
      shareResult: "Share Result",
      copied: "Copied!",
      playUnlimited: "Play Unlimited",
      nextPuzzle: "Next Puzzle",
      backToToday: "Back to Today",
    },
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Today's fastest Queens solvers",
      yourProfile: "Your Profile",
      guestTitle: "Playing as Guest",
      guestDesc: "Progress is saved on this device. Pick a username to join the Daily Leaderboard and sync streaks.",
      signInBtn: "Sign In / Join",
      signOutBtn: "Sign Out",
      solved: "Solved",
      bestStreak: "Best Streak",
      currentStreak: "Streak",
      emptyBoard: "Be the first to finish today's Queens puzzle!",
      offlineNote: "Showing local scores. Connect Supabase to sync global leaderboards.",
      you: "You",
    },
    auth: {
      titleSignIn: "Welcome Back",
      titleSignUp: "Claim Your Username",
      subtitle: "No email required. Just a username and password for the leaderboard.",
      username: "Username",
      usernamePlaceholder: "e.g. logic_fox",
      password: "Password",
      passwordPlaceholder: "At least 6 characters",
      submitSignIn: "Sign In",
      submitSignUp: "Create Account",
      switchToSignUp: "New here? Claim a username",
      switchToSignIn: "Already have a username? Sign in",
      usernameRule: "3–20 letters, numbers, or underscores.",
      localModeHint: "Local profile mode active (Supabase env not configured).",
    },
    settings: {
      soundOn: "Sound & Haptics On",
      soundOff: "Muted",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
    },
  },
  id: {
    appName: "Pola",
    tagline: "Teka-Teki Logika Harian",
    nav: {
      today: "Hari Ini",
      unlimited: "Bebas",
      leaderboard: "Peringkat",
    },
    greetings: {
      morning: "Selamat pagi",
      afternoon: "Selamat siang",
      evening: "Selamat malam",
    },
    today: {
      streak: "hari beruntun",
      streakPlural: "hari beruntun",
      dailyChallenge: "Tantangan Harian",
      completed: "Selesai",
      play: "Main",
      comingSoon: "Segera Hadir",
      dailyProgress: "Teka-Teki Hari Ini",
      subtitle: "Teka-teki baru setiap hari. Santai di Senin, paling menantang di Minggu.",
    },
    unlimited: {
      title: "Mode Bebas",
      subtitle: "Latihan kapan saja tanpa memengaruhi streak harianmu.",
      selectDifficulty: "Pilih Ukuran & Tingkat",
      startGame: "Mulai Main",
      comingSoonNote: "Game lainnya akan segera dibuka di Pola.",
      difficulties: {
        easy: { label: "Mudah", desc: "6×6 · Pemanasan santai" },
        medium: { label: "Sedang", desc: "7×7 · Logika seimbang" },
        hard: { label: "Sulit", desc: "8×8 · Deduksi mendalam" },
        expert: { label: "Ahli", desc: "9×9 · Tantangan Minggu" },
      },
    },
    games: {
      queens: {
        name: "Queens",
        tagline: "Satu mahkota per baris, kolom & warna",
      },
      zip: {
        name: "Zip",
        tagline: "Tarik satu jalur menyambung semua kotak",
      },
      tango: {
        name: "Tango",
        tagline: "Seimbangkan matahari & bulan dengan logika",
      },
      miniSudoku: {
        name: "Mini Sudoku",
        tagline: "Presisi klasik 6×6 dengan blok 2×3",
      },
      patches: {
        name: "Patches",
        tagline: "Bagi papan menjadi persegi panjang tepat",
      },
    },
    queens: {
      dailyLabel: "Queens Harian",
      unlimitedLabel: "Queens Bebas",
      undo: "Urungkan",
      hint: "Petunjuk",
      autoX: "Auto-X",
      reset: "Ulang",
      howToPlay: "Cara Bermain",
      rule1: "Letakkan tepat satu Mahkota di setiap baris, kolom, dan area warna.",
      rule2: "Mahkota tidak boleh bersentuhan — bahkan secara diagonal.",
      rule3: "Ketuk sekali untuk X, ketuk lagi untuk Mahkota. Geser jari untuk menandai atau menghapus banyak X.",
      rule4: "Petunjuk menempatkan 1 Mahkota terkunci dengan penalti +10d.",
      gotIt: "Mengerti",
      back: "Kembali",
      penaltyNotice: "+10d",
      noHintsLeft: "Semua area sudah terisi!",
      newPuzzle: "Papan Baru",
    },
    win: {
      title: "Berhasil!",
      subtitleDaily: "Queens Harian selesai",
      subtitleUnlimited: "Queens Bebas selesai",
      time: "Waktu",
      hints: "Petunjuk",
      streak: "Streak",
      rank: "Peringkat",
      rankGuest: "Buat username untuk masuk ke Papan Peringkat Harian.",
      claimUsername: "Buat Username",
      shareResult: "Bagikan Hasil",
      copied: "Tersalin!",
      playUnlimited: "Main Mode Bebas",
      nextPuzzle: "Papan Berikutnya",
      backToToday: "Ke Beranda",
    },
    leaderboard: {
      title: "Peringkat",
      subtitle: "Penyelesai Queens tercepat hari ini",
      yourProfile: "Profil Kamu",
      guestTitle: "Bermain sebagai Tamu",
      guestDesc: "Progres tersimpan di perangkat ini. Buat username untuk masuk Peringkat Harian.",
      signInBtn: "Masuk / Daftar",
      signOutBtn: "Keluar",
      solved: "Selesai",
      bestStreak: "Streak Terbaik",
      currentStreak: "Streak",
      emptyBoard: "Jadilah yang pertama menyelesaikan Queens hari ini!",
      offlineNote: "Menampilkan skor lokal. Hubungkan Supabase untuk sinkronisasi global.",
      you: "Kamu",
    },
    auth: {
      titleSignIn: "Selamat Datang Kembali",
      titleSignUp: "Buat Username",
      subtitle: "Tanpa email. Cukup username dan kata sandi untuk papan peringkat.",
      username: "Username",
      usernamePlaceholder: "cth. rubah_logika",
      password: "Kata Sandi",
      passwordPlaceholder: "Minimal 6 karakter",
      submitSignIn: "Masuk",
      submitSignUp: "Buat Akun",
      switchToSignUp: "Belum punya akun? Buat username",
      switchToSignIn: "Sudah punya username? Masuk",
      usernameRule: "3–20 huruf, angka, atau garis bawah.",
      localModeHint: "Mode profil lokal aktif (Supabase belum dikonfigurasi).",
    },
    settings: {
      soundOn: "Suara & Getar Aktif",
      soundOff: "Senyap",
      lightMode: "Mode Terang",
      darkMode: "Mode Gelap",
    },
  },
} as const;

export type Dictionary = (typeof dictionary)[Locale];

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "id") {
        setLocaleState(saved);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "id" : "en");
  }, [locale, setLocale]);

  return React.createElement(
    I18nContext.Provider,
    {
      value: {
        locale,
        setLocale,
        toggleLocale,
        t: dictionary[locale],
      },
    },
    children
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
