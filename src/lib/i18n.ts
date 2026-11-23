"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Locale = "en" | "id";

const STORAGE_KEY = "pola_locale";

export const dictionary = {
  en: {
    appName: "Pola",
    tagline: "Daily Brain Teasers",
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
      dailyChallenge: "Daily Drop",
      completed: "Solved",
      play: "Play",
      comingSoon: "Coming Soon",
      dailyProgress: "Today's Lineup",
      subtitle: "Daily brain teasers. Chill on Monday, spicy on Sunday.",
    },
    unlimited: {
      title: "Unlimited Play",
      subtitle: "Play as much as you want—zero pressure on your daily streak.",
      selectDifficulty: "Pick your vibe",
      startGame: "Let's Play",
      comingSoonNote: "More games are cooking and dropping soon.",
      difficulties: {
        easy: { label: "Easy", desc: "6×6 · Chill warm-up" },
        medium: { label: "Medium", desc: "7×7 · Nice & steady" },
        hard: { label: "Hard", desc: "8×8 · Brain burner" },
        expert: { label: "Expert", desc: "9×9 · Sunday spicy" },
      },
      zipDifficulties: {
        easy: { label: "Easy", desc: "6×6 · Wide open" },
        medium: { label: "Medium", desc: "7×7 · Watch the walls" },
        hard: { label: "Hard", desc: "8×8 · Tricky barriers" },
        expert: { label: "Expert", desc: "8×8 · Barely any clues" },
      },
    },
    games: {
      queens: {
        name: "Queens",
        tagline: "One crown per row, column & color zone",
      },
      zip: {
        name: "Zip",
        tagline: "Draw one continuous line through every cell",
      },
      tango: {
        name: "Tango",
        tagline: "Balance suns & moons with pure logic",
      },
      miniSudoku: {
        name: "Mini Sudoku",
        tagline: "Bite-sized 6×6 classic with 2×3 blocks",
      },
      patches: {
        name: "Patches",
        tagline: "Fill the board with matching rectangles",
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
      rule1: "Drop exactly one Crown in every row, column, and colored zone.",
      rule2: "Crowns need their space—they can't touch, not even diagonally.",
      rule3: "Tap once for X, tap again for a Crown. Swipe across cells to mark or clear X's fast.",
      rule4: "Stuck? Hints lock in one right Crown, with a +10s time bump.",
      gotIt: "Got it!",
      back: "Back",
      penaltyNotice: "+10s",
      noHintsLeft: "All zones solved!",
      newPuzzle: "New Puzzle",
    },
    zip: {
      dailyLabel: "Daily Zip",
      unlimitedLabel: "Unlimited Zip",
      undo: "Undo",
      hint: "Hint",
      reset: "Reset",
      howToPlay: "How to Play",
      rule1: "Start at 1 and draw one unbroken path that visits every single square.",
      rule2: "Move up, down, left, or right—no diagonals, and no hopping over thick walls.",
      rule3: "Hit the numbered dots in order (1 → 2 → 3 ...) and finish right on the last number.",
      rule4: "Drag back to undo, or tap any spot on your trail to trim it back. Hints cool down for 15s.",
      gotIt: "Got it!",
      back: "Back",
      cellsFilled: "cells",
      newPuzzle: "New Puzzle",
    },
    win: {
      title: "Nailed It!",
      subtitleDaily: "Today's Queens, crushed",
      subtitleUnlimited: "Unlimited Queens, cleared",
      subtitleDailyZip: "Today's Zip, crushed",
      subtitleUnlimitedZip: "Unlimited Zip, cleared",
      time: "Time",
      hints: "Hints",
      streak: "Streak",
      rank: "Today's Rank",
      rankGuest: "Grab a username to show up on today's leaderboard.",
      claimUsername: "Pick Name",
      shareResult: "Share Result",
      copied: "Copied!",
      playUnlimited: "Play Unlimited",
      nextPuzzle: "Next Puzzle",
      backToToday: "Back to Today",
    },
    leaderboard: {
      title: "Ranks",
      subtitle: "Today's fastest Queens solvers",
      subtitleAll: "Today's speediest puzzle solvers",
      yourProfile: "Your Profile",
      guestTitle: "Playing as Guest",
      guestDesc: "Your progress stays on this device. Grab a username to join the daily ranks and sync streaks.",
      signInBtn: "Join / Sign In",
      signOutBtn: "Sign Out",
      solved: "Solved",
      bestStreak: "Best Streak",
      currentStreak: "Streak",
      emptyBoard: "Wide open! Be the first on today's Queens board.",
      emptyBoardZip: "Wide open! Be the first on today's Zip board.",
      offlineNote: "Showing local scores. Connect Supabase to sync global ranks.",
      you: "You",
    },
    auth: {
      titleSignIn: "Welcome Back",
      titleSignUp: "Grab Your Username",
      subtitle: "No email needed—just a username and password for the leaderboard.",
      username: "Username",
      usernamePlaceholder: "e.g. logic_fox",
      password: "Password",
      passwordPlaceholder: "At least 6 characters",
      submitSignIn: "Sign In",
      submitSignUp: "Create Account",
      switchToSignUp: "New here? Grab a username",
      switchToSignIn: "Already got one? Sign in",
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
    tagline: "Puzzle Logika Harian",
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
      dailyChallenge: "Puzzle Harian",
      completed: "Berhasil",
      play: "Main",
      comingSoon: "Segera Hadir",
      dailyProgress: "MAIN HARI INI",
      subtitle: "Puzzle baru tiap hari. Santai di Senin, bikin mikir keras di Minggu.",
    },
    unlimited: {
      title: "Mode Bebas",
      subtitle: "Latihan bebas sepuasnya tanpa ganggu streak harianmu.",
      selectDifficulty: "Pilih level favoritmu",
      startGame: "Mulai Main",
      comingSoonNote: "Game seru lainnya lagi dimasak dan segera hadir.",
      difficulties: {
        easy: { label: "Mudah", desc: "6×6 · Pemanasan santai" },
        medium: { label: "Sedang", desc: "7×7 · Pas buat mikir" },
        hard: { label: "Sulit", desc: "8×8 · Bikin fokus" },
        expert: { label: "Ahli", desc: "9×9 · Level Minggu" },
      },
      zipDifficulties: {
        easy: { label: "Mudah", desc: "6×6 · Bebas hambatan" },
        medium: { label: "Sedang", desc: "7×7 · Mulai ada dinding" },
        hard: { label: "Sulit", desc: "8×8 · Dinding mengecoh" },
        expert: { label: "Ahli", desc: "8×8 · Angka super minim" },
      },
    },
    games: {
      queens: {
        name: "Queens",
        tagline: "Satu mahkota tiap baris, kolom & warna",
      },
      zip: {
        name: "Zip",
        tagline: "Tarik satu garis lewati semua kotak",
      },
      tango: {
        name: "Tango",
        tagline: "Seimbangkan matahari & bulan pakai logika",
      },
      miniSudoku: {
        name: "Mini Sudoku",
        tagline: "Sudoku ringkas 6×6 dengan blok 2×3",
      },
      patches: {
        name: "Patches",
        tagline: "Isi papan dengan persegi panjang yang pas",
      },
    },
    queens: {
      dailyLabel: "Queens Harian",
      unlimitedLabel: "Queens Bebas",
      undo: "Batal",
      hint: "Bantuan",
      autoX: "Auto-X",
      reset: "Ulang",
      howToPlay: "Cara Main",
      rule1: "Taruh tepat satu Mahkota di tiap baris, kolom, dan area warna.",
      rule2: "Mahkota nggak boleh nempel satu sama lain—secara diagonal juga nggak boleh.",
      rule3: "Ketuk sekali buat X, ketuk lagi buat Mahkota. Geser jari buat tandai atau hapus banyak X sekaligus.",
      rule4: "Buntu? Bantuan bakal ngunci 1 Mahkota yang benar dengan tambahan +10d.",
      gotIt: "Siap, Gas!",
      back: "Kembali",
      penaltyNotice: "+10d",
      noHintsLeft: "Semua area udah beres!",
      newPuzzle: "Papan Baru",
    },
    zip: {
      dailyLabel: "Zip Harian",
      unlimitedLabel: "Zip Bebas",
      undo: "Batal",
      hint: "Bantuan",
      reset: "Ulang",
      howToPlay: "Cara Main",
      rule1: "Mulai dari angka 1, lalu tarik satu garis menyambung yang lewati semua kotak.",
      rule2: "Gerak ke atas, bawah, kiri, atau kanan—nggak bisa miring dan nggak bisa tembus dinding tebal.",
      rule3: "Lewati angka secara urut (1 → 2 → 3 ...) dan selesai pas di angka terakhir.",
      rule4: "Geser mundur buat batalin, atau ketuk kotak di garismu buat motong jalur. Bantuan punya jeda 15d.",
      gotIt: "Siap, Gas!",
      back: "Kembali",
      cellsFilled: "kotak",
      newPuzzle: "Papan Baru",
    },
    win: {
      title: "Mantap, Beres!",
      subtitleDaily: "Queens Harian tuntas",
      subtitleUnlimited: "Queens Bebas tuntas",
      subtitleDailyZip: "Zip Harian tuntas",
      subtitleUnlimitedZip: "Zip Bebas tuntas",
      time: "Waktu",
      hints: "Bantuan",
      streak: "Streak",
      rank: "Peringkat",
      rankGuest: "Bikin username yuk biar namamu masuk Peringkat Harian.",
      claimUsername: "Bikin Nama",
      shareResult: "Bagikan Hasil",
      copied: "Tersalin!",
      playUnlimited: "Main Mode Bebas",
      nextPuzzle: "Papan Berikutnya",
      backToToday: "Balik ke Beranda",
    },
    leaderboard: {
      title: "Peringkat",
      subtitle: "Pemain Queens tercepat hari ini",
      subtitleAll: "Pemain puzzle tercepat hari ini",
      yourProfile: "Profil Kamu",
      guestTitle: "Main sebagai Tamu",
      guestDesc: "Progres aman tersimpan di perangkat ini. Bikin username biar masuk Peringkat Harian.",
      signInBtn: "Masuk / Daftar",
      signOutBtn: "Keluar",
      solved: "Selesai",
      bestStreak: "Rekor Streak",
      currentStreak: "Streak",
      emptyBoard: "Masih kosong nih! Jadilah yang pertama di Queens hari ini.",
      emptyBoardZip: "Masih kosong nih! Jadilah yang pertama di Zip hari ini.",
      offlineNote: "Menampilkan skor lokal. Hubungkan Supabase buat sinkronisasi global.",
      you: "Kamu",
    },
    auth: {
      titleSignIn: "Selamat Datang Lagi",
      titleSignUp: "Pilih Username-mu",
      subtitle: "Nggak perlu email—cukup username dan password buat masuk peringkat.",
      username: "Username",
      usernamePlaceholder: "cth. rubah_logika",
      password: "Kata Sandi",
      passwordPlaceholder: "Minimal 6 karakter",
      submitSignIn: "Masuk",
      submitSignUp: "Buat Akun",
      switchToSignUp: "Belum punya akun? Pilih username",
      switchToSignIn: "Udah punya username? Masuk",
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
