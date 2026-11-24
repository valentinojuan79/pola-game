"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";

interface InstallPwaModalProps {
  open: boolean;
  onClose: () => void;
}

/** Crisp iOS Safari "Share" icon (square with upward arrow) */
function IosShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

/** Crisp iOS "Add to Home Screen" icon (rounded square with plus) */
function AddToHomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function InstallPwaModal({ open, onClose }: InstallPwaModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleDismiss = () => {
    feedback.click();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-pwa-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/35 backdrop-blur-xs dark:bg-black/60"
          />

          <motion.div
            initial={{ y: 56, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass-modal relative z-10 m-4 mb-[calc(env(safe-area-inset-bottom)+1rem)] w-full max-w-[390px] rounded-[28px] p-6 sm:mb-4"
          >
            {/* Mobile bottom-sheet grab handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300/80 dark:bg-white/20 sm:hidden" />

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-neutral-600 transition-colors hover:bg-black/[0.1] dark:bg-white/[0.08] dark:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with Pola squircle badge */}
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/90 border border-white shadow-[0_4px_14px_-3px_rgba(14,165,233,0.22),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:bg-white/[0.09] dark:border-white/[0.15] dark:shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-2 gap-[3px] p-1.5">
                  <span className="h-[10px] w-[10px] rounded-[3px] bg-gradient-to-br from-amber-400 to-orange-500" />
                  <span className="h-[10px] w-[10px] rounded-[3px] bg-gradient-to-br from-sky-400 to-cyan-500" />
                  <span className="h-[10px] w-[10px] rounded-[3px] bg-gradient-to-br from-emerald-400 to-teal-500" />
                  <span className="h-[10px] w-[10px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
                </div>
              </div>
              <div>
                <h2
                  id="install-pwa-title"
                  className="font-display text-[20px] font-bold tracking-tight text-neutral-950 dark:text-white"
                >
                  {t.pwa.iosTitle}
                </h2>
                <p className="mt-0.5 text-[12.5px] leading-snug text-neutral-500 dark:text-neutral-400">
                  {t.pwa.iosSubtitle}
                </p>
              </div>
            </div>

            {/* 2-Step Visual Guide */}
            <ol className="mt-5 space-y-3">
              <li className="flex items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-white/65 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.05]">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
                  <IosShareIcon className="h-5 w-5" />
                  <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white shadow-xs dark:bg-sky-400 dark:text-neutral-950">
                    1
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug text-neutral-700 dark:text-neutral-200">
                  {t.pwa.step1Prefix}{" "}
                  <strong className="font-semibold text-neutral-950 dark:text-white">
                    {t.pwa.step1Highlight}
                  </strong>{" "}
                  {t.pwa.step1Suffix}
                </p>
              </li>

              <li className="flex items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-white/65 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.05]">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
                  <AddToHomeIcon className="h-5 w-5" />
                  <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs dark:bg-emerald-400 dark:text-neutral-950">
                    2
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug text-neutral-700 dark:text-neutral-200">
                  {t.pwa.step2Prefix}{" "}
                  <strong className="font-semibold text-neutral-950 dark:text-white">
                    {t.pwa.step2Highlight}
                  </strong>
                  {t.pwa.step2Suffix}
                </p>
              </li>
            </ol>

            {/* Got it dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#0369A1] py-3 text-[14px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(3,105,161,0.28)] transition-colors hover:bg-[#075985] active:scale-[0.98] dark:bg-sky-400/90 dark:text-neutral-950 dark:hover:bg-sky-300"
            >
              {t.pwa.gotIt}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
