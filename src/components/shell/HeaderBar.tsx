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
        {/* Crisp geometric Pola mark */}
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-neutral-900 dark:bg-white shadow-xs">
          <div className="grid grid-cols-2 gap-0.5 p-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-white dark:bg-neutral-900" />
            <span className="h-2 w-2 rounded-[2px] bg-white/30 dark:bg-neutral-900/25" />
            <span className="h-2 w-2 rounded-[2px] bg-white/30 dark:bg-neutral-900/25" />
            <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          </div>
        </div>
        <span className="text-[17px] font-semibold tracking-tight text-neutral-950 dark:text-white">
          {t.appName}
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
          className="glass-card flex h-8 min-w-[38px] items-center justify-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide text-neutral-700 transition-transform active:scale-95 dark:text-neutral-200"
        >
          {locale.toUpperCase()}
        </button>

        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={muted ? t.settings.soundOff : t.settings.soundOn}
          className="glass-card flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-transform active:scale-95 dark:text-neutral-200"
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
          className="glass-card flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-transform active:scale-95 dark:text-neutral-200"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
