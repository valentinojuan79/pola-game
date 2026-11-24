"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Flame,
  Infinity as InfinityIcon,
  Moon,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import { usePwaInstall } from "@/lib/usePwaInstall";
import { InstallPwaModal } from "@/components/shell/InstallPwaModal";
import type { AppTab } from "@/components/shell/BottomNav";

interface HeaderBarProps {
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  streak?: number;
}

export function HeaderBar({
  activeTab,
  onSelectTab,
  streak = 0,
}: HeaderBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useI18n();
  const { canInstall, promptInstall } = usePwaInstall();
  const [muted, setMuted] = useState(false);
  const [iosModalOpen, setIosModalOpen] = useState(false);

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "today", label: t.nav.today, icon: CalendarDays },
    { id: "unlimited", label: t.nav.unlimited, icon: InfinityIcon },
    { id: "leaderboard", label: t.nav.leaderboard, icon: Trophy },
  ];

  useEffect(() => {
    setMuted(feedback.isMuted());
  }, []);

  const handleToggleMute = () => {
    const next = feedback.toggleMute();
    setMuted(next);
  };

  const handleInstallClick = async () => {
    feedback.click();
    const outcome = await promptInstall();
    if (outcome === "ios") {
      setIosModalOpen(true);
    }
  };

  return (
    <>
      <header className="relative z-10 mx-auto flex h-auto w-full max-w-5xl items-center justify-between gap-2 px-4 sm:px-5 lg:px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 lg:py-4">
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* Signature 4-tile Pola squircle glass badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/85 border border-white/90 shadow-[0_4px_14px_-3px_rgba(14,165,233,0.22),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:bg-white/[0.09] dark:border-white/[0.15] dark:shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-2 gap-[3px] p-1.5">
              <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_1px_2px_rgba(245,158,11,0.4)]" />
              <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_1px_2px_rgba(14,165,233,0.4)]" />
              <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_1px_2px_rgba(16,185,129,0.35)]" />
              <span className="h-[9px] w-[9px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-[0_1px_2px_rgba(244,63,94,0.35)]" />
            </div>
          </div>
          <span className="font-display text-[20px] sm:text-[21px] font-extrabold tracking-tight text-neutral-950 dark:text-white">
            {t.appName}
            <span className="text-sky-500 dark:text-sky-400">.</span>
          </span>
        </div>

        {/* Desktop-only Top Navigation Bar (lg+) */}
        {activeTab && onSelectTab && (
          <nav
            aria-label="Primary Navigation"
            className="glass-pill hidden items-center gap-1 rounded-full p-1 lg:flex"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isActive) {
                      feedback.click();
                      onSelectTab(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "text-neutral-950 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pola-desktop-nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 480,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded-full border border-black/[0.04] bg-black/[0.06] dark:border-white/[0.08] dark:bg-white/[0.12]"
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10 leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Desktop Streak Pill */}
          <div
            aria-label={`${streak} ${t.today.streak}`}
            className="header-btn hidden h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold text-neutral-800 dark:text-neutral-100 lg:flex"
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                streak > 0
                  ? "fill-amber-500 text-amber-500"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            />
            <span className="font-display tabular-nums">{streak}</span>
          </div>

          {canInstall && (
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label={t.pwa.installAria}
              className="header-btn flex h-8 items-center gap-1 rounded-full px-2 sm:px-2.5 text-[11px] font-bold tracking-wide text-sky-700 transition-colors hover:bg-white/95 active:scale-[0.97] dark:text-sky-300 dark:hover:bg-white/[0.14]"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.pwa.installButton}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              feedback.click();
              toggleLocale();
            }}
            aria-label="Toggle Language"
            className="header-btn flex h-8 min-w-[34px] sm:min-w-[38px] items-center justify-center rounded-full px-2 sm:px-2.5 text-[11px] font-bold tracking-wide text-neutral-700 transition-colors hover:bg-white/95 dark:text-neutral-200 dark:hover:bg-white/[0.14]"
          >
            {locale.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? t.settings.soundOff : t.settings.soundOn}
            className="header-btn flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-white/95 dark:text-neutral-200 dark:hover:bg-white/[0.14]"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              feedback.click();
              toggleTheme();
            }}
            aria-label={theme === "dark" ? t.settings.lightMode : t.settings.darkMode}
            className="header-btn flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-white/95 dark:text-neutral-200 dark:hover:bg-white/[0.14]"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-sky-600" />
            )}
          </button>
        </div>
      </header>

      <InstallPwaModal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
      />
    </>
  );
}
