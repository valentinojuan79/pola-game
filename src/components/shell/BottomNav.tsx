"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Infinity as InfinityIcon, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";

export type AppTab = "today" | "unlimited" | "leaderboard";

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const { t } = useI18n();

  const items: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "today", label: t.nav.today, icon: CalendarDays },
    { id: "unlimited", label: t.nav.unlimited, icon: InfinityIcon },
    { id: "leaderboard", label: t.nav.leaderboard, icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 32, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      aria-label="Primary Navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[430px] justify-center px-5 safe-pb"
    >
      <div className="glass-pill pointer-events-auto flex w-full max-w-[312px] items-center justify-between rounded-full p-1.5">
        {items.map((item) => {
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
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-neutral-950 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="pola-nav-pill"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-black/[0.06] dark:bg-white/[0.12] border border-black/[0.04] dark:border-white/[0.08]"
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" />
              <span className="relative z-10 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
