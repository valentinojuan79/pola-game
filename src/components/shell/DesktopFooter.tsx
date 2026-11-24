"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { AppTab } from "@/components/shell/BottomNav";

interface DesktopFooterProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

function getCountdownToUtcMidnight(): string {
  const now = new Date();
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0
  );
  const diffSec = Math.max(
    0,
    Math.floor((nextUtcMidnight - now.getTime()) / 1000)
  );
  const hrs = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

export function DesktopFooter({ activeTab, onSelectTab }: DesktopFooterProps) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState<string>("--:--:--");

  useEffect(() => {
    setCountdown(getCountdownToUtcMidnight());
    const interval = setInterval(() => {
      setCountdown(getCountdownToUtcMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: AppTab; label: string }[] = [
    { id: "today", label: t.nav.today },
    { id: "unlimited", label: t.nav.unlimited },
    { id: "leaderboard", label: t.nav.leaderboard },
  ];

  return (
    <footer className="mx-auto mt-8 mb-8 hidden w-full max-w-6xl px-6 lg:block">
      <div className="glass-card rounded-2xl border border-black/[0.06] bg-white/60 px-6 py-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="grid grid-cols-[1.2fr_auto_1.2fr] items-center gap-6">
          {/* Left Column: Brand & Live Daily Reset Countdown */}
          <div className="flex flex-col items-start gap-2.5">
            <div className="flex items-center gap-2.5">
              {/* Signature 4-color rounded-square mini icon */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-white/90 bg-white/85 shadow-[0_3px_10px_-2px_rgba(14,165,233,0.2)] dark:border-white/[0.15] dark:bg-white/[0.09] dark:shadow-[0_3px_10px_-2px_rgba(0,0,0,0.45)]">
                <div className="grid grid-cols-2 gap-[2px] p-1">
                  <span className="h-[7px] w-[7px] rounded-[2px] bg-gradient-to-br from-amber-400 to-orange-500" />
                  <span className="h-[7px] w-[7px] rounded-[2px] bg-gradient-to-br from-sky-400 to-cyan-500" />
                  <span className="h-[7px] w-[7px] rounded-[2px] bg-gradient-to-br from-emerald-400 to-teal-500" />
                  <span className="h-[7px] w-[7px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[17px] font-extrabold tracking-tight text-neutral-950 dark:text-white">
                  {t.appName}
                  <span className="text-sky-500 dark:text-sky-400">.</span>
                </span>
                <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
                  {t.footer.tagline}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-black/[0.03] px-3 py-1 text-[11.5px] font-medium text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300">
              <Clock className="h-3 w-3 text-sky-600 dark:text-sky-400" />
              <span>{t.footer.nextDropPrefix}</span>
              <span className="font-display tabular-nums font-bold text-neutral-900 dark:text-white">
                {countdown}
              </span>
            </div>
          </div>

          {/* Center Column: Quick Navigation & GitHub Repo */}
          <div className="flex items-center gap-4">
            <nav
              aria-label="Footer Navigation"
              className="flex items-center gap-1"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
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
                    className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      isActive
                        ? "bg-black/[0.06] text-neutral-950 dark:bg-white/[0.1] dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <span className="h-4 w-px bg-black/[0.08] dark:bg-white/[0.1]" />

            <a
              href="https://github.com/valentinojuan79/pola-game"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => feedback.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-black/[0.03] px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 transition-colors hover:border-black/[0.15] hover:bg-black/[0.06] hover:text-neutral-950 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-neutral-200 dark:hover:border-white/[0.18] dark:hover:bg-white/[0.1] dark:hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-current"
              >
                <path d="M12 0.297C5.37 0.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>{t.footer.sourceCode}</span>
            </a>
          </div>

          {/* Right Column: Tech Stack & Disclaimer (strictly product-focused) */}
          <div className="text-right">
            <p className="text-[12px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-200">
              Next.js 15 · TypeScript · Supabase
            </p>
            <p className="mt-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
              {t.footer.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
