"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";

export function HeaderBar() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useI18n();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(feedback.isMuted());
  }, []);

  const handleToggleMute = () => {
    const next = feedback.toggleMute();
    setMuted(next);
  };

  return (
    <header className="flex items-center justify-between px-5 pt-3 pb-2 safe-pt">
      <div className="flex items-center gap-2.5">
        {/* Signature 4-tile Pola squircle glass badge */}
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/85 border border-white/90 shadow-[0_4px_14px_-3px_rgba(14,165,233,0.22),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:bg-white/[0.09] dark:border-white/[0.15] dark:shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 gap-[3px] p-1.5">
            <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_1px_2px_rgba(245,158,11,0.4)]" />
            <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_1px_2px_rgba(14,165,233,0.4)]" />
            <span className="h-[9px] w-[9px] rounded-[3px] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_1px_2px_rgba(16,185,129,0.35)]" />
            <span className="h-[9px] w-[9px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-[0_1px_2px_rgba(244,63,94,0.35)]" />
          </div>
        </div>
        <span className="font-display text-[21px] font-extrabold tracking-tight text-neutral-950 dark:text-white">
          {t.appName}
          <span className="text-sky-500 dark:text-sky-400">.</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            feedback.click();
            toggleLocale();
          }}
          aria-label="Toggle Language"
          className="glass-card flex h-8 min-w-[38px] items-center justify-center rounded-full px-2.5 text-[11px] font-bold tracking-wide text-neutral-700 transition-all hover:bg-white/90 active:scale-95 dark:text-neutral-200 dark:hover:bg-white/[0.12]"
        >
          {locale.toUpperCase()}
        </button>

        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={muted ? t.settings.soundOff : t.settings.soundOn}
          className="glass-card flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-all hover:bg-white/90 active:scale-95 dark:text-neutral-200 dark:hover:bg-white/[0.12]"
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
          className="glass-card flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-all hover:bg-white/90 active:scale-95 dark:text-neutral-200 dark:hover:bg-white/[0.12]"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600" />
          )}
        </button>
      </div>
    </header>
  );
}
